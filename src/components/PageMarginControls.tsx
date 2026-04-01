import { type PageMargins, DEFAULT_MARGINS } from '@/lib/handwriting';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface Props {
  pageIndex: number;
  margins: PageMargins;
  onChange: (margins: PageMargins) => void;
  onReset: () => void;
}

const MARGIN_FIELDS: { key: keyof PageMargins; label: string; min: number; max: number }[] = [
  { key: 'top', label: 'Top', min: 10, max: 120 },
  { key: 'bottom', label: 'Bottom', min: 10, max: 120 },
  { key: 'left', label: 'Left', min: 20, max: 120 },
  { key: 'right', label: 'Right', min: 20, max: 120 },
];

export default function PageMarginControls({ pageIndex, margins, onChange, onReset }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Page {pageIndex + 1} Margins
        </Label>
        <button
          onClick={onReset}
          className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {MARGIN_FIELDS.map((field) => (
          <div key={field.key}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-medium text-muted-foreground">{field.label}</span>
              <span className="text-[10px] tabular-nums text-muted-foreground">{margins[field.key]}px</span>
            </div>
            <Slider
              value={[margins[field.key]]}
              onValueChange={([v]) => onChange({ ...margins, [field.key]: v })}
              min={field.min}
              max={field.max}
              step={2}
              className="w-full"
            />
          </div>
        ))}
      </div>

      {/* Visual margin preview */}
      <div className="relative mx-auto w-24 h-32 rounded border border-border bg-secondary/50">
        <div
          className="absolute bg-accent/10 border border-accent/20 rounded-sm transition-all duration-200"
          style={{
            top: `${(margins.top / 120) * 100}%`,
            left: `${(margins.left / 120) * 100}%`,
            right: `${(margins.right / 120) * 100}%`,
            bottom: `${(margins.bottom / 120) * 100}%`,
          }}
        />
        <span className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[7px] text-muted-foreground">{margins.top}</span>
        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[7px] text-muted-foreground">{margins.bottom}</span>
        <span className="absolute left-0.5 top-1/2 -translate-y-1/2 text-[7px] text-muted-foreground">{margins.left}</span>
        <span className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[7px] text-muted-foreground">{margins.right}</span>
      </div>
    </div>
  );
}
