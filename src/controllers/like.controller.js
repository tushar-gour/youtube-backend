import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const existingLike = await Like.findOne({ video: videoId, user: req.user.id });

    if (existingLike) {
        // If the like exists, remove it
        await Like.deleteOne({ _id: existingLike._id });
        return res.status(200).json(new ApiResponse(200, null, "Video unliked successfully"));
    } else {
        // If the like does not exist, create it
        const newLike = new Like({ video: videoId, user: req.user.id });
        await newLike.save();
        return res.status(201).json(new ApiResponse(201, newLike, "Video liked successfully"));
    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const existingLike = await Like.findOne({ comment: commentId, user: req.user.id });

    if (existingLike) {
        await Like.deleteOne({ _id: existingLike._id });
        return res.status(200).json(new ApiResponse(200, null, "Comment unliked successfully"));
    } else {
        const newLike = new Like({ comment: commentId, user: req.user.id });
        await newLike.save();
        return res.status(201).json(new ApiResponse(201, newLike, "Comment liked successfully"));
    }
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.find({ user: req.user.id }).populate('video');
    return res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos retrieved successfully"));
});

export { toggleCommentLike, toggleVideoLike, getLikedVideos };
