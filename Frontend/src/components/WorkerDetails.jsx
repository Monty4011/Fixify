"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

function WorkerDetails() {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams(); // Get worker ID from URL
  const navigate = useNavigate();

  // Fetch worker details
  useEffect(() => {
    const fetchWorker = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/worker/get/${id}`
        );
        setWorker(response.data.worker);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch worker details")
        navigate("/"); // Redirect to home on error
      } finally {
        setLoading(false);
      }
    };
    fetchWorker();
  }, [id, toast, navigate]);

  if (loading)
    return <div className="text-center p-4 text-white">Loading...</div>;
  if (!worker)
    return <div className="text-center p-4 text-white">Worker not found</div>;

  return (
    <div className="h-[90vh] bg-gradient-to-br from-teal-500 to-purple-500 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/90 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-extrabold text-center text-teal-600">
            Worker Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm font-medium text-gray-700">Name</p>
            <p className="text-lg">{worker.userId.fullname}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Phone</p>
            <p className="text-lg">{worker.userId.phoneNumber}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Services</p>
            <p className="text-lg">{worker.service.join(", ")}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Location</p>
            <p className="text-lg">{worker.location}</p>
          </div>
          <Button
            onClick={() => navigate("/")}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white transition-transform transform hover:scale-105"
          >
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default WorkerDetails;
