import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { decrypt, user } from "@/utils/auth"

interface AuthGuardProps {
    children: React.ReactNode
}

export default async function AuthGuard({ children }: AuthGuardProps) {

    const userData = await user()

    if (!userData) {
        redirect('/auth/login')
    }

    return (
        <div>
            {children}
        </div>
    )
}