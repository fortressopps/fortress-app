/**
 * Fortress Core API - Frontend Service Layer
 * Connects to backend core modules (Supermarket, Goals, Forecast)
 */
import api from './axiosClient';

/**
 * Process a receipt through the full core flow
 */
export async function processReceipt(data) {
    const response = await api.post('/supermarket/receipts/process', data);
    return response.data;
}

/**
 * Get Active Alerts
 */
export async function getAlerts() {
    const response = await api.get('/alerts');
    return response.data;
}

/**
 * Get user's financial goals
 */
export async function getGoals() {
    const response = await api.get('/goals');
    return response.data;
}

/**
 * Get user's goals with automatically calculated progress
 */
export async function getGoalsWithProgress() {
    const response = await api.get('/goals/with-progress');
    return response.data;
}

/**
 * Create a new goal
 */
export async function createGoal(data) {
    const response = await api.post('/goals', data);
    return response.data;
}

/**
 * Update goal progress
 */
export async function updateGoalProgress(id, progress) {
    const response = await api.patch(`/goals/${id}/progress`, { progress });
    return response.data;
}

/**
 * Delete goal
 */
export async function deleteGoal(id) {
    const response = await api.delete(`/goals/${id}`);
    return response.data;
}

/**
 * Get financial forecast
 */
export async function getForecast() {
    const response = await api.get('/forecast');
    return response.data;
}

/**
 * Get supermarket lists
 */
export async function getSupermarketLists(page = 1, pageSize = 20) {
    const response = await api.get('/supermarket/lists', {
        params: { page, pageSize }
    });
    return response.data;
}

/**
 * Create supermarket list
 */
export async function createSupermarketList(data) {
    const response = await api.post('/supermarket/lists', data);
    return response.data;
}

/**
 * Get supermarket list by ID
 */
export async function getSupermarketListById(id) {
    const response = await api.get(`/supermarket/lists/${id}`);
    return response.data;
}

/**
 * Add item to supermarket list
 */
export async function addSupermarketItem(listId, data) {
    const response = await api.post(`/supermarket/lists/${listId}/items`, data);
    return response.data;
}

/**
 * Update supermarket item
 */
export async function updateSupermarketItem(listId, itemId, data) {
    const response = await api.patch(`/supermarket/lists/${listId}/items/${itemId}`, data);
    return response.data;
}

/**
 * Delete supermarket item
 */
export async function deleteSupermarketItem(listId, itemId) {
    const response = await api.delete(`/supermarket/lists/${listId}/items/${itemId}`);
    return response.data;
}

/**
 * Get Kernel / Neural state
 */
export async function getKernelState() {
    const response = await api.get('/kernel');
    return response.data;
}

/**
 * Update user profile
 */
export async function updateProfile(data) {
    const response = await api.put('/users/me', data);
    return response.data;
}

/**
 * Resend verification email
 */
export async function resendVerification() {
    const response = await api.post('/auth/resend-verification');
    return response.data;
}

/**
 * Change password
 */
export async function changePassword(currentPassword, newPassword) {
    const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
    });
    return response.data;
}

/**
 * Soft delete account
 */
export async function deleteAccount() {
    const response = await api.delete('/auth/account');
    return response.data;
}

/**
 * Get Market Data
 */
export async function getMarketData() {
    const response = await api.get('/market-data');
    return response.data;
}

/**
 * Get Transactions
 */
export async function getTransactions(params = {}) {
    const response = await api.get('/transactions', { params });
    return response.data;
}

/**
 * Get Transactions Summary
 */
export async function getTransactionSummary(month) {
    const response = await api.get('/transactions/summary', { params: { month } });
    return response.data;
}

/**
 * Create Transaction
 */
export async function createTransaction(data) {
    const response = await api.post('/transactions', data);
    return response.data;
}

/**
 * Import Transactions CSV
 */
export async function importTransactions(formData) {
    const response = await api.post('/transactions/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
}

/**
 * Update Transaction
 */
export async function updateTransaction(id, data) {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data;
}

/**
 * Delete Transaction
 */
export async function deleteTransaction(id) {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
}

export default {
    processReceipt,
    getGoals,
    getGoalsWithProgress,
    createGoal,
    updateGoalProgress,
    deleteGoal,
    getAlerts,
    getForecast,
    getSupermarketLists,
    createSupermarketList,
    getSupermarketListById,
    addSupermarketItem,
    updateSupermarketItem,
    deleteSupermarketItem,
    getKernelState,
    updateProfile,
    resendVerification,
    changePassword,
    deleteAccount,
    getMarketData,
    getTransactions,
    getTransactionSummary,
    createTransaction,
    importTransactions,
    updateTransaction,
    deleteTransaction,
};
export const completeOnboarding = (data) =>
  api.post('/users/onboarding/complete', data).then(r => r.data);

export const getTransactionReport = (month) =>
  api.get(`/transactions/report?month=${month}`).then(r => r.data);
