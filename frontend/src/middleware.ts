import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/utils/auth'

export async function middleware(request: NextRequest) {

    const currentUser = request.cookies.get('user')?.value
    const pathname = new URL(request.url).pathname

    const decryptedSessionData = currentUser ? await decrypt(currentUser) : undefined
    const userAccessToken = decryptedSessionData?.accessToken


    if (userAccessToken && pathname.startsWith('/auth')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (!userAccessToken && pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

}

export const config = {
    matcher: ['/dashboard/:path*', '/auth/:path*'],
}