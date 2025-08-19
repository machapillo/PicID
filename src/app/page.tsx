'use client';

import { useState } from 'react';
import SizeSelector from '@/components/SizeSelector';
import CameraCapture from '@/components/CameraCapture';
import PhotoEditor from '@/components/PhotoEditor';
import LayoutGenerator from '@/components/LayoutGenerator';

type AppStep = 'size' | 'camera' | 'editor' | 'layout';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<AppStep>('size');
  const [selectedSize, setSelectedSize] = useState<string>('');
    const [personImage, setPersonImage] = useState<string>('');
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [editedImage, setEditedImage] = useState<string>('');

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    setCurrentStep('camera');
  };

    const handleCapture = (images: { personImage: string; backgroundImage: string }) => {
    setPersonImage(images.personImage);
    setBackgroundImage(images.backgroundImage);
    setCurrentStep('editor');
  };

  const handleEdit = (imageSrc: string) => {
    setEditedImage(imageSrc);
    setCurrentStep('layout');
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'camera':
        setCurrentStep('size');
        break;
      case 'editor':
        setCurrentStep('camera');
        break;
      case 'layout':
        setCurrentStep('editor');
        break;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text ocean-gradient mb-4">
            Pashatto Print
          </h1>
          <p className="text-gray-600 text-lg">
            いつでも、どこでも、私の証明写真スタジオ
          </p>
        </div>

        {/* プログレスバー */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {['サイズ選択', '撮影', '編集', 'レイアウト'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index <= ['size', 'camera', 'editor', 'layout'].indexOf(currentStep)
                      ? 'bg-ocean-blue text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {step}
                </span>
                {index < 3 && (
                  <div
                    className={`w-16 h-1 mx-4 ${
                      index < ['size', 'camera', 'editor', 'layout'].indexOf(currentStep)
                        ? 'bg-ocean-blue'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 'size' && (
            <SizeSelector onSelect={handleSizeSelect} />
          )}

          {currentStep === 'camera' && (
            <CameraCapture
              selectedSize={selectedSize}
              onCapture={handleCapture}
              onBack={handleBack}
            />
          )}

          {currentStep === 'editor' && (
                        <PhotoEditor
              personImageSrc={personImage}
              backgroundImageSrc={backgroundImage}
              selectedSize={selectedSize}
              onEdit={handleEdit}
              onBack={handleBack}
            />
          )}

          {currentStep === 'layout' && (
            <LayoutGenerator
              imageSrc={editedImage}
              selectedSize={selectedSize}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </main>
  );
}
