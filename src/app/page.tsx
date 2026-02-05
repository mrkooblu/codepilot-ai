"use client";

import { useEffect, useRef, useCallback } from "react";
import Link from "next/link";

export default function Home() {
  const navRef = useRef<HTMLElement>(null);

  // Nav scroll effect
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const handleScroll = () => {
      nav.classList.toggle("scrolled", window.scrollY > 16);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // FAQ accordion
  const handleFaqClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const btn = e.currentTarget;
      const item = btn.parentElement;
      if (!item) return;

      const isOpen = item.classList.contains("open");

      document.querySelectorAll(".faq-item.open").forEach((o) => {
        o.classList.remove("open");
        o.querySelector(".faq-question")?.setAttribute(
          "aria-expanded",
          "false"
        );
      });

      if (!isOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    },
    []
  );

  // Billing toggle
  const handleBillingClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const opt = e.currentTarget;
      document.querySelectorAll(".billing-option").forEach((o) => {
        o.classList.remove("active");
      });
      opt.classList.add("active");

      const billing = opt.getAttribute("data-billing");

      document.querySelectorAll("[data-monthly]").forEach((el) => {
        (el as HTMLElement).textContent =
          billing === "annual"
            ? el.getAttribute("data-annual")
            : el.getAttribute("data-monthly");
      });

      document.querySelectorAll("[data-monthly-text]").forEach((el) => {
        (el as HTMLElement).textContent =
          billing === "annual"
            ? el.getAttribute("data-annual-text")
            : el.getAttribute("data-monthly-text");
      });
    },
    []
  );

  // Smooth scroll for anchor links
  const handleAnchorClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      const href = e.currentTarget.getAttribute("href");
      if (!href || !href.startsWith("#") || href === "#") return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    []
  );

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      {/* Navigation */}
      <nav ref={navRef} className="nav" role="navigation" aria-label="Main navigation">
        <div className="container">
          <Link href="/" className="nav-logo">
            CodePilot
          </Link>
          <ul className="nav-links">
            <li>
              <a href="#how-it-works" onClick={handleAnchorClick}>
                How It Works
              </a>
            </li>
            <li>
              <a href="#pricing" onClick={handleAnchorClick}>
                Pricing
              </a>
            </li>
            <li>
              <a href="#faq" onClick={handleAnchorClick}>
                FAQ
              </a>
            </li>
          </ul>
          <Link href="/sign-up" className="nav-cta">
            Get Started
          </Link>
        </div>
      </nav>

      <main id="main">
        {/* Hero */}
        <section className="hero">
          <div className="container">
            <p className="hero-overline reveal">
              <span className="live-dot"></span>CodePilot AI
            </p>
            <h1 className="reveal">
              Screenshot in.
              <br />
              Code out.
            </h1>
            <p className="hero-subtitle reveal">
              Drop a screenshot, pick your framework, get production-ready code.
              Unlimited for <strong>$19/mo</strong>.
            </p>
            <div className="hero-actions reveal">
              <Link href="/sign-up" className="btn-primary">
                Start Free
              </Link>
              <a
                href="#how-it-works"
                className="btn-secondary"
                onClick={handleAnchorClick}
              >
                See How It Works
              </a>
            </div>
            <div className="trust-bar reveal">
              <span>No credit card</span>
              <span className="divider">&middot;</span>
              <span>5 free generations/day</span>
              <span className="divider">&middot;</span>
              <span>4 frameworks</span>
            </div>

            <div className="hero-visual reveal">
              <div className="hero-visual-browser-bar">
                <div className="browser-dot red"></div>
                <div className="browser-dot yellow"></div>
                <div className="browser-dot green"></div>
                <div className="browser-url">codepilot.ai</div>
              </div>
              <div className="hero-visual-content">
                <div className="hero-visual-left">
                  <div className="hero-visual-label">Screenshot</div>
                  <div className="mockup-screenshot">
                    <div className="mockup-nav-bar">
                      <div className="mockup-logo"></div>
                      <div className="mockup-nav-links">
                        <div className="mockup-nav-link"></div>
                        <div className="mockup-nav-link"></div>
                        <div className="mockup-nav-link"></div>
                      </div>
                    </div>
                    <div className="mockup-hero-block">
                      <div className="mockup-heading"></div>
                      <div className="mockup-heading short"></div>
                      <div className="mockup-text-line"></div>
                      <div className="mockup-btn"></div>
                    </div>
                    <div className="mockup-cards">
                      <div className="mockup-card">
                        <div className="mockup-card-title"></div>
                        <div className="mockup-card-text"></div>
                        <div
                          className="mockup-card-text"
                          style={{ width: "70%" }}
                        ></div>
                      </div>
                      <div className="mockup-card">
                        <div className="mockup-card-title"></div>
                        <div className="mockup-card-text"></div>
                        <div
                          className="mockup-card-text"
                          style={{ width: "70%" }}
                        ></div>
                      </div>
                      <div className="mockup-card">
                        <div className="mockup-card-title"></div>
                        <div className="mockup-card-text"></div>
                        <div
                          className="mockup-card-text"
                          style={{ width: "70%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="hero-visual-right">
                  <div className="hero-visual-label">Generated Code</div>
                  <div className="mockup-code">
                    <div className="line">
                      <span className="line-num"> 1</span>
                      <span className="kw">import</span>{" "}
                      <span className="fn">React</span>{" "}
                      <span className="kw">from</span>{" "}
                      <span className="str">&apos;react&apos;</span>
                      <span className="punc">;</span>
                    </div>
                    <div className="line">
                      <span className="line-num"> 2</span>
                    </div>
                    <div className="line">
                      <span className="line-num"> 3</span>
                      <span className="kw">export default</span>{" "}
                      <span className="kw">function</span>{" "}
                      <span className="fn">Hero</span>
                      <span className="punc">() {"{"}</span>
                    </div>
                    <div className="line">
                      <span className="line-num"> 4</span>
                      {"  "}
                      <span className="kw">return</span>{" "}
                      <span className="punc">(</span>
                    </div>
                    <div className="line">
                      <span className="line-num"> 5</span>
                      {"    "}
                      <span className="punc">&lt;</span>
                      <span className="tag">section</span>{" "}
                      <span className="attr">className</span>
                      <span className="punc">=</span>
                      <span className="str">&quot;hero&quot;</span>
                      <span className="punc">&gt;</span>
                    </div>
                    <div className="line">
                      <span className="line-num"> 6</span>
                      {"      "}
                      <span className="punc">&lt;</span>
                      <span className="tag">nav</span>{" "}
                      <span className="attr">className</span>
                      <span className="punc">=</span>
                      <span className="str">&quot;nav&quot;</span>
                      <span className="punc">&gt;</span>
                    </div>
                    <div className="line">
                      <span className="line-num"> 7</span>
                      {"        "}
                      <span className="punc">&lt;</span>
                      <span className="tag">div</span>{" "}
                      <span className="attr">className</span>
                      <span className="punc">=</span>
                      <span className="str">&quot;logo&quot;</span>{" "}
                      <span className="punc">/&gt;</span>
                    </div>
                    <div className="line">
                      <span className="line-num"> 8</span>
                      {"        "}
                      <span className="punc">&lt;</span>
                      <span className="tag">ul</span>{" "}
                      <span className="attr">className</span>
                      <span className="punc">=</span>
                      <span className="str">&quot;links&quot;</span>
                      <span className="punc">&gt;</span>
                    </div>
                    <div className="line">
                      <span className="line-num"> 9</span>
                      {"          "}
                      <span className="punc">&lt;</span>
                      <span className="tag">li</span>
                      <span className="punc">&gt;</span>
                      <span className="txt">Features</span>
                      <span className="punc">&lt;/</span>
                      <span className="tag">li</span>
                      <span className="punc">&gt;</span>
                    </div>
                    <div className="line">
                      <span className="line-num">10</span>
                      {"          "}
                      <span className="punc">&lt;</span>
                      <span className="tag">li</span>
                      <span className="punc">&gt;</span>
                      <span className="txt">Pricing</span>
                      <span className="punc">&lt;/</span>
                      <span className="tag">li</span>
                      <span className="punc">&gt;</span>
                    </div>
                    <div className="line">
                      <span className="line-num">11</span>
                      {"        "}
                      <span className="punc">&lt;/</span>
                      <span className="tag">ul</span>
                      <span className="punc">&gt;</span>
                    </div>
                    <div className="line">
                      <span className="line-num">12</span>
                      {"      "}
                      <span className="punc">&lt;/</span>
                      <span className="tag">nav</span>
                      <span className="punc">&gt;</span>
                    </div>
                    <div className="line">
                      <span className="line-num">13</span>
                      {"      "}
                      <span className="punc">&lt;</span>
                      <span className="tag">h1</span>
                      <span className="punc">&gt;</span>
                      <span className="txt">Build faster</span>
                      <span className="punc">&lt;/</span>
                      <span className="tag">h1</span>
                      <span className="punc">&gt;</span>
                    </div>
                    <div className="line">
                      <span className="line-num">14</span>
                      {"      "}
                      <span className="punc">&lt;</span>
                      <span className="tag">p</span>
                      <span className="punc">&gt;</span>
                      <span className="txt">Ship with</span>
                    </div>
                    <div className="line">
                      <span className="line-num">15</span>
                      {"        "}
                      <span className="txt">confidence.</span>
                      <span className="punc">&lt;/</span>
                      <span className="tag">p</span>
                      <span className="punc">&gt;</span>
                    </div>
                    <div className="line">
                      <span className="line-num">16</span>
                      {"      "}
                      <span className="punc">&lt;</span>
                      <span className="tag">button</span>
                      <span className="punc">&gt;</span>
                    </div>
                    <div className="line">
                      <span className="line-num">17</span>
                      {"        "}
                      <span className="txt">Get Started</span>
                    </div>
                    <div className="line">
                      <span className="line-num">18</span>
                      {"      "}
                      <span className="punc">&lt;/</span>
                      <span className="tag">button</span>
                      <span className="punc">&gt;</span>
                    </div>
                    <div className="line">
                      <span className="line-num">19</span>
                      {"    "}
                      <span className="punc">&lt;/</span>
                      <span className="tag">section</span>
                      <span className="punc">&gt;</span>
                    </div>
                    <div className="line">
                      <span className="line-num">20</span>
                      {"  "}
                      <span className="punc">);</span>
                    </div>
                    <div className="line">
                      <span className="line-num">21</span>
                      <span className="punc">{"}"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="how-it-works" id="how-it-works">
          <div className="container">
            <div className="section-header reveal">
              <p className="overline">How It Works</p>
              <h2>Three steps. Thirty seconds.</h2>
              <p className="subtitle">
                No setup, no learning curve, no friction.
              </p>
            </div>
            <div className="steps-grid">
              <div className="step-card reveal">
                <div className="step-number">01</div>
                <h3>Drop your screenshot</h3>
                <p>
                  Drag and drop any image, paste from clipboard, or upload a
                  file. PNG, JPG, or any screenshot from any design tool.
                </p>
              </div>
              <div
                className="step-card reveal"
                style={{ transitionDelay: "0.1s" }}
              >
                <div className="step-number">02</div>
                <h3>Pick a framework</h3>
                <p>
                  Choose React, Vue, HTML + Tailwind, or plain HTML/CSS. The AI
                  generates clean, responsive code in your framework.
                </p>
              </div>
              <div
                className="step-card reveal"
                style={{ transitionDelay: "0.2s" }}
              >
                <div className="step-number">03</div>
                <h3>Copy and ship</h3>
                <p>
                  Copy the code to your clipboard, download the file, or export
                  as ZIP. The code is yours to deploy anywhere.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why CodePilot */}
        <section className="why-section" id="why">
          <div className="container">
            <div className="section-header reveal">
              <p className="overline">Why CodePilot</p>
              <h2>Built for developers who ship.</h2>
            </div>
            <div className="features-grid">
              <div className="feature-card reveal">
                <h3>Truly unlimited</h3>
                <p>
                  $19/month for unlimited conversions. No credits, no tokens, no
                  hidden costs. Fix AI mistakes without paying extra.
                </p>
              </div>
              <div
                className="feature-card reveal"
                style={{ transitionDelay: "0.1s" }}
              >
                <h3>Production-ready output</h3>
                <p>
                  Clean, formatted code with responsive layouts and proper
                  semantics. Not verbose AI-generated spaghetti.
                </p>
              </div>
              <div
                className="feature-card reveal"
                style={{ transitionDelay: "0.1s" }}
              >
                <h3>Your framework, your code</h3>
                <p>
                  React, Vue, HTML + Tailwind, or plain HTML/CSS. Not locked
                  into one ecosystem. Deploy anywhere.
                </p>
              </div>
              <div
                className="feature-card reveal"
                style={{ transitionDelay: "0.2s" }}
              >
                <h3>Simple by design</h3>
                <p>
                  No IDE to learn. No deployment pipeline. No backend
                  complexity. Drop a screenshot, get code, ship it.
                </p>
              </div>
            </div>

            <div className="comparison-wrapper reveal">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>CodePilot</th>
                    <th>Others</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Unlimited usage</td>
                    <td className="check">&#10003;</td>
                    <td className="x-mark">Credit-metered</td>
                  </tr>
                  <tr>
                    <td>Flat-rate pricing</td>
                    <td className="check">$19/mo</td>
                    <td className="x-mark">$20&#8211;26 + overages</td>
                  </tr>
                  <tr>
                    <td>Free retries</td>
                    <td className="check">&#10003;</td>
                    <td className="x-mark">Each retry costs credits</td>
                  </tr>
                  <tr>
                    <td>Multi-framework</td>
                    <td className="check">4 frameworks</td>
                    <td className="x-mark">1&#8211;2 frameworks</td>
                  </tr>
                  <tr>
                    <td>No lock-in</td>
                    <td className="check">Deploy anywhere</td>
                    <td className="x-mark">Ecosystem lock-in</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="social-proof-line reveal">
              10,000+ screenshots converted and counting.{" "}
              <a
                href="#pricing"
                className="link-blue"
                onClick={handleAnchorClick}
              >
                See pricing
              </a>
            </p>
          </div>
        </section>

        {/* Pricing */}
        <section className="pricing-section" id="pricing">
          <div className="container">
            <div className="section-header reveal">
              <p className="overline">Pricing</p>
              <h2>Simple, honest pricing.</h2>
              <p className="subtitle">
                One price for unlimited conversions. No credits to track. No
                surprise invoices.
              </p>
            </div>

            <div className="billing-toggle-wrapper reveal">
              <div className="billing-toggle">
                <button
                  className="billing-option active"
                  data-billing="monthly"
                  onClick={handleBillingClick}
                >
                  Monthly
                </button>
                <button
                  className="billing-option"
                  data-billing="annual"
                  onClick={handleBillingClick}
                >
                  Annual <span className="billing-save">Save 17%</span>
                </button>
              </div>
            </div>

            <div className="pricing-grid">
              <div className="pricing-card reveal">
                <div className="pricing-tier">Free</div>
                <div className="pricing-price">
                  <span className="pricing-value">
                    <span className="pricing-currency">$</span>0
                  </span>
                </div>
                <div className="pricing-period">forever</div>
                <p className="pricing-desc">Perfect for trying it out.</p>
                <ul className="pricing-features">
                  <li>5 generations per day</li>
                  <li>All 4 frameworks</li>
                  <li>Full code output</li>
                  <li>Live preview</li>
                  <li>Copy and download</li>
                </ul>
                <Link href="/sign-up" className="btn-secondary">
                  Get Started
                </Link>
              </div>
              <div
                className="pricing-card featured reveal"
                style={{ transitionDelay: "0.1s" }}
              >
                <div className="pricing-popular">Most Popular</div>
                <div className="pricing-tier">Pro</div>
                <div className="pricing-price">
                  <span className="pricing-value">
                    <span className="pricing-currency">$</span>
                    <span data-monthly="19" data-annual="16">
                      19
                    </span>
                  </span>
                </div>
                <div
                  className="pricing-period"
                  data-monthly-text="per month"
                  data-annual-text="per month, billed annually"
                >
                  per month
                </div>
                <p className="pricing-desc">
                  For developers who need unlimited power.
                </p>
                <ul className="pricing-features">
                  <li>Unlimited generations</li>
                  <li>All 4 frameworks</li>
                  <li>Free retries</li>
                  <li>No watermark</li>
                  <li>Project history</li>
                  <li>Email support</li>
                </ul>
                <Link href="/sign-up" className="btn-primary">
                  Start Free Trial
                </Link>
              </div>
              <div
                className="pricing-card reveal"
                style={{ transitionDelay: "0.2s" }}
              >
                <div className="pricing-tier">Team</div>
                <div className="pricing-price">
                  <span className="pricing-value">
                    <span className="pricing-currency">$</span>
                    <span data-monthly="49" data-annual="41">
                      49
                    </span>
                  </span>
                </div>
                <div
                  className="pricing-period"
                  data-monthly-text="per month"
                  data-annual-text="per month, billed annually"
                >
                  per month
                </div>
                <p className="pricing-desc">For agencies and teams.</p>
                <ul className="pricing-features">
                  <li>Everything in Pro, plus:</li>
                  <li>3 team seats (+$15/seat)</li>
                  <li>API access</li>
                  <li>Shared library</li>
                  <li>Priority support</li>
                </ul>
                <a href="#" className="btn-secondary">
                  Contact Sales
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="faq-section" id="faq">
          <div className="container">
            <div className="section-header reveal">
              <p className="overline">FAQ</p>
              <h2>Common questions, straight answers.</h2>
            </div>
            <div className="faq-list">
              <div className="faq-item reveal">
                <button
                  className="faq-question"
                  aria-expanded="false"
                  onClick={handleFaqClick}
                >
                  <span>What frameworks does CodePilot support?</span>
                  <span className="faq-icon">
                    <span className="icon-plus">+</span>
                    <span className="icon-minus">&minus;</span>
                  </span>
                </button>
                <div className="faq-answer" role="region">
                  <div className="faq-answer-inner">
                    CodePilot currently supports React, Vue, HTML + Tailwind
                    CSS, and plain HTML/CSS. All four frameworks are available on
                    every plan, including the free tier. We chose these four
                    because they cover approximately 85% of web development
                    projects.
                  </div>
                </div>
              </div>
              <div className="faq-item reveal">
                <button
                  className="faq-question"
                  aria-expanded="false"
                  onClick={handleFaqClick}
                >
                  <span>How accurate is the generated code?</span>
                  <span className="faq-icon">
                    <span className="icon-plus">+</span>
                    <span className="icon-minus">&minus;</span>
                  </span>
                </button>
                <div className="faq-answer" role="region">
                  <div className="faq-answer-inner">
                    The generated code typically captures 85&#8211;95% of the
                    layout, structure, and styling from your screenshot. Complex
                    interactions like animations, hover states, and custom
                    JavaScript may need manual refinement. The output is clean,
                    well-structured, and production-ready.
                  </div>
                </div>
              </div>
              <div className="faq-item reveal">
                <button
                  className="faq-question"
                  aria-expanded="false"
                  onClick={handleFaqClick}
                >
                  <span>
                    What does &quot;unlimited&quot; actually mean?
                  </span>
                  <span className="faq-icon">
                    <span className="icon-plus">+</span>
                    <span className="icon-minus">&minus;</span>
                  </span>
                </button>
                <div className="faq-answer" role="region">
                  <div className="faq-answer-inner">
                    Unlimited means unlimited. Pro users can convert as many
                    screenshots as they want, with as many retries as they need,
                    for a flat $19/month. No credits, no tokens, no hidden caps.
                    If the AI gets something wrong, iterate until it is right --
                    at no extra cost.
                  </div>
                </div>
              </div>
              <div className="faq-item reveal">
                <button
                  className="faq-question"
                  aria-expanded="false"
                  onClick={handleFaqClick}
                >
                  <span>Can I use the generated code commercially?</span>
                  <span className="faq-icon">
                    <span className="icon-plus">+</span>
                    <span className="icon-minus">&minus;</span>
                  </span>
                </button>
                <div className="faq-answer" role="region">
                  <div className="faq-answer-inner">
                    Yes. The generated code is 100% yours. Use it in client
                    projects, commercial products, SaaS applications, or any
                    other context. There are no licensing restrictions on the
                    output. You own every line.
                  </div>
                </div>
              </div>
              <div className="faq-item reveal">
                <button
                  className="faq-question"
                  aria-expanded="false"
                  onClick={handleFaqClick}
                >
                  <span>
                    How is this different from v0, Bolt, or Lovable?
                  </span>
                  <span className="faq-icon">
                    <span className="icon-plus">+</span>
                    <span className="icon-minus">&minus;</span>
                  </span>
                </button>
                <div className="faq-answer" role="region">
                  <div className="faq-answer-inner">
                    Those tools are AI app builders -- they generate full-stack
                    applications from text prompts. We are a focused
                    screenshot-to-code converter. We do one thing and do it well.
                    The key differences: flat-rate unlimited pricing (no
                    credits), multi-framework support (not React-only), and no
                    ecosystem lock-in.
                  </div>
                </div>
              </div>
              <div className="faq-item reveal">
                <button
                  className="faq-question"
                  aria-expanded="false"
                  onClick={handleFaqClick}
                >
                  <span>Do I need to know how to code?</span>
                  <span className="faq-icon">
                    <span className="icon-plus">+</span>
                    <span className="icon-minus">&minus;</span>
                  </span>
                </button>
                <div className="faq-answer" role="region">
                  <div className="faq-answer-inner">
                    Not necessarily. The generated code works out of the box for
                    simple layouts. However, having basic HTML/CSS knowledge
                    helps you refine and customize the output. Designers and
                    founders use CodePilot to create working prototypes and
                    starting points.
                  </div>
                </div>
              </div>
              <div className="faq-item reveal">
                <button
                  className="faq-question"
                  aria-expanded="false"
                  onClick={handleFaqClick}
                >
                  <span>What happens if I cancel?</span>
                  <span className="faq-icon">
                    <span className="icon-plus">+</span>
                    <span className="icon-minus">&minus;</span>
                  </span>
                </button>
                <div className="faq-answer" role="region">
                  <div className="faq-answer-inner">
                    Your subscription ends at the end of your billing period. You
                    keep access to all previously generated code. Your account
                    reverts to the free tier with 5 generations per day. No
                    lock-in, no penalties, no data loss.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <div className="container">
            <h2 className="reveal">
              Ready to turn screenshots
              <br />
              into production code?
            </h2>
            <p className="cta-subtitle reveal">
              Start free. No credit card. No commitment.
            </p>
            <div className="cta-actions reveal">
              <Link href="/sign-up" className="btn-primary">
                Start Free
              </Link>
              <a
                href="#pricing"
                className="btn-secondary"
                onClick={handleAnchorClick}
              >
                View Pricing
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-brand-name">CodePilot</div>
              <p className="footer-brand-tagline">
                Screenshot to code, done right.
              </p>
            </div>
            <div>
              <div className="footer-col-title">Product</div>
              <div className="footer-col-links">
                <a href="#how-it-works" onClick={handleAnchorClick}>
                  How It Works
                </a>
                <a href="#pricing" onClick={handleAnchorClick}>
                  Pricing
                </a>
                <a href="#">Changelog</a>
                <a href="#">Docs</a>
              </div>
            </div>
            <div>
              <div className="footer-col-title">Compare</div>
              <div className="footer-col-links">
                <a href="#">vs v0</a>
                <a href="#">vs Bolt</a>
                <a href="#">vs Others</a>
              </div>
            </div>
            <div>
              <div className="footer-col-title">Resources</div>
              <div className="footer-col-links">
                <a href="#">Blog</a>
                <a href="#">Support</a>
                <a href="#">API Docs</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span className="footer-copy">&copy; 2026 CodePilot AI</span>
            <div className="footer-socials">
              <a href="#" aria-label="X (Twitter)">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" aria-label="GitHub">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
