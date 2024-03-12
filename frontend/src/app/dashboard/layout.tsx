import DashboardNav from "@/components/navbar/dashboard/dashboard-nav";

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <DashboardNav />
            {children}
        </>
    )
}