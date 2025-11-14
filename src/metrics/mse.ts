import { ComparisonResult, ImageDataLike } from "../types";
import { assertSameSize } from "../utils/image";


export function mseGray(a: ImageDataLike, b: ImageDataLike): ComparisonResult {
    assertSameSize(a, b);
    let sum = 0;
    const n = a.width * a.height; // single channel expected
    for (let i = 0; i < n; i++) {
        const d = a.data[i] - b.data[i];
        sum += d * d;
    }
    return { metric: "MSE", value: sum / n };
}