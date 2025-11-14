import { loadImageGray } from "./utils/image";
import { mseGray } from "./metrics/mse";
import { ssimGray } from "./metrics/ssim";
import { histogramCorrelationGray } from "./metrics/histogram";
import { meanAbsDiffGray } from "./metrics/adsdiff";   
import { pHashDistance } from "./metrics/phash";
import { pixelDiff } from "./diff/pixelmatch";


async function main(a: string, b: string) {
    const [ga, gb] = await Promise.all([loadImageGray(a), loadImageGray(b)]);
    console.log(mseGray(ga, gb));
    console.log(ssimGray(ga, gb));
    console.log(histogramCorrelationGray(ga, gb));
    console.log(meanAbsDiffGray(ga, gb));
    console.log(await pHashDistance(a, b));
    console.log(await pixelDiff(a, b, "diff.png"));  
}


main(process.argv[2], process.argv[3]).catch(err => {
    console.error(err);
    process.exit(1);
});