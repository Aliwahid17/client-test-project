'use client';
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { routes } from "@/config/route";
import { useRouter } from "next/navigation";

export default function LogoutBtn() {

    const router = useRouter()

    return (
        <DropdownMenuItem onClick={() => {
            router.push(routes.api.auth.logout)
        }}>
            Log out
            {/* <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut> */}
        </DropdownMenuItem>
    )
}