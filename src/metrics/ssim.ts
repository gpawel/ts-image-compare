import { ssim as ssimFn } from "ssim.js";
import { ComparisonResult, ImageDataLike } from "../types";
import { assertSameSize } from "../utils/image";

function toSSIMInput(img: ImageDataLike, channels: 1 | 4) {
  const data = img.data instanceof Uint8Array ? img.data : Uint8Array.from(img.data);
  return { data, width: img.width, height: img.height, channels };
}

export function ssimGray(a: ImageDataLike, b: ImageDataLike): ComparisonResult {
  assertSameSize(a, b);
  const A = toSSIMInput(a, 1), B = toSSIMInput(b, 1);
  const result = ssimFn(A as any, B as any, { bitDepth: 8 });
  return { metric: "SSIM", value: result.mssim, details: { performance: result.performance } };
}

export function ssimRGBA(a: ImageDataLike, b: ImageDataLike): ComparisonResult {
  assertSameSize(a, b);
  const A = toSSIMInput(a, 4), B = toSSIMInput(b, 4);
  const result = ssimFn(A as any, B as any, { bitDepth: 8 });
  return { metric: "SSIM_RGBA", value: result.mssim, details: { performance: result.performance } };
}
