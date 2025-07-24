import { type Crop } from 'react-image-crop';

export async function getCroppedImg(
  image: HTMLImageElement,
  pixelCrop: Crop,
  fileName: string
): Promise<File | null> {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    console.error('Não foi possível obter o contexto 2D do canvas.');
    return null;
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  ctx.drawImage(
    image,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    0,
    0,
    400,
    400
  );

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          console.error('A conversão do canvas para blob falhou.');
          resolve(null);
          return;
        }
        const croppedFile = new File([blob], fileName, { type: 'image/jpeg' });
        resolve(croppedFile);
      },
      'image/jpeg',
      0.95 // Mantemos a qualidade em 95% (um valor alto)
    );
  });
}