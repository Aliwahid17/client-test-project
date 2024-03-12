export type UserTypes = {
    accessToken: string
    refreshToken: string
    expiresIn: string
    details: UserDetailsTypes
    iat: number
    exp: number
}

export type UserDetailsTypes = {
    _id: number,
    name: string
    email: string
    phone_number: string
    type: string
    created_at: string
}