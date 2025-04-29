import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { RootState } from "../redux/store";
import { useSelector } from "react-redux";
import NotificationView from "../components/dashboard/NotificationView";
import { addComment } from "../services/CommentService";
import { fetchComment } from "../services/CommentService";
import { Task } from "../types";
import { toast } from "sonner";
import io from "socket.io-client";
import { styles } from "../styles/styles"
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Bell,
  Search,
  Calendar,
  Sparkles,
  X,
  Clipboard,
  Filter,
  ArrowRight,
  MessageCircle,
  CheckSquare,
  Circle,
  CalendarClock,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  CheckCheck,
  Loader2,
  ListFilter,
  PlusCircle,
  Briefcase,
} from "lucide-react";
import SidebarNav from "../components/dashboard/Sidebar";
import UserProfileCard from "../components/Design/UserProfileCard";
import UserMenuDropdown from "../components/Design/UserMenuDropdown";
import { fetchAllEmployeesTasks } from "../services/TaskService";

const socket = io(import.meta.env.VITE_BACKEND_URL);

const S3_PATH = import.meta.env.VITE_AWSS3_PATH;

const EmployeeTasks = () => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});
  const [taskFilter, setTaskFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(selectedTask?.comments || []);

  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });
  const navigate = useNavigate();

  const userId = useSelector((state: any) => state.auth.user?.id);
  const user = useSelector((state: RootState) => state.auth.user);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "in-progress":
      case "in progress":
        return "bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-400/20";
      case "completed":
        return "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-400/20";
      case "todo":
        return "bg-slate-500/10 text-slate-400 ring-1 ring-slate-400/20";
      case "review":
        return "bg-blue-500/10 text-blue-400 ring-1 ring-blue-400/20";
      default:
        return "bg-slate-500/10 text-slate-400 ring-1 ring-slate-400/20";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "text-rose-400";
      case "medium":
        return "text-amber-400";
      case "low":
        return "text-emerald-400";
      default:
        return "text-slate-400";
    }
  };

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

  const getPriorityIcon = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return <ArrowUp className="w-4 h-4 text-rose-400" />;
      case "medium":
        return <ArrowRight className="w-4 h-4 text-amber-400" />;
      case "low":
        return <ArrowDown className="w-4 h-4 text-emerald-400" />;
      default:
        return null;
    }
  };

  const isCurrentUserTask = (task:any) => {
    return task.assignedUser?._id === userId;
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case "in progress":
      case "in-progress":
        return <Clock className="w-4 h-4 text-indigo-400" />;
      case "on hold":
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
      case "todo":
        return <Circle className="w-4 h-4 text-slate-400" />;
      case "review":
        return <CheckSquare className="w-4 h-4 text-blue-400" />;
      default:
        return <Circle className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
    } catch (error) {
      return "Invalid date format";
    }
  };

  const fetchAllTasks = async () => {
    try {
      setIsLoading(true);
      const result = await fetchAllEmployeesTasks(userId);
      setTasks(result);
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    } catch (error) {}
  };

  useEffect(() => {
    fetchAllTasks();
  }, [userId]);

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setEditedTask({
      title: task.name,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      assignedTo: task.assignedUser?.id || "",
    });
  };

  const handleCreateSubtask = (taskId: string) => {
    navigate(`/kanban-board/${taskId}`);
  };

  const filteredTasks = tasks.filter((task: any) => {
    if (taskFilter === "my-tasks" && task.assignedUser?._id !== userId) {
      return false;
    }
    if (
      taskFilter !== "all" &&
      taskFilter !== "my-tasks" &&
      task.status !== taskFilter
    ) {
      return false;
    }
    if (
      searchQuery &&
      !task.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      return "Invalid date format";
    }
  };

  const fetchComments = async (taskId: string) => {
    try {
      const result = await fetchComment(taskId);
      console.log(result, "result");
      if (Array.isArray(result)) {
        setComments(result);
      } else {
        setComments([]);
      }
    } catch (error) {
      toast.error("Failed to fetch comments");
    }
  };

  useEffect(() => {
    if (selectedTask?._id) {
      fetchComments(selectedTask._id.toString());
      socket.emit("join-task", selectedTask._id);
    }

    return () => {
      if (selectedTask?._id) {
        socket.emit("leave-task", selectedTask._id);
      }
    };
  }, [selectedTask]);

  const handleAddComment = async () => {
    if (!selectedTask  || !newComment.trim()) return;

    const result = await addComment(String(selectedTask?._id), newComment, userId);

    socket.emit("add-comment", {
      comment: result
    });

    setComments(prev => [...prev, result]);
    fetchComments(String(selectedTask._id));
    setNewComment("");
  };

 
  useEffect(() => {
    const handleNewComment = (comment: any) => {
      if (comment.taskId === selectedTask?._id) {
        fetchComments(comment.taskId);
      }
    };

    socket.on("add-comment", handleNewComment);

    return () => {
      socket.off("add-comment", handleNewComment);
    };
  }, [selectedTask?._id]);
  console.log(selectedTask?._id, "selected task id");

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (task: any) => task?.status === "completed"
  ).length;
  const inProgressTasks = tasks.filter(
    (task: any) => task?.status === "in-progress"
  ).length;
  const todoTasks = tasks.filter((task: any) => task?.status === "todo").length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;


  const today = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(today.getDate() + 3);

  const tasksDueSoon = tasks.filter((task:any) => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return (
      dueDate >= today &&
      dueDate <= threeDaysFromNow &&
      task.status !== "completed"
    );
  }).length;

  return (
    <div className={styles.container}>
      {/* Sidebar */}
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
                <Sparkles
                  className={`w-6 h-6 text-white ${styles.sparkleIcon}`}
                />
              </div>
            </div>
            <div>
              <h1 className="font-display font-bold text-xl bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Project Nexus
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
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`sticky top-0 z-10 backdrop-blur-xl bg-slate-900/50 border-b border-slate-700/50`}
        >
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-display font-bold text-white">
                  Tasks
                </h1>
              </div>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 w-64 bg-slate-800/50 text-sm rounded-lg border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 placeholder-slate-400"
                  />
                </div>
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

                  {/* Notification Dropdown */}
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
                  <UserMenuDropdown />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Success/Error Notification */}
        <AnimatePresence>
          {actionSuccess.show && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-lg shadow-lg ${
                actionSuccess.type === "success"
                  ? "bg-emerald-500/90 text-white"
                  : "bg-rose-500/90 text-white"
              } backdrop-blur-sm flex items-center gap-3`}
            >
              {actionSuccess.type === "success" ? (
                <CheckCheck className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
              <span className="font-medium">{actionSuccess.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Content */}
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Stats Cards */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="grid grid-cols-4 gap-6 mb-8"
            >
              <div
                className={`${styles.statsCard} border-l-4 border-l-indigo-500`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-slate-400">
                    Total Tasks
                  </h3>
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Clipboard className="w-4 h-4 text-indigo-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{totalTasks}</p>
                <div className="mt-2 text-xs text-slate-400">
                  Assigned to you
                </div>
              </div>

              <div
                className={`${styles.statsCard} border-l-4 border-l-emerald-500`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-slate-400">
                    Completed
                  </h3>
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">
                  {completedTasks}
                </p>
                <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                  <ArrowUp className="w-3 h-3" />
                  {completionRate}% completion rate
                </div>
              </div>

              <div
                className={`${styles.statsCard} border-l-4 border-l-amber-500`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-slate-400">
                    In Progress
                  </h3>
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">
                  {inProgressTasks}
                </p>
                <div className="mt-2 text-xs text-slate-400">
                  Currently working on
                </div>
              </div>

              <div
                className={`${styles.statsCard} border-l-4 border-l-rose-500`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-slate-400">
                    Due Soon
                  </h3>
                  <div className="p-2 bg-rose-500/20 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{tasksDueSoon}</p>
                <div className="mt-2 text-xs text-rose-400">
                  Within next 3 days
                </div>
              </div>
            </motion.div>

            {/* Task List */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`${styles.glassEffect} rounded-2xl p-6 mb-8`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-bold text-white">
                  All Tasks
                </h2>
              </div>

              <div>
                {/* Filters */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    {[
                      "all",
                      "my-tasks",
                      "todo",
                      "in-progress",
                      "completed",
                    ].map((status) => (
                      <button
                        key={status}
                        onClick={() => setTaskFilter(status)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                          taskFilter === status
                            ? "bg-indigo-500/20 text-indigo-400"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {status === "all"
                          ? "All"
                          : status === "in-progress"
                          ? "In Progress"
                          : status === "my-tasks"
                          ? "My Tasks"
                          : status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-colors">
                      <Filter className="w-4 h-4 text-slate-400" />
                    </button>
                    <button className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-colors">
                      <ListFilter className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* Task List */}
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    <span className="ml-3 text-slate-400">
                      Loading your tasks...
                    </span>
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <div className="text-center py-12 px-6">
                    <div className="mb-4 inline-flex p-4 rounded-full bg-slate-800/50">
                      <Clipboard className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">
                      No tasks found
                    </h3>
                    <p className="text-slate-400 max-w-md mx-auto">
                      {searchQuery
                        ? "No tasks match your search criteria. Try adjusting your filters."
                        : "You don't have any assigned tasks at the moment."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTasks.map((task: any) => (
                      <motion.div
                        key={task?._id}
                        whileHover={{ scale: 1.01 }}
                        className={`${styles.taskCard} group`}
                        onClick={() => handleTaskClick(task)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(task.status)}
                            <h3 className="text-base font-medium text-white">
                              {task.name}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`${styles.badge} ${getStatusColor(
                                task.status
                              )}`}
                            >
                              {task.status}
                            </span>
                            <span
                              className={`${styles.badge} flex items-center gap-1 bg-slate-800/50`}
                            >
                              {getPriorityIcon(task.priority)}
                              <span className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </span>
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                          {task.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <CalendarClock className="w-4 h-4 text-slate-400" />
                              <span className="text-xs text-slate-400">
                                {task.dueDate
                                  ? formatDate(task.dueDate)
                                  : "No due date"}
                              </span>
                            </div>
                            {task.comments?.length > 0 && (
                              <div className="flex items-center gap-1">
                                <MessageCircle className="w-4 h-4 text-slate-400" />
                                <span className="text-xs text-slate-400">
                                  {task?.comments?.length}
                                </span>
                              </div>
                            )}
                          </div>

                          {isCurrentUserTask(task) && (
                            <motion.button
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCreateSubtask(task._id);
                              }}
                              className="px-3 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 transition-all duration-300 flex items-center gap-1.5 opacity-0 group-hover:opacity-100"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span className="text-xs font-medium">
                                Subtasks
                              </span>
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedTask(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${styles.glassEffect} rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(selectedTask.status)}
                    <h2 className="text-2xl font-display font-bold text-white">
                      {selectedTask.name}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCurrentUserTask(selectedTask) && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleCreateSubtask(String(selectedTask._id))}
                        className="p-2 bg-indigo-500/20 text-indigo-400 rounded-full hover:bg-indigo-500/30 transition-colors"
                      >
                        <PlusCircle className="h-5 w-5" />
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedTask(null)}
                      className="p-2 hover:bg-slate-800/50 rounded-full transition-colors"
                    >
                      <X className="h-5 w-5 text-slate-400" />
                    </motion.button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm text-slate-400">Status</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        selectedTask.status
                      )} w-fit`}
                    >
                      {selectedTask.status}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-sm text-slate-400">Priority</span>
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-slate-800/50 w-fit">
                      {getPriorityIcon(selectedTask.priority)}
                      <span className={getPriorityColor(selectedTask.priority)}>
                        {selectedTask.priority}
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-sm text-slate-400">Due Date</span>
                    <span className="flex items-center gap-1 text-sm text-white">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      {selectedTask.dueDate
                        ? formatDate(selectedTask.dueDate)
                        : "No due date"}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Description
                  </h3>
                  <div className="p-4 rounded-xl bg-slate-800/50 text-slate-300">
                    {selectedTask.description || "No description provided."}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Project
                  </h3>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 w-fit">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Briefcase className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {selectedTask.project?.name || "No project assigned"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {selectedTask.project?.category ||
                          "No category assigned"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Comments
                  </h3>
                  <div className="space-y-4 mb-4">
                    {comments && comments.length > 0 ? (
                      comments?.map((comment, index) => (
                        <div
                          key={comment._id || index}
                          className="p-4 rounded-xl bg-slate-800/50"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <img
                              src={`${S3_PATH}/${comment?.authorId?.profilePic}`}
                              alt={comment.authorId?.name || "Author"}
                              className="w-8 h-8 rounded-lg ring-1 ring-indigo-500/20"
                            />
                            <div>
                              <p className="text-sm font-medium text-white">
                                {comment.authorId?.name || "Unknown User"}
                              </p>
                              <p className="text-xs text-slate-400">
                                {comment.createdAt
                                  ? formatDateTime(comment.createdAt)
                                  : "Unknown date"}
                              </p>
                            </div>
                          </div>
                          <p className="text-slate-300">{comment.content}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-sm">No comments yet.</p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <img
                      src={`${S3_PATH}/${user?.profilePic}`}
                      alt="Your avatar"
                      className="w-8 h-8 rounded-lg ring-1 ring-indigo-500/20"
                    />
                    <div className="flex-1">
                      <textarea
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder-slate-400 mb-2"
                        rows={3}
                      />
                      <div className="flex justify-end">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleAddComment}
                          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-white font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300"
                        >
                          Add Comment
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeeTasks;
