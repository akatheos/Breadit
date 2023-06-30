"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "./ui/DropdownMenu";
import { User } from "@prisma/client";
import { FC } from "react";
import UserAvatar from "./UserAvatar";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface UserMenuProps {
  user: Pick<User, "username" | "image" | "email">;
}

const UserMenu: FC<UserMenuProps> = ({ user }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full">
        <UserAvatar
          className="h-8 w-8"
          user={{ username: user.username || null, image: user.image || null }}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white" align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.username && <p className="font-medium">{user.username}</p>}
            {user.email && (
              <p className="w-[200px] truncate text-sm text-zinc-500">
                {user.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/">Feed</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/r/create">Create community</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            signOut({
              callbackUrl: `${window.location.origin}/sign-in`,
            });
          }}
          className="cursor-pointer"
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
