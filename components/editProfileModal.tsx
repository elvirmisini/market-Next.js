"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { getUser, updateUser } from "@/db/utils";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { User } from "@/db/schema";
import { getSession } from "next-auth/react";

/* 
  This component is responsible for rendering the edit profile modal. It is displayed when the user
  edits their profile.
*/
export default function EditProfileModal({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const session = await getSession();
      if (session) {
        const fetchedUser = await getUser(session.user.name);
        setUser(fetchedUser);
        setBio(fetchedUser.bio || "");
        setProfilePic(fetchedUser.profilePic || "");
        setShippingAddress(fetchedUser.shippingAddress || "");
      }
    };
    fetchUser();
  }, []);

  const onSubmit = async () => {
    setLoading(true);
    try {
      if (user) {
        const updatedUser: User = {
          ...user,
          bio,
          profilePic,
          shippingAddress,
        };
        await updateUser(updatedUser);
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="profilePic" className="text-right">
              Profile Picture
            </Label>
            <Input
              id="profilePic"
              value={profilePic}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setProfilePic(e.target.value);
              }}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bio" className="text-right">
              Bio
            </Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setBio(e.target.value);
              }}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bio" className="text-right">
              Shipping address
            </Label>
            <Input
              id="shippingAddress"
              value={shippingAddress}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setShippingAddress(e.target.value);
              }}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bio" className="text-right">
              Password
            </Label>
            <Input
              id="shippingAddress"
              value={password}
              onChange={(e: any) => {
                setPassword(e.target.value);
              }}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={loading}
            onClick={onSubmit}
          >
            {loading ? "Saving..." : success ? "Saved!" : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
