import React from 'react';
import { X, Mail, Phone, MapPin, Building2, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  company: string;
  status: string;
  isBlocked: boolean;
}

interface UserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, isOpen, onClose }) => {
  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1A1F37] rounded-xl shadow-2xl p-6 w-full max-w-lg z-50"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center text-2xl font-bold text-purple-500">
                  {user.name[0]}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                    user.isBlocked 
                      ? "bg-red-500/10 text-red-500" 
                      : "bg-green-500/10 text-green-500"
                  }`}>
                    {user.isBlocked ? "Inactive" : "Active"}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 text-gray-300">
                <Mail className="text-purple-500" size={20} />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Phone className="text-purple-500" size={20} />
                <span>{user.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin className="text-purple-500" size={20} />
                <span>{user.location}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Building2 className="text-purple-500" size={20} />
                <span>{user.company}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Shield className="text-purple-500" size={20} />
                <span>Account Status: {user.isBlocked ? "Blocked" : "Active"}</span>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-purple-500/10 text-purple-500 rounded-lg hover:bg-purple-500/20 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UserModal;