// src/config/prisma.js
import { PrismaClient } from "@prisma/client";

// Inisialisasi PrismaClient
const prisma = new PrismaClient();

// Export supaya bisa digunakan di file lain
export default prisma;
