'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface PhotoEditorProps {
  imageSrc: string;
  selectedSize: string;
  onEdit: (imageSrc: string) => void;
  onBack: () => void;
}

const BACKGROUND_COLORS = {
  white: { name: '白', color: '#ffffff', class: 'bg-white' },
  blue: { name: '青', color: '#e0f2fe', class: 'bg-sky-100' }, // A bit more vibrant blue
  gray: { name: 'グレー', color: '#f3f4f6', class: 'bg-gray-100' },
};

export default function PhotoEditor({ imageSrc, selectedSize, onEdit, onBack }: PhotoEditorProps) {
  const [selectedBackground, setSelectedBackground] = useState('white');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isProcessing, setIsProcessing] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);

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

    // Fill background color
    const bgColor = BACKGROUND_COLORS[selectedBackground as keyof typeof BACKGROUND_COLORS].color;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply filters and draw the image
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const finalImage = canvas.toDataURL('image/jpeg');
    setProcessedImage(finalImage);
    setIsProcessing(false);

  }, [imageSrc, selectedBackground, brightness, contrast]);

  useEffect(() => {
    processImage();
  }, [processImage]);

  const handleConfirm = () => {
    if (processedImage) {
      onEdit(processedImage);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">写真を編集</h2>
        <p className="text-lg text-gray-600">背景を自動で切り抜き、きれいに仕上げます</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 text-center">プレビュー</h3>
          <div className="relative max-w-md mx-auto">
            <div className={`aspect-[3/4] rounded-2xl overflow-hidden shadow-lg ${BACKGROUND_COLORS[selectedBackground as keyof typeof BACKGROUND_COLORS].class}`}>
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
            <label className="block text-sm font-medium text-gray-700">背景色</label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(BACKGROUND_COLORS).map(([key, bg]) => (
                <button
                  key={key}
                  onClick={() => setSelectedBackground(key)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedBackground === key ? 'border-ocean-blue shadow-lg' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-full h-12 rounded-lg ${bg.class} border border-gray-300 mb-2`}></div>
                  <span className="text-sm font-medium text-gray-700">{bg.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">明るさ: {brightness}%</label>
            <input
              type="range" min="50" max="150" value={brightness}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBrightness(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">コントラスト: {contrast}%</label>
            <input
              type="range" min="50" max="150" value={contrast}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContrast(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <button
            onClick={() => { setBrightness(100); setContrast(100); setSelectedBackground('white'); }}
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
