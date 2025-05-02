import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, Target, MessageSquare, Activity, Settings, Video } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
  { icon: Users, label: "Team Members", path: "/team-members" },
  { icon: Target, label: "Projects", path: "/projects" },
  { icon: Video, label: "Meetings", path: "/meetings" },
  { icon: MessageSquare, label: "Messages", path: "/messages", badge: "3" },
  { icon: Activity, label: "All Tasks", path: "/employee-task" },
  { icon: Settings, label: "Settings", path: "/profile" },
];

const SidebarNav = () => {
  const location = useLocation();

  return (
    <nav className="mt-6 px-4">
      {navItems.map((item, index) => {
        const isActive = location.pathname === item.path;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              to={item.path}
              className={`
                group flex items-center gap-3 px-4 py-3 mb-2 rounded-xl transition-all duration-300
                ${isActive
                  ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-white shadow-lg shadow-indigo-500/10"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"}
              `}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "animate-pulse" : ""}`} />
              <span className="font-medium">{item.label}</span>

              {item.badge && (
                <span
                  className={`ml-auto text-xs px-2 py-1 rounded-full font-medium 
                  ${item.badge === "New"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-indigo-500/20 text-indigo-400"}
                `}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
};

export default SidebarNav;
