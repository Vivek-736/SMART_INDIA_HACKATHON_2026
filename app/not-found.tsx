import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Home, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/icon.png"
              alt="PreConsult Logo"
              width={32}
              height={32}
              className="rounded-lg bg-indigo-600 shadow-xs"
              priority
            />
            <span className="text-lg font-bold tracking-tight text-foreground flex items-center gap-1.5">
              PreConsult
              <span className="inline-flex items-center rounded-md bg-accent px-1.5 py-0.2 text-[11px] font-semibold text-primary">
                AI
              </span>
            </span>
          </Link>
        </div>
      </header>

      {/* Main 404 Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-accent text-primary flex items-center justify-center mb-6 shadow-xs ring-1 ring-primary/20">
          <FileQuestion className="w-8 h-8" />
        </div>

        <span className="text-sm font-semibold tracking-wider uppercase text-primary mb-2">
          404 Error
        </span>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-3">
          Page not found
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground max-w-md mb-8 leading-relaxed">
          Sorry, we couldn&apos;t find the clinical intake screen, consultation page, or resource you were looking for.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
          <Link href="/" className="w-full">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-10">
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </Button>
          </Link>
          <Link href="/patient/dashboard" className="w-full">
            <Button variant="outline" className="w-full border-border hover:border-primary hover:text-primary gap-2 h-10">
              <ArrowLeft className="w-4 h-4" />
              <span>Patient Portal</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-3 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} PreConsult. All rights reserved.</span>
          <span>Assistive Clinical Documentation Platform</span>
        </div>
      </footer>
    </main>
  );
}
