import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { styles } from "../styles/styles";
import { z } from "zod";
import {
  Plus,
  X,
  Calendar,
  Users,
  Sparkles,
  ArrowUpRight,
  Bell,
  Search,
  FileText,
  Edit3,
  PenTool,
  Trash2,
} from "lucide-react";

import { RootState } from "../redux/store";
import { Project, NewProject, Employee } from "../types";
import {
  fetchProjects,
  fetchEmployees,
  createProject,
  updateProject,
  deleteProject,
} from "../services/ProjectServices";
import { FileUpload, DocumentUpload } from "../components/Design/FileUpload";
import SidebarNav from "../components/dashboard/Sidebar";
import UserProfileCard from "../components/Design/UserProfileCard";
import UserMenuDropdown from "../components/Design/UserMenuDropdown";
import NotificationView from "../components/dashboard/NotificationView";
import { projectSchema } from "../schemas/projectSchema";

const S3_PATH = import.meta.env.VITE_AWSS3_PATH;

const TeamLeadProjectPage: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProject, setNewProject] = useState<NewProject>({
    id: "",
    name: "",
    description: "",
    category: "",
    priority: "Medium",
    status: "",
    image: null,
    imagePreview: undefined,
    startDate: "",
    endDate: "",
    teamMembers: [],
    documents: [],
  });
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  // Effects
  useEffect(() => {
    if (!user) return;
    const loadProjects = async () => {
      setLoading(true);
      try {
        const data = await fetchProjects(user.id);
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setError("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, [user]);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true);
        const data = await fetchEmployees();
        setEmployees(data);
      } catch (error) {
        setError("Failed to fetch employees");
      } finally {
        setLoading(false);
      }
    };
    loadEmployees();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handlers
  const handleImageSelect = (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setNewProject((prev) => ({
      ...prev,
      image: file,
      imagePreview: imageUrl,
    }));
  };

  const handleRemoveImage = () => {
    setNewProject((prev) => {
      if (prev.imagePreview && prev.imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(prev.imagePreview);
      }
      return {
        ...prev,
        image: null,
        imagePreview: undefined,
      };
    });
  };

  const handleDocumentsSelect = (files: File[]) => {
    setNewProject((prev) => ({
      ...prev,
      documents: [...prev.documents, ...files],
    }));
  };

  const handleRemoveDocument = (fileToRemove: File) => {
    setNewProject((prev) => ({
      ...prev,
      documents: prev.documents.filter((file) => file !== fileToRemove),
    }));
  };

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployees((prev) => {
      // 🔥 Prevent duplicates
      if (prev.some((e) => e.id === employee.id)) return prev;

      const updatedSelected = [...prev, employee];

      setNewProject((prevProject) => ({
        ...prevProject,
        teamMembers: [...(prevProject.teamMembers || []), employee],
      }));

      return updatedSelected;
    });

    setSearchQuery("");
  };

  const handleRemoveEmployee = (employeeId: string) => {
    console.log(employeeId, "employee id");

    setSelectedEmployees((prev) => prev.filter((id: any) => id !== employeeId));

    setNewProject((prevProject: any) => ({
      ...prevProject,
      teamMembers: prevProject.teamMembers.filter(
        (member: any) => member.id !== employeeId
      ),
    }));
  };

  const handleViewTasks = (projectId: number) => {
    setSelectedProject(null);
    navigate(`/tasks/${projectId}`);
  };

  const handleEditProject = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    console.log(project,'update project')

    setNewProject({
      id: project.id || project._id,
      name: project.name || "",
      description: project.description || "",
      category: project.category || "",
      priority: project.priority || "Medium",
      status: project.status || "",
      image: null, // Images might be handled separately
      imagePreview: project.image ? `${project.image}` : undefined,
      startDate: project.startDate || "",
      endDate: project.endDate || "",
      teamMembers:
        project.teamMembersDetails?.map((member: any) => ({
          id: member._id,
          name: member.name,
          profilePic: member.profilePic,
          role: member.role,
        })) || [],
      documents: project.documents || [],
    });

    setEditingProject(project);
    setShowEditModal(true);
    setSelectedEmployees(
      project.teamMembersDetails?.map((member: any) => member._id) || []
    );
  };

  const handleDeleteProject = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setProjectToDelete(project);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      setDeleteLoading(true);
      await deleteProject(projectToDelete?.id.toString());
      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));
      setShowDeleteConfirmModal(false);
      setProjectToDelete(null);
      toast.success("Project deleted successfully");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      projectSchema.parse({
        name: newProject.name,
        description: newProject.description,
        category: newProject.category,
        priority: newProject.priority,
        startDate: newProject.startDate,
        endDate: newProject.endDate,
        teamMembers: selectedEmployees,
        documents: newProject.documents,
        image: newProject.image,
      });
      console.log('creating the project',newProject);
      const { project } = await createProject(
        newProject,
        user?.id || "",
        selectedEmployees
      );

      const updatedProject = {
        ...project.result.project,
        teamLeadId: { _id: user?.id },
        teamMembersDetails: selectedEmployees,
      };

      setProjects((prev) => [...prev, updatedProject]);
      setShowCreateModal(false);
      toast.success("Project created successfully");

      if (newProject.imagePreview) {
        URL.revokeObjectURL(newProject.imagePreview);
      }

      setNewProject({
        id: "",
        name: "",
        description: "",
        category: "",
        priority: "Medium",
        status: "",
        image: null,
        imagePreview: undefined,
        startDate: "",
        endDate: "",
        teamMembers: [],
        documents: [],
      });

      setSelectedEmployees([]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast.error(err.message);
        });
      } else {
        console.error("Error creating project:", error);
        toast.error("Error creating project");
      }
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingProject) return;
    console.log(newProject, "new project project");

    try {
      const updatedProject = await updateProject(newProject);
      console.log(updatedProject, "updated project");

      setProjects((prev) =>
        prev.map((proj) =>
          proj.id === editingProject.id ? { ...proj, ...updatedProject } : proj
        )
      );

      setShowEditModal(false);
      toast.success("Project updated successfully");

      if (newProject.imagePreview) {
        URL.revokeObjectURL(newProject.imagePreview);
      }

      setNewProject({
        id: "",
        name: "",
        description: "",
        category: "",
        priority: "Medium",
        status: "",
        image: null,
        imagePreview: undefined,
        startDate: "",
        endDate: "",
        teamMembers: [],
        documents: [],
      });

      setEditingProject(null);
      setSelectedEmployees([]);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast.error(err.message);
        });
      } else {
        console.error("Error updating project:", error);
        toast.error("Error updating project");
      }
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-400/20";
      case "Completed":
        return "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-400/20";
      case "On Hold":
        return "bg-amber-500/10 text-amber-400 ring-1 ring-amber-400/20";
      default:
        return "bg-slate-500/10 text-slate-400 ring-1 ring-slate-400/20";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-rose-400";
      case "Medium":
        return "text-amber-400";
      case "Low":
        return "text-emerald-400";
      default:
        return "text-slate-400";
    }
  };

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selectedEmployees.some((selected) => selected.id === employee.id)
  );

  if (loading) {
    return (
      <div className={styles.container}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

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
                <Sparkles className="w-6 h-6 text-white animate-pulse-glow" />
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
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search anything..."
                    className="pl-9 pr-4 py-2 w-64 bg-slate-800/50 text-sm rounded-lg border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 placeholder-slate-400"
                  />
                </div>
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
                    src={`${import.meta.env.VITE_AWSS3_PATH}/${
                      user?.profilePic
                    }`}
                    alt="Profile"
                    className="w-8 h-8 rounded-lg ring-2 ring-indigo-500/20"
                  />
                  <UserMenuDropdown />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Project Stats */}
        <div className="p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Welcome Section */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="font-display text-3xl font-bold text-white mb-2">
                  Projects Overview
                </h1>
                <p className="text-slate-400">
                  Track and manage your team's active projects
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-white font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-shadow duration-300 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Project
              </motion.button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-6">
              {[
                {
                  icon: Calendar,
                  label: "Total Projects",
                  value: projects.length.toString(),
                  trend: "+2",
                  color: "from-emerald-500/20 to-emerald-500/5",
                },
                {
                  icon: Users,
                  label: "Team Members",
                  value: employees.length.toString(),
                  trend: "+5",
                  color: "from-amber-500/20 to-amber-500/5",
                },
                {
                  icon: FileText,
                  label: "Completed",
                  value: projects
                    .filter((p) => p.status === "Completed")
                    .length.toString(),
                  trend: "+3",
                  color: "from-purple-500/20 to-purple-500/5",
                },
                {
                  icon: ArrowUpRight,
                  label: "In Progress",
                  value: projects
                    .filter((p) => p.status === "In Progress")
                    .length.toString(),
                  trend: "Active",
                  color: "from-blue-500/20 to-blue-500/5",
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    relative p-6 rounded-2xl overflow-hidden
                    ${styles.glassEffect} ${styles.cardHover}
                  `}
                >
                  <div
                    className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br opacity-10 ${stat.color}`}
                  ></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color}`}
                      >
                        <stat.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-emerald-400 flex items-center gap-1">
                        {stat.trend}
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </div>
                    <h3 className="text-2xl font-display font-bold text-white mb-1">
                      {stat.value}
                    </h3>
                    <p className="text-sm text-slate-400">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Project Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
            >
              {projects.length === 0 ? (
                <div className="text-center text-slate-400 py-8">
                  No projects found.
                </div>
              ) : (
                projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`${styles.glassEffect} rounded-2xl overflow-hidden ${styles.cardHover} group cursor-pointer relative`}
                    onClick={() => setSelectedProject(project)}
                  >
                    {project?.teamLeadId?._id === user?.id && (
                      <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                        <motion.button
                          onClick={(e) => handleEditProject(e, project)}
                          className="relative p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-300 group/edit"
                          initial={{ rotate: -15, scale: 0.8 }}
                          whileHover={{
                            rotate: 0,
                            scale: 1.1,
                            transition: { type: "spring", stiffness: 300 },
                          }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-white opacity-0 rounded-xl group-hover/edit:opacity-10 transition-opacity"
                            animate={{
                              opacity: [0, 0.1, 0],
                            }}
                            transition={{
                              repeat: Infinity,
                              duration: 2,
                              ease: "easeInOut",
                            }}
                          />
                          <PenTool className="w-5 h-5 text-white" />
                        </motion.button>

                        <motion.button
                          onClick={(e) => handleDeleteProject(e, project)}
                          className="relative p-3 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all duration-300 group/delete"
                          initial={{ rotate: 15, scale: 0.8 }}
                          whileHover={{
                            rotate: 0,
                            scale: 1.1,
                            transition: { type: "spring", stiffness: 300 },
                          }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-white opacity-0 rounded-xl group-hover/delete:opacity-10 transition-opacity"
                            animate={{
                              opacity: [0, 0.1, 0],
                            }}
                            transition={{
                              repeat: Infinity,
                              duration: 2,
                              ease: "easeInOut",
                            }}
                          />
                          <Trash2 className="w-5 h-5 text-white" />
                        </motion.button>
                      </div>
                    )}

                    <div className="relative h-48 overflow-hidden">
                      {project.image ? (
                        <img
                          src={`${S3_PATH}/${project.image}`}
                          alt={project.name}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                          <FileText className="w-12 h-12 text-slate-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <span className="text-sm font-medium text-white bg-black/30 px-3 py-1 rounded-full">
                          {project.category ?? "Uncategorized"}
                        </span>
                        <span
                          className={`text-sm font-medium ${getPriorityColor(
                            project.priority
                          )} bg-slate-900/90 px-3 py-1 rounded-full ring-1 ring-slate-700/50`}
                        >
                          {project.priority ?? "Medium"}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-display font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
                          {project.name}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {project.status ?? "Pending"}
                        </span>
                      </div>
                      <p className="text-slate-400 line-clamp-2 mb-4">
                        {project.description ?? "No description available"}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {project.teamMembersDetails?.length ? (
                            project.teamMembersDetails.map((member, index) => (
                              <div
                                key={index}
                                className="h-8 w-8 rounded-full bg-indigo-500/10 ring-2 ring-slate-900 flex items-center justify-center"
                              >
                                <span className="text-xs font-medium text-indigo-400">
                                  {member.name?.charAt(0)}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">
                              No members assigned
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 bg-slate-700/50 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                              style={{ width: `${project.progress ?? 0}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-slate-400">
                            {project.progress ?? 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>
        </div>
      </main>

      {/* View Project Modal */}
      <AnimatePresence>
        {selectedProject && (
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
              className={`${styles.glassEffect} rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto`}
            >
              <div className="relative h-64">
                {selectedProject.image ? (
                  <img
                    src={`${S3_PATH}/${selectedProject.image}`}
                    alt={selectedProject.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                    <FileText className="w-16 h-16 text-slate-600" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 p-2 bg-slate-900/90 rounded-full shadow-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </motion.button>
                <div className="absolute bottom-4 left-6 right-6">
                  <h2 className="text-3xl font-display font-bold text-white mb-2">
                    {selectedProject.name}
                  </h2>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        selectedProject.status
                      )}`}
                    >
                      {selectedProject.status}
                    </span>
                    <span
                      className={`text-sm font-medium ${getPriorityColor(
                        selectedProject.priority
                      )} bg-slate-900/90 px-3 py-1 rounded-full ring-1 ring-slate-700/50`}
                    >
                      {selectedProject.priority} Priority
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-slate-400 mb-6">
                  {selectedProject.description}
                </p>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50">
                    <Calendar className="h-5 w-5 text-indigo-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-100">
                        Start Date
                      </p>
                      <p className="text-sm text-slate-400">
                        {selectedProject.startDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50">
                    <Users className="h-5 w-5 text-indigo-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-100">
                        Team Size
                      </p>
                      <p className="text-sm text-slate-400">
                        {selectedProject.teamMembersDetails?.length} members
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-display font-semibold text-slate-100 mb-3">
                    Progress
                  </h3>
                  <div className="h-2 w-full bg-slate-700/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedProject.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-100">
                      {selectedProject.progress}% Complete
                    </span>
                    <span className="text-slate-400">Target: 100%</span>
                  </div>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-display font-semibold text-slate-100 mb-3">
                    Team Members
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject?.teamMembersDetails?.length ? (
                      selectedProject.teamMembersDetails.map(
                        (member, index) => (
                          <div
                            key={index}
                            className="h-8 w-8 rounded-full bg-indigo-500/10 ring-2 ring-slate-900 flex items-center justify-center"
                          >
                            <span className="text-xs font-medium text-indigo-400">
                              {member.name?.charAt(0)}
                            </span>
                          </div>
                        )
                      )
                    ) : (
                      <span className="text-sm text-gray-500">
                        No members assigned
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-4">
                  {selectedProject?.teamLeadId?._id === user?.id ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleViewTasks(selectedProject.id)}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white font-medium shadow-lg hover:shadow-indigo-500/20 transition-all"
                    >
                      View Project Tasks
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate("/employee-task")}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white font-medium shadow-lg hover:shadow-blue-500/20 transition-all"
                    >
                      View Tasks
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      navigate(`/sprints?projectId=${selectedProject.id}`)
                    }
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-medium shadow-lg hover:shadow-green-500/20 transition-all"
                  >
                    View Project Sprints
                  </motion.button>

                  {selectedProject?.teamLeadId?._id === user?.id && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedProject(null);
                        setProjectToDelete(selectedProject);
                        setShowDeleteConfirmModal(true);
                      }}
                      className="py-3 px-4 bg-gradient-to-r from-rose-500 to-red-600 rounded-xl text-white font-medium shadow-lg hover:shadow-rose-500/20 transition-all flex items-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      Delete
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Project Modal */}
      <AnimatePresence>
        {showCreateModal && (
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
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-display font-bold text-slate-100">
                    Create New Project
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
                  className="space-y-6"
                  onSubmit={handleCreateProject}
                  encType="multipart/form-data"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Project Title
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      placeholder="Enter project title"
                      value={newProject.name}
                      onChange={(e) =>
                        setNewProject({ ...newProject, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Description
                    </label>
                    <textarea
                      className="w-full px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      rows={4}
                      placeholder="Enter project description"
                      value={newProject.description}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Category
                      </label>
                      <select
                        className="w-full px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        value={newProject.category}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            category: e.target.value,
                          })
                        }
                      >
                        <option value="">Select category</option>
                        <option value="Development">Development</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Design">Design</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Priority
                      </label>
                      <select
                        className="w-full px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        value={newProject.priority}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            priority: e.target.value as
                              | "High"
                              | "Medium"
                              | "Low",
                          })
                        }
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Project Image
                    </label>

                    {newProject.imagePreview ? (
                      <FileUpload
                        onFileSelect={handleImageSelect}
                        label="Drag & drop project image or click to select"
                        preview={`${newProject.imagePreview}` || ""}
                        onRemove={handleRemoveImage}
                      />
                    ) : (
                      <FileUpload
                        onFileSelect={handleImageSelect}
                        label="Drag & drop project image or click to select"
                        preview={""}
                        onRemove={handleRemoveImage}
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Project Documents
                    </label>
                    <DocumentUpload
                      onFilesSelect={handleDocumentsSelect}
                      files={newProject.documents}
                      onRemove={handleRemoveDocument}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        value={newProject.startDate}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            startDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        value={newProject.endDate}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            endDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Team Members
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="Search employees..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />

                      {searchQuery && filteredEmployees.length > 0 && (
                        <div className="absolute z-50 w-full mt-2 bg-slate-800 rounded-xl border border-slate-700/50 shadow-lg overflow-hidden">
                          {filteredEmployees.map((employee) => (
                            <motion.div
                              key={employee.id}
                              whileHover={{
                                backgroundColor: "rgba(99, 102, 241, 0.1)",
                              }}
                              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-700/30 transition-colors"
                              onClick={() => handleSelectEmployee(employee)}
                            >
                              <img
                                src={`${S3_PATH}/${employee.profilePic}`}
                                alt={employee.name}
                                className="w-8 h-8 rounded-full"
                              />
                              <div>
                                <p className="text-sm font-medium text-slate-200">
                                  {employee.name}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {employee.role}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedEmployees.map((employee) => (
                        <motion.div
                          key={employee.id}
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 rounded-full"
                        >
                          <img
                            src={`${S3_PATH}/${employee.profilePic}`}
                            alt={employee.name}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-sm font-medium text-indigo-400">
                            {employee.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveEmployee(employee.id.toString())}
                            className="p-1 hover:bg-slate-700/30 rounded-full transition-colors"
                          >
                            <X className="w-3 h-3 text-indigo-400" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
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
                      className="px-4 py-2 rounded-xl text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-md hover:shadow-xl transition-all"
                    >
                      Create Project
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Project Modal */}
      <AnimatePresence>
        {showEditModal && editingProject && (
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
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                      <Edit3 className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-slate-100">
                      Edit Project
                    </h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setShowEditModal(false);
                      setNewProject({
                        id: "",
                        name: "",
                        description: "",
                        category: "",
                        priority: "Medium",
                        status: "",
                        image: null,
                        imagePreview: undefined,
                        startDate: "",
                        endDate: "",
                        teamMembers: [],
                        documents: [],
                      });
                      setSelectedEmployees([]);
                    }}
                    className="p-2 hover:bg-slate-800/50 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-slate-400" />
                  </motion.button>
                </div>
                <form
                  className="space-y-6"
                  onSubmit={handleUpdateProject}
                  encType="multipart/form-data"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Project Title
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      placeholder="Enter project title"
                      value={newProject.name}
                      onChange={(e) =>
                        setNewProject({ ...newProject, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Description
                    </label>
                    <textarea
                      className="w-full px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      rows={4}
                      placeholder="Enter project description"
                      value={newProject.description}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Category
                      </label>
                      <select
                        className="w-full px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        value={newProject.category}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            category: e.target.value,
                          })
                        }
                      >
                        <option value="">Select category</option>
                        <option value="Development">Development</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Design">Design</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Priority
                      </label>
                      <select
                        className="w-full px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        value={newProject.priority}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            priority: e.target.value as
                              | "High"
                              | "Medium"
                              | "Low",
                          })
                        }
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Status
                      </label>
                      <select
                        className="w-full px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        value={newProject.status}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            status: e.target.value,
                          })
                        }
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Project Image
                    </label>
                    <FileUpload
                      onFileSelect={handleImageSelect}
                      label="Drag & drop project image or click to select"
                      preview={
                        newProject.imagePreview
                          ? `${S3_PATH}/${newProject.imagePreview}`
                          : undefined
                      }
                      onRemove={handleRemoveImage}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Project Documents
                    </label>
                    <DocumentUpload
                      onFilesSelect={handleDocumentsSelect}
                      files={newProject.documents.map((doc:any) => {
                        if (typeof doc === "string") {
                          const fileName = decodeURIComponent(
                            doc.split("/").pop() || "Unknown Document"
                          );

                          return {
                            name: fileName.replace(/^\d+-_/, ""), 
                            path: `${S3_PATH}/${doc}`,
                            relativePath: `${S3_PATH}/${doc}`,
                            size: 0, 
                          } as any;
                        } else if (typeof doc === "object" && doc) {
                          return {
                            name: doc.name
                              ? decodeURIComponent(doc.name)
                              : "Unknown Document",
                            path: `${S3_PATH}/${doc.path || doc}`,
                            relativePath: `${S3_PATH}/${doc.path || doc}`,
                            size: doc.size || 0, // Ensure size is included
                          };
                        }
                        return {
                          name: "Unknown Document",
                          path: "",
                          relativePath: "",
                          size: 0,
                        };
                      })}
                      onRemove={handleRemoveDocument}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        value={
                          newProject.startDate
                            ? newProject.startDate.split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            startDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        value={
                          newProject.endDate
                            ? newProject.endDate.split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            endDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Team Members
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="Search employees..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />

                      {searchQuery && filteredEmployees.length > 0 && (
                        <div className="absolute z-50 w-full mt-2 bg-slate-800 rounded-xl border border-slate-700/50 shadow-lg overflow-hidden">
                          {filteredEmployees.map((employee) => (
                            <motion.div
                              key={employee.id}
                              whileHover={{
                                backgroundColor: "rgba(99, 102, 241, 0.1)",
                              }}
                              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-700/30 transition-colors"
                              onClick={() => handleSelectEmployee(employee)}
                            >
                              <img
                                src={`${S3_PATH}/${employee.profilePic}`}
                                alt={employee.name}
                                className="w-8 h-8 rounded-full"
                              />
                              <div>
                                <p className="text-sm font-medium text-slate-200">
                                  {employee.name}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {employee.role}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {newProject?.teamMembers.map((employee: any) => (
                        <motion.div
                          key={employee.id}
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 rounded-full"
                        >
                          <img
                            src={`${S3_PATH}/${employee.profilePic}`}
                            alt={employee.name}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-sm font-medium text-indigo-400">
                            {employee.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveEmployee(employee.id)}
                            className="p-1 hover:bg-slate-700/30 rounded-full transition-colors"
                          >
                            <X className="w-3 h-3 text-indigo-400" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
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
                      className="px-4 py-2 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
                    >
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
        {showDeleteConfirmModal && projectToDelete && (
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
              <div className="relative">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-red-500 to-rose-600"></div>

                <div className="pt-8 px-6 pb-2 text-center">
                  <motion.div
                    className="mx-auto w-16 h-16 mb-4 rounded-full bg-rose-500/10 flex items-center justify-center"
                    initial={{ rotate: 0 }}
                    animate={{
                      rotate: [0, -10, 10, -10, 10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <Trash2 className="w-8 h-8 text-rose-400" />
                  </motion.div>

                  <h3 className="text-xl font-display font-bold text-white mb-2">
                    Delete Project
                  </h3>

                  <p className="text-slate-300 mb-2">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-white">
                      {projectToDelete.name}
                    </span>
                    ?
                  </p>

                  <p className="text-sm text-rose-400 mb-6">
                    This action cannot be undone.
                  </p>
                </div>

                <div className="p-4 bg-slate-800/50 flex gap-3 justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowDeleteConfirmModal(false);
                      setProjectToDelete(null);
                    }}
                    className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-700/50 transition-colors"
                  >
                    Cancel
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmDeleteProject}
                    disabled={deleteLoading}
                    className="px-4 py-2 rounded-xl text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-md hover:shadow-rose-500/20 transition-all flex items-center gap-2"
                  >
                    {deleteLoading ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Project</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamLeadProjectPage;
