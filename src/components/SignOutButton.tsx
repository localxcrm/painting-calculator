'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LogOut } from 'lucide-react';

interface SignOutButtonProps {
  className?: string;
  variant?: 'button' | 'link';
  showIcon?: boolean;
}

export default function SignOutButton({ 
  className = 'btn btn-outline-danger', 
  variant = 'button',
  showIcon = true 
}: SignOutButtonProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        alert('Error signing out. Please try again.');
      } else {
        router.push('/login');
        router.refresh();
      }
    } catch (err) {
      console.error('Unexpected error during sign out:', err);
      alert('Unexpected error. Please try again.');
    } finally {
      setIsSigningOut(false);
    }
  };

  if (variant === 'link') {
    return (
      <button
        onClick={handleSignOut}
        disabled={isSigningOut}
        className={`${className} d-flex align-items-center gap-2`}
        style={{ background: 'none', border: 'none', padding: 0 }}
      >
        {showIcon && <LogOut size={16} />}
        {isSigningOut ? 'Signing out...' : 'Sign Out'}
      </button>
    );
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={isSigningOut}
      className={`${className} d-flex align-items-center gap-2`}
    >
      {showIcon && <LogOut size={16} />}
      {isSigningOut ? 'Signing out...' : 'Sign Out'}
    </button>
  );
}
