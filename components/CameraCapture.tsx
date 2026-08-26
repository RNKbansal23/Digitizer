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
    <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
      <h2 className="text-lg font-bold mb-5 flex items-center text-gray-900">
        <div className="bg-indigo-50 p-2 rounded-xl mr-3">
          <ImageIcon className="text-indigo-600" size={20} />
        </div>
        Snap Homework
      </h2>
      
      {!image ? (
        <label className="flex flex-col items-center justify-center w-full h-40 bg-indigo-50/50 border-2 border-indigo-200 border-dashed rounded-xl cursor-pointer hover:bg-indigo-50 transition-all duration-200 active:scale-[0.98] min-h-[44px]">
          <Camera size={32} className="text-indigo-500 mb-2" />
          <span className="font-semibold text-indigo-700">Open Camera</span>
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            className="hidden" 
            onChange={handleCapture} 
          />
        </label>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-gray-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="Homework" className="w-full h-48 object-cover" />
          <button 
            onClick={() => setImage(null)}
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-red-600 border border-red-100 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all duration-200 active:scale-[0.95] hover:bg-white"
          >
            Retake
          </button>
        </div>
      )}
    </div>
  );
}