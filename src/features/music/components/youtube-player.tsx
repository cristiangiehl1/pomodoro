"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseYoutubeId } from "@/features/music/logic/parse-youtube-id";
import { LOFI_PRESETS } from "@/features/music/data/lofi-presets";

export function YoutubePlayer() {
  const [videoId, setVideoId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleLoad() {
    const raw = inputRef.current?.value.trim() ?? "";
    const id = parseYoutubeId(raw);
    if (!id) {
      toast.error("URL ou ID do YouTube inválido.");
      return;
    }
    setVideoId(id);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleLoad();
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Player de Música</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* URL / ID input */}
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            placeholder="Cole uma URL do YouTube ou ID de vídeo"
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button onClick={handleLoad}>Tocar</Button>
        </div>

        {/* Lo-fi presets */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">
            Presets Lo-fi
          </p>
          <div className="flex flex-wrap gap-2">
            {LOFI_PRESETS.map((preset) => (
              <Button
                key={preset.id}
                variant={videoId === preset.youtubeId ? "default" : "outline"}
                size="sm"
                onClick={() => setVideoId(preset.youtubeId)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Embedded player — only rendered when a videoId is selected */}
        {videoId && (
          <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
            <iframe
              key={videoId}
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full rounded-md"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
