import type { Metadata } from "next";
import { Roboto_Condensed } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import { cn } from "@/lib/utils";

const roboto_Condensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  style: ["italic", "normal"],
  variable: '--font-roboto-condensed',
});

export const metadata: Metadata = {
  title: "PreConsult - Mess to Story",
  description: "Turning a precarious patient story into a coherent clinical case.",
  icons: {
    icon: "/icon.png"
  }
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider
      appearance={{
        layout: {
          unsafe_disableDevelopmentModeWarnings: true,
        },
        theme: shadcn
      }}
    >
      <html
        lang="en"
        className={cn("h-full", "antialiased", roboto_Condensed.className,)}
        suppressHydrationWarning
      >
        <body className="min-h-full flex flex-col">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}