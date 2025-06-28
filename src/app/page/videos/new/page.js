'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useSession } from 'next-auth/react';

// Icons...
const UploadCloudIcon = () => <svg className="w-10 h-10 mb-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="M12 12v9" /><path d="m16 16-4-4-4 4" /></svg>;
const MusicIcon = () => <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>;
const FilmIcon = () => <svg className="w-8 h-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M7 3v18" /><path d="M17 3v18" /><path d="M3 7h18" /><path d="M3 12h18" /><path d="M3 17h18" /></svg>;
const CheckCircleIcon = ({ className }) => <svg className={className || "w-8 h-8 text-green-500"} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>;
const ChevronRightIcon = () => <svg className="w-4 h-4 ml-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>;
const ChevronLeftIcon = () => <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18H9l-6-6 6-6h6" /></svg>;


export default function AddNewVideoPage() {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState('upload');
  const [videoFile, setVideoFile] = useState(null);
  const [videoSrc, setVideoSrc] = useState('');
  const [selectedMusic, setSelectedMusic] = useState('Original Audio');
  const [caption, setCaption] = useState('');
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  // Newly added state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileAccepted = (file) => {
    setVideoFile(file);
    setVideoSrc(URL.createObjectURL(file));
    setUploadStatus('uploading');

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          setUploadStatus('success');
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };
  const onThumbnailDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  }, []);

  const {
    getRootProps: getThumbnailRootProps,
    getInputProps: getThumbnailInputProps,
    isDragActive: isThumbnailDragActive,
  } = useDropzone({
    onDrop: onThumbnailDrop,
    accept: {
      'image/*': []
    },
    multiple: false,
  });

  const handleNextStep = (step) => setCurrentStep(step);
  const handleBackStep = (step) => setCurrentStep(step);

  const handleFinalUpload = async () => {
    if (!title || !videoFile) {
      return alert('Please provide a title and select a video.');
    }

    setUploading(true);
    setUploadProgress(10);

    try {
      const videoFormData = new FormData();
      videoFormData.append('file', videoFile);
      videoFormData.append('folder', 'videos');

      const videoRes = await axios.post('/api/upload/audio', videoFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent * 0.5);
        },
      });

      const videoUrl = videoRes.data.file;
      let thumbnailUrl = '';
      if (thumbnailFile) {
        const thumbFormData = new FormData();
        thumbFormData.append('file', thumbnailFile);
        thumbFormData.append('folder', 'thumbnails');

        const thumbRes = await axios.post('/api/upload/audio', thumbFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        thumbnailUrl = thumbRes.data.file;
      }

      // Need Changes
      const payload = {
        user: session.user.id,
        username: session.user.username,
        title,
        category,
        description,
        caption,
        videoUrl,
        status: "Published",
        duration: videoDuration,
        thumbnailUrl,

       ...(selectedMusic !== 'Original Audio' ? { music: selectedMusic } : {})

      };
      // Need Changes


      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/reels/upload`, payload, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      alert('Video uploaded successfully!');
      console.log('Uploaded payload:', payload);

      setCurrentStep('upload');
      setVideoFile(null);
      setTitle('');
      setDescription('');
      setCategory('');
      setCaption('');
      setThumbnailUrl('');
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed!');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const tabStatuses = ['upload', 'music', 'details'];
  const tabLabels = ['1. Upload', '2. Music', '3. Details & Post'];

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">Add New Video</h1>
        <p className="mt-1 text-sm text-gray-600">Follow the steps to upload and publish a new video.</p>
        {videoSrc && (
          <video
            src={videoSrc}
            className="hidden"
            onLoadedMetadata={(e) => {
              const duration = e.target.duration;
              setVideoDuration(Math.floor(duration));
            }}
          />
        )}

        <div className="w-full pt-4">
          <div className="grid w-full grid-cols-3 p-1 bg-gray-100 rounded-lg">
            {tabStatuses.map((status, index) => (
              <button
                key={status}
                onClick={() => { if (videoFile) setCurrentStep(status); }}
                disabled={!videoFile && status !== 'upload'}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${currentStep === status
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed'
                  }`}
              >
                {tabLabels[index]}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="p-6">
        {currentStep === 'upload' && (
          <VideoUploadStep
            onFileAccepted={handleFileAccepted}
            onNext={() => handleNextStep('music')}
            status={uploadStatus}
            progress={uploadProgress}
            videoSrc={videoSrc}
            fileName={videoFile?.name}
          />
        )}
        {currentStep === 'music' && (
          <MusicSelectionStep
            onNext={() => handleNextStep('details')}
            onBack={() => handleBackStep('upload')}
            onMusicSelect={setSelectedMusic}
            selectedMusic={selectedMusic}
          />
        )}
        {currentStep === 'details' && (
          <DetailsStep
            videoSrc={videoSrc}
            caption={caption}
            onCaptionChange={setCaption}
            onBack={() => handleBackStep('music')}
            onFinalUpload={handleFinalUpload}
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            category={category}
            setCategory={setCategory}
            uploading={uploading}

            getThumbnailRootProps={getThumbnailRootProps}
            getThumbnailInputProps={getThumbnailInputProps}
            isThumbnailDragActive={isThumbnailDragActive}
            thumbnailPreview={thumbnailPreview}
          />
        )}
      </div>
    </div>
  );
}

