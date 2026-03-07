"use client";

import { systemConfig } from "@/configs/system.conf";
import { useEffect, useRef, useState } from "react";

export type EncodeStatus = "CONNECTING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface EncodeProgress {
  jobId: string;
  resolution: string;
  status: EncodeStatus;
  percentage: number;       // 0–100
  currentTime: string;      // "00:01:23.00"
  timeSeconds: number;
  totalDuration: number;
  fps: number;
  speed: number;            // 1.5 = encode nhanh hơn realtime 1.5x
  estimatedSecondsLeft: number;
  outputPath?: string;
  errorMessage?: string;
}

interface UseEncodeProgressOptions {
  /** Base URL của Spring Boot API, mặc định "" (same origin) */
  baseUrl?: string;
  onCompleted?: (progress: EncodeProgress) => void;
  onFailed?: (progress: EncodeProgress) => void;
}

export function useEncodeProgress(
  jobId: string | null,
  options: UseEncodeProgressOptions = {}
) {
  const { baseUrl = "", onCompleted, onFailed } = options;

  const [progress, setProgress] = useState<EncodeProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Đóng kết nối cũ nếu jobId thay đổi
    esRef.current?.close();
    setProgress(null);
    setError(null);

    if (!jobId) return;

    const url = `${systemConfig.NEXT_PUBLIC_API_ENDPOINT}api/videos/progress/${jobId}/stream`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onopen = () => {
      setProgress((prev) => prev ?? ({
        jobId,
        status: "CONNECTING",
        percentage: 0,
        currentTime: "00:00:00.00",
        timeSeconds: 0,
        totalDuration: 0,
        fps: 0,
        speed: 0,
        estimatedSecondsLeft: 0,
        resolution: "",
      } as EncodeProgress));
    };

    es.onmessage = (event) => {
      try {
        const p: EncodeProgress = JSON.parse(event.data);
        setProgress(p);

        if (p.status === "COMPLETED") {
          onCompleted?.(p);
          es.close();
        }
        if (p.status === "FAILED") {
          onFailed?.(p);
          es.close();
        }
      } catch {
        setError("Không parse được dữ liệu từ server");
      }
    };

    es.onerror = () => {
      setError("Mất kết nối SSE — thử lại...");
      // EventSource tự reconnect, không cần close
    };

    return () => {
      es.close();
    };
  }, [jobId, baseUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const disconnect = () => {
    esRef.current?.close();
    esRef.current = null;
  };

  return { progress, error, disconnect };
}