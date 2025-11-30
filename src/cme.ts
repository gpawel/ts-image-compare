// compare.ts
import sharp from "sharp";
import { ssim } from "ssim.js";
import { ImageData } from "canvas";   // <-- IMPORTANT


/* ============================================================
   Utility: Load & preprocess image into a consistent format
   ============================================================ */
async function loadImageAsMatrix(path: string) {
  const image = sharp(path).resize(256, 256).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  // Convert Uint8Array → Matrix of pixels [[r,g,b,a], ...]
  const pixels: number[][] = [];
  for (let i = 0; i < data.length; i += channels) {
    const pixel = [];
    for (let c = 0; c < channels; c++) {
      pixel.push(data[i + c] / 255); // normalize 0–1
    }
    pixels.push(pixel);
  }

  return {
    width,
    height,
    channels,
    pixels
  };
}

/* ============================================================
   1. Mean Squared Error (MSE)
   ============================================================ */
function mse(img1: number[][], img2: number[][]): number {
  let sum = 0;
  for (let i = 0; i < img1.length; i++) {
    const p1 = img1[i];
    const p2 = img2[i];

    for (let c = 0; c < p1.length; c++) {
      const diff = p1[c] - p2[c];
      sum += diff * diff;
    }
  }
  return sum / img1.length;
}

/* ============================================================
   2. Absolute Difference Mean
   ============================================================ */
function absDiffMean(img1: number[][], img2: number[][]): number {
  let sum = 0;
  for (let i = 0; i < img1.length; i++) {
    const p1 = img1[i];
    const p2 = img2[i];

    for (let c = 0; c < p1.length; c++) {
      sum += Math.abs(p1[c] - p2[c]);
    }
  }
  return sum / img1.length;
}

/* ============================================================
   3. Histogram Calculation & Correlation (Pearson)
   ============================================================ */
function buildHistogram(img: number[][], bins = 32): number[] {
  const hist = new Array(bins).fill(0);

  img.forEach(p => {
    const intensity = (p[0] + p[1] + p[2]) / 3; // grayscale intensity
    const idx = Math.min(bins - 1, Math.floor(intensity * bins));
    hist[idx] += 1;
  });

  // Normalize histogram to frequencies
  return hist.map(v => v / img.length);
}

function histogramCorrelation(h1: number[], h2: number[]): number {
  const avg1 = h1.reduce((a, b) => a + b) / h1.length;
  const avg2 = h2.reduce((a, b) => a + b) / h2.length;

  let num = 0;
  let den1 = 0;
  let den2 = 0;

  for (let i = 0; i < h1.length; i++) {
    const a = h1[i] - avg1;
    const b = h2[i] - avg2;

    num += a * b;
    den1 += a * a;
    den2 += b * b;
  }

  return num / Math.sqrt(den1 * den2);
}



/* Convert file path → ImageData object */
async function loadImageData(path: string): Promise<ImageData> {
  const image = sharp(path).ensureAlpha().raw();
  const { data, info } = await image.toBuffer({ resolveWithObject: true });

  return new ImageData(
    Uint8ClampedArray.from(data),
    info.width,
    info.height
  );
}


/* ============================================================
   4. SSIM (using ssim.js)
   ============================================================ */
async function computeSSIM(path1: string, path2: string): Promise<number> {
  const imgData1 = await loadImageData(path1);
  const imgData2 = await loadImageData(path2);

  const { mssim } = ssim(imgData1, imgData2);  // no await needed

  return mssim;
}


/* ============================================================
   Full Combined Metrics Pipeline
   ============================================================ */
export async function compareImages(imagePath1: string, imagePath2: string) {
  const img1 = await loadImageAsMatrix(imagePath1);
  const img2 = await loadImageAsMatrix(imagePath2);

  if (img1.width !== img2.width || img1.height !== img2.height) {
    throw new Error("Images are not matching in size after preprocessing.");
  }

  console.log("Computing similarity metrics...\n");

  // MSE
  const mseVal = mse(img1.pixels, img2.pixels);

  // Absolute Diff Mean
  const absDiffVal = absDiffMean(img1.pixels, img2.pixels);

  // Histograms
  const h1 = buildHistogram(img1.pixels);
  const h2 = buildHistogram(img2.pixels);
  const histCorr = histogramCorrelation(h1, h2);

  // SSIM
  const ssimVal = await computeSSIM(imagePath1, imagePath2);

  const results = [
    { metric: "MSE", value: mseVal },
    { metric: "SSIM", value: ssimVal },
    { metric: "HistCorr", value: histCorr },
    { metric: "AbsDiffMean", value: absDiffVal }
  ];

  return results;
}

/* ============================================================
   Example usage
   ============================================================ */
(async () => {
  const results = await compareImages("img1.png", "img2.png");
  console.log("\n=== Final Combined Metrics ===");
  console.table(results);
})();
