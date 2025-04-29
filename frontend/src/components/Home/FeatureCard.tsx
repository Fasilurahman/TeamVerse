import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { FeatureCardProps } from '../../types';

export function FeatureCard({ icon, title, description, delay, image }: FeatureCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isVisible ? 1 : 0, 
        y: isVisible ? 0 : 20 
      }}
      transition={{ duration: 0.6 }}
      className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 overflow-hidden"
    >
      <div className="h-48 overflow-hidden">
        <motion.img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <div className="p-6">
        <motion.div 
          className="mb-4 text-indigo-600"
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          {icon}
        </motion.div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </motion.div>
  );
}