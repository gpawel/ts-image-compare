import { ComparisonResult, ImageDataLike } from "../types";
import { assertSameSize } from "../utils/image";


export function meanAbsDiffGray(a: ImageDataLike, b: ImageDataLike): ComparisonResult {
    assertSameSize(a, b);
    let sum = 0;
    const n = a.width * a.height;
    for (let i = 0; i < n; i++) sum += Math.abs(a.data[i] - b.data[i]);
    return { metric: "AbsDiffMean", value: sum / n };
}