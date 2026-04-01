import { useRef } from 'react';
import HeroSection from '@/components/HeroSection';
import EditorSection from '@/components/EditorSection';
import ProSection from '@/components/ProSection';

const Index = () => {
  const editorRef = useRef<HTMLDivElement>(null);

  const scrollToEditor = () => {
    editorRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4" style={{ background: 'hsl(var(--glass))', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="text-sm font-semibold tracking-tight">HandScript AI</span>
          <button onClick={scrollToEditor} className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            Get Started
          </button>
        </div>
      </nav>

      <HeroSection onGetStarted={scrollToEditor} />

      <div ref={editorRef}>
        <EditorSection />
      </div>

      <ProSection />

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground">© 2026 HandScript AI. All rights reserved.</span>
          <span className="text-xs text-muted-foreground">Built with precision and care.</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
