import React, { useState, useEffect } from 'react';
import { Plus, X, Eye, AlertCircle, CheckCircle, Loader2, Youtube } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DOMPurify from 'isomorphic-dompurify';

interface YoutubeVideo {
  id?: string;
  youtubeUrl: string;
  videoId: string;
  title?: string;
  thumbnail?: string;
  description?: string;
  duration?: number;
  displayOrder?: number;
}

interface YoutubeGalleryEditorProps {
  sellerId: string;
  onSave?: (videos: YoutubeVideo[]) => void;
  isLoading?: boolean;
}

// Helper to extract video ID from YouTube URL
const extractVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

// Helper to sanitize and validate YouTube URLs
const sanitizeYoutubeUrl = (url: string): string | null => {
  const videoId = extractVideoId(url);
  if (!videoId) return null;

  // Return officially embedded URL
  return `https://www.youtube.com/embed/${videoId}`;
};

// Generate thumbnail URL from video ID
const getThumbnailUrl = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

export const YoutubeGalleryEditor: React.FC<YoutubeGalleryEditorProps> = ({
  sellerId,
  onSave,
  isLoading = false,
}) => {
  const [videos, setVideos] = useState<YoutubeVideo[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // Load existing videos on mount
  useEffect(() => {
    loadVideos();
  }, [sellerId]);

  const loadVideos = async () => {
    try {
      const response = await fetch(`/api/seller/${sellerId}/youtube`);
      if (response.ok) {
        const data = await response.json();
        setVideos(data);
      }
    } catch (error) {
      console.error('Failed to load videos:', error);
    }
  };

  const validateAndPreviewUrl = (url: string) => {
    setUrlError('');
    setPreviewUrl('');

    if (!url.trim()) {
      return;
    }

    setIsValidating(true);
    const videoId = extractVideoId(url);

    if (!videoId) {
      setUrlError('Invalid YouTube URL. Please use a valid YouTube video link.');
      setIsValidating(false);
      return;
    }

    // Check for duplicates
    if (videos.some((v) => v.videoId === videoId)) {
      setUrlError('This video is already in your gallery.');
      setIsValidating(false);
      return;
    }

    const sanitized = sanitizeYoutubeUrl(url);
    if (sanitized) {
      setPreviewUrl(sanitized);
      setIsValidating(false);
    } else {
      setUrlError('Failed to process YouTube URL.');
      setIsValidating(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewUrl(value);
    validateAndPreviewUrl(value);
  };

  const addVideo = async () => {
    if (!newUrl.trim()) {
      setUrlError('Please enter a YouTube URL');
      return;
    }

    const videoId = extractVideoId(newUrl);
    if (!videoId) {
      setUrlError('Invalid YouTube URL');
      return;
    }

    if (videos.some((v) => v.videoId === videoId)) {
      setUrlError('This video is already in your gallery');
      return;
    }

    const newVideo: YoutubeVideo = {
      youtubeUrl: newUrl,
      videoId,
      title: '',
      thumbnail: getThumbnailUrl(videoId),
      displayOrder: videos.length,
    };

    try {
      // POST to new path which includes sellerId in URL
      const response = await fetch(`/api/seller/${sellerId}/youtube/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtubeUrl: newUrl,
          videoId,
        }),
      });

      if (response.ok) {
        const savedVideo = await response.json();
        setVideos([...videos, savedVideo]);
        setNewUrl('');
        setPreviewUrl('');
        toast.success('Video added to gallery!');
      } else {
        toast.error('Failed to add video');
      }
    } catch (error) {
      console.error('Error adding video:', error);
      toast.error('Error adding video to gallery');
    }
  };

  const removeVideo = async (videoId: string) => {
    try {
      const response = await fetch(`/api/seller/${sellerId}/youtube/${videoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setVideos(videos.filter((v) => v.videoId !== videoId));
        toast.success('Video removed from gallery');
      } else {
        toast.error('Failed to remove video');
      }
    } catch (error) {
      console.error('Error removing video:', error);
      toast.error('Error removing video');
    }
  };

  const saveOrder = async () => {
    try {
      if (onSave) {
        onSave(videos);
      }
      toast.success('Gallery order saved!');
    } catch (error) {
      console.error('Error saving order:', error);
      toast.error('Error saving gallery order');
    }
  };

  const moveVideo = (index: number, direction: 'up' | 'down') => {
    const newVideos = [...videos];
    if (direction === 'up' && index > 0) {
      [newVideos[index], newVideos[index - 1]] = [newVideos[index - 1], newVideos[index]];
    } else if (direction === 'down' && index < newVideos.length - 1) {
      [newVideos[index], newVideos[index + 1]] = [newVideos[index + 1], newVideos[index]];
    }
    setVideos(newVideos);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Youtube className="w-6 h-6 text-red-600" />
        <h2 className="text-2xl font-bold">YouTube Portfolio Gallery</h2>
      </div>

      {/* Info Message */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold">Showcase Your Work</p>
          <p className="mt-1">
            Add up to 5 YouTube videos to showcase your products, workshop tours, or customer testimonials.
            This helps build trust with potential buyers.
          </p>
        </div>
      </div>

      {/* Add New Video */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Add YouTube Video</h3>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">YouTube URL *</label>
          <input
            type="url"
            value={newUrl}
            onChange={handleUrlChange}
            placeholder="https://www.youtube.com/watch?v=..."
            disabled={videos.length >= 5}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100"
          />
          {urlError && <p className="text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {urlError}</p>}
        </div>

        {/* Preview */}
        {previewUrl && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
            <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={previewUrl}
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Add Button */}
        <button
          onClick={addVideo}
          disabled={videos.length >= 5 || !previewUrl || isLoading}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add Video to Gallery ({videos.length}/5)
            </>
          )}
        </button>
      </div>

      {/* Current Gallery */}
      {videos.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Your Gallery ({videos.length})</h3>
          <div className="space-y-2">
            {videos.map((video, index) => (
              <div
                key={video.videoId}
                className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-500">#{index + 1}</span>
                    <a
                      href={video.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {video.title || 'Untitled Video'} <Eye className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{video.videoId}</p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveVideo(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-600 hover:text-gray-900 disabled:text-gray-300"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveVideo(index, 'down')}
                    disabled={index === videos.length - 1}
                    className="p-1 text-gray-600 hover:text-gray-900 disabled:text-gray-300"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removeVideo(video.videoId)}
                    className="p-1 text-red-600 hover:text-red-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Save Order Button */}
          <button
            onClick={saveOrder}
            disabled={isLoading}
            className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Save Gallery Order
          </button>
        </div>
      )}

      {/* Empty State */}
      {videos.length === 0 && !previewUrl && (
        <div className="text-center py-8 border border-gray-200 rounded-lg bg-gray-50">
          <Youtube className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No videos in your gallery yet</p>
          <p className="text-sm text-gray-400">Add YouTube videos to help buyers learn more about your products</p>
        </div>
      )}
    </div>
  );
};
