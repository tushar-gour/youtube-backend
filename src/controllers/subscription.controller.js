import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const existingSubscription = await Subscription.findOne({ channel: channelId, user: req.user._id });

    if (existingSubscription) {
        // If the subscription exists, remove it
        await Subscription.deleteOne({ _id: existingSubscription._id });
        return res.status(200).json(new ApiResponse(200, null, "Unsubscribed successfully"));
    } else {
        // If the subscription does not exist, create it
        const newSubscription = new Subscription({ channel: channelId, user: req.user._id });
        await newSubscription.save();
        return res.status(201).json(new ApiResponse(201, newSubscription, "Subscribed successfully"));
    }
});

// Controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const subscribers = await Subscription.find({ channel: channelId }).populate('user');

    res.status(200).json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"));
});

// Controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    const subscriptions = await Subscription.find({ user: subscriberId }).populate('channel');

    res.status(200).json(new ApiResponse(200, subscriptions, "Subscribed channels fetched successfully"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
