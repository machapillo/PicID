'use client';

import { useState } from 'react';

const PHOTO_SIZES = {
  resume: {
    name: '履歴書用',
    width: 40,
    height: 30,
    unit: 'mm',
    description: '就職活動・転職活動に',
    color: 'bg-blue-50 border-blue-200 hover:border-blue-400'
  },
  passport: {
    name: 'パスポート用',
    width: 45,
    height: 35,
    unit: 'mm',
    description: '海外渡航申請に',
    color: 'bg-green-50 border-green-200 hover:border-green-400'
  },
  license: {
    name: '運転免許証用',
    width: 30,
    height: 24,
    unit: 'mm',
    description: '免許証更新・新規取得に',
    color: 'bg-orange-50 border-orange-200 hover:border-orange-400'
  },
  mynumber: {
    name: 'マイナンバーカード用',
    width: 45,
    height: 35,
    unit: 'mm',
    description: 'マイナンバーカード申請に',
    color: 'bg-purple-50 border-purple-200 hover:border-purple-400'
  },
};

interface SizeSelectorProps {
  onSelect: (size: string) => void;
}

export default function SizeSelector({ onSelect }: SizeSelectorProps) {
  const [selectedSize, setSelectedSize] = useState<string>('');

  const handleSelect = (sizeKey: string) => {
    setSelectedSize(sizeKey);
    setTimeout(() => onSelect(sizeKey), 300);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          証明写真のサイズを選択
        </h2>
        <p className="text-gray-600 text-lg">
          用途に応じて最適なサイズをお選びください
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {Object.entries(PHOTO_SIZES).map(([key, size]) => (
          <button
            key={key}
            onClick={() => handleSelect(key)}
            className={`p-6 border-2 rounded-xl transition-all duration-300 transform hover:scale-105 ${
              selectedSize === key
                ? 'border-ocean-blue bg-blue-50 shadow-lg scale-105'
                : size.color
            }`}
          >
            <div className="text-left">
              <h3 className="font-bold text-xl text-gray-800 mb-2">
                {size.name}
              </h3>
              <p className="text-gray-600 mb-3">
                {size.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-ocean-blue">
                  {size.width} × {size.height} {size.unit}
                </span>
                <div className="w-12 h-16 bg-white border-2 border-gray-300 rounded shadow-sm flex items-center justify-center">
                  <div 
                    className="bg-gray-200 rounded"
                    style={{
                      width: `${(size.width / 45) * 100}%`,
                      height: `${(size.height / 35) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="text-center text-sm text-gray-500 max-w-2xl mx-auto">
        <p>
          ※ 選択したサイズに応じて、撮影時のガイドが自動調整されます<br/>
          ※ L版用紙（89mm × 127mm）に最適な枚数でレイアウトされます
        </p>
      </div>
    </div>
  );
}
