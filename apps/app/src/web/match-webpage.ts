import { updateHash } from "@/lib/hash/format";
import { isTimestamp, parseTempFrag } from "@/lib/hash/temporal-frag";
import { toURL } from "@/lib/url";

/* eslint-disable @typescript-eslint/naming-convention */
export enum SupportedWebHost {
  Bilibili = "bilibili",
  Generic = "generic",
}

export const webHostDisplayName: Record<SupportedWebHost, string> = {
  [SupportedWebHost.Bilibili]: "Bilibili",
  [SupportedWebHost.Generic]: "Web",
};

export function matchHostForWeb(link: string | undefined): {
  type: SupportedWebHost;
  source: URL;
  cleanUrl: URL;
} | null {
  if (!link) return null;
  const url = toURL(link);
  if (!url) return null;
  switch (true) {
    case url.hostname.endsWith(".bilibili.com"):
    case url.hostname === "b23.tv": {
      let tempFrag = parseTempFrag(url.hash);
      const time = parseTimeFromBilibiliUrl(url);

      const cleanUrl = new URL(url);
      cleanUrl.searchParams.forEach((val, key, params) => {
        if (key === "p" && val !== "1") return;
        params.delete(key);
      });
      cleanUrl.searchParams.sort();

      const source = new URL(cleanUrl);
      if (!tempFrag && time > 0) {
        tempFrag = { start: time, end: -1 };
      }

      if (tempFrag && isTimestamp(tempFrag)) {
        source.searchParams.set("t", String(tempFrag.start));
      }
      updateHash(source, tempFrag);

      return {
        type: SupportedWebHost.Bilibili,
        source,
        cleanUrl,
      };
    }
    default:
      return {
        type: SupportedWebHost.Generic,
        source: url,
        cleanUrl: url,
      };
  }
}

function parseTimeFromBilibiliUrl(url: URL) {
  const _time = url.searchParams.get("t");
  const time = _time ? Number(_time) : NaN;
  if (Number.isNaN(time)) return NaN;
  return time;
}