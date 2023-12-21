import "@vidstack/react/player/styles/base.css";

import { MediaPlayer, MediaProvider, useMediaState } from "@vidstack/react";

import { cn } from "@/lib/utils";
import { useMediaViewStore } from "./context";
import { useViewTypeDetect } from "./fix-webm-audio";
import { AudioLayout } from "./player/layouts/audio-layout";
import { VideoLayout } from "./player/layouts/video-layout";
import { useHandleWindowMigration } from "./use-window-migration";

export function Player() {
  const playerRef = useMediaViewStore((s) => s.playerRef);

  const actualViewType = useMediaState("viewType", playerRef);

  const src = useMediaViewStore((s) => s.source?.src);

  useHandleWindowMigration(playerRef);

  const viewType = useViewTypeDetect(playerRef);

  if (!src) return null;
  return (
    <MediaPlayer
      className={cn(
        "w-full bg-slate-900 text-white font-sans overflow-hidden rounded-md ring-mod-border-focus data-[focus]:ring-2",
        actualViewType === "video" ? "aspect-video" : "h-20 aspect-auto",
      )}
      src={src}
      playsinline
      viewType={viewType}
      ref={playerRef}
    >
      <MediaProvider />
      {actualViewType === "video" ? <VideoLayout /> : <AudioLayout />}
    </MediaPlayer>
  );
}
