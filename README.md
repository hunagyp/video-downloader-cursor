# Video Downloader

A simple, responsive web application for downloading videos from various platforms like YouTube, Facebook, Reddit, etc.

## Features

-   **Video Preview**: Shows video metadata including title, uploader, duration, views, and thumbnail
-   **Quality Selection**: Displays the best available quality with resolution and file size information
-   **Custom Downloads**: Users can specify custom filenames for downloads
-   **Progress Tracking**: Real-time download progress with estimated completion time
-   **File Management**: Download files to local computer and delete from server
-   **Toast Notifications**: User-friendly notifications for all actions
-   **Responsive Design**: Works on desktop and mobile devices
-   **Unicode Support**: Handles international video titles and metadata

## Technology Stack

-   **Backend**: Python Flask with yt-dlp for video processing
-   **Frontend**: React with modern UI components
-   **Database**: SQLite for tracking downloads
-   **Deployment**: Docker and Docker Compose

## Quick Start

### Using Docker (Recommended)

1. **Clone the repository**:

    ```bash
    git clone <repository-url>
    cd video-downloader
    ```

2. **Deploy the application**:

    **On Linux/macOS:**

    ```bash
    chmod +x deploy.sh
    ./deploy.sh
    ```

    **On Windows:**

    ```cmd
    deploy.bat
    ```

    **Or manually:**

    ```bash
    docker-compose up -d
    ```

3. **Access the application**:
   Open your browser and go to `http://localhost:5000`

## Usage

1. **Enter Video URL**: Paste a video URL from supported platforms
2. **Get Video Info**: Click "Get Video Info" to see video details
3. **Set Filename**: Enter a custom filename (optional)
4. **Start Download**: Click "Start Download" to begin downloading
5. **Monitor Progress**: Watch the progress bar and estimated completion time
6. **Download File**: Once complete, download the file to your computer
7. **Manage Files**: Delete files from the server when no longer needed

## Supported Platforms

-   YouTube
-   Facebook
-   Reddit
-   And many more (via yt-dlp)

## API Endpoints

-   `GET /api/test` - Health check
-   `POST /api/video-info` - Get video metadata
-   `POST /api/download` - Start video download
-   `GET /api/download-status` - Get download progress
-   `GET /api/downloads` - List downloaded files
-   `GET /api/download-file/<id>` - Download file to computer
-   `DELETE /api/delete-file/<id>` - Delete file from server

## Configuration

The application uses the following configuration:

-   **Port**: 5000 (configurable via environment variables)
-   **Data Directory**: `./data` (for storing downloaded files and database)
-   **Config Directory**: `./config` (for configuration files)
-   **Database**: SQLite (`data/downloads.db`)

## Docker Commands

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down

# Restart the application
docker-compose restart

# Update and restart
docker-compose pull && docker-compose up -d
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**:

    - Change the port in `docker-compose.yml` or stop the conflicting service

2. **Permission Errors**:

    - Ensure Docker has proper permissions to access the project directory

3. **Video Download Fails**:

    - Check if the URL is supported by yt-dlp
    - Verify internet connectivity

4. **Unicode Characters Not Displaying**:
    - The application now properly handles international characters
    - If issues persist, check browser encoding settings

### Logs

View application logs:

```bash
docker-compose logs -f
```

## Project Structure

```
video-downloader/
├── app.py                 # Flask backend
├── requirements.txt       # Python dependencies
├── package.json          # Node.js dependencies
├── src/                  # React frontend
│   ├── App.js
│   ├── components/
│   ├── services/
│   └── utils/
├── public/               # Static files
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose configuration
├── .dockerignore        # Docker ignore file
├── deploy.sh            # Linux/macOS deployment script
├── deploy.bat           # Windows deployment script
└── README.md           # This file
```

## Development

### Manual Setup (Development Only)

1. **Backend Setup**:

    ```bash
    # Create virtual environment
    python -m venv venv

    # Activate virtual environment
    # On Windows:
    venv\Scripts\activate
    # On macOS/Linux:
    source venv/bin/activate

    # Install dependencies
    pip install -r requirements.txt

    # Start the backend
    python app.py
    ```

2. **Frontend Setup**:

    ```bash
    # Install dependencies
    npm install

    # Start the frontend
    npm start
    ```

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues and questions, please open an issue on the GitHub repository.
