import "server-only";
import { actionsProvider } from "@/features/search/providers/actions";
import { guestsProvider } from "@/features/search/providers/guests";
import { helpProvider } from "@/features/search/providers/help";
import { invitationsProvider } from "@/features/search/providers/invitations";
import { occasionsProvider } from "@/features/search/providers/occasions";
import { pagesProvider } from "@/features/search/providers/pages";
import { templatesProvider } from "@/features/search/providers/templates";
import type { SearchProvider } from "@/features/search/provider";

/** Every provider, in the order their groups appear in results. */
export const SEARCH_PROVIDERS: readonly SearchProvider[] = [invitationsProvider, guestsProvider, templatesProvider, occasionsProvider, actionsProvider, helpProvider, pagesProvider];
