import React from "react";
import { X, Download, Play } from "lucide-react";
import { formatFileSize, formatDuration } from "../utils/helpers";

const VideoPlayer = ({ video, onClose, onDownload }) => {
    if (!video) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleDownload = () => {
        onDownload(video.id);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-all duration-300"
            onClick={handleOverlayClick}
        >
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <Play className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {video.filename}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                        title="Close player"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Video Player */}
                <div className="relative bg-black">
                    <video
                        controls
                        className="w-full h-auto max-h-[60vh]"
                        preload="metadata"
                        poster={video.thumbnail || undefined}
                    >
                        <source
                            src={`/api/stream-file/${video.id}`}
                            type="video/mp4"
                        />
                        <source
                            src={`/api/stream-file/${video.id}`}
                            type="video/webm"
                        />
                        <source
                            src={`/api/stream-file/${video.id}`}
                            type="video/mkv"
                        />
                        Your browser does not support the video tag.
                    </video>
                </div>

                {/* Video Info */}
                <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Resolution:</span>{" "}
                            {video.resolution || "Unknown"}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Size:</span>{" "}
                            {formatFileSize(video.filesize)}
                        </div>
                    </div>

                    {video.duration && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Duration:</span>{" "}
                            {formatDuration(video.duration)}
                        </div>
                    )}

                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Downloaded:</span>{" "}
                        {new Date(video.created_at).toLocaleString()}
                    </div>

                    {/* Download Button */}
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={handleDownload}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                        >
                            <Download className="w-4 h-4" />
                            <span>Download to Computer</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
