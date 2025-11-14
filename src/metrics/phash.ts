import imghash from "imghash";
import { ComparisonResult } from "../types";


function hamming(a: string, b: string): number {
    const n = Math.min(a.length, b.length);
    let d = 0;
    for (let i = 0; i < n; i++) if (a[i] !== b[i]) d++;
    return d + Math.abs(a.length - b.length);
}


export async function pHashDistance(pathA: string, pathB: string): Promise<ComparisonResult> {
    const [ha, hb] = await Promise.all([
        imghash.hash(pathA, 16, "hex"), // 16x16 -> 256-bit (hex length 64)
        imghash.hash(pathB, 16, "hex")
    ]);
    const dist = hamming(ha, hb);
    return { metric: "pHashHamming", value: dist, details: { ha, hb } };
}