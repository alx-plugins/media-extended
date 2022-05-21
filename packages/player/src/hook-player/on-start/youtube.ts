import { YoutubeMedia } from "@utils/media";
import { PlayerStore } from "mx-store";

import onStart from "./general";

export const onStartYtb = (media: YoutubeMedia, store: PlayerStore) => {
  onStart(media, store);
  // const player = media.instance;
};