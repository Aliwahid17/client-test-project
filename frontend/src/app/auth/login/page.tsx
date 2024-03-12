import { Metadata } from "next"
import LoginView from "@/components/sections/auth/login-view"

export const metadata: Metadata = {
    title: "Authentication",
    description: "Authentication forms built using the components.",
}

export default async function AuthenticationPage() {
    return <LoginView />
}