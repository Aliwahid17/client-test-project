import { routes } from "@/config/route"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function GET(request: Request) {

    const cookie = cookies()

    try {
        cookie.delete('user')
    } catch (e) {
        return redirect(routes.dashboard.root)
    }

    return redirect(routes.auth.login)

}