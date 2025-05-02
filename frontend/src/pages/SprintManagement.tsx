import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  BarChart3,
  ListTodo,
  Plus,
  X,
  Clock,
  CheckCircle2,
  Sparkles,
  Bell,
  Search,
  GripHorizontal,
  Users,
  Pencil,
} from "lucide-react";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";
import { Sprint, NewSprintData } from "../types";
import SidebarNav from "../components/dashboard/Sidebar";
import UserMenuDropdown from "../components/Design/UserMenuDropdown";
import NotificationView from "../components/dashboard/NotificationView";
import {
  changeStatus,
  createSprint,
  getAllBacklogs,
  getAllSprints,
  Update,
} from "../services/SprintService";
import { useSearchParams } from "react-router-dom";
import { fetchAllTasks } from "../services/TaskService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export type TaskStatus = "backlog" | "todo" | "in-progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";
export type SprintStatus = "planning" | "active" | "completed";

export interface Task {
  id: string;
  title: string;
  name?: string;
  status: TaskStatus;
  points: number;
  assignee?: string;
  priority: TaskPriority;
  createdAt: Date;
  updatedAt: Date;
  sprintId?: string;
}

type StatusEditingTask = {
  id: string;
  status: "backlog" | "todo" | "in-progress" | "completed";
};

