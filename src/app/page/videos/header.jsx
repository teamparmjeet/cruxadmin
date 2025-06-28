'use client';

import { Input } from '@/components/ui/input';
import { DatePickerWithRange } from './date-range-picker';
import { Search } from 'lucide-react';

export function VideoPageHeader({ searchQuery, onSearchChange, onDateChange }) {
  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold">All Videos</h1>
        <p className="mt-1 text-muted-foreground">
          View, manage, edit, and delete all videos on the platform.
        </p>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col md:flex-row items-center gap-2 mt-4">
        <div className="relative w-full md:w-auto md:flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by title or uploader..."
            className="w-full rounded-lg bg-background pl-8"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <DatePickerWithRange onDateChange={onDateChange} />
      </div>
    </div>
  );
}
