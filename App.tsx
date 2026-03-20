import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { 
  Activity, 
  Clock, 
  FileText, 
  Heart, 
  ShieldCheck, 
  Zap,
  ArrowRight,
  ChevronRight,
  LogOut,
  User as UserIcon,
  Video
} from 'lucide-react';
import LiveAudioChat from './components/LiveAudioChat';
import { auth, signInWithGoogle, logOut, onAuthStateChanged, User } from './firebase';

import caduceusVideo from "./components/assets/Smart_Caduceus_Animation_202603201204.mp4";

const SectionHeader = ({ number, title }: { number: string; title: string }) => (
  <div className="flex items-baseline gap-4 mb-12 border-b border-white/20 pb-4">
    <span className="font-mono text-sm opacity-50 text-white">{number}</span>
    <h2 className="text-4xl font-bold uppercase tracking-tighter text-white">{title}</h2>
  </div>
);

const ServiceCard = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="p-8 border border-blue-400/50 bg-blue-900/30 backdrop-blur-xl rounded-2xl flex flex-col gap-4 group transition-all hover:bg-blue-900/50 hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-400/70"
  >
    <div className="w-12 h-12 rounded-full bg-blue-400/20 flex items-center justify-center group-hover:bg-blue-400/30 transition-colors">
      <Icon className="w-6 h-6 text-blue-300" />
    </div>
    <h3 className="text-xl font-bold uppercase tracking-tight text-blue-300">{title}</h3>
    <p className="text-sm text-blue-100/90 leading-relaxed font-medium">{description}</p>
    <div className="mt-auto pt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity text-blue-400">
      Access Portal <ArrowRight className="w-3 h-3" />
    </div>
  </motion.div>
);

const BuildStep = ({ step, title, description, detail }: { step: string; title: string; description: string; detail: string }) => (
  <div className="grid grid-cols-[40px_1fr] gap-8 py-8 border-b border-blue-400/30 last:border-0 text-blue-300">
    <span className="font-mono text-xs opacity-60 pt-1 font-bold">{step}</span>
    <div>
      <h4 className="text-lg font-bold uppercase mb-2">{title}</h4>
      <p className="text-sm text-blue-100/90 mb-2 font-medium">{description}</p>
      <p className="text-[10px] font-mono opacity-80 uppercase tracking-tight font-bold text-blue-400">{detail}</p>
    </div>
  </div>
);

