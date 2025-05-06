import React, { useEffect, useRef, useState, ChangeEvent  } from "react";
import { motion } from "framer-motion";
import { io, Socket } from "socket.io-client";
import { fetchEmployees } from "../services/ProjectServices";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import EmojiPicker from "@emoji-mart/react";
import { RootState } from "../redux/store";
import NotificationView from "../components/dashboard/NotificationView";
import { jwtDecode } from "jwt-decode";
import {
  Search,
  Users,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Send,
  Image as ImageIcon,
  Link as LinkIcon,
  Star,
  Circle,
  Bell,
  Sparkles,
} from "lucide-react";
import SidebarNav from "../components/dashboard/Sidebar";
import UserProfileCard from "../components/Design/UserProfileCard";
import UserMenuDropdown from "../components/Design/UserMenuDropdown";
import {
  fetchChatMessagesService,
  fetchProjectChatService,
  fetchUserChatsService,
  sendMessageService,
} from "../services/TaskService";
import { DecodedToken, Message, Chat } from "../types";

const S3_PATH = import.meta.env.VITE_AWSS3_PATH;

const Messages = () => {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "groups" | "direct">(
    "all"
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [chatId, setChatId] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [file, setFile] = useState<null | File>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  console.log("Active Chat Changed:", activeChat);
  console.log(chats,'me')

  const { projectId } = useParams();

  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  let userId: string | null = null;

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

  if (token) {
    try {
      const decoded: DecodedToken = jwtDecode(token);
      userId = decoded.id;
    } catch (error) {
      console.error("Invalid token:", error);
    }
  }

  const handleEmojiSelect = (emojiObject: any ) => {
    setMessageInput((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false); // Hide emoji picker after selection
  };

  useEffect(() => {
    if (activeChat) {
      console.log('changing',activeChat)
      setChatId(activeChat);
    }
  }, [activeChat]);

  useEffect(() => {
    const fetchUserChats = async () => {
      if (!userId) return;
      try {
        const chatsData = await fetchUserChatsService(userId);
        console.log(chatsData, "chats");
        setChatId(chatsData[0]?._id);
        setChats(chatsData);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    if (userId) fetchUserChats();
  }, [userId]);

  useEffect(() => {
    const fetchChat = async () => {
      if (!projectId) return;
      try {
        const chatData = await fetchProjectChatService(projectId);
        console.log(chatData, "chat");
        setChatId(chatData._id);
        setActiveChat(chatData._id);
      } catch (error) {
        console.error("Error fetching chat:", error);
      }
    };
    fetchChat();
  }, [projectId]);

  useEffect(() => {
    if (!chatId) return;
    console.log(chatId, 'chat id')
    const fetchMessages = async () => {
      try {
        const messagesData = await fetchChatMessagesService(chatId.toString());
        console.log(messagesData, "messages");
        setMessages(messagesData);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [chatId]);



  // ✅ Setup Socket.io
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_BACKEND_SOCKET_URL);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to Socket.IO server");
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from Socket.IO server");
    });

    newSocket.on("chat-message", (newMessage) => {
      setMessages((prevMessages) => {
        if (prevMessages.some((msg) => msg._id === newMessage._id)) {
          return prevMessages;
        }
        return [...prevMessages, newMessage];
      });
    });

    return () => {
      newSocket.disconnect();
    };
  },  [(user as any)?._id]);

  // ✅ Join Chat Room When Connected
  useEffect(() => {
    if (socket && isConnected && chatId) {
      socket.emit("join-chat", chatId);
      console.log('joining in chat message',chatId)
    }
  }, [socket, isConnected, chatId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    console.log(activeChat, "coming to handle send message function");
    e.preventDefault();
    if (!activeChat) {
      console.error("No active chat selected");
      return;
    }

    console.log("After update:", messages);
    const formData = new FormData();
    if (messageInput.trim() !== "") {
      formData.append("content", messageInput);
    }
    if (file) {
      formData.append("file", file);
    }

    console.log([...formData], " form dataaaaaaa");

    try {
      const newMessage = await sendMessageService(
        activeChat.toString(),
        formData
      );

     if (socket) {
      socket.emit("send-message", {
        chatId: activeChat,
        message: newMessage, // must match backend expectations
      });
    }

      setMessageInput("");
      setFile(null);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // ✅ Fetch Employees
  useEffect(() => {
    let isMounted = true;
    const loadEmployees = async () => {
      try {
        setLoading(true);
        const res = await fetchEmployees();
        if (isMounted) setUsers(res.data);
      } catch (error) {
        if (isMounted) setError("Failed to fetch employees");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadEmployees();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
    }
  };

  return (
    <div className="flex min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-900 to-indigo-950">
      {/* Enhanced Sidebar */}
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

        {/* User Profile */}
        <UserProfileCard />
      </motion.aside>

      {/* Main Content */}
      <div className="pl-72 flex-1 flex flex-col">
        {/* Enhanced Header */}
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
                    placeholder="Search messages..."
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

        {/* Chat Container */}
        <div className="flex flex-1">
          {/* Chat List */}
          <div className="w-80 border-r border-slate-700/50">
            <div className="p-4">
              <div className="flex bg-slate-800/30 rounded-lg p-1 mb-4">
                {[
                  { id: "all", label: "All" },
                  { id: "groups", label: "Groups" },
                  { id: "direct", label: "Direct" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as "all" | "groups" | "direct")}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-indigo-500 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1 px-2">
              {chats.map((chat) => (
                <motion.button
                  key={chat.id}
                  onClick={() => setActiveChat(chat._id)}
                  className={`w-full p-3 flex items-center gap-3 rounded-xl transition-all duration-200 ${
                    Number(activeChat) === chat.id
                      ? "bg-indigo-500/20 border border-indigo-500/30"
                      : "hover:bg-slate-800/50"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative">
                    <img
                      src={`${S3_PATH}/${chat.projectDetails?.image}`}
                      alt={chat.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {chat.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-slate-900"></div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">
                        {chat.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {chat.timestamp}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-400 truncate">
                        {chat.lastMessage}
                      </p>
                      {chat.unread > 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-indigo-500 text-white rounded-full">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                    {chat.isGroupChat && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-slate-400">
                          {chat?.members?.length} members
                        </span>
                        <Users className="w-3 h-3 text-slate-400" />
                      </div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="h-16 border-b border-slate-700/50 flex items-center justify-between px-6">
              <div className="flex items-center gap-3">
                <img
                  src={`${S3_PATH}/${
                    chats.find((c: any ) => c._id === activeChat)?.projectDetails
                      ?.image
                  }`}
                  alt="Chat"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h2 className="font-medium text-white">
                    {chats.find((c: any ) => c._id === activeChat)?.name}
                  </h2>
                  <div className="flex items-center gap-1">
                    <Circle className="w-2 h-2 text-emerald-500 fill-emerald-500" />
                    <span className="text-xs text-slate-400">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {[Phone, Video, Star, MoreVertical].map((Icon, idx) => (
                  <button
                    key={idx}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors duration-200"
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages
                .filter((m: any ) => m.chatId === activeChat)
                .map((message: any) => (
                  <motion.div
                    key={message._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-3 ${
                      message.isOwn ? "flex-row-reverse" : ""
                    }`}
                  >
                    <img
                      src={`${S3_PATH}/${message.sender?.profilePic}`}
                      alt={message.sender?.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div
                      className={`flex flex-col ${
                        message.isOwn ? "items-end" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">
                          {message.sender?.name}
                        </span>
                        <span className="text-xs text-slate-400">
                          {message.timestamp}
                        </span>
                      </div>
                      <div
                        className={`max-w-lg rounded-2xl px-4 py-2.5 ${
                          message.isOwn
                            ? "bg-indigo-500 text-white"
                            : "bg-slate-800/50 text-slate-200"
                        }`}
                      >
                        {message.content}

                        {/* Attached file preview */}
                        {message.fileUrl &&
                          (() => {
                            const fileUrl = message.fileUrl.startsWith("http")
                              ? message.fileUrl
                              : `${S3_PATH}/${message.fileUrl}`;
                            const fileName = fileUrl.split("/").pop();
                            const fileExtension = fileName
                              ?.split(".")
                              .pop()
                              ?.toLowerCase();

                            if (!fileExtension) return null;

                            if (fileExtension === "pdf") {
                              return (
                                <div className="mt-2 flex flex-col gap-2">
                                  <embed
                                    src={`${fileUrl}#toolbar=0&navpanes=0`}
                                    type="application/pdf"
                                    className="w-full max-w-xs h-60 rounded-lg border"
                                  />
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-500 underline"
                                  >
                                    Open in new tab
                                  </a>
                                </div>
                              );
                            } else if (
                              ["jpg", "jpeg", "png", "gif", "webp"].includes(
                                fileExtension
                              )
                            ) {
                              return (
                                <img
                                  src={fileUrl}
                                  alt="Uploaded content"
                                  className="max-w-xs mt-2 rounded-lg"
                                />
                              );
                            } else if (
                              [
                                "doc",
                                "docx",
                                "xls",
                                "xlsx",
                                "ppt",
                                "pptx",
                              ].includes(fileExtension)
                            ) {
                              return (
                                <div className="mt-2 bg-gray-700 p-3 rounded-lg">
                                  <iframe
                                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                                      fileUrl
                                    )}`}
                                    width="100%"
                                    height="300"
                                    className="rounded"
                                  />

                                  <div className="mt-4 flex justify-end">
                                    <a
                                      href={fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <button className="px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition duration-300 font-medium shadow-md hover:shadow-lg">
                                        Download File
                                      </button>
                                    </a>
                                  </div>
                                </div>
                              );
                            } else if (fileExtension === "txt") {
                              return (
                                <div className="mt-2 bg-gray-700 p-3 rounded-lg">
                                  <p className="text-white">📄 {fileName}</p>
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 underline"
                                  >
                                    View Text File
                                  </a>
                                </div>
                              );
                            } else {
                              return (
                                <div className="mt-2 bg-gray-700 p-3 rounded-lg">
                                  <p className="text-white">📄 {fileName}</p>
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 underline"
                                  >
                                    Download File
                                  </a>
                                </div>
                              );
                            }
                          })()}
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-slate-700/50"
            >
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  <Paperclip className="w-5 h-5" />
                </label>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200 placeholder-slate-400"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <ImageIcon className="w-5 h-5 text-slate-400 hover:text-white" />
                    </label>
                    <button
                      type="button"
                      className="p-1.5 text-slate-400 hover:text-white"
                    >
                      <LinkIcon className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker((prev) => !prev)}
                      className="p-1.5 text-slate-400 hover:text-white"
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                    {showEmojiPicker && (
                      <div className="absolute bottom-12 right-0 bg-gray-900 p-2 rounded-lg shadow-lg z-50">
                        <EmojiPicker onEmojiClick={handleEmojiSelect} />
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors duration-200"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
