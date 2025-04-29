import { motion } from 'framer-motion';
import { LogOut, Star } from 'lucide-react'; // Assuming you're using Lucide icons
import { useSelector, useDispatch } from 'react-redux';
import { clearToken } from '../../redux/authSlice';
import { RootState } from '../../redux/store';
import {  useNavigate } from 'react-router-dom';
import { logout } from '../../services/AuthService';

const S3_PATH = import.meta.env.VITE_AWSS3_PATH


const UserProfileCard = () => {
  // Fetch user from Redux state
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
 
  const handleLogout = async () => {
      try {
        const response = await logout();
        if (response && response.message === 'User logged out successfully') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('token');
          dispatch(clearToken());
          navigate('/admin/login'); 
        }
      } catch (error) {
        console.error('Logout failed:', error);
      }
    };

  return (
    <div className="absolute bottom-0 left-0 right-0 p-6">
      <motion.div
        className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20"
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center gap-3 mb-3">
          <img
            src={`${S3_PATH}/${user?.profilePic}`}
            alt="Profile"
            className="w-10 h-10 rounded-xl ring-2 ring-indigo-500/20"
          />
          <div>
            <h3 className="font-medium text-white">{user?.name}</h3>
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-400">
                {user?.location}
              </span>
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            </div>
          </div>
        </div>
        <button 
          className="w-full px-3 py-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white transition-colors duration-200 flex items-center gap-2 justify-center"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Sign Out</span>
        </button>
      </motion.div>
    </div>
  );
};

export default UserProfileCard;