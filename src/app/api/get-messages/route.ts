import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import mongoose from "mongoose";
import UserModel from "@/models/user.model";

export async function GET(request: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const _user: User = session?.user as User;
  
    if (!session || !_user) {
      return new Response(
        JSON.stringify({ success: false, message: "Not authenticated" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
  
    const userId = new mongoose.Types.ObjectId(_user._id);
    try {
      const user = await UserModel.aggregate([
        { $match: { _id: userId } },
        // Check if messages array is not empty before unwinding
        {
          $project: {
            messages: {
              $cond: {
                if: { $isArray: "$messages" },
                then: "$messages",
                else: [],
              },
            },
          },
        },
        { $unwind: { path: "$messages", preserveNullAndEmptyArrays: true } },
        { $sort: { "messages.createdAt": -1 } },
        { $group: { _id: "$_id", messages: { $push: "$messages" } } },
      ]).exec();
  
      if (!user || user.length === 0) {
        return new Response(
          JSON.stringify({ message: "User not found", success: false }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
  
      return new Response(
        JSON.stringify({ messages: user[0].messages }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      return new Response(
        JSON.stringify({ message: "Internal server error", success: false }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }