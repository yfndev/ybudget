import heic2any from "heic2any";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const JPEG_QUALITY = 0.7;

export class FileConversionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileConversionError";
  }
}

async function convertPNGtoJPG(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new FileConversionError("Canvas context nicht verfügbar"));
          return;
        }

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new FileConversionError("PNG Conversion fehlgeschlagen"));
              return;
            }
            const convertedFile = new File(
              [blob],
              file.name.replace(/\.png$/i, ".jpg"),
              { type: "image/jpeg" }
            );
            resolve(convertedFile);
          },
          "image/jpeg",
          JPEG_QUALITY
        );
      };

      img.onerror = () => reject(new FileConversionError("Bild konnte nicht geladen werden"));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new FileConversionError("Datei konnte nicht gelesen werden"));
    reader.readAsDataURL(file);
  });
}

async function convertHEICtoJPG(file: File): Promise<File> {
  try {
    const convertedBlob = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: JPEG_QUALITY,
    });

    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

    return new File(
      [blob],
      file.name.replace(/\.heic$/i, ".jpg"),
      { type: "image/jpeg" }
    );
  } catch (error) {
    throw new FileConversionError("HEIC Conversion fehlgeschlagen");
  }
}

export async function convertToJPG(file: File): Promise<File> {
  if (file.size > MAX_FILE_SIZE) {
    throw new FileConversionError("Datei ist zu groß (max. 10MB)");
  }

  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
    return file;
  }

  if (fileType === "image/heic" || fileName.endsWith(".heic")) {
    return convertHEICtoJPG(file);
  }

  if (fileType === "image/png" || fileName.endsWith(".png")) {
    return convertPNGtoJPG(file);
  }

  if (fileType === "image/jpeg" || fileType === "image/jpg" || fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
    return file;
  }

  throw new FileConversionError("Nicht unterstütztes Dateiformat");
}

export function isValidFileType(file: File): boolean {
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/heic", "application/pdf"];
  const validExtensions = [".jpg", ".jpeg", ".png", ".heic", ".pdf"];

  const hasValidType = validTypes.includes(file.type.toLowerCase());
  const hasValidExtension = validExtensions.some((ext) =>
    file.name.toLowerCase().endsWith(ext)
  );

  return hasValidType || hasValidExtension;
}
