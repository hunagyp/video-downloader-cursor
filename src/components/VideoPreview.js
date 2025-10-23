import React, { useState, useCallback } from "react";
import { Download, Play, Calendar, Eye, Clock } from "lucide-react";
import {
    formatDuration,
    formatFileSize,
    formatViewCount,
} from "../utils/helpers";

const VideoPreview = ({ videoInfo, onDownload }) => {
    const [filename, setFilename] = useState("");
    const [selectedFormat, setSelectedFormat] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [resolutionFilter, setResolutionFilter] = useState("all");
    const [formatFilter, setFormatFilter] = useState("all");
    const [adjectives, setAdjectives] = useState([]); // State for adjectives list
    const [nouns, setNouns] = useState([]); // State for nouns list

    // Load word lists from external JSON files
    React.useEffect(() => {
        const loadWordLists = async () => {
            try {
                const adjectivesResponse = await fetch(
                    "/api/word-lists/adjectives"
                );
                const nounsResponse = await fetch("/api/word-lists/nouns");

                if (adjectivesResponse.ok) {
                    const adjectivesData = await adjectivesResponse.json();
                    setAdjectives(adjectivesData);
                }

                if (nounsResponse.ok) {
                    const nounsData = await nounsResponse.json();
                    setNouns(nounsData);
                }
            } catch (error) {
                console.error("Error loading word lists:", error);
                // Fallback to hardcoded lists if API fails
                setAdjectives([
                    "amazing",
                    "epic",
                    "awesome",
                    "fantastic",
                    "incredible",
                    "brilliant",
                    "stunning",
                    "magnificent",
                ]);
                setNouns([
                    "video",
                    "clip",
                    "movie",
                    "film",
                    "content",
                    "media",
                    "footage",
                    "recording",
                ]);
            }
        };

        loadWordLists();
    }, []);

    // Get unique resolutions and formats from available formats
    const getAvailableResolutions = () => {
        if (!videoInfo.formats) return [];
        const resolutions = [
            ...new Set(videoInfo.formats.map((f) => f.resolution)),
        ];
        return resolutions
            .filter((r) => r && r !== "Unknown")
            .filter((r) => {
                // Filter out 240p and 360p resolutions
                if (r.includes("x")) {
                    const [width, height] = r.split("x").map(Number);
                    const totalPixels = width * height;

                    // Exclude 360p and below (640x360 = 230,400 pixels)
                    // 480p = 854x480 = 409,920 pixels
                    return totalPixels >= 400000; // Only show 480p and above
                }
                return true;
            })
            .sort((a, b) => {
                const getPixels = (res) => {
                    if (!res || !res.includes("x")) return 0;
                    const [w, h] = res.split("x").map(Number);
                    return w * h;
                };
                return getPixels(b) - getPixels(a);
            });
    };

    const getAvailableFormats = () => {
        if (!videoInfo.formats) return [];
        const formats = [...new Set(videoInfo.formats.map((f) => f.ext))];
        return formats.filter((f) => f && f !== "Unknown").sort();
    };

    // Filter formats based on selected filters
    const getFilteredFormats = useCallback(() => {
        if (!videoInfo.formats) return [];
        return videoInfo.formats.filter((format) => {
            // When "All Resolutions" is selected, show all formats regardless of resolution
            const resolutionMatch =
                resolutionFilter === "all" ||
                format.resolution === resolutionFilter;
            const formatMatch =
                formatFilter === "all" || format.ext === formatFilter;
            return resolutionMatch && formatMatch;
        });
    }, [videoInfo.formats, resolutionFilter, formatFilter]);

    // Get resolution category (e.g., "4K", "1080p", "720p")
    const getResolutionCategory = (resolution) => {
        if (!resolution || !resolution.includes("x")) return resolution;
        const [width, height] = resolution.split("x").map(Number);
        const totalPixels = width * height;

        if (totalPixels >= 3840 * 2160) return "4K";
        if (totalPixels >= 2560 * 1440) return "2K";
        if (totalPixels >= 1920 * 1080) return "1080p";
        if (totalPixels >= 1280 * 720) return "720p";
        if (totalPixels >= 854 * 480) return "480p";
        // Skip 360p and below - not needed
        return resolution;
    };

    // Convert bitrate from kbps to Mb/s
    const formatBitrate = (kbps) => {
        if (!kbps || kbps <= 0) return null;
        return (kbps / 1000).toFixed(1);
    };

    // Generate random filename
    const generateRandomFilename = () => {
        if (adjectives.length === 0 || nouns.length === 0) {
            return "random_video_" + Math.floor(Math.random() * 9999) + 1;
        }

        const randomAdj =
            adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
        const randomNum = Math.floor(Math.random() * 9999) + 1;

        return `${randomAdj}_${randomNoun}_${randomNum}`;
    };

    // Generate smart filename from video info and selected format
    const generateSmartFilename = (videoInfo, selectedFormat = null) => {
        if (!videoInfo.title) return "";

        // Clean the title: remove special characters, limit length, replace spaces with underscores
        let cleanTitle = videoInfo.title
            .replace(/[^\w\s-]/g, "") // Remove special characters except word chars, spaces, and hyphens
            .replace(/\s+/g, "_") // Replace spaces with underscores
            .toLowerCase() // Convert to lowercase
            .substring(0, 50); // Increased back to 50 characters since no platform suffix

        // Add resolution suffix if available
        let resolutionSuffix = "";
        if (selectedFormat && selectedFormat.resolution) {
            const resolution = selectedFormat.resolution;
            if (resolution.includes("x")) {
                const [width] = resolution.split("x").map(Number);
                if (width >= 3840) resolutionSuffix = "_4k";
                else if (width >= 2560) resolutionSuffix = "_2k";
                else if (width >= 1920) resolutionSuffix = "_1080p";
                else if (width >= 1280) resolutionSuffix = "_720p";
                else if (width >= 854) resolutionSuffix = "_480p";
                else if (width >= 640) resolutionSuffix = "_360p";
                else if (width >= 426) resolutionSuffix = "_240p";
            }
        }

        return cleanTitle + resolutionSuffix;
    };

    // Set default format and filename when videoInfo changes
    React.useEffect(() => {
        const filteredFormats = getFilteredFormats();
        if (filteredFormats.length > 0) {
            setSelectedFormat(filteredFormats[0]);
        }

        // Generate smart filename
        const smartFilename = generateSmartFilename(
            videoInfo,
            filteredFormats[0]
        );
        if (smartFilename && !filename) {
            setFilename(smartFilename);
        }
    }, [
        videoInfo,
        filename,
        resolutionFilter,
        formatFilter,
        getFilteredFormats,
    ]);

    // Load filter preferences from localStorage
    React.useEffect(() => {
        const savedResolutionFilter = localStorage.getItem("resolutionFilter");
        const savedFormatFilter = localStorage.getItem("formatFilter");
        if (savedResolutionFilter) setResolutionFilter(savedResolutionFilter);
        if (savedFormatFilter) setFormatFilter(savedFormatFilter);
    }, []);

    // Set best resolution as default when videoInfo changes (only if no manual selection made)
    React.useEffect(() => {
        if (videoInfo.formats && videoInfo.formats.length > 0) {
            const availableResolutions = getAvailableResolutions();
            if (availableResolutions.length > 0) {
                // Only set default if resolutionFilter is still "all" (no manual selection)
                if (resolutionFilter === "all") {
                    setResolutionFilter(availableResolutions[0]);
                }
            }
        }
    }, [videoInfo]); // Only depend on videoInfo, not getAvailableResolutions

    // Save filter preferences to localStorage
    React.useEffect(() => {
        localStorage.setItem("resolutionFilter", resolutionFilter);
    }, [resolutionFilter]);

    React.useEffect(() => {
        localStorage.setItem("formatFilter", formatFilter);
    }, [formatFilter]);

    const handleDownload = async () => {
        if (!filename.trim()) {
            alert("Please enter a filename");
            return;
        }

        if (!selectedFormat) {
            alert("Please select a format");
            return;
        }

        setIsDownloading(true);
        try {
            await onDownload(filename.trim(), selectedFormat.format_id);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6 transition-colors duration-300">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white transition-colors duration-300">
                <Play className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300" />
                Video Preview
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Video Info */}
                <div className="space-y-4">
                    {videoInfo.thumbnail && (
                        <img
                            src={videoInfo.thumbnail}
                            alt="Video thumbnail"
                            className="w-full rounded-lg shadow-sm"
                        />
                    )}

                    <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                            {videoInfo.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-300">
                            by {videoInfo.uploader}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center text-gray-700 dark:text-gray-300 transition-colors duration-300">
                            <Clock className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                            <span>{formatDuration(videoInfo.duration)}</span>
                        </div>
                        <div className="flex items-center text-gray-700 dark:text-gray-300 transition-colors duration-300">
                            <Eye className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                            <span>
                                {formatViewCount(videoInfo.view_count)} views
                            </span>
                        </div>
                        {videoInfo.upload_date && (
                            <div className="flex items-center col-span-2 text-gray-700 dark:text-gray-300 transition-colors duration-300">
                                <Calendar className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                                <span>
                                    {new Date(
                                        videoInfo.upload_date
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Download Options */}
                <div className="space-y-4">
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                            Download Options
                        </h4>

                        {/* Format Selection */}
                        {videoInfo.formats && videoInfo.formats.length > 0 && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                                    Select Format
                                </label>

                                {/* Resolution Filter Buttons */}
                                <div className="mb-3">
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() =>
                                                setResolutionFilter("all")
                                            }
                                            className={`px-3 py-1 text-xs rounded-full transition-colors duration-300 ${
                                                resolutionFilter === "all"
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
                                            }`}
                                        >
                                            All Resolutions
                                        </button>
                                        {getAvailableResolutions().map(
                                            (resolution) => (
                                                <button
                                                    key={resolution}
                                                    onClick={() =>
                                                        setResolutionFilter(
                                                            resolution
                                                        )
                                                    }
                                                    className={`px-3 py-1 text-xs rounded-full transition-colors duration-300 ${
                                                        resolutionFilter ===
                                                        resolution
                                                            ? "bg-blue-500 text-white"
                                                            : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
                                                    }`}
                                                >
                                                    {getResolutionCategory(
                                                        resolution
                                                    )}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>

                                {/* Format Filter Buttons */}
                                <div className="mb-3">
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() =>
                                                setFormatFilter("all")
                                            }
                                            className={`px-3 py-1 text-xs rounded-full transition-colors duration-300 ${
                                                formatFilter === "all"
                                                    ? "bg-green-500 text-white"
                                                    : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
                                            }`}
                                        >
                                            All Formats
                                        </button>
                                        {getAvailableFormats().map((format) => (
                                            <button
                                                key={format}
                                                onClick={() =>
                                                    setFormatFilter(format)
                                                }
                                                className={`px-3 py-1 text-xs rounded-full transition-colors duration-300 ${
                                                    formatFilter === format
                                                        ? "bg-green-500 text-white"
                                                        : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
                                                }`}
                                            >
                                                {format.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Filtered Format List */}
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {getFilteredFormats().map(
                                        (format, index) => (
                                            <div
                                                key={format.format_id || index}
                                                className={`p-2 rounded-lg border cursor-pointer transition-colors duration-300 ${
                                                    selectedFormat?.format_id ===
                                                    format.format_id
                                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                                        : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                                                }`}
                                                onClick={() =>
                                                    setSelectedFormat(format)
                                                }
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div className="flex-1">
                                                        {/* Main info line */}
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <span className="font-medium text-gray-900 dark:text-white transition-colors duration-300">
                                                                {format.resolution ||
                                                                    "Unknown Resolution"}
                                                            </span>
                                                            <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded">
                                                                {format.ext?.toUpperCase() ||
                                                                    "Unknown"}
                                                            </span>
                                                            {format.format_id && (
                                                                <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                                                                    ID:{" "}
                                                                    {
                                                                        format.format_id
                                                                    }
                                                                </span>
                                                            )}
                                                            {format.language &&
                                                                format.language !==
                                                                    "unknown" && (
                                                                    <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded">
                                                                        {format.language.toUpperCase()}
                                                                    </span>
                                                                )}
                                                        </div>

                                                        {/* Compact details line */}
                                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                                                            <span className="whitespace-nowrap">
                                                                Size:{" "}
                                                                {formatFileSize(
                                                                    format.filesize ||
                                                                        0
                                                                )}
                                                            </span>
                                                            {format.vcodec &&
                                                                format.vcodec !==
                                                                    "Unknown" && (
                                                                    <span className="whitespace-nowrap">
                                                                        Codec:{" "}
                                                                        {
                                                                            format.vcodec
                                                                        }
                                                                    </span>
                                                                )}
                                                            {formatBitrate(
                                                                format.tbr
                                                            ) && (
                                                                <span className="whitespace-nowrap">
                                                                    Bitrate:{" "}
                                                                    {formatBitrate(
                                                                        format.tbr
                                                                    )}{" "}
                                                                    Mb/s
                                                                </span>
                                                            )}
                                                            {format.fps &&
                                                                format.fps >
                                                                    0 && (
                                                                    <span className="whitespace-nowrap">
                                                                        FPS:{" "}
                                                                        {
                                                                            format.fps
                                                                        }
                                                                    </span>
                                                                )}
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={`w-4 h-4 rounded-full border-2 ${
                                                            selectedFormat?.format_id ===
                                                            format.format_id
                                                                ? "border-blue-500 bg-blue-500"
                                                                : "border-gray-300 dark:border-gray-500"
                                                        }`}
                                                    >
                                                        {selectedFormat?.format_id ===
                                                            format.format_id && (
                                                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                                    Output Filename
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={filename}
                                        onChange={(e) =>
                                            setFilename(e.target.value)
                                        }
                                        placeholder="my_video"
                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300"
                                    />
                                    <button
                                        onClick={() =>
                                            setFilename(
                                                generateRandomFilename()
                                            )
                                        }
                                        className="px-3 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-800 transition-colors duration-300 flex items-center justify-center"
                                        title="Generate random filename"
                                    >
                                        🎲
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                                    File extension will be added automatically
                                </p>
                            </div>

                            <button
                                onClick={handleDownload}
                                disabled={!filename.trim() || isDownloading}
                                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center ${
                                    !filename.trim() || isDownloading
                                        ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                        : "bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-800"
                                }`}
                            >
                                {isDownloading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Starting Download...
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        <Download className="w-5 h-5 mr-2" />
                                        Start Download
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPreview;
