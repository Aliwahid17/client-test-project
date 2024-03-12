import { Metadata } from "next"
import DashboardView from "@/components/sections/dashboard/dashboard-view"

export const metadata: Metadata = {
    title: "Dashboard",
    description: "Example dashboard app built using the components.",
}

export default function DashboardPage() {
    return <DashboardView />
}