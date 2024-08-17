import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { Message } from "@/models/user.model";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function POST(request: Request) {
    await dbConnect();
    const { username, content} = await request.json()
    try {
        const user = await UserModel.findOne({username});

        if (!user) {
            return Response.json(
                { message: 'User not found', success: false },
                { status: 404 }
            );
        }

        //check if user is accepting message
        if (!user.isAcceptingMessage) {
            return Response.json(
                { message: 'User does not accept messages', success: false },
                { status: 403 }
            );
        }

        const newMessage = {
            content,
            createdAt: new Date(),
        };

        user.messages.push(newMessage as Message);
        await user.save();

        return Response.json(
            { message: 'Message sent successfully', success: true },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error adding message:', error);
        return Response.json(
            { message: 'Internal server error', success: false },
            { status: 500 }
        );
    }
}
