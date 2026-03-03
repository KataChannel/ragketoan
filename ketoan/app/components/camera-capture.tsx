'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, X, RotateCcw, ZoomIn, ZoomOut, CheckCircle2, AlertCircle, Loader2, Zap, ZapOff, Sun } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { toast } from 'sonner';

interface QualityResult {
    brightness: number; // 0-255
    sharpness: number;  // Laplacian variance
    isGood: boolean;
    brightnessOk: boolean;
    sharpnessOk: boolean;
    hint: string;
}

interface CameraCaptureProps {
    onCapture?: (fileName: string, dataUrl: string) => void;
    onClose?: () => void;
}

// Ngưỡng chất lượng
const BRIGHTNESS_MIN = 60;
const BRIGHTNESS_MAX = 210;
const SHARPNESS_MIN = 80; // Laplacian variance ngưỡng

/**
 * Tính độ sáng trung bình từ ImageData
 */
function calcBrightness(data: Uint8ClampedArray, width: number, height: number): number {
    const step = 4; // Chỉ lấy một phần pixel để tăng tốc độ
    let sum = 0;
    let count = 0;
    for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
            const i = (y * width + x) * 4;
            // Luminance formula
            sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            count++;
        }
    }
    return count > 0 ? sum / count : 0;
}

/**
 * Tính độ nét bằng Laplacian variance
 */
function calcSharpness(data: Uint8ClampedArray, width: number, height: number): number {
    // Chuyển sang grayscale và áp dụng Laplacian kernel
    const gray: number[] = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            gray[y * width + x] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        }
    }

    // Laplacian kernel: [0,1,0],[1,-4,1],[0,1,0]
    let sumSq = 0;
    let count = 0;
    const step = 2; // Skip pixels for performance
    for (let y = 1; y < height - 1; y += step) {
        for (let x = 1; x < width - 1; x += step) {
            const lap =
                -4 * gray[y * width + x] +
                gray[(y - 1) * width + x] +
                gray[(y + 1) * width + x] +
                gray[y * width + x - 1] +
                gray[y * width + x + 1];
            sumSq += lap * lap;
            count++;
        }
    }
    return count > 0 ? Math.sqrt(sumSq / count) : 0;
}

/**
 * Phân tích chất lượng frame
 */
