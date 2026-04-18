import type { VideoAspectRatio } from '@reevio/types';

interface ParsedImageMetadata {
  readonly height: number;
  readonly mimeType: string;
  readonly width: number;
}

interface ImageValidationOptions {
  readonly aspectRatio: VideoAspectRatio;
  readonly bytes: Uint8Array;
  readonly expectedMimeType?: string;
}

const MINIMUM_IMAGE_DIMENSION = 512;
const SQUARE_RATIO_TOLERANCE = 0.2;
const NON_SQUARE_RATIO_TOLERANCE = 0.55;

export function inferFileExtension(mimeType: string): string {
  switch (mimeType.toLowerCase()) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return 'bin';
  }
}

export function validateImageBinary({
  aspectRatio,
  bytes,
  expectedMimeType,
}: ImageValidationOptions): ParsedImageMetadata {
  if (bytes.byteLength === 0) {
    throw new Error('Image payload is empty.');
  }

  const metadata = parseImageMetadata(bytes, expectedMimeType);
  validateImageDimensions(metadata, aspectRatio);

  return metadata;
}

function parseImageMetadata(
  bytes: Uint8Array,
  expectedMimeType?: string
): ParsedImageMetadata {
  const pngMetadata = tryParsePng(bytes);

  if (pngMetadata) {
    return ensureMimeType(pngMetadata, expectedMimeType);
  }

  const jpegMetadata = tryParseJpeg(bytes);

  if (jpegMetadata) {
    return ensureMimeType(jpegMetadata, expectedMimeType);
  }

  const webpMetadata = tryParseWebp(bytes);

  if (webpMetadata) {
    return ensureMimeType(webpMetadata, expectedMimeType);
  }

  throw new Error('Unsupported image format.');
}

function ensureMimeType(
  metadata: ParsedImageMetadata,
  expectedMimeType?: string
): ParsedImageMetadata {
  if (!expectedMimeType) {
    return metadata;
  }

  if (metadata.mimeType !== expectedMimeType.toLowerCase()) {
    throw new Error(
      `Image mime type mismatch. Expected "${expectedMimeType}" but received "${metadata.mimeType}".`
    );
  }

  return metadata;
}

function validateImageDimensions(
  metadata: ParsedImageMetadata,
  aspectRatio: VideoAspectRatio
): void {
  if (
    metadata.width < MINIMUM_IMAGE_DIMENSION ||
    metadata.height < MINIMUM_IMAGE_DIMENSION
  ) {
    throw new Error(
      `Image dimensions ${metadata.width}x${metadata.height} are below the minimum supported size.`
    );
  }

  const actualRatio = metadata.width / metadata.height;
  const targetRatio = getTargetAspectRatio(aspectRatio);
  const ratioDelta = Math.abs(actualRatio - targetRatio);
  const ratioTolerance =
    aspectRatio === '1:1' ? SQUARE_RATIO_TOLERANCE : NON_SQUARE_RATIO_TOLERANCE;

  if (ratioDelta > ratioTolerance) {
    throw new Error(
      `Image aspect ratio ${actualRatio.toFixed(2)} is too far from target ${targetRatio.toFixed(2)}.`
    );
  }

  if (aspectRatio === '16:9' && metadata.width <= metadata.height) {
    throw new Error('Landscape video requires a landscape image.');
  }

  if (
    (aspectRatio === '9:16' || aspectRatio === '4:5') &&
    metadata.width >= metadata.height
  ) {
    throw new Error('Portrait video requires a portrait image.');
  }
}

function getTargetAspectRatio(aspectRatio: VideoAspectRatio): number {
  switch (aspectRatio) {
    case '16:9':
      return 16 / 9;
    case '9:16':
      return 9 / 16;
    case '1:1':
      return 1;
    case '4:5':
      return 4 / 5;
  }
}

function tryParsePng(bytes: Uint8Array): ParsedImageMetadata | null {
  if (
    bytes.length < 24 ||
    bytes[0] !== 0x89 ||
    bytes[1] !== 0x50 ||
    bytes[2] !== 0x4e ||
    bytes[3] !== 0x47
  ) {
    return null;
  }

  return {
    mimeType: 'image/png',
    width: readUint32(bytes, 16),
    height: readUint32(bytes, 20),
  };
}

function tryParseJpeg(bytes: Uint8Array): ParsedImageMetadata | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    return null;
  }

  let offset = 2;

  while (offset + 8 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = bytes[offset + 1];
    const segmentLength = readUint16(bytes, offset + 2);

    if (segmentLength < 2) {
      break;
    }

    if (isStartOfFrameMarker(marker)) {
      return {
        mimeType: 'image/jpeg',
        height: readUint16(bytes, offset + 5),
        width: readUint16(bytes, offset + 7),
      };
    }

    offset += segmentLength + 2;
  }

  throw new Error('JPEG metadata is malformed.');
}

function tryParseWebp(bytes: Uint8Array): ParsedImageMetadata | null {
  if (
    bytes.length < 30 ||
    toAscii(bytes, 0, 4) !== 'RIFF' ||
    toAscii(bytes, 8, 4) !== 'WEBP'
  ) {
    return null;
  }

  const chunkType = toAscii(bytes, 12, 4);

  if (chunkType === 'VP8 ') {
    return {
      mimeType: 'image/webp',
      width: readUint16(bytes, 26) & 0x3fff,
      height: readUint16(bytes, 28) & 0x3fff,
    };
  }

  if (chunkType === 'VP8L') {
    const dimensionBits =
      (bytes[21] ?? 0) |
      ((bytes[22] ?? 0) << 8) |
      ((bytes[23] ?? 0) << 16) |
      ((bytes[24] ?? 0) << 24);

    return {
      mimeType: 'image/webp',
      width: (dimensionBits & 0x3fff) + 1,
      height: ((dimensionBits >> 14) & 0x3fff) + 1,
    };
  }

  if (chunkType === 'VP8X') {
    return {
      mimeType: 'image/webp',
      width: readUint24(bytes, 24) + 1,
      height: readUint24(bytes, 27) + 1,
    };
  }

  throw new Error('WEBP metadata is malformed.');
}

function isStartOfFrameMarker(marker: number | undefined): boolean {
  return (
    marker === 0xc0 ||
    marker === 0xc1 ||
    marker === 0xc2 ||
    marker === 0xc3 ||
    marker === 0xc5 ||
    marker === 0xc6 ||
    marker === 0xc7 ||
    marker === 0xc9 ||
    marker === 0xca ||
    marker === 0xcb ||
    marker === 0xcd ||
    marker === 0xce ||
    marker === 0xcf
  );
}

function readUint16(bytes: Uint8Array, offset: number): number {
  return ((bytes[offset] ?? 0) << 8) | (bytes[offset + 1] ?? 0);
}

function readUint24(bytes: Uint8Array, offset: number): number {
  return (
    (bytes[offset] ?? 0) |
    ((bytes[offset + 1] ?? 0) << 8) |
    ((bytes[offset + 2] ?? 0) << 16)
  );
}

function readUint32(bytes: Uint8Array, offset: number): number {
  return (
    ((bytes[offset] ?? 0) << 24) |
    ((bytes[offset + 1] ?? 0) << 16) |
    ((bytes[offset + 2] ?? 0) << 8) |
    (bytes[offset + 3] ?? 0)
  ) >>> 0;
}

function toAscii(bytes: Uint8Array, offset: number, length: number): string {
  return Buffer.from(bytes.subarray(offset, offset + length)).toString('ascii');
}
