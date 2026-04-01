export interface HandwritingStyle {
  id: string;
  name: string;
  description: string;
  fontStack: string;
  baseSize: number;
  slant: number;
  letterSpacing: number;
  wordSpacing: number;
  lineHeight: number;
  strokeWidth: number;
  roughness: number;
}

export const HANDWRITING_STYLES: HandwritingStyle[] = [
  {
    id: 'casual',
    name: 'Casual',
    description: 'Relaxed everyday writing',
    fontStack: "'Patrick Hand', 'Segoe Print', 'Bradley Hand', cursive",
    baseSize: 18,
    slant: 0.05,
    letterSpacing: 1.2,
    wordSpacing: 8,
    lineHeight: 32,
    strokeWidth: 1.4,
    roughness: 0.6,
  },
  {
    id: 'neat',
    name: 'Neat',
    description: 'Clean and precise',
    fontStack: "'Gochi Hand', 'Comic Sans MS', 'Segoe Print', cursive",
    baseSize: 16,
    slant: 0.02,
    letterSpacing: 1.5,
    wordSpacing: 10,
    lineHeight: 32,
    strokeWidth: 1.2,
    roughness: 0.3,
  },
  {
    id: 'cursive',
    name: 'Cursive',
    description: 'Flowing connected letters',
    fontStack: "'Caveat', 'Segoe Script', 'Brush Script MT', cursive",
    baseSize: 19,
    slant: 0.15,
    letterSpacing: 0.5,
    wordSpacing: 12,
    lineHeight: 34,
    strokeWidth: 1.3,
    roughness: 0.4,
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'Strong and confident',
    fontStack: "'Patrick Hand', 'Segoe Print', 'Bradley Hand', cursive",
    baseSize: 20,
    slant: 0.03,
    letterSpacing: 1.8,
    wordSpacing: 10,
    lineHeight: 34,
    strokeWidth: 2.0,
    roughness: 0.5,
  },
  {
    id: 'tiny',
    name: 'Tiny',
    description: 'Small and compact',
    fontStack: "'Kalam', 'Segoe Print', 'Bradley Hand', cursive",
    baseSize: 13,
    slant: 0.04,
    letterSpacing: 1.0,
    wordSpacing: 6,
    lineHeight: 24,
    strokeWidth: 1.0,
    roughness: 0.4,
  },
  {
    id: 'messy',
    name: 'Messy',
    description: 'Quick and hurried',
    fontStack: "'Kalam', 'Comic Sans MS', 'Segoe Print', cursive",
    baseSize: 18,
    slant: 0.1,
    letterSpacing: 1.0,
    wordSpacing: 7,
    lineHeight: 30,
    strokeWidth: 1.5,
    roughness: 0.9,
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Refined and graceful',
    fontStack: "'Caveat', 'Segoe Script', 'Brush Script MT', cursive",
    baseSize: 17,
    slant: 0.12,
    letterSpacing: 1.4,
    wordSpacing: 11,
    lineHeight: 34,
    strokeWidth: 1.1,
    roughness: 0.2,
  },
  {
    id: 'exam',
    name: 'Exam Realistic',
    description: 'Printed notebook-like handwriting',
    fontStack: "'Schoolbell', 'Handlee', 'Kalam', 'Patrick Hand', 'Segoe Print', cursive",
    baseSize: 17,
    slant: 0.01,
    letterSpacing: 1.05,
    wordSpacing: 8,
    lineHeight: 31,
    strokeWidth: 1.2,
    roughness: 0.28,
  },
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export interface PageMargins {
  top: number;
  bottom: number;
  left: number;
  right: number;
  leftTextGap: number;
}

// Notebook/exam style: generous top line and wider left writing gutter.
export const DEFAULT_MARGINS: PageMargins = { top: 70, left: 120, right: 40, bottom: 90, leftTextGap: 5 };

export interface RenderOptions {
  style: HandwritingStyle;
  fontSize: number;
  lineSpacing: number;
  showLines: boolean;
  humanImperfections?: boolean;
  fixedLinesEnabled?: boolean;
  linesPerPage?: number;
  variationSeed?: number;
}

export interface PageRenderResult {
  /** Index of the first word-segment not rendered on this page */
  nextSegmentIndex: number;
  /** Whether all text fit on this page */
  complete: boolean;
}

export const A4_WIDTH = 794;
export const A4_HEIGHT = 1123;

function mutateWordForTypo(word: string, rand: () => number): string {
  if (word.length < 4) return word;
  const chars = word.split('');
  const mode = Math.floor(rand() * 4);

  if (mode === 0 && chars.length > 4) {
    const i = 1 + Math.floor(rand() * (chars.length - 2));
    chars.splice(i, 1);
    return chars.join('');
  }

  if (mode === 1 && chars.length > 4) {
    const i = 1 + Math.floor(rand() * (chars.length - 3));
    [chars[i], chars[i + 1]] = [chars[i + 1], chars[i]];
    return chars.join('');
  }

  if (mode === 2) {
    const i = 1 + Math.floor(rand() * (chars.length - 2));
    chars.splice(i, 0, chars[i]);
    return chars.join('');
  }

  const i = 1 + Math.floor(rand() * (chars.length - 2));
  const pool = 'aeiourtnsl';
  chars[i] = pool[Math.floor(rand() * pool.length)];
  return chars.join('');
}

export function renderHandwritingPage(
  ctx: CanvasRenderingContext2D,
  segments: string[],
  startIndex: number,
  width: number,
  height: number,
  options: RenderOptions,
  margins: PageMargins,
): PageRenderResult {
  const {
    style,
    fontSize,
    lineSpacing,
    showLines,
    humanImperfections = true,
    fixedLinesEnabled = true,
    linesPerPage = 18,
    variationSeed = 0,
  } = options;
  const scale = fontSize / style.baseSize;
  const effectiveLineHeight = style.lineHeight * scale * (lineSpacing / 100);
  const effectiveLetterSpacing = style.letterSpacing * scale;
  const effectiveWordSpacing = style.wordSpacing * scale;
  const effectiveSize = style.baseSize * scale;

  // Clear
  ctx.clearRect(0, 0, width, height);

  // Paper background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Paper texture
  const rand = seededRandom(42 + variationSeed * 13);
  ctx.fillStyle = 'rgba(0,0,0,0.004)';
  for (let i = 0; i < 1200; i++) {
    ctx.fillRect(rand() * width, rand() * height, 1, 1);
  }

  const marginLeft = margins.left;
  const marginTop = margins.top;
  const marginRight = margins.right;
  const marginBottom = margins.bottom;
  const leftTextGap = margins.leftTextGap;
  const startX = marginLeft + leftTextGap;
  const maxX = width - marginRight;
  const maxY = height - marginBottom;
  const usableHeight = maxY - marginTop;
  const targetLinesPerPage = Math.max(1, Math.floor(linesPerPage));
  const fixedLineStep = fixedLinesEnabled ? usableHeight / targetLinesPerPage : effectiveLineHeight;

  // Always draw the black left and top guideline like real notebook exam pages.
  // Using filled rectangles prevents anti-aliased endpoint gaps at page edges.
  ctx.fillStyle = 'rgba(15, 15, 15, 0.86)';
  ctx.fillRect(Math.round(marginLeft), 0, 2, height);
  ctx.fillRect(0, Math.round(marginTop), width, 2);

  // Optional extra ruled lines.
  if (showLines) {
    ctx.strokeStyle = 'rgba(90, 90, 90, 0.12)';
    ctx.lineWidth = 0.5;
    if (fixedLinesEnabled) {
      for (let line = 1; line <= targetLinesPerPage; line++) {
        const lineY = marginTop + fixedLineStep * line;
        if (lineY >= maxY) break;
        const alignedY = Math.round(lineY) + 0.5;
        ctx.beginPath();
        ctx.moveTo(-2, alignedY);
        ctx.lineTo(width + 2, alignedY);
        ctx.stroke();
      }
    } else {
      let lineY = marginTop + effectiveLineHeight;
      while (lineY < maxY) {
        const alignedY = Math.round(lineY) + 0.5;
        ctx.beginPath();
        ctx.moveTo(-2, alignedY);
        ctx.lineTo(width + 2, alignedY);
        ctx.stroke();
        lineY += effectiveLineHeight;
      }
    }
  }

  // Render text
  // Black ink is enforced for consistency and realistic pen output.
  ctx.fillStyle = '#101010';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  let x = startX;
  let y = marginTop + fixedLineStep;
  let currentLine = 0;
  const charRand = seededRandom(7 + startIndex + variationSeed * 97);
  const lineRand = seededRandom(101 + startIndex + variationSeed * 53);

  const getLineAdvance = () => {
    if (fixedLinesEnabled) return fixedLineStep;
    if (!humanImperfections) return effectiveLineHeight;
    return effectiveLineHeight * (0.92 + lineRand() * 0.2);
  };

  const canWriteCurrentLine = () => {
    if (fixedLinesEnabled) return currentLine < targetLinesPerPage;
    return y <= maxY;
  };

  const moveToNextLine = () => {
    currentLine += 1;
    if (fixedLinesEnabled && currentLine >= targetLinesPerPage) return false;
    x = startX + (humanImperfections ? (lineRand() - 0.5) * 2.2 : 0);
    y += getLineAdvance();
    return y <= maxY;
  };

  const getBaseLineOffset = (lineIndex: number) => {
    // Gentle baseline wobble makes text feel handwritten, not perfectly machine straight.
    const base = Math.sin((lineIndex + variationSeed * 0.3) * 0.9) * style.roughness * 0.35;
    if (!humanImperfections) return base;
    return base + (lineRand() - 0.5) * 0.35;
  };

  const setFont = (charSize: number, extraWeight = 0) => {
    const weight = style.strokeWidth > 1.6 || extraWeight > 0.5 ? 600 : 500;
    ctx.font = `${style.slant > 0.08 ? 'italic ' : ''}${weight} ${charSize}px ${style.fontStack}`;
  };

  const measureWordWidth = (word: string) => {
    setFont(effectiveSize);
    let widthPx = 0;
    for (const char of word) widthPx += ctx.measureText(char).width + effectiveLetterSpacing;
    return widthPx;
  };

  const drawWord = (word: string, alphaBoost = 1) => {
    const wordStartX = x;
    for (const char of word) {
      const baselineOffset = getBaseLineOffset(currentLine);
      const offsetX = (charRand() - 0.5) * style.roughness * 1.8;
      const offsetY = (charRand() - 0.5) * style.roughness * 1.4 + baselineOffset;
      const rotation = (charRand() - 0.5) * style.roughness * 0.06;
      const sizeVar = 1 + (charRand() - 0.5) * style.roughness * 0.08;
      const pressure = 0.88 + charRand() * 0.18;
      const penDrag = 0.1 + charRand() * 0.15;

      ctx.save();
      ctx.translate(x + offsetX, y + offsetY);
      ctx.rotate(rotation + style.slant * 0.08);
      ctx.globalAlpha = (0.92 + charRand() * 0.08) * alphaBoost;

      const charSize = effectiveSize * sizeVar;
      setFont(charSize, pressure);
      ctx.fillText(char, 0, 0);

      if (style.strokeWidth > 1.2 || style.roughness > 0.5) {
        ctx.globalAlpha = 0.035 * alphaBoost;
        ctx.fillText(char, 0.35, 0.35);
      }
      ctx.globalAlpha = 0.015 * alphaBoost;
      ctx.fillText(char, penDrag, 0.12);

      ctx.restore();
      setFont(charSize, pressure);
      const advance = ctx.measureText(char).width + effectiveLetterSpacing;
      x += advance + offsetX * 0.12;
    }
    return { start: wordStartX, end: x };
  };

  let i = startIndex;
  for (; i < segments.length; i++) {
    const segment = segments[i];

    if (/^\n+$/.test(segment)) {
      // Support multiple consecutive line breaks.
      for (let n = 0; n < segment.length; n++) {
        if (!moveToNextLine()) return { nextSegmentIndex: i, complete: false };
      }
      continue;
    }

    if (/^\s+$/.test(segment)) {
      x += effectiveWordSpacing * Math.max(1, segment.length * 0.55);
      continue;
    }

    const canTypo =
      humanImperfections &&
      /^[A-Za-z][A-Za-z'-]{5,}$/.test(segment) &&
      !segment.includes("'") &&
      charRand() < 0.018;

    const typoWord = canTypo ? mutateWordForTypo(segment, charRand) : null;
    const typoWidth = typoWord ? measureWordWidth(typoWord) : 0;
    const correctedWidth = measureWordWidth(segment);
    const wordWidth = typoWord
      ? typoWidth + effectiveWordSpacing * 0.5 + correctedWidth + effectiveWordSpacing
      : correctedWidth + effectiveWordSpacing;

    if (x + wordWidth > maxX && x > startX) {
      if (!moveToNextLine()) return { nextSegmentIndex: i, complete: false };
    }
    if (!canWriteCurrentLine()) return { nextSegmentIndex: i, complete: false };

    if (typoWord) {
      const typoSpan = drawWord(typoWord, 0.94);
      const strikeY = y - effectiveSize * (0.34 + charRand() * 0.1);
      ctx.save();
      ctx.strokeStyle = 'rgba(15,15,15,0.75)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(typoSpan.start - 0.5, strikeY);
      ctx.lineTo(typoSpan.end + 0.5, strikeY + (charRand() - 0.5) * 0.8);
      ctx.stroke();
      ctx.restore();
      x += effectiveWordSpacing * 0.95;
      drawWord(segment, 1);
    } else {
      drawWord(segment, 1);
    }

    x += effectiveWordSpacing * (0.9 + charRand() * 0.25);
  }

  return { nextSegmentIndex: i, complete: true };
}

/** Split text into word/whitespace/newline segments */
export function splitTextSegments(text: string): string[] {
  return text.split(/([ \t]+|\n+)/).filter((segment) => segment.length > 0);
}

/** Calculate how many pages are needed and return segment break indices */
export function calculatePages(
  text: string,
  options: RenderOptions,
  pageMargins: PageMargins[],
): number {
  // Use an offscreen canvas to simulate rendering
  const canvas = document.createElement('canvas');
  canvas.width = A4_WIDTH;
  canvas.height = A4_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return 1;

  const segments = splitTextSegments(text);
  let startIndex = 0;
  let pageCount = 0;

  while (startIndex < segments.length) {
    const margins = pageMargins[Math.min(pageCount, pageMargins.length - 1)] || DEFAULT_MARGINS;
    const result = renderHandwritingPage(ctx, segments, startIndex, A4_WIDTH, A4_HEIGHT, options, margins);
    pageCount++;
    if (result.complete) break;
    startIndex = result.nextSegmentIndex;
    if (pageCount > 100) break; // safety
  }

  return Math.max(1, pageCount);
}
