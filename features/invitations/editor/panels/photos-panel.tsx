"use client";

import { ImagePlusIcon, Loader2Icon, StarIcon, Trash2Icon, UploadCloudIcon } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { invitationsApi, mediaApi } from "@/features/invitations/api";
import { errorMessage } from "@/features/invitations/hooks";
import { ACCEPTED_IMAGE_TYPES, uploadInvitationImage } from "@/features/media/upload";
import { maxGalleryImages } from "@/lib/entitlements";
import { cn } from "@/lib/utils/cn";
import { useEditorStore } from "@/stores/editor-store";

export function PhotosPanel() {
  const draft = useEditorStore((s) => s.draft)!;
  const syncMedia = useEditorStore((s) => s.syncMedia);
  const [pending, setPending] = useState<{ name: string; kind: "cover" | "gallery" }[]>([]);
  const [dragging, setDragging] = useState(false);
  const coverInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);

  const cover = draft.media.find((m) => m.kind === "cover" && m.isUploaded) ?? null;
  const gallery = draft.media.filter((m) => m.kind === "gallery" && m.isUploaded);
  const limit = maxGalleryImages(draft.plan);

  const refresh = async () => {
    const fresh = await invitationsApi.get(draft.id);
    syncMedia(fresh.media);
  };

  const upload = async (files: FileList | File[], kind: "cover" | "gallery") => {
    const list = Array.from(files);
    if (list.length === 0) return;
    if (kind === "gallery" && gallery.length + list.length > limit) {
      toast.error(`You can add up to ${limit} gallery photos on your plan.`);
      return;
    }
    const batch = kind === "cover" ? list.slice(0, 1) : list;
    setPending((p) => [...p, ...batch.map((f) => ({ name: f.name, kind }))]);
    for (const file of batch) {
      try {
        await uploadInvitationImage({ file, invitationId: draft.id, kind });
      } catch (err) {
        toast.error(`${file.name}: ${errorMessage(err, "upload failed")}`);
      } finally {
        setPending((p) => p.filter((x) => x.name !== file.name));
      }
    }
    await refresh();
  };

  const remove = async (id: string) => {
    try {
      await mediaApi.remove(id);
      await refresh();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const makeCover = async (id: string) => {
    try {
      await mediaApi.update(id, { kind: "cover" });
      await refresh();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const accept = ACCEPTED_IMAGE_TYPES.join(",");

  return (
    <div className="grid gap-8">
      <section className="grid gap-3">
        <div>
          <h2 className="text-base font-semibold">Cover photo</h2>
          <p className="mt-1 text-sm text-muted-foreground">Shown at the top of the invitation. Portrait photos work best. JPEG, PNG, WebP or AVIF up to 8 MB.</p>
        </div>
        <input ref={coverInput} type="file" accept={accept} className="sr-only" onChange={(e) => e.target.files && upload(e.target.files, "cover")} data-testid="cover-input" />
        {cover ? (
          <div className="relative aspect-[4/5] w-full max-w-xs overflow-hidden rounded-2xl border border-border bg-muted">
            <Image src={cover.url} alt={cover.alt || "Cover photo"} fill sizes="320px" className="object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/60 to-transparent p-3">
              <Button size="sm" variant="outline" onClick={() => coverInput.current?.click()}>
                Replace
              </Button>
              <Button size="sm" variant="destructive" onClick={() => remove(cover.id)} aria-label="Remove cover photo">
                <Trash2Icon />
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => coverInput.current?.click()}
            className="flex aspect-[4/5] w-full max-w-xs flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-subtle/60 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            {pending.some((p) => p.kind === "cover") ? <Loader2Icon className="size-6 animate-spin" /> : <ImagePlusIcon className="size-6" />}
            <span className="text-sm font-medium">{pending.some((p) => p.kind === "cover") ? "Uploading…" : "Add a cover photo"}</span>
          </button>
        )}
      </section>

      <section className="grid gap-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Gallery</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Optional. {gallery.length} of {limit} photos.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => galleryInput.current?.click()} disabled={gallery.length >= limit}>
            <UploadCloudIcon aria-hidden /> Add photos
          </Button>
        </div>
        <input ref={galleryInput} type="file" accept={accept} multiple className="sr-only" onChange={(e) => e.target.files && upload(e.target.files, "gallery")} data-testid="gallery-input" />

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            upload(e.dataTransfer.files, "gallery");
          }}
          className={cn("rounded-2xl border-2 border-dashed p-3 transition-colors", dragging ? "border-primary bg-primary/5" : "border-border")}
        >
          {gallery.length === 0 && pending.filter((p) => p.kind === "gallery").length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Drag photos here or use “Add photos”.</p>
          ) : (
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {gallery.map((m) => (
                <li key={m.id} className="group relative aspect-square overflow-hidden rounded-xl bg-muted">
                  <Image src={m.url} alt={m.alt || "Gallery photo"} fill sizes="160px" className="object-cover" />
                  <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    <Button size="icon-sm" variant="outline" className="size-7" onClick={() => makeCover(m.id)} aria-label="Use as cover">
                      <StarIcon className="size-3.5" />
                    </Button>
                    <Button size="icon-sm" variant="destructive" className="size-7" onClick={() => remove(m.id)} aria-label="Remove photo">
                      <Trash2Icon className="size-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
              {pending
                .filter((p) => p.kind === "gallery")
                .map((p) => (
                  <li key={p.name} className="flex aspect-square items-center justify-center rounded-xl bg-muted text-muted-foreground" aria-busy>
                    <Loader2Icon className="size-5 animate-spin" />
                    <span className="sr-only">Uploading {p.name}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
