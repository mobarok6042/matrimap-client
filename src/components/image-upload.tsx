"use client";

import * as React from "react";
import Image from "next/image";
import { Loader2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { apiFetch, getUserFacingError } from "@/lib/api";
import { showErrorAlert, showSuccessAlert } from "@/lib/alerts";

interface UploadResponse {
  id: string;
  url: string;
  displayUrl: string;
  deleteUrl: string;
}

interface UploadProps {
  onUploaded?: (url: string) => void | Promise<void>;
}

export function ImageUpload({ onUploaded }: UploadProps = {}) {
  const [file, setFile] = React.useState<File | null>(null);
  const [uploaded, setUploaded] = React.useState<UploadResponse | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;

    setBusy(true);

    try {
      const body = new FormData();
      body.append("image", file);
      const res = await apiFetch<UploadResponse>("/api/upload/image", { method: "POST", body });
      setUploaded(res);
      if (onUploaded) {
        await onUploaded(res.displayUrl);
      } else {
        void showSuccessAlert("Image uploaded");
      }
    } catch (caught) {
      await showErrorAlert(
        getUserFacingError(caught, "We could not upload this image. Please try again."),
        "Image upload failed",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleUpload} className="flex flex-wrap items-end gap-3">
        <div className="grid flex-1 gap-2">
          <Label htmlFor="image">Choose an image (max 5 MB)</Label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium"
          />
        </div>
        <Button type="submit" disabled={!file || busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
          Upload
        </Button>
      </form>

      {uploaded && (
        <div className="flex items-center gap-4 rounded-lg border p-3">
          <Image
            src={uploaded.displayUrl}
            alt="Uploaded preview"
            width={64}
            height={64}
            unoptimized
            className="size-16 rounded-md object-cover"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium">Uploaded to ImgBB</p>
            <a
              href={uploaded.url}
              target="_blank"
              rel="noreferrer"
              className="block truncate text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              {uploaded.url}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
