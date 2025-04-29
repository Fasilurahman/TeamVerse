import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Users,
  Video,
  Plus,
  Search,
  Bell,
  ChevronRight,
  Sparkles,
  Zap,
  Link as LinkIcon,
  Calendar as CalendarIcon,
  Star,
  PlayCircle,
  Timer,
} from "lucide-react";
import { useSelector } from "react-redux";
import { Modal } from "../components/videoConference/Modal";
import { NewMeetingForm } from "../components/videoConference/NewMeetingForm";
import SidebarNav from "../components/dashboard/Sidebar";
import UserProfileCard from "../components/Design/UserProfileCard";
import UserMenuDropdown from "../components/Design/UserMenuDropdown";
import NotificationView from "../components/dashboard/NotificationView";
import type {
  Meeting,
  NewMeetingFormData,
  IProjectWithTeamAndMembers,
} from "../types";
import { fetchProjectByTeamLead } from "../services/ProjectServices";
import { createMeeting, fetchAllMeetings } from "../services/MeetingService";
import VideoConference from "../components/videoConference/VideoConference";
import { fetcUserDetailsById } from "../services/UserService";
import { Link } from "react-router-dom";

const Meetings: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showNewMeetingModal, setShowNewMeetingModal] =
    useState<boolean>(false);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showVideoConference, setShowVideoConference] =
    useState<boolean>(false);
  const [projects, setProjects] = useState<IProjectWithTeamAndMembers[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [hasMeetingFeature, setHasMeetingFeature] = useState(false);


  const user = useSelector((state: any) => state.auth.user);

  const handleViewDetails = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowDetailsModal(true);
  };

  const fetchUser = async () => {
    try {
      if (!user) return;
      const result = await fetcUserDetailsById(user.id);
      console.log(result?.subscriptionId?.features, "features");
      setHasMeetingFeature((result?.subscriptionId?.features || []).includes("Meeting"));
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };
  
  useEffect(() => {
    fetchUser();
  }, []);

  console.log(selectedMeeting,'selected meeting')

  const fetchMeetings = async () => {
    try {
      console.log('fetching the meeting')
      const result = await fetchAllMeetings();
      setMeetings(result);
    } catch (error) {
      console.error(error, "failed to fetch meetings");
    }
  };
  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleJoinMeeting = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowJoinModal(true);
  };

  const handleStartMeeting = () => {
    setShowJoinModal(false);
    setShowVideoConference(true);
  };

  const fetchAllProjects = async () => {
    if (!user) return;
    const projects = await fetchProjectByTeamLead(user.id);
    setProjects(projects);
  };

  useEffect(() => {
    fetchAllProjects();
  }, []);

  const handleCreateMeeting = async (formData: NewMeetingFormData) => {
    try {
      const meeting = await createMeeting(formData);
      console.log(meeting, "meeting");
      
      await fetchMeetings();
      setShowNewMeetingModal(false);
    } catch (error) {
      console.log(error, "error");
    }
  };

  if (!hasMeetingFeature) {
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
        <div className="pl-72 flex-1 flex flex-col">
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
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search meetings..."
                      className="pl-9 pr-4 py-2 w-64 bg-slate-800/50 text-sm rounded-lg border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 placeholder-slate-400"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowNewMeetingModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Meeting</span>
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
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
                      alt="Profile"
                      className="w-8 h-8 rounded-lg ring-2 ring-indigo-500/20"
                    />
                    <UserMenuDropdown />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.header>

          {/* Main Content Area */}
          <div className="p-8 flex-1 flex items-center justify-center">
            <div className="max-w-2xl w-full bg-gradient-to-br from-slate-800/40 via-slate-800/20 to-slate-900/30 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8 text-center">
              <div className="mx-auto w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
                <Video className="w-10 h-10 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Upgrade to Access Video Meetings
              </h2>
              <p className="text-slate-400 mb-6">
                Your current subscription doesn't include video meeting features. 
                Upgrade your plan to schedule and join video conferences with your team.
              </p>
              <div className="flex justify-center gap-4">
                <Link
                  to="/dashboard/settings/subscription"
                  className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Upgrade Subscription
                </Link>
                <Link
                  to="/dashboard"
                  className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-colors duration-200"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Rest of your original component code
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
      <div className="pl-72 flex-1 flex flex-col">
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search meetings..."
                    className="pl-9 pr-4 py-2 w-64 bg-slate-800/50 text-sm rounded-lg border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNewMeetingModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Meeting</span>
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
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
                    alt="Profile"
                    className="w-8 h-8 rounded-lg ring-2 ring-indigo-500/20"
                  />
                  <UserMenuDropdown />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content Area */}
        <div className="p-8">
          <div className="grid grid-cols-4 gap-6 mb-8">
            {[
              {
                icon: Video,
                label: "Total Meetings",
                value: "248",
                trend: "+12%",
              },
              {
                icon: Users,
                label: "Total Participants",
                value: "1,842",
                trend: "+8%",
              },
              {
                icon: Clock,
                label: "Hours Hosted",
                value: "386",
                trend: "+15%",
              },
              { icon: Star, label: "Avg. Rating", value: "4.8", trend: "+0.3" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-slate-800/40 via-slate-800/20 to-slate-900/30 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <stat.icon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <span className="text-emerald-400 text-sm font-medium">
                    {stat.trend}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {stat.value}
                </h3>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Live Now Section */}
          {showVideoConference && selectedMeeting ? (
            <div className="fixed inset-0 z-50 bg-slate-900">
              <div className="w-full h-full">
                <VideoConference
                  roomID={selectedMeeting.id.toString()}
                  user={{
                    userID: user?.id ?? '', 
                    userName: user?.name ?? '', 
                  }}
                  onLeave={() => setShowVideoConference(false)}
                />
              </div>
            </div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <div className="relative">
                      <Zap className="w-5 h-5 text-amber-400" />
                      <div className="absolute inset-0 animate-ping bg-amber-400/20 rounded-full"></div>
                    </div>
                    Live Now
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {meetings
                    .filter((meeting) => meeting.status === "live")
                    .map((meeting) => (
                      <div
                        key={meeting.id}
                        className="bg-gradient-to-br from-slate-800/40 via-slate-800/20 to-slate-900/30 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 relative overflow-hidden group hover:scale-105 transition-transform duration-300"
                      >
                        <div className="absolute top-0 right-0 p-3">
                          <div className="flex items-center gap-2 bg-rose-500/20 text-rose-400 px-3 py-1 rounded-full text-sm font-medium">
                            <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                            Live
                          </div>
                        </div>

                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-white mb-2">
                              {meeting.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{meeting.time}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{meeting.attendees} attendees</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                              {user?.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">
                                {user?.name}
                              </p>
                              <p className="text-xs text-slate-400">Host</p>
                            </div>
                          </div>

                          {/* BUTTON without motion */}
                          <button
                            onClick={handleStartMeeting}
                            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                          >
                            <PlayCircle className="w-4 h-4" />
                            Join Now
                          </button>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    ))}
                </div>
              </motion.div>

              {/* Join Meeting Modal */}
              <Modal
                isOpen={showJoinModal}
                onClose={() => setShowJoinModal(false)}
                title="Join Meeting"
              >
                {selectedMeeting && (
                  <div className="space-y-6">
                    <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
                      <h3 className="text-lg font-medium text-white mb-4">
                        {selectedMeeting.title}
                      </h3>

                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                          {user?.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {user?.name}
                          </p>
                          <p className="text-xs text-slate-400">Joining as</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg mb-4">
                        <div className="flex items-center gap-3">
                          <LinkIcon className="w-5 h-5 text-slate-400" />
                          <span className="text-white">
                            Meeting ID: {selectedMeeting.id}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="text-sm text-slate-400">
                          <p>
                            • Your microphone and camera will be off when you
                            join
                          </p>
                          <p>
                            • You can turn them on once you're in the meeting
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-4">
                      <button
                        onClick={() => setShowJoinModal(false)}
                        className="px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleStartMeeting}
                        className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 flex items-center gap-2"
                      >
                        <PlayCircle className="w-4 h-4" />
                        Join Meeting
                      </button>
                    </div>
                  </div>
                )}
              </Modal>
            </>
          )}

          {/* Upcoming Meetings */}
          <div className="bg-gradient-to-br from-slate-800/40 via-slate-800/20 to-slate-900/30 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Meetings</h2>
              <div className="flex bg-slate-800/30 rounded-lg p-1">
                {["upcoming", "past"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as "upcoming" | "past")}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeTab === tab
                        ? "bg-indigo-500 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {meetings
                .filter((meeting: any) => {
                  if (activeTab === "upcoming") {
                    return meeting.status === "upcoming";
                  } else {
                    // past tab: show only meetings with a summary
                    return meeting.status === "past" || meeting.summary;
                  }
                })
                .map((meeting: any) => (
                  <motion.div
                    key={meeting.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-slate-800/30 rounded-xl p-4 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                        <CalendarIcon className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium mb-1">
                          {meeting.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{meeting.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{meeting.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Timer className="w-4 h-4" />
                            <span>{meeting.duration}</span>
                          </div>
                        </div>
                        {activeTab === "past" && meeting.summary && (
                          <p className="text-slate-400 text-sm mt-2 line-clamp-2">
                            {meeting.summary}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        {[...Array(3)].map((_, i) => (
                          <img
                            key={i}
                            src={`https://i.pravatar.cc/32?img=${i + 1}`}
                            alt={`Attendee ${i + 1}`}
                            className="w-8 h-8 rounded-full border-2 border-slate-900"
                          />
                        ))}
                        {meeting.attendees > 3 && (
                          <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-xs text-white">
                            +{meeting.attendees - 3}
                          </div>
                        )}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewDetails(meeting)}
                        className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 opacity-0 group-hover:opacity-100"
                      >
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showNewMeetingModal}
        onClose={() => setShowNewMeetingModal(false)}
        title="Schedule New Meeting"
      >
        <NewMeetingForm
          onSubmit={handleCreateMeeting}
          onCancel={() => setShowNewMeetingModal(false)}
          projects={projects}
          currentUserId={user?.id ?? ''}
        />
      </Modal>

      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Meeting Details"
      >
        {selectedMeeting && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <h3 className="text-lg font-medium text-white mb-4">
                {selectedMeeting?.title}
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>{selectedMeeting?.date}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>{selectedMeeting?.time}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Timer className="w-4 h-4" />
                  <span>{selectedMeeting?.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Users className="w-4 h-4" />
                  <span>{selectedMeeting?.attendees} participants</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <img
                  src={`${import.meta.env.VITE_AWSS3_PATH}/${user?.profilePic}`}
                  alt={user?.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-slate-400">Host</p>
                </div>
              </div>

              <p className="text-slate-400 text-sm mb-6">
                {selectedMeeting?.description}
              </p>

              {/* 🆕 ADD THIS */}
              {selectedMeeting?.summary && (
                <div className="mt-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
                  <h4 className="text-md font-semibold text-white mb-2">
                    Meeting Summary
                  </h4>
                  <p className="text-slate-300 text-sm whitespace-pre-line">
                    {selectedMeeting.summary}
                  </p>
                </div>
              )}
              {/* 🆕 END */}
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  handleJoinMeeting(selectedMeeting);
                }}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 flex items-center gap-2"
              >
                <PlayCircle className="w-4 h-4" />
                Join Meeting
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        title="Join Meeting"
      >
        {selectedMeeting && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">
                  {selectedMeeting?.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>{selectedMeeting?.time}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <img
                  src={`${import.meta.env.VITE_AWSS3_PATH}/${user?.profilePic}`}
                  alt={user?.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="text-sm font-medium text-white">
                    {user?.name ?? 'Unknown'}
                  </p>
                  <p className="text-xs text-slate-400">Host</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{selectedMeeting?.attendees} participants</span>
                </div>
                <div className="flex items-center gap-1">
                  <Timer className="w-4 h-4" />
                  <span>{selectedMeeting?.duration}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowJoinModal(false)}
                className="px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleStartMeeting}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 flex items-center gap-2"
              >
                <PlayCircle className="w-4 h-4" />
                Join Now
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Meetings;