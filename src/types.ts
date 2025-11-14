export type PixelBuffer = Uint8ClampedArray; // RGBA or Gray


export interface ImageDataLike {
    width: number;
    height: number;
    // RGBA interleaved (0..255) or single-channel grayscale if noted
    data: PixelBuffer;
}


export interface ComparisonResult {
    metric: string;
    value: number; // larger-is-better for SSIM, hist corr; smaller-is-better for MSE/absdiff
    details?: Record<string, unknown>;
}