import { PayloadAction } from "@reduxjs/toolkit";
import {
  applyParentFullscreen,
  enterWebFscreen,
  handleDanmakuChange,
  handleWebFscreenChange,
} from "mx-store";
import { handleAutoplayChange, handleLoopChange } from "mx-store";
import { RootState } from "mx-store";

import {
  dispatch,
  SettingButtonCls,
  SettingMenuToggleCls,
  store,
  subscribe,
  WebFscreenClass,
} from "./common";

const inputChangeEvent = new Event("change");

const hookInputButton = (
  findIn: HTMLElement,
  classname: string,
  selector: (state: RootState) => boolean,
  action: (payload: boolean) => PayloadAction<boolean>,
) => {
  const checkbox = findIn.querySelector<HTMLInputElement>(
    `.${classname} input[type="checkbox"]`,
  );
  if (checkbox) {
    checkbox.addEventListener("change", (evt) => {
      if (evt !== inputChangeEvent) {
        dispatch(action(checkbox.checked));
      }
    });
    subscribe(selector, (toggle) => {
      if (checkbox.checked !== toggle) {
        checkbox.checked = toggle;
        checkbox.dispatchEvent(inputChangeEvent);
      }
    });
  }
};

const observeClass = (
  el: HTMLElement,
  classname: string,
  onChange: (exist: boolean) => any,
) => {
  let prevClass: string[] = [];
  const modeObs = new MutationObserver(() => {
    const newClass = [...document.body.classList.values()];
    const isPrevExist = prevClass.includes(classname),
      isNowExist = newClass.includes(classname);
    if (isPrevExist !== isNowExist) {
      onChange(isNowExist);
    }
    prevClass = newClass;
  });
  modeObs.observe(el, { attributeFilter: ["class"] });
};

const hookWebFscreenState = () => {
  const ref = window.__PLAYER_REF__;
  // on web fscreen change
  observeClass(document.body, WebFscreenClass, (fullscreen) => {
    dispatch(handleWebFscreenChange(fullscreen));
  });

  // apply web fscreen state
  const button = ref.controls!.querySelector<HTMLInputElement>(
    `.${SettingButtonCls.webFullscreen}`,
  )!;

  subscribe(
    (state) => state.bilibili.webFscreen,
    (fullscreen) => {
      setWebFscreen(fullscreen, button);
    },
    true, // by default, will enter web fullscreen
  );

  // applyParentFullscreen
  subscribe(
    (state) => state.interface.fullscreen,
    (fullscreen) => {
      fullscreen && dispatch(applyParentFullscreen());
    },
  );
};

const setWebFscreen = (fullscreen: boolean, button: HTMLElement) => {
  let tries = 0;
  const interval = setInterval(() => {
    if (tries > 10) {
      console.log("failed to webfs");
      window.clearInterval(interval);
    }
    if (fullscreen !== document.body.classList.contains(WebFscreenClass)) {
      button.click();
      console.log("webfs button clicked");
    } else {
      window.clearInterval(interval);
      console.log("webfs applied, exiting");
    }
    tries++;
  }, 200);
};

export const hookBilibiliControls = () => {
  const ref = window.__PLAYER_REF__;
  hookInputButton(
    ref.settingsMenuWarp!,
    SettingMenuToggleCls.autoplay,
    (s) => s.controlled.autoplay,
    handleAutoplayChange,
  );
  hookInputButton(
    ref.settingsMenuWarp!,
    SettingMenuToggleCls.repeat,
    (s) => s.controlled.loop,
    handleLoopChange,
  );
  // danmaku toggle
  hookInputButton(
    ref.playerContainer!,
    "bilibili-player-video-danmaku-switch",
    (s) => s.bilibili.danmaku,
    handleDanmakuChange,
  );
  hookWebFscreenState();
  hookDanmakuButton();
};

const hookDanmakuButton = () => {
  const findIn = window.__PLAYER_REF__.playerContainer!;

  subscribe(
    (store) => store.bilibili.danmaku,
    (danmaku) => {
      console.log("danmaku updated", danmaku);
      let tries = 0;
      const interval = window.setInterval(() => {
        if (tries > 10) {
          window.clearInterval(interval);
          console.error("danmaku button not found");
          return;
        }
        const checkbox = findIn.querySelector<HTMLInputElement>(
          '.bilibili-player-video-danmaku-switch input[type="checkbox"]',
        );
        if (!checkbox) {
          tries++;
        } else {
          checkbox.checked = danmaku;
          checkbox.dispatchEvent(inputChangeEvent);
          console.log("danmaiku button set to", danmaku);
          window.clearInterval(interval);
        }
      }, 200);
    },
  );
};