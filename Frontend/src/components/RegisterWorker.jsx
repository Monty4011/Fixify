"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

function RegisterWorker() {
  const [services, setServices] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const serviceArray = services
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/worker/post`,
        { service: serviceArray, location },
        {
          withCredentials: true,
        }
      );
      if (res.data.success) {
        toast.success("Worker profile created successfully!");
      }
      navigate("/my-profile");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen sm:h-[90vh] bg-gradient-to-br from-teal-500 to-purple-500 flex items-start sm: gap-10 sm:py-20 space-y-16 justify-center px-4 py-36 sm:p-4">
      <Button
        variant="outline"
        className="mb-4 bg-white/90 text-teal-600 hover:bg-teal-100 transition-all"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="w-5 h-5 mr-2" /> Back
      </Button>
      <Card className="w-full max-w-md bg-white/90 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-extrabold text-center text-teal-600">
            Register as a Worker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                className="mt-1 w-full border-gray-300 focus:border-teal-500 focus:ring-teal-500 transition-all"
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
                className="mt-1 w-full border-gray-300 focus:border-teal-500 focus:ring-teal-500 transition-all"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 transition-transform transform hover:scale-105 disabled:opacity-50"
            >
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default RegisterWorker;
