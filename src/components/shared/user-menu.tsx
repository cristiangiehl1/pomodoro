"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu } from "@base-ui/react/menu";
import { useSession, signOut } from "@/lib/auth-client";
import { UserAvatar } from "@/components/shared/user-avatar";

const MENU_LINKS = [{ href: "/profile", label: "Perfil" }];

const itemClass =
  "flex cursor-pointer items-center rounded-md px-3 py-2 text-sm outline-none select-none data-highlighted:bg-muted";

export function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user;

  if (isPending || !user) {
    return <UserAvatar name={user?.name} image={user?.image} />;
  }

  const displayName = user.name || user.email || "Conta";

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <Menu.Root>
      <Menu.Trigger className="flex cursor-pointer items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <UserAvatar name={user.name} image={user.image} />
        <span className="hidden max-w-32 truncate text-sm font-medium sm:block">
          {displayName}
        </span>
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner sideOffset={8} align="end" className="z-50">
          <Menu.Popup className="min-w-56 origin-top-right rounded-xl border border-border/70 bg-popover p-1 text-popover-foreground shadow-soft outline-none">
            <div className="px-3 py-2">
              <p className="truncate text-sm font-medium">{displayName}</p>
              {user.email && (
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              )}
            </div>

            <div className="my-1 h-px bg-border" />

            {MENU_LINKS.map((link) => (
              <Menu.Item
                key={link.href}
                className={itemClass}
                render={<Link href={link.href} />}
              >
                {link.label}
              </Menu.Item>
            ))}

            <div className="my-1 h-px bg-border" />

            <Menu.Item
              className={`${itemClass} text-destructive`}
              onClick={handleSignOut}
            >
              Sair
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
