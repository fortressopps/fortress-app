/**
 * Fortress Core API - Frontend Service Layer
 * Connects to backend core modules (Supermarket, Goals, Forecast)
 */
import api from './axiosClient';

/**
 * Process a receipt through the full core flow
 * POST /supermarket/receipts/process
 * @param {Object} data - { total, category, projectedTotal?, average? }
 * @returns {Promise} - { success, data: { receipt, insight, decision, notification } }
 */
export async function processReceipt(data) {
    const response = await api.post('/supermarket/receipts/process', data);
    return response.data;
}

/**
 * Get user's financial goals
 * GET /goals
 * @returns {Promise} - Array of goals with progress
 */
export async function getGoals() {
    const response = await api.get('/goals');
    return response.data;
}

/**
 * Create a new goal
 * POST /goals
 * @param {Object} data - { name, value, periodicity }
 */
export async function createGoal(data) {
    const response = await api.post('/goals', data);
    return response.data;
}

/**
 * Get financial forecast
 * GET /forecast (to be implemented on backend)
 * @returns {Promise} - { previsaoMensal, previsaoSemanal, riscoLeve }
 */
export async function getForecast() {
    const response = await api.get('/forecast');
    return response.data;
}

/**
 * Get supermarket lists
 * GET /supermarket/lists
 */
export async function getSupermarketLists(page = 1, pageSize = 20) {
    const response = await api.get('/supermarket/lists', {
        params: { page, pageSize }
    });
    return response.data;
}

/**
 * Create supermarket list
 * POST /supermarket/lists
 */
export async function createSupermarketList(data) {
    const response = await api.post('/supermarket/lists', data);
    return response.data;
}

/**
 * Get supermarket list by ID
 * GET /supermarket/lists/:id
 */
export async function getSupermarketListById(id) {
    const response = await api.get(`/supermarket/lists/${id}`);
    return response.data;
}

/**
 * Add item to supermarket list
 * POST /supermarket/lists/:id/items
 */
export async function addSupermarketItem(listId, data) {
    const response = await api.post(`/supermarket/lists/${listId}/items`, data);
    return response.data;
}

/**
 * Update supermarket item
 * PATCH /supermarket/lists/:listId/items/:itemId
 */
export async function updateSupermarketItem(listId, itemId, data) {
    const response = await api.patch(`/supermarket/lists/${listId}/items/${itemId}`, data);
    return response.data;
}

/**
 * Delete supermarket item
 * DELETE /supermarket/lists/:listId/items/:itemId
 */
export async function deleteSupermarketItem(listId, itemId) {
    const response = await api.delete(`/supermarket/lists/${listId}/items/${itemId}`);
    return response.data;
}

/**
 * Get Kernel / Neural state
 * GET /kernel
 */
export async function getKernelState() {
    const response = await api.get('/kernel');
    return response.data;
}

export default {
    processReceipt,
    getGoals,
    createGoal,
    getForecast,
    getSupermarketLists,
    createSupermarketList,
    getSupermarketListById,
    addSupermarketItem,
    updateSupermarketItem,
    deleteSupermarketItem,
    getKernelState,
};
