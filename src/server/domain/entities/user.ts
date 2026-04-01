import { DomainError } from "@/server/shared/errors/domain-error";

const MAX_NAME_LENGTH = 120;

/** User aggregate root — persistence-agnostic; map Prisma rows in infrastructure. */
export class User {
    private constructor(
        readonly id: string,
        readonly name: string,
        readonly recipientId: string | null,
        readonly createdAt: Date,
    ) {}

    /** Load from DB (via repository / mapper). */
    static reconstitute(props: {
        id: string;
        name: string;
        recipientId: string | null;
        createdAt: Date;
    }) {
        return new User(
            props.id,
            User.normalizeName(props.name),
            props.recipientId,
            props.createdAt,
        );
    }

    /** New participant before first save. */
    static register(name: string) {
        const normalized = User.normalizeName(name);
        if (normalized.length === 0) {
            throw new DomainError("Name is required");
        }
        if (normalized.length > MAX_NAME_LENGTH) {
            throw new DomainError(
                `Name must be at most ${MAX_NAME_LENGTH} characters`,
            );
        }
        return new User(crypto.randomUUID(), normalized, null, new Date());
    }

    get hasPickedRecipient(): boolean {
        return this.recipientId !== null;
    }

    private static normalizeName(name: string): string {
        return name.trim();
    }
}
