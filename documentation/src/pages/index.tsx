import type { ReactNode } from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import Link from "@docusaurus/Link";
import { useColorMode } from "@docusaurus/theme-common";
import Layout from "@theme/Layout";

// ---------------------------------------------------------------------------
// Interactive Hero – grid of blocks that flip from black→white on hover.
// The goose logo is rendered *twice* (black on white, white on black) and
// each block acts as a clip mask so the logo colour inverts per-tile.
// ---------------------------------------------------------------------------

const CELL = 48; // px per cell

function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ cols: 0, rows: 0, width: 0, height: 0 });
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const { colorMode } = useColorMode();

  // Measure container and compute grid
  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.offsetWidth;
      const cols = Math.floor(w / CELL);
      const rows = 10; // fixed row count for hero height
      setDims({ cols, rows, width: cols * CELL, height: rows * CELL });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const handleMouseEnter = useCallback((idx: number) => {
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  }, []);

  const isDark = colorMode === "dark";
  const bgDefault = isDark ? "#000000" : "#000000";
  const bgFlipped = isDark ? "#1e1e1e" : "#ffffff";
  const logoDefault = isDark ? "/img/goose-logo-white.png" : "/img/goose-logo-white.png";
  const logoFlipped = isDark ? "/img/goose-logo-black.png" : "/img/goose-logo-black.png";

  const { cols, rows, width, height } = dims;
  const total = cols * rows;

  return (
    <header
      ref={containerRef}
      style={{
        width: "100%",
        overflow: "hidden",
        background: bgDefault,
        position: "relative",
        userSelect: "none",
      }}
    >
      {cols > 0 && (
        <div
          style={{
            position: "relative",
            width: width,
            height: height,
            margin: "0 auto",
          }}
        >
          {/* Layer 1: default-state logo (white logo on black bg) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            <img
              src={logoDefault}
              alt=""
              style={{
                height: height * 0.45,
                width: "auto",
                maxWidth: "80%",
                objectFit: "contain",
              }}
            />
          </div>

          {/* Layer 2: flipped-state tiles + logo (black logo on white bg) */}
          {/* Each flipped tile is a clip rect that reveals this layer */}
          <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }}>
            <svg
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
              style={{ position: "absolute", inset: 0 }}
            >
              <defs>
                <clipPath id="flipped-clip">
                  {Array.from(flipped).map((idx) => {
                    const col = idx % cols;
                    const row = Math.floor(idx / cols);
                    return (
                      <rect
                        key={idx}
                        x={col * CELL}
                        y={row * CELL}
                        width={CELL}
                        height={CELL}
                      />
                    );
                  })}
                </clipPath>
              </defs>
              {/* White (or dark-subtle) rectangles behind flipped tiles */}
              <g clipPath="url(#flipped-clip)">
                <rect width={width} height={height} fill={bgFlipped} />
              </g>
            </svg>
            {/* Flipped logo clipped to same region */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                clipPath: "url(#flipped-clip)",
              }}
            >
              <img
                src={logoFlipped}
                alt=""
                style={{
                  height: height * 0.45,
                  width: "auto",
                  maxWidth: "80%",
                  objectFit: "contain",
                }}
              />
            </div>
          </div>

          {/* Layer 3: invisible interactive grid on top */}
          <div
            style={{
              position: "relative",
              zIndex: 3,
              display: "grid",
              gridTemplateColumns: `repeat(${cols}, ${CELL}px)`,
              gridTemplateRows: `repeat(${rows}, ${CELL}px)`,
              width: width,
              height: height,
            }}
          >
            {Array.from({ length: total }, (_, i) => (
              <div
                key={i}
                onMouseEnter={() => handleMouseEnter(i)}
                style={{
                  width: CELL,
                  height: CELL,
                  cursor: "crosshair",
                  // Faint grid lines
                  boxShadow: `inset 0 0 0 0.5px ${isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.06)"}`,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

// ---------------------------------------------------------------------------
// Below-the-fold content — same information, elevated design
// ---------------------------------------------------------------------------

function BadgePill({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 18px",
        borderRadius: 999,
        border: "1px solid var(--border-subtle)",
        fontSize: "0.78rem",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: "var(--text-subtle)",
        marginBottom: "2rem",
      }}
    >
      {children}
    </span>
  );
}

function Intro() {
  return (
    <section
      style={{
        padding: "5rem 2rem 3rem",
        textAlign: "center",
        maxWidth: 820,
        margin: "0 auto",
      }}
    >
      <BadgePill>Open Source · Apache 2.0 · Linux Foundation</BadgePill>
      <h1
        style={{
          fontSize: "clamp(2rem, 5vw, 3.2rem)",
          fontWeight: 700,
          lineHeight: 1.15,
          color: "var(--text-prominent)",
          marginBottom: "1.25rem",
          letterSpacing: "-0.02em",
        }}
      >
        Your native open source AI&nbsp;agent
      </h1>
      <p
        style={{
          fontSize: "1.2rem",
          lineHeight: 1.7,
          color: "var(--text-subtle)",
          maxWidth: 600,
          margin: "0 auto 2.5rem",
        }}
      >
        Desktop app, CLI, and API — for code, workflows, and everything in
        between.
      </p>
      <div
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "3.5rem",
        }}
      >
        <Link
          className="button button--primary button--lg"
          to="docs/getting-started/installation"
        >
          Install goose
        </Link>
        <Link
          className="button button--outline button--lg"
          to="docs/quickstart"
          style={{ borderColor: "var(--border-standard)", color: "var(--text-standard)" }}
        >
          Quickstart
        </Link>
      </div>
      <div
        style={{
          display: "flex",
          gap: "3rem",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {[
          ["38k+", "GitHub stars"],
          ["400+", "Contributors"],
          ["70+", "MCP extensions"],
        ].map(([num, label], i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "1.6rem",
                fontWeight: 700,
                color: "var(--text-prominent)",
                lineHeight: 1,
              }}
            >
              {num}
            </div>
            <div
              style={{
                fontSize: "0.82rem",
                color: "var(--text-subtle)",
                marginTop: 4,
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Feature cards
// ---------------------------------------------------------------------------

type CardProps = {
  icon: string;
  title: string;
  children: ReactNode;
  large?: boolean;
};

function Card({ icon, title, children, large }: CardProps) {
  return (
    <div
      style={{
        padding: large ? "2rem" : "1.5rem",
        borderRadius: 16,
        border: "1px solid var(--border-subtle)",
        background: "var(--background-app)",
        transition: "border-color 0.25s, box-shadow 0.25s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border-standard)";
        e.currentTarget.style.boxShadow = "0 2px 24px rgba(0,0,0,0.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border-subtle)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ fontSize: large ? "1.6rem" : "1.3rem", marginBottom: large ? "0.8rem" : "0.5rem" }}>
        {icon}
      </div>
      <h3
        style={{
          fontSize: large ? "1.15rem" : "0.95rem",
          fontWeight: 600,
          color: "var(--text-prominent)",
          marginBottom: large ? "0.6rem" : "0.4rem",
        }}
      >
        {title}
      </h3>
      <div
        style={{
          fontSize: large ? "0.92rem" : "0.85rem",
          color: "var(--text-subtle)",
          lineHeight: 1.65,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function FeaturesSection() {
  return (
    <section style={{ padding: "4rem 2rem", maxWidth: 1100, margin: "0 auto" }}>
      <SectionHeader
        title="What goose does"
        subtitle="goose is a general-purpose AI agent that runs on your machine. Not just for code — use it for research, writing, automation, data analysis, or anything you need to get done."
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <Card icon="🖥️" title="Desktop app, CLI, and API" large>
          <p style={{ margin: 0 }}>
            A native desktop app for macOS, Linux, and Windows. A full CLI for
            terminal workflows. An API to embed it anywhere. Built in Rust for
            performance and portability.
          </p>
        </Card>
        <Card icon="🔌" title="Extensible" large>
          <p style={{ margin: 0 }}>
            Connect to 70+ extensions — databases, APIs, browsers, GitHub, Google
            Drive, and more — via the{" "}
            <a href="https://modelcontextprotocol.io/" target="_blank" rel="noopener">
              Model Context Protocol
            </a>{" "}
            open standard. Add community <Link to="/skills">skills</Link>, or{" "}
            <Link to="/docs/tutorials/custom-extensions">build your own</Link>.
          </p>
        </Card>
        <Card icon="🤖" title="Any LLM, including your subscriptions" large>
          <p style={{ margin: 0 }}>
            Works with 15+ providers — Anthropic, OpenAI, Google, Ollama,
            OpenRouter, Azure, Bedrock, and more. Use API keys or your existing
            Claude, ChatGPT, or Gemini subscriptions via{" "}
            <Link to="/docs/guides/acp-providers">ACP</Link>.
          </p>
        </Card>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.25rem",
        }}
      >
        <Card icon="📋" title="Recipes">
          <p style={{ margin: 0 }}>
            Capture workflows as portable YAML configs. Share with your team, run
            in CI, include instructions, extensions, parameters, and{" "}
            <Link to="/docs/guides/recipes/session-recipes">subrecipes</Link>.
          </p>
        </Card>
        <Card icon="🧩" title="MCP Apps">
          <p style={{ margin: 0 }}>
            Extensions can render interactive UIs directly inside goose Desktop —
            buttons, forms, visualizations. A new way to build{" "}
            <Link to="/docs/tutorials/building-mcp-apps">agent-powered tools</Link>.
          </p>
        </Card>
        <Card icon="🔀" title="Subagents">
          <p style={{ margin: 0 }}>
            Spawn independent{" "}
            <Link to="/docs/guides/subagents">subagents</Link> to handle tasks in
            parallel — code review, research, file processing — keeping the main
            conversation clean.
          </p>
        </Card>
        <Card icon="🔒" title="Security">
          <p style={{ margin: 0 }}>
            Prompt injection detection, tool permission controls, sandbox mode,
            and an{" "}
            <Link to="/docs/guides/security/adversary-mode">adversary reviewer</Link>{" "}
            that watches for unsafe actions.
          </p>
        </Card>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section header helper
// ---------------------------------------------------------------------------

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
      <h2
        style={{
          fontSize: "1.75rem",
          fontWeight: 600,
          color: "var(--text-prominent)",
          marginBottom: subtitle ? "0.75rem" : 0,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            maxWidth: 680,
            margin: "0 auto",
            color: "var(--text-subtle)",
            fontSize: "1.05rem",
            lineHeight: 1.65,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Standards
// ---------------------------------------------------------------------------

function StandardsSection() {
  return (
    <section
      style={{
        padding: "4rem 2rem",
        background: "var(--background-subtle)",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SectionHeader title="Built on open standards" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
            marginTop: "1rem",
          }}
        >
          {[
            {
              title: "Model Context Protocol",
              body: (
                <>
                  <a href="https://modelcontextprotocol.io/" target="_blank" rel="noopener">
                    MCP
                  </a>{" "}
                  is the open standard for connecting AI agents to tools and data
                  sources. goose was one of the earliest adopters and has one of the
                  deepest integrations in the ecosystem — with 70+ documented
                  extensions and growing.
                </>
              ),
              link: { to: "/docs/category/mcp-servers", label: "Browse MCP extensions →" },
            },
            {
              title: "Agent Client Protocol",
              body: (
                <>
                  <a href="https://agentclientprotocol.com/" target="_blank" rel="noopener">
                    ACP
                  </a>{" "}
                  is a standard for communicating with coding agents. goose works as
                  an ACP server — connect from Zed, JetBrains, or VS Code — and can
                  use ACP agents like Claude Code and Codex as providers.
                </>
              ),
              link: { to: "/docs/guides/acp-clients", label: "goose as ACP server →" },
            },
            {
              title: "Agentic AI Foundation",
              body: (
                <>
                  goose is part of the{" "}
                  <a href="https://aaif.io/" target="_blank" rel="noopener">
                    Agentic AI Foundation
                  </a>{" "}
                  at the Linux Foundation — ensuring the project remains
                  vendor-neutral, community-governed, and open for the long term.
                </>
              ),
              link: {
                to: "https://aaif.io/",
                label: "Learn about AAIF →",
                external: true,
              },
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                padding: "1.75rem",
                borderRadius: 16,
                border: "1px solid var(--border-subtle)",
                background: "var(--background-app)",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <h3
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "var(--text-prominent)",
                  margin: 0,
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "var(--text-subtle)",
                  lineHeight: 1.65,
                  margin: 0,
                  flex: 1,
                }}
              >
                {item.body}
              </p>
              {"external" in item.link ? (
                <a href={item.link.to} target="_blank" rel="noopener" style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                  {item.link.label}
                </a>
              ) : (
                <Link to={item.link.to} style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                  {item.link.label}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Community
// ---------------------------------------------------------------------------

function CommunitySection() {
  return (
    <section style={{ padding: "4rem 2rem", maxWidth: 1100, margin: "0 auto" }}>
      <SectionHeader
        title="Community"
        subtitle="An active community of developers, contributors, and users building extensions, sharing recipes, and pushing the boundaries of what local AI agents can do."
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {[
          {
            href: "https://discord.gg/goose-oss",
            external: true,
            icon: "💬",
            title: "Discord",
            desc: "Ask questions, share what you've built, get help from the community.",
          },
          {
            href: "https://github.com/aaif-goose/goose",
            external: true,
            icon: "🐙",
            title: "GitHub",
            desc: "Star, fork, file issues, contribute code. goose is built in the open.",
          },
          {
            href: "/extensions",
            icon: "🧩",
            title: "Extensions",
            desc: "Browse community-built MCP extensions and add your own.",
          },
          {
            href: "/blog",
            icon: "📝",
            title: "Blog",
            desc: "Tutorials, deep dives, release notes, and community spotlights.",
          },
        ].map((item, i) => {
          const inner = (
            <div
              style={{
                padding: "1.5rem",
                borderRadius: 16,
                border: "1px solid var(--border-subtle)",
                background: "var(--background-app)",
                transition: "border-color 0.25s, transform 0.25s",
                height: "100%",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--border-standard)";
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-subtle)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>{item.icon}</div>
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "var(--text-prominent)",
                  marginBottom: "0.4rem",
                }}
              >
                {item.title}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-subtle)", lineHeight: 1.55, margin: 0 }}>
                {item.desc}
              </p>
            </div>
          );

          return item.external ? (
            <a
              key={i}
              href={item.href}
              target="_blank"
              rel="noopener"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {inner}
            </a>
          ) : (
            <Link key={i} to={item.href} style={{ textDecoration: "none", color: "inherit" }}>
              {inner}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Install
// ---------------------------------------------------------------------------

function InstallSection() {
  return (
    <section style={{ padding: "4rem 2rem", background: "var(--background-subtle)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <SectionHeader title="Get started" />
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <Link
            className="button button--primary button--lg"
            to="docs/getting-started/installation"
          >
            Download the desktop app
          </Link>
          <p style={{ marginTop: "0.75rem", fontSize: "0.9rem", color: "var(--text-subtle)" }}>
            Available for macOS, Linux, and Windows
          </p>
        </div>
        <div
          style={{
            textAlign: "center",
            marginBottom: "1.75rem",
            fontSize: "0.85rem",
            color: "var(--text-subtle)",
          }}
        >
          or install the CLI
        </div>
        <div
          style={{
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid var(--border-subtle)",
            background: "var(--grey-10)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 6,
              padding: "12px 16px",
              background: "var(--grey-20)",
            }}
          >
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--grey-50)" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--grey-50)" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--grey-50)" }} />
          </div>
          <pre
            style={{
              padding: "1.25rem 1.5rem",
              margin: 0,
              fontSize: "0.85rem",
              lineHeight: 1.7,
              color: "#e0e0e0",
              overflowX: "auto",
            }}
          >
            <code>
              {`curl -fsSL https://github.com/aaif-goose/goose/releases/download/stable/download_cli.sh | bash`}
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Video
// ---------------------------------------------------------------------------

function VideoSection() {
  return (
    <section style={{ padding: "4rem 2rem", maxWidth: 900, margin: "0 auto" }}>
      <SectionHeader title="See goose in action" />
      <div style={{ maxWidth: 800, margin: "0 auto", aspectRatio: "16/9" }}>
        <iframe
          src="https://www.youtube.com/embed/D-DpDunrbpo"
          style={{ width: "100%", height: "100%", border: "none", borderRadius: 16 }}
          title="vibe coding with goose"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Home(): ReactNode {
  return (
    <Layout description="Your native open source AI agent. Desktop app, CLI, and API — for code, workflows, and everything in between.">
      <HeroSection />
      <main>
        <Intro />
        <FeaturesSection />
        <StandardsSection />
        <CommunitySection />
        <InstallSection />
        <VideoSection />
      </main>
    </Layout>
  );
}
