"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/store/authStore";
import Image from "next/image";
import Link from "next/link";
import Antigravity from "@/component/Antigravity";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import { CheckCircle2 } from "lucide-react";

const AuthPage = () => {
  const { authView, switchView } = useAuth();

  return (
    <div className="auth-page-root relative h-screen max-h-screen w-full bg-[#fafafa] overflow-hidden flex flex-col">
      {/* --- GLOBAL ANTIGRAVITY BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-rose-200/30 blur-[100px] rounded-full" />
        <div className="absolute top-0 right-[-5%] w-[30%] h-[30%] bg-orange-200/30 blur-[100px] rounded-full" />
        <Antigravity
          count={400}
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

      {/* --- ADAPTIVE LOGO --- */}
      <div className="absolute top-4 left-4 lg:top-6 lg:left-6 z-50">
        <Link
          href="/"
          className={`flex items-center gap-2 group px-2 py-1.5 rounded-lg border transition-all duration-500 backdrop-blur-md shadow-sm ${
            authView === "login"
              ? "bg-white/40 border-white/50"
              : "bg-slate-900/40 border-slate-700/50"
          }`}
        >
          <div className="relative w-6 h-6 md:w-7 md:h-7 group-hover:rotate-12 transition-transform duration-500">
            <Image
              src="/favicon/logo.png"
              alt="NexusNode AI Logo"
              fill
              sizes="40px"
              className="object-contain"
              priority
            />
          </div>
          <span
            className={`text-xs md:text-sm font-black tracking-tight transition-colors duration-500 ${
              authView === "login" ? "text-slate-900" : "text-white"
            }`}
          >
            NexusNode<span className="text-rose-600">AI</span>
          </span>
        </Link>
      </div>

      <AnimatePresence mode="wait">
        {authView === "login" ? (
          <motion.div
            key="login-scene"
            className="flex h-full w-full relative z-10"
          >
            <LoginForm />

            {/* CONTENT SIDE */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden bg-slate-900"
            >
              <AnimatedBackground />
              <ContentCarousel mode="login" />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="signup-scene"
            className="flex h-full w-full flex-row-reverse relative z-10"
          >
            <SignupForm onSwitchToLogin={() => switchView("login")} />

            {/* CONTENT SIDE */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden bg-slate-900"
            >
              <AnimatedBackground />
              <ContentCarousel mode="signup" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* --- SUPPORTING COMPONENTS --- */

const AnimatedBackground = () => (
  <>
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-rose-600/20 blur-[100px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-500/10 blur-[80px] rounded-full animate-pulse" />
    </div>
    <div
      className="absolute inset-0 opacity-5"
      style={{
        backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
        backgroundSize: "30px 30px",
      }}
    />
  </>
);

const ContentCarousel = ({ mode }) => {
  const [activeStep, setActiveStep] = useState(0);
  const steps =
    mode === "login"
      ? ["Neural Monitoring", "Path Optimization", "Auto Scaling"]
      : ["Zero-Trust Privacy", "Global Nodes", "Edge Compute"];

  useEffect(() => {
    const timer = setInterval(
      () => setActiveStep((prev) => (prev + 1) % steps.length),
      4000,
    );
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="relative z-10 max-w-xs text-center px-4">
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="mx-auto mb-4 w-16 h-16 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center"
      >
        <CheckCircle2 className="text-white" size={28} />
      </motion.div>
      <div className="min-h-25">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="text-xl font-bold text-white mb-2">
              {steps[activeStep]}
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Encrypted agent communication protocols.
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex justify-center gap-1.5 mt-4">
        {steps.map((_, i) => (
          <div
            key={i}
            className="h-1 bg-white/10 rounded-full w-8 relative overflow-hidden"
          >
            {activeStep === i && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 4, ease: "linear" }}
                className="h-full bg-rose-500 absolute left-0"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuthPage;
