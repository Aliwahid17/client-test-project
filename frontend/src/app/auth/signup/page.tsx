import SignupView from "@/components/sections/auth/sign-view"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Authentication",
    description: "Authentication forms built using the components.",
}

export default async function AuthenticationPage() {
    return <SignupView />
}