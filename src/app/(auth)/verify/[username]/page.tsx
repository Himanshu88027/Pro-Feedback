'use client'
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { verifySchemas } from '@/schemas/verifySchemas';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react'
import * as z from 'zod'
import { useForm } from 'react-hook-form';
import { useParams, useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { useToast } from '@/components/ui/use-toast';
import { ApiResponse } from '@/types/ApiResponse';

function page() {
    const router = useRouter()
    const params = useParams<{username: string}>()
    const { toast } = useToast()


    const form = useForm<z.infer <typeof verifySchemas>>({
        resolver: zodResolver(verifySchemas)
    })
    const onSubmit = async (data: z.infer <typeof verifySchemas>) => {
        try {
            const response = await axios.post('/api/verify-code', {
                username: encodeURIComponent(params.username),
                code: data.code
            })
            toast({
                title: 'Success',
                description: response.data.message,
            });
            router.replace('/sign-in')
        } catch (error) {
            console.error('Error in verifying user',  error)
            const axiosError = error as AxiosError<ApiResponse>
            let errorMessage = axiosError.response?.data.message;

            toast({
                title: 'Error',
                description: errorMessage?? 'An error occurred while verifying user',
                variant: 'destructive',
            })
        }
    }
  return (
    <div className='h-screen w-full flex justify-center items-center bg-slate-900 p-4'>
        <div className='sm:w-1/3 w-full h-96 rounded-3xl bg-white py-4 px-6 space-y-4 flex flex-col gap-2 justify-center'>
        <div className='text-center tracking-tighter space-y-4'>
            <h1 className='text-5xl font-extrabold text-center'>Verify Your Account</h1>
            <p className='text-lg tracking-normal'>Enter the verification code sent to your email</p>
        </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                    <FormField
                        name="code"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Verification Code</FormLabel>
                                <FormControl>
                                    <Input {...field}/>

                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type='submit'>
                        Verify
                    </Button>
                </form>
            </Form>
        </div>
    </div>
  )
}

export default page