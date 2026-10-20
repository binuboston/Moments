"use client";

import { mediaApi } from "@/features/invitations/api";
import { createClient } from "@/lib/supabase/client";

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export class UploadError extends Error {}

export function validateImageFile(file: File): string | null {
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) return "Please choose a JPEG, PNG, WebP or AVIF image.";
  if (file.size > MAX_IMAGE_BYTES) return "Images must be 8 MB or smaller.";
  if (file.size === 0) return "That file appears to be empty.";
  return null;
}

async function readDimensions(file: File): Promise<{ width: number | null; height: number | null }> {
  try {
    if ("createImageBitmap" in window) {
      const bitmap = await createImageBitmap(file);
      const dims = { width: bitmap.width, height: bitmap.height };
      bitmap.close();
      return dims;
    }
  } catch {
    /* fall through */
  }
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve({ width: null, height: null });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

/**
 * Three-step upload: reserve a row and path on the server, upload directly to
 * Storage with the user's session (RLS-enforced), then confirm so the image
 * becomes visible. Cleans up the reservation if the upload fails.
 */
export async function uploadInvitationImage(opts: { file: File; invitationId: string; kind: "cover" | "gallery"; alt?: string }): Promise<string> {
  const problem = validateImageFile(opts.file);
  if (problem) throw new UploadError(problem);

  const { width, height } = await readDimensions(opts.file);
  const reservation = await mediaApi.create({
    invitationId: opts.invitationId,
    kind: opts.kind,
    mimeType: opts.file.type,
    sizeBytes: opts.file.size,
    width,
    height,
    alt: opts.alt,
  });

  const supabase = createClient();
  const { error } = await supabase.storage.from(reservation.bucket).upload(reservation.path, opts.file, {
    contentType: opts.file.type,
    upsert: false,
    cacheControl: "31536000",
  });
  if (error) {
    await mediaApi.remove(reservation.id).catch(() => undefined);
    throw new UploadError("Upload failed. Please check your connection and try again.");
  }

  await mediaApi.confirm(reservation.id);
  return reservation.id;
}
