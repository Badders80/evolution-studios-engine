"""
Scraper Service for Evolution Studios Engine
Handles miStable report scraping, video download, and audio extraction
"""
import os
import re
import json
import tempfile
import shutil
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime
import requests
from bs4 import BeautifulSoup
import yt_dlp
import ffmpeg


class MiStableScraper:
    """
    Scraper for miStable trainer reports
    Extracts metadata, downloads videos, and converts to MP3
    """
    
    def __init__(self):
        """Initialize scraper with temporary directory"""
        self.temp_dir = tempfile.mkdtemp(prefix="mistable_")
        print(f"✓ Scraper initialized with temp dir: {self.temp_dir}")
    
    def scrape_report(self, source_url: str, job_id: str) -> Dict[str, Any]:
        """
        Complete scraping workflow for a miStable report
        
        Args:
            source_url: URL to miStable report
            job_id: Job ID for file naming
        
        Returns:
            Dict containing all extracted data and file paths
        """
        print(f"--- Starting scrape for: {source_url}")
        
        try:
            # Step 1: Fetch and parse HTML
            html_content = self._fetch_html(source_url)
            metadata = self._parse_html(html_content)
            
            # Step 2: Download videos
            video_files = []
            for i, video_url in enumerate(metadata['video_urls'], 1):
                video_path = self._download_video(video_url, job_id, i)
                if video_path:
                    video_files.append(video_path)
            
            # Step 3: Extract audio from videos
            audio_files = []
            for video_path in video_files:
                audio_path = self._extract_audio(video_path)
                if audio_path:
                    audio_files.append(audio_path)
            
            # Prepare result
            result = {
                'success': True,
                'job_id': job_id,
                'source_url': source_url,
                'metadata': metadata,
                'video_files': video_files,
                'audio_files': audio_files,
                'temp_dir': self.temp_dir
            }
            
            print(f"✓ Scrape complete: {len(video_files)} videos, {len(audio_files)} audio files")
            return result
            
        except Exception as e:
            print(f"✗ Scrape failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'job_id': job_id,
                'source_url': source_url
            }
    
    def _fetch_html(self, url: str) -> str:
        """
        Fetch HTML content from URL
        
        Args:
            url: URL to fetch
        
        Returns:
            HTML content as string
        """
        print(f"Fetching HTML from: {url}")
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        print(f"✓ Fetched {len(response.text)} bytes")
        return response.text
    
    def _parse_html(self, html: str) -> Dict[str, Any]:
        """
        Parse HTML to extract metadata
        
        Args:
            html: HTML content
        
        Returns:
            Dict containing extracted metadata
        """
        print("Parsing HTML for metadata...")
        
        soup = BeautifulSoup(html, 'lxml')
        
        # Extract trainer logo
        trainer_logo_url = self._extract_trainer_logo(soup)
        
        # Extract video URLs (Vimeo embeds)
        video_urls = self._extract_video_urls(soup)
        
        # Extract horse name and trainer name
        horse_name = self._extract_horse_name(soup)
        trainer_name = self._extract_trainer_name(soup)
        
        # Extract report text
        report_text = self._extract_report_text(soup)
        
        metadata = {
            'trainer_logo_url': trainer_logo_url,
            'video_urls': video_urls,
            'horse_name': horse_name,
            'trainer_name': trainer_name,
            'report_text': report_text,
            'video_count': len(video_urls)
        }
        
        print(f"✓ Extracted metadata: {metadata['video_count']} videos, horse: {horse_name}")
        return metadata
    
    def _extract_trainer_logo(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract trainer logo URL from HTML"""
        # Look for logo in header/banner
        logo_img = soup.find('img', {'class': re.compile(r'logo|brand|trainer', re.I)})
        if logo_img and logo_img.get('src'):
            return logo_img['src']
        
        # Fallback: Look for any img in header
        header = soup.find(['header', 'div'], {'class': re.compile(r'header|banner', re.I)})
        if header:
            img = header.find('img')
            if img and img.get('src'):
                return img['src']
        
        return None
    
    def _extract_video_urls(self, soup: BeautifulSoup) -> List[str]:
        """Extract Vimeo video URLs from iframes"""
        video_urls = []
        
        # Find all iframes with Vimeo URLs
        iframes = soup.find_all('iframe', {'src': re.compile(r'vimeo\.com', re.I)})
        
        for iframe in iframes:
            src = iframe.get('src')
            if src:
                # Ensure full URL
                if src.startswith('//'):
                    src = 'https:' + src
                elif src.startswith('/'):
                    src = 'https://vimeo.com' + src
                
                video_urls.append(src)
        
        print(f"✓ Found {len(video_urls)} Vimeo videos")
        return video_urls
    
    def _extract_horse_name(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract horse name from page title or heading"""
        # Try page title first
        title = soup.find('title')
        if title:
            text = title.get_text()
            # Pattern: "Horse Name | Trainer Name"
            if '|' in text:
                return text.split('|')[0].strip()
            return text.strip()
        
        # Try h1 heading
        h1 = soup.find('h1')
        if h1:
            return h1.get_text().strip()
        
        return "Unknown Horse"
    
    def _extract_trainer_name(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract trainer name from page"""
        # Try page title
        title = soup.find('title')
        if title:
            text = title.get_text()
            if '|' in text:
                return text.split('|')[1].strip()
        
        # Try to find trainer name in text
        trainer_elem = soup.find(text=re.compile(r'trainer', re.I))
        if trainer_elem:
            return trainer_elem.strip()
        
        return "Unknown Trainer"
    
    def _extract_report_text(self, soup: BeautifulSoup) -> str:
        """Extract report text content"""
        # Remove script and style elements
        for script in soup(['script', 'style']):
            script.decompose()
        
        # Get text from main content area
        main_content = soup.find(['main', 'article', 'div'], {'class': re.compile(r'content|report|main', re.I)})
        
        if main_content:
            text = main_content.get_text(separator='\n', strip=True)
        else:
            text = soup.get_text(separator='\n', strip=True)
        
        # Clean up whitespace
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        return '\n'.join(lines)
    
    def _extract_vimeo_config(self, video_url: str) -> Optional[Dict]:
        """
        Extract Vimeo player config with direct stream URLs
        
        Args:
            video_url: Vimeo player URL
            
        Returns:
            Player config dict with HLS/DASH URLs
        """
        try:
            print(f"→ Fetching Vimeo player config from: {video_url}")
            response = requests.get(video_url, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            })
            response.raise_for_status()
            
            # Extract window.playerConfig JSON
            # Find the start of the config
            start_marker = 'window.playerConfig = '
            start_idx = response.text.find(start_marker)
            if start_idx == -1:
                print(f"✗ Could not find playerConfig start marker")
                return None
            
            start_idx += len(start_marker)
            
            # Find the matching closing brace
            brace_count = 0
            in_string = False
            escape_next = False
            end_idx = start_idx
            
            for i, char in enumerate(response.text[start_idx:], start=start_idx):
                if escape_next:
                    escape_next = False
                    continue
                    
                if char == '\\':
                    escape_next = True
                    continue
                    
                if char == '"' and not in_string:
                    in_string = True
                elif char == '"' and in_string:
                    in_string = False
                elif not in_string:
                    if char == '{':
                        brace_count += 1
                    elif char == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            end_idx = i + 1
                            break
            
            if brace_count == 0:
                config_json = response.text[start_idx:end_idx]
                config = json.loads(config_json)
                print(f"✓ Extracted player config ({len(config_json)} chars)")
                return config
            else:
                print(f"✗ Could not find playerConfig in page")
                return None
                
        except Exception as e:
            print(f"✗ Failed to extract Vimeo config: {e}")
            return None
    
    def _download_video(self, video_url: str, job_id: str, video_index: int) -> Optional[str]:
        """
        Download video from Vimeo using direct stream URLs or yt-dlp fallback
        
        Args:
            video_url: Vimeo video URL
            job_id: Job ID for naming
            video_index: Index of video (for multiple videos)
        
        Returns:
            Path to downloaded video file
        """
        print(f"Downloading video {video_index} from: {video_url}")
        
        # Try method 1: Extract player config and download HLS stream
        config = self._extract_vimeo_config(video_url)
        if config:
            try:
                # Get HLS URL from config
                hls_url = None
                if 'request' in config and 'files' in config['request']:
                    files = config['request']['files']
                    if 'hls' in files and 'cdns' in files['hls']:
                        cdns = files['hls']['cdns']
                        # Try akfire_interconnect_quic first, then fastly_skyfire
                        for cdn_name in ['akfire_interconnect_quic', 'fastly_skyfire']:
                            if cdn_name in cdns and 'url' in cdns[cdn_name]:
                                hls_url = cdns[cdn_name]['url']
                                print(f"✓ Found HLS URL from {cdn_name}")
                                break
                
                if hls_url:
                    # Download using yt-dlp with HLS URL
                    output_template = os.path.join(
                        self.temp_dir,
                        f"{job_id}-video-{video_index}.%(ext)s"
                    )
                    
                    ydl_opts = {
                        'format': 'best',
                        'outtmpl': output_template,
                        'quiet': False,
                        'http_headers': {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                            'Referer': 'https://mistable.com/'
                        }
                    }
                    
                    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                        info = ydl.extract_info(hls_url, download=True)
                        filename = ydl.prepare_filename(info)
                    
                    print(f"✓ Downloaded via HLS: {filename}")
                    return filename
                    
            except Exception as e:
                print(f"⚠ HLS download failed: {e}, trying fallback...")
        
        # Method 2: Fallback to standard yt-dlp
        try:
            output_template = os.path.join(
                self.temp_dir,
                f"{job_id}-video-{video_index}.%(ext)s"
            )
            
            ydl_opts = {
                'format': 'best[ext=mp4]',
                'outtmpl': output_template,
                'quiet': False,
                'no_warnings': False,
                'extract_flat': False,
                'http_headers': {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://mistable.com/'
                }
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(video_url, download=True)
                filename = ydl.prepare_filename(info)
            
            print(f"✓ Downloaded via yt-dlp: {filename}")
            return filename
            
        except Exception as e:
            print(f"✗ Failed to download video {video_index}: {e}")
            return None
    
    def _extract_audio(self, video_path: str) -> Optional[str]:
        """
        Extract audio from video using FFmpeg
        
        Args:
            video_path: Path to video file
        
        Returns:
            Path to extracted audio file
        """
        print(f"Extracting audio from: {video_path}")
        
        try:
            # Output path (same name, .mp3 extension)
            audio_path = os.path.splitext(video_path)[0] + '.mp3'
            
            # Extract audio with FFmpeg
            (
                ffmpeg
                .input(video_path)
                .output(
                    audio_path,
                    **{
                        'q:a': 0,      # Highest quality
                        'map': 'a',    # Map audio stream only
                        'ar': 16000,   # 16kHz sample rate (optimal for Whisper)
                        'ac': 1        # Mono audio
                    }
                )
                .overwrite_output()
                .run(quiet=True, capture_stdout=True, capture_stderr=True)
            )
            
            print(f"✓ Extracted audio: {audio_path}")
            return audio_path
            
        except ffmpeg.Error as e:
            print(f"✗ FFmpeg error: {e.stderr.decode()}")
            return None
        except Exception as e:
            print(f"✗ Failed to extract audio: {e}")
            return None
    
    def cleanup(self):
        """Clean up temporary directory"""
        if os.path.exists(self.temp_dir):
            shutil.rmtree(self.temp_dir)
            print(f"✓ Cleaned up temp dir: {self.temp_dir}")


class SupabaseUploader:
    """
    Handles uploading scraped media to Supabase Storage
    """
    
    def __init__(self, supabase_client):
        """
        Initialize uploader with Supabase client
        
        Args:
            supabase_client: Initialized Supabase client
        """
        self.client = supabase_client
    
    def upload_media(
        self,
        user_id: str,
        job_id: str,
        video_files: List[str],
        audio_files: List[str]
    ) -> Dict[str, List[str]]:
        """
        Upload video and audio files to Supabase Storage
        
        Args:
            user_id: User ID for folder organization
            job_id: Job ID for folder organization
            video_files: List of local video file paths
            audio_files: List of local audio file paths
        
        Returns:
            Dict with lists of uploaded file paths
        """
        print(f"Uploading {len(video_files)} videos and {len(audio_files)} audio files...")
        
        uploaded_videos = []
        uploaded_audio = []
        
        # Upload videos
        for i, video_path in enumerate(video_files, 1):
            storage_path = f"{user_id}/{job_id}/video-{i}.mp4"
            url = self._upload_file('videos', video_path, storage_path)
            if url:
                uploaded_videos.append(url)
        
        # Upload audio files
        for i, audio_path in enumerate(audio_files, 1):
            storage_path = f"{user_id}/{job_id}/audio-{i}.mp3"
            url = self._upload_file('audio', audio_path, storage_path)
            if url:
                uploaded_audio.append(url)
        
        print(f"✓ Uploaded {len(uploaded_videos)} videos, {len(uploaded_audio)} audio files")
        
        return {
            'video_urls': uploaded_videos,
            'audio_urls': uploaded_audio
        }
    
    def _upload_file(self, bucket: str, local_path: str, storage_path: str) -> Optional[str]:
        """
        Upload a single file to Supabase Storage
        
        Args:
            bucket: Storage bucket name
            local_path: Local file path
            storage_path: Path in storage bucket
        
        Returns:
            Public URL of uploaded file
        """
        try:
            with open(local_path, 'rb') as f:
                file_data = f.read()
            
            # Upload to Supabase Storage
            response = self.client.storage.from_(bucket).upload(
                storage_path,
                file_data,
                file_options={'content-type': 'video/mp4' if bucket == 'videos' else 'audio/mpeg'}
            )
            
            # Get public URL
            public_url = self.client.storage.from_(bucket).get_public_url(storage_path)
            
            print(f"✓ Uploaded: {storage_path}")
            return public_url
            
        except Exception as e:
            print(f"✗ Upload failed for {storage_path}: {e}")
            return None
