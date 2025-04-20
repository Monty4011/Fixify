"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Hammer, Menu, PersonStanding } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Phone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { MessageSquare } from "lucide-react";
import io from "socket.io-client";
import { toast } from "sonner";
import {
  addUnreadMessage,
  clearUnreadMessages,
  closeChat,
  openChat,
  setSelectedUserId,
} from "@/redux/chatSlice";
import { DialogDescription } from "@radix-ui/react-dialog";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [chatUsers, setChatUsers] = useState([]);
  const [isWorker, setIsWorker] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isChatOpen, selectedUserId, unreadMessages } = useSelector(
    (store) => store.chat
  );
  const { user } = useSelector((store) => store.auth);
  const location = useLocation();
  const scrollAreaRef = useRef(null); // Ref for ScrollArea component
  const messagesEndRef = useRef(null); // Ref for last message

  // Auto scroll chat to bottom
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      } else if (scrollAreaRef.current) {
        // Fallback: Try ScrollArea's viewport
        const viewport = scrollAreaRef.current.querySelector(
          "[data-radix-scroll-area-viewport]"
        );
        if (viewport) {
          viewport.scrollTo({
            top: viewport.scrollHeight,
            behavior: "smooth",
          });
        }
      }
    };

    // Delay scroll to ensure DOM is updated
    const timer = setTimeout(scrollToBottom, 0);
    return () => clearTimeout(timer);
  }, [messages]);

  // Check login aur worker status
  const checkLogin = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/check-auth`,
        {
          withCredentials: true,
        }
      );
      if (res.data.loggedIn) {
        setIsLoggedIn(true);
      } else {
        console.log("not logged in");
      }
    } catch (error) {
      setIsLoggedIn(false);
      dispatch(handleLogout());
      navigate("/login");
      return false;
    }
  };

  const checkWorker = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/worker/my-services`,
        {
          withCredentials: true,
        }
      );
      if (res.data.success) {
        setIsWorker(true);
        return true;
      }
      setIsWorker(false);
      return;
    } catch (error) {
      // console.log("Error checking worker status:", error);
      setIsWorker(false);
      return false;
    }
  };

  useEffect(() => {
    checkLogin();
    if (checkLogin()) {
      checkWorker();
    }
  }, [location.pathname]);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_BACKEND_URL, {
      withCredentials: true,
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      const userId = user._id; // Jatin's User._id (1)
      newSocket.emit("join", userId);
      console.log("Joined room:", userId);
    });

    newSocket.on("message", (msg) => {
      console.log("Received message:", msg);
      if (msg.senderId === selectedUserId || msg.receiverId === user._id) {
        setMessages((prev) => [...prev, msg]);
      }
      if (msg.receiverId === user._id && msg.senderId !== selectedUserId) {
        dispatch(addUnreadMessage({ senderId: msg.senderId }));
      }
    });

    newSocket.on("connect_error", (error) => {
      console.log("Socket connection error:", error);
    });

    const fetchChatUsers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/chat/users`,
          {
            withCredentials: true,
          }
        );
        setChatUsers(response.data.chatUsers);
      } catch (error) {
        toast.error("Failed to fetch chat users");
      }
    };

    fetchChatUsers();

    return () => newSocket.disconnect();
  }, [toast, dispatch, selectedUserId]);

  useEffect(() => {
    if (selectedUserId) {
      const fetchMessages = async () => {
        try {
          const response = await axios.get(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/v1/chat/messages/${selectedUserId}`,
            {
              withCredentials: true,
            }
          );
          setMessages(response.data.messages);
          dispatch(clearUnreadMessages(selectedUserId));
        } catch (error) {
          console.log(error);
          toast.error("Failed to fetch messages");
        }
      };
      fetchMessages();
    }
  }, [selectedUserId, toast]);

  const handleSendMessage = async () => {
    const senderId = user._id; // Jatin's User._id (1)
    if (!newMessage.trim() || !selectedUserId) return;
    const optimisticMessage = {
      senderId,
      receiverId: selectedUserId,
      message: newMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage("");
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/chat/send`,
        { receiverId: selectedUserId, message: newMessage },
        {
          withCredentials: true,
        }
      );
      if (response.data.success) {
        // Update with backend message (in case timestamp or _id differs)
        const backendMessage = response.data.message;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.timestamp === optimisticMessage.timestamp &&
            msg.message === optimisticMessage.message
              ? {
                  ...backendMessage,
                  timestamp: new Date(backendMessage.timestamp),
                }
              : msg
          )
        );
      }
      setNewMessage("");
    } catch (error) {
      console.log(error);
      setMessages((prev) => prev.filter((msg) => msg !== optimisticMessage));
      toast.error("Failed to send message");
    }
  };

  const handleLogout = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/logout`,
        {
          withCredentials: true,
        }
      );
      if (res.data.success) {
        dispatch(setAuthUser(null));
        navigate("/login");
        toast.success(res.data.message);
        setIsLoggedIn(false);
        setIsWorker(false);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const avatarLetters = user?.fullname
    ? user?.fullname.slice(0, 2).toUpperCase()
    : "NA";

  const hasUnreadMessages = Object.keys(unreadMessages || {}).length > 0;

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-teal-500 to-purple-500 p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap">
        {/* Left: Logo & App Name */}
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <Hammer className="w-8 h-8 text-white" />
          <h1 className="text-white text-xl font-extrabold tracking-tight">
            Fixify
          </h1>
        </div>

        {/* Right: Buttons */}
        <div className="flex items-center justify-evenly space-x-4">
          <div className="hidden md:flex items-center space-x-4">
            {/* Chat Button */}
            {isLoggedIn && (
              <div className="relative">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-teal-700"
                  onClick={() => dispatch(openChat(null))}
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Chat
                </Button>
                {hasUnreadMessages && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full" />
                )}
              </div>
            )}
            {/* Worker Button */}
            {isLoggedIn && (
              <Button
                variant="default"
                className="bg-teal-600 hover:bg-teal-700 transition-transform transform hover:scale-105"
                onClick={() =>
                  navigate(isWorker ? "/my-profile" : "/register-worker")
                }
              >
                {isWorker ? "My Profile" : "Register as Worker"}
              </Button>
            )}

            {/* Login/Logout */}
            <Button
              variant={isLoggedIn ? "destructive" : "outline"}
              className={
                isLoggedIn
                  ? "bg-red-500 hover:bg-red-600"
                  : " border-white hover:bg-white/20"
              }
              onClick={isLoggedIn ? handleLogout : () => navigate("/login")}
            >
              {isLoggedIn ? "Logout" : "Login"}
            </Button>
          </div>

          {/* Chat Button */}
          {isLoggedIn && (
            <div className="relative sm:hidden">
              <Button
                variant="ghost"
                className="text-white hover:bg-teal-700"
                onClick={() => dispatch(openChat(null))}
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Chat
              </Button>
              {hasUnreadMessages && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full" />
              )}
            </div>
          )}

          {/* Avatar Dropdown */}
          {isLoggedIn && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-10 w-10 cursor-pointer">
                  <AvatarFallback className="font-bold text-xl items-center">
                    {avatarLetters}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-teal-600 text-white border-none shadow-lg mt-2 mr-2">
                <DropdownMenuItem className="hover:bg-teal-700 focus:bg-teal-700 cursor-default">
                  <PersonStanding />
                  {user?.fullname
                    ?.split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-teal-700 focus:bg-teal-700 cursor-default">
                  <Phone />
                  {user?.phoneNumber || "N/A"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile Menu */}
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                >
                  <Menu className="w-6 h-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="bg-teal-600 text-white border-none shadow-lg mt-2 mr-2"
                align="end"
              >
                {isLoggedIn && (
                  <DropdownMenuItem
                    onClick={() =>
                      navigate(isWorker ? "/my-profile" : "/register-worker")
                    }
                    className="hover:bg-teal-700 focus:bg-teal-700"
                  >
                    {isWorker ? "My Profile" : "Register as Worker"}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={isLoggedIn ? handleLogout : () => navigate("/login")}
                  className="hover:bg-teal-700 focus:bg-teal-700"
                >
                  {isLoggedIn ? "Logout" : "Login"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <Dialog
        open={isChatOpen}
        onOpenChange={(open) =>
          dispatch(open ? openChat(selectedUserId) : closeChat())
        }
      >
        <DialogContent className="bg-white w-3/4 sm:max-w-2xl max-h-[80vh] flex">
          <div className="w-1/3 border-r">
          <DialogDescription className="hidden"></DialogDescription>
            <DialogHeader>
              <DialogTitle>Chats</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[60vh]">
              {chatUsers.length > 0 ? (
                chatUsers.map((user) => (
                  <div
                    key={user._id}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${
                      selectedUserId === user._id ? "bg-teal-100" : ""
                    }`}
                    onClick={() => dispatch(setSelectedUserId(user._id))}
                  >
                    <p className="font-medium">{user.fullname}</p>
                    {unreadMessages && unreadMessages[user._id] && (
                      <span className="ml-2 text-xs text-red-500">
                        ({unreadMessages[user._id]} new)
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="p-4 text-gray-500">No chats yet</p>
              )}
            </ScrollArea>
          </div>
          <div className="w-2/3 flex flex-col">
            <DialogHeader>
              <DialogTitle>
                {selectedUserId
                  ? chatUsers.find((u) => u._id === selectedUserId)?.fullname
                  : "Select a chat"}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              {selectedUserId ? (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-2 ${
                      msg.senderId === user._id ? "text-right" : "text-left"
                    }`}
                  >
                    <p className="text-sm text-gray-700 inline-block p-2 rounded-lg bg-gray-100">
                      {msg.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                    <div ref={messagesEndRef} />
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Select a user to start chatting</p>
              )}
            </ScrollArea>
            {selectedUserId && (
              <div className="flex space-x-2 p-4 border-t">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message"
                  className="flex-grow"
                />
                <Button onClick={handleSendMessage}>Send</Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </nav>
  );
}

export default Navbar;
