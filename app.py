import os
import json
import threading
import time
from datetime import datetime
from flask import Flask, request, jsonify, send_file, abort
from flask_cors import CORS
import yt_dlp
import sqlite3
from pathlib import Path

app = Flask(__name__, static_folder='build', static_url_path='')
CORS(app)

# Configure Flask for Unicode support
app.config['JSON_AS_ASCII'] = False

# Test endpoint
@app.route('/api/test', methods=['GET'])
def test_endpoint():
    return jsonify({'message': 'Backend is working!'})

# Simple test endpoint for video-info
@app.route('/api/video-info-test', methods=['POST'])
def test_video_info():
    return jsonify({'message': 'Video info endpoint is working!', 'received': request.get_json()})

# Debug endpoint to see what's being received
@app.route('/api/debug', methods=['POST'])
def debug_endpoint():
    print(f"Headers: {dict(request.headers)}")
    print(f"Content-Type: {request.content_type}")
    print(f"Raw data: {request.get_data()}")
    try:
        data = request.get_json()
        print(f"Parsed JSON: {data}")
        return jsonify({'received': data})
    except Exception as e:
        print(f"Error parsing JSON: {e}")
        return jsonify({'error': str(e)})

# Configuration
DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)
CONFIG_DIR = Path("config")
CONFIG_DIR.mkdir(exist_ok=True)
DATABASE = DATA_DIR / "downloads.db"

# Global state for download management
download_state = {
    "is_downloading": False,
    "current_download": None,
    "progress": 0,
    "status": "idle"
}

