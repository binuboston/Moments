import type { InvitationView, RenderMode } from "@/features/templates/types";
import { Contacts, Gifts, RsvpForm } from "@/features/templates/sections";
import type { CinematicModel } from "@/features/templates/cinematic/model";
import { CineSection, SectionHeading } from "@/features/templates/cinematic/sections/common";

export function CineRsvp({ view, mode, contrast }: { view: InvitationView; mode: RenderMode; contrast: boolean }) {
  return (
    <CineSection contrast={contrast} id="rsvp" aria-labelledby="cine-rsvp">
      <SectionHeading id="cine-rsvp" eyebrow="Kindly respond" title="Will you join us?" />
      <div data-reveal="up">
        <RsvpForm slug={view.slug} settings={view.settings.rsvp} timezone={view.content.timezone} mode={mode} />
      </div>
    </CineSection>
  );
}

export function CineGifts({ view, contrast }: { view: InvitationView; contrast: boolean }) {
  return (
    <CineSection contrast={contrast} aria-labelledby="cine-gifts">
      <SectionHeading id="cine-gifts" eyebrow="Gifts" title="Your blessings are enough" />
      <div className="text-center" data-reveal="up">
        <Gifts gifts={view.content.gifts} />
      </div>
    </CineSection>
  );
}

export function CineContacts({ view, contrast }: { view: InvitationView; contrast: boolean }) {
  return (
    <CineSection contrast={contrast} aria-labelledby="cine-contacts">
      <SectionHeading id="cine-contacts" eyebrow="Questions" title="Reach the families" />
      <div data-reveal="up">
        <Contacts contacts={view.content.contacts} />
      </div>
    </CineSection>
  );
}

export function GalleryHeading({ model }: { model: CinematicModel }) {
  return <SectionHeading id="cine-gallery" eyebrow="Moments" title={model.title.includes("&") ? "Our story in frames" : "Moments"} />;
}
