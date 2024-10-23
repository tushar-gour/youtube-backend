import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const comments = await Comment.find({ videoId })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

    const totalComments = await Comment.countDocuments({ videoId });

    res.status(200).json(
        new ApiResponse(
            200,
            { comments, totalComments },
            "Comments fetched successfully"
        )
    );
});

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content, userId } = req.body;

    if (
        !mongoose.Types.ObjectId.isValid(videoId) ||
        !mongoose.Types.ObjectId.isValid(userId)
    ) {
        throw new ApiError(400, "Invalid video ID or user ID");
    }

    const comment = new Comment({
        videoId,
        userId,
        content,
    });

    await comment.save();

    res.status(201).json(
        new ApiResponse(201, comment, "Comment added successfully")
    );
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        { content },
        { new: true, runValidators: true }
    );

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    res.status(200).json(
        new ApiResponse(200, comment, "Comment updated successfully")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const comment = await Comment.findByIdAndDelete(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    res.status(200).json(
        new ApiResponse(200, {}, "Comment deleted successfully")
    );
});

export { getVideoComments, addComment, updateComment, deleteComment };
