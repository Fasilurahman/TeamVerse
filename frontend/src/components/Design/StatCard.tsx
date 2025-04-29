import React from "react";
import { clsx } from "clsx";

interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  icon: React.ElementType;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  trend,
  icon: Icon,
}) => {


  return (
    <div className="bg-[#1A1F37] p-6 rounded-xl transition-transform hover:scale-[1.02] hover:shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <div className="text-gray-400 text-sm font-medium">{title}</div>
        <div className="w-10 h-10 rounded-full bg-purple-500 bg-opacity-10 flex items-center justify-center">
          <Icon className="text-purple-500" size={20} />
        </div>
      </div>
      <div className="text-2xl font-bold text-white mb-2">{value}</div>
      <div
        className={clsx(
          "text-sm font-medium flex items-center",
          trend.startsWith("+") ? "text-green-500" : "text-red-500"
        )}
      >
        {trend}
      </div>
    </div>
  );
};
