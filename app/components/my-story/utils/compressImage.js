/**
 * Compress and resize an image file before upload.
 * Max 1200px longest side, JPEG at 0.8 quality.
 * Returns a new File ready for upload.
 */
export async function compressImage(file, { maxSize = 1200, quality = 0.8 } = {}) {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;

  let w = width;
  let h = height;
  if (w > maxSize || h > maxSize) {
    const ratio = Math.min(maxSize / w, maxSize / h);
    w = Math.round(w * ratio);
    h = Math.round(h * ratio);
  }

  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const blob = await canvas.convertToBlob({ type: "image/jpeg", quality });
  const name = file.name.replace(/\.[^.]+$/, ".jpg");
  return new File([blob], name, { type: "image/jpeg" });
}
