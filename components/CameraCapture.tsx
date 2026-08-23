// CameraCapture component placeholder for snapping homework
import React, { useRef, useState } from 'react';

export default function CameraCapture({ onCapture }) {
  const videoRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
      }
    } catch (err) {
      console.error('Camera access denied', err);
    }
  };

  const capture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) onCapture(blob);
    }, 'image/jpeg');
  };

  return (
    <div className="flex flex-col items-center">
      <video ref={videoRef} autoPlay muted className="w-full max-w-md" />
      <div className="mt-4 space-x-2">
        <button onClick={startCamera} className="px-4 py-2 bg-blue-600 text-white rounded">
          Start Camera
        </button>
        <button onClick={capture} disabled={!hasPermission} className="px-4 py-2 bg-green-600 text-white rounded">
          Capture
        </button>
      </div>
    </div>
  );
}
