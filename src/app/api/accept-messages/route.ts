import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import { User } from "next-auth";
import UserModel from "@/models/user.model";

export async function POST(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  console.log(session);

  const user:any = session?.user;
  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated",
      },
      { status: 401 }
    );
  }
  const userId = user._id;

  const { acceptMessages } = await request.json();

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessage: acceptMessages },
      { new: true }
    );

    if (!updatedUser) {
        return Response.json(
          { success: false, message: "Unable to find user to update message acceptance status" },
          { status: 404 }
        );
    }

    return Response.json(
        {
          success: true,
          message: 'Message acceptance status updated successfully',
          updatedUser,
        },
        { status: 200 }
      );
    
  } catch (error) {
    console.error("Error updating message acceptance status:", error);
    return Response.json(
      { success: false, message: "Error updating message acceptance status" },
      { status: 500 }
    );
  }
}



export async function GET(request: Request) {
    await dbConnect();
  
    const session = await getServerSession(authOptions);
    console.log(session);
  
    const user:any = session?.user;
    if (!session || !user) {
      return Response.json(
        {
          success: false,
          message: "Not Authenticated",
        },
        { status: 401 }
      );
    }
    const userId = user._id;
  
    try {
      const foundedUser = await UserModel.findById(userId);
        
  
      if (!foundedUser) {
          return Response.json(
            { success: false, message: "User not found" },
            { status: 404 }
          );
      }
  
      return Response.json(
          {
            success: true,
            isAcceptingMessage: foundedUser.isAcceptingMessage  
          },
          { status: 200 }
        );
      
    } catch (error) {
      console.error("Error updating message acceptance status:", error);
      return Response.json(
        { success: false, message: "Error updating message acceptance status" },
        { status: 500 }
      );
    }
  }