// Reuse your existing components like VideoUploadStep, MusicSelectionStep...
function VideoUploadStep({ onFileAccepted, onNext, status, progress, videoSrc, fileName }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      onFileAccepted(acceptedFiles[0]);
    }
  }, [onFileAccepted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'video/*': ['.mp4', '.mov', '.avi'] }, multiple: false,
  });

  const dropzoneClasses = `flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
    }`;

  if (status === 'uploading' || status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center w-full">
        <div className="w-full max-w-lg p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            {status === 'success' ? <CheckCircleIcon /> : <FilmIcon />}
            <div>
              <p className="text-sm font-medium leading-none text-gray-900 line-clamp-1">{fileName?.slice(0, 15) || ' '}</p>
              <p className="text-xs text-gray-500">
                {status === 'success' ? 'File ready to proceed' : 'Uploading...'}
              </p>
            </div>
          </div>
          <div>
            {status === 'uploading' && (
              // This is our custom "Progress" bar
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            )}
            {status === 'success' && (
              <div className="flex flex-col gap-4">
                <a href={videoSrc} target="_blank" rel="noopener noreferrer" className="relative block rounded-lg overflow-hidden group">
                  <video src={videoSrc} className="w-full h-auto" muted loop playsInline />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white font-semibold">Click to play in new tab</p>
                  </div>
                </a>
                <button onClick={onNext} className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Next <ChevronRightIcon />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div {...getRootProps()} className={dropzoneClasses}>
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
        <UploadCloudIcon />
        <p className="mb-2 text-sm text-gray-500">
          <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-gray-500">MP4, MOV, AVI (MAX. 500MB)</p>
      </div>
    </div>
  );
}
const PlayIcon = () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21" /></svg>;
const CloseIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;

function FooterPlayer({ track, onClose }) {
  const audioRef = useRef(null);
  useEffect(() => { if (track && audioRef.current) audioRef.current.play(); }, [track]);
  if (!track) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow z-50 animate-slide-up">
      <div className="flex items-center gap-4">
        {track.thumbnail && <img src={track.thumbnail} className="w-12 h-12 rounded object-cover" />}
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{track.title}</p>
          <p className="text-sm text-gray-500 truncate">{track.artist}</p>
        </div>
        <audio ref={audioRef} src={track.url} controls className="max-w-xs" />
        <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><CloseIcon /></button>
      </div>
      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  );
}

