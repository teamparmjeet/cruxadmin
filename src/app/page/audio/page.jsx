'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';

// --- SVG Icons ---
const PlayIcon = () => (
  <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const formatDuration = (secs) => {
  const minutes = Math.floor(secs / 60);
  const seconds = Math.floor(secs % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

// --- Footer Player ---
function FooterPlayer({ track, onClose }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (track && audioRef.current) {
      audioRef.current.play();
    }
  }, [track]);

  if (!track) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="bg-white border-t border-gray-200 shadow-lg px-4 sm:px-6 py-3">
        <div className="flex items-center gap-4">
          <img src={track.thumbnail} alt={track.title} className="w-14 h-14 rounded-md object-cover" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{track.title}</p>
            <p className="text-sm text-gray-500 truncate">{track.artist}</p>
          </div>
          <audio ref={audioRef} src={track.url} controls className="flex-1 max-w-xl"></audio>
          <button onClick={onClose} className="p-2 text-gray-500 rounded-full hover:bg-gray-100" title="Close Player">
            <CloseIcon />
          </button>
        </div>
      </div>
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

// --- Audio Card ---
function AudioCard({ track, onPlay }) {
  return (
    <div className="group relative bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className="relative">
        <img src={track.thumbnail} alt={track.title} className="w-full h-48 object-cover" />
        <div className="absolute inset-0 bg-black/20"></div>
        <button
          onClick={() => onPlay(track)}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-14 w-14 flex items-center justify-center bg-white/20 text-white rounded-full backdrop-blur-sm scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30"
        >
          <PlayIcon />
        </button>
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded-full">
          {formatDuration(track.duration)}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 truncate">{track.title}</h3>
        <p className="text-sm text-gray-500">{track.artist}</p>
      </div>
    </div>
  );
}

// --- Main Page ---
export default function AllAudioPage() {
  const { data: session } = useSession();
  const [tracks, setTracks] = useState([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAudio = async () => {
      if (!session?.accessToken) return;

      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/music`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        setTracks(res.data.data || []);
      } catch (err) {
        console.error('Error fetching audio:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAudio();
  }, [session]);

  const handlePlayTrack = (track) => {
    setCurrentlyPlaying(track);
  };

  const handleClosePlayer = () => {
    setCurrentlyPlaying(null);
  };

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">All Music</h1>
        <p className="mt-1 text-sm text-gray-600">
          Browse and manage the audio tracks available in your app.
        </p>
      </header>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tracks.map((track) => (
            <AudioCard key={track._id} track={track} onPlay={handlePlayTrack} />
          ))}
        </div>
      )}

      <FooterPlayer track={currentlyPlaying} onClose={handleClosePlayer} />
    </div>
  );
}
