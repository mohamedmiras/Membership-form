import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { X, Check } from 'lucide-react';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
}

export default function ImageCropper({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  useEffect(() => {
    // Prevent scrolling of background page while cropping
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<Blob | null> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Fill white background in case the user zooms out and leaves empty space
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw image using destination coordinates to handle negative source offsets safely
    ctx.drawImage(
      image,
      -pixelCrop.x,
      -pixelCrop.y,
      image.width,
      image.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg');
    });
  };

  const handleSave = async () => {
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImageBlob) {
        onCropComplete(croppedImageBlob);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const cropperContent = (
    <div className="fixed inset-0 bg-black/90 z-[9999] flex flex-col md:items-center md:justify-center md:p-8 backdrop-blur-sm">
      {/* Inner container to constrain size on laptop */}
      <div className="flex flex-col w-full h-full md:w-[450px] md:h-[650px] bg-black md:rounded-3xl overflow-hidden md:shadow-2xl md:border md:border-gray-800">
        
        {/* Cropper Container - flex-1 with min-h-0 prevents flexbox height bugs on iOS/Safari */}
        <div className="relative flex-1 min-h-0 w-full">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            objectFit="cover"
            restrictPosition={false}
            onCropChange={setCrop}
            onCropComplete={handleCropComplete}
            onZoomChange={setZoom}
            style={{
              containerStyle: {
                backgroundColor: 'transparent'
              },
              mediaStyle: {
                maxWidth: 'none',
                maxHeight: 'none',
              }
            }}
          />
        </div>
        
        {/* Controls Container - shrink-0 ensures it takes its natural height without getting cut off */}
        <div className="shrink-0 bg-white p-5 sm:p-6 flex flex-col gap-5 border-t md:border-t-0 shadow-2xl pb-safe">
        <div className="w-full">
           <label className="text-sm font-medium text-gray-700 block mb-2 text-center">Drag to position, use slider to zoom</label>
           <input
             type="range"
             value={zoom}
             min={1}
             max={3}
             step={0.1}
             onChange={(e) => setZoom(Number(e.target.value))}
             className="w-full accent-primary"
           />
        </div>
        <div className="flex gap-4 w-full">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors border-2 border-gray-200"
          >
            <X className="w-5 h-5" /> Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white bg-primary hover:bg-primary-dark transition-colors shadow-lg"
          >
            <Check className="w-5 h-5" /> Confirm Crop
          </button>
        </div>
      </div>
        </div>
      </div>
    </div>
  );

  return createPortal(cropperContent, document.body);
}
