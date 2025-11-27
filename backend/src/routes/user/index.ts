/* FORTRESS ENTERPRISE AUTO-CONVERTED: index.js */

/**
 * Route index - user
 * Wiring express Router with controller functions
 */
import { Router } from "express";
import * as Controller from './controller';

const router = Router();

router.get("/", Controller.list);
router.post("/", Controller.create);
router.get("/:id", Controller.getById);
router.put("/:id", Controller.update);
router.delete("/:id", Controller.remove);

export default router;
