import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc' } = req.query;

    const filter = query ? { title: { $regex: query, $options: 'i' } } : {};
    const videos = await Video.find(filter)
        .sort({ [sortBy]: sortType === 'asc' ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    const totalVideos = await Video.countDocuments(filter);

    res.status(200).json(new ApiResponse(200, { videos, totalVideos }, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required");
    }

    const videoLocalPath = req.file?.path;

    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required");
    }

    const video = await uploadOnCloudinary(videoLocalPath);
    
    const newVideo = new Video({
        title,
        description,
        videoUrl: video.url,
        owner: req.user.id, // Assuming user ID is available in the request
    });

    await newVideo.save();

    res.status(201).json(new ApiResponse(201, newVideo, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { title, description },
        { new: true, runValidators: true }
    );

    if (!updatedVideo) {
        throw new ApiError(404, "Video not found");
    }

    res.status(200).json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findByIdAndDelete(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    video.isPublished = !video.isPublished; // Assuming there's an isPublished field
    await video.save();

    res.status(200).json(new ApiResponse(200, video, "Video publish status toggled successfully"));
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
