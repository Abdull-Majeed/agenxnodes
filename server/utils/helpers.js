const axios = require('axios');
const delay = (ms) => new Promise(res => setTimeout(res, ms));

// Helper: safe HTTP request with timeout
const safeAxios = async (config, timeoutMs = 15000) => {
    return axios({ ...config, timeout: timeoutMs });
};

// Helper: validate URL
const isValidUrl = (str) => {
    try { new URL(str); return true; } catch { return false; }
};

module.exports = { delay, safeAxios, isValidUrl };
