import { defineConfig } from "@prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",

  datasource: {
    url: process.env.DATABASE_URL, // Agora a URL vem daqui!
  },

  // habilita migrations via prisma migrate
  migrate: {
    enabled: true,
  },
});
