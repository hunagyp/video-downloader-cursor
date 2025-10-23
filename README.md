# Video Downloader

A simple web application for downloading videos from YouTube, Facebook, Reddit, and more platforms.

## Quick Start

1. **Clone the repository:**

    ```bash
    git clone https://github.com/hunagyp/video-downloader-cursor
    cd video-downloader-cursor
    ```

2. **Start with Docker Compose:**

    ```bash
    docker-compose up -d
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
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f
```

## Features

-   Video preview with metadata
-   Quality selection
-   Real-time download progress
-   File management (download/delete/rename)
-   Responsive design
-   Unicode support

## Technology Stack

-   **Backend**: Python Flask + yt-dlp
-   **Frontend**: React
-   **Database**: SQLite
-   **Deployment**: Docker

## License

MIT License
