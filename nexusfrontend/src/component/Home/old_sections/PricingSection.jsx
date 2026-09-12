"use client";

import { motion } from "framer-motion";
import GlassButton from "@/component/Button";
import { Check } from "lucide-react";

export default function PricingSection() {
  const plans = [
    {
      name: "Basic",
      price: "$0",
      description: "Perfect for students and casual researchers.",
      features: [
        "5 PDFs / month",
        "100MB Storage",
        "Standard Support",
        "Basic Vector Search",
      ],
      buttonVariant: "secondary",
      highlight: false,
    },
    {
      name: "Pro",
      price: "$19",
      description: "For professionals handling heavy documentation.",
      features: [
        "Unlimited PDFs",
        "10GB Storage",
        "Priority Support",
        "Advanced Neural Mapping",
        "Export Chat History",
      ],
      buttonVariant: "primary",
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Tailored solutions for large-scale organizations.",
      features: [
        "Custom Deployment",
        "Unlimited Storage",
        "Dedicated Account Manager",
        "SSO & Advanced Security",
      ],
      buttonVariant: "secondary",
      highlight: false,
    },
  ];

  return (
    <section
      id="pricing"
      className="relative z-10 w-full py-20 lg:py-32 flex flex-col items-center bg-transparent pointer-events-none transition-colors duration-200"
    >
      <div className="max-w-7xl w-full px-6">
        <div className="bg-[var(--color-surface)]/40 backdrop-blur-xl rounded-2xl border-[var(--color-border)] border-2 py-10 text-center mb-16 md:mb-24">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[var(--color-text-primary)]">
            Simple, Transparent{" "}
            <span className="text-[var(--color-main)]">Pricing</span>
          </h2>
          <p className="text-[var(--color-text-muted)] mt-4 text-sm md:text-lg">
            Choose the plan that fits your research needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full pointer-events-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              viewport={{ once: true }}
              className={`group relative flex flex-col p-8 rounded-3xl border transition-all duration-500 transform-gpu will-change-transform ${
                plan.highlight
                  ? "bg-[var(--color-surface)] border-[var(--color-main)]/30 shadow-[0_30px_60px_-15px_var(--color-glow)] md:scale-105 z-10"
                  : "bg-[var(--color-surface)]/40 backdrop-blur-md border-[var(--color-border)] hover:border-[var(--color-border)] hover:bg-[var(--color-surface)]/60"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[var(--color-main)] text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg">
                  Most Popular
                </span>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-[var(--color-text-primary)]">
                    {plan.price}
                  </span>
                  {plan.price !== "Custom" && (
                    <span className="text-[var(--color-text-muted)] text-sm">/mo</span>
                  )}
                </div>
                <p className="text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)] text-sm mt-4 leading-relaxed transition-colors duration-500">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-4 mb-10 flex-1 opacity-40 group-hover:opacity-100 transition-opacity duration-500 ease-in-out">
                {plan.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-start gap-3 text-sm text-[var(--color-text-muted)]"
                  >
                    <div className="mt-1 shrink-0 w-4 h-4 rounded-full bg-[var(--color-main)]/10 flex items-center justify-center">
                      <Check className="w-3 h-3 text-[var(--color-main)]" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="relative z-20">
                <GlassButton
                  variant={plan.buttonVariant}
                  className={`w-full py-3 ${
                    plan.highlight
                      ? "bg-linear-to-r from-[var(--color-main)] via-[var(--color-mid)] to-[var(--color-highlight)] border-none text-white shadow-md shadow-[var(--color-glow)]"
                      : "text-[var(--color-text-primary)] border-[var(--color-border)]"
                  }`}
                >
                  {plan.price === "Custom"
                    ? "Contact Sales"
                    : "Get Started"}
                </GlassButton>
              </div>
              <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-[var(--color-main)]/5 to-[var(--color-mid)]/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-700" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
