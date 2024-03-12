"use client"
// Shadcn
import { cn } from "@/lib/utils"
import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
// Zod
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
// Api
import { signupAuth, signupAuthGoogle } from '@/api/auth'
// Tanstack Query
import { useMutation } from '@tanstack/react-query'
import Link from "next/link"
import { useEffect, useState } from "react"
// 
import { useRouter } from "next/navigation"
import { googleAuthURL, googleCode } from '@/utils/google'



interface SignupFormProps {
    className?: string
}

export function SignupForm({ className, ...props }: SignupFormProps) {

    const { toast } = useToast()
    const router = useRouter()
    const [google, setGoogle] = useState<string | null>(null)

    const formSchema = z.object({
        name: z.string().min(5, { message: "Name is required" }),
        email: z.string().email({ message: "Email Address is required" }),
        phone: z.string().regex(/^[0-9]{0,12}$/, { message: "Phone number is required" }),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
        },
    })

    const signupEmail = useMutation({ mutationKey: ['signupEmail'], mutationFn: signupAuth })
    const signupGoogle = useMutation({ mutationKey: ['signupGoogle'], mutationFn: signupAuthGoogle })

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
        signupEmail.mutate(values, {
            onError: (error) => {
                router.replace('/auth/signup')
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: error.message,
                })
                form.reset()
            },
            onSuccess: (data) => {
                router.replace('/auth/login')

                if (data.status === 'success') {
                    toast({
                        title: "Verification Link Sent",
                        description: data.message,
                        action: <ToastAction altText="Close">Close</ToastAction>,
                    })
                }

                if (data.status === 'pending') {
                    toast({
                        title: "Verification Already Sent",
                        description: data.message,
                        action: <ToastAction altText="Close">Close</ToastAction>,
                    })
                }

                if (data.status === 'exist') {
                    toast({
                        title: "Account Exist",
                        description: data.message,
                        action: <ToastAction altText="Close">Close</ToastAction>,
                    })
                }



                form.reset()
            }
        })
    }


    useEffect(() => {
        const code = googleCode()
        setGoogle(code);
    }, []);

    useEffect(() => {
        if (google) {
            signupGoogle.mutate(google, {
                onError: (error) => {
                    router.replace('/auth/signup')
                    toast({
                        variant: "destructive",
                        title: "Uh oh! Something went wrong.",
                        description: error.message,
                    })
                },
                onSuccess: (data) => {
                    router.replace('/auth/login')


                    if (data.status === 'success') {
                        toast({
                            title: "Success",
                            description: data.message,
                            action: <ToastAction altText="Close">Close</ToastAction>,
                        })
                    }


                    if (data.status === 'exist') {
                        toast({
                            title: "Account Exist",
                            description: data.message,
                            action: <ToastAction altText="Close">Close</ToastAction>,
                        })
                    }


                },
            })
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [google])


    return (
        <div className={cn("grid gap-6", className)} {...props}>


            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">


                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input placeholder="Name *" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input placeholder="Email *" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input placeholder="Phone Number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />



                    <Button disabled={signupEmail.isPending} type="submit" className="w-full">
                        {signupEmail.isPending && (
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Sign In with Email
                    </Button>
                </form>
            </Form>



            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                    </span>
                </div>
            </div>
            <Link href={googleAuthURL(process.env.NEXT_PUBLIC_GOOGLE_CALLBACK_SIGNUP_URL!)} className="w-full">
                <Button variant="outline" className="w-full" type="button" disabled={signupGoogle.isPending}>
                    {signupGoogle.isPending ? (
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Icons.google className="mr-2 h-4 w-4" />
                    )}{" "}
                    Google
                </Button>
            </Link>
        </div>
    )
}