def init_database():
    """Initialize SQLite database for tracking downloads"""
    # Only create database file if it doesn't exist
    if not DATABASE.exists():
        DATABASE.touch()
        DATABASE.chmod(0o777)
    
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS downloads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT NOT NULL,
            filename TEXT NOT NULL,
            filepath TEXT NOT NULL,
            filesize INTEGER,
            resolution TEXT,
            duration REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'completed'
        )
    ''')
    conn.commit()
    conn.close()

def progress_hook(d):
    """Progress hook for yt-dlp downloads"""
    if d['status'] == 'downloading':
        if 'total_bytes' in d and d['total_bytes']:
            progress = (d['downloaded_bytes'] / d['total_bytes']) * 100
            download_state['progress'] = round(progress, 2)
        elif 'total_bytes_estimate' in d and d['total_bytes_estimate']:
            progress = (d['downloaded_bytes'] / d['total_bytes_estimate']) * 100
            download_state['progress'] = round(progress, 2)
    
    download_state['status'] = d['status']

@app.route('/api/video-info', methods=['POST'])
def get_video_info():
    """Get video metadata without downloading"""
    print("=== VIDEO-INFO ENDPOINT CALLED ===")
    try:
        data = request.get_json()
        print(f"Received data: {data}")
        
        if not data:
            return jsonify({'error': 'No JSON data received'}), 400
        
        url = data.get('url')
        if not url:
            return jsonify({'error': 'URL is required'}), 400
        
        print(f"Processing URL: {url}")
        
        # Check if another download is in progress
        global download_state
        if download_state['is_downloading']:
            print("Another download is in progress")
            return jsonify({'error': 'Another download is in progress'}), 400
        
        # Extract video info using yt-dlp
        try:
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
                'extract_flat': False,
                'encoding': 'utf-8',
            }
            
            print("Starting yt-dlp extraction...")
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                title = info.get('title', 'Unknown')
                try:
                    print(f"yt-dlp extraction successful: {title}")
                except UnicodeEncodeError:
                    print("yt-dlp extraction successful: [Title contains special characters]")
                
                # Extract relevant metadata
                upload_date = info.get('upload_date', '')
                if upload_date and len(upload_date) == 8:
                    # Format YYYYMMDD to readable date
                    try:
                        year = upload_date[:4]
                        month = upload_date[4:6]
                        day = upload_date[6:8]
                        upload_date = f"{year}-{month}-{day}"
                    except:
                        upload_date = upload_date
                
                metadata = {
                    'url': url,
                    'title': info.get('title', 'Unknown'),
                    'duration': info.get('duration', 0),
                    'uploader': info.get('uploader', 'Unknown'),
                    'view_count': info.get('view_count', 0),
                    'upload_date': upload_date,
                    'thumbnail': info.get('thumbnail', ''),
                    'formats': []
                }
                
                # Get all available formats
                formats = info.get('formats', [])
                if formats:
                    print(f"Found {len(formats)} formats")
                    
                    # Process all video formats (not just the best one)
                    available_formats = []
                    print(f"Processing {len(formats)} formats...")
                    for fmt in formats:
                        print(f"Format: {fmt.get('format_id')} - {fmt.get('ext')} - {fmt.get('resolution')} - vcodec: {fmt.get('vcodec')} - acodec: {fmt.get('acodec')}")
                        # Skip formats without video (but allow audio-only for some platforms)
                        if fmt.get('vcodec') == 'none':
                            continue
                        
                        # For Reddit and similar platforms, allow video-only formats
                        # (audio will be merged during download)
                        if fmt.get('acodec') == 'none' and fmt.get('ext') not in ['mp4', 'webm', 'mkv']:
                            continue
                        
                        # Include all common video formats (be more permissive)
                        if fmt.get('ext') not in ['mp4', 'webm', 'mkv', 'm4a', 'flv', 'avi', 'mov', 'wmv', '3gp']:
                            continue
                        
                        # Use actual file size if available, otherwise estimate
                        filesize = fmt.get('filesize', 0)
                        if filesize == 0 or filesize is None:
                            # Estimate based on duration and resolution
                            duration = info.get('duration', 0)
                            resolution = fmt.get('resolution', '0x0')
                            width, height = 0, 0
                            if resolution and resolution != 'audio only':
                                try:
                                    width, height = map(int, resolution.split('x'))
                                except:
                                    pass
                            
                            # More accurate estimation based on resolution and duration
                            total_pixels = width * height
                            if total_pixels >= 1920 * 1080:  # 1080p or higher
                                filesize = duration * 2.0 * 1024 * 1024  # 2MB per minute
                            elif total_pixels >= 1280 * 720:  # 720p
                                filesize = duration * 1.2 * 1024 * 1024  # 1.2MB per minute
                            elif total_pixels >= 854 * 480:  # 480p
                                filesize = duration * 0.8 * 1024 * 1024  # 0.8MB per minute
                            elif total_pixels >= 640 * 360:  # 360p
                                filesize = duration * 0.5 * 1024 * 1024  # 0.5MB per minute
                            else:  # Lower resolution
                                filesize = duration * 0.3 * 1024 * 1024  # 0.3MB per minute
                        
                        # Only include formats with sufficient information
                        fps = fmt.get('fps')
                        if fps is None or fps == 0:
                            fps = None  # Don't show FPS if not available
                        
                        format_info = {
                            'format_id': fmt.get('format_id'),
                            'ext': fmt.get('ext'),
                            'resolution': fmt.get('resolution', 'Unknown'),
                            'filesize': int(filesize),
                            'fps': fps,
                            'vcodec': fmt.get('vcodec', 'Unknown'),
                            'acodec': fmt.get('acodec', 'Unknown'),
                            'quality': fmt.get('quality', 0),
                            'format_note': fmt.get('format_note', ''),
                            'tbr': fmt.get('tbr', 0)  # Total bitrate
                        }
                        
                        # Skip formats with incomplete critical information
                        if (format_info['format_id'] and 
                            format_info['ext'] and 
                            format_info['resolution'] != 'Unknown' and
                            format_info['filesize'] > 0):
                            available_formats.append(format_info)
                    
                    # Sort formats by resolution (highest first), then by quality, then by filesize
                    def get_resolution_pixels(resolution_str):
                        """Extract total pixels from resolution string for sorting"""
                        if not resolution_str or resolution_str == 'Unknown':
                            return 0
                        try:
                            if 'x' in resolution_str:
                                width, height = map(int, resolution_str.split('x'))
                                return width * height
                        except:
                            pass
                        return 0
                    
                    available_formats.sort(key=lambda x: (
                        get_resolution_pixels(x['resolution']),  # Primary: resolution (pixels)
                        x['tbr'] if x['tbr'] else 0,            # Secondary: bitrate (higher is better)
                        x['quality'] if x['quality'] else 0     # Tertiary: quality
                    ), reverse=True)
                    
                    # Add all formats to metadata
                    metadata['formats'] = available_formats
                    print(f"Added {len(available_formats)} formats to metadata")
                    
                    if available_formats:
                        best_format = available_formats[0]  # First one is highest quality
                        print(f"Best format: {best_format.get('resolution', 'Unknown')} {best_format.get('ext', 'Unknown')}")
                    else:
                        print("No formats available after filtering!")
                
                try:
                    print(f"Returning metadata: {metadata['title']}")
                except UnicodeEncodeError:
                    print("Returning metadata: [Title contains special characters]")
                return jsonify(metadata)
                
        except Exception as e:
            print(f"yt-dlp error: {str(e)}")
            return jsonify({'error': f'Failed to extract video info: {str(e)}'}), 400
        
    except Exception as e:
        print(f"Error in video-info endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/download', methods=['POST'])
def start_download():
    """Start video download"""
    global download_state
    
    if download_state['is_downloading']:
        return jsonify({'error': 'Another download is in progress'}), 400
    
    data = request.get_json()
    url = data.get('url')
    filename = data.get('filename', 'video')
    format_id = data.get('format_id')  # Optional format selection
    
    if not url:
        return jsonify({'error': 'URL is required'}), 400
    
    # Start download in background thread
    thread = threading.Thread(target=download_video, args=(url, filename, format_id))
    thread.daemon = True
    thread.start()
    
    return jsonify({'message': 'Download started'})

def download_video(url, filename, format_id=None):
    """Download video in background thread"""
    global download_state
    
    download_state['is_downloading'] = True
    download_state['progress'] = 0
    download_state['status'] = 'downloading'
    
    try:
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_filename = "".join(c for c in filename if c.isalnum() or c in (' ', '-', '_')).rstrip()
        output_filename = f"{safe_filename}_{timestamp}.%(ext)s"
        output_path = DATA_DIR / output_filename
        
        # Build format selector
        if format_id:
            # Use specific format if provided
            format_selector = format_id
        else:
            # Use fallback format selector that works better across platforms
            format_selector = 'best[ext=mp4]/best[ext=webm]/best[ext=mkv]/best'
        
        ydl_opts = {
            'outtmpl': str(output_path),
            'format': format_selector,
            'progress_hooks': [progress_hook],
            'quiet': True,
            'encoding': 'utf-8',
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            
            # Get actual downloaded file path
            actual_filename = ydl.prepare_filename(info)
            if not os.path.exists(actual_filename):
                # Try with different extensions
                for ext in ['mp4', 'webm', 'mkv']:
                    test_path = actual_filename.rsplit('.', 1)[0] + f'.{ext}'
                    if os.path.exists(test_path):
                        actual_filename = test_path
                        break
            
            # Store download info in database
            conn = sqlite3.connect(DATABASE)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO downloads (url, filename, filepath, filesize, resolution, duration)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                url,
                os.path.basename(actual_filename),
                actual_filename,
                os.path.getsize(actual_filename) if os.path.exists(actual_filename) else 0,
                info.get('resolution', 'Unknown'),
                info.get('duration', 0)
            ))
            conn.commit()
            conn.close()
            
            download_state['current_download'] = {
                'filename': os.path.basename(actual_filename),
                'filepath': actual_filename,
                'filesize': os.path.getsize(actual_filename) if os.path.exists(actual_filename) else 0
            }
            
    except Exception as e:
        download_state['status'] = f'error: {str(e)}'
    finally:
        download_state['is_downloading'] = False
        download_state['progress'] = 100

@app.route('/api/download-status', methods=['GET'])
def get_download_status():
    """Get current download status"""
    return jsonify(download_state)

@app.route('/api/download-file/<int:download_id>', methods=['GET'])
def download_file(download_id):
    """Download file to user's computer"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('SELECT filepath, filename FROM downloads WHERE id = ?', (download_id,))
    result = cursor.fetchone()
    conn.close()
    
    if not result:
        abort(404)
    
    filepath, filename = result
    
    if not os.path.exists(filepath):
        abort(404)
    
    return send_file(filepath, as_attachment=True, download_name=filename)

@app.route('/api/delete-file/<int:download_id>', methods=['DELETE'])
def delete_file(download_id):
    """Delete file from server"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('SELECT filepath FROM downloads WHERE id = ?', (download_id,))
    result = cursor.fetchone()
    
    if not result:
        conn.close()
        return jsonify({'error': 'File not found'}), 404
    
    filepath = result[0]
    
    # Delete file from filesystem
    if os.path.exists(filepath):
        os.remove(filepath)
    
    # Delete record from database
    cursor.execute('DELETE FROM downloads WHERE id = ?', (download_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'File deleted successfully'})

@app.route('/api/rename-file/<int:download_id>', methods=['PUT'])
def rename_file(download_id):
    """Rename a downloaded file"""
    data = request.get_json()
    new_filename = data.get('filename')
    
    if not new_filename:
        return jsonify({'error': 'New filename is required'}), 400
    
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    # Get current file info
    cursor.execute('SELECT filepath, filename FROM downloads WHERE id = ?', (download_id,))
    result = cursor.fetchone()
    
    if not result:
        conn.close()
        return jsonify({'error': 'File not found'}), 404
    
    old_filepath, old_filename = result
    
    if not os.path.exists(old_filepath):
        conn.close()
        return jsonify({'error': 'Physical file not found'}), 404
    
    # Generate new filepath
    old_dir = os.path.dirname(old_filepath)
    old_ext = os.path.splitext(old_filename)[1]
    new_filename_with_ext = new_filename + old_ext
    new_filepath = os.path.join(old_dir, new_filename_with_ext)
    
    # Check if new filename already exists
    if os.path.exists(new_filepath):
        conn.close()
        return jsonify({'error': 'A file with this name already exists'}), 400
    
    try:
        # Rename the physical file
        os.rename(old_filepath, new_filepath)
        
        # Update database record
        cursor.execute('''
            UPDATE downloads 
            SET filename = ?, filepath = ? 
            WHERE id = ?
        ''', (new_filename_with_ext, new_filepath, download_id))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'File renamed successfully'})
        
    except Exception as e:
        conn.close()
        return jsonify({'error': f'Failed to rename file: {str(e)}'}), 500

@app.route('/api/downloads', methods=['GET'])
def list_downloads():
    """List all completed downloads"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, url, filename, filesize, resolution, duration, created_at, status
        FROM downloads 
        ORDER BY created_at DESC
    ''')
    downloads = cursor.fetchall()
    conn.close()
    
    result = []
    for download in downloads:
        result.append({
            'id': download[0],
            'url': download[1],
            'filename': download[2],
            'filesize': download[3],
            'resolution': download[4],
            'duration': download[5],
            'created_at': download[6],
            'status': download[7]
        })
    
    return jsonify(result)

# Serve word lists for random filename generation
@app.route('/api/word-lists/<list_type>')
def get_word_list(list_type):
    """Serve word lists for random filename generation"""
    try:
        if list_type not in ['adjectives', 'nouns']:
            return jsonify({'error': 'Invalid list type'}), 400
        
        file_path = CONFIG_DIR / f"{list_type}.json"
        
        if not file_path.exists():
            return jsonify({'error': 'Word list not found'}), 404
        
        with open(file_path, 'r', encoding='utf-8') as f:
            word_list = json.load(f)
        
        return jsonify(word_list)
    
    except Exception as e:
        print(f"Error loading word list {list_type}: {e}")
        return jsonify({'error': 'Failed to load word list'}), 500

# Serve React frontend
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    """Serve the React frontend for all non-API routes"""
    if path.startswith('api/'):
        # Let API routes be handled by their specific handlers
        abort(404)
    
    # Check if it's a static file request
    if '.' in path and not path.endswith('.html'):
        # Try to serve static file
        try:
            return send_file(f'build/{path}')
        except:
            pass
    
    # Serve the main React app for all other routes
    try:
        return send_file('build/index.html')
    except:
        return "Frontend not built. Please run 'npm run build' first.", 500

# Initialize database when the module is imported
init_database()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
