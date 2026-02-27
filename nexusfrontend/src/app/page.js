"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import GlassButton from "@/component/Button";
import Antigravity from "@/component/Antigravity";
import {
  Zap,
  Brain,
  ShieldCheck,
  FileUp,
  Network,
  MessagesSquare,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";

const PARTNERS = [
  {
    name: "Next.js",
    logo: "https://cdn.worldvectorlogo.com/logos/next-js.svg",
  },
  {
    name: "Tailwind",
    logo: "https://cdn.worldvectorlogo.com/logos/tailwindcss.svg",
  },
  { name: "LangChain", logo: "https://python.langchain.com/img/favicon.ico" },
  {
    name: "MongoDB",
    logo: "https://cdn.worldvectorlogo.com/logos/mongodb-icon-1.svg",
  },
  {
    name: "OpenAI",
    logo: "https://cdn.worldvectorlogo.com/logos/openai-2.svg",
  },
  {
    name: "Vercel",
    logo: "https://cdn.worldvectorlogo.com/logos/vercel-1.svg",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
};

export default function Home() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-slate-50 font-sans selection:bg-rose-100">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-rose-200/30 blur-[100px] rounded-full" />
        <div className="absolute top-0 right-[-5%] w-[30%] h-[30%] bg-orange-200/30 blur-[100px] rounded-full" />
        <Antigravity
          count={500}
          magnetRadius={4}
          ringRadius={4}
          waveSpeed={0.6}
          waveAmplitude={1}
          particleSize={2}
          lerpSpeed={0.09}
          color="#E11D48"
          autoAnimate
          particleVariance={1}
          rotationSpeed={0}
          depthFactor={1}
          pulseSpeed={13}
          particleShape="capsule"
          fieldStrength={2}
        />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        <main className="flex flex-col items-center justify-center min-h-dvh w-full max-w-[95%] md:max-w-7xl px-[5%] text-center pointer-events-none relative z-10 bg-transparent">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-[3vh] md:gap-[4vh]"
          >
            <motion.span
              variants={itemVariants}
              className="px-[4%] py-[1%] rounded-full border border-rose-100 bg-white/80 text-rose-600 text-[min(3.5vw,14px)] font-bold shadow-sm backdrop-blur-sm"
            >
              Neural Retrieval Engine v1.0
            </motion.span>

            <motion.h1
              variants={itemVariants}
              className="text-[clamp(2.2rem,9vw,5.5rem)] font-black tracking-tight text-slate-900 leading-[1.1] md:leading-[1.05]"
            >
              Talk to your{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-rose-600 via-orange-500 to-yellow-500">
                PDFs
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="max-w-[90%] md:max-w-[75%] text-[clamp(1rem,4.5vw,1.6rem)] leading-relaxed text-slate-600"
            >
              Your PDFs, Now With a Human Brain. The most advanced neural
              retrieval engine for your documents.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-[3vh] w-full sm:w-auto pointer-events-auto"
            >
              <GlassButton
                variant="primary"
                className="w-full sm:w-auto text-[1.1rem] px-[10vw] sm:px-12 py-[1.2rem] bg-linear-to-r from-rose-600 to-orange-500 border-none text-white shadow-lg shadow-rose-200 hover:scale-105 active:scale-95 transition-all"
                onClick={() => router.push("/dashboard")}
              >
                Launch App
              </GlassButton>
              <GlassButton
                variant="secondary"
                className="w-full sm:w-auto text-[1.1rem] px-[10vw] sm:px-12 py-[1.2rem] hover:bg-white transition-colors"
              >
                Documentation
              </GlassButton>
            </motion.div>
          </motion.div>
        </main>

        <section className="relative z-20 w-full bg-white py-24 lg:py-32 flex flex-col items-center border-y border-slate-200 shadow-sm pointer-events-none">
          <div className="relative w-full max-w-6xl px-6 perspective-1000 pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, y: 50, rotateX: 15 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 5 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="relative w-full aspect-video rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex"
            >
              <div className="w-[45%] h-full border-r border-slate-100 bg-slate-50/50 flex flex-col">
                <div className="h-10 border-b border-slate-100 bg-white flex items-center px-4 justify-between">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                  </div>
                  <div className="h-4 w-24 bg-slate-100 rounded" />
                  <div className="w-6 h-6 bg-slate-50 rounded" />
                </div>

                <div className="p-8 flex-1 overflow-hidden">
                  <div className="h-6 w-1/2 bg-slate-200 rounded mb-6 animate-pulse" />
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="h-2.5 w-full bg-slate-100 rounded"
                      />
                    ))}
                    <motion.div
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 3 }}
                      className="relative p-4 bg-rose-50/50 border-l-4 border-rose-500 rounded-r-lg"
                    >
                      <div className="h-2 w-full bg-rose-200 rounded mb-2" />
                      <div className="h-2 w-3/4 bg-rose-200 rounded" />
                      <span className="absolute -top-2 -right-2 bg-rose-600 text-[8px] text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">
                        Ref: Chunk_82
                      </span>
                    </motion.div>
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i + 10}
                        className="h-2.5 w-full bg-slate-100 rounded"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex-1 h-full bg-white flex flex-col">
                <div className="h-10 border-b border-slate-50 flex items-center px-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      NexusNode AI Active
                    </span>
                  </div>
                </div>

                <div className="flex-1 p-6 flex flex-col gap-6 justify-end">
                  <div className="self-end bg-rose-600 text-white text-[11px] p-4 rounded-2xl rounded-tr-none max-w-[85%] shadow-md shadow-rose-100">
                    Summarize the specific financial risks mentioned on page 14
                    regarding the Q4 projections.
                  </div>

                  <div className="self-start bg-white text-slate-700 text-[11px] p-4 rounded-2xl rounded-tl-none max-w-[85%] border border-slate-200 shadow-sm leading-relaxed">
                    <p className="mb-2">
                      According to the projections in{" "}
                      <span className="bg-rose-100 text-rose-700 px-1 rounded cursor-pointer font-bold">
                        page 14
                      </span>
                      , the key risks include:
                    </p>
                    <ul className="space-y-1 list-disc list-inside text-slate-500">
                      <li>Market volatility (Ref 82.a)</li>
                      <li>Currency fluctuations</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-50">
                  <div className="h-11 w-full border border-slate-200 rounded-xl bg-slate-50 px-4 flex items-center justify-between">
                    <div className="h-2.5 w-32 bg-slate-200 rounded-full" />
                    <div className="w-6 h-6 bg-rose-600 rounded-lg" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="relative z-10 w-full py-20 lg:py-32 flex flex-col items-center justify-center bg-white/30 backdrop-blur-sm pointer-events-none border-b border-slate-100">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-linear-to-r from-transparent via-rose-400/50 to-transparent" />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-2 mb-12 text-center"
          >
            <p className="text-slate-400 font-bold tracking-[0.25em] text-[10px] uppercase">
              Trusted by Developers & Researchers globally
            </p>
            <div className="w-12 h-1 bg-rose-600/20 rounded-full" />
          </motion.div>
          <div className="w-full max-w-6xl px-6 pointer-events-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center opacity-60 grayscale hover:opacity-100 transition-all duration-700">
              {PARTNERS.map((partner, index) => (
                <motion.div
                  key={partner.name}
                  whileHover={{ scale: 1.1, filter: "grayscale(0%)" }}
                  className="flex items-center gap-3"
                >
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="h-6 w-auto"
                  />
                  <span className="text-slate-900 font-black text-sm">
                    {partner.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-0 w-full h-24 bg-linear-to-t from-slate-50 to-transparent" />
        </section>

        <section
          id="features"
          className="relative z-10 w-full py-24 lg:py-32 flex flex-col items-center justify-center bg-transparent pointer-events-none"
        >
          <div className="max-w-7xl w-full px-6 flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="text-center mb-20"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
                Why Choose <span className="text-rose-600">NexusNodeAI?</span>
              </h2>
              <div className="w-20 h-1.5 bg-rose-600/10 mx-auto mt-6 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-linear-to-r from-rose-500 to-orange-500"
                  initial={{ x: "-100%" }}
                  whileInView={{ x: "0%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full pointer-events-auto">
              {[
                {
                  title: "Instant Indexing",
                  description:
                    "Upload 100+ pages in under 3 seconds with our optimized neural engine.",
                  icon: <Zap className="w-5 h-5 md:w-6 md:h-6 text-rose-600" />,
                  color: "rgba(225, 29, 72, 0.15)",
                },
                {
                  title: "Context Aware",
                  description:
                    "No more hallucinations. True facts cited directly from your documents.",
                  icon: (
                    <Brain className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
                  ),
                  color: "rgba(249, 115, 22, 0.15)",
                },
                {
                  title: "Private & Secure",
                  description:
                    "Enterprise-grade encryption. Your data is never used for model training.",
                  icon: (
                    <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
                  ),
                  color: "rgba(250, 204, 21, 0.15)",
                },
              ].map((feature, index) => (
                <FeatureCard key={index} feature={feature} index={index} />
              ))}
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="relative z-10 w-full py-24 lg:py-32 flex flex-col items-center bg-white/40 backdrop-blur-xl border-y border-slate-200/60 pointer-events-none"
        >
          <div className="max-w-7xl w-full px-6">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900">
                How It Works
              </h2>
              <p className="text-slate-500 mt-4 text-sm md:text-lg max-w-xl mx-auto">
                From static data to dynamic intelligence in three simple steps.
              </p>
            </div>

            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 pointer-events-auto">
              <div className="hidden md:block absolute top-1/4 left-0 w-full h-0.5 bg-slate-100 -z-10">
                <motion.div
                  initial={{ width: "0%" }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="h-full bg-linear-to-r from-rose-500 via-orange-500 to-yellow-500"
                />
              </div>

              {[
                {
                  id: "01",
                  title: "Drop File",
                  description:
                    "Simply drag and drop your PDFs into the secure vault.",
                  icon: <FileUp className="w-6 h-6 text-rose-600" />,
                  color: "from-rose-500 to-orange-400",
                },
                {
                  id: "02",
                  title: "Vectorization",
                  description:
                    "Our AI builds a neural map of your document's context.",
                  icon: <Network className="w-6 h-6 text-orange-600" />,
                  color: "from-orange-500 to-yellow-400",
                },
                {
                  id: "03",
                  title: "Ask & Solve",
                  description:
                    "Get instant citations, summaries, and deep insights.",
                  icon: <MessagesSquare className="w-6 h-6 text-yellow-600" />,
                  color: "from-yellow-500 to-rose-400",
                },
              ].map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.8 }}
                  viewport={{ once: true }}
                  className="group relative flex flex-col items-center text-center px-4"
                >
                  <div className="relative mb-8">
                    <div
                      className={`absolute inset-0 bg-linear-to-br ${step.color} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-500 rounded-full`}
                    />
                    <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white border border-slate-200 shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                      {step.icon}
                      <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shadow-lg">
                        {step.id}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-62.5">
                    {step.description}
                  </p>
                  <motion.div
                    className={`mt-6 h-1 w-0 bg-linear-to-r ${step.color} rounded-full group-hover:w-12 transition-all duration-500`}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="pricing"
          className="relative z-10 w-full py-20 lg:py-32 flex flex-col items-center bg-transparent pointer-events-none"
        >
          <div className="max-w-7xl w-full px-6">
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl border-slate-200 border-2 py-10 text-center mb-16 md:mb-24">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900">
                Simple, Transparent{" "}
                <span className="text-rose-600">Pricing</span>
              </h2>
              <p className="text-slate-500 mt-4 text-sm md:text-lg">
                Choose the plan that fits your research needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full pointer-events-auto">
              {[
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
                  description:
                    "For professionals handling heavy documentation.",
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
                  description:
                    "Tailored solutions for large-scale organizations.",
                  features: [
                    "Custom Deployment",
                    "Unlimited Storage",
                    "Dedicated Account Manager",
                    "SSO & Advanced Security",
                  ],
                  buttonVariant: "secondary",
                  highlight: false,
                },
              ].map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.8 }}
                  viewport={{ once: true }}
                  className={`group relative flex flex-col p-8 rounded-3xl border transition-all duration-500 ${
                    plan.highlight
                      ? "bg-white border-rose-200 shadow-[0_30px_60px_-15px_rgba(225,29,72,0.15)] md:scale-105 z-10"
                      : "bg-white/40 backdrop-blur-md border-slate-200 hover:border-slate-300 hover:bg-white/60"
                  }`}
                >
                  {plan.highlight && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-rose-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg">
                      Most Popular
                    </span>
                  )}

                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-slate-900">
                        {plan.price}
                      </span>
                      {plan.price !== "Custom" && (
                        <span className="text-slate-500 text-sm">/mo</span>
                      )}
                    </div>
                    <p className="text-slate-400 group-hover:text-slate-600 text-sm mt-4 leading-relaxed transition-colors duration-500">
                      {plan.description}
                    </p>
                  </div>

                  <div className="space-y-4 mb-10 flex-1 opacity-40 group-hover:opacity-100 transition-opacity duration-500 ease-in-out">
                    {plan.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-start gap-3 text-sm text-slate-600"
                      >
                        <div className="mt-1 shrink-0 w-4 h-4 rounded-full bg-rose-50 flex items-center justify-center">
                          <Check className="w-3 h-3 text-rose-600" />
                        </div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="relative z-20">
                    <GlassButton
                      variant={plan.buttonVariant}
                      className={`w-full py-3 ${plan.highlight ? "bg-linear-to-r from-rose-600 to-orange-500 border-none text-white" : ""}`}
                    >
                      {plan.price === "Custom"
                        ? "Contact Sales"
                        : "Get Started"}
                    </GlassButton>
                  </div>
                  <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-rose-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-700" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative z-20 w-full py-24 lg:py-40 flex flex-col items-center justify-center overflow-hidden bg-slate-50 border-t border-slate-200">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-rose-200/20 blur-[120px] rounded-full pointer-events-none" />
          <div className="relative z-10 max-w-4xl px-6 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="flex flex-col items-center gap-6 md:gap-10"
            >
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.1]">
                Ready to upgrade your <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-rose-600 via-orange-600 to-yellow-500">
                  Workflow?
                </span>
              </h2>

              <p className="max-w-xl text-slate-500 text-base md:text-xl leading-relaxed">
                Join thousands of researchers and developers using NexusNode AI
                to turn complex documents into actionable insights.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4 w-full sm:w-auto">
                <GlassButton
                  variant="primary"
                  className="w-full sm:w-auto text-base lg:text-lg px-10 py-4 bg-linear-to-r from-rose-600 to-orange-500 border-none text-white shadow-xl shadow-rose-200"
                >
                  Create Free Account
                </GlassButton>
                <GlassButton
                  variant="secondary"
                  className="w-full sm:w-auto text-base lg:text-lg px-10 py-4"
                >
                  Contact Sales
                </GlassButton>
              </div>
            </motion.div>
          </div>
          <div className="absolute bottom-[-10%] w-[120%] aspect-square rounded-full border-t border-rose-100 bg-white/50 backdrop-blur-3xl z-0" />
        </section>
      </div>
    </div>
  );
}

function FeatureCard({ feature, index }) {
  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true }}
      onMouseMove={handleMouseMove}
      className="group relative p-8 rounded-3xl border border-slate-200/60 bg-white/40 backdrop-blur-md transition-all duration-500 hover:border-slate-300/80 overflow-hidden"
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              450px circle at ${mouseX}px ${mouseY}px,
              ${feature.color},
              transparent 80%
            )
          `,
        }}
      />

      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
        <div className="absolute top-0 -left-full w-full h-full bg-linear-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] group-hover:left-[200%] transition-all duration-1000 ease-in-out" />
      </div>

      <div className="relative z-10">
        <div className="mb-6 inline-flex p-3 rounded-2xl bg-white shadow-sm border border-slate-100 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
          {feature.icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">
          {feature.title}
        </h3>
        <p className="text-slate-600 leading-relaxed text-sm md:text-base">
          {feature.description}
        </p>
        <div className="mt-6 h-px w-full bg-linear-to-r from-transparent via-slate-200 to-transparent group-hover:via-rose-300 transition-all duration-500" />
      </div>
    </motion.div>
  );
}
