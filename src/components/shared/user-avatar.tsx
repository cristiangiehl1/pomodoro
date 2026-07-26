import { cn } from "@/lib/utils";

interface UserAvatarProps {
  image?: string | null;
  name?: string | null;
  className?: string;
}

/** Avatar do usuário: foto quando houver, senão a inicial do nome. */
export function UserAvatar({ image, name, className }: UserAvatarProps) {
  const initial = (name?.trim().charAt(0) || "?").toUpperCase();

  return (
    <span
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-sm font-medium text-secondary-foreground",
        className,
      )}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="h-full w-full object-cover" />
      ) : (
        initial
      )}
    </span>
  );
}
