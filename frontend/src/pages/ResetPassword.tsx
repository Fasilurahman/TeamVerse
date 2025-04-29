import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, KeyRound, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { z } from 'zod';
import { resetPasswordService } from '../services/AuthService';
import { ConsoleLevel } from '@zegocloud/zego-uikit-prebuilt';

function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const passwordSchema = z
    .string()
    .min(6,{message: 'Password must be at least 6 characters'})
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]+$/, {
      message: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    passwordSchema.parse(password);

    if(!token)return;
    try {
      const response = await resetPasswordService(token, password);
      console.log(response, 'response');
      console.log(response.message,'message')
      setMessage(response.message);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong.');
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slideIn {
            from {
              transform: translateX(-10px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
          }

          .animate-slide-in {
            animation: slideIn 0.3s ease-out forwards;
          }

          .form-container {
            backdrop-filter: blur(8px);
            background: rgba(255, 255, 255, 0.95);
          }

          .input-focus-ring {
            transition: all 0.2s ease;
          }

          .input-focus-ring:focus {
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
          }

          .icon-container {
            background: linear-gradient(135deg, #93c5fd 0%, #3b82f6 100%);
          }
        `}
      </style>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 form-container p-8 rounded-lg shadow-xl animate-fade-in">
          <div className="text-center">
            <div className="mx-auto h-14 w-14 icon-container rounded-full flex items-center justify-center shadow-lg animate-slide-in">
              <Lock className="h-7 w-7 text-white" />
            </div>
            <h2 className="mt-6 text-4xl font-extrabold text-gray-800 animate-fade-in">
              Reset Password
            </h2>
            <p className="mt-2 text-gray-600 animate-fade-in">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <label
                  htmlFor="password"
                  className="absolute -top-3 left-3 bg-white px-1 text-sm text-gray-600"
                >
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg input-focus-ring"
                  placeholder="Enter new password"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-blue-500" />
                </div>
              </div>

              <div className="relative">
                <label
                  htmlFor="confirmPassword"
                  className="absolute -top-3 left-3 bg-white px-1 text-sm text-gray-600"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg input-focus-ring"
                  placeholder="Confirm new password"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 flex items-center justify-center group"
            >
              Reset Password
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </form>

          {message && (
            <div className="mt-4 p-4 rounded-lg bg-green-50 text-green-700 animate-fade-in">
              <p className="text-center text-sm font-medium">{message}</p>
              <p className="text-center text-xs mt-1">Redirecting to login page...</p>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-4 rounded-lg bg-red-50 text-red-700 animate-fade-in">
              <p className="text-center text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Remember your password?{" "}
              <a href="/login" className="text-blue-500 hover:underline">
                Sign In
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default ResetPassword;