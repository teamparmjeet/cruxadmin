'use client';
import axios from 'axios';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useSession } from 'next-auth/react';

// Icons
const MusicIcon = () => <svg className="w-5 h-5 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>;
const UserIcon = () => <svg className="w-5 h-5 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const ClockIcon = () => <svg className="w-5 h-5 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
const ImageIcon = () => <svg className="w-10 h-10 mb-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>;
const UploadIcon = () => <svg className="w-10 h-10 mb-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;

const formatDuration = (secs) => {
  const minutes = Math.floor(secs / 60);
  const seconds = Math.floor(secs % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export default function AddNewAudioPage() {
  const { data: session } = useSession();
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [duration, setDuration] = useState(0);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [audioPreview, setAudioPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onThumbnailDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  }, []);

  const onAudioDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    setAudioFile(file);
    const audioUrl = URL.createObjectURL(file);
    setAudioPreview(audioUrl);
    const audioElement = new Audio(audioUrl);
    audioElement.addEventListener('loadedmetadata', () => {
      setDuration(audioElement.duration);
    });
  }, []);

  const { getRootProps: getThumbnailRootProps, getInputProps: getThumbnailInputProps, isDragActive: isThumbnailDragActive } = useDropzone({
    onDrop: onThumbnailDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg'] },
    multiple: false,
    disabled: isSubmitting
  });

  const { getRootProps: getAudioRootProps, getInputProps: getAudioInputProps, isDragActive: isAudioDragActive } = useDropzone({
    onDrop: onAudioDrop,
    accept: { 'audio/*': ['.mp3', '.wav', '.ogg'] },
    multiple: false,
    disabled: isSubmitting
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !audioFile) return alert("Please provide a title and audio file.");
    setIsSubmitting(true);
    try {
      const audioFormData = new FormData();
      audioFormData.append("file", audioFile);
      audioFormData.append("folder", "audio"); // 👈 add folder
      const audioRes = await axios.post("/api/upload/audio", audioFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const audioUrl = audioRes.data.file;

      let thumbnailUrl = '';
      if (thumbnailFile) {
        const thumbFormData = new FormData();
        thumbFormData.append("file", thumbnailFile);
        thumbFormData.append("folder", "thumbnails"); // 👈 add folder
        const thumbRes = await axios.post("/api/upload/audio", thumbFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        thumbnailUrl = thumbRes.data.file;
      }


      const payload = {
        title,
        artist,
        url: audioUrl,
        duration: Math.round(duration),
        thumbnail: thumbnailUrl
      };

      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/music/new`, payload, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      alert("Music uploaded successfully!");
      setTitle('');
      setArtist('');
      setAudioFile(null);
      setThumbnailFile(null);
      setAudioPreview('');
      setThumbnailPreview('');
      setDuration(0);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">Add New Audio Track</h1>
        <p className="mt-1 text-sm text-gray-600">Fill in the details and upload the media for the new audio track.</p>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MusicIcon /></div>
              <input disabled={isSubmitting} value={title} onChange={e => setTitle(e.target.value)} className="block w-full pl-10 p-2.5 text-sm border rounded-lg" placeholder="e.g., Summer Vibes" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Artist</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><UserIcon /></div>
              <input disabled={isSubmitting} value={artist} onChange={e => setArtist(e.target.value)} className="block w-full pl-10 p-2.5 text-sm border rounded-lg" placeholder="e.g., John Doe" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><ClockIcon /></div>
              <input disabled value={duration > 0 ? `${Math.round(duration)}s (${formatDuration(duration)})` : 'Auto-calculated'} readOnly className="block w-full pl-10 p-2.5 text-sm text-gray-500 border rounded-lg bg-gray-100" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail</label>
            <div {...getThumbnailRootProps()} className={`flex justify-center items-center h-48 border-2 border-dashed rounded-lg ${isThumbnailDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}>
              <input {...getThumbnailInputProps()} />
              {thumbnailPreview ? <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover rounded-lg" /> : <div className="text-center text-gray-500"><ImageIcon /><p>Drop image here, or click to select</p></div>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Audio File</label>
            {audioPreview ? (
              <div className="p-4 border rounded-lg bg-gray-50">
                <p className="text-sm font-medium text-gray-800 truncate mb-2">{audioFile?.name}</p>
                <audio src={audioPreview} controls className="w-full"></audio>
              </div>
            ) : (
              <div {...getAudioRootProps()} className={`flex justify-center items-center h-48 border-2 border-dashed rounded-lg ${isAudioDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}>
                <input {...getAudioInputProps()} />
                <div className="text-center text-gray-500"><UploadIcon /><p>Drop audio file here, or click to select</p></div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-gray-200 flex justify-end">
        <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" /><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4l4-4-4-4v4a8 8 0 00-8 8z" /></svg>
              Uploading...
            </span>
          ) : 'Save Audio Track'}
        </button>
      </div>
    </form>
  );
}