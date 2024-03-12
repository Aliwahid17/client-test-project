import { routes } from "@/config/route";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


export default async function Home() {
  const cookie = cookies()
  if (cookie.get('user')) {
    return redirect(routes.dashboard.root)
  }
  return redirect(routes.auth.login)
}