function analyzeQuality(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    video: HTMLVideoElement
): QualityResult {
    const { width, height } = canvas;

    // Vẽ frame vào canvas
    ctx.drawImage(video, 0, 0, width, height);

    // Lấy pixel data từ vùng trung tâm
    const cx = Math.floor(width * 0.1);
    const cy = Math.floor(height * 0.1);
    const cw = Math.floor(width * 0.8);
    const ch = Math.floor(height * 0.8);
    const imageData = ctx.getImageData(cx, cy, cw, ch);
    const { data } = imageData;

    const brightness = calcBrightness(data, cw, ch);
    const sharpness = calcSharpness(data, cw, ch);

    const brightnessOk = brightness >= BRIGHTNESS_MIN && brightness <= BRIGHTNESS_MAX;
    const sharpnessOk = sharpness >= SHARPNESS_MIN;
    const isGood = brightnessOk && sharpnessOk;

    let hint = '';
    if (!brightnessOk) {
        if (brightness < BRIGHTNESS_MIN) hint = '⚠️ Hình quá tối — Di chuyển tới vùng có ánh sáng tốt hơn hoặc bật đèn';
        else hint = '⚠️ Hình quá sáng — Tránh ánh nắng trực tiếp chiếu vào tài liệu';
    } else if (!sharpnessOk) {
        hint = '🔍 Hình bị mờ — Giữ máy cố định, Zoom in để rõ hơn, hoặc đảm bảo tài liệu phẳng';
    } else {
        hint = '✅ Chất lượng tốt — Nhấn nút chụp để lưu';
    }

    return { brightness, sharpness, isGood, brightnessOk, sharpnessOk, hint };
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const analysisCanvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [isStarted, setIsStarted] = useState(false);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [quality, setQuality] = useState<QualityResult | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [capturedCount, setCapturedCount] = useState(0);
    const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
    const [zoom, setZoom] = useState(1);
    const [torch, setTorch] = useState(false);
    const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
    const [hasTorch, setHasTorch] = useState(false);

    const analysisIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Kiểm tra số lượng camera
    useEffect(() => {
        if (typeof window === 'undefined' || !navigator?.mediaDevices?.enumerateDevices) return;

        navigator.mediaDevices.enumerateDevices().then(devices => {
            const cameras = devices.filter(d => d.kind === 'videoinput');
            setHasMultipleCameras(cameras.length > 1);
        }).catch(err => {
            console.warn('Cannot enumerate devices:', err);
        });
    }, []);

    // Bắt đầu camera
    const startCamera = useCallback(async () => {
        if (typeof window === 'undefined') return;

        if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            toast.error(
                <div>
                    <p className="font-bold">Lỗi Bảo mật Trình duyệt:</p>
                    <p className="text-xs">Camera chỉ hoạt động trên <b>HTTPS</b> hoặc <b>localhost</b>.</p>
                </div>,
                { duration: 6000 }
            );
            return;
        }

        if (!navigator?.mediaDevices?.getUserMedia) {
            toast.error('Trình duyệt không hỗ trợ Camera API');
            return;
        }

        try {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
            }

            const constraints: MediaStreamConstraints = {
                video: {
                    facingMode: facingMode,
                    width: { min: 1280, ideal: 1920, max: 2560 },
                    height: { min: 720, ideal: 1080, max: 1440 },
                    // Cải thiện độ sắc nét bằng cách yêu cầu khung hình lớn
                    frameRate: { ideal: 30 }
                },
                audio: false,
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;

            const videoTrack = stream.getVideoTracks()[0];
            const capabilities = videoTrack.getCapabilities() as any;

            // Kiểm tra hỗ trợ Torch (Đèn pin)
            setHasTorch(!!capabilities.torch);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play();
                    setIsCameraReady(true);
                };
            }
            setIsStarted(true);
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : 'Không thể truy cập camera';
            console.error('Camera Access Error:', err);
            toast.error(`Lỗi camera: ${errMsg}`);
        }
    }, [facingMode]);

    // Điều khiển Torch (Đèn flash)
    const toggleTorch = useCallback(async () => {
        if (!streamRef.current) return;
        const videoTrack = streamRef.current.getVideoTracks()[0];
        try {
            const newTorchState = !torch;
            await videoTrack.applyConstraints({
                advanced: [{ torch: newTorchState }] as any
            });
            setTorch(newTorchState);
        } catch (err) {
            console.error('Torch error:', err);
        }
    }, [torch]);

    // Dừng camera
    const stopCamera = useCallback(() => {
        if (analysisIntervalRef.current) {
            clearInterval(analysisIntervalRef.current);
            analysisIntervalRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        setIsStarted(false);
        setIsCameraReady(false);
        setQuality(null);
    }, []);

    // Phân tích chất lượng liên tục
    useEffect(() => {
        if (!isCameraReady) return;

        analysisIntervalRef.current = setInterval(() => {
            const video = videoRef.current;
            const canvas = analysisCanvasRef.current;
            if (!video || !canvas || video.readyState < 2) return;

            const vw = video.videoWidth;
            const vh = video.videoHeight;

            if (vw === 0 || vh === 0) return;

            // Đảm bảo kích thước canvas hợp lệ
            canvas.width = Math.min(vw, 320);
            canvas.height = Math.round(canvas.width * vh / vw);

            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) return;

            try {
                const result = analyzeQuality(canvas, ctx, video);
                setQuality(result);
            } catch (err) {
                console.warn('Analysis error:', err);
            }
        }, 400); // Tăng giãn cách một chút để giảm tải CPU

        return () => {
            if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
        };
    }, [isCameraReady]);

    // Cleanup khi component unmount
    useEffect(() => {
        return () => stopCamera();
    }, [stopCamera]);

    // Đổi camera (front/back)
    const toggleCamera = useCallback(() => {
        setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
        setIsCameraReady(false);
    }, []);

    // Restart khi facingMode thay đổi
    useEffect(() => {
        if (isStarted) startCamera();
    }, [facingMode]);

    // Xử lý zoom
    const handleZoomIn = () => setZoom(z => Math.min(z + 0.25, 3));
    const handleZoomOut = () => setZoom(z => Math.max(z - 0.25, 1));

    // Chụp hình
    const handleCapture = async () => {
        if (!videoRef.current || !quality?.isGood) return;

        setIsSaving(true);
        try {
            const video = videoRef.current;
            const captureCanvas = document.createElement('canvas');
            captureCanvas.width = video.videoWidth;
            captureCanvas.height = video.videoHeight;
            const ctx = captureCanvas.getContext('2d');
            if (!ctx) throw new Error('Canvas context error');

            // Tăng cường độ nét và tương phản cho ảnh chụp (Filter)
            // Áp dụng thuật toán đơn giản để làm rõ chữ
            ctx.filter = 'contrast(1.1) brightness(1.05) saturate(1.1)';
            ctx.drawImage(video, 0, 0);

            // Vẽ lại một lần nữa với độ sắc nét giả lập (unsharp mask effect)
            ctx.globalCompositeOperation = 'overlay';
            ctx.drawImage(captureCanvas, 0, 0);
            ctx.globalCompositeOperation = 'source-over';

            const dataUrl = captureCanvas.toDataURL('image/jpeg', 0.95);

            // Tên file với timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const fileName = `bangke_${timestamp}.jpg`;

            // Lưu qua API
            const response = await fetch('/api/capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageData: dataUrl, fileName }),
            });

            const result = await response.json();

            if (result.success) {
                const count = capturedCount + 1;
                setCapturedCount(count);
                toast.success(`✅ Đã lưu hình ${count}: ${fileName}`, { duration: 3000 });
                onCapture?.(fileName, dataUrl);
            } else {
                throw new Error(result.error || 'Lỗi lưu hình');
            }
        } catch (err) {
            toast.error(`Lỗi chụp: ${err instanceof Error ? err.message : 'Không xác định'}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Đóng và cleanup
    const handleClose = () => {
        stopCamera();
        onClose?.();
    };

    const isGood = quality?.isGood ?? false;
    const borderColor = !isCameraReady
        ? 'border-gray-400'
        : isGood
            ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]'
            : 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.35)]';

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gray-950 rounded-2xl overflow-hidden w-full max-w-2xl shadow-2xl flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 bg-gray-900 border-b border-gray-800">
                    <div className="flex items-center gap-2">
                        <Camera className="h-5 w-5 text-blue-400" />
                        <span className="font-semibold text-white text-sm">Chụp Tài Liệu / Hóa đơn</span>
                        {capturedCount > 0 && (
                            <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                {capturedCount} ảnh
                            </span>
                        )}
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Camera Viewport */}
                <div className="relative bg-black aspect-video">
                    {/* Canvas ẩn để phân tích */}
                    <canvas ref={analysisCanvasRef} className="hidden" />

                    {/* Video stream */}
                    <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        style={{
                            transform: `scale(${zoom})`,
                            transformOrigin: 'center center',
                        }}
                        playsInline
                        muted
                    />

                    {/* Border quality indicator */}
                    {isCameraReady && (
                        <div
                            className={`absolute inset-3 rounded-xl border-2 transition-all duration-300 pointer-events-none ${borderColor}`}
                        />
                    )}

                    {/* Corner guides khi chất lượng tốt */}
                    {isGood && (
                        <>
                            {['top-5 left-5', 'top-5 right-5', 'bottom-5 left-5', 'bottom-5 right-5'].map((pos, i) => (
                                <div
                                    key={i}
                                    className={`absolute ${pos} w-8 h-8 border-green-400 pointer-events-none`}
                                    style={{
                                        borderTopWidth: i < 2 ? '3px' : '0',
                                        borderBottomWidth: i >= 2 ? '3px' : '0',
                                        borderLeftWidth: i % 2 === 0 ? '3px' : '0',
                                        borderRightWidth: i % 2 === 1 ? '3px' : '0',
                                        borderRadius: i === 0 ? '8px 0 0 0' : i === 1 ? '0 8px 0 0' : i === 2 ? '0 0 0 8px' : '0 0 8px 0',
                                    }}
                                />
                            ))}
                        </>
                    )}

                    {/* Không có stream thì hiện overlay */}
                    {!isStarted && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                            <div className="text-center text-gray-400">
                                <Camera className="h-16 w-16 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">Camera chưa bắt đầu</p>
                            </div>
                        </div>
                    )}

                    {/* Loading camera */}
                    {isStarted && !isCameraReady && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                            <div className="flex flex-col items-center gap-2 text-white">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                                <p className="text-sm">Đang khởi động camera...</p>
                            </div>
                        </div>
                    )}

                    {/* Quality metrics overlay (top-right) */}
                    {isCameraReady && quality && (
                        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-xl p-3 text-xs space-y-1.5 min-w-[140px]">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-gray-400">Độ sáng</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${quality.brightnessOk ? 'bg-green-400' : 'bg-red-400'}`}
                                            style={{ width: `${Math.min((quality.brightness / 255) * 100, 100)}%` }}
                                        />
                                    </div>
                                    <span className={quality.brightnessOk ? 'text-green-400' : 'text-red-400'}>
                                        {Math.round(quality.brightness)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-gray-400">Độ nét</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${quality.sharpnessOk ? 'bg-green-400' : 'bg-red-400'}`}
                                            style={{ width: `${Math.min((quality.sharpness / 150) * 100, 100)}%` }}
                                        />
                                    </div>
                                    <span className={quality.sharpnessOk ? 'text-green-400' : 'text-red-400'}>
                                        {Math.round(quality.sharpness)}
                                    </span>
                                </div>
                            </div>
                            <div className="pt-1 border-t border-gray-700 flex items-center gap-1.5">
                                {isGood ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
                                ) : (
                                    <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                                )}
                                <span className={isGood ? 'text-green-400' : 'text-red-400'}>
                                    {isGood ? 'Đạt chuẩn' : 'Chưa đạt'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Zoom indicator */}
                    {zoom > 1 && (
                        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg px-2.5 py-1 text-xs text-white font-medium">
                            {zoom.toFixed(2)}x
                        </div>
                    )}
                </div>

                {/* Hint bar */}
                {isCameraReady && quality && (
                    <div
                        className={`px-4 py-2.5 text-sm text-center font-medium transition-colors ${isGood
                            ? 'bg-green-950/80 text-green-300 border-t border-green-900'
                            : 'bg-red-950/80 text-red-300 border-t border-red-900'
                            }`}
                    >
                        {quality.hint}
                    </div>
                )}

                {/* Controls */}
                <div className="bg-gray-900 px-5 py-4 border-t border-gray-800">
                    {!isStarted ? (
                        // Chưa bắt đầu
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={startCamera}
                        >
                            <Camera className="h-4 w-4 mr-2" />
                            Bắt đầu Camera
                        </Button>
                    ) : (
                        <div className="flex items-center gap-3">
                            {/* Zoom out */}
                            <button
                                onClick={handleZoomOut}
                                disabled={zoom <= 1}
                                className="p-2.5 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                title="Thu nhỏ"
                            >
                                <ZoomOut className="h-5 w-5" />
                            </button>

                            {/* Capture button */}
                            <button
                                onClick={handleCapture}
                                disabled={!isGood || isSaving}
                                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 ${isGood && !isSaving
                                    ? 'bg-green-500 hover:bg-green-400 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] scale-105'
                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : isGood ? (
                                    <>
                                        <Camera className="h-5 w-5" />
                                        CHỤP ({capturedCount > 0 ? `${capturedCount} ảnh` : 'Sẵn sàng'})
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="h-5 w-5" />
                                        Chưa đạt chuẩn
                                    </>
                                )}
                            </button>

                            {/* Zoom in */}
                            <button
                                onClick={handleZoomIn}
                                disabled={zoom >= 3}
                                className="p-2.5 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                title="Phóng to"
                            >
                                <ZoomIn className="h-5 w-5" />
                            </button>

                            {/* Toggle Torch */}
                            {hasTorch && (
                                <button
                                    onClick={toggleTorch}
                                    className={`p-2.5 rounded-xl transition-colors ${torch ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                                    title="Bật đèn Flash"
                                >
                                    {torch ? <Zap className="h-5 w-5" /> : <ZapOff className="h-5 w-5" />}
                                </button>
                            )}

                            {/* Toggle camera (nếu có nhiều camera) */}
                            {hasMultipleCameras && (
                                <button
                                    onClick={toggleCamera}
                                    className="p-2.5 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                                    title="Đổi camera"
                                >
                                    <RotateCcw className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Hướng dẫn zoom */}
                    {isCameraReady && !isGood && (
                        <div className="mt-3 flex gap-2 justify-center text-xs text-gray-500">
                            <span>💡 Dùng</span>
                            <button onClick={handleZoomIn} className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                <ZoomIn className="h-3.5 w-3.5" /> Zoom in
                            </button>
                            <span>hoặc</span>
                            <button onClick={handleZoomOut} className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                <ZoomOut className="h-3.5 w-3.5" /> Zoom out
                            </button>
                            <span>để điều chỉnh</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
