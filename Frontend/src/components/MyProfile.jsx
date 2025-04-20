"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { ArrowLeft } from "lucide-react";

function MyProfile() {
  const [worker, setWorker] = useState(null);
  const [services, setServices] = useState("");
  const [location, setLocation] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);

  // Fetch worker details
  useEffect(() => {
    const fetchWorker = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/worker/my-services`,
          {
            withCredentials: true,
          }
        );
        setWorker(response.data.worker);
        setServices(response.data.worker.service.join(", "));
        setLocation(response.data.worker.location);
      } catch (error) {
        toast.error("Failed to fetch profile");
        navigate("/");
      }
    };
    fetchWorker();
  }, [navigate, toast]);

  // Update profile
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const serviceArray = services
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/worker/update`,
        { service: serviceArray, location },
        {
          withCredentials: true,
        }
      );
      setWorker(response.data.worker);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  // Delete profile
  const handleDelete = async () => {
    setLoading(true);

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/worker/delete`,
        { withCredentials: true }
      );
      toast.success("Your work profile has been deleted successfully.");
      navigate("/");
    } catch (error) {
      toast.error("Failed to delete profile");
    } finally {
      setLoading(false);
    }
  };

  if (!worker) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="h-screen sm:h-[90vh] bg-gradient-to-br from-teal-500 to-purple-500 flex flex-col sm:flex-row items-start sm:py-24 justify-start py-36 sm:justify-center px-4 sm:p-4 gap-10">
      <Button
        variant="outline"
        className="mb-4 bg-white/90 text-teal-600 hover:bg-teal-100 transition-all "
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Home
      </Button>
      <Card className="w-full max-w-md bg-white/90 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-extrabold text-center text-teal-600">
            My Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isEditing ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Name</p>
                <p className="text-lg">
                  {user?.fullname
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Phone</p>
                <p className="text-lg">{user?.phoneNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Services</p>
                <p className="text-lg">
                  {worker?.service
                    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                    .join(", ")}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Location</p>
                <p className="text-lg">
                  {worker?.location
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </p>
              </div>
              <div className="flex space-x-4">
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white transition-transform transform hover:scale-105"
                >
                  Edit Profile
                </Button>
                <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="bg-red-500 hover:bg-red-600 text-white transition-transform transform hover:scale-105"
                    >
                      Delete Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white w-3/4">
                    <DialogHeader>
                      <DialogTitle>Confirm Deletion</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete your profile? This
                        action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsDeleteOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                      >
                        {loading ? "Deleting..." : "Delete"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label
                  htmlFor="services"
                  className="block text-sm font-medium text-gray-700"
                >
                  Services (comma-separated)
                </label>
                <Input
                  id="services"
                  value={services}
                  onChange={(e) => setServices(e.target.value)}
                  placeholder="e.g., Plumber, Carpenter"
                  className="mt-1 w-full border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700"
                >
                  Location
                </label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Delhi"
                  className="mt-1 w-full border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
              <div className="flex space-x-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-teal-600 hover:bg-teal-700 text-white transition-transform transform hover:scale-105 disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="hover:bg-gray-100"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default MyProfile;
