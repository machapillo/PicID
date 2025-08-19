'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface PhotoEditorProps {
  personImageSrc: string;
  backgroundImageSrc: string;
  selectedSize: string;
  onEdit: (imageSrc: string) => void;
  onBack: () => void;
}

const BACKGROUND_COLORS = {
  white: { name: '白', color: '#ffffff', class: 'bg-white' },
  blue: { name: '青', color: '#e0f2fe', class: 'bg-sky-100' }, // A bit more vibrant blue
  gray: { name: 'グレー', color: '#f3f4f6', class: 'bg-gray-100' },
};

const REMOVAL_THRESHOLD = 45; // Sensitivity for background removal (0-255)

export default function PhotoEditor({ personImageSrc, backgroundImageSrc, selectedSize, onEdit, onBack }: PhotoEditorProps) {
  const [selectedBackground, setSelectedBackground] = useState('white');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isProcessing, setIsProcessing] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);

  const processImages = useCallback(async () => {
    if (!canvasRef.current || !personImageSrc || !backgroundImageSrc) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const personImg = new Image();
    const backgroundImg = new Image();

    // Promise to handle image loading
    const loadImage = (img: HTMLImageElement, src: string) => 
      new Promise<void>((resolve) => { 
        img.onload = () => resolve();
        img.src = src;
      });

    await Promise.all([loadImage(personImg, personImageSrc), loadImage(backgroundImg, backgroundImageSrc)]);

    canvas.width = personImg.width;
    canvas.height = personImg.height;

    // Get pixel data
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
    if (!tempCtx) return;

    tempCtx.drawImage(personImg, 0, 0);
    const personData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
    
    tempCtx.drawImage(backgroundImg, 0, 0);
    const bgData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);

    const resultData = ctx.createImageData(canvas.width, canvas.height);

    // Pixel-level comparison
    for (let i = 0; i < personData.data.length; i += 4) {
      const r1 = personData.data[i];
      const g1 = personData.data[i + 1];
      const b1 = personData.data[i + 2];

      const r2 = bgData.data[i];
      const g2 = bgData.data[i + 1];
      const b2 = bgData.data[i + 2];

      const diff = Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));

      if (diff > REMOVAL_THRESHOLD) {
        // Foreground (person)
        resultData.data[i] = r1;
        resultData.data[i + 1] = g1;
        resultData.data[i + 2] = b1;
        resultData.data[i + 3] = 255; // Alpha
      } else {
        // Background
        resultData.data[i + 3] = 0; // Transparent
      }
    }

    // Draw the result onto the main canvas with a new background color
    const bgColor = BACKGROUND_COLORS[selectedBackground as keyof typeof BACKGROUND_COLORS].color;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(resultData, 0, 0);

    // Create a temporary canvas to apply filters, as filters don't work on transparent pixels well
    const filterCanvas = document.createElement('canvas');
    filterCanvas.width = canvas.width;
    filterCanvas.height = canvas.height;
    const filterCtx = filterCanvas.getContext('2d');
    if (!filterCtx) return;

    filterCtx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    filterCtx.drawImage(canvas, 0, 0);

    const finalImage = filterCanvas.toDataURL('image/png'); // Use PNG for transparency
    setProcessedImage(finalImage);
    setIsProcessing(false);

  }, [personImageSrc, backgroundImageSrc, selectedBackground, brightness, contrast]);

  useEffect(() => {
    processImages();
  }, [processImages]);

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
