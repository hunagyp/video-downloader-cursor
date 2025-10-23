import React, { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import VideoInput from "./components/VideoInput";
import VideoPreview from "./components/VideoPreview";
import DownloadProgress from "./components/DownloadProgress";
import DownloadsList from "./components/DownloadsList";
import ThemeSwitcher from "./components/ThemeSwitcher";
import { videoService } from "./services/api";
import toast from "react-hot-toast";

function App() {
    const [videoInfo, setVideoInfo] = useState(null);
    const [downloadStatus, setDownloadStatus] = useState({
        is_downloading: false,
        progress: 0,
        status: "idle",
    });
    const [downloads, setDownloads] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Poll download status when downloading
    useEffect(() => {
        let interval;
        if (downloadStatus.is_downloading) {
            interval = setInterval(async () => {
                try {
                    const status = await videoService.getDownloadStatus();
                    setDownloadStatus(status);

                    if (
                        !status.is_downloading &&
                        status.status !== "downloading"
                    ) {
                        // Download completed
                        toast.success("Download completed!");
                        loadDownloads(); // Refresh downloads list
                    }
                } catch (error) {
                    console.error("Error checking download status:", error);
                }
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [downloadStatus.is_downloading]);

    // Load downloads on component mount
    useEffect(() => {
        loadDownloads();
    }, []);

    const loadDownloads = async () => {
        try {
            const data = await videoService.getDownloads();
            setDownloads(data);
        } catch (error) {
            console.error("Error loading downloads:", error);
            toast.error("Failed to load downloads");
        }
    };

    const handleUrlSubmit = async (url) => {
        if (!url) {
            toast.error("Please enter a valid URL");
            return;
        }

        setIsLoading(true);
        try {
            const info = await videoService.getVideoInfo(url);
            setVideoInfo(info);
            toast.success("Video info loaded successfully");
        } catch (error) {
            console.error("Error getting video info:", error);
            toast.error(
                error.response?.data?.error || "Failed to get video info"
            );
            setVideoInfo(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async (filename, format_id = null) => {
        if (!videoInfo) {
            toast.error("No video selected");
            return;
        }

        if (downloadStatus.is_downloading) {
            toast.error("Another download is in progress");
            return;
        }

        try {
            await videoService.startDownload(
                videoInfo.url || "",
                filename,
                format_id
            );
            toast.success("Download started");

            // Start polling for status
            const status = await videoService.getDownloadStatus();
            setDownloadStatus(status);
        } catch (error) {
            console.error("Error starting download:", error);
            toast.error(
                error.response?.data?.error || "Failed to start download"
            );
        }
    };

    const handleFileDownload = async (downloadId) => {
        try {
            const response = await videoService.downloadFile(downloadId);

            // Create blob URL and trigger download
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;

            // Get filename from response headers or use default
            const contentDisposition = response.headers["content-disposition"];
            let filename = "video.mp4";
            if (contentDisposition) {
                const filenameMatch =
                    contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("File downloaded successfully");
        } catch (error) {
            console.error("Error downloading file:", error);
            toast.error("Failed to download file");
        }
    };

    const handleFileDelete = async (downloadId) => {
        if (!window.confirm("Are you sure you want to delete this file?")) {
            return;
        }

        try {
            await videoService.deleteFile(downloadId);
            toast.success("File deleted successfully");
            loadDownloads(); // Refresh downloads list
        } catch (error) {
            console.error("Error deleting file:", error);
            toast.error("Failed to delete file");
        }
    };

    const handleFileRename = async (downloadId, newFilename) => {
        try {
            await videoService.renameFile(downloadId, newFilename);
            toast.success("File renamed successfully");
            loadDownloads(); // Refresh downloads list
        } catch (error) {
            console.error("Error renaming file:", error);
            toast.error(error.response?.data?.error || "Failed to rename file");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <Toaster position="top-right" />
            <ThemeSwitcher />

            <div className="container mx-auto px-4 py-8">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                        Video Downloader
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                        Download videos from YouTube, Facebook, Reddit and more
                    </p>
                </header>

                <div className="max-w-4xl mx-auto space-y-8">
                    {/* URL Input Section */}
                    <VideoInput
                        onSubmit={handleUrlSubmit}
                        isLoading={isLoading}
                        disabled={downloadStatus.is_downloading}
                    />

                    {/* Download Progress */}
                    {downloadStatus.is_downloading && (
                        <DownloadProgress
                            progress={downloadStatus.progress}
                            status={downloadStatus.status}
                        />
                    )}

                    {/* Video Preview */}
                    {videoInfo && !downloadStatus.is_downloading && (
                        <VideoPreview
                            videoInfo={videoInfo}
                            onDownload={handleDownload}
                        />
                    )}

                    {/* Downloads List */}
                    <DownloadsList
                        downloads={downloads}
                        onDownload={handleFileDownload}
                        onDelete={handleFileDelete}
                        onRename={handleFileRename}
                    />
                </div>
            </div>
        </div>
    );
}

export default App;
