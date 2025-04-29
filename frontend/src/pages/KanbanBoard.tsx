import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Subtask } from "../types";
import { styles } from "../styles/styles";
import { subtaskSchema, updateSubtaskSchema } from "../schemas/subtaskSchema";
import { z } from "zod";

import {
  Clock,
  CheckCircle,
  Plus,
  Calendar,
  X,
  Clipboard,
  ArrowRight,
  Circle,
  ArrowUp,
  ArrowDown,
  Trash2,
  Save,
  AlertTriangle,
  CheckCheck,
  Loader2,
  ArrowLeft,
  Pencil,
  ChevronRight,
  ListChecks,
  LayoutGrid,
} from "lucide-react";
import {
  createSubtask,
  deleteSubtaskService,
  fetchSubtasks,
  updateSubtaskService,
  updateSubtaskStatusService,
} from "../services/TaskService";

const KanbanBoard = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [parentTask, setParentTask] = useState<any>(null);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSubtask, setSelectedSubtask] = useState<Subtask | null>(null);
  const [newSubtask, setNewSubtask] = useState<Partial<Subtask>>({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    parentTaskId: taskId || "",
  });
  const [actionSuccess, setActionSuccess] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const fetchData = async () => {
    console.log("2");
    setIsLoading(true);
    try {
      if (!taskId) return;
      console.log("3");
      const subtasksResponse = await fetchSubtasks(taskId);
      setSubtasks(
        subtasksResponse.map((subtask: any) => ({
          id: subtask._id,
          title: subtask.title,
          description: subtask.description,
          status: subtask.status,
          priority: subtask.priority,
          dueDate: subtask.dueDate,
        }))
      );
    } catch (error) {
      console.error("Error fetching subtasks:", error);
      setSubtasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      fetchData();
    }
  }, [taskId]);

  const todoTasks = subtasks.filter((task) => task.status === "todo");
  const inProgressTasks = subtasks.filter(
    (task) => task.status === "in-progress"
  );
  const completedTasks = subtasks.filter((task) => task.status === "completed");

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

  const handleCreateSubtask = async () => {
    if (!taskId) {
      setActionSuccess({
        show: true,
        message: "Task ID is missing!",
        type: "error",
      });
      return;
    }

    try {
      // Validate new subtask data using Zod
      subtaskSchema.parse({
        title: newSubtask.title,
        description: newSubtask.description,
        status: newSubtask.status,
        priority: newSubtask.priority,
        dueDate: newSubtask.dueDate,
      });

      const createdSubtask = await createSubtask(taskId, newSubtask);

      await fetchData();
      console.log(createdSubtask, "data");

      setShowCreateModal(false);
      setNewSubtask({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        dueDate: "",
        parentTaskId: taskId,
      });

      setActionSuccess({
        show: true,
        message: "Subtask created successfully!",
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
        console.error("Error creating subtask:", error);
        setActionSuccess({
          show: true,
          message: "Failed to create subtask. Please try again.",
          type: "error",
        });
      }
    }
  };

  const handleUpdateSubtask = async () => {
    if (!selectedSubtask) return;

    try {
      updateSubtaskSchema.parse({
        title: newSubtask.title,
        description: newSubtask.description,
        status: newSubtask.status,
        priority: newSubtask.priority,
        dueDate: newSubtask.dueDate,
      });

      const updatedSubtaskData = {
        title: newSubtask.title,
        description: newSubtask.description,
        status: newSubtask.status,
        priority: newSubtask.priority,
        dueDate: newSubtask.dueDate,
      };

      const updatedSubtask = await updateSubtaskService(
        taskId ?? "",
        selectedSubtask.id,
        updatedSubtaskData
      );

      if (updatedSubtask) {
        const updatedSubtasks = subtasks.map((subtask) =>
          subtask.id === selectedSubtask.id
            ? { ...subtask, ...newSubtask }
            : subtask
        );
        setSubtasks(updatedSubtasks);
      }

      setShowEditModal(false);
      setSelectedSubtask(null);

      setActionSuccess({
        show: true,
        message: "Subtask updated successfully!",
        type: "success",
      });

      setTimeout(() => {
        setActionSuccess({ show: false, message: "", type: "success" });
      }, 3000);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast.error(err.message); // Display validation errors as toast messages
        });
      } else {
        console.error("Error updating subtask:", error);
        setActionSuccess({
          show: true,
          message: "Failed to update subtask. Please try again.",
          type: "error",
        });
      }
    }
  };

  const handleDeleteSubtask = async () => {
    if (!selectedSubtask) return;

    try {
      const isDeleted = await deleteSubtaskService(selectedSubtask.id);

      if (isDeleted) {
        setSubtasks((prevSubtasks) =>
          prevSubtasks.filter((subtask) => subtask.id !== selectedSubtask.id)
        );
      }

      setShowDeleteModal(false);
      setSelectedSubtask(null);

      setActionSuccess({
        show: true,
        message: "Subtask deleted successfully!",
        type: "success",
      });

      setTimeout(() => {
        setActionSuccess({ show: false, message: "", type: "success" });
      }, 3000);
    } catch (error) {
      console.error("Error deleting subtask:", error);
      setActionSuccess({
        show: true,
        message: "Failed to delete subtask!",
        type: "error",
      });
    }
  };

  const handleEditSubtask = (subtask: Subtask) => {
    setSelectedSubtask(subtask);
    setNewSubtask({
      title: subtask.title,
      description: subtask.description,
      status: subtask.status,
      priority: subtask.priority,
      dueDate: subtask.dueDate,
    });
    setShowEditModal(true);
  };

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    )
      return;

    const taskIndex = subtasks.findIndex((t) => t.id === draggableId);
    if (taskIndex === -1) return;

    const newSubtasks = [...subtasks];
    const draggedTask = { ...newSubtasks[taskIndex] };

    const previousStatus = draggedTask.status;
    draggedTask.status = destination.droppableId as
      | "todo"
      | "in-progress"
      | "completed";
    newSubtasks[taskIndex] = draggedTask;

    setSubtasks(newSubtasks);

    try {
      await updateSubtaskStatusService(
        taskId ?? "",
        draggableId,
        draggedTask.status
      );

      setActionSuccess({
        show: true,
        message: "Task status updated successfully!",
        type: "success",
      });

      setTimeout(() => {
        setActionSuccess({ show: false, message: "", type: "success" });
      }, 3000);
    } catch (error) {
      console.error("Error updating task status:", error);

      newSubtasks[taskIndex].status = previousStatus;
      setSubtasks([...newSubtasks]);

      setActionSuccess({
        show: true,
        message: "Failed to update task status!",
        type: "error",
      });
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`sticky top-0 z-10 backdrop-blur-xl bg-slate-900/50 border-b border-slate-700/50`}
      >
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-400" />
              </motion.button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-display font-bold text-white">
                    Subtasks
                  </h1>
                  <ChevronRight className="w-5 h-5 text-slate-500" />
                  <span className="text-lg text-slate-300 font-medium">
                    {parentTask?.name || "Loading..."}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`${styles.badge} ${getStatusColor(
                      parentTask?.status || ""
                    )}`}
                  >
                    {parentTask?.status || ""}
                  </span>
                  <span className="text-xs text-slate-400">
                    Due{" "}
                    {parentTask?.dueDate
                      ? formatDate(parentTask.dueDate)
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-colors">
                  <ListChecks className="w-5 h-5 text-slate-400" />
                </button>
                <button className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
                  <LayoutGrid className="w-5 h-5" />
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateModal(true)}
                className={`${styles.button} flex items-center gap-2`}
              >
                <Plus className="w-4 h-4" />
                Add Subtask
              </motion.button>
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

      {/* Kanban Board */}
      <div className={styles.container}>
        {isLoading ? (
          <div className="flex items-center justify-center h-[calc(100vh-80px)]">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <span className="ml-3 text-xl text-slate-400">
              Loading kanban board...
            </span>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex items-center justify-center h-[calc(100vh-80px)]">
              {" "}
              {/* Center the Kanban board */}
              <div className="p-6">
                <div className="flex gap-6 h-[calc(100vh-120px)]  pb-6 px-2">
                  {/* To Do Column */}
                  <div className={styles.kanbanColumn}>
                    <div className="p-3 border-b border-slate-700/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Circle className="w-4 h-4 text-slate-400" />
                          <h3 className="font-medium text-white">To Do</h3>
                        </div>
                        <span
                          className={`${styles.badge} bg-slate-700/50 text-slate-300`}
                        >
                          {todoTasks.length}
                        </span>
                      </div>
                    </div>

                    <Droppable droppableId="todo">
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="flex-1 p-3 space-y-3"
                        >
                          {todoTasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                              <div className="p-3 rounded-full bg-slate-800/70 mb-3">
                                <Clipboard className="w-6 h-6 text-slate-500" />
                              </div>
                              <p className="text-sm text-slate-500">
                                No tasks to do
                              </p>
                            </div>
                          ) : (
                            todoTasks.map((subtask, index) => (
                              <Draggable
                                key={subtask.id}
                                draggableId={subtask.id}
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    <motion.div
                                      layoutId={subtask.id}
                                      whileHover={{ scale: 1.02 }}
                                      className={`${styles.taskCard} group relative overflow-hidden`}
                                    >
                                      {/* Task Status Indicator */}
                                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-slate-500/20 to-transparent group-hover:via-indigo-500/30 transition-colors duration-300" />

                                      {/* Quick Actions - Appears on Hover */}
                                      <div className="absolute -right-20 top-2 group-hover:right-2 transition-all duration-300 flex items-center gap-1">
                                        <motion.button
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                          onClick={() =>
                                            handleEditSubtask(subtask)
                                          }
                                          className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-indigo-500/20 border border-slate-600/30 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-400 transition-all duration-300"
                                        >
                                          <Pencil className="w-3.5 h-3.5" />
                                        </motion.button>
                                        <motion.button
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                          onClick={() => {
                                            setSelectedSubtask(subtask);
                                            setShowDeleteModal(true);
                                          }}
                                          className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-rose-500/20 border border-slate-600/30 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 transition-all duration-300"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </motion.button>
                                      </div>

                                      {/* Task Content */}
                                      <div className="pl-3">
                                        <div className="flex items-start justify-between mb-2">
                                          <h4 className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors duration-300">
                                            {subtask.title}
                                          </h4>
                                        </div>

                                        <p className="text-xs text-slate-400 mb-3 line-clamp-2 group-hover:text-slate-300 transition-colors duration-300">
                                          {subtask.description}
                                        </p>

                                        <div className="flex items-center justify-between">
                                          <span
                                            className={`${styles.badge} flex items-center gap-1 bg-slate-800/50 group-hover:bg-slate-700/50 transition-colors duration-300`}
                                          >
                                            {getPriorityIcon(subtask.priority)}
                                            <span
                                              className={`${getPriorityColor(
                                                subtask.priority
                                              )} group-hover:opacity-80 transition-opacity duration-300`}
                                            >
                                              {subtask.priority}
                                            </span>
                                          </span>

                                          {subtask.dueDate && (
                                            <div className="flex items-center gap-1 group-hover:text-slate-300 transition-colors duration-300">
                                              <Calendar className="w-3 h-3 text-slate-400" />
                                              <span className="text-xs text-slate-400">
                                                {formatDate(subtask.dueDate)}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {subtask.status === "in-progress" && (
                                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-700/30">
                                          <motion.div
                                            initial={{ width: "0%" }}
                                            animate={{ width: "60%" }}
                                            transition={{
                                              duration: 2,
                                              repeat: Infinity,
                                              repeatType: "reverse",
                                            }}
                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                          />
                                        </div>
                                      )}

                                      {/* Completion Indicator - Only for completed tasks */}
                                      {subtask.status === "completed" && (
                                        <div className="absolute -top-8 -right-8 w-16 h-16 bg-emerald-500/10 rounded-full group-hover:scale-110 transition-transform duration-300">
                                          <CheckCircle className="absolute bottom-3 right-3 w-4 h-4 text-emerald-400" />
                                        </div>
                                      )}
                                    </motion.div>
                                  </div>
                                )}
                              </Draggable>
                            ))
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>

                    <div className="p-3 border-t border-slate-700/50">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setNewSubtask({
                            title: "",
                            description: "",
                            status: "todo",
                            priority: "medium",
                            parentTaskId: taskId || "",
                          });
                          setShowCreateModal(true);
                        }}
                        className="w-full p-2 rounded-lg bg-gradient-to-r from-slate-800/50 to-slate-900/50 hover:from-indigo-500/10 hover:to-purple-500/10 border border-dashed border-slate-700 hover:border-indigo-500/50 text-slate-400 hover:text-indigo-400 transition-all duration-300 flex items-center justify-center gap-2 group"
                      >
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                        <span className="text-xs">Add Task</span>
                      </motion.button>
                    </div>
                  </div>

                  {/* In Progress Column */}
                  <div className={styles.kanbanColumn}>
                    <div className="p-3 border-b border-slate-700/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-indigo-400" />
                          <h3 className="font-medium text-white">
                            In Progress
                          </h3>
                        </div>
                        <span
                          className={`${styles.badge} bg-slate-700/50 text-slate-300`}
                        >
                          {inProgressTasks.length}
                        </span>
                      </div>
                    </div>

                    <Droppable droppableId="in-progress">
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="flex-1 p-3 space-y-3"
                        >
                          {inProgressTasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                              <div className="p-3 rounded-full bg-slate-800/70 mb-3">
                                <Clock className="w-6 h-6 text-slate-500" />
                              </div>
                              <p className="text-sm text-slate-500">
                                No tasks in progress
                              </p>
                            </div>
                          ) : (
                            inProgressTasks.map((subtask, index) => (
                              <Draggable
                                key={subtask.id}
                                draggableId={subtask.id}
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    <motion.div
                                      layoutId={subtask.id}
                                      whileHover={{ scale: 1.02 }}
                                      className={`${styles.taskCard} group relative overflow-hidden`}
                                    >
                                      {/* Task Status Indicator */}
                                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-slate-500/20 to-transparent group-hover:via-indigo-500/30 transition-colors duration-300" />

                                      {/* Quick Actions - Appears on Hover */}
                                      <div className="absolute -right-20 top-2 group-hover:right-2 transition-all duration-300 flex items-center gap-1">
                                        <motion.button
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                          onClick={() =>
                                            handleEditSubtask(subtask)
                                          }
                                          className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-indigo-500/20 border border-slate-600/30 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-400 transition-all duration-300"
                                        >
                                          <Pencil className="w-3.5 h-3.5" />
                                        </motion.button>
                                        <motion.button
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                          onClick={() => {
                                            setSelectedSubtask(subtask);
                                            setShowDeleteModal(true);
                                          }}
                                          className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-rose-500/20 border border-slate-600/30 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 transition-all duration-300"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </motion.button>
                                      </div>

                                      {/* Task Content */}
                                      <div className="pl-3">
                                        <div className="flex items-start justify-between mb-2">
                                          <h4 className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors duration-300">
                                            {subtask.title}
                                          </h4>
                                        </div>

                                        <p className="text-xs text-slate-400 mb-3 line-clamp-2 group-hover:text-slate-300 transition-colors duration-300">
                                          {subtask.description}
                                        </p>

                                        <div className="flex items-center justify-between">
                                          <span
                                            className={`${styles.badge} flex items-center gap-1 bg-slate-800/50 group-hover:bg-slate-700/50 transition-colors duration-300`}
                                          >
                                            {getPriorityIcon(subtask.priority)}
                                            <span
                                              className={`${getPriorityColor(
                                                subtask.priority
                                              )} group-hover:opacity-80 transition-opacity duration-300`}
                                            >
                                              {subtask.priority}
                                            </span>
                                          </span>

                                          {subtask.dueDate && (
                                            <div className="flex items-center gap-1 group-hover:text-slate-300 transition-colors duration-300">
                                              <Calendar className="w-3 h-3 text-slate-400" />
                                              <span className="text-xs text-slate-400">
                                                {formatDate(subtask.dueDate)}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Progress Indicator - Only for "in-progress" tasks */}
                                      {subtask.status === "in-progress" && (
                                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-700/30">
                                          <motion.div
                                            initial={{ width: "0%" }}
                                            animate={{ width: "60%" }}
                                            transition={{
                                              duration: 2,
                                              repeat: Infinity,
                                              repeatType: "reverse",
                                            }}
                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                          />
                                        </div>
                                      )}

                                      {/* Completion Indicator - Only for completed tasks */}
                                      {subtask.status === "completed" && (
                                        <div className="absolute -top-8 -right-8 w-16 h-16 bg-emerald-500/10 rounded-full group-hover:scale-110 transition-transform duration-300">
                                          <CheckCircle className="absolute bottom-3 right-3 w-4 h-4 text-emerald-400" />
                                        </div>
                                      )}
                                    </motion.div>
                                  </div>
                                )}
                              </Draggable>
                            ))
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>

                    <div className="p-3 border-t border-slate-700/50">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setNewSubtask({
                            title: "",
                            description: "",
                            status: "in-progress",
                            priority: "medium",
                            parentTaskId: taskId || "",
                          });
                          setShowCreateModal(true);
                        }}
                        className="w-full p-2 rounded-lg bg-gradient-to-r from-slate-800/50 to-slate-900/50 hover:from-indigo-500/10 hover:to-purple-500/10 border border-dashed border-slate-700 hover:border-indigo-500/50 text-slate-400 hover:text-indigo-400 transition-all duration-300 flex items-center justify-center gap-2 group"
                      >
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                        <span className="text-xs">Add Task</span>
                      </motion.button>
                    </div>
                  </div>

                  {/* Completed Column */}
                  <div className={styles.kanbanColumn}>
                    <div className="p-3 border-b border-slate-700/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <h3 className="font-medium text-white">Completed</h3>
                        </div>
                        <span
                          className={`${styles.badge} bg-slate-700/50 text-slate-300`}
                        >
                          {completedTasks.length}
                        </span>
                      </div>
                    </div>

                    <Droppable droppableId="completed">
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="flex-1 p-3 space-y-3"
                        >
                          {completedTasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                              <div className="p-3 rounded-full bg-slate-800/70 mb-3">
                                <CheckCircle className="w-6 h-6 text-slate-500" />
                              </div>
                              <p className="text-sm text-slate-500">
                                No completed tasks
                              </p>
                            </div>
                          ) : (
                            completedTasks.map((subtask, index) => (
                              <Draggable
                                key={subtask.id}
                                draggableId={subtask.id}
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    <motion.div
                                      layoutId={subtask.id}
                                      whileHover={{ scale: 1.02 }}
                                      className={`${styles.taskCard} group relative overflow-hidden`}
                                    >
                                      {/* Task Status Indicator */}
                                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-slate-500/20 to-transparent group-hover:via-indigo-500/30 transition-colors duration-300" />

                                      {/* Quick Actions - Appears on Hover */}
                                      <div className="absolute -right-20 top-2 group-hover:right-2 transition-all duration-300 flex items-center gap-1">
                                        <motion.button
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                          onClick={() =>
                                            handleEditSubtask(subtask)
                                          }
                                          className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-indigo-500/20 border border-slate-600/30 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-400 transition-all duration-300"
                                        >
                                          <Pencil className="w-3.5 h-3.5" />
                                        </motion.button>
                                        <motion.button
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                          onClick={() => {
                                            setSelectedSubtask(subtask);
                                            setShowDeleteModal(true);
                                          }}
                                          className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-rose-500/20 border border-slate-600/30 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 transition-all duration-300"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </motion.button>
                                      </div>

                                      {/* Task Content */}
                                      <div className="pl-3">
                                        <div className="flex items-start justify-between mb-2">
                                          <h4 className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors duration-300">
                                            {subtask.title}
                                          </h4>
                                        </div>

                                        <p className="text-xs text-slate-400 mb-3 line-clamp-2 group-hover:text-slate-300 transition-colors duration-300">
                                          {subtask.description}
                                        </p>

                                        <div className="flex items-center justify-between">
                                          <span
                                            className={`${styles.badge} flex items-center gap-1 bg-slate-800/50 group-hover:bg-slate-700/50 transition-colors duration-300`}
                                          >
                                            {getPriorityIcon(subtask.priority)}
                                            <span
                                              className={`${getPriorityColor(
                                                subtask.priority
                                              )} group-hover:opacity-80 transition-opacity duration-300`}
                                            >
                                              {subtask.priority}
                                            </span>
                                          </span>

                                          {subtask.dueDate && (
                                            <div className="flex items-center gap-1 group-hover:text-slate-300 transition-colors duration-300">
                                              <Calendar className="w-3 h-3 text-slate-400" />
                                              <span className="text-xs text-slate-400">
                                                {formatDate(subtask.dueDate)}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Progress Indicator - Only for "in-progress" tasks */}
                                      {subtask.status === "in-progress" && (
                                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-700/30">
                                          <motion.div
                                            initial={{ width: "0%" }}
                                            animate={{ width: "60%" }}
                                            transition={{
                                              duration: 2,
                                              repeat: Infinity,
                                              repeatType: "reverse",
                                            }}
                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                          />
                                        </div>
                                      )}

                                      {/* Completion Indicator - Only for completed tasks */}
                                      {subtask.status === "completed" && (
                                        <div className="absolute -top-8 -right-8 w-16 h-16 bg-emerald-500/10 rounded-full group-hover:scale-110 transition-transform duration-300">
                                          <CheckCircle className="absolute bottom-3 right-3 w-4 h-4 text-emerald-400" />
                                        </div>
                                      )}
                                    </motion.div>
                                  </div>
                                )}
                              </Draggable>
                            ))
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>

                    <div className="p-3 border-t border-slate-700/50">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setNewSubtask({
                            title: "",
                            description: "",
                            status: "completed",
                            priority: "medium",
                            parentTaskId: taskId || "",
                          });
                          setShowCreateModal(true);
                        }}
                        className="w-full p-2 rounded-lg bg-gradient-to-r from-slate-800/50 to-slate-900/50 hover:from-indigo-500/10 hover:to-purple-500/10 border border-dashed border-slate-700 hover:border-indigo-500/50 text-slate-400 hover:text-indigo-400 transition-all duration-300 flex items-center justify-center gap-2 group"
                      >
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                        <span className="text-xs">Add Task</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DragDropContext>
        )}
      </div>

      {/* Create Subtask Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${styles.glassEffect} rounded-2xl max-w-lg w-full max-h-[90vh] `}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-display font-bold text-white">
                    Create Subtask
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 hover:bg-slate-800/50 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-slate-400" />
                  </motion.button>
                </div>

                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCreateSubtask();
                  }}
                >
                  <div>
                    <label className={styles.label}>Title</label>
                    <input
                      type="text"
                      value={newSubtask.title || ""}
                      onChange={(e) =>
                        setNewSubtask({ ...newSubtask, title: e.target.value })
                      }
                      className={styles.input}
                      placeholder="Enter subtask title"
                    />
                  </div>

                  <div>
                    <label className={styles.label}>Description</label>
                    <textarea
                      value={newSubtask.description || ""}
                      onChange={(e) =>
                        setNewSubtask({
                          ...newSubtask,
                          description: e.target.value,
                        })
                      }
                      className={styles.input}
                      placeholder="Enter subtask description"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={styles.label}>Status</label>
                      <select
                        value={newSubtask.status || "todo"}
                        onChange={(e) =>
                          setNewSubtask({
                            ...newSubtask,
                            status: e.target.value as any,
                          })
                        }
                        className={styles.input}
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className={styles.label}>Priority</label>
                      <select
                        value={newSubtask.priority || "medium"}
                        onChange={(e) =>
                          setNewSubtask({
                            ...newSubtask,
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
                      value={newSubtask.dueDate || ""}
                      onChange={(e) =>
                        setNewSubtask({
                          ...newSubtask,
                          dueDate: e.target.value,
                        })
                      }
                      className={styles.input}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800/50 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className={`${styles.button} flex items-center gap-2`}
                    >
                      <Plus className="w-4 h-4" />
                      Create Subtask
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Subtask Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${styles.glassEffect} rounded-2xl max-w-lg w-full max-h-[90vh] `}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-display font-bold text-white">
                    Edit Subtask
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowEditModal(false)}
                    className="p-2 hover:bg-slate-800/50 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-slate-400" />
                  </motion.button>
                </div>

                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateSubtask();
                  }}
                >
                  <div>
                    <label className={styles.label}>Title</label>
                    <input
                      type="text"
                      value={newSubtask.title || ""}
                      onChange={(e) =>
                        setNewSubtask({ ...newSubtask, title: e.target.value })
                      }
                      className={styles.input}
                      placeholder="Enter subtask title"
                    />
                  </div>

                  <div>
                    <label className={styles.label}>Description</label>
                    <textarea
                      value={newSubtask.description || ""}
                      onChange={(e) =>
                        setNewSubtask({
                          ...newSubtask,
                          description: e.target.value,
                        })
                      }
                      className={styles.input}
                      placeholder="Enter subtask description"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={styles.label}>Status</label>
                      <select
                        value={newSubtask.status || "todo"}
                        onChange={(e) =>
                          setNewSubtask({
                            ...newSubtask,
                            status: e.target.value as any,
                          })
                        }
                        className={styles.input}
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className={styles.label}>Priority</label>
                      <select
                        value={newSubtask.priority || "medium"}
                        onChange={(e) =>
                          setNewSubtask({
                            ...newSubtask,
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
                      value={newSubtask.dueDate || ""}
                      onChange={(e) =>
                        setNewSubtask({
                          ...newSubtask,
                          dueDate: e.target.value,
                        })
                      }
                      className={styles.input}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800/50 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className={`${styles.button} flex items-center gap-2`}
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
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
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`${styles.glassEffect} rounded-2xl max-w-md w-full overflow-hidden`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-1">
                <div className="bg-gradient-to-r from-rose-500/20 to-rose-500/10 p-5 rounded-t-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-500/20 rounded-full">
                      <AlertTriangle className="h-6 w-6 text-rose-400" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-white">
                      Delete Subtask
                    </h3>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-slate-300 mb-6">
                    Are you sure you want to delete the subtask "
                    {selectedSubtask?.title}"? This action cannot be undone.
                  </p>

                  <div className="flex justify-end gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowDeleteModal(false)}
                      className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800/50 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDeleteSubtask}
                      className="px-4 py-2 bg-gradient-to-r from-rose-500 to-rose-600 rounded-lg text-white font-medium shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-all duration-300 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Subtask
                    </motion.button>
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

export default KanbanBoard;
