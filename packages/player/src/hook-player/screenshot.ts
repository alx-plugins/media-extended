import { captureScreenshot } from "mx-base";
import { cancelScreenshot } from "mx-store";
import {
  PlayerStore,
  selectIsIOS,
  selectScreenshotRequested,
  subscribe,
} from "mx-store";

type onScreenshot = (...args: ScreenshotArgs) => void;
export type ScreenshotArgs = [
  buffer: ArrayBuffer,
  time: number,
  ext: "jpg" | "webp",
];

export const respondScreenshotReq = (
  media: HTMLMediaElement,
  store: PlayerStore,
  action: onScreenshot,
) =>
  subscribe(store, selectScreenshotRequested, async (req) => {
    if (req) {
      let captured = false;
      if (media instanceof HTMLVideoElement) {
        const isIOS = selectIsIOS(store.getState());
        if (isIOS === null) throw new Error("platform not determined");

        const type = !isIOS ? "image/webp" : "image/jpeg";
        const { blob, time } = await captureScreenshot(media, type),
          buffer = await blob?.arrayBuffer();
        if (buffer) {
          captured = true;
          action(buffer, time, !isIOS ? "webp" : "jpg");
        }
      } else {
        console.error("trying to capture screenshot on non-video element");
      }
      if (!captured) {
        store.dispatch(cancelScreenshot());
      }
    }
  });

export const ScreenshotMsgID = "mx-screenshot";
export type ScreenshotMsg = [
  typeof ScreenshotMsgID,
  ...Parameters<onScreenshot>,
];

export const sendScreenshot = (
  port: MessagePort,
  ...args: Parameters<onScreenshot>
) => {
  const ab = args[0];
  port.postMessage([ScreenshotMsgID, ...args], [ab]);
};
export const moniterScreenshotMsg = (
  port: MessagePort,
  action: onScreenshot,
) => {
  port.addEventListener("message", ({ data: [id, ab, time, ext] }) => {
    if (id !== ScreenshotMsgID) return;
    action(ab, time, ext);
  });
};
