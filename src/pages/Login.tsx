import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Lock, Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { getAuthRedirectUrl } from '../lib/authRedirect';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/account';
  const { signInWithPassword } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [firebaseError, setFirebaseError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async ({ email, password }: LoginFormData) => {
    setIsSubmitting(true);
    setFirebaseError('');
    try {
      await signInWithPassword(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err: unknown) {
      const message = (err as { message?: string }).message || '';
      if (message.toLowerCase().includes('invalid login credentials')) {
        setFirebaseError('Incorrect email or password.');
      } else if (message.toLowerCase().includes('email not confirmed') || message.toLowerCase().includes('confirm')) {
        setFirebaseError('Please confirm your email address first, then sign in again.');
      } else {
        setFirebaseError('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setFirebaseError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getAuthRedirectUrl(redirectTo),
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      console.error(err);
      setFirebaseError('Google sign-in failed. Please try again.');
      setIsGoogleLoading(false);
    } finally {
      if (document.visibilityState === 'visible') setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-offwhite flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-[420px]">

        {/* Back link */}
        <Link
          to="/"
          className="flex items-center gap-2 text-[10px] tracking-[1.5px] uppercase text-mid-gray hover:text-crimson transition-colors mb-10"
        >
          <ArrowLeft size={13} /> Back to Store
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-[10px] tracking-[3px] uppercase text-crimson block mb-3">Welcome Back</span>
          <h1 className="serif text-[clamp(28px,5vw,40px)] font-light text-dark leading-tight">
            Sign In
          </h1>
          <div className="w-8 h-px bg-crimson mx-auto mt-4" />
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className="w-full flex items-center justify-center gap-3 border border-silver bg-white py-3.5 text-[11px] tracking-[1.5px] uppercase text-charcoal hover:border-charcoal hover:text-dark transition-all duration-200 mb-6 disabled:opacity-60"
        >
          {/* Google SVG icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-silver" />
          <span className="text-[10px] tracking-[2px] uppercase text-mid-gray">or</span>
          <div className="flex-1 h-px bg-silver" />
        </div>

        {/* Email/password form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] tracking-[1.5px] uppercase text-charcoal font-medium flex items-center gap-1.5">
              <Mail size={11} /> Email Address
            </label>
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full p-3.5 border border-silver bg-white font-sans text-[13px] outline-none focus:border-crimson transition-colors"
            />
            {errors.email && <p className="text-[10px] text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] tracking-[1.5px] uppercase text-charcoal font-medium flex items-center gap-1.5">
              <Lock size={11} /> Password
            </label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="********"
                className="w-full p-3.5 border border-silver bg-white font-sans text-[13px] outline-none focus:border-crimson transition-colors pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-mid-gray hover:text-charcoal"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p className="text-[10px] text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          {/* Firebase error */}
          {firebaseError && (
            <div className="p-3 bg-red-50 border border-red-200 text-[11px] text-red-700">
              {firebaseError}
            </div>
          )}

          <div className="flex justify-end">
            <button type="button" className="text-[10px] tracking-[1px] uppercase text-mid-gray hover:text-crimson transition-colors">
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-crimson text-white py-4 text-[11px] tracking-[2px] uppercase hover:bg-crimson-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Register link */}
        <p className="text-center text-[11px] text-mid-gray mt-8">
          New to Cee Hatinators?{' '}
          <Link
            to={`/register${redirectTo !== '/account' ? `?redirect=${redirectTo}` : ''}`}
            className="text-crimson border-b border-crimson pb-0.5 hover:text-crimson-dark transition-colors"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
