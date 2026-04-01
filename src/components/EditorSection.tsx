import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { HANDWRITING_STYLES, type HandwritingStyle } from '@/lib/handwriting';
import HandwritingCanvas from './HandwritingCanvas';
import CustomizationPanel from './CustomizationPanel';
import { jsPDF } from 'jspdf';

const SAMPLE_TEXT = `The quick brown fox jumps over the lazy dog. Every moment is a fresh beginning. Sometimes the smallest step in the right direction ends up being the biggest step of your life.

In the middle of difficulty lies opportunity. What we think, we become. The only way to do great work is to love what you do.`;

export default function EditorSection() {
  const [text, setText] = useState(SAMPLE_TEXT);
  const [style, setStyle] = useState<HandwritingStyle>(HANDWRITING_STYLES[0]);
  const [fontSize, setFontSize] = useState(18);
  const [lineSpacing, setLineSpacing] = useState(100);
  const [inkColor, setInkColor] = useState('#1a3a6b');
  const [showLines, setShowLines] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const options = { style, fontSize, lineSpacing, inkColor, marginLeft: 60, marginTop: 50, showLines };

  const handleGenerate = useCallback(() => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 1500);
  }, []);

  const downloadPNG = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'handwriting.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  const downloadPDF = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
    pdf.save('handwriting.pdf');
  }, []);

  return (
    <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto" id="editor">
      <motion.div
        className="text-center mb-14"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">Create Your Handwriting</h2>
        <p className="text-muted-foreground">Type, customize, and download in seconds.</p>
      </motion.div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-8">
        {/* Left: Text + Preview */}
        <div className="space-y-6">
          <motion.div
            className="glass-card p-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your text here..."
              className="w-full h-36 resize-none rounded-xl bg-transparent p-5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </motion.div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button onClick={handleGenerate} className="btn-premium" disabled={isGenerating}>
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  AI Processing…
                </span>
              ) : (
                'Generate Handwriting'
              )}
            </button>
            <button onClick={downloadPNG} className="btn-premium-outline">
              ↓ PNG
            </button>
            <button onClick={downloadPDF} className="btn-premium-outline">
              ↓ PDF
            </button>
          </div>

          {/* Canvas Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <HandwritingCanvas text={text} options={options} canvasRef={canvasRef} />
          </motion.div>
        </div>

        {/* Right: Customization */}
        <motion.aside
          className="glass-card-elevated p-6"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">Customize</h3>
          <CustomizationPanel
            style={style}
            fontSize={fontSize}
            lineSpacing={lineSpacing}
            inkColor={inkColor}
            showLines={showLines}
            onStyleChange={setStyle}
            onFontSizeChange={setFontSize}
            onLineSpacingChange={setLineSpacing}
            onInkColorChange={setInkColor}
            onShowLinesChange={setShowLines}
          />
        </motion.aside>
      </div>
    </section>
  );
}
