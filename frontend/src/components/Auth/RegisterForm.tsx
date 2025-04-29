// src/components/Auth/RegisterForm.tsx
import React,{useState} from 'react';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from 'react-router-dom';
import { registerService } from '../../services/AuthService';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import {  RootState } from '../../redux/store';
import { googleAuthService } from '../../services/AuthService';
import { toast } from 'sonner';
import { GoogleLogin } from '@react-oauth/google';
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { registerSchema } from '../../schemas/registerSchema';

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange'
  });

  const [loading, setLoading] = useState(false);


  const navigate = useNavigate();

  
  


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
  

  const onSubmit = async (data: RegisterFormData) => {
    console.log('Form data submitted:', data);
    
    setLoading(true);
    try {
      console.log('Register data:', data);
      
      const result = await registerService(data.name, data.email, data.password);
      console.log('Registration successful', result);
      localStorage.setItem("otpAccess", "true");
      navigate('/otp', { state: { email: data.email } });
    } catch (error: any) {
      console.error('Registration failed', error.response?.data || error.message);
      toast.error('Registration failed: ' + (error.response?.data?.message || error.message));
    }finally{
      setLoading(false);
    }
  };

  const handleLoginSuccess = async (response: any) => {

    setLoading(true)
    try {
      const id_token = response.credential; 
      console.log('ID Token:', id_token);
  
      if (!id_token) {
        throw new Error('ID Token is missing');
      }
  
      const result = await googleAuthService(id_token);
  
      if (result?.accessToken) {
        const token = result.accessToken;
        localStorage.setItem('accessToken', token);
        toast.success('Login successfull.')
        navigate('/dashboard')
      } else {
        console.error('Authentication failed.');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }finally{
      setLoading(false);
    }
  };
  

  const handleLoginError = () => {
    console.error('Google Login Failed');
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

    <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col justify-center">
      <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-6">
        Create an Account
      </h2>
      <p className="text-center text-gray-600 mb-8">Sign up to get started</p>
      
      <div className="relative mb-6">
        <label htmlFor="name" className="absolute -top-3 left-3 bg-white px-1 text-sm text-gray-600">
          Name
        </label>
        <input 
          id="name"
          {...register('name')} 
          placeholder="Enter your name" 
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>
      
      <div className="relative mb-6">
        <label htmlFor="email" className="absolute -top-3 left-3 bg-white px-1 text-sm text-gray-600">
          Email
        </label>
        <input 
          id="email"
          type="email"
          {...register('email')} 
          placeholder="you@example.com" 
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>
      
      <div className="relative mb-8">
        <label htmlFor="password" className="absolute -top-3 left-3 bg-white px-1 text-sm text-gray-600">
          Password
        </label>
        <input 
          id="password"
          type="password"
          {...register('password')} 
          placeholder="Enter your password" 
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>
      
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
      >
        Register
      </button>

      <div className="flex items-center justify-center mt-4">
        <span className="text-gray-600 mr-2">or</span>
      </div>
      <GoogleLogin
        onSuccess={handleLoginSuccess}
        onError={handleLoginError}
      />
      
      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </form>
    </Box>
  );
  
}

export default RegisterForm;