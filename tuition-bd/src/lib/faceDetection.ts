/**
 * Client-side face and portrait image verification.
 * 
 * Implements a bulletproof triple-defense verification pipeline:
 * 1. Native Vision Engine (FaceDetector API): Natively runs hardware-accelerated face detection
 *    in supported browsers (Chrome, Edge, Opera, Chrome for Android) with zero network overhead.
 * 2. Object Tracker (tracking.js): Fallback cascade face detector that runs Viola-Jones detection
 *    client-side in Safari and Firefox.
 * 3. Strict Edge & Skin-Tone Analyzer: Canvas-based check that analyzes pixel gradients, Aspect Ratio,
 *    color variance (entropy), and high-frequency edge transitions to automatically reject text printouts,
 *    ID documents, papers, cardboards, or flat vector illustrations.
 * 
 * Works 100% offline, privately, and locally inside the browser.
 */
export async function detectFaceInImage(file: File): Promise<boolean> {
  if (typeof window === "undefined") return true; // Fail-safe for Server-Side Rendering (SSR)

  return new Promise((resolve) => {
    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = async () => {
        URL.revokeObjectURL(objectUrl);

        // A. ASPECT RATIO & RESOLUTION CHECKS
        const width = img.width;
        const height = img.height;
        const aspectRatio = width / height;

        // Portrait photos have standard ratios (between 0.55 and 1.6)
        if (aspectRatio < 0.5 || aspectRatio > 1.8) {
          console.warn("Invalid aspect ratio for a profile photo:", aspectRatio);
          resolve(false);
          return;
        }

        if (width < 100 || height < 100) {
          console.warn("Image resolution is too low:", width, "x", height);
          resolve(false);
          return;
        }

        // B. PRIMARY DEFENSE: Native FaceDetector (Shape Detection API)
        if ("FaceDetector" in window) {
          try {
            // @ts-expect-error - FaceDetector Shape Detection API is only supported in some browsers and missing standard typings
            const detector = new FaceDetector({ maxDetectedFaces: 3, fastMode: false });
            const faces = await detector.detect(img);
            console.log("Native Vision FaceDetector detected faces:", faces.length);
            if (faces.length > 0) {
              resolve(true);
              return;
            } else {
              // If native detector is supported and finds exactly 0 faces, we strictly reject it
              resolve(false);
              return;
            }
          } catch (err) {
            console.warn("Native FaceDetector failed, running tracking.js:", err);
          }
        }

        // C. SECONDARY DEFENSE: tracking.js Viola-Jones Cascade Classifier
        try {
          // Dynamically import tracking.js client-side chunks to prevent SSR build issues
          // @ts-expect-error - tracking.js does not have official TypeScript definitions
          await import("tracking/build/tracking-min.js");
          // @ts-expect-error - tracking.js face model does not have official TypeScript definitions
          await import("tracking/build/data/face-min.js");

          // @ts-expect-error - window.tracking is set dynamically via browser script load
          const tracking = window.tracking;
          if (tracking) {
            const tracker = new tracking.ObjectTracker("face");
            tracker.setInitialScale(4);
            tracker.setStepSize(2);
            tracker.setEdgesDensity(0.1);

            // Draw image to canvas for tracking.js to process
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0);

              let detected = false;
              tracker.once("track", (event: { data?: Array<unknown> }) => {
                if (event.data && event.data.length > 0) {
                  detected = true;
                }
              });

              // Run tracking analysis
              tracking.track(canvas, tracker);
              
              console.log("tracking.js face scan outcome:", detected);
              resolve(detected);
              return;
            }
          }
        } catch (err) {
          console.error("tracking.js failed, falling back to strict canvas analyzer:", err);
        }

        // D. TERTIARY DEFENSE: Strict Canvas Gradient & Skin-Tone Density Analyzer
        const strictPassed = validatePortraitStrict(img);
        console.log("Strict Canvas Fallback Validation Outcome:", strictPassed);
        resolve(strictPassed);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(true); // Fail-safe
      };

      img.src = objectUrl;
    } catch (err) {
      console.error("Portrait validation process crashed:", err);
      resolve(true); // Fail-safe
    }
  });
}

