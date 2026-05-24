import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PortalAdminLayoutProps {
  eyebrow: string;
  title: string;
  children: ReactNode;
}

export function PortalAdminLayout({ eyebrow, title, children }: PortalAdminLayoutProps) {
  const { loading, isSuperUser } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center text-[11px] tracking-[2px] uppercase text-mid-gray">
        Checking access...
      </div>
    );
  }

  if (!isSuperUser) {
    return (
      <div className="min-h-screen bg-offwhite px-6 py-16">
        <div className="max-w-xl mx-auto bg-white border border-silver p-8">
          <h1 className="serif text-4xl text-dark font-light mb-4">Super User Required</h1>
          <p className="text-[13px] leading-7 text-charcoal mb-6">
            Sign in through the portal with a super user account before editing this area.
          </p>
          <Link to="/portal" className="inline-flex items-center gap-2 bg-crimson text-white px-5 py-3 text-[10px] tracking-[2px] uppercase">
            <ShieldCheck size={14} /> Go to Portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite px-6 py-12 sm:px-10">
      <div className="max-w-[1180px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-10">
          <div>
            <Link to="/portal" className="inline-flex items-center gap-2 text-[10px] tracking-[1.5px] uppercase text-mid-gray hover:text-crimson transition-colors mb-6">
              <ArrowLeft size={13} /> Back to Portal
            </Link>
            <span className="text-[10px] tracking-[3px] uppercase text-crimson block mb-3">{eyebrow}</span>
            <h1 className="serif text-[clamp(34px,5vw,56px)] font-light text-dark leading-tight">
              {title}
            </h1>
          </div>
          <a href="#/" className="text-[10px] tracking-[2px] uppercase text-crimson hover:text-dark transition-colors">
            View Store
          </a>
        </div>

        {children}
      </div>
    </div>
  );
}
