const { PrismaClient } = require("@prisma/client");

const isProduction = process.env.NODE_ENV === "production";

// One shared Prisma client prevents extra connections during development reloads.
const prisma = new PrismaClient({
	log: isProduction ? ["error"] : ["warn", "error"],
});

module.exports = prisma;
