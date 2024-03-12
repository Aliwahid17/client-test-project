import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { UserTypes } from '../types/user'

const secretKey = new TextEncoder().encode(process.env.NEXT_PUBLIC_SECRET_KEY)

export async function encrypt(payload: any, exp: string | number | Date) {
    return await new SignJWT(payload)
        .setProtectedHeader({
            alg: 'HS256',
        })
        .setIssuedAt()
        .setExpirationTime(exp)
        .sign(secretKey)
}

export async function decrypt(input: string): Promise<any> {
    const { payload } = await jwtVerify(input, secretKey, {
        algorithms: ['HS256'],
    })

    return payload
}

export async function user() {
    const cookie = cookies()
    const userCookieValue = cookie.get('user')?.value

    const decryptedSessionData = userCookieValue ? await decrypt(userCookieValue) : undefined

    return decryptedSessionData as UserTypes

}