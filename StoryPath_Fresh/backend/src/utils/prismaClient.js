/**
 * Prisma Database Client
 * 
 * Centralized singleton instance of PrismaClient for all database operations.
 * Using a single shared instance improves performance and prevents connection pool exhaustion.
 * All database queries throughout the application use this client.
 * 
 * Dependencies:
 * - @prisma/client: Object-Relational Mapping (ORM) library for type-safe database access
 * 
 * Usage Examples:
 * - Create: await prisma.user.create({ data: { name, email } })
 * - Read: await prisma.user.findUnique({ where: { id } })
 * - Update: await prisma.user.update({ where: { id }, data: { name } })
 * - Delete: await prisma.user.delete({ where: { id } })
 */

const { PrismaClient } = require("@prisma/client");

// Initialize and export Prisma client singleton
const prisma = new PrismaClient();

module.exports = prisma;
