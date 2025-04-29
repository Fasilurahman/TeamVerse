import React from 'react';
import RegisterForm from '../components/Auth/RegisterForm';
import PixelTransition from '../components/Design/PixelTransition';

const Register: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-white-200 to-purple-200 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex h-[550px]">
        {/* Left side: PixelTransition container */}
        <div className="hidden md:flex md:w-1/2 h-full">
          <PixelTransition
            firstContent={
              <img
                src="/assets/pexels-eberhardgross-1624496.jpg" 
                alt="Register Illustration"
                className="w-full h-full object-cover"
              />
            }
            secondContent={
              <div className="w-full h-full grid place-items-center bg-black">
                <p className="font-extrabold text-3xl text-white">
                  Project Nexus&nbsp;!
                </p>
              </div>
            }
            gridSize={12}
            pixelColor="#ffffff"
            animationStepDuration={0.4}
            className="custom-pixel-card"
          />
        </div>
        {/* Right side: Form container */}
        <div className="flex flex-col justify-center items-center w-full md:w-1/2 h-full p-10">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default Register;
