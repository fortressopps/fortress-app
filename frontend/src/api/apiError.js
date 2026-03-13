/**
 * Normalize API errors into a consistent human-readable string.
 * Works for axios errors and plain errors.
 */
export function extractError(err) {
    if (!err) return 'Unexpected error';
    // Axios response error
    if (err.response?.data) {
        const d = err.response.data;
        return d.error || d.message || JSON.stringify(d);
    }
    // Network / timeout error
    if (err.message) return err.message;
    return 'Unexpected error';
}
