import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { clearToken } from '../../redux/authSlice';
import { RootState } from '../../redux/store';
import {
  User,
  LogOut,
  ChevronRight,
  Star,
  Trophy,
  Zap,
  ChevronDown
} from 'lucide-react';
import { logout } from '../../services/AuthService';


const S3_PATH = import.meta.env.VITE_AWSS3_PATH

const UserMenuDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'menu' | 'notifications'>('menu');
  const userData = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
      try {
        const response = await logout();
        if (response && response.message === 'User logged out successfully') {
          localStorage.removeItem('accessToken');
          dispatch(clearToken());
          navigate('/admin/login'); 
        }
      } catch (error) {
        console.error('Logout failed:', error);
      }
  };

  const menuItems = [
    {
      icon: User,
      label: 'View Profile',
      link: '/profile',
      badge: 'Pro',
      badgeColor: 'bg-gradient-to-r from-amber-500 to-orange-500'
    },

  ];
  const achievements = [
    {
      icon: Trophy,
      label: 'Top Performer',
      color: 'text-amber-400'
    },
    {
      icon: Star,
      label: 'Rising Star',
      color: 'text-purple-400'
    },
    {
      icon: Zap,
      label: 'Quick Learner',
      color: 'text-blue-400'
    }
  ];

 

  return (
    <div className="relative">
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => {
            console.log("Button clicked");
            e.stopPropagation(); // Prevent event propagation
            setIsOpen((prev) => !prev);
        }}
        
        className="relative group"
      >
        <div className="absolute inset-0 bg-indigo-500/20 rounded-xl blur-lg group-hover:bg-indigo-500/30 transition-all duration-300"></div>
        <div >
          <ChevronDown className="w-6 h-6 text-white animate-pulse" />
        </div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-4 w-80 rounded-2xl bg-gradient-to-br from-slate-800/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-black/20 overflow-hidden z-50"
          >
            {/* User Info Section */}
            <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-b border-slate-700/50">
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-indigo-500/20 rounded-xl blur-lg"></div>
                  <img
                    src={`${S3_PATH}/${userData?.profilePic}`} 
                    alt={userData?.name || "User"}
                    className="w-12 h-12 rounded-xl ring-2 ring-indigo-500/20 object-cover relative"
                  />
                </motion.div>
                <div>
                  <h3 className="font-medium text-white">
                    {userData?.name || "Alex Morgan"}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {userData?.email || "alex.morgan@example.com"}
                  </p>
                </div>
              </div>

              {/* Achievements */}
              <div className="mt-4 flex gap-2">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/50 border border-slate-700/50"
                  >
                    <achievement.icon className={`w-3 h-3 ${achievement.color}`} />
                    <span className="text-xs font-medium text-slate-300">
                      {achievement.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-700/50">
              <button
                onClick={() => setActiveTab('menu')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'menu'
                    ? 'text-indigo-400 bg-indigo-500/10'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Menu
              </button>
              
            </div>

            {/* Content */}
            <div className="p-2">
              {activeTab === 'menu' ? (
                // Menu Items
                <div className="space-y-1">
                  {menuItems.map((item) => (
                    <Link
                      key={item.label}
                      to={item.link}
                      className="group flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors duration-200"
                    >
                      <div className="p-2 rounded-lg bg-slate-800/50 text-slate-400 group-hover:text-white transition-colors duration-200">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors duration-200">
                          {item.label}
                        </span>
                      </div>
                      {item.badge && (
                        <span className={`px-2 py-0.5 text-xs font-medium text-white rounded-full ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}

                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors duration-200" />
                    </Link>
                  ))}

                  <div className="my-2 border-t border-slate-700/50"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full group flex items-center gap-3 p-2 rounded-lg hover:bg-rose-500/10 transition-colors duration-200"
                  >
                    <div className="p-2 rounded-lg bg-slate-800/50 text-rose-400 group-hover:text-rose-400">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-rose-400">
                      Log out
                    </span>
                  </button>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenuDropdown;