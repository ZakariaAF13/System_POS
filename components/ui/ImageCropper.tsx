"use client";

import React, { useEffect, useRef, useState } from "react";

type ImageCropperProps = {
  src: string;
  aspect?: number; // width / height, default 1 (square)
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
};

export default function ImageCropper({ src, aspect = 1, onCancel, onConfirm }: ImageCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const imageSize = useRef<{ width: number; height: number }>({ width: 0, height: 0 });

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      imageSize.current = { width: img.width, height: img.height };
      setImageLoaded(true);
      fitImageToContainer();
      draw();
    };
    img.src = src;
  }, [src]);

  useEffect(() => {
    draw();
  }, [zoom, position, imageLoaded]);

  const fitImageToContainer = () => {
    const size = 360; // viewport size
    if (!imgRef.current) return;
    const { width, height } = imgRef.current;
    const cropW = size;
    const cropH = Math.round(size / aspect);

    // initial zoom to cover viewport
    const scale = Math.max(cropW / width, cropH / height);
    setZoom(scale);
    setPosition({ x: 0, y: 0 });
  };

  const draw = () => {
    if (!canvasRef.current || !imgRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const viewW = 360;
    const viewH = Math.round(360 / aspect);

    canvasRef.current.width = viewW;
    canvasRef.current.height = viewH;

    ctx.clearRect(0, 0, viewW, viewH);
    ctx.save();

    // Fill background
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, viewW, viewH);

    // Draw image centered with current position and zoom
    const img = imgRef.current;
    const drawW = img.width * zoom;
    const drawH = img.height * zoom;
    const centerX = viewW / 2 + position.x;
    const centerY = viewH / 2 + position.y;
    const x = centerX - drawW / 2;
    const y = centerY - drawH / 2;

    ctx.drawImage(img, x, y, drawW, drawH);

    ctx.restore();
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart.current) return;
    setPosition({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };
  const onMouseUp = () => {
    setIsDragging(false);
    dragStart.current = null;
  };
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY;
    const factor = delta > 0 ? 1.05 : 0.95;
    setZoom((z) => Math.max(0.1, Math.min(10, z * factor)));
  };

  const confirm = async () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      if (blob) onConfirm(blob);
    }, "image/jpeg", 0.92);
  };

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative mx-auto rounded-md border border-border bg-black"
        style={{ width: 360, height: Math.round(360 / aspect), touchAction: "none" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
      >
        <canvas ref={canvasRef} className="block w-full h-full" />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0.1}
          max={10}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          className="w-full"
        />
        <span className="text-sm text-muted-foreground">Zoom</span>
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-3 py-2 border rounded">Batal</button>
        <button type="button" onClick={confirm} className="px-3 py-2 bg-primary text-primary-foreground rounded">Simpan</button>
      </div>
    </div>
  );
}
