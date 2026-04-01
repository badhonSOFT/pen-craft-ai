import { HANDWRITING_STYLES, type HandwritingStyle } from '@/lib/handwriting';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface Props {
  style: HandwritingStyle;
  fontSize: number;
  lineSpacing: number;
  inkColor: string;
  showLines: boolean;
  onStyleChange: (s: HandwritingStyle) => void;
  onFontSizeChange: (v: number) => void;
  onLineSpacingChange: (v: number) => void;
  onInkColorChange: (v: string) => void;
  onShowLinesChange: (v: boolean) => void;
}

const INK_COLORS = [
  { label: 'Blue', value: '#1a3a6b' },
  { label: 'Black', value: '#1a1a1a' },
  { label: 'Dark Blue', value: '#0d1f4b' },
  { label: 'Red', value: '#8b1a1a' },
];

export default function CustomizationPanel(props: Props) {
  return (
    <div className="space-y-6">
      {/* Style Selection */}
      <div>
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3 block">
          Handwriting Style
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {HANDWRITING_STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => props.onStyleChange(s)}
              className={`rounded-xl px-3 py-2.5 text-left transition-all duration-200 text-sm ${
                props.style.id === s.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <span className="font-medium block">{s.name}</span>
              <span className="text-[10px] opacity-70">{s.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Font Size</Label>
          <span className="text-xs text-muted-foreground">{props.fontSize}px</span>
        </div>
        <Slider
          value={[props.fontSize]}
          onValueChange={([v]) => props.onFontSizeChange(v)}
          min={10}
          max={28}
          step={1}
          className="w-full"
        />
      </div>

      {/* Line Spacing */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Line Spacing</Label>
          <span className="text-xs text-muted-foreground">{props.lineSpacing}%</span>
        </div>
        <Slider
          value={[props.lineSpacing]}
          onValueChange={([v]) => props.onLineSpacingChange(v)}
          min={80}
          max={160}
          step={5}
          className="w-full"
        />
      </div>

      {/* Ink Color */}
      <div>
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3 block">
          Ink Color
        </Label>
        <div className="flex gap-2">
          {INK_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => props.onInkColorChange(c.value)}
              className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                props.inkColor === c.value ? 'border-accent scale-110 shadow-md' : 'border-border hover:scale-105'
              }`}
              style={{ backgroundColor: c.value }}
              title={c.label}
            />
          ))}
        </div>
      </div>

      {/* Notebook Lines */}
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Notebook Lines
        </Label>
        <Switch checked={props.showLines} onCheckedChange={props.onShowLinesChange} />
      </div>
    </div>
  );
}
