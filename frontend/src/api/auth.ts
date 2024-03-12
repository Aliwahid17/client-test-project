export const signupAuth = async (user: { email: string, name: string, phone: string }) => {

    const formData = new FormData()
    for (const key in user) {
        formData.append(key, user[key as keyof typeof user].toLocaleLowerCase())
    }


    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/signup`, {
        method: "POST",
        body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    return data;
}

export const signupAuthGoogle = async (code: string) => {

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/google/signup`, {
        method: "POST",
        body: JSON.stringify({ code }),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
}

export const LoginAuth = async (useremail: { email: string }) => {

    const formData = new FormData()
    formData.append('email', useremail.email.toLocaleLowerCase())

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}auth/login`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json()

    return data;
}

export const LoginEmailVerification = async (email: string, token: string) => {

    console.log(email , token)
    const response = await fetch(`${"http://backend:8000/api/v1/"}auth/login/verification`, {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    
    const data = await response.json()
    console.log(data)

    if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
}

export const LoginGmailVerification = async (code: string) => {

    try {

        const res = await fetch(`${"http://backend:8000/api/v1/"}auth/google/login`, {
            method: "POST",
            body: JSON.stringify({ code }),
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await res.json()
        if (!res.ok) {
            throw new Error(data.message)
        }
        return [data, undefined]

    } catch (e) {
        return [undefined, e]
    }

}
