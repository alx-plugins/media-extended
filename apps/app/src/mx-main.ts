import "@vidstack/react/player/styles/base.css";
import "./style.css";
import "./icons";

import type { PaneType, SplitDirection } from "obsidian";
import { Notice, Plugin } from "obsidian";
import { initLogin } from "./login";
import { handleMediaNote } from "./media-note";
import { LeafOpener } from "./media-note/leaf-open";
import {
  onExternalLinkClick,
  onInternalLinkClick,
} from "./media-note/link-click";
import { MediaNoteIndex } from "./media-note/note-index";
import { parseUrl } from "./media-note/note-index/url-info";
import { MediaFileEmbed } from "./media-view/file-embed";
import { AudioFileView, VideoFileView } from "./media-view/file-view";
import { MediaEmbedView } from "./media-view/iframe-view";
import registerMediaMenu from "./media-view/menu";
import { AudioUrlView, VideoUrlView } from "./media-view/url-view";
import {
  MEDIA_FILE_VIEW_TYPE,
  MEDIA_WEBPAGE_VIEW_TYPE,
  MEDIA_EMBED_VIEW_TYPE,
  MEDIA_URL_VIEW_TYPE,
} from "./media-view/view-type";
import { MediaWebpageView } from "./media-view/webpage-view";
import injectMediaEmbed from "./patch/embed";
import patchEditorClick from "./patch/link.editor";
import patchInlineUrl from "./patch/link.inline-field";
import fixLinkLabel from "./patch/link.label-fix";
import patchPreviewClick from "./patch/link.preview";
import { MediaFileExtensions } from "./patch/media-type";
import injectMediaView from "./patch/view";
import { createSettingsStore } from "./settings";
import { MxSettingTabs } from "./settings/tab";
import { initSwitcher } from "./switcher";
import { BilibiliRequestHacker } from "./web/bili-req";
import { modifySession } from "./web/session";
import "./login/modal";

export default class MxPlugin extends Plugin {
  settings = createSettingsStore(this);

  api = {
    openUrl: async (
      url: string,
      newLeaf?: PaneType,
      direction?: SplitDirection,
    ) => {
      const urlInfo = parseUrl(url);
      if (!urlInfo) {
        new Notice("Provider not yet supported");
        return;
      }
      await this.leafOpener.openMedia(urlInfo, newLeaf as "split", direction);
    },
  };

  async onload() {
    this.addSettingTab(new MxSettingTabs(this));
    await this.loadSettings();
    this.initLogin();
    this.loadPatches();
    this.registerMediaMenu();
    this.handleMediaNote();
    await this.modifySession();
    initSwitcher(this);
  }

  async loadSettings() {
    await this.settings.getState().load();
  }

  mediaNote = this.addChild(new MediaNoteIndex(this.app));
  biliReq = this.addChild(new BilibiliRequestHacker(this));
  leafOpener = this.addChild(new LeafOpener(this));
  handleMediaNote = handleMediaNote;
  injectMediaEmbed = injectMediaEmbed;
  injectMediaView = injectMediaView;
  registerMediaMenu = registerMediaMenu;
  fixLinkLabel = fixLinkLabel;
  patchEditorClick = patchEditorClick;
  patchPreviewClick = patchPreviewClick;
  patchInlineUrl = patchInlineUrl;
  modifySession = modifySession;
  onExternalLinkClick = onExternalLinkClick.bind(this);
  onInternalLinkClick = onInternalLinkClick.bind(this);
  initLogin = initLogin;

  private loadPatches() {
    this.injectMediaView(
      MEDIA_FILE_VIEW_TYPE.audio,
      (leaf) => new AudioFileView(leaf, this),
      MediaFileExtensions.audio,
    );
    this.injectMediaView(
      MEDIA_FILE_VIEW_TYPE.video,
      (leaf) => new VideoFileView(leaf, this),
      MediaFileExtensions.video,
    );
    this.injectMediaEmbed(
      (info, file, subpath) => new MediaFileEmbed(info, file, subpath, this),
    );
    this.registerView(
      MEDIA_WEBPAGE_VIEW_TYPE,
      (leaf) => new MediaWebpageView(leaf, this),
    );
    this.registerView(
      MEDIA_EMBED_VIEW_TYPE,
      (leaf) => new MediaEmbedView(leaf, this),
    );
    this.registerView(
      MEDIA_URL_VIEW_TYPE.video,
      (leaf) => new VideoUrlView(leaf, this),
    );
    this.registerView(
      MEDIA_URL_VIEW_TYPE.audio,
      (leaf) => new AudioUrlView(leaf, this),
    );

    this.patchEditorClick({
      onExternalLinkClick: this.onExternalLinkClick,
      onInternalLinkClick: this.onInternalLinkClick,
    });
    this.patchPreviewClick({
      onExternalLinkClick: this.onExternalLinkClick,
      onInternalLinkClick: this.onInternalLinkClick,
    });
    this.fixLinkLabel();
    this.patchInlineUrl();
  }
}
