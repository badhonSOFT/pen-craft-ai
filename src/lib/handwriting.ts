export interface HandwritingStyle {
  id: string;
  name: string;
  description: string;
  baseSize: number;
  slant: number;
  letterSpacing: number;
  wordSpacing: number;
  lineHeight: number;
  strokeWidth: number;
  roughness: number;
}

export const HANDWRITING_STYLES: HandwritingStyle[] = [
  { id: 'casual', name: 'Casual', description: 'Relaxed everyday writing', baseSize: 18, slant: 0.05, letterSpacing: 1.2, wordSpacing: 8, lineHeight: 32, strokeWidth: 1.4, roughness: 0.6 },
  { id: 'neat', name: 'Neat', description: 'Clean and precise', baseSize: 16, slant: 0.02, letterSpacing: 1.5, wordSpacing: 10, lineHeight: 32, strokeWidth: 1.2, roughness: 0.3 },
  { id: 'cursive', name: 'Cursive', description: 'Flowing connected letters', baseSize: 19, slant: 0.15, letterSpacing: 0.5, wordSpacing: 12, lineHeight: 34, strokeWidth: 1.3, roughness: 0.4 },
  { id: 'bold', name: 'Bold', description: 'Strong and confident', baseSize: 20, slant: 0.03, letterSpacing: 1.8, wordSpacing: 10, lineHeight: 34, strokeWidth: 2.0, roughness: 0.5 },
  { id: 'tiny', name: 'Tiny', description: 'Small and compact', baseSize: 13, slant: 0.04, letterSpacing: 1.0, wordSpacing: 6, lineHeight: 24, strokeWidth: 1.0, roughness: 0.4 },
  { id: 'messy', name: 'Messy', description: 'Quick and hurried', baseSize: 18, slant: 0.1, letterSpacing: 1.0, wordSpacing: 7, lineHeight: 30, strokeWidth: 1.5, roughness: 0.9 },
  { id: 'elegant', name: 'Elegant', description: 'Refined and graceful', baseSize: 17, slant: 0.12, letterSpacing: 1.4, wordSpacing: 11, lineHeight: 34, strokeWidth: 1.1, roughness: 0.2 },
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export interface RenderOptions {
  style: HandwritingStyle;
  fontSize: number;
  lineSpacing: number;
  inkColor: string;
  marginLeft: number;
  marginTop: number;
  showLines: boolean;
}

export function renderHandwriting(
  ctx: CanvasRenderingContext2D,
  text: string,
  width: number,
  height: number,
  options: RenderOptions
) {
  const { style, fontSize, lineSpacing, inkColor, marginLeft, marginTop, showLines } = options;
  const scale = fontSize / style.baseSize;
  const effectiveLineHeight = style.lineHeight * scale * (lineSpacing / 100);
  const effectiveLetterSpacing = style.letterSpacing * scale;
  const effectiveWordSpacing = style.wordSpacing * scale;
  const effectiveSize = style.baseSize * scale;

  // Clear
  ctx.clearRect(0, 0, width, height);

  // Paper background
  ctx.fillStyle = '#fefcf8';
  ctx.fillRect(0, 0, width, height);

  // Paper texture
  const rand = seededRandom(42);
  ctx.fillStyle = 'rgba(0,0,0,0.008)';
  for (let i = 0; i < 2000; i++) {
    ctx.fillRect(rand() * width, rand() * height, 1, 1);
  }

  // Red margin line
  if (showLines) {
    ctx.strokeStyle = 'rgba(220, 80, 80, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(marginLeft - 10, 0);
    ctx.lineTo(marginLeft - 10, height);
    ctx.stroke();
  }

  // Blue lines
  if (showLines) {
    ctx.strokeStyle = 'rgba(130, 170, 220, 0.3)';
    ctx.lineWidth = 0.5;
    let lineY = marginTop + effectiveLineHeight;
    while (lineY < height - 20) {
      ctx.beginPath();
      ctx.moveTo(20, lineY);
      ctx.lineTo(width - 20, lineY);
      ctx.stroke();
      lineY += effectiveLineHeight;
    }
  }

  // Render text
  ctx.fillStyle = inkColor;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const words = text.split(/(\s+)/);
  let x = marginLeft;
  let y = marginTop + effectiveLineHeight;
  const maxX = width - 40;
  const charRand = seededRandom(7);

  for (const segment of words) {
    if (segment === '\n') {
      x = marginLeft;
      y += effectiveLineHeight;
      if (y > height - 30) break;
      continue;
    }

    if (/^\s+$/.test(segment)) {
      x += effectiveWordSpacing;
      continue;
    }

    // Check word wrap
    const wordWidth = segment.length * (effectiveSize * 0.55 + effectiveLetterSpacing);
    if (x + wordWidth > maxX && x > marginLeft) {
      x = marginLeft;
      y += effectiveLineHeight;
      if (y > height - 30) break;
    }

    for (const char of segment) {
      const offsetX = (charRand() - 0.5) * style.roughness * 2;
      const offsetY = (charRand() - 0.5) * style.roughness * 2;
      const rotation = (charRand() - 0.5) * style.roughness * 0.08;
      const sizeVar = 1 + (charRand() - 0.5) * style.roughness * 0.1;

      ctx.save();
      ctx.translate(x + offsetX, y + offsetY);
      ctx.rotate(rotation + style.slant * 0.1);
      ctx.globalAlpha = 0.85 + charRand() * 0.15;

      const charSize = effectiveSize * sizeVar;
      ctx.font = `${style.slant > 0.1 ? 'italic ' : ''}${style.strokeWidth > 1.5 ? '600' : '400'} ${charSize}px 'Segoe Script', 'Bradley Hand', 'Comic Sans MS', cursive`;
      ctx.fillText(char, 0, 0);

      // Ink pressure variation
      if (style.strokeWidth > 1.3) {
        ctx.globalAlpha = 0.05;
        ctx.fillText(char, 0.5, 0.5);
      }

      ctx.restore();

      x += charSize * 0.55 + effectiveLetterSpacing + offsetX * 0.3;
    }

    x += effectiveWordSpacing;
  }
}
