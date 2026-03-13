import { Hono } from "hono";
import { authMiddleware, type AuthVariables } from "../../middleware/auth";
import { alertService } from "../../services/alert.service";

const app = new Hono<{ Variables: AuthVariables }>();

app.use("*", authMiddleware);

app.get("/", async (c) => {
  const user = c.get("user");
  try {
    const alerts = await alertService.getAlerts(user.id);
    return c.json(alerts);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

export const alertRoutes = app;
