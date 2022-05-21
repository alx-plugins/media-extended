import { parseTF } from "mx-lib";
import type { ParsedQuery } from "query-string";

/** Player Properties that can be controlled by hash */
type PlayerProperties = "loop" | "muted" | "autoplay" | "controls";
const hashOpts = new Map<string, PlayerProperties>([
  ["loop", "loop"],
  ["mute", "muted"],
  ["play", "autoplay"],
  ["controls", "controls"],
]);

export const is = (
  hashQuery: ParsedQuery<string>,
  prop: PlayerProperties,
): boolean => {
  if (!hashQuery) return false;
  for (const [queryKey, playerProp] of hashOpts) {
    if (prop === playerProp && hashQuery[queryKey] === null) return true;
  }
  return false;
};

export type Fragment = [start: number, end: number];
export const getFragFromHash = (hash: string): Fragment | null => {
  const timeSpan = parseTF(hash);
  return timeSpan ? [timeSpan.start, timeSpan.end] : null;
};