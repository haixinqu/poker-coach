"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const NAV_LINKS = [
  { href: "/chat", label: "Coach" },
  { href: "/sessions", label: "Sessions" },
  { href: "/history", label: "History" },
  { href: "/dashboard", label: "Dashboard" },
];

function SpadeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2C12 2 3 9 3 14C3 17.3 5.7 20 9 20C9.9 20 10.8 19.8 11.5 19.3L11 22H13L12.5 19.3C13.2 19.8 14.1 20 15 20C18.3 20 21 17.3 21 14C21 9 12 2 12 2Z"
        fill="url(#spade-nav)"
      />
      <defs>
        <linearGradient id="spade-nav" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#16c784" />
          <stop offset="1" stopColor="#f0b429" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className="text-sm transition-colors duration-150 relative"
      style={{ color: active ? "var(--text)" : "var(--text-3)" }}
    >
      {label}
      {active && (
        <span
          className="absolute -bottom-[17px] left-0 right-0 h-px"
          style={{ background: "var(--green)" }}
        />
      )}
    </Link>
  );
}

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <nav
        className="flex items-center gap-6 px-4 md:px-6 h-14 shrink-0"
        style={{
          borderBottom: "1px solid var(--border)",
          background: "rgba(8,8,10,0.85)",
          backdropFilter: "blur(16px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <Link href="/chat" className="flex items-center gap-2 mr-1 shrink-0">
          <span className="animate-glow-logo">
            <SpadeIcon />
          </span>
          <span
            className="text-sm font-semibold tracking-tight hidden sm:block"
            style={{ color: "var(--text)" }}
          >
            Poker<span className="gradient-text">Coach</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.href} href={l.href} label={l.label} />
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          {user && (
            <span
              className="text-xs hidden sm:inline truncate max-w-[140px]"
              style={{ color: "var(--text-3)" }}
              title={user.email}
            >
              {user.email}
            </span>
          )}
          {user && (
            <button
              onClick={handleLogout}
              className="text-xs px-2.5 py-1 rounded-lg transition-colors hidden sm:inline-block"
              style={{
                color: "var(--text-3)",
                border: "1px solid var(--border)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-2)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
            >
              Sign out
            </button>
          )}
          <button
            className="md:hidden p-2 flex flex-col gap-1.5"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="menu"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="block w-5 h-px transition-all duration-200"
                style={{
                  background: "var(--text-2)",
                  opacity: i === 1 && menuOpen ? 0 : 1,
                  transform:
                    menuOpen
                      ? i === 0
                        ? "rotate(45deg) translate(2px, 2px)"
                        : i === 2
                          ? "rotate(-45deg) translate(2px, -2px)"
                          : "none"
                      : "none",
                }}
              />
            ))}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute top-14 left-0 right-0 px-4 py-3 flex flex-col gap-1 md:hidden"
            style={{
              background: "rgba(8,8,10,0.97)",
              borderBottom: "1px solid var(--border)",
              backdropFilter: "blur(16px)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150"
                style={{
                  color: pathname === l.href ? "var(--green)" : "var(--text-2)",
                  background:
                    pathname === l.href
                      ? "rgba(22,199,132,0.08)"
                      : "transparent",
                }}
              >
                {l.label}
              </Link>
            ))}
            {user && (
              <button
                onClick={handleLogout}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors duration-150"
                style={{ color: "var(--text-3)" }}
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
