'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
       const result = await signIn('credentials', {
        redirect: false, // Do not redirect automatically, we will handle it
        email: email,
        password: password,
      });

      if (result?.error) {
        setError('Invalid email or password');
        console.error(result.error);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('An unexpected error occurred.');
    }
  };

  if (!isMounted) return null; // Prevent rendering until on client

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e5e5e5] to-[#e5e5e5] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Admin Panel Login</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#fca311] transition"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#fca311] transition"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-[#fca311] hover:bg-[#E2BFB3] text-white font-semibold rounded-lg transition-all duration-300 shadow-md"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}
