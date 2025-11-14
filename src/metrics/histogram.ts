import { ComparisonResult, ImageDataLike } from "../types";
import { assertSameSize } from "../utils/image";


function histogramGray(img: ImageDataLike, bins = 256): Float64Array {
    const h = new Float64Array(bins);
    for (let i = 0; i < img.data.length; i++) h[img.data[i]] += 1;
    // normalize
    const n = img.data.length;
    for (let i = 0; i < bins; i++) h[i] /= n;
    return h;
}


function corr(x: Float64Array, y: Float64Array): number {
    const n = x.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    for (let i = 0; i < n; i++) {
        const xi = x[i], yi = y[i];
        sumX += xi; sumY += yi; sumXY += xi * yi; sumX2 += xi * xi; sumY2 += yi * yi;
    }
    const num = n * sumXY - sumX * sumY;
    const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    return den === 0 ? 0 : num / den; // [-1..1]
}


export function histogramCorrelationGray(a: ImageDataLike, b: ImageDataLike): ComparisonResult {
    assertSameSize(a, b);
    const ha = histogramGray(a);
    const hb = histogramGray(b);
    return { metric: "HistCorr", value: corr(ha, hb) };
}