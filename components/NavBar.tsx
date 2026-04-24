"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const NAV_LINKS = [
  { href: "/chat",      label: "Coach"     },
  { href: "/sessions",  label: "Sessions"  },
  { href: "/history",   label: "History"   },
  { href: "/dashboard", label: "Dashboard" },
];

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser]         = useState<User | null>(null);
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setUser(s?.user ?? null));
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (pathname === "/login") return null;

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <nav
        style={{
          position: "sticky", top: 0, zIndex: 50,
          height: 60,
          display: "flex", alignItems: "center",
          padding: "0 1.5rem",
          gap: "2rem",
          background: "rgba(5,5,9,0.75)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Logo */}
        <Link href="/chat" style={{ display: "flex", alignItems: "center", gap: "0.6rem", textDecoration: "none", flexShrink: 0 }}>
          <span className="animate-glow-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C12 2 3 9 3 14C3 17.3 5.7 20 9 20C9.9 20 10.8 19.8 11.5 19.3L11 22H13L12.5 19.3C13.2 19.8 14.1 20 15 20C18.3 20 21 17.3 21 14C21 9 12 2 12 2Z"
                fill="url(#logo-g)" />
              <defs>
                <linearGradient id="logo-g" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#16c784" /><stop offset="1" stopColor="#f0b429" />
                </linearGradient>
              </defs>
            </svg>
          </span>
          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
            Poker<span className="gradient-text">Coach</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }} className="hidden md:flex">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  fontSize: "0.85rem",
                  fontWeight: active ? 600 : 400,
                  color: active ? "var(--text)" : "var(--text-2)",
                  padding: "0.4rem 0.85rem",
                  borderRadius: "10px",
                  textDecoration: "none",
                  background: active ? "rgba(255,255,255,0.07)" : "transparent",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {user && (
            <>
              <span className="hidden sm:block" style={{ fontSize: "0.75rem", color: "var(--text-3)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-3)",
                  padding: "0.35rem 0.85rem",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "transparent",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "var(--text-2)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "var(--text-3)"; }}
              >
                Sign out
              </button>
            </>
          )}
          {/* Mobile hamburger */}
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(v => !v)}
            style={{ padding: "0.4rem", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", gap: 5 }}
          >
            {[0,1,2].map(i => (
              <span key={i} style={{
                display: "block", width: 18, height: 1.5,
                background: "var(--text-2)",
                borderRadius: 2,
                transition: "all 0.2s",
                opacity: i === 1 && menuOpen ? 0 : 1,
                transform: menuOpen ? (i===0 ? "rotate(45deg) translate(2px,2px)" : i===2 ? "rotate(-45deg) translate(2px,-2px)" : "none") : "none",
              }} />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden"
          style={{
            position: "fixed", top: 60, left: 0, right: 0, zIndex: 49,
            background: "rgba(5,5,9,0.96)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            padding: "0.75rem 1rem",
          }}
          onClick={() => setMenuOpen(false)}
        >
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block",
                padding: "0.75rem 1rem",
                borderRadius: 10,
                fontSize: "0.9rem",
                fontWeight: pathname === href ? 600 : 400,
                color: pathname === href ? "var(--green)" : "var(--text-2)",
                background: pathname === href ? "rgba(22,199,132,0.08)" : "transparent",
                textDecoration: "none",
                marginBottom: 2,
              }}
            >
              {label}
            </Link>
          ))}
          {user && (
            <button
              onClick={handleLogout}
              style={{ display: "block", width: "100%", textAlign: "left", padding: "0.75rem 1rem", borderRadius: 10, fontSize: "0.9rem", color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", marginTop: 4 }}
            >
              Sign out
            </button>
          )}
        </div>
      )}
    </>
  );
}
