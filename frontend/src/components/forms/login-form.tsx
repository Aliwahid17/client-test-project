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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

// Zod
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
// Api
import { LoginAuth } from '@/api/auth'
// Tanstack Query
import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from "react"
import Link from "next/link"
import { googleAuthURL, googleCode } from "@/utils/google"

interface LoginFormProps {
    className?: string
    googleAuth: (code: string) => Promise<'error' | undefined>
}

export function LoginForm({ className, googleAuth, ...props }: LoginFormProps) {


    const [google, setGoogle] = useState<string | null>(null)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState({
        open: false,
        title: "",
        description: ""
    })

    const formSchema = z.object({
        email: z.string().email({ message: "Email Address is required" }),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    })

    const loginEmail = useMutation({ mutationKey: ['loginEmail'], mutationFn: LoginAuth })

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {

        loginEmail.mutate(values, {
            onError: (error) => {

                setIsDialogOpen({
                    open: true,
                    title: "Uh oh! Something went wrong.",
                    description: error.message
                })
                form.reset()
            },
            onSuccess: (data) => {

                if (data.status === 'success') {
                    setIsDialogOpen({
                        open: true,
                        title: "Login Link Sent",
                        description: data.message
                    })
                }

                if (data.status === 'pending') {
                    setIsDialogOpen({
                        open: true,
                        title: "Login Link Already Sent",
                        description: data.message
                    })
                }

                if (data.status === 'wrong') {
                    setIsDialogOpen({
                        open: true,
                        title: "Check Your Email",
                        description: data.message
                    })
                }

                form.reset()
            },
        })

    }

    useEffect(() => {
        const code = googleCode()
        setGoogle(code);
        if (!code) return
        setGoogleLoading(true)
    }, []);

    useEffect(() => {

        const auth = async (google: string) => {
            const error = await googleAuth(google)

            if (error) {
                setGoogleLoading(false)
                setIsDialogOpen({
                    open: true,
                    title: "Uh oh! Something went wrong.",
                    description: "Please try again."
                })
            }

        }


        if (google) auth(google)

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [google])

    return (
        <>
            <div className={cn("grid gap-6", className)} {...props}>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input placeholder="Email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button disabled={loginEmail.isPending} type="submit" className="w-full">
                            {loginEmail.isPending && (
                                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Log In with Email
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
                {/* <Link href={'/'} className="w-full"> */}
                <Link href={googleAuthURL(process.env.NEXT_PUBLIC_GOOGLE_CALLBACK_LOGIN_URL!)} className="w-full">
                    {/* <Button variant="outline" className="w-full" type="button" > */}
                    <Button variant="outline" className="w-full" type="button" disabled={googleLoading}>
                        {googleLoading ? (
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Icons.google className="mr-2 h-4 w-4" />
                        )}{" "}
                        Google
                    </Button>
                </Link>
            </div>
            <Dialog open={isDialogOpen.open}>
                <DialogContent onClick={() => {
                    setIsDialogOpen({
                        open: false,
                        title: "",
                        description: ""
                    })
                }} >
                    <DialogHeader>
                        <DialogTitle>{isDialogOpen.title}</DialogTitle>
                        <DialogDescription>
                            {isDialogOpen.description}
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </>
    )
}