const SprintManagement: React.FC = () => {
  const [backlogTasks, setBacklogTasks] = useState<Task[]>([]);

  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedSprint, setSelectedSprint] = useState<string | null>(
    sprints[0]?.id || null
  );
  const [showCreateSprint, setShowCreateSprint] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [expandedSprint, setExpandedSprint] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [statusEditingTask, setStatusEditingTask] =
    useState<StatusEditingTask | null>(null);
  const [todoTasks, setTodoTasks] = useState<Task[]>([]);
  const [inProgressTasks, setInProgressTasks] = useState<Task[]>([]);
  const [doneTasks, setDoneTasks] = useState<Task[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const [newSprintData, setNewSprintData] = useState<NewSprintData>({
    name: "",
    startDate: "",
    endDate: "",
  });

  const burndownData: ChartData<"line"> = {
    labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"],
    datasets: [
      {
        label: "Ideal Burndown",
        data: [20, 15, 10, 5, 0],
        borderColor: "rgba(99, 102, 241, 0.5)",
        borderDash: [5, 5],
        tension: 0.1,
      },
      {
        label: "Actual Burndown",
        data: [20, 18, 13, 8, 4],
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        tension: 0.1,
        fill: true,
      },
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(148, 163, 184, 0.1)",
        },
        ticks: {
          color: "#94a3b8",
        },
      },
      x: {
        grid: {
          color: "rgba(148, 163, 184, 0.1)",
        },
        ticks: {
          color: "#94a3b8",
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "#94a3b8",
        },
      },
    },
  };

  const fetchSprints = async () => {
    if (!projectId) return;
    try {
      const data = await getAllSprints(projectId);
      setSprints(data);
    } catch (error) {
      console.error("Error fetching sprints:", error);
    }
  };

  useEffect(() => {
    fetchSprints();
  }, []);

  const fetchBacklogs = async () => {
    if (!projectId) return;
    try {
      const result = await getAllBacklogs(projectId);
      setBacklogTasks(result);
    } catch (error) {
      console.error("Error fetching backlogs:", error);
    }
  };
  useEffect(() => {
    fetchBacklogs();
  }, []);

  const fetchTasks = async (projectId: string) => {
    try {
      const response = await fetchAllTasks(projectId);
      setTasks(response);
    } catch (error) {
      console.log("error in fetching tasks", error);
    }
  };
  useEffect(() => {
    if (!projectId) return;
    fetchTasks(projectId);
  }, []);

  useEffect(() => {
    setTodoTasks(tasks.filter((task) => task.status === "todo"));
    setInProgressTasks(tasks.filter((task) => task.status === "in-progress"));
    setDoneTasks(tasks.filter((task) => task.status === "completed"));
    setBacklogTasks(tasks.filter((task) => task.status === "backlog"));
  }, [tasks]);

  const handleCreateSprint = async (): Promise<void> => {
    if (
      !newSprintData.name ||
      !newSprintData.startDate ||
      !newSprintData.endDate ||
      !projectId
    ) {
      return;
    }

    const sprintPayload = {
      name: newSprintData.name,
      startDate: new Date(newSprintData.startDate),
      endDate: new Date(newSprintData.endDate),
      status: "planning",
      projectId,
    };

    const result = await createSprint(sprintPayload);
    setSprints([...sprints, result]);
    setSelectedSprint(result._id);
    setShowCreateSprint(false);
    setNewSprintData({ name: "", startDate: "", endDate: "" });
  };

  const handleEditTask = async (task: Task) => {
    setEditingTask(task);
  };

  const handleEditTaskStatus = async (task: Task) => {
    setStatusEditingTask(task);
  };

  const handleSaveTask = async (task: Task) => {
    try {
      const response = await changeStatus(
        task.id,
        task.status,
        (task as any).sprintId
      );

      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === task.id
            ? { ...t, status: task.status, sprintId: task.sprintId }
            : t
        )
      );

      if (task.status === "backlog") {
        setBacklogTasks((prevTasks) =>
          prevTasks.filter((t) => t.id !== task.id)
        );
      }

      if (task.status === "todo") {
        setTodoTasks((prevTasks) => [...prevTasks, task]);
      }

      setEditingTask(null);
    } catch (error) {
      console.log(error);
    }
  };

  const getTasksByStatus = (tasks: any[], status: string, sprintId: string) => {
    return tasks.filter(
      (task) => task.status === status && task.sprintId === sprintId
    );
  };

  const handleUpdateStatusTask = async (task: StatusEditingTask) => {
    try {
      const result = await Update(task);
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === task.id ? { ...t, status: task.status } : t
        )
      );
      setStatusEditingTask(null);
      console.log(result, "result in update status");
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };


  

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "text-slate-400";
      case "active":
        return "text-emerald-400";
      case "completed":
        return "text-indigo-400";
      default:
        return "text-slate-400";
    }
  };

  return (
    <div className="flex min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-900 to-indigo-950">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="fixed top-0 left-0 h-full w-72 bg-gradient-to-br from-slate-800/40 via-slate-800/20 to-slate-900/30 backdrop-blur-xl border-r border-slate-700/50 z-20"
      >
        <div className="p-8">
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-xl blur-xl"></div>
              <div className="relative p-2.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
                <Sparkles className="w-6 h-6 text-white animate-pulse" />
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
      </motion.aside>

      {/* Main Content */}
      <div className="pl-72 flex-1">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-10 backdrop-blur-xl bg-slate-900/50 border-b border-slate-700/50"
        >
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    className="pl-9 pr-4 py-2 w-64 bg-slate-800/50 text-sm rounded-lg border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 placeholder-slate-400 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCreateSprint(true)}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-600 transition-colors duration-200 shadow-lg shadow-indigo-500/20"
                >
                  <Plus className="w-5 h-5" />
                  Create Sprint
                </motion.button>

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
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt="Profile"
                    className="w-8 h-8 rounded-lg ring-2 ring-indigo-500/20"
                  />
                  <UserMenuDropdown />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Content Area */}
        <div className="p-8">
          <div className="grid grid-cols-12 gap-6">
            {/* Backlog Column */}
            <div className="col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 backdrop-blur-xl sticky top-24"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ListTodo className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-lg font-semibold text-white">
                      Backlog
                    </h2>
                  </div>
                  <span className="px-2.5 py-1 bg-slate-700/50 rounded-lg text-sm text-slate-300 font-medium">
                    {backlogTasks.length} items
                  </span>
                </div>

                {/* Rendering tasks without drag-and-drop */}
                <div className="space-y-3">
                  {backlogTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      className="group bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 hover:border-indigo-500/50 transition-all duration-200 hover:bg-slate-700/40"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-medium">{task.name}</h3>
                        <div className="flex items-center gap-1.5">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-1.5 rounded-md text-slate-400 hover:bg-indigo-500/20 hover:text-indigo-300 transition-all duration-200 opacity-0 group-hover:opacity-100"
                            onClick={() => handleEditTask(task)}
                          >
                            <Pencil className="w-4 h-4" />
                            <span className="sr-only">Edit task</span>
                          </motion.button>
                          <GripHorizontal className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            task.priority === "high"
                              ? "bg-rose-500/20 text-rose-300"
                              : task.priority === "medium"
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-emerald-500/20 text-emerald-300"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sprints Column */}
            <div className="col-span-9">
              <div className="space-y-6">
                {sprints.map((sprint) => (
                  <motion.div
                    key={sprint.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800/30 rounded-xl border border-slate-700/50 backdrop-blur-xl overflow-hidden"
                  >
                    <div
                      className="p-6 cursor-pointer"
                      onClick={() =>
                        setExpandedSprint(
                          expandedSprint === sprint.id ? null : sprint.id
                        )
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-semibold text-white mb-2">
                            {sprint.name}
                          </h2>
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              {new Date(
                                sprint.startDate
                              ).toLocaleDateString()}{" "}
                              - {new Date(sprint.endDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              <span
                                className={`capitalize ${getStatusColor(
                                  sprint.status
                                )}`}
                              >
                                {sprint.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {expandedSprint === sprint.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-6 pb-6">
                          {/* Burndown Chart */}
                          <div className="mb-6 bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
                            <div className="flex items-center gap-2 mb-4">
                              <BarChart3 className="w-5 h-5 text-indigo-400" />
                              <h3 className="text-lg font-semibold text-white">
                                Sprint Progress
                              </h3>
                            </div>
                            <div className="h-64">
                              <Line
                                data={burndownData}
                                options={chartOptions}
                              />
                            </div>
                          </div>

                          {/* Sprint Tasks */}
                          <div className="grid grid-cols-3 gap-4">
                            {["todo", "in-progress", "completed"].map(
                              (status) => (
                                <div
                                  key={status}
                                  className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50"
                                >
                                  <div className="flex items-center gap-2 mb-4">
                                    {status === "todo" && (
                                      <ListTodo className="w-5 h-5 text-slate-400" />
                                    )}
                                    {status === "in-progress" && (
                                      <Clock className="w-5 h-5 text-amber-400" />
                                    )}
                                    {status === "completed" && (
                                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                    )}
                                    <h3 className="text-lg font-semibold text-white capitalize">
                                      {status.replace("-", " ")}
                                    </h3>
                                  </div>
                                  <div className="space-y-3">
                                    {getTasksByStatus(
                                      tasks,
                                      status,
                                      sprint.id
                                    ).map((task) => (
                                      <div
                                        key={task.id}
                                        className="group bg-slate-800/50 p-3 rounded-lg border border-slate-700/50"
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <h4 className="text-white font-medium">
                                            {task.name}
                                          </h4>
                                          <div className="flex items-center gap-1.5">
                                            <motion.button
                                              whileHover={{ scale: 1.05 }}
                                              whileTap={{ scale: 0.95 }}
                                              className="p-1.5 rounded-md text-slate-400 hover:bg-indigo-500/20 hover:text-indigo-300 transition-all duration-200 opacity-0 group-hover:opacity-100"
                                              onClick={() =>
                                                handleEditTaskStatus(task)
                                              }
                                            >
                                              <Pencil className="w-4 h-4" />
                                              <span className="sr-only">
                                                Edit task
                                              </span>
                                            </motion.button>
                                            <GripHorizontal className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded text-xs font-medium">
                                            {task.priority} priority
                                          </span>
                                          <div className="flex items-center gap-1 ml-auto">
                                            <Users className="w-4 h-4 text-slate-400" />
                                            <span className="text-xs text-slate-400">
                                              {task.assignedUser?.name ||
                                                "Unassigned"}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Sprint Modal */}
      <AnimatePresence>
        {showCreateSprint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700 shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Create New Sprint
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowCreateSprint(false)}
                  className="text-slate-400 hover:text-white transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Sprint Name
                  </label>
                  <input
                    type="text"
                    value={newSprintData.name}
                    onChange={(e) =>
                      setNewSprintData({
                        ...newSprintData,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-slate-900/50 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-slate-500"
                    placeholder="Sprint 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newSprintData.startDate}
                    onChange={(e) =>
                      setNewSprintData({
                        ...newSprintData,
                        startDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-slate-900/50 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newSprintData.endDate}
                    onChange={(e) =>
                      setNewSprintData({
                        ...newSprintData,
                        endDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-slate-900/50 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCreateSprint(false)}
                  className="px-4 py-2 text-slate-300 hover:text-white transition-colors duration-200"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateSprint}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors duration-200 shadow-lg shadow-indigo-500/20"
                >
                  Create Sprint
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {editingTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700 shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Edit Task</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setEditingTask(null)}
                  className="text-slate-400 hover:text-white transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Sprint
                  </label>
                  <select
                    value={editingTask?.sprintId || ""}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        sprintId: e.target.value,
                        status: e.target.value ? "todo" : "backlog",
                      })
                    }
                    className="w-full px-4 py-2.5 bg-slate-900/50 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white"
                  >
                    <option value="">None</option>
                    {sprints.map((sprint) => (
                      <option key={sprint.id} value={sprint.id}>
                        {sprint.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div></div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 text-slate-300 hover:text-white transition-colors duration-200"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSaveTask(editingTask)}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors duration-200 shadow-lg shadow-indigo-500/20"
                >
                  Save Changes
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {statusEditingTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-slate-700 shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Edit Task</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setStatusEditingTask(null)}
                  className="text-slate-400 hover:text-white transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Status
                  </label>
                  <select
                    value={statusEditingTask?.status}
                    onChange={(e) =>
                      setStatusEditingTask({
                        ...statusEditingTask,
                        status: e.target.value as
                          | "backlog"
                          | "todo"
                          | "in-progress"
                          | "completed",
                      })
                    }
                    className="w-full px-4 py-2.5 bg-slate-900/50 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white"
                  >
                    <option value="backlog">Backlog</option>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div></div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStatusEditingTask(null)}
                  className="px-4 py-2 text-slate-300 hover:text-white transition-colors duration-200"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleUpdateStatusTask(statusEditingTask)}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors duration-200 shadow-lg shadow-indigo-500/20"
                >
                  Save Changes
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SprintManagement;