function MusicSelectionStep({ onNext, onBack, onMusicSelect, selectedMusic }) {
  const { data: session } = useSession();
  const [tracks, setTracks] = useState([]);
  const [playingTrack, setPlayingTrack] = useState(null);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/music`, {
          headers: { Authorization: `Bearer ${session?.accessToken}` }
        });
        setTracks([{ title: 'Original Audio', _id: '' ,thumbnail:'https://musicshort.s3.us-east-1.amazonaws.com/thumbnails/1ac4bcff-3ee4-43ea-90c0-08e4ea756409-360_F_310933353_V6xBjySNr1NrChGN0x7jLzBcLtn6UTAq.jpg'}, ...(res.data?.data || [])]);
      } catch (err) {
        console.error('Error fetching music:', err);
      }
    };
    fetchTracks();
  }, [session]);

  const handlePreview = (track) => setPlayingTrack(track._id === playingTrack?._id ? null : track);
  const handleClosePlayer = () => setPlayingTrack(null);

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto p-4">
      <h3 className="text-2xl font-semibold text-gray-900">🎵 Choose Your Music</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tracks.map((track) => {
          const isSelected = selectedMusic === track._id;

          return (
            <div
              key={track._id}
              onClick={() => onMusicSelect(track._id)}
              className={`relative group cursor-pointer rounded-xl border p-4 shadow-sm transition-all duration-300 ${isSelected
                  ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-400'
                  : 'border-gray-200 bg-white hover:shadow-md'
                }`}
            >
              {/* Thumbnail */}
              <div className="relative h-36 mb-3 overflow-hidden rounded-lg">
                <img
                  src={track.thumbnail}
                  alt={track.title}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreview(track);
                  }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/20 text-white rounded-full p-3 backdrop-blur-md hover:bg-white/30 transition"
                  title="Preview"
                >
                  <PlayIcon />
                </button>

                {isSelected && (
                  <CheckCircleIcon className="absolute top-2 right-2 w-6 h-6 text-green-400 bg-white rounded-full shadow" />
                )}
              </div>

              {/* Title & Artist */}
              <h4 className="font-semibold text-gray-800 truncate">{track.title}</h4>
              <p className="text-sm text-gray-500 truncate">{track.artist}</p>
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          <ChevronLeftIcon className="w-4 h-4 mr-2" /> Back
        </button>
        <button
          onClick={onNext}
          className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          Next <ChevronRightIcon className="w-4 h-4 ml-2" />
        </button>
      </div>

      {/* Footer Player */}
      <FooterPlayer track={playingTrack} onClose={handleClosePlayer} />
    </div>

  );
}
// Updated DetailsStep:
function DetailsStep({
  videoSrc, caption, onCaptionChange, onBack, onFinalUpload,
  title, setTitle, description, setDescription, category, setCategory, uploading,
  getThumbnailRootProps, getThumbnailInputProps, isThumbnailDragActive, thumbnailPreview
}) {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add Final Details</h3>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail</label>
            <div
              {...getThumbnailRootProps()}
              className={`flex justify-center items-center h-48 border-2 border-dashed rounded-lg cursor-pointer transition-all ${isThumbnailDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
                }`}
            >
              <input {...getThumbnailInputProps()} />
              {thumbnailPreview ? (
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center text-gray-500">
                  <UploadCloudIcon />
                  <p>Drop image here, or click to select</p>
                </div>
              )}
            </div>
          </div>

          <input
            type="text"
            placeholder="Video Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-2 border rounded-lg text-sm"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-2 border rounded-lg text-sm"
          >
            <option value="">Select category</option>
            <option value="Music">Music</option>
            <option value="Cooking">Cooking</option>
            <option value="Education">Education</option>
            <option value="Travel">Travel</option>
            <option value="Comedy">Comedy</option>
          </select>





          <textarea
            placeholder="Description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="p-2 border rounded-lg text-sm"
          />
          <textarea
            placeholder="Caption..."
            value={caption}
            onChange={(e) => onCaptionChange(e.target.value)}
            rows={3}
            className="p-2 border rounded-lg text-sm"
          />

        </div>

        <div className="flex justify-between mt-8">
          <button onClick={onBack} className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
            <ChevronLeftIcon /> Back
          </button>
          <button
            onClick={onFinalUpload}
            disabled={uploading}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 border border-transparent rounded-md shadow-sm"
          >
            {uploading ? 'Uploading...' : 'Post Video'}
          </button>
        </div>
      </div>
      <div className="hidden md:block">
        <p className="font-medium text-sm mb-2 text-center text-gray-700">Live Preview</p>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <video src={videoSrc} className="w-full h-auto" muted loop autoPlay playsInline />
        </div>
      </div>
    </div>
  );
}
