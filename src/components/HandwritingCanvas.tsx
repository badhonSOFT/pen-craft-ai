import { useRef, useEffect, useCallback } from 'react';
import { renderHandwritingPage, splitTextSegments, type RenderOptions, type PageMargins, A4_WIDTH, A4_HEIGHT } from '@/lib/handwriting';

interface Props {
  text: string;
  options: RenderOptions;
  margins: PageMargins;
  pageIndex: number;
  /** Segment index to start rendering from for this page */
  startSegmentIndex: number;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
  onPageRendered?: (nextIndex: number, complete: boolean) => void;
}

export default function HandwritingCanvas({ text, options, margins, pageIndex, startSegmentIndex, canvasRef: externalRef, onPageRendered }: Props) {
  const internalRef = useRef<HTMLCanvasElement>(null);
  const ref = externalRef || internalRef;

  const draw = useCallback(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.floor(A4_WIDTH * dpr);
    canvas.height = Math.floor(A4_HEIGHT * dpr);
    canvas.style.width = `${A4_WIDTH}px`;
    canvas.style.height = `${A4_HEIGHT}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const segments = splitTextSegments(text || 'Start typing to see your handwriting...');
    const result = renderHandwritingPage(ctx, segments, startSegmentIndex, A4_WIDTH, A4_HEIGHT, options, margins);
    onPageRendered?.(result.nextSegmentIndex, result.complete);
  }, [text, options, margins, startSegmentIndex, ref, onPageRendered]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div className="w-full overflow-auto rounded-xl" style={{ boxShadow: 'var(--shadow-elevated)' }}>
      <canvas
        ref={ref as React.RefObject<HTMLCanvasElement>}
        className="w-full h-auto rounded-xl"
        style={{ maxWidth: '100%' }}
      />
    </div>
  );
}
