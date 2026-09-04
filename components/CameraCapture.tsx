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
    <div className="bg-white rounded-[20px] border border-gray-100 p-4 md:p-6 shadow-sm mb-6">
      <h2 className="text-lg font-bold mb-5 flex items-center text-slate-900 tracking-tight">
        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mr-3">
          <ImageIcon className="text-amber-500" size={18} />
        </div>
        Snap Homework
      </h2>
      
      {!image ? (
        <label className="flex flex-col items-center justify-center w-full h-32 md:h-40 bg-gray-50/80 border-2 border-gray-200 border-dashed rounded-2xl cursor-pointer hover:bg-[#F8F9FC] transition-colors active:scale-[0.98] min-h-[44px]">
          <Camera size={28} className="text-slate-400 mb-2" />
          <span className="font-bold text-slate-500 text-sm">Open Camera</span>
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            className="hidden" 
            onChange={handleCapture} 
          />
        </label>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="Homework" className="w-full h-40 md:h-48 object-cover" />
          <button 
            onClick={() => setImage(null)}
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-slate-700 border border-white/50 px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all duration-200 active:scale-95 hover:bg-white min-h-[44px] md:min-h-[36px]"
          >
            Retake
          </button>
        </div>
      )}
    </div>
  );
}