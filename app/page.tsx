"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import DocsModal from "@/components/ui/DocsModal";

const cards = [
  {
    title: "Desi-Friendly Syntax",
    text: "Use intuitive Hindi-English style keywords to learn and build faster.",
    icon: "🇮🇳",
  },
  {
    title: "Instant Playground",
    text: "Write code, run instantly, and share your snippets with one click.",
    icon: "⚡",
  },
  {
    title: "Built for Learning",
    text: "Simple flow, clear output, and a playful experience for beginners.",
    icon: "🎓",
  },
];

export default function Home() {
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  return (
    <div style={{ height: "100svh", overflow: "hidden", background: "#050505", padding: 16 }}>
      <main
        style={{
          position: "relative",
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
          borderRadius: 18,
          border: "1px solid rgba(255,255,255,0.1)",
          background: "#0b0b0b",
          color: "#f4f4f5",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.03), 0 24px 80px rgba(0,0,0,0.45)",
        }}
      >
        <div style={{ position: "fixed", top: 0, right: 0, zIndex: 0, height: 900, width: "100%", opacity: 0.78 }}>
          <Image
            src="/logo/kapil.png"
            alt="Halku Background"
            fill
            priority
            style={{ objectFit: "contain", objectPosition: "right top", pointerEvents: "none" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to bottom, transparent, rgba(11,11,11,0.28), #0b0b0b)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to right, rgba(11,11,11,0.92), transparent, transparent)",
            }}
          />
        </div>

        <nav
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(11,11,11,0.72)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              margin: "0 auto",
              height: 64,
              maxWidth: 1280,
              padding: "0 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #ea2845, #f0536c)",
                  display: "grid",
                  placeItems: "center",
                  boxShadow: "0 8px 18px rgba(234,40,69,0.2)",
                }}
              >
                <span style={{ fontWeight: 900, color: "#fff", fontSize: 18 }}>H</span>
              </div>
              <span style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
                Halku<span style={{ color: "#71717a", fontWeight: 500 }}>Lang</span>
              </span>
            </div>

            {/* <div style={{ display: "flex", alignItems: "center", gap: 24, color: "#a1a1aa", fontSize: 14, fontWeight: 600 }}>
              <Link href="#features" style={{ color: "inherit", textDecoration: "none" }}>Features</Link>
              <button onClick={() => setIsDocsOpen(true)}>
                Docs
              </button>
            </div> */}

            <Link
              href="/playground"
              style={{
                flexShrink: 0,
                borderRadius: 999,
                background: "#fff",
                padding: "8px 20px",
                fontSize: 14,
                fontWeight: 700,
                color: "#111",
                textDecoration: "none",
              }}
            >
              Get Started
            </Link>
          </div>
        </nav>

        <section style={{ position: "relative", zIndex: 1, margin: "0 auto", maxWidth: 1280, padding: "96px 24px 128px" }}>
          <div style={{ maxWidth: 780 }}>
            {/* <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                borderRadius: 999,
                border: "1px solid rgba(239,68,68,0.2)",
                background: "rgba(239,68,68,0.1)",
                padding: "4px 14px",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "#f87171",
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: 999, background: "#ef4444", boxShadow: "0 0 10px #ef4444" }} />
              v1.0 is Live
            </div> */}

            <h1 style={{ marginTop: 24, fontSize: "clamp(3rem, 8vw, 7rem)", fontWeight: 800, lineHeight: 1.02, letterSpacing: "-0.03em", color: "#fff" }}>
              The <span style={{ background: "linear-gradient(90deg, #ea2845, #f16c81)", WebkitBackgroundClip: "text", color: "transparent" }}>Desi</span> Way to
              <br />
              Ship Modern Code.
            </h1>

            <p style={{ marginTop: 32, maxWidth: 720, fontSize: 24, lineHeight: 1.6, color: "#a1a1aa" }}>
              A powerful, sleek JavaScript playground designed for the next generation of Indian developers. No boilerplate, just pure logic.
            </p>

            <div style={{ marginTop: 40, display: "flex", flexWrap: "wrap", gap: 14 }}>
              <Link
                href="/playground"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 10,
                  background: "#ea2845",
                  padding: "14px 28px",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#fff",
                  textDecoration: "none",
                  boxShadow: "0 10px 24px rgba(234,40,69,0.25)",
                }}
              >
                Open Playground
              </Link>
              <Link
                href="#features"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.06)",
                  backdropFilter: "blur(5px)",
                  padding: "14px 28px",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#fff",
                  textDecoration: "none",
                }}
              >
                How it works
              </Link>
            </div>
          </div>
        </section>

        <section id="features" style={{ position: "relative", zIndex: 1, margin: "0 auto", maxWidth: 1280, padding: "0 24px 96px" }}>
          <div
            style={{
              display: "grid",
              gap: 24,
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            }}
          >
            {cards.map((card) => (
              <article
                key={card.title}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "linear-gradient(to bottom, rgba(255,255,255,0.03), transparent)",
                  padding: 32,
                }}
              >
                <div style={{ fontSize: 30, marginBottom: 14 }}>{card.icon}</div>
                <h3 style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>
                  {card.title}
                </h3>
                <p style={{ marginTop: 14, lineHeight: 1.7, color: "#a1a1aa" }}>
                  {card.text}
                </p>
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 2,
                    background: "linear-gradient(to right, #ea2845, #f16c81)",
                    opacity: 0.55,
                  }}
                />
              </article>
            ))}
          </div>
        </section>

        <footer style={{ marginTop: 40, borderTop: "1px solid rgba(255,255,255,0.08)", background: "#080808", padding: "48px 24px" }}>
          <div
            style={{
              margin: "0 auto",
              maxWidth: 1280,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div style={{ fontSize: 14, color: "#71717a", fontWeight: 500 }}>
              © {new Date().getFullYear()} HalkuLang Project.
            </div>
            <div style={{ display: "flex", gap: 20, fontSize: 14, color: "#a1a1aa" }}>
              <Link href="#" style={{ color: "inherit", textDecoration: "none" }}>GitHub</Link>
              <Link href="#" style={{ color: "inherit", textDecoration: "none" }}>Twitter</Link>
              <Link href="#" style={{ color: "inherit", textDecoration: "none" }}>Community</Link>
            </div>
          </div>
        </footer>
      </main>

      <DocsModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
    </div>
  );
}