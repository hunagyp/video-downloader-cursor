import React, { useState } from "react";
import { Link, Download } from "lucide-react";
import { isValidUrl } from "../utils/helpers";

const VideoInput = ({ onSubmit, isLoading, disabled }) => {
    const [url, setUrl] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (url.trim()) {
            onSubmit(url.trim());
        }
    };

    const isValid = isValidUrl(url);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6 transition-colors duration-300">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white transition-colors duration-300">
                <Link className="w-5 h-5 mr-2 text-gray-700 dark:text-gray-300" />
                Enter Video URL
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300 ${
                            url && !isValid
                                ? "border-red-500"
                                : "border-gray-300 dark:border-gray-600"
                        } ${
                            disabled
                                ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed"
                                : ""
                        }`}
                        disabled={disabled}
                    />
                    {url && !isValid && (
                        <p className="text-red-500 text-sm mt-1">
                            Please enter a valid URL
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={!isValid || isLoading || disabled}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-300 ${
                        !isValid || isLoading || disabled
                            ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                            : "bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800"
                    }`}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Loading...
                        </div>
                    ) : (
                        <div className="flex items-center justify-center">
                            <Download className="w-5 h-5 mr-2" />
                            Get Video Info
                        </div>
                    )}
                </button>
            </form>

            {disabled && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center transition-colors duration-300">
                    Download in progress. Please wait...
                </p>
            )}
        </div>
    );
};

export default VideoInput;
