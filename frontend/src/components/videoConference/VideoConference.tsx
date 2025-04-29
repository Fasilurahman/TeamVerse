import { useEffect, useRef, useState } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import api from '../../api/axiosInstance';

interface ChatMessage {
  messageID: string;
  timestamp: number;
  message: string;
  fromUser: {
    userID: string;
    userName: string;
  };
  sendToAll: boolean;
  status: string;
}

interface VideoConferenceProps {
  roomID: string;
  user: {
    userID: string;
    userName: string;
  };
  role?: 'Host' | 'Cohost' | 'Audience';
  onLeave?: () => void;
}

interface RoomUser {
  userID: string;
  userName: string;
}

const VideoConference = ({ 
  roomID, 
  user, 
  role = 'Host', 
  onLeave
}: VideoConferenceProps) => {
  console.log("VideoConference received roomID:", roomID);
  const containerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const zegoRef = useRef<any>(null);
  const [startTime] = useState<Date>(new Date());
  const [isRoomEmpty, setIsRoomEmpty] = useState(false);
  const [hasSummaryBeenSent, setHasSummaryBeenSent] = useState(false);
  const [participants, setParticipants] = useState<RoomUser[]>([]);
  const [currentUser] = useState<RoomUser>(user);
  const [isLastUserToLeave, setIsLastUserToLeave] = useState(false);

  // Function to send messages to backend
  const sendMessagesToBackend = async () => {
    if (hasSummaryBeenSent || messages.length === 0) {
      return null;
    }
    
    try {
      console.log("Sending messages to backend:", messages);
      const endTime = new Date();
      const response = await api.post('/meetings/summary', {
        roomID, // Make sure this matches what your backend expects
        messages,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      });
      
      console.log('Meeting summary generated:', response.data);
      setHasSummaryBeenSent(true);
      return response.data;
    } catch (error) {
      console.error('Error sending messages to backend:', error);
      return null;
    }
  };


  useEffect(() => {

    if (isLastUserToLeave && !hasSummaryBeenSent && messages.length > 0) {
      console.log("Current user is the last to leave. Sending summary...");
      sendMessagesToBackend();
    }
  }, [isLastUserToLeave, hasSummaryBeenSent, messages]);

  useEffect(() => {
    if (isRoomEmpty && !hasSummaryBeenSent && messages.length > 0) {
      console.log("Room is empty. Sending meeting summary...");
      sendMessagesToBackend();
    }
  }, [isRoomEmpty, hasSummaryBeenSent, messages]);

  useEffect(() => {
    const initializeZego = async () => {
      const appID = import.meta.env.VITE_APP_ID;
      const serverSecret = import.meta.env.VITE_SERVER_SCRET;
      
      if (!roomID || roomID.trim() === '') {
        console.error("Room ID is empty or undefined!");
        return;
      }

      if (!user || !user.userID || !user.userName) {
        console.error("User ID and User Name are required for ZegoCloud!");
        return;
      }

      try {
        console.log("Initializing with roomID:", roomID);
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          Number(appID),
          serverSecret,
          roomID,
          user.userID,
          user.userName
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zegoRef.current = zp;
        
        if (!zp) {
          console.error("Failed to create ZegoUIKitPrebuilt instance");
          return;
        }

        zp.joinRoom({
          container: containerRef.current!,
          scenario: {
            mode: ZegoUIKitPrebuilt.VideoConference,
          },
          showPreJoinView: true,
          showScreenSharingButton: true,
          showUserList: true,
          showLayoutButton: true,
          showPinButton: true,
          showPreviewMicrophoneButton: true,
          showPreviewCameraButton: true,
          turnOnMicrophoneWhenJoining: true,
          turnOnCameraWhenJoining: true,
          showMyCameraToggleButton: true,
          showMyMicrophoneToggleButton: true,
          showAudioVideoSettingsButton: true,
          showTextChat: true,
          showRoomDetailsButton: true,
          maxUsers: 50,
          layout: "Auto",
          showLeavingView: true,
          onUserJoin: (users) => {
            console.log("Users joined:", users);
            setIsRoomEmpty(false);
            
            setParticipants((prev: any) => {
              const newUsers = users.filter(newUser => 
                !prev.some((existingUser: any) => existingUser.userID === newUser.userID)
              );
              const updated = [...prev, ...newUsers];
              console.log("Updated participants after join:", updated);
              return updated;
            });
          },
          
          onUserLeave: (users) => {
            console.log("Users left:", users);
          
            const leftUserIds = users.map(u => u.userID);
            
            setParticipants(prev => {
              const remaining = prev.filter(p => !leftUserIds.includes(p.userID));
              console.log("Remaining participants after leave:", remaining);
              
              if (remaining.length === 0) {
                console.log("Room is now empty, setting isRoomEmpty flag");
                setIsRoomEmpty(true);
              }
              
              return remaining;
            });
          },
          onLeaveRoom: async () => {
            console.log("Current user leaving room manually");
            
            if (participants.length <= 1 && !hasSummaryBeenSent && messages.length > 0) {
              console.log("Current user is the last one. Sending summary before leaving...");
              try {
                await sendMessagesToBackend();
              } catch (error) {
                console.error("Failed to send messages on leave:", error);
              }
            }
            
            onLeave?.();
          },
          
          showNonVideoUser: true,
          showOnlyAudioUser: true,
          useFrontFacingCamera: true,
          whiteboardConfig: {
            showAddImageButton: true,
            showCreateAndCloseButton: true,
          },
          branding: {
            logoURL: "https://your-logo-url.com",
          },
          onInRoomMessageReceived: (messageInfo: ChatMessage) => {
            console.log("Received message:", messageInfo);
            setMessages(prev => [...prev, messageInfo]);
          },
          onInRoomMessageSent: (messageInfo: ChatMessage) => {
            console.log("Message sent:", messageInfo);
            setMessages(prev => [...prev, messageInfo]);
          }
        });
        
      } catch (error) {
        console.error("ZegoCloud initialization error:", error);
      }
    };

    if (containerRef.current) {
      initializeZego();
    }

    return () => {
      if (zegoRef.current) {
      }
    };
  }, [roomID, user, onLeave]);

  return (
    <div className="w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

export default VideoConference;