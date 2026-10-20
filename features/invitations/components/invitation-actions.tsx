"use client";

import { CopyIcon, EyeIcon, EyeOffIcon, LinkIcon, MoreHorizontalIcon, Share2Icon, Trash2Icon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { animateOut } from "@/components/motion/use-flip-list";
import { ShareDialog } from "@/features/invitations/components/share-dialog";
import { useInvitationMutations } from "@/features/invitations/hooks";
import type { InvitationListItem } from "@/features/invitations/types";
import { routes } from "@/lib/routes";

export function InvitationActions({ item, triggerClassName }: { item: InvitationListItem; triggerClassName?: string }) {
  const router = useRouter();
  const { publish, unpublish, duplicate, remove } = useInvitationMutations();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(item.publicUrl);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy. Long-press the link to copy it manually.");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="soft" size="icon-sm" className={triggerClassName} aria-label={`More actions for ${item.title || "invitation"}`}>
            <MoreHorizontalIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {item.status === "published" ? (
            <>
              <DropdownMenuItem onSelect={() => setShareOpen(true)}>
                <Share2Icon /> Share
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={copyLink}>
                <LinkIcon /> Copy link
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => unpublish.mutate(item.id)}>
                <EyeOffIcon /> Unpublish
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem onSelect={() => publish.mutate(item.id, { onSuccess: () => toast.success("Published! Your invitation is live.") })}>
              <EyeIcon /> Publish
            </DropdownMenuItem>
          )}
          {item.rsvpEnabled ? (
            <DropdownMenuItem asChild>
              <Link href={routes.invitationResponses(item.id)}>
                <UsersIcon /> View RSVPs
              </Link>
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem onSelect={() => duplicate.mutate(item.id, { onSuccess: (data) => router.push(routes.editInvitation(data.id)) })}>
            <CopyIcon /> Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setConfirmDelete(true)}>
            <Trash2Icon /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              “{item.title || "Untitled invitation"}” and all of its photos and RSVP responses will be permanently deleted. {item.status === "published" ? "The public link will stop working immediately." : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await animateOut(document.querySelector(`[data-flip-id="${item.id}"]`));
                remove.mutate(item.id);
              }}
            >
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} url={item.publicUrl} headline={item.title || "You're invited"} dateLabel={undefined} />
    </>
  );
}
