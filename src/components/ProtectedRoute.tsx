import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // State 1: Auth still resolving — show spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-offwhite">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-crimson border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[11px] tracking-[2px] uppercase text-mid-gray">Loading...</p>
        </div>
      </div>
    );
  }

  // State 2: No authenticated user — redirect cleanly, nothing else rendered
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // State 3: Authenticated — render the protected content
  return <>{children}</>;
}
