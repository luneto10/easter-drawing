import { PrismaClient, Prisma } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
    adapter,
});

/** Break draw links before delete (self-referencing FK on recipient_id). */
async function resetUsers() {
    await prisma.user.updateMany({
        data: { recipientId: null } satisfies Prisma.UserUncheckedUpdateManyInput,
    });
    await prisma.user.deleteMany();
}

/** Seeds users with no assignments (`recipient_id` stays null). */
export async function main() {
    await resetUsers();

    const names = ["Alice", "Bob", "Carol", "Dave"];
    await Promise.all(names.map((name) => prisma.user.create({ data: { name } })));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
