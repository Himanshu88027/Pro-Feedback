import {z} from "zod";

export const acceptingMessageSchemas = z.object({
    acceptMessages: z.boolean()
})