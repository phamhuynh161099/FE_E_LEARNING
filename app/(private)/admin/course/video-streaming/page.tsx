// "use client";

// import {
//   useEffect,
//   useRef,
//   useState,
//   useCallback,
//   useLayoutEffect,
// } from "react";

// // npm install hls.js
// // npm install --save-dev @types/hls.js
// import Hls from "hls.js";
// import disableDevtool from "disable-devtool";
// import { useQueryParams } from "@/hooks/use-query-params";
// import { LOCAL_STORAGE_KEYS } from "@/constants/local-storage.const";
// import { systemConfig } from "@/configs/system.conf";

// type StreamMode = "hls" | "native";
// type StatusState = "idle" | "loading" | "ok" | "error";
// type LogType = "info" | "ok" | "warn" | "err";

// interface LogEntry {
//   time: string;
//   msg: string;
//   type: LogType;
// }

// export default function VideoStreamTester() {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const hlsRef = useRef<Hls | null>(null);
//   const logBoxRef = useRef<HTMLDivElement>(null);

//   const [baseUrl, setBaseUrl] = useState(`${systemConfig.NEXT_PUBLIC_API_ENDPOINT}api/videos`);
//   const [videoId, setVideoId] = useState("");
//   const [quality, setQuality] = useState("720");
//   const [token, setToken] = useState("");
//   const [showToken, setShowToken] = useState(false);
//   const blobUrlRef = useRef<string | null>(null);
//   const mode: StreamMode = "hls";
//   const [status, setStatus] = useState<StatusState>("idle");
//   const [statusText, setStatusText] = useState("Idle — chưa có video nào");
//   const [overlayMsg, setOverlayMsg] = useState("Nhấn Load để phát video");
//   const [overlayHidden, setOverlayHidden] = useState(false);

//   const { getParam } = useQueryParams();

//   const buildUrl = useCallback(() => {
//     const base = baseUrl.replace(/\/$/, "");
//     return `${base}/stream/${videoId}/${quality}`;
//   }, [baseUrl, videoId, quality]);

//   useEffect(() => {
//     console.log("id", getParam("videoId"));
//     let _videoId = getParam("videoId");
//     if (_videoId) {
//       setVideoId(_videoId as any);
//     }

//     const accessToken = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
//     setToken(accessToken || "");

//     // loadVideo();
//   }, []);

//   useEffect(() => {
//     if (videoId && token) {
//       console.log("Du dieu kien load video",videoId,token)
//       loadVideo();
//     }
//   }, [videoId,token]);

//   const stopVideo = useCallback(() => {
//     const video = videoRef.current;
//     if (!video) return;

//     if (hlsRef.current) {
//       hlsRef.current.destroy();
//       hlsRef.current = null;
//     }

//     if (blobUrlRef.current) {
//       URL.revokeObjectURL(blobUrlRef.current);
//       blobUrlRef.current = null;
//     }

//     video.pause();
//     video.removeAttribute("src");
//     video.load();

//     setStatus("idle");
//     setStatusText("Đã dừng");
//     setOverlayMsg("Nhấn Load để phát video");
//     setOverlayHidden(false);
//   }, []);

//   const loadVideo = useCallback(() => {
//     stopVideo();
//     const video = videoRef.current;
//     if (!video) return;

//     const url = buildUrl();
//     setStatus("loading");
//     setStatusText("Đang tải...");
//     setOverlayMsg("⏳ Đang kết nối...");
//     setOverlayHidden(false);

//     if (mode === "hls") {
//       if (Hls.isSupported()) {
//         const hls = new Hls({
//           debug: false,
//           enableWorker: true,
//           // Gắn Bearer token vào mọi XHR request (m3u8 + ts segments)
//           xhrSetup: (xhr: XMLHttpRequest) => {
//             if (token.trim()) {
//               xhr.setRequestHeader("Authorization", `Bearer ${token.trim()}`);
//             }
//           },
//         });
//         hlsRef.current = hls;

//         hls.loadSource(url);
//         hls.attachMedia(video);

