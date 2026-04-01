import { useRef, useEffect, useCallback } from 'react';
import { renderHandwriting, type RenderOptions } from '@/lib/handwriting';

interface Props {
  text: string;
  options: RenderOptions;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
}

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

export default function HandwritingCanvas({ text, options, canvasRef: externalRef }: Props) {
  const internalRef = useRef<HTMLCanvasElement>(null);
  const ref = externalRef || internalRef;

  const draw = useCallback(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = A4_WIDTH;
    canvas.height = A4_HEIGHT;
    renderHandwriting(ctx, text || 'Start typing to see your handwriting...', A4_WIDTH, A4_HEIGHT, options);
  }, [text, options, ref]);

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
