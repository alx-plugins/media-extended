import { RootState } from "@player/store";
import { PayloadAction } from "@reduxjs/toolkit";
import {
  applyParentFullscreen,
  handleDanmakuChange,
  handleWebFscreenChange,
} from "@slice/bilibili";
import { handleAutoplayChange, handleLoopChange } from "@slice/controls";

import { BrowserViewAPIName } from "../view-api";
import { subscribe } from ".";
import {
  SettingButtonCls,
  SettingMenuToggleCls,
  WebFscreenClass,
} from "./const";

const inputChangeEvent = new Event("change");

const hookInputButton = (
  findIn: HTMLElement,
  classname: string,
  selector: (state: RootState) => boolean,
  action: (payload: boolean) => PayloadAction<boolean>,
) => {
  const store = window[BrowserViewAPIName].store;

  const checkbox = findIn.querySelector<HTMLInputElement>(
    `.${classname} input[type="checkbox"]`,
  );
  if (checkbox) {
    checkbox.addEventListener("change", (evt) => {
      if (evt !== inputChangeEvent) {
        store.dispatch(action(checkbox.checked));
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
  const ref = window.__PLAYER_REF__,
    store = window[BrowserViewAPIName].store;

  // on web fscreen change
  observeClass(document.body, WebFscreenClass, (fullscreen) => {
    setTimeout(() => {
      store.dispatch(handleWebFscreenChange(fullscreen));
    }, 200);
  });

  // apply web fscreen state
  const button = ref.controls!.querySelector<HTMLInputElement>(
    `.${SettingButtonCls.webFullscreen}`,
  )!;
  subscribe(
    (state) => state.bilibili.webFscreen,
    (fullscreen) => {
      let active = button.classList.contains("closed");
      if (fullscreen !== active) {
        button.click();
      }
    },
  );

  // applyParentFullscreen
  subscribe(
    (state) => state.controls.fullscreen,
    (fullscreen) => {
      fullscreen && store.dispatch(applyParentFullscreen());
    },
  );

  // enter web fullscreen on start
  button.click();
};

export const hookBilibiliControls = () => {
  const ref = window.__PLAYER_REF__;
  hookInputButton(
    ref.settingsMenuWarp!,
    SettingMenuToggleCls.autoplay,
    (s) => s.controls.autoplay,
    handleAutoplayChange,
  );
  hookInputButton(
    ref.settingsMenuWarp!,
    SettingMenuToggleCls.repeat,
    (s) => s.controls.loop,
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