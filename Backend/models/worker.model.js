import mongoose from "mongoose";

const workerSchema = new mongoose.Schema({
    service: {
        type: [String],
        required: true
    },
    location: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

}, { timestamps: true });

export const Worker = mongoose.model('Worker', workerSchema);