"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Zap,
  CheckCircle2,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react";
import GlassButton from "@/component/Button";
import { useAuth } from "@/store/authStore";

const SignupFormInput = ({
  icon,
  label,
  placeholder,
  type = "text",
  isPassword,
  showPass,
  onTogglePass,
  value,
  onChange,
}) => (
  <div className="space-y-1">
    <label className="text-[8px] font-black uppercase tracking-wider text-slate-400 ml-0.5">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-600 transition-colors z-10">
        {icon}
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-white/50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-rose-600 focus:ring-4 focus:ring-rose-500/5 transition-all"
        required
      />
      {isPassword && (
        <button
          type="button"
          onClick={onTogglePass}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 z-10"
        >
          {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      )}
    </div>
  </div>
);

const SignupForm = ({ onSwitchToLogin }) => {
  const router = useRouter();
  const inputRefs = useRef([]);
  const {
    signupStep,
    signupForm,
    signupShowPass,
    verificationCode,
    loading,
    error,
    requestVerificationCode,
    verifyAndRegister,
    setSignupStep,
    setSignupField,
    setVerificationDigit,
    toggleSignupPass,
  } = useAuth();

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    await requestVerificationCode();
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    const ok = await verifyAndRegister();
    if (ok) {
      router.push("/dashboard");
    }
  };

  const onCodeChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    setVerificationDigit(index, value.slice(-1));

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const onCodeKeyDown = (index, e) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="w-full lg:w-1/2 flex items-center justify-center p-4 overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {signupStep === "register" ? (
          <motion.div
            key="register-fields"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full max-w-88 p-6 lg:p-8 bg-white/40 backdrop-blur-xl border border-white/80 shadow-2xl rounded-[2.5rem]"
          >
            <header className="mb-6 text-left">
              <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center mb-3 shadow-lg shadow-orange-200">
                <Zap className="text-white" size={20} />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Create Node
              </h1>
              <p className="text-slate-500 text-[13px] font-medium leading-tight">
                Join the orchestration network.
              </p>
            </header>

            <form className="space-y-3" onSubmit={handleRegisterSubmit}>
              <SignupFormInput
                icon={<User size={14} />}
                label="Alias"
                placeholder="Nexus_01"
                value={signupForm.alias}
                onChange={(e) => setSignupField("alias", e.target.value)}
              />
              <SignupFormInput
                icon={<Mail size={14} />}
                label="Neural Mail"
                placeholder="hello@nexus.ai"
                value={signupForm.email}
                onChange={(e) => setSignupField("email", e.target.value)}
              />
              <SignupFormInput
                icon={<Lock size={14} />}
                label="Master Key"
                placeholder="••••••••"
                type={signupShowPass ? "text" : "password"}
                isPassword
                showPass={signupShowPass}
                onTogglePass={toggleSignupPass}
                value={signupForm.password}
                onChange={(e) => setSignupField("password", e.target.value)}
              />
              <GlassButton
                type="submit"
                className="w-full py-3 bg-linear-to-r from-rose-600 to-orange-500 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-lg mt-4 group"
              >
                {loading ? "Sending Code..." : "Register"}{" "}
                <Zap
                  size={16}
                  className="group-hover:rotate-12 transition-transform"
                />
              </GlassButton>
              {error ? (
                <p className="text-xs text-rose-600 font-semibold">{error}</p>
              ) : null}
            </form>

            <div className="mt-6 pt-5 border-t border-slate-200/50 flex flex-col items-center">
              <button
                onClick={onSwitchToLogin}
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
            key="verify-fields"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full max-w-88 p-6 lg:p-8 bg-white/40 backdrop-blur-xl border border-white/80 shadow-2xl rounded-[2.5rem]"
          >
            <header className="mb-6 text-left">
              <button
                onClick={() => setSignupStep("register")}
                className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase hover:text-rose-600 mb-2 transition-colors"
              >
                <ChevronLeft size={12} /> Back
              </button>
              <div className="w-9 h-9 bg-rose-600 rounded-lg flex items-center justify-center mb-3 shadow-lg shadow-rose-100">
                <ShieldCheck className="text-white" size={20} />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Verify Identity
              </h1>
              <p className="text-slate-500 text-[13px] font-medium leading-tight">
                A neural code was sent to {signupForm.email || "your mail"}.
              </p>
            </header>

            <form className="space-y-6" onSubmit={handleVerifySubmit}>
              <div className="flex justify-between gap-2">
                {verificationCode.map((val, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputRefs.current[i] = el;
                    }}
                    type="text"
                    maxLength={1}
                    value={val}
                    onChange={(e) => onCodeChange(i, e.target.value)}
                    onKeyDown={(e) => onCodeKeyDown(i, e)}
                    className="w-full h-12 text-center text-lg font-bold bg-white/60 border border-slate-200 rounded-xl focus:border-rose-600 focus:ring-4 focus:ring-rose-500/5 outline-none transition-all"
                  />
                ))}
              </div>
              <GlassButton
                type="submit"
                className="w-full py-3 bg-slate-900 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-lg group"
              >
                {loading ? "Authorizing..." : "Authorize Node"}{" "}
                <CheckCircle2
                  size={16}
                  className="group-hover:scale-110 transition-transform"
                />
              </GlassButton>
              {error ? (
                <p className="text-xs text-rose-600 font-semibold">{error}</p>
              ) : null}
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
  );
};

export default SignupForm;
