"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Hammer, PersonStanding } from "lucide-react"; // Icons
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

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isWorker, setIsWorker] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const location = useLocation();

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
      }
    } catch (error) {
      setIsLoggedIn(false);
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
      return false;
    } catch (error) {
      console.log("Error checking worker status:", error);
      setIsWorker(false);
      return false;
    }
  };

  useEffect(() => {
    checkLogin();
    checkWorker();
  }, [location.pathname]);

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

  const avatarLetters = user.fullname
    ? user.fullname.slice(0, 2).toUpperCase()
    : "NA";

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
                  {user.fullname
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-teal-700 focus:bg-teal-700 cursor-default">
                  <Phone />
                  {user.phoneNumber || "N/A"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile Menu */}
          {/* <div className="md:hidden">
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
              <DropdownMenuItem
                onClick={toggleDarkMode}
                className="hover:bg-teal-700 focus:bg-teal-700"
              >
                {isDarkMode ? "Light Mode" : "Dark Mode"}
              </DropdownMenuItem>
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
        </div> */}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
