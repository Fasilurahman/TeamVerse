import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { setAuth } from '../../redux/authSlice';
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch,useSelector } from "react-redux";
import {  loginService } from "../../services/AuthService";
import { AppDispatch, RootState } from "../../redux/store";
import { jwtDecode } from "jwt-decode";
import SplitText from '../Design/SplitText';
import { toast } from 'sonner';
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});

type LoginFormData = z.infer<typeof loginSchema>;

interface TokenPayload {
  id: string;
  email: string;
  role: string;
  isBlocked: boolean;
}

const AdminLoginForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange'
  });

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const auth = useSelector((state: RootState) => state.auth);


  useEffect(() => {
    if (auth?.token && auth?.user) {
        if (auth.user.role === "admin") {
            navigate("/admin/dashboard");
        } else {
            navigate("/dashboard");
        }
    }
}, [auth, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const result = await loginService(data.email, data.password);

      if (result && result.accessToken) {
        const token = result.accessToken;
        const user = result.user;
        localStorage.setItem('accessToken', token);
        dispatch(setAuth({ token, user }));

        const decoded = jwtDecode<TokenPayload>(token);

        if (decoded.isBlocked) {
          toast.error('Your account is blocked. Please contact support.');
          return; 
        }

        toast.success('Login successful!');

        if (decoded.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        toast.error('Login failed');
      }
    } catch (error: any) {
      console.error('Login failed', error);
      if (error.response) {
        const { status, data } = error.response;
  
        if (status === 404) {
          toast.error(data.message); 
        } else if (status === 403) {
          toast.error(data.message); 
        } else if (status === 400) {
          toast.error(data.message); 
        } else if ( status === 401) {
          toast.error(data.message); 
        }
         else {
          toast.error('Login failed');
        }
      } else {
        toast.error('Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnimationComplete = () => {
    console.log('All letters have animated!');
  };

  return (
      <Box sx={{ position: "relative" }}>
        {/* Spinner Overlay */}
        {loading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress size={60} />
          </Box>
        )}

      <form onSubmit={handleSubmit(onSubmit)} className="w-full h-full flex flex-col justify-center">
        <SplitText
          text="Welcome Back"
          className="text-4xl font-extrabold text-center text-gray-800 mb-4"
          delay={150}
          animationFrom={{ opacity: 0, transform: 'translate3d(0,50px,0)' }}
          animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
          easing="easeOutCubic"
          threshold={0.2}
          rootMargin="-50px"
          onLetterAnimationComplete={handleAnimationComplete}
        />
        <p className="text-center text-gray-600 mb-8">Sign in to continue</p>
        <div className="relative mb-6">
          <label
            htmlFor="email"
            className="absolute -top-3 left-3 bg-white px-1 text-sm text-gray-600"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>
        <div className="relative mb-2">
          <label
            htmlFor="password"
            className="absolute -top-3 left-3 bg-white px-1 text-sm text-gray-600"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            {...register("password")}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>
        <div className="flex justify-end mt-2">
          <Link
            to="/request-reset"
            className="text-blue-500 hover:underline text-sm"
          >
            Forgot Password?
          </Link>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mt-4"
        >
          Sign In
        </button>
        <div className="flex items-center justify-center mt-4">
          <span className="text-gray-600 mr-2">or</span>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-500 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </form>
    </Box>
  );
};

export default AdminLoginForm;
