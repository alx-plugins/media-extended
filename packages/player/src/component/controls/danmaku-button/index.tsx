import { ButtonUnstyledProps } from "@mui/base";
import { useAppDispatch, useAppSelector } from "@store-hooks";
import { toggleDanmaku } from "mx-store";
import { PlayerType } from "mx-store";
import React, { useCallback } from "react";

import Toggle from "../basic/toggle";
import DanmakuOff from "./off.svg";
import DanmakuOn from "./on.svg";
export const DanmakuButton = React.forwardRef<
  HTMLButtonElement,
  ButtonUnstyledProps
>(
  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  function DanmakuButton(props, ref) {
    const danmakuOn = useAppSelector((state) => state.bilibili.danmaku);
    const dispatch = useAppDispatch();

    const handleClick = useCallback(
      () => dispatch(toggleDanmaku()),
      [dispatch],
    );

    const isBili = useAppSelector(
      (state) => state.source.type === PlayerType.bilibili,
    );
    return isBili ? (
      <Toggle
        {...props}
        ref={ref}
        aria-label={danmakuOn ? "Disable Danmaku" : "Enable Danmaku"}
        selected={danmakuOn}
        onClick={handleClick}
        selectedIcon={<DanmakuOn />}
        unselectedIcon={<DanmakuOff />}
      />
    ) : null;
  },
);