//         hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
//           setStatus("ok");
//           setStatusText(`HLS ready — ${data.levels.length} level(s)`);
//           setOverlayHidden(true);
//           video
//             .play()
//             .catch((e) => {});
//         });

//         hls.on(Hls.Events.FRAG_LOADED, (_event, data) => {
//           const kb = (data.frag.stats.loaded / 1024).toFixed(1);
//           const name = data.frag.url.split("/").pop();
//         });

//         hls.on(Hls.Events.ERROR, (_event, data) => {
//           if (data.fatal) {
//             setStatus("error");
//             setStatusText(`Lỗi: ${data.details}`);
//             setOverlayMsg("❌ " + data.details);
//             setOverlayHidden(false);
//             if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
//               hls.startLoad();
//             } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
//               hls.recoverMediaError();
//             } else {
//               hls.destroy();
//             }
//           }
//         });
//       } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
//         // Safari native HLS
//         video.src = url;
//         video.onloadedmetadata = () => {
//           setStatus("ok");
//           setStatusText("Safari HLS ready");
//           setOverlayHidden(true);
//           video.play();
//         };
//         video.onerror = () => {
//           setStatus("error");
//           setStatusText("Lỗi Safari HLS");
//         };
//       } else {
//         setStatus("error");
//         setStatusText("HLS không được hỗ trợ");
//         setOverlayMsg("❌ Trình duyệt không hỗ trợ HLS");
//       }
//     } else {
//       // Native byte-range — dùng fetch để gửi Bearer token, rồi tạo Blob URL
//       const headers: Record<string, string> = {};
//       if (token.trim()) {
//         headers["Authorization"] = `Bearer ${token.trim()}`;
//       }

//       fetch(url, { headers })
//         .then(async (res) => {
//           if (!res.ok) {
//             const msg = `HTTP ${res.status} ${res.statusText}`;
//             setStatus("error");
//             setStatusText(msg);
//             setOverlayMsg("❌ " + msg);
//             setOverlayHidden(false);
//             return;
//           }

//           const blob = await res.blob();
//           const blobUrl = URL.createObjectURL(blob);
//           blobUrlRef.current = blobUrl;

//           video.src = blobUrl;

//           const onLoaded = () => {
//             setStatus("ok");
//             setStatusText("Native video ready");
//             setOverlayHidden(true);
//             video
//               .play()
//               .catch((e) => {});
//             video.removeEventListener("loadedmetadata", onLoaded);
//             video.removeEventListener("error", onError);
//           };
//           const onError = () => {
//             const err = video.error;
//             setStatus("error");
//             setStatusText(`Lỗi video (code ${err?.code})`);
//             setOverlayMsg("❌ Không load được video");
//             setOverlayHidden(false);
//             video.removeEventListener("loadedmetadata", onLoaded);
//             video.removeEventListener("error", onError);
//           };
//           video.addEventListener("loadedmetadata", onLoaded);
//           video.addEventListener("error", onError);
//         })
//         .catch((e) => {
//           setStatus("error");
//           setStatusText("Lỗi kết nối");
//           setOverlayMsg("❌ Không thể kết nối server");
//           setOverlayHidden(false);
//         });
//     }
//   }, [mode, buildUrl, stopVideo, token]);

//   const dotClass: Record<StatusState, string> = {
//     idle: "bg-slate-500",
//     loading: "bg-yellow-400 animate-pulse",
//     ok: "bg-green-400 shadow-[0_0_6px_#4ade80]",
//     error: "bg-red-400 shadow-[0_0_6px_#f87171]",
//   };

//   useEffect(() => {
//     // Kích hoạt disable-devtool
//     disableDevtool({
//       ondevtoolopen: (type) => {
//         const info = 'Devtool được phát hiện!';
//         document.body.innerHTML = info;
//         window.location.href = "https://localhost:8080";
//       },
//       disableMenu: true,
//       url: "https://localhost:8080",
//     });
//   }, []);

