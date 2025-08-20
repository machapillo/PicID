'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface PhotoEditorProps {
  imageSrc: string;
  selectedSize: string;
  onEdit: (imageSrc: string) => void;
  onBack: () => void;
}

// 背景色は固定（白）にします
const DEFAULT_BG = '#ffffff';

export default function PhotoEditor({ imageSrc, selectedSize, onEdit, onBack }: PhotoEditorProps) {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isProcessing, setIsProcessing] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  // スライダー操作中はページスクロールを抑制
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);

  const processImage = useCallback(async () => {
    if (!canvasRef.current || !imageSrc) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();

    // Promise to handle image loading
    const loadImage = (imgEl: HTMLImageElement, src: string) => 
      new Promise<void>((resolve) => { 
        imgEl.onload = () => resolve();
        imgEl.src = src;
      });

    await loadImage(img, imageSrc);

    canvas.width = img.width;
    canvas.height = img.height;

    // 背景は常に白
    ctx.fillStyle = DEFAULT_BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply filters and draw the image
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const finalImage = canvas.toDataURL('image/jpeg');
    setProcessedImage(finalImage);
    setIsProcessing(false);

  }, [imageSrc, brightness, contrast]);

  useEffect(() => {
    processImage();
  }, [processImage]);

  // スライダー操作開始/終了でスクロール制御
  useEffect(() => {
    if (isDraggingSlider) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction as string;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      const handleEnd = () => setIsDraggingSlider(false);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchend', handleEnd, { passive: true });
      window.addEventListener('touchcancel', handleEnd, { passive: true });
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchend', handleEnd);
        window.removeEventListener('touchcancel', handleEnd);
      };
    }
  }, [isDraggingSlider]);

  const handleConfirm = () => {
    if (processedImage) {
      onEdit(processedImage);
    }
  };

  return (
    <div className="space-y-8 overscroll-contain">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">写真を編集</h2>
        <p className="text-lg text-gray-600">明るさ・コントラストを調整できます</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 text-center">プレビュー</h3>
          <div className="relative max-w-md mx-auto">
            <div className={`aspect-[3/4] rounded-2xl overflow-hidden shadow-lg bg-white`}>
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                   <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-blue mx-auto mb-4"></div>
                    <p className="text-gray-600">画像を処理中...</p>
                  </div>
                </div>
              )}
              {processedImage && (
                <img
                  src={processedImage}
                  alt="編集中の写真"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <h3 className="text-xl font-bold text-gray-800">編集オプション</h3>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">明るさ: {brightness}%</label>
            <input
              type="range" min="50" max="150" value={brightness}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBrightness(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider touch-none"
              onMouseDown={() => setIsDraggingSlider(true)}
              onMouseUp={() => setIsDraggingSlider(false)}
              onTouchStart={() => setIsDraggingSlider(true)}
              onTouchEnd={() => setIsDraggingSlider(false)}
              onTouchCancel={() => setIsDraggingSlider(false)}
              onTouchMove={(e) => { if (isDraggingSlider) e.preventDefault(); }}
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">コントラスト: {contrast}%</label>
            <input
              type="range" min="50" max="150" value={contrast}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContrast(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider touch-none"
              onMouseDown={() => setIsDraggingSlider(true)}
              onMouseUp={() => setIsDraggingSlider(false)}
              onTouchStart={() => setIsDraggingSlider(true)}
              onTouchEnd={() => setIsDraggingSlider(false)}
              onTouchCancel={() => setIsDraggingSlider(false)}
              onTouchMove={(e) => { if (isDraggingSlider) e.preventDefault(); }}
            />
          </div>

          <button
            onClick={() => { setBrightness(100); setContrast(100); }}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
          >
            🔄 設定をリセット
          </button>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={onBack}
          className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
        >
          ← 撮影に戻る
        </button>
        <button
          onClick={handleConfirm}
          disabled={isProcessing || !processedImage}
          className="px-8 py-3 bg-ocean-blue text-white rounded-xl hover:bg-blue-600 transition-colors font-medium disabled:opacity-50"
        >
          {isProcessing ? '処理中...' : '✓ 編集完了'}
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
