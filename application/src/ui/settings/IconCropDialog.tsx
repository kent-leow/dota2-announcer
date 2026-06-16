import { useState, useRef, useCallback, useEffect } from 'react';

interface IconCropDialogProps {
  imageFile: File;
  onConfirm: (dataUri: string) => void;
  onCancel: () => void;
}

interface CropRect {
  x: number;
  y: number;
  size: number;
}

const OUTPUT_SIZE = 64;

export function IconCropDialog({ imageFile, onConfirm, onCancel }: IconCropDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, size: 64 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const previewRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(imageFile);
    setImageSrc(url);
    const img = new Image();
    img.onload = () => {
      setImgEl(img);
      const minDim = Math.min(img.width, img.height);
      const size = Math.min(minDim, 256);
      setCrop({ x: 0, y: 0, size });
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  useEffect(() => {
    if (!imgEl || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const displayW = Math.min(imgEl.width, 300);
    const scale = displayW / imgEl.width;
    const displayH = imgEl.height * scale;
    canvas.width = displayW;
    canvas.height = displayH;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(imgEl, 0, 0, displayW, displayH);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, displayW, displayH);

    const sx = crop.x * scale;
    const sy = crop.y * scale;
    const ss = crop.size * scale;
    ctx.drawImage(imgEl, crop.x, crop.y, crop.size, crop.size, sx, sy, ss, ss);
    ctx.strokeStyle = '#c8aa6e';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, sy, ss, ss);
  }, [imgEl, crop]);

  useEffect(() => {
    if (!imgEl || !previewRef.current) return;
    const preview = previewRef.current;
    preview.width = OUTPUT_SIZE;
    preview.height = OUTPUT_SIZE;
    const ctx = preview.getContext('2d')!;
    ctx.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    ctx.drawImage(imgEl, crop.x, crop.y, crop.size, crop.size, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  }, [imgEl, crop]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imgEl || !canvasRef.current) return;
    setDragging(true);
    const rect = canvasRef.current.getBoundingClientRect();
    setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, [imgEl]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging || !imgEl || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const displayW = canvasRef.current.width;
    const scale = displayW / imgEl.width;

    const dx = (e.clientX - rect.left - dragStart.x) / scale;
    const dy = (e.clientY - rect.top - dragStart.y) / scale;

    setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });

    setCrop((prev) => {
      const maxX = imgEl.width - prev.size;
      const maxY = imgEl.height - prev.size;
      return {
        ...prev,
        x: Math.max(0, Math.min(maxX, prev.x + dx)),
        y: Math.max(0, Math.min(maxY, prev.y + dy)),
      };
    });
  }, [dragging, imgEl, dragStart]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!imgEl) return;
    const outCanvas = document.createElement('canvas');
    outCanvas.width = OUTPUT_SIZE;
    outCanvas.height = OUTPUT_SIZE;
    const ctx = outCanvas.getContext('2d')!;
    ctx.drawImage(imgEl, crop.x, crop.y, crop.size, crop.size, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    onConfirm(outCanvas.toDataURL('image/png'));
  }, [imgEl, crop, onConfirm]);

  if (!imageSrc) return null;

  return (
    <div data-testid="icon-crop-dialog" className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-dota-dark border border-dota-gold/30 rounded-lg p-5 max-w-sm w-full">
        <h3 className="text-dota-gold text-sm font-semibold mb-3 uppercase tracking-wide">Crop Icon</h3>
        <div className="flex flex-col items-center gap-3">
          <canvas
            ref={canvasRef}
            data-testid="crop-canvas"
            className="cursor-move rounded border border-dota-gold/20"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          <div className="flex items-center gap-3">
            <span className="text-dota-grey text-xs">Preview:</span>
            <canvas ref={previewRef} data-testid="crop-preview" className="border border-dota-gold/20 rounded" width={64} height={64} />
          </div>
          <div className="flex items-center gap-2 w-full">
            <label className="text-dota-grey text-xs">Size:</label>
            <input
              type="range"
              min={32}
              max={imgEl ? Math.min(imgEl.width, imgEl.height) : 256}
              value={crop.size}
              onChange={(e) => {
                const newSize = parseInt(e.target.value, 10);
                setCrop((prev) => ({
                  x: Math.min(prev.x, (imgEl?.width ?? 256) - newSize),
                  y: Math.min(prev.y, (imgEl?.height ?? 256) - newSize),
                  size: newSize,
                }));
              }}
              className="flex-1"
              data-testid="crop-size-slider"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onCancel}
            data-testid="crop-cancel"
            className="px-3 py-1.5 rounded text-xs font-medium bg-red-600/20 text-red-400 border border-red-500/40 hover:bg-red-600/30 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            data-testid="crop-confirm"
            className="px-3 py-1.5 rounded text-xs font-medium bg-green-600/20 text-green-400 border border-green-500/40 hover:bg-green-600/30 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