//   useLayoutEffect(() => {
//     // disableDevtool({
//     //   // Tùy chỉnh hành động khi phát hiện
//     //   ondevtoolopen: (type) => {
//     //     const info = "Phát hiện DevTools! Web sẽ đóng lại.";
//     //     console.clear(); // Xóa log để họ không đọc được gì
//     //     document.body.innerHTML = `<div style="padding: 50px; text-align: center; font-family: sans-serif;"><h1>${info}</h1></div>`;
//     //     // Đóng tab hoặc chuyển hướng ngay lập tức
//     //     window.location.href = "https://localhost:8080";
//     //   },
//     //   // CẤU HÌNH QUAN TRỌNG ĐỂ CHẶN "MỞ SẴN":
//     //   interval: 200, // Kiểm tra liên tục mỗi 200ms
//     //   disableMenu: true, // Chặn chuột phải
//     //   stopIntervalTime: 5000, // (Mặc định) Sau bao lâu thì ngừng check
//     // });
//   }, []);

//   return (
//     <div
//       className="min-h-screen flex flex-col items-center px-5 py-10"
//       style={{
//         background: "#080c10",
//         backgroundImage:
//           "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,212,255,0.06) 0%, transparent 70%), radial-gradient(ellipse 40% 30% at 90% 80%, rgba(124,58,237,0.05) 0%, transparent 60%)",
//         fontFamily: "'Sora', sans-serif",
//         color: "#e2e8f0",
//       }}
//     >
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Sora:wght@300;600;800&display=swap');
//         .mono { font-family: 'JetBrains Mono', monospace; }
//         input, select { outline: none; }
//         input:focus, select:focus {
//           border-color: #00d4ff !important;
//           box-shadow: 0 0 0 2px rgba(0,212,255,0.12);
//         }
//         .log-box::-webkit-scrollbar { width: 4px; }
//         .log-box::-webkit-scrollbar-thumb { background: #1e2d3d; border-radius: 4px; }
//       `}</style>

//       <div className="w-full max-w-3xl flex flex-col gap-5">
//         {/* Config Card */}
//         <div
//           className="rounded-2xl p-6"
//           style={{ background: "#111820", border: "1px solid #1e2d3d" }}
//         >
//           <CardTitle>Cấu hình API</CardTitle>

//           <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
//             <Field label="BASE URL">
//               <input
//                 className="mono w-full rounded-lg px-3 py-2 text-sm"
//                 style={{
//                   background: "#0d1117",
//                   border: "1px solid #1e2d3d",
//                   color: "#e2e8f0",
//                 }}
//                 value={baseUrl}
//                 onChange={(e) => setBaseUrl(e.target.value)}
//                 placeholder="http://localhost:8080"
//               />
//             </Field>
//             <Field label="VIDEO ID">
//               <input
//                 className="mono w-full rounded-lg px-3 py-2 text-sm"
//                 style={{
//                   background: "#0d1117",
//                   border: "1px solid #1e2d3d",
//                   color: "#e2e8f0",
//                 }}
//                 type="number"
//                 min={1}
//                 value={videoId}
//                 onChange={(e) => setVideoId(e.target.value)}
//               />
//             </Field>
//             <Field label="QUALITY">
//               <select
//                 className="mono w-full rounded-lg px-3 py-2 text-sm"
//                 style={{
//                   background: "#0d1117",
//                   border: "1px solid #1e2d3d",
//                   color: "#e2e8f0",
//                 }}
//                 value={quality}
//                 onChange={(e) => setQuality(e.target.value)}
//               >
//                 <option value="720">720p</option>
//                 <option value="1080">1080p</option>
//               </select>
//             </Field>
//           </div>

