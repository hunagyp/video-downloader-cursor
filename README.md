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

## Demo Video

Watch this short demo to see the app in action:

<div style="padding:111.57% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/1129884600?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" referrerpolicy="strict-origin-when-cross-origin" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="mutogatas"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>

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
