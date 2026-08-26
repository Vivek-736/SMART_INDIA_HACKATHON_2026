import type { Metadata } from "next";
import { Roboto_Condensed } from "next/font/google";
import "./globals.css";

const roboto_Condensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-roboto-condensed',
});

export const metadata: Metadata = {
  title: "PreConsult - Mess to Story",
  description: "Turning a messy patient story into a coherent clinical case.",
  icons: {
    icon: "/icon.png"
  }
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${roboto_Condensed.className} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}