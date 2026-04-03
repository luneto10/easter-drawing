import type { DesiredItemDto } from "@/types/desired-item";
import type { RevealResponse } from "@/types/home";
import type { CreateUserResponse } from "@/types/join";

export type RecoverIdResult =
    | { ok: true; message?: string }
    | { ok: false; error: string };

export type LoginVerifyResult =
    | { ok: true; name: string }
    | { ok: false; notFound: boolean; error?: string };

export type WishlistReportResult =
    | { ok: true; blob: Blob; filename: string }
    | { ok: false; error: string };

export type RecipientAssignmentResult =
    | { ok: true; data: RevealResponse }
    | { ok: false; error: string };

export type CreateRoomBody = {
    title: string;
    organizationName: string;
    eventName: string;
    creatorUserId: string;
};

export type CreateRoomResult =
    | { ok: true; room: { id: string; title: string } }
    | { ok: false; error: string };

export type JoinRoomResult =
    | { ok: true; room?: { title?: string } }
    | { ok: false; error: string };

export type CreateUserBody = { name: string; email?: string };

export type CreateUserResult =
    | { ok: true; user: CreateUserResponse }
    | { ok: false; error: string };

export type RecipientDesiredItemsResult =
    | {
          ok: true;
          recipientName?: string;
          items: DesiredItemDto[];
      }
    | { ok: false; error: string };

export type MyDesiredItemsListResult =
    | { ok: true; items: DesiredItemDto[] }
    | { ok: false; error: string };

export type MyDesiredItemsReplaceResult =
    | { ok: true }
    | { ok: false; error: string };
