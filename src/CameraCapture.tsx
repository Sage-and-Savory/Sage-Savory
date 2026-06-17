import React, { useRef, useState, useEffect } from 'react';
import { Camera, X } from 'lucide-react';

export function CameraCapture({ onCapture, onClose }: { onCapture: (base64: string, mimeType: string) => void, onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        setError(err.message || 'Unable to access camera.');
      }
    }
    
    startCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleSnap = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        const [meta, base64] = dataUrl.split(',');
        const mimeType = meta.split(':')[1].split(';')[0];
        onCapture(base64, mimeType);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in">
      <div className="flex justify-between items-center p-6 text-white absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent">
        <button onClick={onClose} className="p-2 bg-white/20 rounded-full backdrop-blur-md">
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-black">
        {error ? (
          <div className="text-white text-center p-6">
            <p className="text-red-400 mb-4">{error}</p>
            <p>Please check your browser permissions.</p>
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-center bg-gradient-to-t from-black/80 to-transparent pb-16">
        <button 
          onClick={handleSnap}
          disabled={!!error}
          className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-gray-300 disabled:opacity-50 shadow-lg active:scale-95 transition-transform"
        >
          <div className="w-16 h-16 rounded-full border-4 border-black border-dashed flex items-center justify-center">
             <Camera className="w-8 h-8 text-black" />
          </div>
        </button>
      </div>
    </div>
  );
}
