import { user } from "@/utils/auth"

export default async function DashboardView() {
    const userDetails = await user()
    return (
        <div className="flex w-full h-full  justify-center items-center">
            <pre className="p-4 rounded-md overflow-auto">
                <code>
                    {JSON.stringify(userDetails, null, 7)}
                </code>
            </pre>
        </div>
    )
}