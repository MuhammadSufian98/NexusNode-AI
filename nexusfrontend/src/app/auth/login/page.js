"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/authContext";
import Image from "next/image";
import Link from "next/link";
import Antigravity from "@/component/Antigravity";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  Lock,
  User,
  Zap,
  Fingerprint,
  CheckCircle2,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react";
import GlassButton from "@/component/Button";

const AuthPage = () => {
  const { authView, switchView } = useAuth();
  const [showPass, setShowPass] = useState(false);

  // NEW: State for multi-step signup
  const [signupStep, setSignupStep] = useState("register"); // "register" | "verify"
  const [verificationCode, setVerificationCode] = useState(["", "", "", ""]);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const transition = { duration: 0.6, ease: [0.4, 0, 0.2, 1] };

  // Reset signup step when switching back to login
  useEffect(() => {
    if (authView === "login") {
      setSignupStep("register");
      setVerificationCode(["", "", "", ""]);
    }
  }, [authView]);

  // Handle Code Input Focus Logic
  const handleCodeChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only numbers
    const newCode = [...verificationCode];
    newCode[index] = value.slice(-1);
    setVerificationCode(newCode);

    if (value && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  return (
    <div className="relative h-screen max-h-screen w-full bg-[#fafafa] overflow-hidden flex flex-col">
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
              alt="Logo"
              fill
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
            {/* FORM SIDE (LOGIN) */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={transition}
              className="w-full lg:w-1/2 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-[22rem] p-6 lg:p-8 bg-white/20 backdrop-blur-xl border border-white/80 shadow-2xl rounded-[2.5rem]">
                <header className="mb-6">
                  <div className="w-9 h-9 bg-rose-600 rounded-lg flex items-center justify-center mb-3 shadow-lg shadow-rose-200">
                    <Fingerprint className="text-white" size={20} />
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    System Login
                  </h1>
                  <p className="text-slate-500 text-[13px] font-medium leading-tight">
                    Access decentralized neural nodes.
                  </p>
                </header>

                <form
                  className="space-y-3"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <FormInput
                    icon={<Mail size={14} />}
                    label="Node ID"
                    placeholder="admin@nexus.ai"
                  />
                  <FormInput
                    icon={<Lock size={14} />}
                    label="Access Key"
                    placeholder="••••••••"
                    type={showPass ? "text" : "password"}
                    isPassword
                    showPass={showPass}
                    setShowPass={setShowPass}
                  />
                  <GlassButton className="w-full py-3 bg-slate-900 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-rose-600 transition-all shadow-lg mt-2 group">
                    Connect{" "}
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </GlassButton>
                </form>

                <div className="mt-6 pt-5 border-t border-slate-200/50 flex flex-col items-center">
                  <button
                    onClick={() => switchView("signup")}
                    className="group text-slate-400 font-bold text-[10px] uppercase tracking-widest"
                  >
                    New Operator?{" "}
                    <span className="text-rose-600 group-hover:underline ml-1">
                      Initialize
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* CONTENT SIDE */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={transition}
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
            {/* FORM SIDE (SIGNUP / VERIFY) */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={transition}
              className="w-full lg:w-1/2 flex items-center justify-center p-4"
            >
              <AnimatePresence mode="wait" initial={false}>
                {signupStep === "register" ? (
                  <motion.div
                    key="register-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="w-full max-w-[22rem] p-6 lg:p-8 bg-white/40 backdrop-blur-xl border border-white/80 shadow-2xl rounded-[2.5rem]"
                  >
                    <header className="mb-6 text-right lg:text-left">
                      <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center mb-3 shadow-lg shadow-orange-200 ml-auto lg:ml-0">
                        <Zap className="text-white" size={20} />
                      </div>
                      <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        Create Node
                      </h1>
                      <p className="text-slate-500 text-[13px] font-medium leading-tight">
                        Join the orchestration network.
                      </p>
                    </header>

                    <form
                      className="space-y-3"
                      onSubmit={(e) => {
                        e.preventDefault();
                        setSignupStep("verify");
                      }}
                    >
                      <FormInput
                        icon={<User size={14} />}
                        label="Alias"
                        placeholder="Nexus_01"
                      />
                      <FormInput
                        icon={<Mail size={14} />}
                        label="Neural Mail"
                        placeholder="hello@nexus.ai"
                      />
                      <FormInput
                        icon={<Lock size={14} />}
                        label="Master Key"
                        placeholder="••••••••"
                        type={showPass ? "text" : "password"}
                        isPassword
                        showPass={showPass}
                        setShowPass={setShowPass}
                      />
                      <GlassButton
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-rose-600 to-orange-500 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-lg mt-2 hover:scale-[1.02] transition-transform group"
                      >
                        Register{" "}
                        <Zap
                          size={16}
                          className="group-hover:rotate-12 transition-transform"
                        />
                      </GlassButton>
                    </form>

                    <div className="mt-6 pt-5 border-t border-slate-200/50 flex flex-col items-center">
                      <button
                        onClick={() => switchView("login")}
                        className="group text-slate-400 font-bold text-[10px] uppercase tracking-widest"
                      >
                        Existing User?{" "}
                        <span className="text-orange-600 group-hover:underline ml-1">
                          Resume
                        </span>
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="verify-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="w-full max-w-[22rem] p-6 lg:p-8 bg-white/40 backdrop-blur-xl border border-white/80 shadow-2xl rounded-[2.5rem]"
                  >
                    <header className="mb-6 text-right lg:text-left">
                      <button
                        onClick={() => setSignupStep("register")}
                        className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter hover:text-rose-600 mb-2 transition-colors ml-auto lg:ml-0"
                      >
                        <ChevronLeft size={12} /> Back
                      </button>
                      <div className="w-9 h-9 bg-rose-600 rounded-lg flex items-center justify-center mb-3 shadow-lg shadow-rose-100 ml-auto lg:ml-0">
                        <ShieldCheck className="text-white" size={20} />
                      </div>
                      <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        Verify Identity
                      </h1>
                      <p className="text-slate-500 text-[13px] font-medium leading-tight">
                        A neural code was sent to your mail.
                      </p>
                    </header>

                    <form
                      className="space-y-6"
                      onSubmit={(e) => e.preventDefault()}
                    >
                      <div className="flex justify-between gap-2">
                        {verificationCode.map((val, i) => (
                          <input
                            key={i}
                            ref={inputRefs[i]}
                            type="text"
                            maxLength={1}
                            value={val}
                            onChange={(e) =>
                              handleCodeChange(i, e.target.value)
                            }
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            className="w-12 h-14 text-center text-xl font-bold bg-white/60 border border-slate-200 rounded-xl focus:border-rose-600 focus:ring-4 focus:ring-rose-500/5 outline-none transition-all"
                          />
                        ))}
                      </div>
                      <GlassButton className="w-full py-3 bg-slate-900 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-lg group">
                        Authorize Node
                        <CheckCircle2
                          size={16}
                          className="group-hover:scale-110 transition-transform"
                        />
                      </GlassButton>
                    </form>

                    <div className="mt-6 pt-5 border-t border-slate-200/50 flex flex-col items-center">
                      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                        Didn't receive code?{" "}
                        <button className="text-rose-600 hover:underline ml-1">
                          Resend
                        </button>
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* CONTENT SIDE */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={transition}
              className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden bg-slate-900"
            >
              <AnimatedBackground />
              <ContentCarousel mode="signup" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @media (min-width: 1024px) {
          body,
          html {
            overflow: hidden !important;
            height: 100vh !important;
          }
        }
        .form-input-container {
          position: relative;
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 0.75rem;
          transition: all 0.3s ease;
        }
        .form-input-container:focus-within {
          border-color: #e11d48;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.05);
        }
        .form-input-field {
          width: 100%;
          padding: 0.65rem 1rem 0.65rem 2.8rem;
          background: transparent;
          outline: none;
          font-size: 0.85rem;
          font-weight: 500;
          color: #0f172a;
        }
      `}</style>
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
      <div className="min-h-[100px]">
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

const FormInput = ({
  icon,
  label,
  placeholder,
  type = "text",
  isPassword,
  showPass,
  setShowPass,
}) => (
  <div className="space-y-1">
    <label className="text-[8px] font-black uppercase tracking-wider text-slate-400 ml-0.5">
      {label}
    </label>
    <div className="form-input-container group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-600 transition-colors">
        {icon}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        className="form-input-field"
        required
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPass(!showPass)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600"
        >
          {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      )}
    </div>
  </div>
);

export default AuthPage;
