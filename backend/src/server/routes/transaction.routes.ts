import { Hono } from "hono";
import { z } from "zod";
import { authMiddleware, type AuthVariables } from "../../middleware/auth";
import { transactionService } from "../../services/transaction.service";

const app = new Hono<{ Variables: AuthVariables }>();

// All routes require authentication
app.use("*", authMiddleware);

const createTransactionSchema = z.object({
  amount: z.number(),
  category: z.enum(["FOOD", "TRANSPORT", "HEALTH", "ENTERTAINMENT", "SHOPPING", "SALARY", "OTHER"]),
  description: z.string().min(1),
  date: z.string().datetime(),
});

const updateTransactionSchema = createTransactionSchema.partial();

const paginationSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  category: z.string().optional(),
});

const summarySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Must be YYYY-MM").optional(),
});

// GET /transactions/summary — Returns totalIncome, totalExpenses, balance
app.get("/summary", async (c) => {
  const user = c.get("user");
  const monthStr = c.req.query("month");
  
  const parsed = summarySchema.safeParse({ month: monthStr });
  if (!parsed.success) {
    return c.json({ error: "Invalid month format. Use YYYY-MM" }, 400);
  }

  try {
    const summary = await transactionService.getSummary(user.id, parsed.data.month);
    return c.json(summary);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// GET /transactions/report — Returns data for PDF generation
app.get("/report", async (c) => {
  const user = c.get("user");
  const monthStr = c.req.query("month");
  
  const parsed = summarySchema.safeParse({ month: monthStr });
  if (!parsed.success) {
    return c.json({ error: "Invalid month format. Use YYYY-MM" }, 400);
  }

  try {
    const reportData = await transactionService.getReportData(user.id, parsed.data.month || new Date().toISOString().slice(0, 7));
    return c.json(reportData);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// GET /transactions — Paginated list with filters
app.get("/", async (c) => {
  const user = c.get("user");
  const queries = c.req.query();

  const parsed = paginationSchema.safeParse(queries);
  if (!parsed.success) {
    return c.json({ error: "Invalid query parameters" }, 400);
  }

  try {
    const filters = {
      ...parsed.data,
      page: parsed.data.page ? parseInt(parsed.data.page, 10) : 1,
      limit: parsed.data.limit ? parseInt(parsed.data.limit, 10) : 10,
    };
    const result = await transactionService.getAll(user.id, filters);
    return c.json(result);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// POST /transactions/import — Import CSV
app.post("/import", async (c) => {
  const user = c.get("user");
  try {
    const body = await c.req.parseBody();
    const file = body["file"];

    if (!file || typeof file === "string") {
      return c.json({ error: "File required" }, 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await transactionService.importFromCsv(user.id, buffer);
    return c.json(result);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// POST /transactions — Create manual transaction
app.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json().catch(() => ({}));
  
  const parsed = createTransactionSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid payload data" }, 400);
  }

  try {
    const created = await transactionService.create(user.id, {
      ...parsed.data,
      date: new Date(parsed.data.date),
    });
    return c.json(created, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// PUT /transactions/:id — Update transaction
app.put("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => ({}));

  const parsed = updateTransactionSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid payload data" }, 400);
  }

  try {
    const updateData: any = { ...parsed.data };
    if (parsed.data.date) {
      updateData.date = new Date(parsed.data.date);
    }
    const updated = await transactionService.update(user.id, id, updateData);
    return c.json(updated);
  } catch (err: any) {
    const status = err.message.includes("not found") ? 404 : 500;
    return c.json({ error: err.message }, status);
  }
});

// DELETE /transactions/:id — Delete transaction
app.delete("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  try {
    await transactionService.delete(user.id, id);
    return c.json({ ok: true });
  } catch (err: any) {
    const status = err.message.includes("not found") ? 404 : 500;
    return c.json({ error: err.message }, status);
  }
});

export const transactionRoutes = app;
