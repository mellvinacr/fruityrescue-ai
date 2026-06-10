import React from 'react';

interface DetectionResultProps {
  result: any;
  onReset: () => void;
}

export function DetectionResult({ result, onReset }: DetectionResultProps) {
  const isFresh = result.status === 'fresh';

  return (
    <div className={`p-8 rounded-xl border ${isFresh ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
      <div className="flex items-center gap-4 mb-6">
        <div className={`text-4xl ${isFresh ? 'text-green-600' : 'text-orange-600'}`}>
          {isFresh ? '✅' : '⚠️'}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {isFresh ? 'Buah SEGAR terdeteksi!' : 'Buah BUSUK terdeteksi'}
        </h2>
      </div>
      
      <div className="space-y-4 text-gray-800">
        <p><span className="font-semibold">Kepercayaan AI:</span> {((result.ai_confidence || 0) * 100).toFixed(0)}%</p>
        <p><span className="font-semibold">Jenis buah:</span> {result.fruit_type || 'Tidak diketahui'}</p>
        
        {isFresh ? (
          <p className="text-green-800 font-medium bg-green-100 p-4 rounded-lg">
            Status: Buah akan dialokasikan ke PANTI ASUHAN terdekat
          </p>
        ) : (
          <div className="space-y-2 bg-orange-100 p-4 rounded-lg">
            <p className="font-medium text-orange-800">
              Rekomendasi: {result.ai_recommendation === 'livestock' ? 'Pakan Ternak' : 'Pupuk Kompos'}
            </p>
            <p className="text-sm text-orange-700">Alasan: {result.ai_reason}</p>
          </div>
        )}
      </div>
      
      <button 
        onClick={onReset} 
        className="mt-8 text-center block w-full py-3 bg-white border shadow-sm rounded-lg font-medium hover:bg-gray-50"
      >
        Donasi Lagi
      </button>
    </div>
  );
}
