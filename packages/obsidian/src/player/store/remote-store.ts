import { withReduxStateSync } from "@ipc/redux-sync";
import { combineReducers } from "@reduxjs/toolkit";
import actionReducer from "@slice/action";
import biliReducer from "@slice/bilibili";
import controlsReducer from "@slice/controls";
import interfaceReducer from "@slice/interface";
import getProviderSlice from "@slice/provider";
import getYoutubeReducer from "@slice/youtube";

import { createStoreWithMsgHandler } from "./create-store";

export const createStore = (name: string) => {
  const reducer = withReduxStateSync(
    combineReducers({
      controls: controlsReducer,
      interface: interfaceReducer,
      provider: getProviderSlice().reducer,
      youtube: getYoutubeReducer().reducer,
      action: actionReducer,
      bilibili: biliReducer,
    }),
  );
  return createStoreWithMsgHandler(name, reducer);
};