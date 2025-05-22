import { AppHeader } from '@/components/app-header';
import { FoodSavvyApp } from '@/components/foodsavvy-app';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <main className="flex-grow">
        <FoodSavvyApp />
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} FoodSavvy. Your guide to smarter food storage.
      </footer>
    </div>
  );
}
