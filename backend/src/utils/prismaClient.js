const { PrismaClient } = require("@prisma/client");

const isProduction = process.env.NODE_ENV === "production";

const prisma = new PrismaClient({
	log: isProduction ? ["error"] : ["warn", "error"],
});

module.exports = prisma;
