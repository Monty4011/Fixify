import { User } from "../models/user.model.js";
import { Worker } from "../models/worker.model.js";

export const postService = async (req, res) => {
    try {
        const { service, location } = req.body;

        const userId = req.id;

        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        const existingWorker = await Worker.findOne({ userId });
        if (existingWorker) {
            return res.status(400).json({
                message: "You already have a worker profile, please update it",
                success: false
            });
        }

        if (!service || !Array.isArray(service) || service.length === 0 || !location) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            });
        }

        const job = await Worker.create({
            service,
            location,
            userId
        });
        return res.status(201).json({
            message: "Job created successfully",
            job,
            success: true
        })


    } catch (error) {
        console.log("Error in postService:", error);
        return res.status(500).json({
            message: "Server error while creating job",
            success: false
        });
    }
}

export const getAllWorkers = async (req, res) => {
    try {
        const { location, service } = req.query;

        let query = {};

        if (location) {
            query.location = { $regex: new RegExp(location, 'i') };
        }

        if (service) {
            query.service = { $in: [new RegExp(service, 'i')] };
        }

        const workers = await Worker.find(query).populate('userId', 'fullname phoneNumber');

        // Check if any workers found
        if (!workers || workers.length === 0) {
            return res.status(404).json({
                message: "No workers found for the given criteria",
                success: false
            });
        }

        return res.status(200).json({
            message: "Workers fetched successfully",
            workers,
            success: true
        });
    } catch (error) {
        console.log("Error in getAllWorkers:", error);
        return res.status(500).json({
            message: "Server error while fetching workers",
            success: false
        });
    }
};

export const updateWorker = async (req, res) => {
    try {
        const { service, location } = req.body;
        const userId = req.id;
        const worker = await Worker.findOneAndUpdate(
            { userId },
            { service, location },
            { new: true }
        );
        if (!worker) {
            return res.status(404).json({ message: "Worker not found", success: false });
        }
        return res.status(200).json({ message: "Worker updated successfully", worker, success: true });
    } catch (error) {
        console.log("Error in updateWorker:", error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const deleteWorker = async (req, res) => {
    try {
        const userId = req.id;
        const worker = await Worker.findOneAndDelete({ userId });
        if (!worker) {
            return res.status(404).json({ message: "Worker not found", success: false });
        }
        return res.status(200).json({ message: "Worker deleted successfully", success: true });
    } catch (error) {
        console.log("Error in deleteWorker:", error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const getMyServices = async (req, res) => {
    try {
        const userId = req.id;

        const worker = await Worker.findOne({ userId }).populate('userId', 'fullname phoneNumber');

        if (!worker) {
            return res.status(404).json({
                message: "No services found for this user",
                success: false
            });
        }

        return res.status(200).json({
            message: "Your services fetched successfully",
            worker,
            success: true
        });
    } catch (error) {
        console.log("Error in getMyServices:", error);
        return res.status(500).json({
            message: "Server error while fetching your services",
            success: false
        });
    }
};

export const getWorkerById = async (req, res) => {
    try {
        const worker = await Worker.findById(req.params.id).populate('userId', 'fullname phoneNumber');
        if (!worker) {
            return res.status(404).json({ message: "Worker not found", success: false });
        }
        return res.status(200).json({ message: "Worker fetched successfully", worker, success: true });
    } catch (error) {
        console.log("Error in getWorkerById:", error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const getServiceCategories = async (req, res) => {
    try {
        const services = await Worker.distinct("service");
        if (!services || services.length === 0) {
            return res.status(404).json({
                message: "No services found",
                success: false
            });
        }
        const uniqueServices = [...new Set(services.map(service => service.toLowerCase()))];
        return res.status(200).json({
            message: "Service categories fetched successfully",
            services: uniqueServices,
            success: true
        });
    } catch (error) {
        console.log("Error in getServiceCategories:", error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};

export const getLocationCategories = async (req, res) => {
    try {
        const locations = await Worker.distinct("location");
        if (!locations || locations.length === 0) {
            return res.status(404).json({
                message: "No locations found",
                success: false
            });
        }
        const uniqueLocations = [...new Set(locations.map(location => location.toLowerCase()))];
        return res.status(200).json({
            message: "Location categories fetched successfully",
            locations: uniqueLocations,
            success: true
        });
    } catch (error) {
        console.log("Error in getLocationCategories:", error);
        return res.status(500).json({
            message: "Server error while fetching locations",
            success: false
        });
    }
};