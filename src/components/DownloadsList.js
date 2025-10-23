import React, { useState } from "react";
import {
    Download,
    Trash2,
    FileVideo,
    Calendar,
    HardDrive,
    Edit2,
    Monitor,
    Clock,
    Play,
} from "lucide-react";
import {
    formatFileSize,
    formatDuration,
    extractDomain,
} from "../utils/helpers";
import VideoPlayer from "./VideoPlayer";

const DownloadsList = ({ downloads, onDownload, onDelete, onRename }) => {
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [selectedVideo, setSelectedVideo] = useState(null);

    const handleRenameStart = (download) => {
        setEditingId(download.id);
        setEditName(download.filename);
    };

    const handleRenameCancel = () => {
        setEditingId(null);
        setEditName("");
    };

    const handleRenameSave = async () => {
        if (editName.trim() && editingId) {
            await onRename(editingId, editName.trim());
            setEditingId(null);
            setEditName("");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleRenameSave();
        } else if (e.key === "Escape") {
            handleRenameCancel();
        }
    };

    const handlePlayVideo = (download) => {
        setSelectedVideo(download);
    };

    const handleCloseVideo = () => {
        setSelectedVideo(null);
    };

    const handleVideoDownload = (downloadId) => {
        onDownload(downloadId);
    };
    if (downloads.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6 transition-colors duration-300">
                <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white transition-colors duration-300">
                    <FileVideo className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300" />
                    Downloads
                </h2>
                <div className="text-center py-8">
                    <FileVideo className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4 transition-colors duration-300" />
                    <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        No downloads yet
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 transition-colors duration-300">
                        Downloaded videos will appear here
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6 transition-colors duration-300">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white transition-colors duration-300">
                <FileVideo className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300" />
                Downloads ({downloads.length})
            </h2>

            <div className="space-y-4">
                {downloads.map((download) => (
                    <div
                        key={download.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md dark:hover:shadow-lg transition-all duration-300 bg-gray-50 dark:bg-gray-700"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                {editingId === download.id ? (
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) =>
                                                setEditName(e.target.value)
                                            }
                                            onKeyDown={handleKeyPress}
                                            className="flex-1 px-2 py-1 text-lg font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
                                            autoFocus
                                        />
                                        <button
                                            onClick={handleRenameSave}
                                            className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-300"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={handleRenameCancel}
                                            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors duration-300"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <h3
                                        className="text-lg font-medium text-gray-900 dark:text-white truncate transition-colors duration-300 cursor-help"
                                        title={download.filename}
                                    >
                                        {download.filename}
                                    </h3>
                                )}

                                <div className="mt-2 space-y-1">
                                    <a
                                        href={download.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors duration-300 truncate block"
                                        title={download.url}
                                    >
                                        {extractDomain(download.url)}
                                    </a>

                                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                                        <div className="flex items-center">
                                            <HardDrive className="w-4 h-4 mr-1" />
                                            <span>
                                                {formatFileSize(
                                                    download.filesize
                                                )}
                                            </span>
                                        </div>

                                        {download.resolution && (
                                            <div className="flex items-center">
                                                <Monitor className="w-4 h-4 mr-1" />
                                                <span>
                                                    {download.resolution}
                                                </span>
                                            </div>
                                        )}

                                        {download.duration && (
                                            <div className="flex items-center">
                                                <Clock className="w-4 h-4 mr-1" />
                                                <span>
                                                    {formatDuration(
                                                        download.duration
                                                    )}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-1" />
                                            <span>
                                                {new Date(
                                                    download.created_at
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 ml-4">
                                <button
                                    onClick={() => handlePlayVideo(download)}
                                    className="p-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-300"
                                    title="Play video"
                                >
                                    <Play className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={() => onDownload(download.id)}
                                    className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-300"
                                    title="Download to computer"
                                >
                                    <Download className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={() => handleRenameStart(download)}
                                    className="p-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors duration-300"
                                    title="Rename file"
                                >
                                    <Edit2 className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={() => onDelete(download.id)}
                                    className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-300"
                                    title="Delete from server"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Video Player Popup */}
            {selectedVideo && (
                <VideoPlayer
                    video={selectedVideo}
                    onClose={handleCloseVideo}
                    onDownload={handleVideoDownload}
                />
            )}
        </div>
    );
};

export default DownloadsList;
