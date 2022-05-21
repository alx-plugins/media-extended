import { Media } from "mx-base";
import { Frag } from "mx-base";
const { onFragUpdate } = Frag;
import { lockPlayPauseEvent, unlockPlayPauseEvent } from "mx-store";
import {
  getSubscribeFunc,
  PlayerStore,
  selectFrag,
  selectPaused,
  selectSpeed,
  selectVolumeMute,
  subscribe,
} from "mx-store";

const hookState = (media: Media, store: PlayerStore) => {
  const subscribe = getSubscribeFunc(store);

  const toUnload: (() => void)[] = [
    // useApplyTimeFragment
    subscribe(selectFrag, (newFrag) => onFragUpdate(newFrag, media)),
    // useApplyPlaybackRate
    subscribe(selectSpeed, (rate) => {
      media.playbackRate !== rate && (media.playbackRate = rate);
    }),
    // useApplyVolume
    subscribe(selectVolumeMute, ([muted, volume]) => {
      media.volume !== volume && (media.volume = volume);
      media.muted !== muted && (media.muted = muted);
    }),
    // useApplyUserSeek
    subscribe(
      (state) => state.userSeek,
      (seek, prevSeek) => {
        let params:
          | [time: number, options: { allowSeekAhead: boolean }]
          | null = null;
        // https://developers.google.com/youtube/iframe_api_reference#seekTo
        if (seek) {
          params = [seek.currentTime, { allowSeekAhead: false }];
        } else if (prevSeek) {
          // seek ends
          params = [prevSeek.currentTime, { allowSeekAhead: true }];
        }
        if (params) {
          media.seekTo(...params);
        }
      },
    ),
  ];

  return () => toUnload.forEach((unload) => unload());
};
export default hookState;

/**
 * @param tryApplyPause return function if need to apply pause
 */
export const getApplyPauseHandler = (
  store: PlayerStore,
  tryApplyPause: (paused: boolean) => (() => void | Promise<void>) | null,
) =>
  subscribe(store, selectPaused, async (paused) => {
    const apply = tryApplyPause(paused);
    if (apply) {
      store.dispatch(lockPlayPauseEvent());
      await apply();
      setTimeout(() => {
        store.dispatch(unlockPlayPauseEvent());
      }, 50);
    }
  });