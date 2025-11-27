import { Router } from "express";
import * as controller from "@/controllers/supermarketController";
import { protect } from "@/controllers/authController";

const router = Router();
router.use(protect);

/* Lists */
router.post("/lists", controller.createList);
router.get("/lists", controller.getLists);
router.get("/lists/:id", controller.getList);
router.put("/lists/:id", controller.updateList);
router.delete("/lists/:id", controller.deleteList);

/* Items */
router.post("/lists/:id/items", controller.addItem);
router.put("/lists/:listId/items/:itemId", controller.updateItem);
router.delete("/lists/:listId/items/:itemId", controller.deleteItem);
router.post("/lists/:listId/items/:itemId/purchased", controller.markItemPurchased);
router.post("/lists/:id/clear-purchased", controller.clearPurchasedItems);

/* Bulk */
router.post("/lists/:id/items/bulk", controller.bulkAddItems);
router.put("/lists/:id/items/bulk", controller.bulkUpdateItems);
router.delete("/lists/:id/items/bulk", controller.bulkDeleteItems);

/* Duplicate / Archive */
router.post("/lists/:id/duplicate", controller.duplicateList);
router.post("/lists/:id/archive", controller.archiveList);
router.post("/lists/:id/unarchive", controller.unarchiveList);

/* Export / Import */
router.get("/lists/:id/export", controller.exportList);
router.post("/lists/import", controller.importList);
router.get("/export-all", controller.exportAllListsForUser);

/* Analytics */
router.get("/analytics", controller.getAnalytics);
router.get("/analytics/monthly", controller.getMonthlyStatistics);
router.get("/analytics/yearly", controller.getYearlyStatistics);
router.get("/analytics/top-categories", controller.getTopSpendingCategories);

/* Item History */
router.get("/items/:itemId/history", controller.getItemPriceHistory);

/* Collaborators */
router.get("/lists/:id/collaborators", controller.getCollaborators);
router.post("/lists/:id/collaborators", controller.addCollaborator);
router.delete("/lists/:id/collaborators/:collaboratorId", controller.removeCollaborator);
router.put("/lists/:id/collaborators/:collaboratorId/role", controller.updateCollaboratorRole);

export default router;
