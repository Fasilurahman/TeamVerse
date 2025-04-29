import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resendOTPService } from '../services/AuthService';
import { Shield, Lock, ArrowRight } from 'lucide-react';
import PixelTransition from '../components/Design/PixelTransition';
import { verifyOTPService } from '../services/AuthService';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';

const OtpPage: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [activeOtpIndex, setActiveOtpIndex] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(120);
  const [otpExpired, setOtpExpired] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  const location = useLocation();
  const { email } = location.state || {}; 


  useEffect(() => {
    const otpAccess = localStorage.getItem("otpAccess");

    if (!otpAccess) {
      navigate("/login");
    }
  }, [navigate]);
 


  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);


  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setOtpExpired(true);
      setResendDisabled(false);
    }

    return () => clearInterval(timer); 
  }, [countdown]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (otpExpired) return; 

    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); 
    setOtp(newOtp);


    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setActiveOtpIndex(index + 1);
    }
  };


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (otpExpired) return; 

    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
        setActiveOtpIndex(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveOtpIndex(index - 1);
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setActiveOtpIndex(index + 1);
    }
  };




const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const otpValue = otp.join('');

  console.log(email, 'OTP email is being processed');

  if (!email) {
    toast.error("Email is missing. Please start the verification process again.");
    return;
  }

  if (otpValue.length === 6) {
    setLoading(true);

    if (otpExpired) {
      toast.error("The OTP has expired. Please request a new code.");
      setLoading(false);
      return;
    }

    try {
      const response = await verifyOTPService(email, otpValue);
      console.log(response);

      toast.success("OTP verified successfully! Redirecting to your login page...");
      localStorage.removeItem("otpAccess");
      console.log(response,'response reponse');
      
      navigate('/login');
    } catch (error: any) {
      console.error("OTP verification failed:", error);

      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }
};


  const handleResendCode = async () => {
    setResendDisabled(true);
    setCountdown(120); 
    setOtpExpired(false);
    setOtp(new Array(6).fill(''));
    inputRefs.current[0]?.focus(); 

    try {
      await resendOTPService(email);
      toast.success('OTP has been resent. Please check your email.');
    } catch (error: any) {
        toast.error(error.message || 'Something went wrong. Please try again later.');
    } finally {
        setTimeout(() => setResendDisabled(false), 120000); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex h-[600px] border border-white/20">
        {/* Left side: Image/Animation */}
        <div className="hidden md:flex md:w-1/2 h-full">
          <PixelTransition
            firstContent={
              <img
                src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80"
                alt="Security Verification"
                className="w-full h-full object-cover"
              />
            }
            secondContent={
              <div className="w-full h-full grid place-items-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center mb-4">
                    <Lock className="w-12 h-12 text-white/80" />
                  </div>
                  <h1 className="font-extrabold text-5xl text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">
                    Project Nexus
                  </h1>
                  <p className="text-indigo-200 text-lg font-light tracking-wide">
                    Secure. Verify. Access.
                  </p>
                </div>
              </div>
            }
            gridSize={12}
            pixelColor="#ffffff"
            animationStepDuration={0.4}
            className="custom-pixel-card"
          />
        </div>

        {/* Right side: OTP Form */}
        <div className="flex flex-col justify-center items-center w-full md:w-1/2 h-full p-8">
          <div className="w-full max-w-md">
            <div className="flex flex-col items-center mb-10">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200 transform hover:scale-105 transition-transform duration-300">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Two-Step Verification</h2>
              <p className="text-gray-600 text-center max-w-sm">
                Enter the verification code we sent to your email to secure your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex justify-center gap-3">
                {otp.map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    value={otp[index]}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    disabled={otpExpired} // Disable inputs if OTP has expired
                    className={`w-12 h-14 border-2 rounded-xl text-center text-2xl font-bold
                      ${otpExpired
                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                        : index === activeOtpIndex
                        ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100'
                        : 'border-gray-200 shadow-sm'
                      } focus:outline-none focus:border-indigo-600 focus:bg-indigo-50
                      transition-all duration-300 hover:border-indigo-400 transform hover:-translate-y-0.5`}
                    maxLength={1}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6 || otpExpired} // Disable button if OTP expired
                className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent
                  rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600
                  hover:from-purple-600 hover:to-pink-600 transition-all duration-300
                  focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-opacity-50 shadow-lg
                  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-500">
                Didn’t receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendDisabled}
                  className="text-indigo-600 font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Resend
                </button>
              </p>
              <p className="mt-2 text-gray-400">
                {otpExpired
                  ? 'Your OTP has expired. Please request a new code.'
                  : `Code expires in ${Math.floor(countdown / 60)}:${String(
                      countdown % 60
                    ).padStart(2, '0')}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpPage;
