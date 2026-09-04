'use client';
import { Camera, Image as ImageIcon } from 'lucide-react';

interface CameraCaptureProps {
  image: string | null;
  setImage: (img: string | null) => void;
}

export default function CameraCapture({ image, setImage }: CameraCaptureProps) {
  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm mb-6">
      <h2 className="text-base font-semibold mb-4 flex items-center text-slate-900">
        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center mr-3">
          <ImageIcon className="text-indigo-600" size={16} />
        </div>
        Snap Homework
      </h2>
      
      {!image ? (
        <label className="flex flex-col items-center justify-center w-full h-32 md:h-40 bg-gray-50 border-2 border-gray-200 border-dashed rounded-xl cursor-pointer hover:bg-gray-100 transition-colors min-h-[44px]">
          <Camera size={24} className="text-slate-400 mb-2" />
          <span className="font-medium text-slate-600 text-sm">Open Camera</span>
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            className="hidden" 
            onChange={handleCapture} 
          />
        </label>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="Homework" className="w-full h-40 md:h-48 object-cover" />
          <button 
            onClick={() => setImage(null)}
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-700 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm transition-colors hover:bg-white min-h-[44px] md:min-h-[36px]"
          >
            Retake
          </button>
        </div>
      )}
    </div>
  );
}