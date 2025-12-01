import type { Prisma } from "@prisma/client";

export default {
  schema: "./schema.prisma",
  outdir: "../src/generated/client",
  generator: {
    client: {
      provider: "prisma-client-js",
      previewFeatures: ["postgresqlExtensions"],
    },
  },
} satisfies Prisma.PrismaConfig;
