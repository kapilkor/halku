import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-inter, sans-serif)",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "10px", fontWeight: "bold" }}>
        HalkuLang
      </h1>
      <p style={{ fontSize: "1.2rem", marginBottom: "30px", color: "var(--text-secondary)" }}>
        The desi, beginner-friendly scripting language.
      </p>
      
      <Link
        href="/playground"
        style={{
          padding: "12px 28px",
          background: "linear-gradient(135deg, #15803d 0%, #22c55e 100%)",
          color: "white",
          textDecoration: "none",
          borderRadius: "var(--radius-md, 8px)",
          fontSize: "1.1rem",
          fontWeight: 600,
          boxShadow: "0 4px 14px rgba(34,197,94,0.3)",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
      >
        Playground
      </Link>
    </main>
  );
}
