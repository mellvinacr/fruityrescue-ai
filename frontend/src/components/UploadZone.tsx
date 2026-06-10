import React from 'react';

interface UploadZoneProps {
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  preview: string | null;
}

export function UploadZone({ onFileSelect, preview }: UploadZoneProps) {
  return (
    <div className="border-2 border-dashed border-green-200 rounded-xl p-8 text-center hover:bg-green-50 transition-colors">
      <input 
        required 
        type="file" 
        accept="image/*" 
        onChange={onFileSelect} 
        className="w-full" 
      />
      {preview && <img src={preview} alt="Preview" className="mt-4 max-h-48 mx-auto rounded-lg" />}
    </div>
  );
}
