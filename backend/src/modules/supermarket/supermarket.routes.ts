/**
 * Rotas HTTP Supermarket — protegidas por auth
 */
import { Hono } from "hono";
import { z } from "zod";
import { authMiddleware, type AuthVariables } from "../../middleware/auth";
import * as repo from "./infra/supermarket.repository";
import { SupermarketCategory } from "@prisma/client";

const app = new Hono<{ Variables: AuthVariables }>();

app.use("*", authMiddleware);

const createListSchema = z.object({ name: z.string().min(1), budget: z.number().optional() });
const updateListSchema = z.object({ name: z.string().min(1).optional(), budget: z.number().optional() });
const createItemSchema = z.object({
  name: z.string().min(1),
  category: z.nativeEnum(SupermarketCategory),
  estimatedPrice: z.number(),
  quantity: z.number().optional(),
});
const updateItemSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.nativeEnum(SupermarketCategory).optional(),
  estimatedPrice: z.number().optional(),
  actualPrice: z.number().optional(),
  purchased: z.boolean().optional(),
  quantity: z.number().optional(),
});

// GET /supermarket/lists — listar listas do usuário (paginado)
app.get("/lists", async (c) => {
  const user = c.get("user");
  const page = Number(c.req.query("page")) || 1;
  const pageSize = Math.min(Number(c.req.query("pageSize")) || 20, 100);
  const result = await repo.getUserSupermarketLists(user.id, page, pageSize);
  return c.json(result);
});

// POST /supermarket/lists — criar lista
app.post("/lists", async (c) => {
  const user = c.get("user");
  const body = await c.req.json().catch(() => ({}));
  const parsed = createListSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "name obrigatório" }, 400);
  }
  const list = await repo.createSupermarketList(user.id, parsed.data.name);
  return c.json(list, 201);
});

// GET /supermarket/lists/:id — obter lista (se for do usuário)
app.get("/lists/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const list = await repo.getSupermarketListById(id);
  if (!list || list.userId !== user.id) {
    return c.json({ error: "Lista não encontrada" }, 404);
  }
  return c.json(list);
});

// PATCH /supermarket/lists/:id
app.patch("/lists/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const list = await repo.getSupermarketListById(id);
  if (!list || list.userId !== user.id) {
    return c.json({ error: "Lista não encontrada" }, 404);
  }
  const body = await c.req.json().catch(() => ({}));
  const parsed = updateListSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Payload inválido" }, 400);
  }
  const updated = await repo.updateSupermarketList(id, parsed.data);
  return c.json(updated);
});

// DELETE /supermarket/lists/:id
app.delete("/lists/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const list = await repo.getSupermarketListById(id);
  if (!list || list.userId !== user.id) {
    return c.json({ error: "Lista não encontrada" }, 404);
  }
  await repo.deleteSupermarketList(id);
  return c.json({ ok: true });
});

// POST /supermarket/lists/:id/items — adicionar item
app.post("/lists/:id/items", async (c) => {
  const user = c.get("user");
  const listId = c.req.param("id");
  const list = await repo.getSupermarketListById(listId);
  if (!list || list.userId !== user.id) {
    return c.json({ error: "Lista não encontrada" }, 404);
  }
  const body = await c.req.json().catch(() => ({}));
  const parsed = createItemSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "name, category e estimatedPrice obrigatórios" }, 400);
  }
  const item = await repo.addSupermarketItem(listId, {
    name: parsed.data.name,
    category: parsed.data.category,
    estimatedPrice: parsed.data.estimatedPrice,
    actualPrice: null,
    quantity: parsed.data.quantity ?? 1,
    purchased: false,
  });
  return c.json(item, 201);
});

// PATCH /supermarket/lists/:listId/items/:itemId
app.patch("/lists/:listId/items/:itemId", async (c) => {
  const user = c.get("user");
  const listId = c.req.param("listId");
  const itemId = c.req.param("itemId");
  const list = await repo.getSupermarketListById(listId);
  if (!list || list.userId !== user.id) {
    return c.json({ error: "Lista não encontrada" }, 404);
  }
  const body = await c.req.json().catch(() => ({}));
  const parsed = updateItemSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Payload inválido" }, 400);
  }
  const item = await repo.updateSupermarketItem(itemId, parsed.data);
  return c.json(item);
});

// DELETE /supermarket/lists/:listId/items/:itemId
app.delete("/lists/:listId/items/:itemId", async (c) => {
  const user = c.get("user");
  const listId = c.req.param("listId");
  const itemId = c.req.param("itemId");
  const list = await repo.getSupermarketListById(listId);
  if (!list || list.userId !== user.id) {
    return c.json({ error: "Lista não encontrada" }, 404);
  }
  await repo.deleteSupermarketItem(itemId);
  return c.json({ ok: true });
});

export const supermarketRoutes = app;
