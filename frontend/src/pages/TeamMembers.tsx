import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Mail,
  Phone,
  CheckCircle,
  MapPin,
  Calendar,
  Sparkles,
  UserPlus,
} from "lucide-react";
import SidebarNav from "../components/dashboard/Sidebar";
import UserProfileCard from "../components/Design/UserProfileCard";
import { fetchAllTeamMembers } from "../services/TeamService";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  avatar: string;
  status: "online" | "offline" | "busy";
  department: string;
  projects:any[];
  tasks: any[];
  tasksCompleted: number;
  performance: number;
  length: number;
  badges: string[];
  skills: string[];
  recentActivity: string;
}


const TeamMembers = () => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [teamMembers, setTeamMembers] = useState<{ _id: string; teamLeadId: { _id: string; }; members: any[]; }[] | null>(null);

  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-emerald-500";
      case "busy":
        return "bg-amber-500";
      case "away":
        return "bg-orange-500";
      case "offline":
        return "bg-slate-500";
        case 'active':
      case 'completed': return 'bg-green-500';
      case 'in progress': return 'bg-yellow-500';
      case 'pending': return 'bg-blue-500';
      default:
        return "bg-slate-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "text-red-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-green-400";
      default:
        return "text-slate-400";
    }
  };




  const getPerformanceColor = (performance: number) => {
    if (performance >= 90)
      return "bg-gradient-to-r from-emerald-500 to-green-500";
    if (performance >= 75)
      return "bg-gradient-to-r from-blue-500 to-indigo-500";
    if (performance >= 50)
      return "bg-gradient-to-r from-amber-500 to-orange-500";
    return "bg-gradient-to-r from-red-500 to-rose-500";
  };

  const { user } = useSelector((state: RootState) => state.auth);
  console.log(user?.id, "userId");

  const fetchTeamMembers = async () => {
    try {
      if (!user?.id) return;

      const result = await fetchAllTeamMembers(user.id);

      const uniqueUsers = new Map();
      const uniqueTeams = [] as { _id: string; teamLeadId: { _id: string }; members: any[] }[];


      result.forEach((team: any) => {
        if (!uniqueUsers.has(team.teamLeadId._id)) {
          uniqueUsers.set(team.teamLeadId._id, true);
          uniqueTeams.push({
            ...team,
            members: [],
          });
        }

        const members: { _id: string }[] = [];
        team.members.forEach((member: { _id: string }) => {
          if (!uniqueUsers.has(member._id)) {
            uniqueUsers.set(member._id, true);
            members.push(member);
          }
        });

        // Add unique members to the team copy
        const teamIndex = uniqueTeams.findIndex((t) => t._id === team._id);
        if (teamIndex > -1) {
          uniqueTeams[teamIndex].members = [
            ...uniqueTeams[teamIndex].members,
            ...members,
          ];
        }
      });

      setTeamMembers(uniqueTeams);
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-900 to-indigo-950">
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

        <UserProfileCard />
      </motion.aside>

      <main className="pl-72">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-10 backdrop-blur-xl bg-slate-900/50 border-b border-slate-700/50"
        >
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Users className="w-6 h-6 text-indigo-400" />
                <h1 className="text-xl font-display font-bold text-white">
                  Team Members
                </h1>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Check if there are any team members to display */}
            {!teamMembers || teamMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 bg-gradient-to-br from-slate-800/40 via-slate-800/20 to-slate-900/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
                <Users className="h-16 w-16 text-slate-500 mb-4" />
                <h3 className="text-xl font-display font-bold text-white">
                  No Team Members Found
                </h3>
                <p className="text-slate-400 mt-2 text-center">
                  There are no team members available to display right now.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* First, render all team leads */}
                {teamMembers?.map((team: any) => (
                  <motion.div
                    key={`lead-${team.teamLeadId._id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative p-6 rounded-2xl bg-gradient-to-br from-slate-800/40 via-slate-800/20 to-slate-900/30 backdrop-blur-xl border border-slate-700/50 mb-6"
                  >
                    {/* Team Lead Card Content - unchanged */}
                    <div className="absolute top-6 right-6 z-10">
                      <div className="relative">
                        <div
                          className={`w-3 h-3 rounded-full ${getStatusColor(
                            team.teamLeadId.status
                          )}`}
                        ></div>
                        <div
                          className={`absolute inset-0 rounded-full ${getStatusColor(
                            team.teamLeadId.status
                          )} animate-ping`}
                        ></div>
                      </div>
                    </div>

                    <div className="relative z-10 flex items-start mb-6">
                      <img
                        src={
                          team.teamLeadId.profilePic
                            ? `${import.meta.env.VITE_AWSS3_PATH}/${
                                team.teamLeadId.profilePic
                              }`
                            : "/default-avatar.png"
                        }
                        className="w-20 h-20 rounded-xl object-cover"
                        alt={team.teamLeadId.name}
                      />
                      <div className="ml-4">
                        <h3 className="font-display font-bold text-xl text-white">
                          {team.teamLeadId.name}
                          <span className="text-indigo-400 ml-2">
                            (Team Lead)
                          </span>
                        </h3>
                        <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                          <span className="text-xs font-medium text-indigo-400">
                            {team.teamLeadId.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10 grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-indigo-400" />
                          <span className="text-xs text-slate-400">
                            Projects
                          </span>
                        </div>
                        <span className="text-lg font-display font-bold text-white">
                          {team.teamLeadId.projects?.length || 0}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Then, render all team members */}
                {teamMembers.flatMap((team: any) =>
                  team.members && team.members.length > 0 ? (
                    team.members.map((member: any) => {
                      const completedTasks =
                        member.tasks?.filter(
                          (t: any) => t.status === "completed"
                        ).length || 0;
                      const totalTasks = member.tasks?.length || 0;
                      const performance =
                        totalTasks > 0
                          ? Math.round((completedTasks / totalTasks) * 100)
                          : 0;

                      return (
                        <motion.div
                          key={`member-${member._id}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="relative p-6 rounded-2xl bg-gradient-to-br from-slate-800/40 via-slate-800/20 to-slate-900/30 backdrop-blur-xl border border-slate-700/50 mb-6"
                        >
                          {/* Member Card Content - unchanged */}
                          <div className="absolute top-6 right-6 z-10">
                            <div className="relative">
                              <div
                                className={`w-3 h-3 rounded-full ${getStatusColor(
                                  member.status
                                )}`}
                              ></div>
                              <div
                                className={`absolute inset-0 rounded-full ${getStatusColor(
                                  member.status
                                )} animate-ping`}
                              ></div>
                            </div>
                          </div>

                          <div className="relative z-10 flex items-start mb-6">
                            <img
                              src={
                                member.profilePic
                                  ? `${import.meta.env.VITE_AWSS3_PATH}/${
                                      member.profilePic
                                    }`
                                  : "/default-avatar.png"
                              }
                              className="w-20 h-20 rounded-xl object-cover"
                              alt={member.name}
                            />
                            <div className="ml-4">
                              <h3 className="font-display font-bold text-xl text-white">
                                {member.name}
                              </h3>
                              <p className="text-slate-400 text-sm mt-1">
                                {member.role}
                              </p>
                              <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                                <span className="text-xs font-medium text-indigo-400">
                                  {member.location}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="relative z-10 mb-5">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-slate-400">
                                Progress
                              </span>
                              <span className="text-lg font-bold text-white">
                                {performance}%
                              </span>
                            </div>
                            <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden">
                              <motion.div
                                className={`h-full rounded-full ${getPerformanceColor(
                                  performance
                                )}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${performance}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                          </div>

                          <div className="relative z-10 grid grid-cols-2 gap-3 mb-5">
                            <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                              <div className="flex items-center gap-2 mb-1">
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                <span className="text-xs text-slate-400">
                                  Tasks
                                </span>
                              </div>
                              <div className="flex items-baseline">
                                <span className="text-lg font-display font-bold text-white">
                                  {completedTasks}
                                </span>
                                <span className="ml-1 text-xs text-emerald-400">
                                  / {totalTasks}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="relative z-10">
                            <h4 className="text-sm font-medium text-slate-400 mb-2">
                              Current Tasks
                            </h4>
                            <div className="space-y-2">
                              {member.tasks?.slice(0, 2).map((task: any) => (
                                <div
                                  key={task._id}
                                  className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50"
                                >
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`w-2 h-2 rounded-full ${getStatusColor(
                                        task.status
                                      )}`}
                                    />
                                    <p className="text-sm text-white truncate">
                                      {task.name}
                                    </p>
                                  </div>
                                  <div className="mt-1 flex items-center justify-between">
                                    <span className="text-xs text-slate-400">
                                      Due:{" "}
                                      {new Date(
                                        task.dueDate
                                      ).toLocaleDateString()}
                                    </span>
                                    <span
                                      className={`text-xs ${getPriorityColor(
                                        task.priority
                                      )}`}
                                    >
                                      {task.priority}
                                    </span>
                                  </div>
                                </div>
                              ))}
                              {(!member.tasks || member.tasks.length === 0) && (
                                <div className="p-3 text-center text-slate-400 text-sm">
                                  No current tasks
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <motion.div
                      key={`no-members-${team._id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative p-6 rounded-2xl bg-gradient-to-br from-slate-800/40 via-slate-800/20 to-slate-900/30 backdrop-blur-xl border border-slate-700/50 mb-6 flex flex-col items-center justify-center min-h-[200px]"
                    >
                      <UserPlus className="h-12 w-12 text-slate-500 mb-3" />
                      <h3 className="font-display font-bold text-lg text-white text-center">
                        No Team Members
                      </h3>
                      <p className="text-slate-400 text-sm mt-2 text-center">
                        This team doesn't have any members yet
                      </p>
                    </motion.div>
                  )
                )}

                {teamMembers.length > 0 &&
                  Array.from({
                    length: Math.max(0, 3 - teamMembers.length),
                  }).map((_, index) => (
                    <motion.div
                      key={`placeholder-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative p-6 rounded-2xl bg-gradient-to-br from-slate-800/40 via-slate-800/20 to-slate-900/30 backdrop-blur-xl border border-slate-700/50 mb-6 flex flex-col items-center justify-center min-h-[200px]"
                    >
                      <UserPlus className="h-12 w-12 text-slate-500 mb-3" />
                    </motion.div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Member Details Modal */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setSelectedMember(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900 p-6 rounded-2xl shadow-xl max-w-2xl w-full mx-4 border border-slate-700/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-6 mb-6">
                <img
                  src={selectedMember.avatar}
                  alt={selectedMember.name}
                  className="w-24 h-24 rounded-xl ring-2 ring-indigo-500/20 object-cover"
                />
                <div>
                  <h2 className="text-2xl font-display font-bold text-white mb-2">
                    {selectedMember.name}
                  </h2>
                  <p className="text-slate-400">{selectedMember.role}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div
                      className={`w-2 h-2 rounded-full ${getStatusColor(
                        selectedMember.status
                      )}`}
                    ></div>
                    <span className="text-sm text-slate-400 capitalize">
                      {selectedMember.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-2">
                      Contact Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-white">
                        <Mail className="w-4 h-4 text-indigo-400" />
                        <span>{selectedMember.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white">
                        <Phone className="w-4 h-4 text-indigo-400" />
                        <span>{selectedMember.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white">
                        <MapPin className="w-4 h-4 text-indigo-400" />
                        <span>{selectedMember.location}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-2">
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 text-sm rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-2">
                      Performance Metrics
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-400">
                            Projects Completed
                          </span>
                          <span className="text-white">
                            {selectedMember.projects}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-700/50">
                          <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{
                              width: `${(selectedMember.projects as unknown as number / 12) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-400">
                            Performance Score
                          </span>
                          <span className="text-white">
                            {selectedMember.performance}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-700/50">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${selectedMember.performance}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-2">
                      Achievements
                    </h3>
                    <div className="space-y-2">
                      {selectedMember.badges.map((badge) => (
                        <div
                          key={badge}
                          className="p-2 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20"
                        >
                          <span className="text-sm text-indigo-400">
                            {badge}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors duration-200"
                  onClick={() => setSelectedMember(null)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamMembers;
