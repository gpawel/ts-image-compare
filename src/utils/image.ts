import sharp from "sharp";
import { ImageDataLike, PixelBuffer } from "../types";


export async function loadImageRGBA(path: string): Promise<ImageDataLike> {
    const img = sharp(path).ensureAlpha();
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    return { width: info.width, height: info.height, data: new Uint8ClampedArray(data) };
}


export async function loadImageGray(path: string): Promise<ImageDataLike> {
    const img = sharp(path).greyscale().ensureAlpha();
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    // data is RGBA; take R and drop others for single channel
    const gray = new Uint8ClampedArray(info.width * info.height);
    for (let i = 0, j = 0; i < data.length; i += 4, j += 1) gray[j] = data[i];
    return { width: info.width, height: info.height, data: gray };
}


export async function resizeKeepAspect(
    path: string,
    maxDim: number
): Promise<ImageDataLike> {
    const img = sharp(path).resize({ width: maxDim, height: maxDim, fit: "inside" }).ensureAlpha();
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    return { width: info.width, height: info.height, data: new Uint8ClampedArray(data) };
}


export function toGrayscaleFromRGBA(img: ImageDataLike): ImageDataLike {
    const { width, height, data } = img;
    const out = new Uint8ClampedArray(width * height);
    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        // Luma (Rec. 601)
        out[j] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    }
    return { width, height, data: out };
}


export function assertSameSize(a: ImageDataLike, b: ImageDataLike) {
    if (a.width !== b.width || a.height !== b.height) {
        throw new Error(`Image sizes differ: (${a.width}x${a.height}) vs (${b.width}x${b.height})`);
    }
}