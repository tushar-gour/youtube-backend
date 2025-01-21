import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
    const { channel } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(channel)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const totalSubscribers = await Subscription.find({ channel })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .countDocuments({ channel });

    const totalVideos = await Video.countDocuments({ owner: channel });

    const totalViews = await Video.aggregate([
        { $match: { owner: channel } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } },
    ]);

    const totalLikes = await Like.countDocuments({ channel: channel });

    return res.status(201).json(
        new ApiResponse(
            200, 
            {
                totalSubscribers,
                totalVideos,
                totalViews: totalViews[0]?.totalViews || 0,
                totalLikes,
            },
            "Data fetched successfully"
        )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const { channel } = req.params;

    if (!mongoose.Types.ObjectId.isValid(channel)) {
        throw new ApiError(400, "Invalid channel ID");
    }
    const totalVideos = await Video.countDocuments({ owner: channel });

    return res.status(201).json(
        new ApiResponse(201, totalVideos, "Videos fetched successfully")
    );
});

export { getChannelStats, getChannelVideos };
