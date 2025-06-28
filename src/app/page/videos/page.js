'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { DataTable } from './data-table';

// SVG Icon for the search bar, styled with Tailwind
const SearchIcon = () => (
  <svg className="h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function AllVideosPage() {
  const { data: session } = useSession();

  // --- STATE MANAGEMENT ---
  const [videos, setVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // --- FETCH VIDEOS FROM API ---
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/reels`, {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });
        setVideos(res.data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    if (session?.accessToken) {
      fetchVideos();
    }
  }, [session]);

  // --- FILTERING LOGIC ---
  const filteredVideos = useMemo(() => {
    return videos.filter(video => {
      const searchMatch =
        video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.uploader?.toLowerCase().includes(searchQuery.toLowerCase());

      const videoDate = new Date(video.uploadDate);
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;
      if (fromDate) fromDate.setHours(0, 0, 0, 0);
      if (toDate) toDate.setHours(23, 59, 59, 999);
      const dateMatch = (!fromDate || videoDate >= fromDate) && (!toDate || videoDate <= toDate);

      const statusMatch = statusFilter === 'All' || video.status === statusFilter;

      return searchMatch && dateMatch && statusMatch;
    });
  }, [videos, searchQuery, dateFrom, dateTo, statusFilter]);

  return (
    <div className="flex flex-col gap-5 p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">All Videos</h1>
        <p className="mt-1 text-sm text-gray-600">
          View, manage, edit, and delete all videos on the platform.
        </p>
      </header>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-grow w-full sm:w-auto">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="search"
            placeholder="Search by title or uploader..."
            className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-auto">
          <select
            className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Processing">Processing</option>
            <option value="Blocked">Blocked</option>
            <option value="Reported">Reported</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <label htmlFor="dateFrom" className="hidden sm:block">From:</label>
          <input
            id="dateFrom"
            type="date"
            className="p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <label htmlFor="dateTo" className="hidden sm:block">To:</label>
          <input
            id="dateTo"
            type="date"
            className="p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable data={filteredVideos} />
    </div>
  );
}
