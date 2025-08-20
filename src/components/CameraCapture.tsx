'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';

interface CameraCaptureProps {
  selectedSize: string;
  onCapture: (image: string) => void;
  onBack: () => void;
}

const PHOTO_SIZES = {
  resume: { name: '履歴書用', width: 30, height: 40 },
  passport: { name: 'パスポート用', width: 35, height: 45 },
  license: { name: '運転免許証用', width: 24, height: 30 },
  mynumber: { name: 'マイナンバーカード用', width: 35, height: 45 },
};

export default function CameraCapture({ selectedSize, onCapture, onBack }: CameraCaptureProps) {
  const webcamRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  // 取得したビデオの実解像度（参考用）
  const [videoResolution, setVideoResolution] = useState<{w:number;h:number}>({w:0,h:0});

  const sizeInfo = PHOTO_SIZES[selectedSize as keyof typeof PHOTO_SIZES];

  useEffect(() => {
    // カメラの準備ができたらローディングを解除
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

    const capture = useCallback(() => {
    const videoEl = (webcamRef.current as any)?.video as HTMLVideoElement | undefined;
    const canvas = canvasRef.current;
    if (videoEl && canvas) {
      try {
        const vw = videoEl.videoWidth;
        const vh = videoEl.videoHeight;
        if (!vw || !vh) {
          setError('写真の撮影に失敗しました。もう一度お試しください。');
          return;
        }
        canvas.width = vw;
        canvas.height = vh;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setError('カメラエラーが発生しました。');
          return;
        }
        ctx.drawImage(videoEl, 0, 0, vw, vh);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        setImageSrc(dataUrl);
      } catch (err) {
        setError('カメラエラーが発生しました。');
      }
    }
  }, []);

    const retake = useCallback(() => {
    setImageSrc('');
    setError('');
  }, []);

    const confirm = useCallback(() => {
    if (imageSrc) {
      onCapture(imageSrc);
    }
  }, [imageSrc, onCapture]);

  // キーボードショートカット（ハンドラ定義後に設置）
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (!imageSrc && !isLoading && !error) {
          e.preventDefault();
          capture();
        }
      } else if (e.code === 'Enter') {
        if (imageSrc) {
          e.preventDefault();
          confirm();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        if (imageSrc) {
          e.preventDefault();
          retake();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [imageSrc, isLoading, error, capture, confirm, retake]);

  return (
    <div className="space-y-8">
      <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">写真を撮影</h2>
                <p className="text-lg text-gray-600 mb-4">フレーム中央に顔を合わせ、準備ができたら撮影してください。</p>
      </div>

      {/* 撮影エリア */}
      <div className="max-w-md mx-auto">
        <div className="relative aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
          {!imageSrc ? (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 z-10">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-blue mx-auto mb-4"></div>
                    <p className="text-gray-600">カメラを準備中...</p>
                  </div>
                </div>
              )}
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
                videoConstraints={{
                  facingMode: 'user',
                  width: { ideal: 1280 },
                  height: { ideal: 1706 }
                }}
                onUserMedia={() => {
                  setIsLoading(false);
                  try {
                    const videoEl = (webcamRef.current as any)?.video as HTMLVideoElement | undefined;
                    if (videoEl && videoEl.videoWidth) {
                      setVideoResolution({ w: videoEl.videoWidth, h: videoEl.videoHeight });
                    }
                  } catch {}
                }}
                onUserMediaError={() => {
                  setError('カメラにアクセスできません。カメラの許可を確認してください。');
                  setIsLoading(false);
                }}
              />
              
              {/* 撮影ガイド */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="relative w-full h-full">
                  {/* 顔のガイドライン（さらに軽く） */}
                  <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-48 h-64 border-2 border-white/40 border-dashed rounded-lg">
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-32 h-40 border border-white/30 rounded-full"></div>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-40 h-8 border border-white/20 rounded"></div>
                  </div>
                  
                  {/* ガイドテキスト（ガラス風チップ） */}
                  <div className="absolute bottom-24 left-4 right-4 text-center">
                    <div className="inline-block bg-white/15 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm ring-1 ring-white/25 shadow-md">
                      顔をガイドラインに合わせてください
                    </div>
                  </div>
                </div>
              </div>

              {/* フローティング撮影ボタン（プレビュー上） */}
              <div className="absolute inset-x-0 bottom-3 flex justify-center z-20">
                <button
                  onClick={capture}
                  disabled={isLoading || !!error}
                  className="pointer-events-auto w-16 h-16 rounded-full bg-white/15 text-white backdrop-blur-md ring-2 ring-white/30 shadow-lg hover:bg-white/25 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  aria-label="撮影する"
                  title="撮影する（Space キーでも撮影）"
                >
                  📷
                </button>
              </div>
            </>
          ) : (
            <img
              src={imageSrc}
              alt="撮影した写真"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}
      </div>

      {/* 撮影のヒント */}
      {!imageSrc && !error && (
        <div className="max-w-2xl mx-auto bg-blue-50 p-6 rounded-xl">
          <h3 className="font-bold text-lg text-gray-800 mb-3">📸 撮影のコツ</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• 明るい場所で撮影してください</li>
            <li>• 白い壁の前に立ってください</li>
            <li>• 正面を向いて、肩を平行に保ってください</li>
            <li>• 表情は自然な笑顔または真顔で</li>
          </ul>
        </div>
      )}

      {/* 操作ボタン */}
      <div className="flex justify-center gap-4">
        {!imageSrc ? (
          <>
            <button
              onClick={onBack}
              className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
            >
              ← 戻る
            </button>
                        <button
              onClick={capture}
              disabled={isLoading || !!error}
              className="px-8 py-3 bg-ocean-blue text-white rounded-xl hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📷 撮影する
            </button>
          </>
        ) : (
          <>
            <button
              onClick={retake}
              className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
            >
              🔄 撮り直す
            </button>
            <button
              onClick={confirm}
              className="px-8 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium"
            >
              ✓ この写真で決定
            </button>
          </>
        )}
      </div>
      {/* オフスクリーンキャプチャ用キャンバス */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
