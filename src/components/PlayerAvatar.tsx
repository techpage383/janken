import { isAvatarPreset, type AvatarPreset } from "@/lib/types";

const SIZES = {
  sm: "size-8 text-lg",
  md: "size-16 text-3xl",
  lg: "size-24 text-5xl",
} as const;

export function PlayerAvatar({
  name,
  avatar,
  size = "md",
  className = "",
}: {
  name: string;
  avatar?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const emoji = avatar && isAvatarPreset(avatar) ? avatar : null;
  const initial = name.trim()[0]?.toUpperCase() ?? "?";

  return (
    <div
      className={`rounded-full bg-gradient-to-tr from-primary to-secondary p-[2px] shrink-0 ${className}`}
    >
      <div
        className={`w-full h-full rounded-full bg-card grid place-items-center font-accent text-primary ${SIZES[size]}`}
        aria-hidden
      >
        {emoji ?? initial}
      </div>
    </div>
  );
}

export function avatarOrDefault(avatar: string | undefined | null): AvatarPreset {
  return avatar && isAvatarPreset(avatar) ? avatar : "🎮";
}
