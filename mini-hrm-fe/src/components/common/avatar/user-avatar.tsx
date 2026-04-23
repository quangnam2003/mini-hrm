import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { getAvatarColor, getInitials } from "@/utils/avatar";

type UserAvatarProps = {
  name: string;
  avatar?: string;
  id?: string | number;
  shortName?: string;
  className?: string;
};

export function UserAvatar({
  name,
  avatar,
  id,
  shortName,
  className,
}: UserAvatarProps) {
  return (
    <Avatar
      className={cn(
        "w-8 h-8 border-2 border-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] ring-1 ring-line/30 cursor-pointer transition-all hover:ring-primary/20 hover:scale-105 active:scale-95 after:hidden",
        className
      )}
    >
      {avatar ? (
        <AvatarImage src={avatar} alt={name} />
      ) : (
        <AvatarFallback
          className={cn(
            "text-white flex items-center justify-center",
            id ? getAvatarColor(id) : "bg-gray-400"
          )}
        >
          <Typography variant="label-xs" className="text-white">
            {shortName || getInitials(name)}
          </Typography>
        </AvatarFallback>
      )}
    </Avatar>
  );
}