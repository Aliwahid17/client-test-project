import { user } from "@/utils/auth";
import { UserNav } from "./user-nav";

export default async function DashboardNav() {

    const userData = await user()

    return (
        <div className="border-b">
            <div className="flex h-16 items-center px-4">
                <div className="ml-auto flex items-center space-x-4">
                    <UserNav user={userData} />
                </div>
            </div>
        </div>
    )
}