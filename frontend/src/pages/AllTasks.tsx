import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { fetchProjectById } from "../services/ProjectServices";
import { toast } from "sonner";
import { Task, Project, Comment, TeamMember } from "../types";
import { styles } from "../styles/styles";
import { taskCreateSchema, taskUpdateSchema } from "../schemas/taskSchema";
import { fetchComment } from "../services/CommentService";
import { addComment } from "../services/CommentService";
import io from "socket.io-client";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Bell,
  Search,
  Plus,
  ExternalLink,
  Calendar,
  Sparkles,
  FileText,
  X,
  Filter,
  ArrowRight,
  PieChart,
  Paperclip,
  MessageCircle,
  CheckSquare,
  Circle,
  CalendarClock,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit3,
  Save,
  AlertTriangle,
  CheckCheck,
  Loader2,
  Pencil,
} from "lucide-react";
import { z } from "zod";
import SidebarNav from "../components/dashboard/Sidebar";
import UserProfileCard from "../components/Design/UserProfileCard";
import UserMenuDropdown from "../components/Design/UserMenuDropdown";
import {
  createTask,
  deleteTask,
  fetchAllTasks,
  updateTask,
} from "../services/TaskService";

const S3_PATH = import.meta.env.VITE_AWSS3_PATH;
const socket = io(import.meta.env.VITE_BACKEND_URL);
const AllTasks = () => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});
  const [teamMembers, setTeamMembers] = useState([]);
  const [taskFilter, setTaskFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [comments, setComments] = useState(selectedTask?.comments || []);
  const [projects, setProjects] = useState<Project>({} as Project);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    status: "backlog",
    priority: "medium",
    dueDate: "",
    assignedTo: "",
  });
  const [newComment, setNewComment] = useState("");
  const [myTeam, setMyTeam] = useState<TeamMember[]>([])
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
  const { projectId } = useParams();

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

  console.log(projects, "projects")

  const getUniqueTeamMembers = (projects: any) => {
    const teamMember = new Set();

    if (!teamMember.has(projects.teamLeadId)) {
      teamMember.add({ ...projects.teamLeadId, role: "Team Lead" });
    }
    projects.teamMembersDetails.forEach((member: any) => {
      if (!teamMember.has(member)) {
        teamMember.add(member);
      }
    });

    const members = [...teamMember];
    const lastmembers = getUniqueMembers(members);
    console.log(lastmembers,' last members')
    setMyTeam(lastmembers);
  };

  const getUniqueMembers = (members: any) => {
    const uniqueMembersMap = new Map();

    members.forEach((member: any) => {
      if (!uniqueMembersMap.has(member._id)) {
        uniqueMembersMap.set(member._id, member);
      }
    });

    return Array.from(uniqueMembersMap.values());
  };

  useEffect(() => {
    if (!projectId) {
      console.log("No projectId found, skipping request.");
      return;
    }
    const loadProjects = async () => {
      const data = await fetchProjectById(projectId);
      console.log(data, "data");
      setTeamMembers(data.teamMembersDetails);
      getUniqueTeamMembers(data);
      setProjects(data);
    };
    loadProjects();
  }, []);

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

  const fetchTasks = async () => {
    if (!projectId) return;

    try {
      const result = await fetchAllTasks(projectId);
      setTasks(result);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const token = localStorage.getItem("accessToken");
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  console.log(userId, "user id");

  let teamLeadId = "";
  if (token) {
    const decodedToken: any = jwtDecode(token);

    teamLeadId = decodedToken.id;
  }

  const handleCreateTask = async () => {
    try {
      setIsLoading(true);

      taskCreateSchema.parse(newTask);

      const taskData = {
        projectId,
        name: newTask.title,
        description: newTask.description,
        userId: teamLeadId,
        assignedTo: newTask.assignedTo,
        status: newTask.status,
        priority: newTask.priority,
        dueDate: newTask.dueDate,
      };

      const responseData = await createTask(taskData);
      console.log(responseData, "response of create task");

      const assignedToId = responseData.assignedTo?._id || null;

      const newTaskFormatted: Task = {

        id: responseData._id,
        name: responseData.name,  // Map API 'name' to frontend 'title'
        description: responseData.description,
        status: responseData.status,
        priority: responseData.priority,
        dueDate: responseData.dueDate,
        projectId: responseData.projectId,
        userId: responseData.userId,
        assignedTo: assignedToId,
        createdAt: responseData.createdAt,
        updatedAt: responseData.updatedAt,
        assignedUser: responseData.assignedTo,
        
        // Required fields
        comments: [],
        attachments: [],
        project: {
          name: responseData.project?.name || "Default Project",
          category: responseData.project?.category || "General"
        }
      };

      // Update state with new task
      setTasks((prevTasks) => [...prevTasks, newTaskFormatted]);

      setShowCreateTaskModal(false);

      // Reset new task form
      setNewTask({
        title: "",
        description: "",
        status: "backlog",
        priority: "medium",
        dueDate: "",
      });

      // Show success message
      setActionSuccess({
        show: true,
        message: "Task created successfully!",
        type: "success",
      });

      setTimeout(() => {
        setActionSuccess({ show: false, message: "", type: "success" });
      }, 3000);
    } catch (error) {
      if (error instanceof z.ZodError) {

        error.errors.forEach((err) => toast.error(err.message));
      } else {
        console.error("Error creating task:", error);
        setActionSuccess({
          show: true,
          message: "Failed to create task. Please try again.",
          type: "error",
        });

        setTimeout(() => {
          setActionSuccess({ show: false, message: "", type: "error" });
        }, 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTask = async () => {
    if (!selectedTask) return;

    try {
      setIsLoading(true);

      taskUpdateSchema.parse({
        title: editedTask.title || selectedTask.name,
        description: editedTask.description || selectedTask.description,
        status: editedTask.status || selectedTask.status,
        priority: editedTask.priority || selectedTask.priority,
        dueDate: editedTask.dueDate || selectedTask.dueDate,
        assignedTo:
          editedTask.assignedTo || selectedTask.assignedUser?._id || "",
      });

      const taskId = selectedTask.id;

      const updatedTaskData = {
        name: editedTask.title || selectedTask.name,
        description: editedTask.description || selectedTask.description,
        status: editedTask.status || selectedTask.status,
        priority: editedTask.priority || selectedTask.priority,
        dueDate: editedTask.dueDate || selectedTask.dueDate,
        assignedTo:
          editedTask.assignedTo || selectedTask.assignedUser?._id || "",
      };

      if (!taskId) {
        throw new Error("Task ID is missing!");
      }

      const responseData = await updateTask(taskId.toString(), updatedTaskData);

      setTasks((prevTasks: any) =>
        prevTasks.map((task: any) =>
          task.id === taskId ? { ...task, ...responseData } : task
        )
      );

      setIsEditingTask(false);
      setSelectedTask(null);

      setActionSuccess({
        show: true,
        message: "Task updated successfully!",
        type: "success",
      });

      setTimeout(() => {
        setActionSuccess({ show: false, message: "", type: "success" });
      }, 3000);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast.error(err.message);
        });
      } else {
        console.error("Error updating task:", error);
        setActionSuccess({
          show: true,
          message: "Failed to update task. Please try again.",
          type: "error",
        });

        setTimeout(() => {
          setActionSuccess({ show: false, message: "", type: "error" });
        }, 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    console.log("Deleting task full:", selectedTask);
    console.log("selected task", tasks);
    if (!selectedTask) return;

    try {
      setIsLoading(true);
      console.log("Deleting task:", selectedTask.id);
      const id = selectedTask.id;
      if (!id) throw new Error("Task ID is missing!");

      await deleteTask(id.toString());

      setTasks(tasks.filter((task) => task.id !== selectedTask.id));

      setShowDeleteConfirmation(false);
      setSelectedTask(null);

      setActionSuccess({
        show: true,
        message: "Task deleted successfully!",
        type: "success",
      });

      setTimeout(() => {
        setActionSuccess({
          show: false,
          message: "",
          type: "success",
        });
      }, 3000);
    } catch (error) {
      console.error("Error deleting task:", error);
      setActionSuccess({
        show: true,
        message: "Failed to delete task. Please try again.",
        type: "error",
      });

      setTimeout(() => {
        setActionSuccess({
          show: false,
          message: "",
          type: "error",
        });
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTasks =
    tasks?.filter((task: any) => {
      if (taskFilter !== "all" && task.status !== taskFilter) return false;
      if (
        searchQuery &&
        !task.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    }) || []; // Default to empty array

  const user = useSelector((state: RootState) => state.auth.user);

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

  const handleEditClick = () => {
    setIsEditingTask(true);
  };

  const handleCancelEdit = () => {
    setIsEditingTask(false);
    setEditedTask({
      title: selectedTask?.name,
      description: selectedTask?.description,
      status: selectedTask?.status,
      priority: selectedTask?.priority,
      dueDate: selectedTask?.dueDate,
      assignedTo: selectedTask?.assignedUser?._id || "",
    });
  };

  const fetchComments = async (taskId: string) => {
      try {
        const result = await fetchComment(taskId);
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
      if (selectedTask?.id) {
        fetchComments(selectedTask.id.toString());
        socket.emit("join-task", selectedTask.id);
      }
  
      return () => {
        if (selectedTask?.id) {
          socket.emit("leave-task", selectedTask.id);
        }
      };
    }, [selectedTask]);
  
    const handleAddComment = async () => {
      if (!selectedTask || !newComment.trim()) return;
      if(!userId)return 
      const result = await addComment(selectedTask.id.toString(), newComment, userId);
  
      socket.emit("add-comment", {
        comment: result
      });
  
      setComments(prev => [...prev, result]);
      fetchComments(selectedTask.id.toString());
      setNewComment("");
    };

    useEffect(() => {
      const handleNewComment = (comment: Comment) => {
        console.log(comment.taskId, "comment task id");
        console.log(selectedTask?.id, "selected task id");
        if (comment.taskId.toString() === selectedTask?.id.toString()) {
          fetchComments(comment.taskId);
        }
      };
  
      socket.on("add-comment", handleNewComment);
  
      return () => {
        socket.off("add-comment", handleNewComment);
      };
    }, [selectedTask?.id]);
    console.log(selectedTask,'selected task')
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
                <Sparkles
                  className={`w-6 h-6 text-white ${styles.sparkleIcon}`}
                />
              </div>
            </div>
            <div>
              <h1 className="font-display font-bold text-xl bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                TeamVerse
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
                <h1 className="text-2xl font-display font-bold text-white">
                  Project Details
                </h1>
              </div>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-9 pr-4 py-2 w-64 bg-slate-800/50 text-sm rounded-lg border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 placeholder-slate-400"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group"
                >
                  <Bell className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors duration-200" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-slate-900"></span>
                </motion.button>

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

        {/* Project Details Content */}
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-12 gap-8">
              {/* Project Details Column */}
              <div className="col-span-5">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className={`${styles.glassEffect} rounded-2xl overflow-hidden mb-8`}
                >
                  <div className="relative h-48">
                    <img
                      src={
                        projects.image
                          ? `${S3_PATH}/${projects.image}`
                          : "https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                      }
                      alt={projects?.name || "Project Image"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-6 right-6">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            projects?.status || "In-progress"
                          )}`}
                        >
                          {projects?.status || "In Progress"}
                        </span>
                        <span
                          className={`text-sm font-medium ${getPriorityColor(
                            projects.priority || "High"
                          )} bg-slate-900/90 px-3 py-1 rounded-full ring-1 ring-slate-700/50`}
                        >
                          {projects?.priority || "High"} Priority
                        </span>
                      </div>
                      <h2 className="text-2xl font-display font-bold text-white">
                        {projects?.name || "Project Name"}
                      </h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Description
                      </h3>
                      <p className="text-slate-400">
                        {projects?.description || "No description available."}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50">
                        <Calendar className="h-5 w-5 text-indigo-400" />
                        <div>
                          <p className="text-sm font-medium text-slate-100">
                            Timeline
                          </p>
                          {projects && projects.startDate && (
                            <p className="text-sm text-slate-400">
                              {formatDate(projects?.startDate)} -{" "}
                              {formatDate(projects?.endDate || "")}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50">
                        <PieChart className="h-5 w-5 text-indigo-400" />
                        <div>
                          <p className="text-sm font-medium text-slate-100">
                            Category
                          </p>
                          <p className="text-sm text-slate-400">
                            {projects?.category || "General"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Progress
                      </h3>
                      <div className="h-2 w-full bg-slate-700/50 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `65%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-100">
                          65% Complete
                        </span>
                        <span className="text-slate-400">Target: 100%</span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Team
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {myTeam && myTeam.length > 0 ? (
                          myTeam.map((member: any, index) => (
                            <motion.div
                              key={member._id || index}
                              whileHover={{ scale: 1.05 }}
                              className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/50 border border-slate-700/50"
                            >
                              <img
                                src={
                                  `${S3_PATH}/${member?.profilePic}` ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    member.name
                                  )}&background=6366f1&color=fff`
                                }
                                alt={member.name}
                                className="w-8 h-8 rounded-lg ring-1 ring-indigo-500/20"
                              />
                              <div>
                                <p className="text-sm font-medium text-slate-100">
                                  {member.name}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {member.role}
                                </p>
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <p className="text-slate-400">
                            No team members assigned.
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Documents
                      </h3>
                      <div className="space-y-3">
                        {projects.documents && projects.documents.length > 0 ? (
                          projects.documents.map((doc: File | string, index) => (
                            <motion.div
                              key={index}
                              whileHover={{ scale: 1.02 }}
                              className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-indigo-500/10">
                                  <FileText className="h-5 w-5 text-indigo-400" />
                                </div>
                                <div>
                                <p className="text-sm font-medium text-slate-100">
                {typeof doc === 'string'
                  ? doc.split("/").pop()?.split("-").slice(1).join("-") || 'Document'
                  : doc.name.split("-").slice(1).join("-")}
              </p>
                                </div>
                              </div>
                              <button className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors">
                                <ExternalLink className="h-4 w-4 text-slate-400" />
                              </button>
                            </motion.div>
                          ))
                        ) : (
                          <p className="text-slate-400">
                            No documents available.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Tasks Column */}
              <div className="col-span-7">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className={`${styles.glassEffect} rounded-2xl p-6 mb-8`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-display font-bold text-white">
                      Tasks
                    </h2>
                    {projects?.teamLeadId?._id === userId && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowCreateTaskModal(true)}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-white font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Create Task
                      </motion.button>
                    )}
                  </div>

                  <div>
                    {/* Filters & Search */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        {["all", "todo", "in-progress", "completed"].map(
                          (status) => (
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
                                : status.charAt(0).toUpperCase() +
                                  status.slice(1)}
                            </button>
                          )
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 w-48 bg-slate-800/50 text-sm rounded-lg border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 placeholder-slate-400"
                          />
                        </div>
                        <button className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-colors">
                          <Filter className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    </div>

                    {/* Task List */}
                    <div className="space-y-4">
                      {filteredTasks.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-slate-400">
                            No tasks found matching your criteria.
                          </p>
                        </div>
                      ) : (
                        filteredTasks.map((task: any, index) => (
                          <motion.div
                            key={index}
                            whileHover={{ scale: 1.01 }}
                            className="p-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 cursor-pointer transition-all border border-slate-700/30 hover:border-indigo-500/30"
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
                                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    task.status
                                  )}`}
                                >
                                  {task.status}
                                </span>
                                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/50">
                                  {getPriorityIcon(task.priority)}
                                  <span
                                    className={getPriorityColor(task.priority)}
                                  >
                                    {task.priority}
                                  </span>
                                </span>
                                <div className="relative group">
                                  <motion.div
                                    whileHover={{ rotate: 180 }}
                                    transition={{ duration: 0.3 }}
                                    className="p-1.5 rounded-full hover:bg-slate-700/70"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTaskClick(task);
                                      handleEditClick();
                                    }}
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                                  </motion.div>
                                  <div className="absolute right-0 top-full mt-1 w-24 bg-slate-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                    {projects?.teamLeadId?._id === userId && (
                                      <>
                                        <button
                                          className="w-full text-left px-3 py-2 text-xs text-white hover:bg-slate-700 rounded-t-lg flex items-center gap-2"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleTaskClick(task);
                                            handleEditClick();
                                          }}
                                        >
                                          <Pencil className="w-3 h-3" /> Edit
                                        </button>
                                        <button
                                          className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/20 rounded-b-lg flex items-center gap-2"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleTaskClick(task);
                                            setShowDeleteConfirmation(true);
                                          }}
                                        >
                                          <Trash2 className="w-3 h-3" /> Delete
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                              {task.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <img
                                  src={
                                    `${S3_PATH}/${task?.assignedUser?.profilePic}` ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                      task?.assignedUser?.name || "User"
                                    )}&background=6366f1&color=fff`
                                  }
                                  alt={task?.assignedUser?.name || "Assignee"}
                                  className="w-6 h-6 rounded-full ring-1 ring-indigo-500/20"
                                />
                                <span className="text-xs text-slate-400">
                                  {task?.assignedUser?.name || "Unassigned"}
                                </span>
                              </div>
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
                                {task?.attachments?.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Paperclip className="w-4 h-4 text-slate-400" />
                                    <span className="text-xs text-slate-400">
                                      {task.attachments.length}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && !isEditingTask && !showDeleteConfirmation && (
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
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 180 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      onClick={handleEditClick}
                      className="p-2 bg-indigo-500/20 text-indigo-400 rounded-full hover:bg-indigo-500/30 transition-colors"
                    >
                      <Edit3 className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowDeleteConfirmation(true)}
                      className="p-2 bg-rose-500/20 text-rose-400 rounded-full hover:bg-rose-500/30 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </motion.button>
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
                    Assignee
                  </h3>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 w-fit">
                    <img
                      src={
                        `${S3_PATH}/${selectedTask.assignedUser?.profilePic}` ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          selectedTask.assignedUser?.name || "User"
                        )}&background=6366f1&color=fff`
                      }
                      alt={selectedTask.assignedUser?.name || "Assignee"}
                      className="w-8 h-8 rounded-lg ring-1 ring-indigo-500/20"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {selectedTask.assignedUser?.name || "Unassigned"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {selectedTask.assignedUser?.role || "Team Member"}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedTask.attachments &&
                  selectedTask.attachments.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Attachments
                      </h3>
                      <div className="space-y-2">
                        {selectedTask.attachments.map((attachment, index) => (
                          <motion.div
                            key={attachment.id || index}
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-indigo-500/10">
                                <Paperclip className="h-4 w-4 text-indigo-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">
                                  {attachment.name}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {attachment.size} • {attachment.type}
                                </p>
                              </div>
                            </div>
                            <button className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors">
                              <ExternalLink className="h-4 w-4 text-slate-400" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

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
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
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

      {/* Edit Task Modal */}
      <AnimatePresence>
        {selectedTask && isEditingTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${styles.glassEffect} rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-display font-bold text-white">
                    Edit Task
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCancelEdit}
                    className="p-2 hover:bg-slate-800/50 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-slate-400" />
                  </motion.button>
                </div>

                <form
                  className="space-y-6"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateTask();
                  }}
                >
                  <div>
                    <label className={styles.label}>Task Title</label>
                    <input
                      type="text"
                      value={editedTask.title || ""}
                      onChange={(e) =>
                        setEditedTask({ ...editedTask, title: e.target.value })
                      }
                      className={styles.input}
                      placeholder="Enter task title"
                    />
                  </div>

                  <div>
                    <label className={styles.label}>Description</label>
                    <textarea
                      value={editedTask.description || ""}
                      onChange={(e) =>
                        setEditedTask({
                          ...editedTask,
                          description: e.target.value,
                        })
                      }
                      className={styles.input}
                      placeholder="Enter task description"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className={styles.label}>Status</label>
                      <select
                        value={editedTask.status || ""}
                        onChange={(e) =>
                          setEditedTask({
                            ...editedTask,
                            status: e.target.value as any,
                          })
                        }
                        className={styles.input}
                      >
                        <option value="backlog">Backlogs</option>
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className={styles.label}>Priority</label>
                      <select
                        value={editedTask.priority || ""}
                        onChange={(e) =>
                          setEditedTask({
                            ...editedTask,
                            priority: e.target.value as any,
                          })
                        }
                        className={styles.input}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={styles.label}>Due Date</label>
                    <input
                      type="date"
                      value={
                        editedTask.dueDate
                          ? new Date(editedTask.dueDate)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setEditedTask({
                          ...editedTask,
                          dueDate: e.target.value,
                        })
                      }
                      className={styles.input}
                    />
                  </div>

                  <div>
                    <label className={styles.label}>Assignee</label>
                    <select
                      className={styles.input}
                      value={editedTask.assignedTo || ""}
                      onChange={(e) =>
                        setEditedTask({
                          ...editedTask,
                          assignedTo: e.target.value,
                        })
                      }
                    >
                      <option value="">Select an Assignee</option>
                      {teamMembers.map((member: any) => (
                        <option key={member._id} value={member._id}>
                          {member.name} ({member.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800/50 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className={`${styles.button} flex items-center gap-2`}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${styles.glassEffect} rounded-2xl max-w-md w-full overflow-hidden`}
            >
              <div className="p-1">
                <div className="bg-gradient-to-r from-rose-500/20 to-rose-500/10 p-5 rounded-t-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-500/20 rounded-full">
                      <AlertTriangle className="h-6 w-6 text-rose-400" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-white">
                      Delete Task
                    </h3>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-slate-300 mb-6">
                    Are you sure you want to delete the task "
                    {selectedTask?.name}"? This action cannot be undone.
                  </p>

                  <div className="flex justify-end gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowDeleteConfirmation(false)}
                      className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800/50 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDeleteTask}
                      className="px-4 py-2 bg-gradient-to-r from-rose-500 to-rose-600 rounded-lg text-white font-medium shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-all duration-300 flex items-center gap-2"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Delete Task
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Task Modal */}
      <AnimatePresence>
        {showCreateTaskModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${styles.glassEffect} rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-display font-bold text-white">
                    Create New Task
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowCreateTaskModal(false)}
                    className="p-2 hover:bg-slate-800/50 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-slate-400" />
                  </motion.button>
                </div>

                <form
                  className="space-y-6"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCreateTask();
                  }}
                >
                  <div>
                    <label className={styles.label}>Task Title</label>
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={(e) =>
                        setNewTask({ ...newTask, title: e.target.value })
                      }
                      className={styles.input}
                      placeholder="Enter task title"
                    />
                  </div>

                  <div>
                    <label className={styles.label}>Description</label>
                    <textarea
                      value={newTask.description}
                      onChange={(e) =>
                        setNewTask({ ...newTask, description: e.target.value })
                      }
                      className={styles.input}
                      placeholder="Enter task description"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className={styles.label}>Status</label>
                      <select
                        value={newTask.status}
                        onChange={(e) =>
                          setNewTask({
                            ...newTask,
                            status: e.target.value as any,
                          })
                        }
                        className={styles.input}
                      >
                        <option value="backlog">Backlog</option>
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className={styles.label}>Priority</label>
                      <select
                        value={newTask.priority}
                        onChange={(e) =>
                          setNewTask({
                            ...newTask,
                            priority: e.target.value as any,
                          })
                        }
                        className={styles.input}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={styles.label}>Due Date</label>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) =>
                        setNewTask({ ...newTask, dueDate: e.target.value })
                      }
                      className={styles.input}
                    />
                  </div>

                  <div>
                    <label className={styles.label}>Assignee</label>
                    <select
                      className={styles.input}
                      value={newTask.assignedTo}
                      onChange={(e) =>
                        setNewTask({ ...newTask, assignedTo: e.target.value })
                      }
                    >
                      <option value="">Select an Assignee</option>
                      {teamMembers.map((member: any) => (
                        <option key={member._id} value={member._id}>
                          {member.name} ({member.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setShowCreateTaskModal(false)}
                      className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800/50 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className={`${styles.button} flex items-center gap-2`}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Create Task
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AllTasks;
