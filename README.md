# Video Downloader

A simple web application for downloading videos from YouTube, Facebook, Reddit, and more platforms.
(pure vibe coded magic, and a bit of me)

## Quick Start

1. **Clone the repository:**

    ```bash
    git clone https://github.com/hunagyp/video-downloader-cursor
    cd video-downloader-cursor
    ```

2. **Start the application:**

    ```bash
    bash start.sh
    ```

3. **Access the application:**
   Open your browser and go to `http://localhost:5000`

## Usage

1. Paste a video URL
2. Click "Get Video Info" to see video details
3. Enter a custom filename (optional) or use the smart filename generator
4. Click "Start Download"
5. Download the file when complete

## Docker Commands

```bash
# Start (recommended - stops existing containers and builds fresh)
bash start.sh

# Manual Docker Compose commands
docker-compose up -d --build    # Start with fresh build
docker-compose down             # Stop containers
docker-compose logs -f          # View logs
```

## Features

-   Video preview with metadata
-   Quality selection with language filtering (English/Hungarian audio)
-   Real-time download progress
-   File management (download/delete/rename)
-   Video player with streaming support
-   Responsive design with dark/light theme
-   Unicode support
-   Smart filename generation

## Technology Stack

-   **Backend**: Python Flask + yt-dlp
-   **Frontend**: React
-   **Database**: SQLite
-   **Deployment**: Docker

## License

MIT License
