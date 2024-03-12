import { LoginEmailVerification } from "@/api/auth"
import { routes } from "@/config/route"
import { encrypt } from "@/utils/auth"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function GET(request: Request) {

    const { url } = request
    const query = new URL(url)
    const cookie = cookies()

    const userCode = query.searchParams.get('code')
    const userEmail = query.searchParams.get('email')

    if (!userCode || !userEmail) {
        return redirect(routes.auth.login)
    }

    try {
        const authenticate = await LoginEmailVerification(userEmail, userCode)
        console.log(authenticate)
        const exp = new Date(authenticate.data.expiresIn)
        const encryptedSessionData = await encrypt(authenticate.data, exp)

        cookie.set('user', encryptedSessionData, {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            path: "/",
            expires: exp
        })

    } catch (e) {
        console.log(e)
        return redirect(routes.auth.login)
    }

    return redirect(routes.dashboard.root)

}