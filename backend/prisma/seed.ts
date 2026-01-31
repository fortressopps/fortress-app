/**
 * Seed — usuário de desenvolvimento (ops@fortress.local / devpass)
 */
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/libs/password";

const prisma = new PrismaClient();

async function main() {
  const email = "ops@fortress.local";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (!existing.password) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { password: hashPassword("devpass") },
      });
      console.log("Senha definida para", email);
    }
    return;
  }
  await prisma.user.create({
    data: {
      email,
      name: "Dev User",
      password: hashPassword("devpass"),
    },
  });
  console.log("Usuário criado:", email);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
