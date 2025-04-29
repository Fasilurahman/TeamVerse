import React from 'react';
import { Search, Bell, Settings } from 'lucide-react';

const Header = () => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search..."
          className="bg-[#1A1F37] text-white pl-12 pr-4 py-2.5 rounded-xl w-[280px] focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
        />
      </div>
      <div className="flex items-center space-x-6">
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button className="p-2 text-gray-400 hover:text-white transition-colors">
          <Settings size={20} />
        </button>
        <div className="flex items-center space-x-3">
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt="Profile"
            className="w-10 h-10 rounded-full ring-2 ring-purple-500"
          />
        </div>
      </div>
    </div>
  );
};

export default Header;