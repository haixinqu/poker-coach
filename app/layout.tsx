import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NavBar from "@/components/NavBar";
import ParticleBackground from "@/components/ParticleBackground";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "PokerCoach", template: "%s · PokerCoach" },
  description: "Your personal AI poker coach — post-session hand review and leak tracking.",
};

const BG_SUITS = [
  { char: "♠", top: "4%",   left: "1%",   size: "20rem", rot: "-12deg", op: 0.022 },
  { char: "♥", top: "28%",  right: "-1%", size: "26rem", rot: "18deg",  op: 0.018, color: "#f87171" },
  { char: "♦", bottom: "14%", left: "-1%", size: "18rem", rot: "-8deg",  op: 0.022, color: "#f0b429" },
  { char: "♣", bottom: "6%", right: "1%", size: "22rem", rot: "22deg",  op: 0.020 },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full flex flex-col">

        {/* Layer 0: particles */}
        <ParticleBackground />

        {/* Layer 0: ambient glows */}
        <div aria-hidden style={{
          position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
          background:
            "radial-gradient(ellipse 70% 55% at 15% 0%, rgba(22,199,132,0.09) 0%, transparent 65%), " +
            "radial-gradient(ellipse 55% 45% at 85% 100%, rgba(240,180,41,0.06) 0%, transparent 65%)",
        }} />

        {/* Layer 0: giant suit decorations */}
        {BG_SUITS.map((s, i) => (
          <div
            key={i}
            aria-hidden
            className="animate-float"
            style={{
              position: "fixed",
              top:    s.top,
              left:   s.left,
              right:  s.right,
              bottom: s.bottom,
              fontSize: s.size,
              color: s.color ?? "var(--text)",
              opacity: s.op,
              lineHeight: 1,
              zIndex: 0,
              pointerEvents: "none",
              userSelect: "none",
              "--rot": s.rot,
              transform: `rotate(${s.rot})`,
              animationDelay: `${i * 1.8}s`,
              animationDuration: `${8 + i * 1.5}s`,
            } as React.CSSProperties}
          >
            {s.char}
          </div>
        ))}

        {/* Layer 1: app content */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1, minHeight: "100vh" }}>
          <NavBar />
          <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
        </div>

      </body>
    </html>
  );
}
