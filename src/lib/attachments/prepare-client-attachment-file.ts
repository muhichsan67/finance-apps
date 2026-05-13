import imageCompression from "browser-image-compression";
import {
  ALLOWED_ATTACHMENT_TYPES,
  AllowedAttachmentType,
  MAX_FILE_SIZE_BYTES,
  TARGET_IMAGE_SIZE_BYTES,
  UploadableAttachment,
} from "@/core/domain/attachments";

export function isAllowedAttachmentType(type: string): type is AllowedAttachmentType {
  return (ALLOWED_ATTACHMENT_TYPES as readonly string[]).includes(type);
}

export async function prepareClientAttachmentFile(file: File): Promise<UploadableAttachment> {
  if (!isAllowedAttachmentType(file.type)) {
    throw new Error(`Unsupported type: ${file.type} (${file.name})`);
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File exceeds 20MB: ${file.name}`);
  }
  if (file.type === "application/pdf") return { file, mimeType: file.type };

  const compressedBlob = await imageCompression(file, {
    maxSizeMB: TARGET_IMAGE_SIZE_BYTES / 1024 / 1024,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: 0.8,
    fileType: file.type,
  });
  const compressedFile = new File([compressedBlob], file.name, {
    type: file.type,
    lastModified: Date.now(),
  });
  if (compressedFile.size > TARGET_IMAGE_SIZE_BYTES) {
    throw new Error(`Image still exceeds 500KB after compression: ${file.name}`);
  }
  return { file: compressedFile, mimeType: file.type };
}
