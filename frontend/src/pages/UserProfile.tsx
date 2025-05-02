import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { setProfile } from "../redux/authSlice";
import { fetchProjects } from "../services/ProjectServices";
import { RootState } from "../redux/store";
import { updateUserProfile } from "../services/UserService";
import NotificationView from "../components/dashboard/NotificationView";
import { Project, TeamMember, Member } from "../types";
import { styles } from "../styles/styles";
import { toast } from "sonner";
import { Bell, Plus, Sparkles } from "lucide-react";

import { z } from "zod";
import SidebarNav from "../components/dashboard/Sidebar";
import UserProfileCard from "../components/Design/UserProfileCard";
import UserMenuDropdown from "../components/Design/UserMenuDropdown";
import { userProfileSchema } from "../schemas/userProfileSchema";

const S3_PATH = import.meta.env.VITE_AWSS3_PATH;

const ProjectDashboard = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const [projects, setProjects] = useState<Project[]>([]);
  const [myTeam, setMyTeam] = useState<TeamMember[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    phone: "",
    profilePic: "" as string | File,
    profilePicPreview: "",
  });

  const user = useSelector((state: RootState) => state.auth.user);
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        location: user.location || "Ireland",
        phone: user.phone || "",
        profilePic: user.profilePic || "",
        profilePicPreview: "",
      });
    }
  }, [auth.user]);

  const getUniqueTeamMembers = (projects: Project[]) => {
    const teamMember = new Set<Member>();
    projects.forEach((project: any) => {
      if (!teamMember.has(project.teamLeadId)) {
        teamMember.add({ ...project.teamLeadId, role: "Team Lead" });
      }
      project.teamMembersDetails.forEach((member: any) => {
        if (!teamMember.has(member)) {
          teamMember.add(member);
        }
      });
    });

    const members = [...teamMember];
    const lastmembers = getUniqueMembers(members);
    setMyTeam(lastmembers);
  };

  const getUniqueMembers = (members: Member[]) => {
    const uniqueMembersMap = new Map();

    members.forEach((member: Member) => {
      if (!uniqueMembersMap.has(member._id)) {
        uniqueMembersMap.set(member._id, member);
      }
    });

    return Array.from(uniqueMembersMap.values());
  };
  useEffect(() => {
    if (!user) return;
    const loadProjects = async () => {
      const data = await fetchProjects(user.id);

      getUniqueTeamMembers(data);
      setProjects(data);
    };
    loadProjects();
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "file") {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setFormData((prev) => ({
          ...prev,
          profilePic: file,
          profilePicPreview: URL.createObjectURL(file),
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      userProfileSchema.parse(formData);

      const keysToCompare = ["name", "email", "location", "phone", "profilePic"];
  
      const originalData = {
        name: user?.name || "",
        email: user?.email || "",
        location: user?.location || "",
        phone: user?.phone || "",
        profilePic: user?.profilePic || "",
      };
  
      const preparedData = {
        name: formData.name,
        email: formData.email,
        location: formData.location,
        phone: formData.phone,
        profilePic: typeof formData.profilePic === "string" 
          ? formData.profilePic 
          : formData.profilePic.name,
      };
  
      const isChanged = !keysToCompare.every(
        (key) => originalData[key as keyof typeof originalData] === preparedData[key as keyof typeof preparedData]
      );
  
      if (!isChanged) {
        toast.info("No changes detected.");
        return;
      }
  
      console.log(formData, "sending to backend");
  
      const updatedUser = await updateUserProfile(formData);
  
      if (updatedUser) {
        toast.success("Profile updated successfully!");
        dispatch(setProfile({ user: updatedUser.user }));
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast.error(err.message);
        });
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  

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
                  Edit Profile
                </h1>
              </div>
              <div className="flex items-center gap-6">
                <div className="relative">
                  {/* <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /> */}
                  <input
                    type="text"
                    placeholder="Search..."
                    className={styles.input}
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
                    src={
                      formData?.profilePic
                        ? `${S3_PATH}/${formData?.profilePic}`
                        : "/default-profile.png"
                    }
                    alt="Profile"
                    className="w-8 h-8 rounded-lg ring-2 ring-indigo-500/20"
                  />

                  <UserMenuDropdown />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Profile Content */}
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-3 gap-8">
              {/* Profile Form */}
              <div className="col-span-2">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className={`${styles.glassEffect} rounded-2xl p-6`}
                >
                   <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="flex items-start gap-6 mb-8">
        {/* Profile Image */}
        <div className="relative">
          <label htmlFor="profilePic" className="cursor-pointer">
            <img
              src={
                typeof formData.profilePic === "string"
                  ? `${S3_PATH}/${formData.profilePic}`
                  : URL.createObjectURL(formData.profilePic)
              }
              alt="Profile"
              className="w-24 h-24 rounded-2xl ring-2 ring-indigo-500/20"
            />
          </label>
          <input
            type="file"
            id="profilePic"
            name="profilePic"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />
          <button
            type="button"
            className="absolute bottom-0 right-0 p-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-white"
            onClick={() => document.getElementById("profilePic")?.click()}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* User Info */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">{user?.name}</h2>
          <p className="text-slate-400">{user?.location}</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 gap-12">
        <div>
          <label className="text-white font-medium">First Name</label>
          <input
            type="text"
            name="name"
            value={formData?.name}
            onChange={handleInputChange}
            className="w-full mt-1 p-2 rounded-lg bg-gray-800 text-white border border-gray-600"
          />
        </div>
      </div>

      <div>
        <label className="text-white font-medium">Email</label>
        <input
          type="email"
          name="email"
          value={formData?.email}
          onChange={handleInputChange}
          className="w-full mt-1 p-2 rounded-lg bg-gray-800 text-white border border-gray-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-12">
        <div>
          <label className="text-white font-medium">Location</label>
          <select
            name="location"
            value={formData?.location}
            onChange={handleInputChange}
            className="w-full mt-1 p-2 rounded-lg bg-gray-800 text-white border border-gray-600"
          >
            <option value="Ireland">Ireland</option>
            <option value="USA">USA</option>
            <option value="UK">UK</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-white font-medium">Phone</label>
        <input
          type="text"
          name="phone"
          value={formData?.phone}
          onChange={handleInputChange}
          className="w-full mt-1 p-2 rounded-lg bg-gray-800 text-white border border-gray-600"
        />
      </div>

      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </motion.button>
      </div>
    </form>
                </motion.div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Projects Section */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className={`${styles.glassEffect} rounded-2xl p-6`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-white">
                      Projects
                    </h2>
                    <button className="text-indigo-400 text-sm font-medium hover:text-indigo-300">
                      View all
                    </button>
                  </div>
                  <div className="space-y-4">
                    {projects.map((project, index) => (
                      <div
                        key={index}
                        className="group relative overflow-hidden rounded-xl"
                      >
                        <img
                          src={`${S3_PATH}/${project.image}`}
                          alt={project.name}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex flex-col justify-end">
                          <h3 className="text-white font-medium">
                            {project.name}
                          </h3>
                          <div className="flex items-center gap-2 text-white/80 text-sm">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                project.status === "Completed"
                                  ? "bg-emerald-400"
                                  : project.status === "In Progress"
                                  ? "bg-amber-400"
                                  : "bg-blue-400"
                              }`}
                            />
                            {project.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Team Section */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className={`${styles.glassEffect} rounded-2xl p-6`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-white">
                      My Team
                    </h2>
                    <button className="text-indigo-400 text-sm font-medium hover:text-indigo-300">
                      View all
                    </button>
                  </div>
                  <div className="space-y-4">
                    {myTeam.map((member, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <img
                          src={`${S3_PATH}/${member?.profilePic}`}
                          alt={member?.name}
                          className="w-10 h-10 rounded-lg ring-2 ring-indigo-500/20"
                        />
                        <div>
                          <h3 className="text-sm font-medium text-white">
                            {member?.name}
                          </h3>
                          <p className="text-xs text-slate-400">
                            {member?.role}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectDashboard;
