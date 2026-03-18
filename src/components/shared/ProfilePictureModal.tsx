import { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import { X, Upload, ZoomIn, ZoomOut, ImagePlus } from 'lucide-react';
import { getCroppedImg } from '@/lib/cropImage';
import { Button } from '@/components/ui/Button';

interface Props {
  isOpen:  boolean;
  title?:  string;
  onClose: () => void;
  /** Receives the final base64 JPEG after cropping. Must return a promise (can resolve immediately). */
  onSave:  (base64: string) => Promise<void>;
}

export default function ProfilePictureModal({
  isOpen,
  title = 'Change Profile Picture',
  onClose,
  onSave,
}: Props) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset file input so the same file can be re-selected if needed
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setSaving(true);
    try {
      const base64 = await getCroppedImg(imageSrc, croppedAreaPixels);
      await onSave(base64);
      handleClose();
    } catch (err) {
      console.error('Crop/save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button
            onClick={handleClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!imageSrc ? (
          /* ── File picker state ── */
          <div className="p-8 flex flex-col items-center gap-5">
            <div className="w-28 h-28 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
              <ImagePlus className="h-10 w-10 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-800">Choose a photo</p>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP — you'll crop it next</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="hidden"
            />
            <Button
              variant="primary"
              leftIcon={<Upload className="h-4 w-4" />}
              onClick={() => fileInputRef.current?.click()}
            >
              Browse Device
            </Button>
          </div>
        ) : (
          /* ── Crop state ── */
          <>
            {/* Cropper canvas */}
            <div className="relative w-full bg-gray-900" style={{ height: 300 }}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Controls */}
            <div className="p-5 space-y-4">
              {/* Zoom slider */}
              <div className="flex items-center gap-3">
                <ZoomOut className="h-4 w-4 text-gray-400 shrink-0" />
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 accent-brand-600 h-1.5 rounded-full cursor-pointer"
                />
                <ZoomIn className="h-4 w-4 text-gray-400 shrink-0" />
              </div>
              <p className="text-xs text-gray-400 text-center">Drag to reposition · scroll or slide to zoom</p>

              {/* Action buttons */}
              <div className="flex gap-3 pt-1">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => { setImageSrc(null); setTimeout(() => fileInputRef.current?.click(), 50); }}
                  disabled={saving}
                >
                  Choose Different
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  loading={saving}
                  onClick={handleSave}
                >
                  Crop & Save
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