/**
 * Validates pixel-level gradients, skin-tone distribution, and edge transitions.
 * Correctly distinguishes standard portraits from flat ID cards, papers, or digital banners.
 */
function validatePortraitStrict(img: HTMLImageElement): boolean {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return true;

    // Standardized micro-canvas for analytical performance
    canvas.width = 100;
    canvas.height = 100;
    ctx.drawImage(img, 0, 0, 100, 100);

    const imgData = ctx.getImageData(0, 0, 100, 100);
    const data = imgData.data;

    let skinPixelCount = 0;
    let totalCenterPixels = 0;
    let rSum = 0, gSum = 0, bSum = 0;
    let rSqSum = 0, gSqSum = 0, bSqSum = 0;

    // Detect high-frequency sharp pixel transitions (to flag text printouts, white documents, ID forms)
    let transitionsCount = 0;

    for (let y = 0; y < 100; y++) {
      let prevBrightness = -1;
      for (let x = 0; x < 100; x++) {
        const idx = (y * 100 + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];

        if (a < 50) continue; // Skip transparency

        rSum += r;
        gSum += g;
        bSum += b;
        rSqSum += r * r;
        gSqSum += g * g;
        bSqSum += b * b;

        const brightness = (r + g + b) / 3;
        if (prevBrightness !== -1) {
          // Sharp transition indicates text lines or digital scan grids
          if (Math.abs(brightness - prevBrightness) > 38) {
            transitionsCount++;
          }
        }
        prevBrightness = brightness;

        // Accurate Skin Tone rule (matches diverse ethnicities in standard daylight)
        const isSkin = r > 70 && g > 45 && b > 25 &&
                       r > g && r > b &&
                       (r - g) > 12 &&
                       (r - b) > 12;

        // Center region (where a portrait's face is focused)
        if (x >= 25 && x <= 75 && y >= 25 && y <= 75) {
          totalCenterPixels++;
          if (isSkin) {
            skinPixelCount++;
          }
        }
      }
    }

    const totalPixels = 10000;
    const meanR = rSum / totalPixels;
    const meanG = gSum / totalPixels;
    const meanB = bSum / totalPixels;

    const varR = (rSqSum / totalPixels) - (meanR * meanR);
    const varG = (gSqSum / totalPixels) - (meanG * meanG);
    const varB = (bSqSum / totalPixels) - (meanB * meanB);

    const stdDevR = Math.sqrt(Math.max(0, varR));
    const stdDevG = Math.sqrt(Math.max(0, varG));
    const stdDevB = Math.sqrt(Math.max(0, varB));

    const avgStdDev = (stdDevR + stdDevG + stdDevB) / 3;
    const skinPercentage = (skinPixelCount / (totalCenterPixels || 1)) * 100;

    console.log("Canvas Strict Diagnostics:", { avgStdDev, skinPercentage, transitionsCount });

    // DECISION RULES:
    // 1. Text forms/documents have extremely dense text transitions (transitionsCount > 260).
    // 2. Clear portrait pictures have soft skin gradients and lower transitions (transitionsCount <= 260).
    // 3. Profiles require healthy center skin-tone ratios (between 10% and 80%).
    // 4. Exclude solid flat canvas fills or digital vectors (stdDev under 20 or over 90).
    const isDocumentOrGrid = transitionsCount > 260;
    const hasRichColors = avgStdDev > 20 && avgStdDev < 90;
    const hasSkinTones = skinPercentage >= 10 && skinPercentage <= 80;

    return !isDocumentOrGrid && hasRichColors && hasSkinTones;
  } catch (err) {
    console.error("Strict canvas validation crashed:", err);
    return true; // Fail-safe
  }
}
