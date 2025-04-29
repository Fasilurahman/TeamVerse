import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Home,  Users, LogOut, CreditCard } from 'lucide-react'; // Added CreditCard icon
import { clsx } from 'clsx';
import { logout } from '../../services/AuthService';
import { clearToken } from '../../redux/authSlice';
import { useDispatch } from 'react-redux';

const SidebarLink = ({ to, icon: Icon, text }: { to: string; icon: React.ElementType; text: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={clsx(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
        isActive
          ? "bg-purple-500/10 text-purple-500"
          : "text-gray-400 hover:text-white hover:bg-[#1F2937]"
      )}
    >
      <Icon size={20} />
      <span className="font-medium">{text}</span>
    </Link>
  );
};

const Sidebar = () => {
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
  
  return (
    <div className="w-64 bg-[#1A1F37] p-6 flex flex-col min-h-screen">
      <div className="flex items-center gap-3 text-white mb-10">
        <Layout className="text-purple-500" size={24} />
        <span className="text-xl font-bold">Dashboard</span>
      </div>
      
      <nav className="space-y-2">
        <SidebarLink to="/" icon={Home} text="Dashboard" />
        <SidebarLink to="/admin/users" icon={Users} text="Users" />
        <SidebarLink to="/subscriptions" icon={CreditCard} text="Subscription" /> {/* Added Subscription */}
      </nav>

      <div className="mt-auto">
        <button onClick={handleLogout} className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-[#1F2937] px-4 py-3 rounded-xl w-full transition-all duration-200">
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
