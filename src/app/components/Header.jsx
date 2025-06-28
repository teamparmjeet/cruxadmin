// app/components/Header.jsx
'use client';

import { useState, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Sidebar } from './Sidebar';
import { useOutsideClick } from '../hooks/useOutsideClick'; // Adjust path if needed

// --- SVG Icons ---
const PanelLeftIcon = () => ( <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg> );
const CloseIcon = () => ( <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> );

export function Header() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const userMenuRef = useRef(null);
  
  // Use the custom hook to close the user menu when clicking outside
  useOutsideClick(userMenuRef, () => setIsUserMenuOpen(false));

  const userInitials = session?.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('');

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 md:px-6">
        {/* --- Mobile Menu Trigger --- */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 text-gray-600 rounded-md sm:hidden hover:bg-gray-100 hover:text-gray-900"
        >
          <PanelLeftIcon />
          <span className="sr-only">Toggle Menu</span>
        </button>

        {/* This empty div can be used for breadcrumbs or page titles later */}
        <div className="flex-1"></div>

        {/* --- User Menu --- */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center justify-center h-9 w-9 overflow-hidden rounded-full bg-gray-200 border-2 border-transparent hover:border-blue-500 transition-colors"
          >
            {session?.user?.image ? (
                <img src={session.user.image} alt={session.user.name} className="h-full w-full object-cover" />
            ) : (
                <span className="text-sm font-semibold text-gray-600">{userInitials}</span>
            )}
          </button>
          
          {/* --- User Dropdown Panel --- */}
          {isUserMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">{session?.user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
                </div>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Support</a>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
      
      {/* --- Mobile Off-canvas Menu --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div onClick={() => setIsMobileMenuOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          
          {/* Panel */}
          <div className="absolute top-0 left-0 h-full w-64 max-w-[80%] bg-white p-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-lg font-semibold">Admin Panel</h1>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-gray-500 rounded-full hover:bg-gray-100">
                <CloseIcon />
              </button>
            </div>
            {/* Reuse the same Sidebar component for consistent navigation */}
            <Sidebar />
          </div>
        </div>
      )}
    </>
  );
}