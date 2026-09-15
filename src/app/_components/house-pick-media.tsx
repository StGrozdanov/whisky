"use client";

import Image from "next/image";
import { useState } from "react";
import { Icon } from "@/components/icon";
import { youtubeVideoId } from "@/utils/youtube-video-id";

type HousePickMediaProps = {
  name: string;
  photoUrl: string;
  youtubeUrl: string | undefined;
};

export function HousePickMedia({
  name,
  photoUrl,
  youtubeUrl,
}: HousePickMediaProps) {
  const videoId = youtubeVideoId(youtubeUrl);
  const [playing, setPlaying] = useState(false);

  if (playing && videoId) {
    return (
      <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-xl bg-surface-container-lowest shadow-xl">
        <iframe
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title={`${name} — дегустация`}
        />
      </div>
    );
  }

  return (
    <div className="relative flex aspect-[4/5] w-full max-w-sm items-center justify-center overflow-hidden rounded-xl bg-surface-container-lowest shadow-xl">
      <Image
        alt={name}
        className="h-4/5 w-auto object-contain"
        height={480}
        src={photoUrl}
        unoptimized
        width={320}
      />
      {videoId ? (
        <>
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-surface-container-lowest via-transparent to-transparent opacity-80" />
          <button
            aria-label="Пусни видео"
            className="absolute inset-0 flex cursor-pointer items-center justify-center"
            onClick={() => setPlaying(true)}
            type="button"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 text-on-primary shadow-[0_0_30px_rgba(217,119,6,0.6)] transition-transform hover:scale-110">
              <Icon className="ml-1" fontSize={32} name="play_arrow" />
            </span>
          </button>
        </>
      ) : null}
    </div>
  );
}
