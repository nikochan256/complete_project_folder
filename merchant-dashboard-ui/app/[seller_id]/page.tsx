"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { DashboardPage } from "@/components/dashboard/pages/dashboard-page";

export default function Page() {
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
    <DashboardLayout>
      <DashboardPage />
    </DashboardLayout>
  );
}