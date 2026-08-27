"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Camera, CheckCircle2, Loader2, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { qrCheckIn } from "@/lib/api/attendance";
import { ApiClientError } from "@/lib/api/client";
import type { FrontDeskCheckIn } from "@/lib/types/attendance";

type BarcodeDetectorLike = {
  detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue: string }>>;
};

function getBarcodeDetector(): BarcodeDetectorLike | null {
  if (typeof window === "undefined") return null;
  const Detector = (
    window as Window & {
      BarcodeDetector?: new (options?: { formats: string[] }) => BarcodeDetectorLike;
    }
  ).BarcodeDetector;
  if (!Detector) return null;
  return new Detector({ formats: ["qr_code"] });
}

function normalizeToken(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith("gravity-checkin:")) return trimmed;
  return `gravity-checkin:${trimmed}`;
}

export function QrScannerView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanLockRef = useRef(false);

  const [cameraSupported, setCameraSupported] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkInError, setCheckInError] = useState<string | null>(null);
  const [lastCheckIn, setLastCheckIn] = useState<FrontDeskCheckIn | null>(null);

  const processToken = useCallback(async (rawValue: string) => {
    if (scanLockRef.current) return;
    scanLockRef.current = true;
    setIsSubmitting(true);
    setCheckInError(null);
    setLastCheckIn(null);

    try {
      const entry = await qrCheckIn({ token: normalizeToken(rawValue) });
      setLastCheckIn(entry);
    } catch (err) {
      setCheckInError(
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "QR check-in failed.",
      );
    } finally {
      setIsSubmitting(false);
      window.setTimeout(() => {
        scanLockRef.current = false;
      }, 1500);
    }
  }, []);

  useEffect(() => {
    const detector = getBarcodeDetector();
    if (!detector || !navigator.mediaDevices?.getUserMedia) {
      return;
    }

    let cancelled = false;
    let frameId = 0;

    void (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        setCameraSupported(true);

        const scan = async () => {
          if (cancelled || !videoRef.current || scanLockRef.current) {
            frameId = window.requestAnimationFrame(() => void scan());
            return;
          }
          try {
            const codes = await detector.detect(videoRef.current);
            const match = codes.find((code) => code.rawValue.includes("gravity-checkin"));
            if (match) {
              await processToken(match.rawValue);
            }
          } catch {
            // Ignore transient frame decode errors.
          }
          frameId = window.requestAnimationFrame(() => void scan());
        };
        frameId = window.requestAnimationFrame(() => void scan());
      } catch {
        if (!cancelled) {
          setCameraError("Camera access is unavailable. Use manual token entry below.");
        }
      }
    })();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [processToken]);

  async function handleManualSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!manualToken.trim()) return;
    await processToken(manualToken);
    setManualToken("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">QR scanner</h1>
        <p className="mt-1 text-sm text-slate-500">
          Scan member QR codes on arrival. Re-scans on the same day return the existing check-in.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-neutral-200 px-5 py-4">
            <div className="flex items-center gap-2">
              <Camera className="size-4 text-primary-600" />
              <h2 className="text-base font-bold text-slate-900">Live scanner</h2>
            </div>
          </div>
          <div className="relative aspect-video bg-slate-950">
            <video
              ref={videoRef}
              className="size-full object-cover"
              muted
              playsInline
            />
            {!cameraSupported && !cameraError ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 text-sm text-slate-200">
                <Loader2 className="mr-2 size-4 animate-spin" />
                Starting camera…
              </div>
            ) : null}
            {cameraError ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 px-6 text-center text-sm text-slate-200">
                {cameraError}
              </div>
            ) : null}
            {cameraSupported ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="size-48 rounded-2xl border-2 border-white/70" />
              </div>
            ) : null}
          </div>
          {!cameraSupported && !cameraError ? null : (
            <p className="px-5 py-3 text-xs text-slate-500">
              {cameraSupported
                ? "Hold the member QR inside the frame. Scanning pauses briefly after each check-in."
                : "This browser does not expose the Barcode Detector API. Paste the token manually."}
            </p>
          )}
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <ScanLine className="size-4 text-primary-600" />
              <h2 className="text-base font-bold text-slate-900">Manual token</h2>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Paste the full payload (including <code>gravity-checkin:</code>) if the camera is unavailable.
            </p>
            <form className="mt-4 space-y-3" onSubmit={(event) => void handleManualSubmit(event)}>
              <Input
                value={manualToken}
                onChange={(event) => setManualToken(event.target.value)}
                placeholder="gravity-checkin:…"
                autoComplete="off"
              />
              <Button type="submit" disabled={isSubmitting || !manualToken.trim()}>
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ScanLine className="size-4" />
                )}
                Check in
              </Button>
            </form>
          </Card>

          {checkInError ? (
            <Card className="border-danger-200 bg-danger-50 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger-600" />
                <p className="text-sm text-danger-700">{checkInError}</p>
              </div>
            </Card>
          ) : null}

          {lastCheckIn ? (
            <Card className="border-emerald-200 bg-emerald-50 p-4">
              <div className="flex gap-3">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-emerald-900">
                    {lastCheckIn.displayName} checked in
                  </p>
                  <p className="mt-1 text-sm text-emerald-800">
                    {lastCheckIn.memberCode} ·{" "}
                    {new Date(lastCheckIn.checkedInAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
