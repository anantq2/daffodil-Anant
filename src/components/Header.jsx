import { Scan } from 'lucide-react';

export default function Header() {
    return (
        <header className="w-full border-b border-white/5 backdrop-blur-2xl bg-background/50 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
                            <Scan className="w-5 h-5 text-white" />
                        </div>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-accent opacity-40 blur-lg" />
                    </div>
                    <div>
                        <h1 className="text-base font-extrabold text-foreground leading-tight tracking-tight">
                            Content
                            <span className="bg-gradient-to-r from-primary to-cyan-300 bg-clip-text text-transparent">
                                Analyzer
                            </span>
                        </h1>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    <span className="ml-1">AI Ready</span>
                </div>
            </div>
        </header>
    );
}
