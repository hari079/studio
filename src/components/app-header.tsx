import { Logo } from '@/components/icons';

export function AppHeader() {
  return (
    <header className="py-6 px-4 md:px-8 border-b border-border/60 shadow-sm">
      <div className="container mx-auto flex items-center gap-3">
        <Logo className="h-10 w-10 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Food Assist
        </h1>
      </div>
    </header>
  );
}
