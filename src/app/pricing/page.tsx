'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Check, ArrowLeft } from 'lucide-react';

type BillingPeriod = 'monthly' | 'annual';

interface PricingTier {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  featured?: boolean;
  badge?: string;
}

const TIERS: PricingTier[] = [
  {
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Perfect for trying it out.',
    features: [
      '5 generations per day',
      'All 4 frameworks',
      'Full code output',
      'Live preview',
      'Copy and download',
      '1 follow-up per generation',
    ],
    cta: 'Get Started',
    ctaHref: '/sign-up',
  },
  {
    name: 'Pro',
    monthlyPrice: 19,
    annualPrice: 16,
    description: 'For developers who need unlimited power.',
    features: [
      'Unlimited generations',
      'All 4 frameworks',
      'Unlimited iterations',
      'No watermark',
      'Project history',
      'Priority email support',
    ],
    cta: 'Start Free Trial',
    ctaHref: '/sign-up',
    featured: true,
    badge: 'Most Popular',
  },
  {
    name: 'Team',
    monthlyPrice: 49,
    annualPrice: 41,
    description: 'For agencies and dev teams.',
    features: [
      'Everything in Pro, plus:',
      '3 team seats (+$15/seat)',
      'API access',
      'Shared project library',
      'Priority support',
      'Custom export templates',
    ],
    cta: 'Contact Sales',
    ctaHref: '#',
  },
];

