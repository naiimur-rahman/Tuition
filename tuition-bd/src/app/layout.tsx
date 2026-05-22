import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/providers/SessionProvider";
import BackButton from "@/components/BackButton";
import Footer from "@/components/Footer";

const headingFont = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const bodyFont = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TutorHire | Premium Tutor & Tuition Discovery",
  description: "Connect with verified tutors and find tuition jobs in Bangladesh using our interactive, premium map-based platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${headingFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const root = document.documentElement;
                const stored = localStorage.getItem('theme');
                const useDark = stored === 'dark';
                root.classList.toggle('dark', useDark);
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] font-sans transition-colors duration-300 selection:bg-emerald-400 selection:text-slate-950">
        <SessionProvider>
          <BackButton />
          {children}
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
