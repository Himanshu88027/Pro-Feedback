'use client'
import { useEffect, useState } from 'react'
import { useDebounceCallback } from 'usehooks-ts'
import { useToast } from "@/components/ui/use-toast"
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from 'zod'
import { signUpSchemas } from '@/schemas/signUpSchemas'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import { useRouter } from 'next/navigation'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

function Signup() {
    const [username, setUsername] = useState('')
    const [usernameMessage, setUsernameMessage] = useState('')
    const [isCheckingUsername, setIsCheckingUsername] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const delayed = useDebounceCallback(setUsername, 500)
    const { toast } = useToast()
    const router = useRouter()

    //zod implementation
    const form = useForm<z.infer <typeof signUpSchemas>>({
        resolver: zodResolver(signUpSchemas),
        defaultValues: {
            username: '',
            email: '',
            password: ''
        }
    })

    useEffect(() => {
        const checkUniqueUsername = async () => {
            if (username) {
                setIsCheckingUsername(true)
                setUsernameMessage('') //reset message
                
                try {
                    const response = await axios.get(`/api/check-unique-username?username=${username}`)
                    setUsernameMessage(response.data.message)
                } catch (error) {
                    const axiosError = error as AxiosError<ApiResponse>
                    setUsernameMessage(
                        axiosError.response?.data.message ?? 'Error checking username'
                    );
                } finally {
                    setIsCheckingUsername(false);
                }
            }
        }
        checkUniqueUsername()
    }, [username])

    const onSubmit = async (data: z.infer <typeof signUpSchemas>) => {
        setIsSubmitting(true)

        try {
            const response = await axios.post('/api/sign-up', data)
            toast({
                title: 'Success',
                description: response.data.message,
            });

            router.replace(`/verify/${username}`)

            setIsSubmitting(false)
        } catch (error) {
            console.error('Error in signup user',  error)
            const axiosError = error as AxiosError<ApiResponse>
            let errorMessage = axiosError.response?.data.message;

            toast({
                title: 'Error',
                description: errorMessage?? 'An error occurred while signing up',
                variant: 'destructive',
            })

            setIsSubmitting(false)
        }
    }
  return (
    <div className='h-screen w-full flex justify-center items-center bg-slate-900 p-4'>
        <div className='sm:w-1/3 w-full h-full rounded-3xl bg-white py-4 px-6 space-y-4'>
        <div className='text-center tracking-tighter space-y-4'>
            <h1 className='text-5xl font-extrabold text-center'>Join Pro Feedback</h1>
            <p className='text-lg tracking-normal'>Signup to send anonymous messages</p>
        </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                    <FormField
                        name="username"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            setUsername(e.target.value)
                                        }}
                                    />

                                </FormControl>
                                {isCheckingUsername && <Loader2 className='animate-spin' />}
                                {!isCheckingUsername && usernameMessage && (
                                    <p
                                      className={`text-sm ${
                                        usernameMessage === 'Username is unique'
                                          ? 'text-green-500'
                                          : 'text-red-500'
                                      }`}
                                    >
                                      {usernameMessage}
                                    </p>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="email"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="password"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type='password' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type='submit' disabled={isSubmitting} className='w-full'>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Please wait
                            </>
                        ) : (
                            "Signup"
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    </div>
  )
}

export default Signup