import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
    adapter,
});

/**
 * Stable participant codes (public login id) — see `TESTING.md`.
 * Internal PKs (`User.id`) are intentionally different for security.
 */
const PARTICIPANT_IDS = {
    alice: "11111111-1111-4111-8111-111111111101",
    bob: "22222222-2222-4222-8222-222222222202",
    carol: "33333333-3333-4333-8333-333333333303",
} as const;

const INTERNAL_IDS = {
    alice: "11111111-1111-4111-8111-111111111151",
    bob: "22222222-2222-4222-8222-222222222252",
    carol: "33333333-3333-4333-8333-333333333353",
} as const;

const ROOM_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

const ADMIN_KEY = "seed-testing-admin-key-001";

/** Seeds a demo room, three users, and sample wish lists (no draw assignments). */
export async function main() {
    await prisma.room.deleteMany();
    await prisma.user.deleteMany();

    const alice = await prisma.user.create({
        data: {
            id: INTERNAL_IDS.alice,
            participantId: PARTICIPANT_IDS.alice,
            name: "Alice Organizer",
            email: "alice.seed@example.local",
        },
    });
    const bob = await prisma.user.create({
        data: {
            id: INTERNAL_IDS.bob,
            participantId: PARTICIPANT_IDS.bob,
            name: "Bob Participant",
            email: "bob.seed@example.local",
        },
    });
    const carol = await prisma.user.create({
        data: {
            id: INTERNAL_IDS.carol,
            participantId: PARTICIPANT_IDS.carol,
            name: "Carol Participant",
            email: "carol.seed@example.local",
        },
    });

    await prisma.room.create({
        data: {
            id: ROOM_ID,
            title: "Seed gift exchange",
            organizationName: "Demo Organization",
            eventName: "Spring swap",
            adminKey: ADMIN_KEY,
            creatorId: alice.id,
            memberships: {
                create: [
                    { userId: alice.id },
                    { userId: bob.id },
                    { userId: carol.id },
                ],
            },
        },
    });

    await prisma.desiredItem.createMany({
        data: [
            {
                userId: alice.id,
                roomId: ROOM_ID,
                itemText: "Fair-trade dark chocolate",
                sortOrder: 0,
            },
            {
                userId: alice.id,
                roomId: ROOM_ID,
                itemText: "Herb seedlings for the patio",
                sortOrder: 1,
            },
            {
                userId: bob.id,
                roomId: ROOM_ID,
                itemText: "Running socks, size M",
                sortOrder: 0,
            },
            {
                userId: bob.id,
                roomId: ROOM_ID,
                itemText: "Local coffee beans",
                sortOrder: 1,
            },
            {
                userId: carol.id,
                roomId: ROOM_ID,
                itemText: "Board game for 4+ players",
                sortOrder: 0,
            },
        ],
    });

    console.log("Seed complete.");
    console.log("Room ID:", ROOM_ID);
    console.log(
        "Admin URL:",
        `(use TESTING.md) /admin?room=${ROOM_ID}&key=${ADMIN_KEY}`,
    );
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
