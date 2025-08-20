'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface LayoutGeneratorProps {
  imageSrc: string;
  selectedSize: string;
  onBack: () => void;
}

const PHOTO_SIZES = {
  resume:   { name: '履歴書用',       width: 30, height: 40, count: 4 },
  passport: { name: 'パスポート用',   width: 35, height: 45, count: 2 },
  license:  { name: '運転免許証用',   width: 24, height: 30, count: 6 },
  mynumber: { name: 'マイナンバーカード用', width: 35, height: 45, count: 2 },
};

// L版サイズ（mm）
const L_SIZE = { width: 89, height: 127 };

export default function LayoutGenerator({ imageSrc, selectedSize, onBack }: LayoutGeneratorProps) {
  const [layoutImage, setLayoutImage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [placedCount, setPlacedCount] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // 選択された余白（mm）を表示用に保持
  const [usedMarginMm, setUsedMarginMm] = useState<number>(5);
  // UI: スケール描画の有無とマージン自動/手動
  const [showScale, setShowScale] = useState<boolean>(false);
  const [useAutoMargin, setUseAutoMargin] = useState<boolean>(true);
  const [manualMarginMm, setManualMarginMm] = useState<number>(5);

  const sizeInfo = PHOTO_SIZES[selectedSize as keyof typeof PHOTO_SIZES];

  const generateLayout = useCallback(async () => {
    if (!canvasRef.current || !sizeInfo) return;

    setIsGenerating(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // L版サイズをピクセルに変換（300DPI基準）
    const dpi = 300;
    const canvasWidth = Math.round((L_SIZE.width / 25.4) * dpi);
    const canvasHeight = Math.round((L_SIZE.height / 25.4) * dpi);
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // 白背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 写真サイズをピクセルに変換
    const photoWidthPx = Math.round((sizeInfo.width / 25.4) * dpi);
    const photoHeightPx = Math.round((sizeInfo.height / 25.4) * dpi);

    const img = new Image();
    img.onload = () => {
      // マージン（mm）決定：自動（2〜6mmから最大配置枚数） or 手動
      const mmToPx = (mm: number) => Math.round((mm / 25.4) * dpi);
      let chosen = { marginMm: 5, cols: 0, rows: 0, count: 0 };

      if (useAutoMargin) {
        for (let m = 2; m <= 6; m++) {
          const marginPx = mmToPx(m);
          const cols = Math.floor((canvasWidth - marginPx) / (photoWidthPx + marginPx));
          const rows = Math.floor((canvasHeight - marginPx) / (photoHeightPx + marginPx));
          const count = Math.max(0, cols) * Math.max(0, rows);
          if (count > chosen.count) {
            chosen = { marginMm: m, cols, rows, count };
          }
        }
        if (chosen.count === 0) {
          const m = 5;
          const marginPx = mmToPx(m);
          const cols = Math.max(0, Math.floor((canvasWidth - marginPx) / (photoWidthPx + marginPx)));
          const rows = Math.max(0, Math.floor((canvasHeight - marginPx) / (photoHeightPx + marginPx)));
          chosen = { marginMm: m, cols, rows, count: cols * rows };
        }
      } else {
        const m = Math.min(10, Math.max(2, Math.round(manualMarginMm)));
        const marginPx = mmToPx(m);
        const cols = Math.floor((canvasWidth - marginPx) / (photoWidthPx + marginPx));
        const rows = Math.floor((canvasHeight - marginPx) / (photoHeightPx + marginPx));
        const count = Math.max(0, cols) * Math.max(0, rows);
        chosen = { marginMm: m, cols, rows, count };
      }

      const margin = mmToPx(chosen.marginMm);
      const cols = chosen.cols;
      const rows = chosen.rows;
      // L版に入るだけ最大枚数配置
      const maxPhotos = cols * rows;

      // 中央揃えのための開始位置計算
      const totalWidth = cols * photoWidthPx + Math.max(0, cols - 1) * margin;
      const totalHeight = rows * photoHeightPx + Math.max(0, rows - 1) * margin;
      const startX = (canvasWidth - totalWidth) / 2;
      const startY = (canvasHeight - totalHeight) / 2;

      // 写真を配置
      for (let i = 0; i < maxPhotos; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = startX + col * (photoWidthPx + margin);
        const y = startY + row * (photoHeightPx + margin);

        // アスペクト比維持：ターゲット比にセンタークロップしてから描画
        const targetRatio = photoWidthPx / photoHeightPx; // < 1 で縦長、> 1 で横長
        const srcRatio = img.width / img.height;
        let sx = 0, sy = 0, sw = img.width, sh = img.height;
        if (srcRatio > targetRatio) {
          // 画像が横に広い→左右をトリミング
          sh = img.height;
          sw = Math.round(sh * targetRatio);
          sx = Math.round((img.width - sw) / 2);
          sy = 0;
        } else if (srcRatio < targetRatio) {
          // 画像が縦に長い→上下をトリミング
          sw = img.width;
          sh = Math.round(sw / targetRatio);
          sx = 0;
          sy = Math.round((img.height - sh) / 2);
        }
        ctx.drawImage(img, sx, sy, sw, sh, x, y, photoWidthPx, photoHeightPx);

        // トンボ（切り取り線）を描画
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(x, y, photoWidthPx, photoHeightPx);
      }

      // 10mmスケールマーカー（任意）
      if (showScale) {
        const tenMmPx = Math.round((10 / 25.4) * dpi);
        const pad = Math.round((5 / 25.4) * dpi);
        const sx = pad;
        const sy = canvasHeight - pad * 2;
        ctx.setLineDash([]);
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;
        // ベースライン
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + tenMmPx, sy);
        ctx.stroke();
        // 端の目盛り
        ctx.beginPath();
        ctx.moveTo(sx, sy - pad / 2);
        ctx.lineTo(sx, sy + pad / 2);
        ctx.moveTo(sx + tenMmPx, sy - pad / 2);
        ctx.lineTo(sx + tenMmPx, sy + pad / 2);
        ctx.stroke();
        // ラベル
        ctx.fillStyle = '#333333';
        ctx.font = `${Math.max(10, Math.round(pad * 0.7))}px sans-serif`;
        ctx.fillText('10mm', sx + tenMmPx + Math.round(pad * 0.3), sy + 4);
      }

      // レイアウト画像を生成
      const layoutDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setLayoutImage(layoutDataUrl);
      setPlacedCount(maxPhotos);
      setUsedMarginMm(chosen.marginMm);
      setIsGenerating(false);
    };

    img.src = imageSrc;
  }, [canvasRef, imageSrc, sizeInfo]);

  useEffect(() => {
    generateLayout();
  }, [generateLayout]);

  const downloadImage = () => {
    if (!layoutImage) return;

    const link = document.createElement('a');
    link.download = `証明写真_${sizeInfo.name}_${new Date().toISOString().split('T')[0]}.jpg`;
    link.href = layoutImage;
    link.click();
  };

  const printImage = () => {
    if (!layoutImage) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>証明写真印刷</title>
            <style>
              body { margin: 0; padding: 0; }
              img { width: 100%; height: auto; }
              @media print {
                body { margin: 0; }
                img { width: 89mm; height: 127mm; object-fit: contain; }
              }
            </style>
          </head>
          <body>
            <img src="${layoutImage}" alt="証明写真" />
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          L版レイアウト完成！
        </h2>
        <p className="text-lg text-gray-600">
          {sizeInfo?.name} を {placedCount}枚配置しました
        </p>
      </div>

      {/* レイアウトプレビュー */}
      <div className="max-w-md mx-auto">
        <div className="bg-white p-4 rounded-2xl shadow-lg border">
          {isGenerating ? (
            <div className="aspect-[89/127] flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-blue mx-auto mb-4"></div>
                <p className="text-gray-600">レイアウト生成中...</p>
              </div>
            </div>
          ) : layoutImage ? (
            <img
              src={layoutImage}
              alt="L版レイアウト"
              className="w-full h-auto rounded-lg"
            />
          ) : (
            <div className="aspect-[89/127] bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">レイアウトを生成できませんでした</p>
            </div>
          )}
        </div>
        
        {/* サイズ情報 */}
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>L版サイズ: 89mm × 127mm</p>
          <p>写真サイズ: {sizeInfo?.width}mm × {sizeInfo?.height}mm</p>
          <p>配置枚数: {placedCount}枚（余白 {usedMarginMm}mm）</p>
        </div>

        {/* オプション設定 */}
        <div className="mt-6 bg-gray-50 p-4 rounded-xl border text-sm">
          <div className="flex items-center gap-3 mb-3">
            <input
              id="scale-toggle"
              type="checkbox"
              className="w-4 h-4"
              checked={showScale}
              onChange={(e) => setShowScale(e.target.checked)}
            />
            <label htmlFor="scale-toggle" className="text-gray-800">10mmスケールを描画</label>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-2 mb-3 sm:mb-0">
              <input
                id="auto-margin"
                type="radio"
                name="margin-mode"
                className="w-4 h-4"
                checked={useAutoMargin}
                onChange={() => setUseAutoMargin(true)}
              />
              <label htmlFor="auto-margin" className="text-gray-800">余白 自動（2〜6mmで最適化）</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="manual-margin"
                type="radio"
                name="margin-mode"
                className="w-4 h-4"
                checked={!useAutoMargin}
                onChange={() => setUseAutoMargin(false)}
              />
              <label htmlFor="manual-margin" className="text-gray-800">余白 手動:</label>
              <input
                type="range"
                min={2}
                max={10}
                value={manualMarginMm}
                onChange={(e) => setManualMarginMm(Number(e.target.value))}
                disabled={useAutoMargin}
                className="w-40"
              />
              <span className={`w-10 text-right ${useAutoMargin ? 'text-gray-400' : 'text-gray-800'}`}>{manualMarginMm}mm</span>
            </div>
          </div>

          <div className="mt-3 text-right">
            <button
              onClick={generateLayout}
              disabled={isGenerating}
              className="px-4 py-2 bg-white text-gray-800 rounded-lg border hover:bg-gray-100 disabled:opacity-50"
            >
              再生成
            </button>
          </div>
        </div>
      </div>

      {/* 印刷ガイド */}
      <div className="max-w-2xl mx-auto bg-green-50 p-6 rounded-xl">
        <h3 className="font-bold text-lg text-gray-800 mb-3">🖨️ 印刷ガイド</h3>
        <div className="space-y-3 text-gray-700">
          <div>
            <h4 className="font-semibold">自宅プリンターの場合：</h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• 用紙設定：L版（89mm × 127mm）</li>
              <li>• 印刷品質：高品質または写真品質</li>
              <li>• 用紙種類：写真用紙（光沢またはマット）</li>
              <li>• 余白設定：余白なし（フチなし印刷）</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">コンビニプリントの場合：</h4>
            <ul className="ml-4 space-y-1 text-sm">
              <li>• USBメモリやスマホアプリで画像を持参</li>
              <li>• L版サイズを選択</li>
              <li>• 写真用紙で印刷</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 操作ボタン */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={onBack}
          className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
        >
          ← 編集に戻る
        </button>
        
        <button
          onClick={downloadImage}
          disabled={!layoutImage || isGenerating}
          className="px-8 py-3 bg-ocean-blue text-white rounded-xl hover:bg-blue-600 transition-colors font-medium disabled:opacity-50"
        >
          💾 画像をダウンロード
        </button>
        
        <button
          onClick={printImage}
          disabled={!layoutImage || isGenerating}
          className="px-8 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium disabled:opacity-50"
        >
          🖨️ 印刷する
        </button>
      </div>

      {/* 完了メッセージ */}
      {layoutImage && !isGenerating && (
        <div className="text-center">
          <div className="inline-flex items-center px-6 py-3 bg-green-100 text-green-800 rounded-xl">
            <span className="text-2xl mr-2">🎉</span>
            <span className="font-medium">証明写真の作成が完了しました！</span>
          </div>
        </div>
      )}

      {/* 非表示のキャンバス */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
