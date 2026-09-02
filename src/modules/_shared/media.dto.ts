import type { MediaEntity } from "../../entities";

/** Public media reference — the only media fields a visitor ever sees. */
export interface MediaRefDto {
  id: string;
  url: string | null;
  altText: string | null;
  width: number | null;
  height: number | null;
}

export function toMediaRef(media: MediaEntity | null | undefined): MediaRefDto | null {
  if (!media) return null;
  return {
    id: media.id,
    url: media.url,
    altText: media.altText,
    width: media.width,
    height: media.height,
  };
}
