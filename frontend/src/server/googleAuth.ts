'use server'

import { LoginGmailVerification } from "@/api/auth"
import { cookies } from "next/headers"
import { encrypt } from "@/utils/auth"
import { redirect } from "next/navigation"

export async function GoogleAuth(code: string) {

    const cookie = cookies()
    const [login, error] = await LoginGmailVerification(code)

    if (login) {

        const exp = new Date(login.data.expiresIn)
        const encryptedSessionData = await encrypt(login.data, exp)

        cookie.set('user', encryptedSessionData, {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            path: "/",
            expires: exp
        })

        return redirect("/dashboard")

    }

    if (error) return "error"

}