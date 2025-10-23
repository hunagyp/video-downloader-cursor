import React from "react";
import { Loader } from "lucide-react";

const DownloadProgress = ({ progress, status }) => {
    const getStatusText = () => {
        switch (status) {
            case "downloading":
                return "Downloading video...";
            case "processing":
                return "Processing video...";
            default:
                return "Preparing download...";
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6 transition-colors duration-300">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white transition-colors duration-300">
                <Loader className="w-5 h-5 mr-2 animate-spin text-gray-700 dark:text-gray-300" />
                Download Progress
            </h2>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                        {getStatusText()}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        {Math.round(progress)}%
                    </span>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 transition-colors duration-300">
                    <div
                        className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                        Please wait while your video is being downloaded...
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DownloadProgress;
