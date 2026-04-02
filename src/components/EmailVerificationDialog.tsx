import { useState } from 'react';
import { Mail, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmailVerificationDialogProps {
  email: string | undefined;
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailVerificationDialog({
  email,
  isOpen,
  onClose,
}: EmailVerificationDialogProps) {
  const navigate = useNavigate();

  if (!isOpen || !email) return null;

  const handleVerifyClick = () => {
    navigate('/verify-email', {
      state: { email, isFromLogin: true },
    });
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      ></div>

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-card rounded-2xl shadow-lg max-w-md w-full p-6 space-y-4">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="bg-saffron-100 dark:bg-saffron-900/20 p-4 rounded-full">
              <Mail className="w-6 h-6 text-saffron-600" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-center text-foreground">
            Verify Your Email
          </h2>

          {/* Message */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-semibold mb-1">Email verification required</p>
              <p>
                We've sent a verification code to <strong>{email}</strong>. Please verify your email to unlock all features.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground font-medium hover:bg-secondary transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={handleVerifyClick}
              className="flex-1 px-4 py-2 bg-saffron-500 hover:bg-saffron-600 text-white font-bold rounded-lg transition-all shadow-btn-primary"
            >
              Verify Now
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
