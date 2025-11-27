/* FORTRESS ENTERPRISE AUTO-CONVERTED: controller.js */
/**
 * Controller - rota: user
 * Handlers: list, getById, create, update, remove
 * NOTE: middleware auth should set req.user when applicable
 */
import * as Service from './service';
export async function list(req, res, next) {
    try {
        const page = Number(req.query.page || 1);
        const pageSize = Number(req.query.pageSize || 20);
        const result = await Service.list({ page, pageSize, userId: req.user?.id });
        res.json({ data: result.data, meta: result.meta });
    }
    catch (err) {
        next(err);
    }
}
export async function getById(req, res, next) {
    try {
        const { id } = req.params;
        const item = await Service.getById(id);
        if (!item)
            return res.status(404).json({ error: "Not found" });
        res.json({ data: item });
    }
    catch (err) {
        next(err);
    }
}
export async function create(req, res, next) {
    try {
        const payload = req.body;
        const created = await Service.create(payload, { userId: req.user?.id });
        res.status(201).json({ data: created });
    }
    catch (err) {
        next(err);
    }
}
export async function update(req, res, next) {
    try {
        const { id } = req.params;
        const payload = req.body;
        const updated = await Service.update(id, payload);
        res.json({ data: updated });
    }
    catch (err) {
        next(err);
    }
}
export async function remove(req, res, next) {
    try {
        const { id } = req.params;
        await Service.remove(id);
        res.status(204).end();
    }
    catch (err) {
        next(err);
    }
}
