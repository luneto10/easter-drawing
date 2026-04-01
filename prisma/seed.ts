import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
    adapter,
});

/** Seeds a demo room with users (no draw assignments). */
export async function main() {
    await prisma.userOnRoom.deleteMany();
    await prisma.room.deleteMany();
    await prisma.user.deleteMany();

    const alice = await prisma.user.create({
        data: { name: "Alice", email: "alice@example.com" },
    });
    const bob = await prisma.user.create({
        data: { name: "Bob", email: "bob@example.com" },
    });

    const room = await prisma.room.create({
        data: {
            title: "Demo room",
            adminKey: "demo-admin-key-replace-in-production",
            creatorId: alice.id,
            memberships: {
                create: [{ userId: alice.id }, { userId: bob.id }],
            },
        },
    });

    console.log("Seeded room:", room.id);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
