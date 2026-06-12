import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL no está configurada");
  process.exit(1);
}

// Parsear la URL para el adapter
const url = new URL(connectionString);
const adapter = new PrismaPg({
  host: url.hostname,
  port: parseInt(url.port) || 5432,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1), // quitar el /
  ssl: url.hostname !== "localhost" ? { rejectUnauthorized: false } : undefined,
});

const prisma = new PrismaClient({ adapter });

export default prisma;
