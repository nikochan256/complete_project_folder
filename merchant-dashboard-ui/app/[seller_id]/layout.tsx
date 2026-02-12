"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('login');
    
    if (isLoggedIn !== 'true') {
      // Redirect to login page with hard refresh
      window.location.href = '/';
      return;
    }

    // Clear localStorage when tab/window is closed
    const handleBeforeUnload = () => {
      localStorage.removeItem('login');
      localStorage.removeItem('sellerId');
    };

    // Add event listener for tab close
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [router]);

  // Check login status before rendering
  if (typeof window !== 'undefined') {
    const isLoggedIn = localStorage.getItem('login');
    if (isLoggedIn !== 'true') {
      return null; // Don't render anything while redirecting
    }
  }

  return (
    <div>
      {children}
    </div>
  );
};

export default ProtectedLayout;