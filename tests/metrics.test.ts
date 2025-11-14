import { describe, it, expect } from "vitest";
import { loadImageGray, toGrayscaleFromRGBA, mseGray } from "../src/index";


// Provide your own sample images under tests/assets
const A = "../assets/a.png";
const B = "../assets/b.png";


describe("metrics", () => {
    it("computes gray MSE", async () => {
        const [ga, gb] = await Promise.all([loadImageGray(A), loadImageGray(B)]);
        const { value } = mseGray(ga, gb);
        expect(value).toBeGreaterThanOrEqual(0);
    });
});