import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HANDWRITING_STYLES, type HandwritingStyle, type PageMargins, DEFAULT_MARGINS, splitTextSegments, renderHandwritingPage, A4_WIDTH, A4_HEIGHT } from '@/lib/handwriting';
import HandwritingCanvas from './HandwritingCanvas';
import CustomizationPanel from './CustomizationPanel';
import PageMarginControls from './PageMarginControls';
import { jsPDF } from 'jspdf';

const SAMPLE_TEXT = `The quick brown fox jumps over the lazy dog. Every moment is a fresh beginning. Sometimes the smallest step in the right direction ends up being the biggest step of your life.

In the middle of difficulty lies opportunity. What we think, we become. The only way to do great work is to love what you do.`;

export default function EditorSection() {
  const [text, setText] = useState(SAMPLE_TEXT);
  const [style, setStyle] = useState<HandwritingStyle>(
    HANDWRITING_STYLES.find((s) => s.id === 'exam') ?? HANDWRITING_STYLES[0],
  );
  const [fontSize, setFontSize] = useState(18);
  const [lineSpacing, setLineSpacing] = useState(100);
  const [showLines, setShowLines] = useState(false);
  const [humanImperfections, setHumanImperfections] = useState(true);
  const [fixedLinesEnabled, setFixedLinesEnabled] = useState(true);
  const [linesPerPage, setLinesPerPage] = useState(18);
  const [isGenerating, setIsGenerating] = useState(false);
  const [variationSeed, setVariationSeed] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageMargins, setPageMargins] = useState<PageMargins[]>([{ ...DEFAULT_MARGINS }]);
  const [totalPages, setTotalPages] = useState(1);
  const [pageBreaks, setPageBreaks] = useState<number[]>([0]); // segment start indices per page
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const options = useMemo(
    () => ({ style, fontSize, lineSpacing, showLines, humanImperfections, fixedLinesEnabled, linesPerPage, variationSeed }),
    [style, fontSize, lineSpacing, showLines, humanImperfections, fixedLinesEnabled, linesPerPage, variationSeed],
  );

  // Calculate all page breaks whenever text or options change
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = A4_WIDTH;
    canvas.height = A4_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const segments = splitTextSegments(text || 'Start typing...');
    const breaks: number[] = [0];
    let startIndex = 0;
    let pageIdx = 0;

    while (startIndex < segments.length && pageIdx < 100) {
      const margins = pageMargins[Math.min(pageIdx, pageMargins.length - 1)] || DEFAULT_MARGINS;
      const result = renderHandwritingPage(ctx, segments, startIndex, A4_WIDTH, A4_HEIGHT, options, margins);
      if (result.complete) break;
      startIndex = result.nextSegmentIndex;
      breaks.push(startIndex);
      pageIdx++;
    }

    const total = breaks.length;
    setPageBreaks(breaks);
    setTotalPages(total);

    // Ensure pageMargins array has entries for all pages
    if (pageMargins.length < total) {
      setPageMargins(prev => {
        const extended = [...prev];
        while (extended.length < total) {
          extended.push({ ...DEFAULT_MARGINS });
        }
        return extended;
      });
    }

    // Clamp current page
    if (currentPage >= total) setCurrentPage(total - 1);
  }, [text, options, pageMargins, currentPage]);

  const currentMargins = pageMargins[currentPage] || DEFAULT_MARGINS;
  const startSegment = pageBreaks[currentPage] || 0;

  const handleMarginChange = useCallback((margins: PageMargins) => {
    setPageMargins(prev => {
      const next = [...prev];
      next[currentPage] = margins;
      return next;
    });
  }, [currentPage]);

  const handleMarginReset = useCallback(() => {
    handleMarginChange({ ...DEFAULT_MARGINS });
  }, [handleMarginChange]);

  const handleApplyToAll = useCallback(() => {
    setPageMargins(prev => prev.map(() => ({ ...currentMargins })));
  }, [currentMargins]);

  const handleGenerate = useCallback(() => {
    setIsGenerating(true);
    setVariationSeed((prev) => prev + 1);
    setTimeout(() => setIsGenerating(false), 450);
  }, []);

  const downloadPNG = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `handwriting-page-${currentPage + 1}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [currentPage]);

  const downloadPDF = useCallback(() => {
    // Render all pages into a single PDF
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = A4_WIDTH;
    tempCanvas.height = A4_HEIGHT;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;

    const segments = splitTextSegments(text);
    let startIndex = 0;
    let pageIdx = 0;

    while (startIndex < segments.length && pageIdx < 100) {
      if (pageIdx > 0) pdf.addPage();
      const margins = pageMargins[Math.min(pageIdx, pageMargins.length - 1)] || DEFAULT_MARGINS;
      const result = renderHandwritingPage(ctx, segments, startIndex, A4_WIDTH, A4_HEIGHT, options, margins);
      const imgData = tempCanvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      if (result.complete) break;
      startIndex = result.nextSegmentIndex;
      pageIdx++;
    }

    pdf.save('handwriting.pdf');
  }, [text, options, pageMargins]);

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
              ↓ PDF (All Pages)
            </button>
          </div>

          {/* Page Navigation */}
          {totalPages > 1 && (
            <motion.div
              className="flex items-center justify-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <button
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-sm font-medium disabled:opacity-30 hover:bg-secondary transition-colors"
              >
                ‹
              </button>

              <div className="flex gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`w-8 h-8 rounded-full text-xs font-medium transition-all duration-200 ${
                      currentPage === i
                        ? 'bg-primary text-primary-foreground shadow-md scale-110'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage === totalPages - 1}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-sm font-medium disabled:opacity-30 hover:bg-secondary transition-colors"
              >
                ›
              </button>

              <span className="text-xs text-muted-foreground ml-2">
                Page {currentPage + 1} of {totalPages}
              </span>
            </motion.div>
          )}

          {/* Canvas Preview */}
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <HandwritingCanvas
              text={text}
              options={options}
              margins={currentMargins}
              pageIndex={currentPage}
              startSegmentIndex={startSegment}
              canvasRef={canvasRef}
            />
          </motion.div>
        </div>

        {/* Right: Customization */}
        <motion.aside
          className="glass-card-elevated p-6 space-y-8 max-h-[calc(100vh-120px)] overflow-y-auto"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">Customize</h3>
            <CustomizationPanel
              style={style}
              fontSize={fontSize}
              lineSpacing={lineSpacing}
              showLines={showLines}
              humanImperfections={humanImperfections}
              fixedLinesEnabled={fixedLinesEnabled}
              linesPerPage={linesPerPage}
              onStyleChange={setStyle}
              onFontSizeChange={setFontSize}
              onLineSpacingChange={setLineSpacing}
              onShowLinesChange={setShowLines}
              onHumanImperfectionsChange={setHumanImperfections}
              onFixedLinesEnabledChange={setFixedLinesEnabled}
              onLinesPerPageChange={setLinesPerPage}
            />
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Page Margins */}
          <div>
            <PageMarginControls
              pageIndex={currentPage}
              margins={currentMargins}
              onChange={handleMarginChange}
              onReset={handleMarginReset}
            />
            {totalPages > 1 && (
              <button
                onClick={handleApplyToAll}
                className="mt-3 w-full text-[10px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground border border-border rounded-lg py-2 transition-colors"
              >
                Apply margins to all pages
              </button>
            )}
          </div>
        </motion.aside>
      </div>
    </section>
  );
}
