"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { YoutubePlayer } from "@/features/music/components/youtube-player";
import { SpotifyPlayer } from "@/features/music/components/spotify-player";
import { useMusicPresetsQuery } from "@/features/music/queries/use-music-presets-query";
import { useSavePresetMutation } from "@/features/music/mutations/use-save-preset-mutation";
import { useDeletePresetMutation } from "@/features/music/mutations/use-delete-preset-mutation";

export function MusicPlayer() {
  const [activeTab, setActiveTab] = useState<"youtube" | "spotify">("youtube");
  const [presetRef, setPresetRef] = useState("");
  const [presetLabel, setPresetLabel] = useState("");

  const presetsQuery = useMusicPresetsQuery();
  const saveMutation = useSavePresetMutation();
  const deleteMutation = useDeletePresetMutation();

  function handleSavePreset() {
    const ref = presetRef.trim();
    const label = presetLabel.trim();
    if (!ref || !label) {
      toast.error("Preencha o link/URI e o nome do preset.");
      return;
    }
    saveMutation.mutate(
      { kind: activeTab, ref, label },
      {
        onSuccess: () => {
          toast.success("Preset salvo!");
          setPresetRef("");
          setPresetLabel("");
        },
      }
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="youtube" onValueChange={(v) => setActiveTab(v as "youtube" | "spotify")}>
        <TabsList>
          <TabsTrigger value="youtube">YouTube</TabsTrigger>
          <TabsTrigger value="spotify">Spotify</TabsTrigger>
        </TabsList>

        <TabsContent value="youtube">
          <YoutubePlayer />
        </TabsContent>

        <TabsContent value="spotify">
          <SpotifyPlayer />
        </TabsContent>
      </Tabs>

      {/* Save preset form */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Salvar preset ({activeTab})</p>
        <div className="flex gap-2 flex-wrap">
          <Input
            placeholder={activeTab === "youtube" ? "URL ou ID do vídeo" : "Spotify URI ou link"}
            value={presetRef}
            onChange={(e) => setPresetRef(e.target.value)}
            className="flex-1 min-w-40"
          />
          <Input
            placeholder="Nome do preset"
            value={presetLabel}
            onChange={(e) => setPresetLabel(e.target.value)}
            className="flex-1 min-w-40"
          />
          <Button
            onClick={handleSavePreset}
            disabled={saveMutation.isPending}
            size="sm"
          >
            {saveMutation.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      {/* Saved presets list */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Presets salvos</p>
        {presetsQuery.isLoading && (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        )}
        {presetsQuery.isError && (
          <p className="text-sm text-destructive">Erro ao carregar presets.</p>
        )}
        {presetsQuery.data && presetsQuery.data.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum preset salvo.</p>
        )}
        {presetsQuery.data && presetsQuery.data.length > 0 && (
          <ul className="space-y-1">
            {presetsQuery.data.map((preset) => (
              <li key={preset.id} className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground uppercase text-xs w-14 shrink-0">
                  {preset.kind}
                </span>
                <span className="flex-1 truncate font-medium">{preset.label}</span>
                <span className="text-muted-foreground truncate max-w-40 text-xs hidden sm:block">
                  {preset.ref}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(preset.id)}
                >
                  Remover
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
