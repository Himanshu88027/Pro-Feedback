"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { messageSchemas } from "@/schemas/messageSchemas";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useCompletion } from "ai/react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const stringChar = "||";
const pasreMessageString = (messageString: string): string[] => {
  return messageString.split(stringChar);
};

const initialMessageString =
  "What's your favorite movie?||Do you have any pets?||What's your dream job?";

export default function Profile() {
  const params = useParams<{ username: string }>();
  const username = params.username;
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof messageSchemas>>({
    resolver: zodResolver(messageSchemas),
  });

  const {
    complete,
    completion,
    isLoading: isSuggestLoading,
    error,
  } = useCompletion({
    api: "/api/suggest-messages",
    initialCompletion: initialMessageString,
  });

  const messageContent = form.watch("content");

  const onSubmit = async (data: z.infer<typeof messageSchemas>) => {
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>("/api/send-messages", {
        username,
        ...data,
      });

      toast({
        title: response.data.message,
        variant: "default",
      });

      // Reset form
      form.reset({ ...form.getValues(), content: "" });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ?? "Failed to sent message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestMessages = () => {
    try {
      complete("");
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleClickMessage = (messageString: string) => {
    form.setValue("content", messageString);
  };

  return (
    <div className="container flex flex-col my-8 p-6 bg-white rounded w-full">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Public Profile Link
      </h1>
      <div className="flex justify-evenly w-full gap-4">
        <div className="w-1/2 flex justify-center border rounded-lg py-6">
          <div className="w-4/5">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  name="content"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">{`Send Anonymous Message to @${username}`}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us a little bit about yourself"
                          className="resize-none h-56"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  {isLoading ? (
                    <Button disabled>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      type="submit"
                      disabled={isLoading || !messageContent}
                    >
                      Send It
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </div>
        </div>
        <div className="w-1/2">
          <div className="space-y-10">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Messages
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col space-y-4">
                {error ? (
                  <p className="text-red-500">{error.message}</p>
                ) : (
                  pasreMessageString(completion).map((message, index) => (
                    <Button
                      onClick={() => handleClickMessage(message)}
                      key={index}
                      className="mb-2"
                      variant="outline"
                    >
                      {message}
                    </Button>
                  ))
                )}
              </CardContent>
            </Card>
            <Button
              disabled={isSuggestLoading}
              onClick={fetchSuggestMessages}
              className="w-full"
            >
              Suggest Messages [A.I.]
            </Button>
            <Separator className="my-6" />
            <div className="text-center">
              <div className="mb-4">Get Your Message Board</div>
              <Link href={"/sign-up"}>
                <Button>Create Your Account</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

