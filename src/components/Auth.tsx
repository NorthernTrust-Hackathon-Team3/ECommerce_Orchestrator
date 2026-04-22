import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LogIn, Key, Phone, Mail } from "lucide-react";

interface AuthProps {
  onLogin: () => void;
}

export default function Auth({ onLogin }: AuthProps) {
  const [step, setStep] = useState<'login' | 'otp'>('login');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);

  const handleIdentifierSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Simple email regex
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    // 10 digits phone regex
    const isPhone = /^\d{10}$/.test(identifier);

    if (isEmail || isPhone) {
      setStep('otp');
    } else {
      alert("Please enter a valid email or a 10-digit phone number.");
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (otp.every(v => v !== '')) {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#4F46E5] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-100">
            <LogIn className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-[#0F172A] tracking-tighter uppercase italic">E-commerce</h1>
          <p className="text-[#64748B] mt-1 font-bold text-xs uppercase tracking-widest">Everything at one place</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-2xl border border-[#E2E8F0]">
          <AnimatePresence mode="wait">
            {step === 'login' ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleIdentifierSubmit}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-bold text-[#475569] mb-2 uppercase tracking-wider">Email or Phone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-[#94A3B8]" />
                    </div>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="block w-full pl-10 pr-3 py-4 border border-[#E2E8F0] rounded-xl leading-5 bg-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] sm:text-sm"
                      placeholder="name@company.com or +1 (555) 000-0000"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-[#4F46E5] hover:bg-[#4338CA] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4F46E5] transition-all transform active:scale-95"
                >
                  Send OTP
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="otp"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleOtpSubmit}
                className="space-y-8"
              >
                <div className="text-center">
                  <p className="text-sm text-[#64748B]">Enter the 4-digit code sent to <span className="font-bold text-[#0F172A]">{identifier}</span></p>
                </div>

                <div className="flex justify-center gap-4">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="number"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      className="w-16 h-20 text-center text-3xl font-bold border border-[#E2E8F0] rounded-2xl bg-[#F8FAFC] focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] outline-none transition-all"
                    />
                  ))}
                </div>

                <div className="space-y-4">
                  <button
                    type="submit"
                    className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-[#4F46E5] hover:bg-[#4338CA] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4F46E5] transition-all transform active:scale-95"
                  >
                    Verify & Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('login')}
                    className="w-full text-sm font-bold text-[#4F46E5] hover:text-[#4338CA]"
                  >
                    Change Identifier
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