const FAQS = [
  {
    question: 'What does "unlimited" actually mean?',
    answer:
      'Unlimited means unlimited. Pro users can convert as many screenshots as they want, with as many retries as they need, for a flat $19/month. No credits, no tokens, no hidden caps. If the AI gets something wrong, iterate until it is right -- at no extra cost.',
  },
  {
    question: 'Can I try before I pay?',
    answer:
      'Yes. The free tier gives you 5 generations per day with full code output, live preview, and all 4 frameworks. No credit card required. When you are ready for unlimited usage, upgrade to Pro.',
  },
  {
    question: 'What happens if I cancel?',
    answer:
      'Your subscription ends at the end of your billing period. You keep access to all previously generated code. Your account reverts to the free tier with 5 generations per day. No lock-in, no penalties, no data loss.',
  },
  {
    question: 'Do I get a refund if it does not work for me?',
    answer:
      'Yes. If you are not satisfied within the first 14 days, we will issue a full refund. No questions asked.',
  },
  {
    question: 'Can I use the generated code commercially?',
    answer:
      'Yes. The generated code is 100% yours. Use it in client projects, commercial products, SaaS applications, or any other context. There are no licensing restrictions on the output.',
  },
  {
    question: 'How is this different from v0, Bolt, or Lovable?',
    answer:
      'Those tools are AI app builders that generate full-stack applications from text prompts and charge per credit. We are a focused screenshot-to-code converter. We do one thing and do it well. Key differences: flat-rate unlimited pricing (no credits), multi-framework support (not React-only), and no ecosystem lock-in.',
  },
  {
    question: 'Do you offer annual billing?',
    answer:
      'Yes. Annual billing saves you 17% -- that is 2 months free. Pro annual is $190/year ($15.83/mo) and Team annual is $492/year ($41/mo).',
  },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<BillingPeriod>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleFaqClick = useCallback((index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-transparent" style={{ borderBottomColor: 'var(--border-subtle)' }}>
        <div className="max-w-[1120px] mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-bold text-[#1A1A1A]">
              CodePilot
            </Link>
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Home
            </Link>
          </div>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-white bg-[#1A1A1A] rounded-lg hover:bg-[#333333] transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-20 pb-4 text-center">
        <div className="max-w-[1120px] mx-auto px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9B9B9B] mb-4">
            Pricing
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#1A1A1A] tracking-tight leading-tight mb-4">
            Simple, honest pricing.
          </h1>
          <p className="text-lg text-[#6B6B6B] max-w-lg mx-auto">
            One price for unlimited conversions. No credits to track. No surprise invoices.
          </p>
        </div>
      </section>

      {/* Billing toggle */}
      <section className="py-6 text-center">
        <div className="inline-flex bg-[#F0F0F0] rounded-lg p-1">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-5 py-2 text-sm font-medium rounded-md transition-all ${
              billing === 'monthly'
                ? 'bg-white text-[#1A1A1A] shadow-sm'
                : 'text-[#6B6B6B]'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('annual')}
            className={`px-5 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
              billing === 'annual'
                ? 'bg-white text-[#1A1A1A] shadow-sm'
                : 'text-[#6B6B6B]'
            }`}
          >
            Annual
            <span className="text-xs text-[#6B6B6B] font-normal">Save 17%</span>
          </button>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="pb-20">
        <div className="max-w-[1120px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {TIERS.map((tier) => {
              const price =
                billing === 'annual' ? tier.annualPrice : tier.monthlyPrice;
              const isFreeTier = tier.monthlyPrice === 0;

              return (
                <div
                  key={tier.name}
                  className={`flex flex-col p-8 rounded-lg ${
                    tier.featured
                      ? 'border-2 border-[#1A1A1A] relative'
                      : 'border border-[#E8E8E8]'
                  }`}
                >
                  {tier.badge && (
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#9B9B9B] mb-2">
                      {tier.badge}
                    </span>
                  )}

                  <h3 className="text-xl font-semibold text-[#1A1A1A] tracking-tight mb-5">
                    {tier.name}
                  </h3>

                  <div className="mb-1">
                    <span className="text-[#9B9B9B] text-lg font-medium align-top">
                      $
                    </span>
                    <span className="text-5xl font-bold text-[#1A1A1A] tracking-tighter leading-none">
                      {price}
                    </span>
                  </div>

                  <p className="text-sm text-[#9B9B9B] mb-5">
                    {isFreeTier
                      ? 'forever'
                      : billing === 'annual'
                      ? 'per month, billed annually'
                      : 'per month'}
                  </p>

                  <p className="text-sm text-[#6B6B6B] leading-relaxed mb-6 pb-6 border-b border-[#F0F0F0]">
                    {tier.description}
                  </p>

                  <ul className="flex flex-col gap-3.5 mb-8 flex-1">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 text-sm text-[#6B6B6B]"
                      >
                        <Check className="w-4 h-4 text-[#0066FF] mt-0.5 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={tier.ctaHref}
                    className={`w-full inline-flex items-center justify-center px-6 py-3 text-sm font-semibold rounded-lg transition-colors ${
                      tier.featured
                        ? 'bg-[#1A1A1A] text-white hover:bg-[#333333]'
                        : 'bg-transparent text-[#1A1A1A] border-[1.5px] border-[#E8E8E8] hover:border-[#1A1A1A]'
                    }`}
                  >
                    {tier.cta}
                  </Link>
                </div>
              );
            })}
          </div>

          <p className="text-center text-sm text-[#9B9B9B] mt-8">
            All plans include all 4 frameworks. No credit card required for the free tier.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-[#F8F8FA]">
        <div className="max-w-[720px] mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9B9B9B] mb-4">
              FAQ
            </p>
            <h2 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">
              Common questions, straight answers.
            </h2>
          </div>

          <div>
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className={`border-b ${
                  i === FAQS.length - 1
                    ? 'border-transparent'
                    : 'border-[#F0F0F0]'
                }`}
              >
                <button
                  onClick={() => handleFaqClick(i)}
                  className="w-full flex items-center justify-between py-5 text-left"
                  aria-expanded={openFaq === i}
                >
                  <span className="text-base font-semibold text-[#1A1A1A] leading-snug pr-4">
                    {faq.question}
                  </span>
                  <span className="text-xl text-[#9B9B9B] shrink-0 w-6 text-center leading-none">
                    {openFaq === i ? '\u2212' : '+'}
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === i ? 'max-h-60 pb-5' : 'max-h-0'
                  }`}
                >
                  <p className="text-base text-[#6B6B6B] leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <div className="max-w-[1120px] mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight mb-3">
            Ready to turn screenshots
            <br />
            into production code?
          </h2>
          <p className="text-lg text-[#6B6B6B] mb-6">
            Start free. No credit card. No commitment.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-white bg-[#1A1A1A] rounded-lg hover:bg-[#333333] transition-colors"
            >
              Start Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#F0F0F0] py-8">
        <div className="max-w-[1120px] mx-auto px-6 flex items-center justify-between">
          <span className="text-sm text-[#9B9B9B]">
            &copy; 2026 CodePilot AI
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors"
            >
              Home
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors"
            >
              Pricing
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
