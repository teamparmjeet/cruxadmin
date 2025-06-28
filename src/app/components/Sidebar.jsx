// app/components/Sidebar.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Users, BarChart2, Settings, Video, ListVideo,
  PlusCircle, Trash2, Ban, ShieldAlert, ChevronDown,
  Music, ListMusic // <-- New Icons for Audio
} from 'lucide-react';
// Reusable NavLink component for top-level items
const NavLink = ({ href, icon: Icon, label, isActive }) => (
  <Link
    href={href}
    className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 ${isActive ? 'bg-blue-100 text-blue-600 font-semibold hover:bg-blue-100 hover:text-blue-600' : ''
      }`}
  >
    <Icon className="h-4 w-4" />
    {label}
  </Link>
);

// Custom Accordion component built with React state and Tailwind CSS
const CustomAccordionItem = ({ item, pathname }) => {
  // An item is active if the current URL starts with its base href
  const isActiveSection = pathname.startsWith(item.href);
  const [isOpen, setIsOpen] = useState(isActiveSection);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 ${isActiveSection ? 'text-blue-600 font-semibold hover:text-blue-600' : ''
          }`}
      >
        <div className="flex items-center gap-3">
          <item.icon className="h-4 w-4" />
          {item.label}
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="pl-6 pt-2">
          <div className="flex flex-col gap-1 border-l border-gray-200 pl-3">
            {item.subItems.map((subItem) => (
              <NavLink
                key={subItem.label}
                href={subItem.href}
                label={subItem.label}
                icon={subItem.icon}
                isActive={pathname === subItem.href}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { 
      label: 'Video Management', 
      icon: Video,
      href: '/videos',
      subItems: [
        // FIXED: Corrected paths to remove '/page' and point to the right place
        { href: '/page/videos', label: 'All Videos', icon: ListVideo },
        { href: '/page/videos/new', label: 'Add New', icon: PlusCircle },
        { href: '/page/videos/all?status=Reported', label: 'Reported', icon: ShieldAlert },
        { href: '/page/videos/blocked', label: 'Blocked', icon: Ban },
        { href: '/page/videos/trash', label: 'Trash', icon: Trash2 },
      ]
    },
    // --- NEW: Audio Management Section ---
    { 
      label: 'Audio Management', 
      icon: Music, // Using the Music icon
      href: '/audio', // Base path for this section
      subItems: [
        { href: '/page/audio', label: 'All Music', icon: ListMusic },
        { href: '/page/audio/new', label: 'Add Audio', icon: PlusCircle },
      ]
    },
    // --- End of New Section ---
    { href: '/page/users', label: 'User Management', icon: Users },
    { href: '/analytics', label: 'Analytics', icon: BarChart2 },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="flex flex-col gap-1 p-2">
      {navItems.map((item) => (
        item.subItems ? (
          <CustomAccordionItem key={item.label} item={item} pathname={pathname} />
        ) : (
          <NavLink
            key={item.label}
            href={item.href}
            label={item.label}
            icon={item.icon}
            isActive={pathname === item.href}
          />
        )
      ))}
    </nav>
  );
}