import React, { useState } from 'react';
import { sendEmailVerification, signOut } from 'firebase/auth';
import {
  MailCheck,
  RotateCw,
  Send,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { auth } from '../../firebase/config';

interface EmailVerificationScreenProps {
  email: string;
  onVerified: () => void;
  onSignOut: () => void;
}

export const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({
  email,
  onVerified,
  onSignOut,
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(
    {
      text: `We've sent a verification link to ${email}. Please check your inbox and verify your email to unlock your placement tracker.`,
      type: 'info',
    }
  );
  const [cooldown, setCooldown] = useState(0);

  const handleCheckStatus = async () => {
    setIsChecking(true);
    setMessage(null);
    try {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        // Force refresh ID token so that Firestore receives the updated email_verified: true claim in its JWT
        await auth.currentUser.getIdToken(true);
        if (auth.currentUser.emailVerified) {
          setMessage({
            text: 'Email verified successfully! Preparing your workspace...',
            type: 'success',
          });
          setTimeout(() => {
            onVerified();
          }, 800);
          return;
        } else {
          setMessage({
            text: 'Your email is not verified yet. Please click the link sent to your inbox and tap Check Status again.',
            type: 'error',
          });
        }
      }
    } catch (err: any) {
      console.error('Check status error:', err);
      setMessage({
        text: 'Failed to refresh verification status. Please try again.',
        type: 'error',
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setIsResending(true);
    setMessage(null);
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setMessage({
          text: `A fresh verification link was sent to ${email}. Check your inbox and spam folder.`,
          type: 'success',
        });
        setCooldown(60);
        const timer = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err: any) {
      console.error('Resend error:', err);
      setMessage({
        text: err?.message || 'Failed to send verification email. Please wait a moment and try again.',
        type: 'error',
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onSignOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-[0_4px_16px_rgba(15,23,42,0.06)] border border-slate-200 rounded-lg sm:px-8 text-center space-y-5">
          <div className="w-14 h-14 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center text-amber-600 mx-auto">
            <MailCheck className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Verify Your Student Email
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Registered email: <strong className="text-slate-800 font-mono">{email}</strong>
            </p>
          </div>

          {message && (
            <div
              className={`p-3 text-xs rounded-md flex items-start gap-2 text-left leading-relaxed ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : message.type === 'error'
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : message.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <div>{message.text}</div>
            </div>
          )}

          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleCheckStatus}
              disabled={isChecking}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RotateCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Checking Verification...' : "I've Clicked the Link — Refresh Status"}</span>
            </button>

            <button
              onClick={handleResend}
              disabled={isResending || cooldown > 0}
              className="w-full py-2 px-4 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {cooldown > 0 ? `Resend Available in ${cooldown}s` : 'Resend Verification Email'}
              </span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Wrong email address?</span>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
