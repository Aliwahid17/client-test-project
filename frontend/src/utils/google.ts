export const googleAuthURL = (redirect_uri: string) => {
    const params = new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        redirect_uri: redirect_uri,
        response_type: "code",
        scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid"
    });

    const googleRedirectURL = new URL(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`).toString();
    return googleRedirectURL;
};

export const googleCode = () => {
    const url = new URLSearchParams(window.location.search)
    const code = url.get('code')
    return code
}