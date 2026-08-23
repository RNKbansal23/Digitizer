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
    <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
      <h2 className="text-lg font-bold mb-4 flex items-center">
        <ImageIcon className="mr-2 text-indigo-500" /> Snap Homework
      </h2>
      
      {!image ? (
        <label className="flex flex-col items-center justify-center w-full h-40 bg-indigo-50 border-2 border-indigo-300 border-dashed rounded-xl cursor-pointer hover:bg-indigo-100 transition">
          <Camera size={40} className="text-indigo-500 mb-2" />
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
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="Homework" className="w-full h-48 object-cover rounded-xl border" />
          <button 
            onClick={() => setImage(null)}
            className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md"
          >
            Retake
          </button>
        </div>
      )}
    </div>
  );
}