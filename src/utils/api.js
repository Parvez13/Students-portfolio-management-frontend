// src/utils/api.js

// Points to your active modular Express engine gateway running in the background
export const API_BASE = "http://localhost:3000/api/v1";

/**
 * Centrally processes HTTP responses to align with our backend wrapper structure
 */
export const handleResponse = async (response) => {
    const json = await response.json();
    
    if (!response.ok) {
        // Automatically bubbles up errors to be caught by UI catch blocks
        throw new Error(json.message || "An unexpected system error occurred.");
    }
    
    return json; // Returns our standard { success, statusCode, data, message } bundle
};