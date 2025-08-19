'use client';

import { useState, useRef, useEffect } from 'react';

interface LayoutGeneratorProps {
  imageSrc: string;
  selectedSize: string;
  onBack: () => void;
}

const PHOTO_SIZES = {
  resume: { name: '履歴書用', width: 40, height: 30, count: 4 },
  passport: { name: 'パスポート用', width: 45, height: 35, count: 2 },
  license: { name: '運転免許証用', width: 30, height: 24, count: 6 },
  mynumber: { name: 'マイナンバーカード用', width: 45, height: 35, count: 2 },
};

// L版サイズ（mm）
const L_SIZE = { width: 89, height: 127 };

export default function LayoutGenerator({ imageSrc, selectedSize, onBack }: LayoutGeneratorProps) {
  const [layoutImage, setLayoutImage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sizeInfo = PHOTO_SIZES[selectedSize as keyof typeof PHOTO_SIZES];

  useEffect(() => {
    generateLayout();
  }, [imageSrc, selectedSize]);

  const generateLayout = async () => {
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
      // レイアウト計算
      const margin = Math.round((5 / 25.4) * dpi); // 5mmマージン
      const cols = Math.floor((canvasWidth - margin) / (photoWidthPx + margin));
      const rows = Math.floor((canvasHeight - margin) / (photoHeightPx + margin));
      // L版に入るだけ最大枚数配置（countの上限は撤廃）
      const maxPhotos = Math.max(0, cols) * Math.max(0, rows);

      // 中央揃えのための開始位置計算
      const totalWidth = cols * photoWidthPx + (cols - 1) * margin;
      const totalHeight = Math.ceil(maxPhotos / cols) * photoHeightPx + (Math.ceil(maxPhotos / cols) - 1) * margin;
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

      // レイアウト画像を生成
      const layoutDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setLayoutImage(layoutDataUrl);
      setPlacedCount(maxPhotos);
      setIsGenerating(false);
    };

    img.src = imageSrc;
  };

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
          {sizeInfo?.name} を {sizeInfo?.count}枚配置しました
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
          <p>写真サイズ: {sizeInfo?.width}mm × {sizeInfo?.height}mm × {sizeInfo?.count}枚</p>
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
