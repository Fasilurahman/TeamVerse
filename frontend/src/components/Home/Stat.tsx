import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { StatProps } from '../../types';

export function Stat({ value, label, delay }: StatProps) {
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
      transition={{ duration: 0.7 }}
      className="text-center"
    >
      <motion.div 
        className="text-3xl font-bold text-gray-900"
        whileHover={{ scale: 1.1 }}
      >
        {value}
      </motion.div>
      <div className="text-gray-600">{label}</div>
    </motion.div>
  );
}