//           <div className="mt-3">
//             <Field label="BEARER TOKEN (tuỳ chọn)">
//               <div className="relative">
//                 <input
//                   className="mono w-full rounded-lg px-3 py-2 text-sm pr-20"
//                   style={{
//                     background: "#0d1117",
//                     border: "1px solid #1e2d3d",
//                     color: "#e2e8f0",
//                   }}
//                   type={showToken ? "text" : "password"}
//                   value={token}
//                   onChange={(e) => setToken(e.target.value)}
//                   placeholder="eyJhbGciOiJIUzI1NiJ9..."
//                 />
//                 <button
//                   onClick={() => setShowToken((v) => !v)}
//                   className="mono absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded"
//                   style={{
//                     color: "#64748b",
//                     background: "transparent",
//                     border: "none",
//                     cursor: "pointer",
//                   }}
//                 >
//                   {showToken ? "ẨN" : "HIỆN"}
//                 </button>
//               </div>
//             </Field>
//             {token.trim() && (
//               <div
//                 className="mono text-xs mt-2 px-3 py-2 rounded-lg flex items-center gap-2"
//                 style={{
//                   background: "rgba(34,197,94,0.08)",
//                   border: "1px solid rgba(34,197,94,0.2)",
//                   color: "#22c55e",
//                 }}
//               >
//                 <span>✓</span>
//                 <span>
//                   Token đã nhập — sẽ gửi header{" "}
//                   <strong>Authorization: Bearer ...</strong>
//                 </span>
//               </div>
//             )}
//           </div>

//           <hr className="my-4" style={{ borderColor: "#1e2d3d" }} />

//           <Field label="Endpoint sẽ gọi">
//             <div
//               className="mono text-sm px-4 py-3 rounded-lg break-all"
//               style={{
//                 background: "#0d1117",
//                 border: "1px solid #1e2d3d",
//                 color: "#00d4ff",
//               }}
//             >
//               <span
//                 className="mono text-xs font-bold mr-2 px-2 py-0.5 rounded"
//                 style={{
//                   background: "rgba(34,197,94,0.15)",
//                   color: "#22c55e",
//                   border: "1px solid rgba(34,197,94,0.3)",
//                 }}
//               >
//                 GET
//               </span>
//               {buildUrl()}
//             </div>
//           </Field>
//         </div>

//         {/* Player Card */}
//         <div
//           className="rounded-2xl p-6"
//           style={{ background: "#111820", border: "1px solid #1e2d3d" }}
//         >
//           <CardTitle>Player</CardTitle>

//           {/* Video */}
//           <div
//             className="relative rounded-xl overflow-hidden bg-black"
//             style={{ aspectRatio: "16/9" }}
//           >
//             <video
//               ref={videoRef}
//               controls
//               playsInline
//               autoPlay
//               className="w-full h-full block"
//             />
//             {!overlayHidden && (
//               <div
//                 className="absolute inset-0 flex items-center justify-center mono text-sm"
//                 style={{ background: "rgba(0,0,0,0.7)", color: "#64748b" }}
//               >
//                 {overlayMsg}
//               </div>
//             )}
//           </div>

//           {/* Actions */}
//           <div className="flex gap-3 mt-4 flex-wrap items-center">
//             <button
//               onClick={loadVideo}
//               className="mono text-xs font-bold px-5 py-2.5 rounded-lg transition-all"
//               style={{
//                 background: "linear-gradient(135deg, #00d4ff, #0099bb)",
//                 color: "#000",
//                 border: "none",
//                 cursor: "pointer",
//               }}
//             >
//               ▶ Load &amp; Play
//             </button>
//             <button
//               onClick={stopVideo}
//               className="mono text-xs font-bold px-5 py-2.5 rounded-lg transition-all"
//               style={{
//                 background: "rgba(239,68,68,0.15)",
//                 color: "#ef4444",
//                 border: "1px solid rgba(239,68,68,0.3)",
//                 cursor: "pointer",
//               }}
//             >
//               ■ Stop
//             </button>
//             <div
//               className="mono text-xs flex items-center gap-2 flex-1 px-4 py-2.5 rounded-lg"
//               style={{ background: "#0d1117", border: "1px solid #1e2d3d" }}
//             >
//               <div
//                 className={`w-2 h-2 rounded-full shrink-0 ${dotClass[status]}`}
//               />
//               {statusText}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function CardTitle({ children }: { children: React.ReactNode }) {
//   return (
//     <div
//       className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4"
//       style={{ color: "#00d4ff", fontFamily: "'JetBrains Mono', monospace" }}
//     >
//       <span
//         className="w-1.5 h-1.5 rounded-full"
//         style={{ background: "#00d4ff", boxShadow: "0 0 6px #00d4ff" }}
//       />
//       {children}
//     </div>
//   );
// }

