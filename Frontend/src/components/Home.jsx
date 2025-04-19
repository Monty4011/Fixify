"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import axios from "axios";
import { Outlet, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

function Home() {
  const [searchService, setSearchService] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [services, setServices] = useState([]);
  const [locations, setLocations] = useState([]);
  const [latestWorkers, setLatestWorkers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, locationsRes, workersRes] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/v1/worker/services`
          ),
          axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/v1/worker/locations`
          ),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/worker/get`),
        ]);
        setServices(servicesRes.data.services || []);
        setLocations(locationsRes.data.locations || []);
        setLatestWorkers(workersRes.data.workers.slice(0, 10) || []);
      } catch (error) {
        toast.error("Failed to load data");
      }
    };
    fetchData();
  }, [toast]);

  // Handle search
  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/worker/get`,
        {
          params: { service: searchService, location: searchLocation },
        }
      );
      setSearchResults(response.data.workers || []);
    } catch (err) {
      setSearchResults([]);
    }
  };

  // Handle carousel filter
  const handleFilter = async (type, value) => {
    setIsSearching(true);
    if (type === "service") setSearchService(value);
    if (type === "location") setSearchLocation(value);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/worker/get`,
        {
          params: {
            service: type === "service" ? value : searchService,
            location: type === "location" ? value : searchLocation,
          },
        }
      );
      setSearchResults(response.data.workers || []);
    } catch (error) {
      toast.error("Failed to filter workers");
    }
  };

  const handleBack = () => {
    setIsSearching(false);
    setSearchService("");
    setSearchLocation("");
    setSearchResults([]);
  };
  return (
    <div className="h-screen sm:h-[90vh] bg-gradient-to-br from-teal-500 to-purple-500">
      {/* Search Section */}
      <section className="p-6 flex justify-center">
        <div className="w-3/4 sm:max-w-2xl sm:w-full flex space-x-4">
          <Input
            value={searchService}
            onChange={(e) => setSearchService(e.target.value)}
            placeholder="Search by service (e.g., Plumber)"
            className="bg-white/90 border-none focus:ring-teal-500"
          />
          <Input
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            placeholder="Search by location (e.g., Delhi)"
            className="bg-white/90 border-none focus:ring-teal-500"
          />
          <Button
            onClick={handleSearch}
            className="bg-teal-600 hover:bg-teal-700 text-white transition-transform transform hover:scale-105"
          >
            Search
          </Button>
        </div>
      </section>

      {/* Carousels - Hidden when searching */}
      {!isSearching && (
        <>
          <section className="px-6 py-4">
            <h2 className="text-2xl font-extrabold text-white text-center mb-2">
              Service Categories
            </h2>
            <Carousel className="w-3/4 sm:max-w-4xl mx-auto">
              <CarouselContent>
                {services?.map((service, index) => (
                  <CarouselItem key={index} className="basis-1/3">
                    <Button
                      variant="outline"
                      className="w-full bg-white/90 text-teal-600 hover:bg-teal-100 transition-all"
                      onClick={() => setSearchService(service)}
                    >
                      {service
                        ?.split(" ")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </Button>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </section>

          <section className="px-6 py-4">
            <h2 className="text-2xl font-extrabold text-white text-center mb-2">
              Servicable Locations
            </h2>
            <Carousel className="w-3/4 sm:max-w-4xl mx-auto">
              <CarouselContent>
                {locations?.map((location, index) => (
                  <CarouselItem key={index} className="basis-1/3">
                    <Button
                      variant="outline"
                      className="w-full bg-white/90 text-teal-600 hover:bg-teal-100 transition-all"
                      onClick={() => setSearchLocation(location)}
                    >
                      {location
                        ?.split(" ")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </Button>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </section>

          <section className="px-6 py-4">
            <h2 className="text-2xl font-extrabold text-white text-center mb-2">
              Latest Workers
            </h2>
            <Carousel className="w-3/4 sm:max-w-5xl mx-auto">
              <CarouselContent>
                {latestWorkers?.map((worker) => (
                  <CarouselItem key={worker?._id} className="sm:basis-1/3">
                    <Card className="bg-white/90 shadow-lg hover:shadow-xl transition-all h-64 w-full flex flex-col">
                      <CardHeader className="flex-shrink-0">
                        <CardTitle className="text-teal-600 text-xl truncate">
                          {worker?.userId?.fullname}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow overflow-hidden">
                        <p className="text-gray-700 text-sm truncate">
                          <strong>Services:</strong>{" "}
                          {worker?.service
                            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                            .join(", ")}
                        </p>
                        <p className="text-gray-700 text-sm truncate">
                          <strong>Location:</strong>{" "}
                          {worker?.location
                            .split(" ")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")}
                        </p>
                        <p className="text-gray-700 text-sm truncate">
                          <strong>Phone:</strong> {worker?.userId?.phoneNumber}
                        </p>
                      </CardContent>
                      <CardFooter className="flex-shrink-0">
                        <Button
                          variant="outline"
                          className="w-full border-teal-500 text-teal-500 hover:bg-teal-100 text-sm"
                          onClick={() => navigate(`/worker/${worker._id}`)}
                        >
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </section>
        </>
      )}

      {/* Search Results with Back Button */}
      {isSearching && (
        <section className="p-6">
          <div className="max-w-5xl mx-auto">
            <Button
              variant="outline"
              className="mb-4 bg-white/90 text-teal-600 hover:bg-teal-100 transition-all"
              onClick={handleBack}
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> Back
            </Button>
            <h2 className="text-2xl font-extrabold text-white text-center mb-4">
              Search Results
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {searchResults?.length > 0 ? (
                searchResults?.map((worker) => (
                  <Card
                    key={worker?._id}
                    className="bg-white/90 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between"
                  >
                    <CardHeader>
                      <CardTitle className="text-teal-600">
                        {worker?.userId?.fullname
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">
                        <strong>Services:</strong>{" "}
                        {worker?.service
                          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                          .join(", ")}
                      </p>
                      <p className="text-gray-700">
                        <strong>Location:</strong>{" "}
                        {worker?.location
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </p>
                      <p className="text-gray-700">
                        <strong>Phone:</strong> {worker?.userId?.phoneNumber}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full border-teal-500 text-teal-500 hover:bg-teal-100"
                        onClick={() => navigate(`/worker/${worker._id}`)}
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <p className="text-white text-center col-span-full">
                  No workers found
                </p>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;