const ScrollText = ({ text, className = "text-xl font-bold uppercase tracking-tight text-white" }: { text: string, className?: string }) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "end 50%"]
  });

  const characters = text.split("");
  
  return (
    <p ref={ref} className={className + " flex flex-wrap"}>
      {characters.map((char, i) => {
        const start = i / characters.length;
        const end = start + (1 / characters.length);
        const opacity = useTransform(scrollYProgress, [start, end], [0.1, 1]);
        return (
          <motion.span key={i} style={{ opacity }} className={char === " " ? "w-[0.3em]" : ""}>
            {char}
          </motion.span>
        );
      })}
    </p>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [navVisible, setNavVisible] = useState(false);

  const { scrollYProgress } = useScroll();
  const videoOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.4]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY < 120) {
        setNavVisible(true);
      } else {
        setNavVisible(false);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleAuth = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Auth failed", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white font-sans selection:bg-blue-500 selection:text-white relative">
      
      {/* Sticky Background Video */}
      <motion.div 
        style={{ opacity: videoOpacity }} 
        className="fixed inset-0 z-[-1] pointer-events-none bg-black"
      >
        <video 
          src={caduceusVideo} 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-transparent backdrop-blur-[1px]" />
      </motion.div>

      {/* Main Content Wrapper */}
      <div className="relative z-10 p-safe">
        
        {/* Invisible hit area to trigger the navbar drop down */}
        <div className="fixed top-0 left-0 w-full h-12 z-[60] peer bg-transparent" />
        
        <nav className="fixed top-0 left-0 w-full -translate-y-full peer-hover:translate-y-0 hover:translate-y-0 transition-transform duration-500 ease-out border-b border-blue-400/40 bg-blue-900/60 backdrop-blur-2xl shadow-2xl shadow-blue-900/40 z-50 pb-2">
            <div className="max-w-7xl mx-auto px-6 h-24 flex items-end justify-between pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-sm flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Heart className="text-white w-5 h-5" />
                </div>
                <span className="font-bold uppercase tracking-tighter text-xl text-white">HealTrack.</span>
              </div>
              
              <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-white">
                <a href="#services" className="hover:text-blue-300 transition-colors px-3 py-1 rounded-full">Portal</a>
                <a href="#ai-help" className="hover:text-blue-300 transition-colors px-3 py-1 rounded-full">AI Assist</a>
                <a href="#about" className="hover:text-blue-300 transition-colors px-3 py-1 rounded-full">Mission</a>
                
                {!user ? (
                  <div className="flex items-center gap-4 ml-4">
                    <button 
                      onClick={handleAuth}
                      className="hover:text-blue-300 transition-colors font-bold"
                    >
                      Log In
                    </button>
                    <button 
                      onClick={handleAuth}
                      className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30 border border-blue-400/50"
                    >
                      Sign Up
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 ml-4 border-l border-white/20 pl-4">
                    <div className="flex items-center gap-2">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-blue-400/50 shadow-sm" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-500/30 border border-blue-400/50 flex items-center justify-center shadow-sm">
                          <UserIcon className="w-4 h-4 text-blue-200" />
                        </div>
                      )}
                      <span className="text-xs font-bold text-white bg-blue-900/50 border border-blue-500/30 px-3 py-1.5 rounded-lg backdrop-blur">{user.displayName?.split(' ')[0]}</span>
                    </div>
                    <button 
                      onClick={() => logOut()}
                      className="p-2 text-white/80 hover:text-red-400 bg-blue-900/50 border border-blue-500/30 rounded-full transition-colors backdrop-blur"
                      title="Log Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="absolute bottom-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
          </nav>

        {/* Hero Section */}
        <section className="relative pt-40 pb-20 px-6 min-h-[90vh] flex flex-col justify-center overflow-hidden">
          <div className="max-w-7xl mx-auto w-full">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative z-10"
            >
              <span className="inline-block px-4 py-1 bg-blue-600/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-8 rounded-full shadow-lg border border-blue-400/50">
                Systems Online / Intelligence Active
              </span>
              <h1 className="text-[13vw] md:text-[10vw] leading-[0.85] font-black uppercase tracking-tighter mb-12 text-white drop-shadow-2xl">
                Unified <br />
                <span className="text-transparent stroke-white stroke-1" style={{ WebkitTextStroke: '2px #FFFFFF' }}>Healing</span>
              </h1>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mt-12">
                <p className="max-w-md text-lg md:text-xl text-blue-50 font-medium leading-tight backdrop-blur-xl bg-blue-900/40 p-6 rounded-2xl border border-blue-400/40 shadow-2xl">
                  Experience a healthcare system that works for you. 
                  Real-time queue tracking, instant reports, and personalized AI architecture.
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={!user ? handleAuth : undefined}
                    className="group flex items-center gap-4 bg-white/10 backdrop-blur-md text-white px-8 py-6 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-blue-600 transition-colors shadow-2xl shadow-blue-900/50 border border-blue-400/50"
                  >
                    {user ? 'Open Dashboard' : 'Enter Portal'} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-32 px-6">
          <div className="max-w-7xl mx-auto text-white">
            <SectionHeader number="01" title="Digital Services" />
            
            <div className="mb-16 max-w-4xl bg-blue-900/30 p-10 rounded-3xl backdrop-blur-2xl border border-blue-400/40 shadow-2xl">
               <ScrollText text="We replace outdated, fragmented systems with unified technology. Ensuring every patient feels seen, heard, and cared for." className="text-2xl md:text-4xl font-black uppercase leading-tight tracking-tighter text-blue-300" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ServiceCard 
                icon={Clock}
                title="Track Queue"
                description="Real-time monitoring of your clinic queue. Know exactly when you'll be seen, down to the minute."
              />
              <ServiceCard 
                icon={Activity}
                title="Book Appointment"
                description="Instant scheduling with top specialists. Bypass the phone lines and hold times."
              />
              <ServiceCard 
                icon={FileText}
                title="View Reports"
                description="Encrypted access to your medical history, test results, and prescriptions in one tap."
              />
              <ServiceCard 
                icon={ShieldCheck}
                title="Secure Records"
                description="Bank-grade encryption protecting your most sensitive personal health information."
              />
              <ServiceCard 
                icon={Zap}
                title="Instant Alerts"
                description="Push notifications for prescription refills, appointment reminders, and live queue updates."
              />
              <ServiceCard 
                icon={Video}
                title="Telehealth"
                description="Connect with your primary care provider through our high-definition, secure video bridge."
              />
            </div>
          </div>
        </section>

        {/* AI Integration Section */}
        <section id="ai-help" className="py-32 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 text-white">
            <div className="bg-blue-900/30 p-12 rounded-3xl backdrop-blur-2xl border border-blue-400/40 shadow-2xl">
              <SectionHeader number="02" title="AI Assistant" />
              
              <div className="mb-12">
                 <ScrollText text="Your personal medical intelligence. Get instant answers, triage guidance, and record summarization." className="text-2xl font-bold uppercase tracking-tight leading-tight text-blue-300" />
              </div>

              <div className="space-y-4">
                <BuildStep 
                  step="01"
                  title="Voice Intelligence"
                  description="Speak directly to your medical records using our advanced voice AI interface."
                  detail="POWERED_BY_GEMINI_V2.5"
                />
                <BuildStep 
                  step="02"
                  title="Automated Triage"
                  description="Smart symptom checking that routes you to the right care level instantly."
                  detail="NATURAL_LANGUAGE_PROCESSING"
                />
                <BuildStep 
                  step="03"
                  title="Record Synthesis"
                  description="Complex medical jargon translated into clear, actionable health summaries."
                  detail="CLINICAL_DATA_EXTRACTION"
                />
              </div>
            </div>
            <div className="relative group">
              <div className="aspect-[4/5] bg-blue-900/30 rounded-3xl overflow-hidden relative flex flex-col items-center justify-center border border-blue-400/40 p-8 shadow-2xl backdrop-blur-2xl">
                {/* LiveAudioChat Component mounted here */}
                <div className="w-full relative z-10 text-blue-300">
                  <LiveAudioChat />
                </div>
                
                {/* Visual Audio Wave Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-transparent to-transparent opacity-100 flex items-end justify-center pb-12 pointer-events-none">
                  <p className="text-blue-200 text-[10px] font-mono opacity-90 uppercase tracking-widest text-center font-bold bg-blue-900/80 border border-blue-500/50 px-4 py-2 rounded-full backdrop-blur-md shadow-lg shadow-blue-500/30">Audio_Interface / Active_Listening</p>
                </div>
              </div>
              
              {/* Floating Technical Label */}
              <div className="absolute -bottom-6 -left-6 bg-blue-900/90 backdrop-blur-3xl text-blue-300 p-8 rounded-2xl hidden md:block z-20 shadow-2xl border border-blue-400/60">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-emerald-400/50 shadow-md" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">System Uplink</span>
                </div>
                <div className="space-y-2 font-mono text-[10px] text-blue-200/90 font-bold">
                  <p>LATENCY: &lt;12ms</p>
                  <p>ENCRYPTION: AES-256</p>
                  <p>STATUS: OPERATIONAL</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section id="about" className="py-32 px-6">
          <div className="max-w-7xl mx-auto text-white bg-blue-900/30 p-12 rounded-3xl backdrop-blur-2xl border border-blue-400/40 shadow-2xl">
            <div className="flex flex-col md:flex-row gap-20 items-center">
              <div className="flex-1 order-2 md:order-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-square bg-blue-900/40 rounded-2xl overflow-hidden border border-blue-400/30 backdrop-blur-md shadow-inner text-blue-300 relative group">
                    <div className="absolute inset-0 bg-blue-500/30 mix-blend-overlay group-hover:opacity-0 transition-opacity z-10"></div>
                    <img src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400" alt="Medical Facility" className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 mix-blend-overlay" referrerPolicy="no-referrer" />
                  </div>
                  <div className="aspect-square bg-blue-900/40 rounded-2xl overflow-hidden translate-y-8 border border-blue-400/30 backdrop-blur-md shadow-inner text-blue-300 relative group">
                    <div className="absolute inset-0 bg-blue-500/30 mix-blend-overlay group-hover:opacity-0 transition-opacity z-10"></div>
                    <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=400" alt="Lab Detail" className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 mix-blend-overlay" referrerPolicy="no-referrer" />
                  </div>
                </div>
              </div>
              <div className="flex-1 order-1 md:order-2">
                <SectionHeader number="03" title="Our Mission" />

                <div className="mb-8">
                  <ScrollText text="We are humanizing healthcare through structured data and intelligent design." className="text-3xl font-black uppercase tracking-tight text-blue-300" />
                </div>

                <div className="space-y-6 text-lg text-white font-medium leading-relaxed bg-blue-900/40 p-8 rounded-2xl border border-blue-400/40 shadow-inner">
                  <p>
                    Distress often comes from the unknown. Our real-time queue tracking and transparent communication tools are designed to provide peace of mind when you need it most.
                  </p>
                  <p>
                    Your health data belongs to you. We provide a secure, unified portal where your records are always accessible, empowering you to take control of your healing journey.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-8 mt-12 bg-blue-900/40 p-8 rounded-2xl border border-blue-400/40 shadow-inner">
                  <div>
                    <div className="text-4xl font-black mb-1 text-blue-300">99.9%</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-90 text-blue-100">Uptime Reliability</div>
                  </div>
                  <div>
                    <div className="text-4xl font-black mb-1 text-blue-300">2M+</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-90 text-blue-100">Patient Records</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-20 px-6 border-t border-blue-400/30 bg-blue-900/50 backdrop-blur-3xl mt-20 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12 text-white">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded-sm flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Heart className="text-white w-4 h-4" />
                </div>
                <span className="font-bold uppercase tracking-tighter text-lg text-white">HealTrack.</span>
              </div>
              <p className="text-sm opacity-90 font-medium max-w-xs leading-relaxed text-blue-100">
                Engineering the standard of modern healthcare systems. Built for patients, by practitioners.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
              <div className="space-y-4 bg-blue-900/40 p-6 rounded-2xl border border-blue-400/30 shadow-inner">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-300">System</h4>
                <ul className="text-sm font-semibold space-y-2">
                  <li><a href="#" className="hover:text-blue-200 transition-colors text-white">Portal Login</a></li>
                  <li><a href="#" className="hover:text-blue-200 transition-colors text-white">Status Page</a></li>
                  <li><a href="#" className="hover:text-blue-200 transition-colors text-white">Updates</a></li>
                </ul>
              </div>
              <div className="space-y-4 bg-blue-900/40 p-6 rounded-2xl border border-blue-400/30 shadow-inner">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-300">Support</h4>
                <ul className="text-sm font-semibold space-y-2">
                  <li><a href="#" className="hover:text-blue-200 transition-colors text-white">Help Center</a></li>
                  <li><a href="#" className="hover:text-blue-200 transition-colors text-white">Contact Us</a></li>
                  <li><a href="#" className="hover:text-blue-200 transition-colors text-white">Security</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-blue-400/30 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest opacity-80 text-blue-200">
            <p>© 2026 HealTrack Healthcare System.</p>
            <p>Privacy / HIPAA Compliance / Terms</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
