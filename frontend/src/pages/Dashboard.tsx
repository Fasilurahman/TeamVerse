import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import SidebarNav from "../components/dashboard/Sidebar";
import { styles } from "../styles/styles";
import {
  Bell,
  Search,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import NotificationView from "../components/dashboard/NotificationView";
import { RootState } from "../redux/store";
import UserProfileCard from "../components/Design/UserProfileCard";
import UserMenuDropdown from "../components/Design/UserMenuDropdown";
import { fetchUserDashboardStats } from "../services/ChartService";

const S3_PATH = import.meta.env.VITE_AWSS3_PATH

interface Stat {
  title: string;
  value: number;
  icon: string;
  change: string;
  trend: "up" | "down" | "neutral";
  color: string;
}


function Dashboard() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [stats, setStats] = useState<Stat[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { user } = useSelector((state: RootState) => state.auth);


  const fetchStats = async ()=>{
    try {
      const data = await fetchUserDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }

  useEffect(()=>{
    fetchStats();
  },[])

  return (
    <div className={styles.container}>
      {/* Enhanced Sidebar */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`fixed top-0 left-0 h-full w-72 ${styles.glassEffect} z-20 border-r border-slate-700/50`}
      >
        <div className="p-8">
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-xl blur-xl"></div>
              <div className="relative p-2.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
                <Sparkles className="w-6 h-6 text-white animate-pulse-glow" />
              </div>
            </div>
            <div>
              <h1 className="font-display font-bold text-xl bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                TeamFlow
              </h1>
              <span className="text-xs font-medium text-indigo-400">
                Enterprise Suite
              </span>
            </div>
          </motion.div>
        </div>

        <SidebarNav />

        <UserProfileCard />
      </motion.aside>

      {/* Main Content */}
      <main className="pl-72">
        {/* Enhanced Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`sticky top-0 z-10 backdrop-blur-xl bg-slate-900/50 border-b border-slate-700/50`}
        >
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search anything..."
                    className="pl-9 pr-4 py-2 w-64 bg-slate-800/50 text-sm rounded-lg border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 placeholder-slate-400"
                  />
                </div>
                <nav className="flex items-center gap-2">
                  {["Dashboard", "Projects", "Tasks", "Reports"].map((item) => (
                    <button
                      key={item}
                      className="px-3 py-1.5 text-sm text-slate-400 hover:text-white transition-colors duration-200"
                    >
                      {item}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="flex items-center gap-6">
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative group"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <Bell className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors duration-200" />
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-slate-900"></span>
                  </motion.button>

                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-80 z-50"
                      ref={notificationRef}
                    >
                      <NotificationView
                        onClose={() => setShowNotifications(false)}
                      />
                    </motion.div>
                  )}
                </div>

                <div className="h-5 w-px bg-slate-700/50"></div>

                <motion.div
                  className="flex items-center gap-3 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                >
                  <img
                    src={`${S3_PATH}/${user?.profilePic}`}
                    alt="Profile"
                    className="w-8 h-8 rounded-lg ring-2 ring-indigo-500/20"
                  />
                  <UserMenuDropdown/>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Dashboard Content */}
        <div className="p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-2xl font-bold text-white mb-1">
                  Welcome back, {user?.name}! 👋
                </h1>
                <p className="text-slate-400">
                  Here's what's happening with your projects today.
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-6">
              {stats?.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-6 rounded-2xl overflow-hidden ${styles.glassEffect} ${styles.cardHover}`}
                >
                  <div
                    className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${stat.color} opacity-10`}
                  ></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <stat.icon  />
                      <span
                        className={`
                        text-sm font-medium flex items-center gap-1
                        ${
                          stat.trend === "up"
                            ? "text-emerald-400"
                            : stat.trend === "down"
                            ? "text-rose-400"
                            : "text-slate-400"
                        }
                      `}
                      >
                        {stat.change}
                        {stat.trend === "up" && (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                        {stat.trend === "down" && (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                      </span>
                    </div>
                    <h3 className="text-2xl font-display font-bold text-white mb-1">
                      {stat.value}
                    </h3>
                    <p className="text-sm text-slate-400">{stat.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-12 gap-6">
              {/* Main Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`col-span-8 p-6 rounded-2xl ${styles.glassEffect}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-display font-semibold text-white mb-1">
                      Project Performance
                    </h2>
                    <p className="text-sm text-slate-400">
                      Monthly progress overview
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {["1D", "1W", "1M", "1Y"].map((period) => (
                      <button
                        key={period}
                        className={`
                          px-3 py-1.5 text-sm rounded-lg transition-all duration-200
                          ${
                            period === "1M"
                              ? "bg-indigo-500/20 text-indigo-400"
                              : "text-slate-400 hover:text-white"
                          }
                        `}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={[
                        { name: "Jan", value: 400 },
                        { name: "Feb", value: 300 },
                        { name: "Mar", value: 600 },
                        { name: "Apr", value: 800 },
                        { name: "May", value: 500 },
                        { name: "Jun", value: 900 },
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorValue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#6366f1"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#6366f1"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(15, 23, 42, 0.9)",
                          border: "1px solid rgba(99, 102, 241, 0.2)",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#6366f1"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Side Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`col-span-4 p-6 rounded-2xl ${styles.glassEffect}`}
              >
                <h2 className="text-lg font-display font-semibold text-white mb-6">
                  Project Distribution
                </h2>
                <div className="h-[250px] mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Development", value: 45 },
                          { name: "Design", value: 25 },
                          { name: "Marketing", value: 30 },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value" // Add this line
                      >
                        <Cell fill="#6366f1" />
                        <Cell fill="#a855f7" />
                        <Cell fill="#ec4899" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      label: "Development",
                      value: "45%",
                      color: "bg-indigo-500",
                    },
                    { label: "Design", value: "25%", color: "bg-purple-500" },
                    { label: "Marketing", value: "30%", color: "bg-pink-500" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-300">
                            {item.label}
                          </span>
                          <span className="text-sm font-medium text-white">
                            {item.value}
                          </span>
                        </div>
                        <div className="mt-1 h-1 rounded-full bg-slate-700/50">
                          <div
                            className={`h-full rounded-full ${item.color}`}
                            style={{ width: item.value }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
