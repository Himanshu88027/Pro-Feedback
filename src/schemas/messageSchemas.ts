import {z} from "zod";

export const messageSchemas = z.object({
    content: z
        .string()
        .min(10, {message: "Message content should be at least 10 character long"})
        .max(300, {message: "Message content should not exceed 300 characters"}),
})