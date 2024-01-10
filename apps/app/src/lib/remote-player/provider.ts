/* eslint-disable @typescript-eslint/naming-convention */
import { Maverick } from "@vidstack/react";
import type {
  MediaProviderAdapter,
  MediaSetupContext,
  MediaSrc,
} from "@vidstack/react";
import type { WebviewTag } from "electron";
import init from "inline:./scripts/initialize";

import { isString } from "maverick.js/std";
import { GET_PORT_TIMEOUT, PORT_MESSAGE } from "@/lib/remote-player/const";
import { matchHost, SupportedWebHost } from "@/web/match";
import { plugins } from "@/web/plugin";
import { titleParser } from "@/web/title";
import { MessageController, TimeoutError } from "../message";
import { HTMLMediaEvents } from "./html–media-events";
import { evalInWebview } from "./lib/inline-eval";
import type { MsgCtrlLocal } from "./type";

const { createScope, onDispose } = Maverick;

interface WebviewMediaSrc extends MediaSrc<string> {
  host: SupportedWebHost;
}

export class WebiviewMediaProvider implements MediaProviderAdapter {
  readonly scope = createScope();
  protected $$PROVIDER_TYPE = "WEBVIEW";

  protected _currentSrc: WebviewMediaSrc | null = null;

  protected _port = new MessageController() as MsgCtrlLocal;

  constructor(protected _webview: WebviewTag) {}

  protected _ctx!: MediaSetupContext;

  setup(ctx: MediaSetupContext) {
    this._ctx = ctx;
    onDispose(() => {
      // Dispose of media.
      this._webview.src = "";
      // this._webview.reload();
    });
    if (this.type === "webview") ctx.delegate._notify("provider-setup", this);
    this.registerTitleChange();
    onDispose(() => {
      this._webview.removeEventListener("dom-ready", this.onDomReady);
    });
  }

  get type() {
    return "webview";
  }

  get webview() {
    return this._webview;
  }
  get media() {
    return this._port;
  }

  get currentSrc() {
    return this._currentSrc;
  }
  get currentWebHost(): SupportedWebHost {
    return this._currentSrc?.host ?? SupportedWebHost.Generic;
  }

  setPlaybackRate(rate: number) {
    this._port.methods.setPlaybackRate(rate);
  }

  async play() {
    this._port.methods.play();
  }

  async pause() {
    this._port.methods.pause();
  }

  setMuted(muted: boolean) {
    this._port.methods.setMuted(muted);
  }

  setVolume(volume: number) {
    this._port.methods.setVolume(volume);
  }

  setCurrentTime(time: number) {
    this._port.methods.setCurrentTime(time);
  }

  private get _notify() {
    return this._ctx.delegate._notify;
  }

  private async _updateTitle(event: string | Event, title?: string) {
    const _evt = (event = typeof event === "string" ? new Event(event) : event);
    const originalTitle =
      title ?? (await this._webview.executeJavaScript("document.title"));
    const finalTitle = titleParser[this.currentWebHost](originalTitle);
    const current = this._ctx.$state.title();
    if (finalTitle === current) return;
    this._notify("title-change", finalTitle, _evt);
  }

  loadPlugin(host: SupportedWebHost) {
    return new Promise<void>((resolve, reject) => {
      const webview = this._webview as WebviewTag & {
        /**
         * @see https://developer.chrome.com/docs/apps/reference/webviewTag?hl=zh-cn#type-ContentWindow
         */
        contentWindow: Window;
      };
      // #region -- logic to handle plugin load
      const unsub = this.media.onReady(
        async () => {
          console.log("PORT READY");
          window.clearTimeout(timeoutId);
          await this.media.methods.loadPlugin(plugins[host]);
          resolve();
        },
        { once: true },
      );
      const timeoutId = setTimeout(() => {
        unsub();
        reject(new TimeoutError(GET_PORT_TIMEOUT));
      }, GET_PORT_TIMEOUT);
      // #endregion

      const { port1: portLocal, port2: portRemote } = new MessageChannel();
      this._port.load(portLocal);
      webview.contentWindow.postMessage(PORT_MESSAGE, "*", [portRemote]);
    });
  }

  onDomReady = async (evt: Event) => {
    const webview = this._webview;
    new HTMLMediaEvents(this, this._ctx);
    this._updateTitle(evt);
    // prepare to recieve port, handle plugin load
    await evalInWebview(init, webview);
    await this.loadPlugin(this.currentWebHost);
  };

  registerTitleChange() {
    const webview = this._webview;
    onDispose(
      this._port.on("titlechange", ({ payload: { title } }) => {
        this._updateTitle("titlechange", title);
      }),
    );
    const onDidNavigate = (evt: Event) => {
      this._updateTitle(evt);
    };
    webview.addEventListener("did-navigate", onDidNavigate);
    onDispose(() => {
      webview.removeEventListener("did-navigate", onDidNavigate);
    });
  }

  untilPluginReady() {
    const webview = this._webview;
    webview.removeEventListener("dom-ready", this.onDomReady);
    return new Promise<void>((resolve, reject) => {
      const onDomReady = (evt: Event) => {
        this.onDomReady(evt).then(resolve).catch(reject);
        webview.removeEventListener("dom-ready", onDomReady);
        webview.addEventListener("dom-ready", this.onDomReady);
      };
      webview.addEventListener("dom-ready", onDomReady);
    });
  }

  async loadSource({ src: _src, type }: MediaSrc) {
    if (!isString(_src)) {
      throw new Error("Webview provider only supports string src.");
    }
    const src = _src.replace(/^webview::/, "");
    const webview = this._webview;
    this._currentSrc = {
      src,
      type,
      host: matchHost(src)?.type ?? SupportedWebHost.Generic,
    };

    const url = src ? new URL(src) : null;
    const prevUrl = webview.src ? new URL(webview.src) : null;
    if (!url) {
      webview.src = "";
      return;
    }
    if (
      !(url.origin === prevUrl?.origin && url.pathname === prevUrl?.pathname)
    ) {
      webview.src = url.href;
      await this.untilPluginReady();
    }
    // const frag = parseTempFrag(url.hash),
    //   prevFrag = parseTempFrag(prevUrl?.hash);
    // if (!isTempFragEqual(frag, prevFrag)) {
    //   await this.media.methods.setTempFrag(frag);
    //   if (frag && isTimestamp(frag)) {
    //     this.media.methods.setCurrentTime(frag.start);
    //   }
    // }
    console.log("vidstack player loaded");
  }
}