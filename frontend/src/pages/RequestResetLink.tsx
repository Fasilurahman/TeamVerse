import React, { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
import BlurText from "../components/Design/BlurText";
import { resetPasswordRequestService } from "../services/AuthService";

function RequestResetLink() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      console.log("sending");

      const result = await resetPasswordRequestService(email);
      if (result.status === 200) {
        setError("");
        setMessage(result.data.message);
      } else if (result?.status === 400) {
        setMessage("");
        setError("Password reset is not allowed for this user.");
      } else {
        setError(
          result.response?.data?.message || "An unexpected error occurred."
        );
      }
    } catch (err: any) {
      console.log(err.response.status, " errrorrrrrr");
    }
  };

  const handleAnimationComplete = () => {
    console.log("All letters have animated!");
  };

  return (
    <>
      <style>
        {`@keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .animate-fade-in {
        animation: fadeIn 0.5s ease-out forwards;
      }`}
      </style>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-xl">
          <div className="text-center space-y-2">
            <BlurText
              text="Forgot Password ?!"
              delay={150}
              animateBy="words"
              direction="top"
              onAnimationComplete={handleAnimationComplete}
              className="text-2xl mb-8"
            />
            <p className="text-gray-600">
              Enter your email to reset your password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="relative">
              <label
                htmlFor="email"
                className="absolute -top-3 left-3 bg-white px-1 text-sm text-gray-600"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                placeholder="you@example.com"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 flex items-center justify-center group"
            >
              Send Reset Link
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </form>

          {message && (
            <div className="mt-4 p-4 rounded-lg bg-green-50 text-green-700 animate-fade-in">
              <p className="text-center text-sm font-medium">{message}</p>
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

export default RequestResetLink;
