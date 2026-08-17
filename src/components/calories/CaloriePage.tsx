import { useState, useRef } from 'react';
import type { CalorieResult } from '../../types';
import { analyzeCalories } from '../../services/geminiService';

/**
 * 熱量計算頁面
 * 支援拍照/選擇照片 + 文字描述來分析食物熱量
 */
export function CaloriePage() {
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<CalorieResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!image && !description.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const responseText = await analyzeCalories(image, description);
      
      // Parse JSON response - handle potential markdown code blocks
      let jsonStr = responseText.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      
      const parsed: CalorieResult = JSON.parse(jsonStr);
      setResult(parsed);
    } catch (err) {
      console.error('[CaloriePage] Analysis error:', err);
      setError(err instanceof Error ? err.message : '分析失敗，請稍後再試');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const canAnalyze = (image || description.trim()) && !isAnalyzing;

  return (
    <div className="px-4 pt-4 pb-24 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">熱量計算</h1>

      {/* 照片區域 */}
      <section className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          食物照片
        </label>

        {image ? (
          <div className="relative rounded-xl overflow-hidden border border-gray-200">
            <img
              src={image}
              alt="已選擇的食物照片"
              className="w-full h-48 object-cover"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70 transition-colors"
              aria-label="移除照片"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex flex-col items-center justify-center gap-2 h-32 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-indigo-400 hover:text-indigo-500 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
              <span className="text-sm">選擇照片</span>
            </button>

            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 flex flex-col items-center justify-center gap-2 h-32 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-indigo-400 hover:text-indigo-500 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
              <span className="text-sm">拍照</span>
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="選擇照片檔案"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="使用相機拍照"
        />
      </section>

      {/* 文字描述 */}
      <section className="mb-6">
        <label htmlFor="food-description" className="block text-sm font-medium text-gray-700 mb-2">
          食物描述
        </label>
        <textarea
          id="food-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="描述你吃了什麼，例如：一碗滷肉飯加一碗味噌湯和燙青菜"
          className="w-full h-24 px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 placeholder-gray-400"
          maxLength={500}
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{description.length}/500</p>
      </section>

      {/* 分析按鈕 */}
      <button
        type="button"
        onClick={handleAnalyze}
        disabled={!canAnalyze}
        className={`w-full py-3 rounded-xl font-medium text-white transition-all duration-200 ${
          canAnalyze
            ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'
            : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        {isAnalyzing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            分析中...
          </span>
        ) : (
          '分析熱量'
        )}
      </button>

      {/* 錯誤訊息 */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* 分析結果 */}
      {result && (
        <section className="mt-8 animate-fade-in">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-5 text-white mb-4">
            <p className="text-sm opacity-80">估算總熱量</p>
            <p className="text-4xl font-bold mt-1">{result.totalCalories} <span className="text-lg font-normal">kcal</span></p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
            <h3 className="px-4 py-3 bg-gray-50 text-sm font-medium text-gray-700 border-b border-gray-200">
              營養明細
            </h3>
            <ul className="divide-y divide-gray-100">
              {result.items.map((item, index) => (
                <li key={index} className="px-4 py-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-800">{item.name}</span>
                    <span className="text-indigo-600 font-semibold">{item.calories} kcal</span>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>蛋白質 {item.protein}g</span>
                    <span>碳水 {item.carbs}g</span>
                    <span>脂肪 {item.fat}g</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <span className="text-amber-500 text-lg">💡</span>
              <p className="text-sm text-amber-800">{result.summary}</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
