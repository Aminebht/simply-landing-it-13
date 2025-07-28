import React, { useState, useRef, useEffect } from 'react';

interface VideoPlayerProps {
  url?: string;
  className?: string;
  style?: React.CSSProperties;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onUrlChange?: (url: string) => void;
  isPreviewMode?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  className = '',
  style = {},
  autoplay = false,
  muted = true,
  controls = true,
  onPlay,
  onPause,
  onUrlChange,
  isPreviewMode = false
}) => {
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLIFrameElement>(null);

  // Sync URL prop with internal state
  useEffect(() => {
    setVideoUrlInput(url || '');
  }, [url]);

  // Extract video ID and platform from URL
  const getVideoInfo = (url: string) => {
    if (!url) return { platform: null, id: null, embedUrl: null };

    // YouTube patterns
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    
    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&mute=${muted ? 1 : 0}&controls=${controls ? 1 : 0}&rel=0`;
      return { platform: 'youtube', id: videoId, embedUrl };
    }

    // Vimeo patterns
    const vimeoRegex = /(?:vimeo\.com\/)(?:.*\/)?(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    
    if (vimeoMatch) {
      const videoId = vimeoMatch[1];
      const embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=${autoplay ? 1 : 0}&muted=${muted ? 1 : 0}&controls=${controls ? 1 : 0}`;
      return { platform: 'vimeo', id: videoId, embedUrl };
    }

    // Direct video file URLs
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return { platform: 'direct', id: null, embedUrl: url };
    }

    return { platform: null, id: null, embedUrl: null };
  };

  const videoInfo = getVideoInfo(url || '');

  const handlePlayClick = () => {
    if (videoInfo.embedUrl) {
      setIsPlaying(true);
      onPlay?.();
    }
  };

  const handleIntegrateVideo = () => {
    setShowPopup(true);
  };

  const handleVideoUrlSubmit = () => {

    if (videoUrlInput.trim()) {
      onUrlChange?.(videoUrlInput.trim());
      setShowPopup(false);
      // Don't clear videoUrlInput here - let it be controlled by the url prop
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleVideoUrlSubmit();
    }
  };

  const handleCancelPopup = () => {
    setShowPopup(false);
    // Reset to the current URL if it exists, otherwise clear
    setVideoUrlInput(url || '');
  };

  const renderMockup = () => {
    return (
      <div 
        className={`relative bg-gray-900 flex items-center justify-center ${className}`} 
        style={style}
        onMouseEnter={() => !isPreviewMode && setIsHovered(true)}
        onMouseLeave={() => !isPreviewMode && setIsHovered(false)}
      >
        {/* Video mockup background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-gradient-to-r from-blue-500/30 to-purple-500/30"></div>
          </div>
        </div>
        
        {/* Mockup content */}
        <div className="relative z-10 text-center text-white">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-lg font-medium mb-2">Video Player</p>
          <p className="text-sm text-gray-300">Mockup Preview</p>
        </div>

        {/* Hover overlay */}
        {isHovered && !isPreviewMode && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20 transition-all duration-200">
            <button
              onClick={handleIntegrateVideo}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Integrate Video
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderPopup = () => {
    if (!showPopup || isPreviewMode) return null;

    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={(e) => {
          // Only close if clicking the backdrop, not the modal content
          if (e.target === e.currentTarget) {
            handleCancelPopup();
          }
        }}
      >
        <div 
          className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          onClick={(e) => e.stopPropagation()} // Prevent backdrop click when clicking inside modal
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Add Video URL</h3>
          
          <form onSubmit={(e) => { e.preventDefault(); handleVideoUrlSubmit(); }}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video URL
              </label>
              <input
                type="url"
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                onKeyDown={handleKeyPress}
                onPaste={(e) => {
                  // Prevent any unwanted side effects from pasting
                  e.stopPropagation();
                }}
                placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoComplete="off"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supports YouTube and Vimeo video URLs
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleCancelPopup}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!videoUrlInput.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Video
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // renderPlayButton removed - using native video player controls

  // renderVideoPreview removed - using embedded video player directly

  const renderVideo = () => {
    if (!videoInfo.embedUrl) return null;

    if (videoInfo.platform === 'direct') {
      return (
        <video
          ref={videoRef as any}
          src={videoInfo.embedUrl}
          className="w-full h-full object-cover"
          autoPlay={autoplay}
          muted={muted}
          controls={controls}
          onPlay={() => {
            setIsPlaying(true);
            onPlay?.();
          }}
          onPause={() => {
            setIsPlaying(false);
            onPause?.();
          }}
        />
      );
    }

    return (
      <iframe
        ref={videoRef}
        src={videoInfo.embedUrl}
        className="w-full h-full"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={() => {
          if (autoplay) {
            setIsPlaying(true);
            onPlay?.();
          }
        }}
      />
    );
  };

  // If no URL is provided, show the mockup
  if (!url || !videoInfo.embedUrl) {
    return (
      <>
        {renderMockup()}
        {renderPopup()}
      </>
    );
  }

  // If URL is provided, show the real video player directly
  return (
    <>
      <div 
        className={`relative ${className}`} 
        style={style}
        onMouseEnter={() => !isPreviewMode && setIsHovered(true)}
        onMouseLeave={() => !isPreviewMode && setIsHovered(false)}
      >
        {renderVideo()}
        
        {/* Hover overlay for changing video URL */}
        {isHovered && !isPreviewMode && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-20 transition-all duration-200">
            <button
              onClick={handleIntegrateVideo}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Change Video
            </button>
          </div>
        )}
      </div>
      {renderPopup()}
    </>
  );
};

export default VideoPlayer;
