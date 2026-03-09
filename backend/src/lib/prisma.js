import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;

// Création du pool de connexions PostgreSQL
const pool = new pg.Pool({ connectionString });

// Adaptateur Prisma pour utiliser le pool pg natif
const adapter = new PrismaPg(pool);

// Instance Prisma partagée dans toute l'application
const prisma = new PrismaClient({ adapter });

export default prisma;
