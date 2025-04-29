export interface Attachment {
  id: number;
  name: string;
  size: string;
  type: string;
  url: string;
}

export interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
  image: string;
}

export interface PricingCardProps {
  id: string;
  title: string;
  price: string;
  billingCycle: string;
  description: string;
  features: string[];
  limitations?: string[];
  buttonText: string;
  popular: boolean;
}

export interface StatProps {
  value: string;
  label: string;
  delay: number;
}

export interface TestimonialProps {
  content: string;
  author: string;
  role: string;
  company: string;
  image: string;
  companyLogo?: string;
}

export interface Subscription {
  id: string;
  name: string;
  price: number | "Free";
  billingCycle: "month" | "year";
  features: string[];
  isPopular: boolean;
  activeUsers: number;
  color: string;
  _id?: string;
  description: string;
  recommendedFor: string;
}

export interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  profilePic: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  image: File | null | string;
  imagePreview?: string;
  status: "In Progress" | "Completed" | "On Hold" | "Pending";
  team: string[];
  teamMembersDetails: TeamMember[];
  startDate: string;
  endDate: string;
  progress: number;
  category: string;
  priority: "High" | "Medium" | "Low";
  documents: File[];
  _id: number;
  teamMembers: any[];
  teamLeadId?: {
    _id: string;
    [key: string]: any;
  };
}

export interface IProjectWithTeamAndMembers {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  category: string;
  teamLeadId: string;
  teamMembersDetails: any;
  progress: any;
  image: string;
  documents: string[];
  createdAt: string;
  updatedAt: string;
  id?: string | number;
  team: ITeam;
  teamMembers: ITeamMember[];
}

export interface NewProject {
  id: number | string;
  name: string;
  description: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  status: string;
  image: File | null;
  imagePreview?: string;
  startDate: string;
  endDate: string;
  teamMembers: Employee[];
  documents: File[];
}

export interface Employee {
  id: number;
  name: string;
  role: string;
  avatar?: string;
  profilePic?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  company: string;
  status: string;
  isBlocked: boolean;
}

export interface Comment {
  _id: number;
  authorId: TeamMember;
  content: string;
  createdAt: string;
  taskId: string;
}

export interface Task {
  id: number | string;
  _id?: number;
  title?: string;
  description: string;
  status: "backlog" | "todo" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate: string;
  assignedTo: string;
  comments: Comment[];
  attachments: Attachment[];
  createdAt: string;
  name?: string;
  assignedUser?: any;
  projectId: string;
  userId: string;
  updatedAt?: string;
  project: {
    name: string;
    category: string;
  };
}

export interface Subtask {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "review" | "completed";
  priority: "low" | "medium" | "high";
  dueDate?: string;
  assignedTo?: string;
  parentTaskId: string;
}

export interface DecodedToken {
  id: string;
}

export interface Message {
  id: number;
  _id?: number;
  content: string;
  timestamp: string;
  fileUrl?: string;
  sender: {
    id: number;
    name: string;
    avatar: string;
    online: boolean;
  };
  isOwn?: boolean;
}

export interface Chat {
  id: number;
  name: string;
  avatar: string;
  online: boolean;
  lastMessage: string;
  timestamp: string;
  unread: number;
  _id: string;
  isGroupChat?: boolean;
  members: number[];
  projectDetails?: {
    image: string;
  };
}

export interface Member {
  _id: string;
  name: string;
  role?: string;
}

export interface Meeting {
  id: number;
  title: string;
  date: string;
  time: string;
  duration: string;
  attendees: number;
  status: 'upcoming' | 'live' | 'completed';
  host: {
    name: string;
    avatar: string;
  };
  type: 'video' | 'audio';
  recording?: boolean;
  description?: string;
  summary?: string;
  name?: string;
  privacy?: 'public' | 'private';
}

export interface Sprint {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: SprintStatus;
  tasks: Task[];
  totalPoints: number;
  completedPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewSprintData {
  name: string;
  startDate: string;
  endDate: string;
}

export interface BurndownDataPoint {
  day: number;
  remainingPoints: number;
}

export interface DragResult {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination: {
    droppableId: string;
    index: number;
  } | null;
  reason: 'DROP' | 'CANCEL';
}

export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type SprintStatus = 'planning' | 'active' | 'completed';


export interface ZegoUser {
  userID: string;
  userName: string;
  avatar?: string;
}

export interface ModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export interface NewMeetingFormData {
  title: string;
  projectId: string;
  date: string;
  time: string;
  duration: string;
  privacy: 'public' | 'private';
  description: string;
  createdBy: '',
  teamMembers: string[],
}

export interface ITeamMember {
  _id: string;
  name: string;
  email: string;
  role: "employee" | "team-lead" | "admin";
  profilePic: string;
  isBlocked: boolean;
  location?: string;
  phone?: string;
  company?: string | null;
}

export interface ITeam {
  _id: string;
  name: string;
  teamLeadId: string;
  createdAt: string;
}

export interface IProjectWithTeamAndMembers {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "pending" | "in-progress" | "completed"; 
  priority: "low" | "medium" | "high";             
  category: string;
  teamLeadId: string;
  teamMembersDetails: any;
  progress: any;
  image: string;
  documents: string[];
  createdAt: string;
  updatedAt: string;
  id?: string | number;
  team: ITeam;
  teamMembers: ITeamMember[];
}