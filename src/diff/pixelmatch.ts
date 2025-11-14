import fs from "node:fs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import sharp from "sharp";
import { ComparisonResult } from "../types";


export async function pixelDiff(
    pathA: string,
    pathB: string,
    outPath: string,
    threshold = 0.1
): Promise<ComparisonResult> {
    // Ensure same size by resizing B to A (or vice versa). For strict tests, validate sizes first.
    const imgA = sharp(pathA).ensureAlpha();
    const info = await imgA.metadata();
    const bufA = await imgA.raw().toBuffer();
    const bufB = await sharp(pathB).ensureAlpha().resize({ width: info.width!, height: info.height! }).raw().toBuffer();


    const pngA = new PNG({ width: info.width!, height: info.height! });
    const pngB = new PNG({ width: info.width!, height: info.height! });
    pngA.data = new Uint8Array(bufA) as any;
    pngB.data = new Uint8Array(bufB) as any;


    const diffPNG = new PNG({ width: info.width!, height: info.height! });
    const numDiff = pixelmatch(pngA.data, pngB.data, diffPNG.data, info.width!, info.height!, { threshold });
    fs.writeFileSync(outPath, PNG.sync.write(diffPNG));
    const total = info.width! * info.height!;
    return { metric: "PixelDiffRatio", value: numDiff / total, details: { pixelsDifferent: numDiff, total } };
}