import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DialogDemo() {
  const openDialog = () => {
    const dialog = document.getElementById('modal');
    if (dialog) {
      dialog.setAttribute('open', 'true')
    }
  };

  const closeDialog = () => {
    const dialog = document.getElementById('modal');
    if (dialog) {
      dialog.removeAttribute('open')
    }
  }
  return (
    <>
    <Dialog>
      <DialogTrigger><Button>Invite</Button></DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Invite user</DialogTitle>
      <DialogDescription>
        Invite a user to your organization
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="username" className="text-right">
          Email
        </Label>
        <Input
          id="email"
          defaultValue="user@gmail.com"
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="username" className="text-right">
          Role
        </Label>
        <Select name="role"> 
          <SelectContent>
            <SelectItem value="admin">Administrator account</SelectItem>
            <SelectItem value="manager">Manage all integrations</SelectItem>
            <SelectItem value="monitor">Monitor all integrations</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    <DialogFooter>
      <Button type="submit">Invite user</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
</>
  )
}
