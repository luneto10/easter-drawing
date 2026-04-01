import { DomainError } from "@/server/shared/errors/domain-error";

const MAX_NAME_LENGTH = 120;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** User aggregate root — persistence-agnostic; map Prisma rows in infrastructure. */
export class User {
    private constructor(
        readonly id: string,
        readonly name: string,
        readonly email: string | null,
        readonly createdAt: Date,
    ) {}

    /** Load from DB (via repository / mapper). */
    static reconstitute(props: {
        id: string;
        name: string;
        email: string | null;
        createdAt: Date;
    }) {
        return new User(
            props.id,
            User.normalizeName(props.name),
            User.normalizeEmail(props.email),
            props.createdAt,
        );
    }

    /** New participant before first save. */
    static register(name: string, email?: string | null) {
        const normalized = User.normalizeName(name);
        if (normalized.length === 0) {
            throw new DomainError("Name is required");
        }
        if (normalized.length > MAX_NAME_LENGTH) {
            throw new DomainError(
                `Name must be at most ${MAX_NAME_LENGTH} characters`,
            );
        }

        return new User(
            crypto.randomUUID(),
            normalized,
            User.normalizeEmail(email),
            new Date(),
        );
    }

    private static normalizeName(name: string): string {
        return name.trim();
    }

    private static normalizeEmail(email?: string | null): string | null {
        if (!email) return null;
        const normalized = email.trim().toLowerCase();
        if (!normalized) return null;
        if (!EMAIL_REGEX.test(normalized)) {
            throw new DomainError("Email is invalid");
        }
        return normalized;
    }
}
