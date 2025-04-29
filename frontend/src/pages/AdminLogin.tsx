import React from 'react'
import AdminLoginLoginForm from '../components/Auth/AdminLoginForm'
import PixelTransition from '../components/Design/PixelTransition';


const AdminLogin: React.FC = () => {

  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-wihite-200 to-purple-200 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex h-[550px]">
        <div className="hidden md:flex md:w-1/2 h-full">
          <PixelTransition
            firstContent={
              <img
                src="/assets/pexels-eberhardgross-1624496.jpg"
                alt="Login Illustration"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
        {/* Right side: Form container (50% width on medium+ screens, full width on small screens) */}
        <div className="flex flex-col justify-center items-center w-full md:w-1/2 h-full p-10">
          <AdminLoginLoginForm />
        </div>
      </div>
    </div>
  )
}

export default AdminLogin