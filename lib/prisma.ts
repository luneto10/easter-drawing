import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClient;
};

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

/** In dev, avoid caching on `global` so `prisma generate` is picked up without a stale client. */
const prisma =
    process.env.NODE_ENV === "production"
        ? (globalForPrisma.prisma ??= new PrismaClient({ adapter }))
        : new PrismaClient({ adapter });

export default prisma;