// function Field({
//   label,
//   children,
// }: {
//   label: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <div>
//       <label
//         className="block text-xs mb-1.5"
//         style={{ color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}
//       >
//         {label}
//       </label>
//       {children}
//     </div>
//   );
// }
"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
} from "react";
// https://claude.ai/chat/34c5b6a9-1c15-4dc4-9927-59f9a21614a1
// npm install hls.js
// npm install --save-dev @types/hls.js
import Hls from "hls.js";
import disableDevtool from "disable-devtool";
import { useQueryParams } from "@/hooks/use-query-params";
import { LOCAL_STORAGE_KEYS } from "@/constants/local-storage.const";
import { systemConfig } from "@/configs/system.conf";
import { useCurrentUser } from "@/stores/auth-store.zustand";

type StreamMode = "hls" | "native";
type StatusState = "idle" | "loading" | "ok" | "error";

export default function VideoStreamTester() {
  const currentUserInfor = useCurrentUser();
  const videoRef = useRef<HTMLVideoElement>(null);
  // ⬇ Đây là container được fullscreen (không phải <video> trực tiếp)
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [baseUrl, setBaseUrl] = useState(
    `${systemConfig.NEXT_PUBLIC_API_ENDPOINT}api/videos`,
  );
  const [videoId, setVideoId] = useState("");
  const [quality, setQuality] = useState("720");
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const blobUrlRef = useRef<string | null>(null);
  const mode: StreamMode = "hls";
  const [status, setStatus] = useState<StatusState>("idle");
  const [statusText, setStatusText] = useState("Idle — chưa có video nào");
  const [overlayMsg, setOverlayMsg] = useState("Nhấn Load để phát video");
  const [overlayHidden, setOverlayHidden] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Watermark text — thay bằng email/username thực từ auth nếu cần
  // const watermarkText = "user@example.com";
  const [watermarkText, setWatermarkText] = useState<String | any>("");

  const { getParam } = useQueryParams();

  const buildUrl = useCallback(() => {
    const base = baseUrl.replace(/\/$/, "");
    return `${base}/stream/${videoId}/${quality}`;
  }, [baseUrl, videoId, quality]);

  // ── Lắng nghe sự kiện fullscreen thay đổi ──────────────────────────────
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
    };
  }, []);

  // ── Toggle fullscreen trên container (không phải video) ─────────────────
  const toggleFullscreen = useCallback(() => {
    const container = playerContainerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  useEffect(() => {
    let _videoId = getParam("videoId");
    if (_videoId) setVideoId(_videoId as any);
    const accessToken = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
    setToken(accessToken || "");
  }, []);

  useEffect(() => {
    if (videoId && token) loadVideo();
  }, [videoId, token]);

  useEffect(() => {
    console.log("updateUserInfor", currentUserInfor);
    setWatermarkText(currentUserInfor?.email as String);
  }, [currentUserInfor]);

  const stopVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    video.pause();
    video.removeAttribute("src");
    video.load();
    setStatus("idle");
    setStatusText("Đã dừng");
    setOverlayMsg("Nhấn Load để phát video");
    setOverlayHidden(false);
  }, []);

  const loadVideo = useCallback(() => {
    stopVideo();
    const video = videoRef.current;
    if (!video) return;
    const url = buildUrl();
    setStatus("loading");
    setStatusText("Đang tải...");
    setOverlayMsg("⏳ Đang kết nối...");
    setOverlayHidden(false);

    if (mode === "hls") {
      if (Hls.isSupported()) {
        const hls = new Hls({
          debug: false,
          enableWorker: true,
          xhrSetup: (xhr: XMLHttpRequest) => {
            if (token.trim())
              xhr.setRequestHeader("Authorization", `Bearer ${token.trim()}`);
          },
        });
        hlsRef.current = hls;
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
          setStatus("ok");
          setStatusText(`HLS ready — ${data.levels.length} level(s)`);
          setOverlayHidden(true);
          video.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            setStatus("error");
            setStatusText(`Lỗi: ${data.details}`);
            setOverlayMsg("❌ " + data.details);
            setOverlayHidden(false);
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
            else if (data.type === Hls.ErrorTypes.MEDIA_ERROR)
              hls.recoverMediaError();
            else hls.destroy();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.onloadedmetadata = () => {
          setStatus("ok");
          setStatusText("Safari HLS ready");
          setOverlayHidden(true);
          video.play();
        };
        video.onerror = () => {
          setStatus("error");
          setStatusText("Lỗi Safari HLS");
        };
      } else {
        setStatus("error");
        setStatusText("HLS không được hỗ trợ");
        setOverlayMsg("❌ Trình duyệt không hỗ trợ HLS");
      }
    } else {
      const headers: Record<string, string> = {};
      if (token.trim()) headers["Authorization"] = `Bearer ${token.trim()}`;
      fetch(url, { headers })
        .then(async (res) => {
          if (!res.ok) {
            const msg = `HTTP ${res.status} ${res.statusText}`;
            setStatus("error");
            setStatusText(msg);
            setOverlayMsg("❌ " + msg);
            setOverlayHidden(false);
            return;
          }
          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);
          blobUrlRef.current = blobUrl;
          video.src = blobUrl;
          const onLoaded = () => {
            setStatus("ok");
            setStatusText("Native video ready");
            setOverlayHidden(true);
            video.play().catch(() => {});
            video.removeEventListener("loadedmetadata", onLoaded);
            video.removeEventListener("error", onError);
          };
          const onError = () => {
            const err = video.error;
            setStatus("error");
            setStatusText(`Lỗi video (code ${err?.code})`);
            setOverlayMsg("❌ Không load được video");
            setOverlayHidden(false);
            video.removeEventListener("loadedmetadata", onLoaded);
            video.removeEventListener("error", onError);
          };
          video.addEventListener("loadedmetadata", onLoaded);
          video.addEventListener("error", onError);
        })
        .catch(() => {
          setStatus("error");
          setStatusText("Lỗi kết nối");
          setOverlayMsg("❌ Không thể kết nối server");
          setOverlayHidden(false);
        });
    }
  }, [mode, buildUrl, stopVideo, token]);

  const dotClass: Record<StatusState, string> = {
    idle: "bg-slate-500",
    loading: "bg-yellow-400 animate-pulse",
    ok: "bg-green-400 shadow-[0_0_6px_#4ade80]",
    error: "bg-red-400 shadow-[0_0_6px_#f87171]",
  };

  // useEffect(() => {
  //   disableDevtool({
  //     ondevtoolopen: () => {
  //       document.body.innerHTML = "Devtool được phát hiện!";
  //       window.location.href = "https://localhost:8080";
  //     },
  //     disableMenu: true,
  //     url: "https://localhost:8080",
  //   });
  // }, []);

  useLayoutEffect(() => {}, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center px-5 py-10"
      style={{
        background: "#080c10",
        backgroundImage:
          "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,212,255,0.06) 0%, transparent 70%), radial-gradient(ellipse 40% 30% at 90% 80%, rgba(124,58,237,0.05) 0%, transparent 60%)",
        fontFamily: "'Sora', sans-serif",
        color: "#e2e8f0",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Sora:wght@300;600;800&display=swap');
        .mono { font-family: 'JetBrains Mono', monospace; }
        input, select { outline: none; }
        input:focus, select:focus {
          border-color: #00d4ff !important;
          box-shadow: 0 0 0 2px rgba(0,212,255,0.12);
        }

        /* ── Ẩn nút fullscreen native của <video controls> ────────────── */
        video::-webkit-media-controls-fullscreen-button {
          display: none !important;
        }
        video::-webkit-media-controls-toggle-closed-captions-button {
          display: none !important;
        }

        /* ── Watermark ──────────────────────────────────────────────────── */
        .watermark-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;   /* click xuyên qua, không chặn controls */
          z-index: 10;
          overflow: hidden;
          /* Tiled diagonal text bằng CSS pattern */
          background-image: repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 120px,
            rgba(255,255,255,0.0) 120px,
            rgba(255,255,255,0.0) 121px
          );
        }
        .watermark-layer span {
          position: absolute;
          color: rgba(255, 255, 255, 0.18);
          font-size: 13px;
          font-family: 'JetBrains Mono', monospace;
          white-space: nowrap;
          transform: rotate(-30deg);
          user-select: none;
          letter-spacing: 0.04em;
          text-shadow: 0 1px 2px rgba(0,0,0,0.6);
        }

        /* ── Khi container ở fullscreen — giữ watermark đúng vị trí ────── */
        .player-container:fullscreen {
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .player-container:fullscreen video {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .player-container:fullscreen .watermark-layer {
          position: fixed;   /* fixed để bao phủ toàn màn hình khi fullscreen */
          inset: 0;
          z-index: 2147483647; /* max z-index */
        }

        /* webkit (Safari) */
        .player-container:-webkit-full-screen .watermark-layer {
          position: fixed;
          inset: 0;
          z-index: 2147483647;
        }
      `}</style>

      <div className="w-full max-w-3xl flex flex-col gap-5">
        {/* Config Card */}
        <div
          className="rounded-2xl p-6"
          style={{ background: "#111820", border: "1px solid #1e2d3d" }}
        >
          <CardTitle>Cấu hình API</CardTitle>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="BASE URL">
              <input
                className="mono w-full rounded-lg px-3 py-2 text-sm"
                style={{
                  background: "#0d1117",
                  border: "1px solid #1e2d3d",
                  color: "#e2e8f0",
                }}
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="http://localhost:8080"
              />
            </Field>
            <Field label="VIDEO ID">
              <input
                className="mono w-full rounded-lg px-3 py-2 text-sm"
                style={{
                  background: "#0d1117",
                  border: "1px solid #1e2d3d",
                  color: "#e2e8f0",
                }}
                type="number"
                min={1}
                value={videoId}
                onChange={(e) => setVideoId(e.target.value)}
              />
            </Field>
            <Field label="QUALITY">
              <select
                className="mono w-full rounded-lg px-3 py-2 text-sm"
                style={{
                  background: "#0d1117",
                  border: "1px solid #1e2d3d",
                  color: "#e2e8f0",
                }}
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
              >
                <option value="720">720p</option>
                <option value="1080">1080p</option>
              </select>
            </Field>
          </div>

          <div className="mt-3">
            <Field label="BEARER TOKEN (tuỳ chọn)">
              <div className="relative">
                <input
                  className="mono w-full rounded-lg px-3 py-2 text-sm pr-20"
                  style={{
                    background: "#0d1117",
                    border: "1px solid #1e2d3d",
                    color: "#e2e8f0",
                  }}
                  type={showToken ? "text" : "password"}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiJ9..."
                />
                <button
                  onClick={() => setShowToken((v) => !v)}
                  className="mono absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded"
                  style={{
                    color: "#64748b",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {showToken ? "ẨN" : "HIỆN"}
                </button>
              </div>
            </Field>
            {token.trim() && (
              <div
                className="mono text-xs mt-2 px-3 py-2 rounded-lg flex items-center gap-2"
                style={{
                  background: "rgba(34,197,94,0.08)",
                  border: "1px solid rgba(34,197,94,0.2)",
                  color: "#22c55e",
                }}
              >
                <span>✓</span>
                <span>
                  Token đã nhập — sẽ gửi header{" "}
                  <strong>Authorization: Bearer ...</strong>
                </span>
              </div>
            )}
          </div>

          <hr className="my-4" style={{ borderColor: "#1e2d3d" }} />

          <Field label="Endpoint sẽ gọi">
            <div
              className="mono text-sm px-4 py-3 rounded-lg break-all"
              style={{
                background: "#0d1117",
                border: "1px solid #1e2d3d",
                color: "#00d4ff",
              }}
            >
              <span
                className="mono text-xs font-bold mr-2 px-2 py-0.5 rounded"
                style={{
                  background: "rgba(34,197,94,0.15)",
                  color: "#22c55e",
                  border: "1px solid rgba(34,197,94,0.3)",
                }}
              >
                GET
              </span>
              {buildUrl()}
            </div>
          </Field>
        </div>

        {/* Player Card */}
        <div
          className="rounded-2xl p-6"
          style={{ background: "#111820", border: "1px solid #1e2d3d" }}
        >
          <CardTitle>Player</CardTitle>

          {/*
           * ── Player container — đây là element được gọi .requestFullscreen() ──
           * Watermark nằm BÊN TRONG container, không phải bên trong <video>,
           * nên dù fullscreen vẫn luôn hiển thị.
           */}
          <div
            ref={playerContainerRef}
            className="player-container relative rounded-xl overflow-hidden bg-black"
            style={{ aspectRatio: "16/9" }}
          >
            {/* Video element — không có nút fullscreen mặc định của browser */}
            <video
              ref={videoRef}
              // Bỏ "controls" tích hợp của browser để tránh nút fullscreen
              // fullscreen container thay vì fullscreen video
              controls
              playsInline
              autoPlay
              className="w-full h-full block"
              // Ẩn nút fullscreen native bằng CSS (xem style bên dưới)
              style={{ width: "100%", height: "100%" }}
            />

            {/* ── Watermark overlay ── */}
            <WatermarkLayer text={watermarkText} />

            {/* ── Overlay thông báo trạng thái ── */}
            {!overlayHidden && (
              <div
                className="absolute inset-0 flex items-center justify-center mono text-sm"
                style={{
                  background: "rgba(0,0,0,0.7)",
                  color: "#64748b",
                  zIndex: 5,
                }}
              >
                {overlayMsg}
              </div>
            )}

            {/* ── Nút fullscreen tuỳ chỉnh (góc dưới phải) ── */}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
              style={{
                position: "absolute",
                bottom: 8,
                right: 8,
                zIndex: 20,
                background: "rgba(0,0,0,0.55)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 6,
                color: "#e2e8f0",
                cursor: "pointer",
                padding: "4px 8px",
                fontSize: 16,
                lineHeight: 1,
                backdropFilter: "blur(4px)",
              }}
            >
              {isFullscreen ? "⛶" : "⛶"}
              <span className="mono" style={{ fontSize: 10, marginLeft: 4 }}>
                {isFullscreen ? "EXIT" : "FULL"}
              </span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-4 flex-wrap items-center">
            <button
              onClick={loadVideo}
              className="mono text-xs font-bold px-5 py-2.5 rounded-lg transition-all"
              style={{
                background: "linear-gradient(135deg, #00d4ff, #0099bb)",
                color: "#000",
                border: "none",
                cursor: "pointer",
              }}
            >
              ▶ Load &amp; Play
            </button>
            <button
              onClick={stopVideo}
              className="mono text-xs font-bold px-5 py-2.5 rounded-lg transition-all"
              style={{
                background: "rgba(239,68,68,0.15)",
                color: "#ef4444",
                border: "1px solid rgba(239,68,68,0.3)",
                cursor: "pointer",
              }}
            >
              ■ Stop
            </button>
            <div
              className="mono text-xs flex items-center gap-2 flex-1 px-4 py-2.5 rounded-lg"
              style={{ background: "#0d1117", border: "1px solid #1e2d3d" }}
            >
              <div
                className={`w-2 h-2 rounded-full shrink-0 ${dotClass[status]}`}
              />
              {statusText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Component watermark tiled ────────────────────────────────────────────────
function WatermarkLayer({ text }: { text: string }) {
  // Tạo lưới các span watermark phân bổ đều trên toàn khung hình
  const cols = 3;
  const rows = 4;
  const items = Array.from({ length: cols * rows }, (_, i) => i);

  return (
    <div className="watermark-layer" aria-hidden="true">
      {items.map((i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        // Offset từng hàng để tạo hiệu ứng so le (stagger)
        const xOffset = row % 2 === 0 ? 0 : 16;
        const left = `${(col / cols) * 100 + xOffset}%`;
        const top = `${(row / rows) * 100 + 8}%`;
        return (
          <span key={i} style={{ left, top }}>
            {text}
          </span>
        );
      })}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4"
      style={{ color: "#00d4ff", fontFamily: "'JetBrains Mono', monospace" }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: "#00d4ff", boxShadow: "0 0 6px #00d4ff" }}
      />
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="block text-xs mb-1.5"
        style={{ color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
