import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export const videoService = {
    // Get video metadata
    getVideoInfo: async (url) => {
        const response = await api.post("/video-info", { url });
        return response.data;
    },

    // Start download
    startDownload: async (url, filename, format_id = null) => {
        const response = await api.post("/download", {
            url,
            filename,
            format_id,
        });
        return response.data;
    },

    // Get download status
    getDownloadStatus: async () => {
        const response = await api.get("/download-status");
        return response.data;
    },

    // List all downloads
    getDownloads: async () => {
        const response = await api.get("/downloads");
        return response.data;
    },

    // Download file to user's computer
    downloadFile: async (downloadId) => {
        const response = await api.get(`/download-file/${downloadId}`, {
            responseType: "blob",
        });
        return response;
    },

    // Delete file from server
    deleteFile: async (downloadId) => {
        const response = await api.delete(`/delete-file/${downloadId}`);
        return response.data;
    },

    // Rename file
    renameFile: async (downloadId, newFilename) => {
        const response = await api.put(`/rename-file/${downloadId}`, {
            filename: newFilename,
        });
        return response.data;
    },
};

export default api;
