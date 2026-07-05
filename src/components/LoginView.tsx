import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  Unlock, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  Coins, 
  Sparkles,
  Cpu,
  Terminal,
  ShieldAlert
} from 'lucide-react';

interface LoginViewProps {
  onUnlock: () => void;
}

// ----------------------------------------------------------------------
// 1. Particle Systems Types
// ----------------------------------------------------------------------
interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  angle: number;
  speed: number;
  orbitRadius: number;
  orbitSpeed: number;
  mode: 'assemble' | 'orbit' | 'explode' | 'sink';
}

export default function LoginView({ onUnlock }: LoginViewProps) {
  // Input fields (default demo credentials)
  const [username, setUsername] = useState('Raja@05');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  // Animation Stages
  const [isAssembling, setIsAssembling] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [decryptionProgress, setDecryptionProgress] = useState(0);
  const [terminalText, setTerminalText] = useState('');

  // Refs for Interactive Canvas animations
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, radius: 120 });
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameId = useRef<number | null>(null);

  // ----------------------------------------------------------------------
  // 2. Interactive Canvas Particle Engine Setup
  // ----------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Color palette for modern cyber aesthetic
    const colors = [
      'rgba(6, 182, 212, ',   // Cyan
      'rgba(168, 85, 247, ',  // Purple
      'rgba(59, 130, 246, ',  // Neon Blue
      'rgba(34, 211, 238, '   // Bright Cyan
    ];

    // Initialize 220 premium interactive particles
    const initParticles = () => {
      const pArr: Particle[] = [];
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      for (let i = 0; i < 220; i++) {
        // Disperse uniformly around viewport boundaries to enable "cinematic assembly"
        const dist = Math.max(window.innerWidth, window.innerHeight) * (0.4 + Math.random() * 0.4);
        const theta = Math.random() * Math.PI * 2;
        const startX = centerX + Math.cos(theta) * dist;
        const startY = centerY + Math.sin(theta) * dist;

        const pColor = colors[Math.floor(Math.random() * colors.length)];
        const orbitRad = 150 + Math.random() * 250;

        pArr.push({
          x: startX,
          y: startY,
          originX: startX,
          originY: startY,
          vx: 0,
          vy: 0,
          radius: 1 + Math.random() * 2.2,
          color: pColor,
          alpha: 0.1 + Math.random() * 0.6,
          angle: Math.random() * Math.PI * 2,
          speed: 1.5 + Math.random() * 3,
          orbitRadius: orbitRad,
          orbitSpeed: (0.002 + Math.random() * 0.008) * (Math.random() > 0.5 ? 1 : -1),
          mode: 'assemble'
        });
      }
      particlesRef.current = pArr;
    };
    initParticles();

    // Trigger transition from 'assemble' to 'orbit' mode after 1.8s of startup sequence
    const assembleTimer = setTimeout(() => {
      setIsAssembling(false);
      particlesRef.current.forEach(p => {
        p.mode = 'orbit';
      });
    }, 1800);

    // Interactive mouse tracker
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // ----------------------------------------------------------------------
    // 3. Render Loop (60 FPS fluid quantum environment)
    // ----------------------------------------------------------------------
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      particlesRef.current.forEach((p) => {
        if (p.mode === 'assemble') {
          // Accelerate particles into the central core
          const dx = centerX - p.x;
          const dy = centerY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist > 8) {
            p.vx = (dx / dist) * p.speed * 4;
            p.vy = (dy / dist) * p.speed * 4;
            p.x += p.vx;
            p.y += p.vy;
          } else {
            p.mode = 'orbit';
          }
        } 
        else if (p.mode === 'orbit') {
          // Fluid orbit around gravity center with responsive mouse repelling
          p.angle += p.orbitSpeed;
          const targetX = centerX + Math.cos(p.angle) * p.orbitRadius;
          const targetY = centerY + Math.sin(p.angle) * p.orbitRadius;

          // Natural interpolation
          p.x += (targetX - p.x) * 0.05;
          p.y += (targetY - p.y) * 0.05;

          // Mouse magnet repulsion
          const mDx = p.x - mouseRef.current.x;
          const mDy = p.y - mouseRef.current.y;
          const mDist = Math.sqrt(mDx * mDx + mDy * mDy);
          if (mDist < mouseRef.current.radius) {
            const force = (mouseRef.current.radius - mDist) / mouseRef.current.radius;
            p.x += (mDx / mDist) * force * 15;
            p.y += (mDy / mDist) * force * 15;
          }
        } 
        else if (p.mode === 'explode') {
          // Burst outwards
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.05; // Gentle gravity pull
          p.alpha -= 0.015; // Slow fade
        }
        else if (p.mode === 'sink') {
          // Access granted - spin rapidly into singularity vortex
          p.angle += 0.08;
          p.orbitRadius = Math.max(2, p.orbitRadius - 8);
          const targetX = centerX + Math.cos(p.angle) * p.orbitRadius;
          const targetY = centerY + Math.sin(p.angle) * p.orbitRadius;
          p.x += (targetX - p.x) * 0.2;
          p.y += (targetY - p.y) * 0.2;
          p.alpha = Math.max(0, p.alpha - 0.01);
        }

        // Draw node
        if (p.alpha > 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color + p.alpha + ')';
          ctx.fill();

          // Intermittently connect near particles for organic AI neural network web
          if (Math.random() < 0.05 && p.mode === 'orbit') {
            particlesRef.current.forEach((other) => {
              const oDx = p.x - other.x;
              const oDy = p.y - other.y;
              const oDist = Math.sqrt(oDx * oDx + oDy * oDy);
              if (oDist < 75 && other !== p) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(other.x, other.y);
                ctx.strokeStyle = `rgba(6, 182, 212, ${0.03 * (1 - oDist / 75)})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
              }
            });
          }
        }
      });

      // Filter out faded/dispersed explosion particles
      particlesRef.current = particlesRef.current.filter(p => p.alpha > 0);

      animationFrameId.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      clearTimeout(assembleTimer);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // ----------------------------------------------------------------------
  // 4. Decryption & Cinematic Terminal Simulation on Successful Login
  // ----------------------------------------------------------------------
  const handleDecryptionSequence = () => {
    setIsVerifying(true);
    let progress = 0;
    const codes = [
      'INITIALIZING CIPHER HANDSHAKE...',
      'ESTABLISHING SHIELDED ENCLAVE FOR USER UID [Raja@05]...',
      'FETCHING COMPRESSED FINANCIAL LEDGERS...',
      'VERIFYING CRYPTOGRAPHIC STORAGE KEY...',
      'LEDGER SYNCHRONIZATION: OK!',
      'ACCESS GRANTED. REDIRECTING...'
    ];
    let codeIndex = 0;

    const interval = setInterval(() => {
      progress += 2;
      setDecryptionProgress(progress);

      // Rotate terminal status messages based on current completion
      const currentIdx = Math.min(Math.floor((progress / 100) * codes.length), codes.length - 1);
      if (currentIdx !== codeIndex) {
        codeIndex = currentIdx;
        setTerminalText(codes[codeIndex]);
      }

      if (progress >= 100) {
        clearInterval(interval);
        setIsVerifying(false);
        setIsSuccess(true);
        
        // Command particles to collapse into a central black hole
        particlesRef.current.forEach(p => {
          p.mode = 'sink';
        });

        // Trigger parent state transition 
        setTimeout(() => {
          onUnlock();
        }, 1200);
      }
    }, 40);
  };

  // ----------------------------------------------------------------------
  // 5. Liquid Gradient Ripple & Particle Explosion Click Event Handler
  // ----------------------------------------------------------------------
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username.trim() === 'Raja@05' && password === '123456') {
      // Spawn cinematic explosion around the login center point on valid submit
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const burstParticles: Particle[] = [];
      const cyberColors = ['rgba(6, 182, 212, ', 'rgba(168, 85, 247, ', 'rgba(236, 72, 153, '];

      for (let i = 0; i < 90; i++) {
        const theta = Math.random() * Math.PI * 2;
        const velocity = 5 + Math.random() * 12;
        burstParticles.push({
          x: centerX,
          y: centerY,
          originX: centerX,
          originY: centerY,
          vx: Math.cos(theta) * velocity,
          vy: Math.sin(theta) * velocity,
          radius: 1.5 + Math.random() * 2.5,
          color: cyberColors[Math.floor(Math.random() * cyberColors.length)],
          alpha: 1,
          angle: theta,
          speed: velocity,
          orbitRadius: 0,
          orbitSpeed: 0,
          mode: 'explode'
        });
      }
      particlesRef.current = [...particlesRef.current, ...burstParticles];

      // Initiate secure cryptographic decoding flow
      handleDecryptionSequence();
    } else {
      setError('DECRYPTION FAILURE: Access keys rejected. Verify credentials below.');
    }
  };

  const handleQuickBypass = () => {
    setUsername('Raja@05');
    setPassword('123456');
    const bypassEvent = { preventDefault: () => {} } as React.FormEvent;
    setTimeout(() => {
      handleFormSubmit(bypassEvent);
    }, 100);
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#030611] font-sans text-slate-100 select-none overflow-hidden"
    >
      {/* Dynamic Render Surface */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none z-0" 
      />

      {/* Cyberpunk ambient spatial background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-cyan-600/10 blur-[120px] animate-pulse duration-[7000ms]" />
        <div className="absolute bottom-1/3 right-1/4 w-[450px] h-[450px] rounded-full bg-purple-600/10 blur-[130px] animate-pulse duration-[10000ms]" />
        
        {/* Ambient scanning cyber-laser line sweep */}
        <div className="absolute inset-0 bg-laser-scan opacity-20 pointer-events-none" />
      </div>

      {/* Holographic rotating geometry orbiting the AI Core */}
      <div className={`absolute pointer-events-none z-10 transition-all duration-1000 ${isAssembling ? 'scale-0 rotate-180 opacity-0' : 'scale-100 rotate-0 opacity-100'}`}>
        {/* Hologram Outer Orbit Ring */}
        <div className="w-[620px] h-[620px] rounded-full border border-dashed border-cyan-500/25 animate-spin duration-[40000ms]" />
        {/* Hologram Inner Orbit Ring */}
        <div className="absolute inset-4 rounded-full border border-indigo-500/15 animate-spin duration-[25000ms] [animation-direction:reverse]" />
        {/* Hologram Laser Axis Coordinates */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[102%] h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
          <div className="absolute w-[1px] h-[102%] bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent" />
        </div>
      </div>

      {/* ----------------------------------------------------------------------
          Main Content Container: Emerging from Core
          ---------------------------------------------------------------------- */}
      <div className={`relative z-20 w-full max-w-md mx-4 transition-all duration-700 ${
        isAssembling ? 'scale-90 opacity-0 blur-md' : 'scale-100 opacity-100 blur-none'
      }`}>
        
        {/* Holographic Header badge */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/35 backdrop-blur-xl shadow-[0_0_20px_rgba(6,182,212,0.15)] animate-bounce duration-[3000ms]">
            <Cpu className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span className="text-[10px] font-black tracking-wider text-cyan-300 uppercase">AI SECURE INSTANCE GATEWAY</span>
          </div>
        </div>

        {/* Morphing Quantum Glassmorphism Box */}
        <div className="relative bg-[#070d1e]/80 border border-slate-800/80 backdrop-blur-3xl rounded-3xl p-8 shadow-[0_20px_80px_rgba(2,6,23,0.9)] overflow-hidden transition-all duration-500">
          
          {/* Cyan Glow Corners decoration */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/40 rounded-tl-xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500/40 rounded-tr-xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-indigo-500/40 rounded-bl-xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-indigo-500/40 rounded-br-xl pointer-events-none" />

          {/* Liquid highlight neon header lines */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

          {/* ----------------------------------------------------------------------
              SCREEN A: SECURE DECRYPTION SEQUENCE LOADING SCREEN
              ---------------------------------------------------------------------- */}
          {isVerifying && (
            <div className="min-h-[300px] flex flex-col items-center justify-center py-6 space-y-6">
              <div className="relative">
                {/* Rotating ring */}
                <div className="h-20 w-20 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                <div className="absolute inset-2 rounded-full border border-indigo-500/15 border-b-indigo-400 animate-spin [animation-direction:reverse]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Terminal className="h-6 w-6 text-cyan-400 animate-pulse" />
                </div>
              </div>

              <div className="space-y-3 w-full text-center">
                <h3 className="text-sm font-bold text-slate-100 tracking-wider">DECRYPTING QUANTUM DATABASE</h3>
                <div className="font-mono text-[9px] text-cyan-400 bg-slate-950/70 border border-slate-900 px-3 py-2 rounded-lg max-w-xs mx-auto truncate h-8 leading-tight">
                  {terminalText}
                </div>
              </div>

              {/* Graphical Decryption Meter */}
              <div className="w-full max-w-[240px]">
                <div className="flex justify-between text-[9px] font-mono text-slate-500 mb-1 font-bold">
                  <span>HASH: SHA-256</span>
                  <span>{decryptionProgress}%</span>
                </div>
                <div className="h-1 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                    style={{ width: `${decryptionProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------
              SCREEN B: CINEMATIC SYSTEM UNLOCKED OVERLAY
              ---------------------------------------------------------------------- */}
          {isSuccess && (
            <div className="min-h-[300px] flex flex-col items-center justify-center py-6 space-y-6 animate-scale-up">
              <div className="relative">
                {/* Giant Green Check circle */}
                <div className="h-24 w-24 rounded-full bg-emerald-500/10 border border-emerald-500/35 flex items-center justify-center text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                  <ShieldCheck className="h-12 w-12" />
                </div>
                <div className="absolute -inset-2 rounded-full border border-emerald-500/10 animate-ping" />
              </div>

              <div className="text-center space-y-1.5">
                <h2 className="text-xl font-extrabold text-white tracking-tight uppercase">ACCESS GRANTED</h2>
                <p className="text-[11px] text-emerald-400 font-mono font-bold tracking-wider">
                  DECRYPTION COMPLETED SUCCESSFULLY
                </p>
              </div>

              <span className="text-[9px] font-mono text-slate-500">
                LOADING USER INSTANCE SHELL...
              </span>
            </div>
          )}

          {/* ----------------------------------------------------------------------
              SCREEN C: STANDARD LOGIN CARD INTERFACE
              ---------------------------------------------------------------------- */}
          {!isVerifying && !isSuccess && (
            <div className="space-y-6">
              
              {/* Core identity logo block */}
              <div className="flex flex-col items-center text-center space-y-1.5">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/15">
                  <Coins className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tight text-white">Expense Tracking Agent</h1>
                  <p className="text-[10px] text-slate-400 mt-0.5 tracking-wide">Enter access signature to decrypt your financial registry</p>
                </div>
              </div>

              {/* Login Credentials Form */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                
                {/* Floating label Username field */}
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors duration-150">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder=" "
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs font-semibold text-white outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-150 placeholder-transparent peer"
                    id="username-key"
                  />
                  <label 
                    htmlFor="username-key"
                    className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-semibold pointer-events-none transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-xs peer-focus:top-2 peer-focus:text-[9px] peer-focus:text-cyan-400 peer-focus:font-black peer-focus:tracking-wider peer-focus:uppercase peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[9px]"
                  >
                    AGENT USERNAME ID
                  </label>
                </div>

                {/* Floating label PIN field */}
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors duration-150">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder=" "
                    className="w-full pl-10 pr-12 py-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs font-semibold text-white outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all duration-150 placeholder-transparent tracking-widest font-mono peer"
                    id="password-key"
                  />
                  <label 
                    htmlFor="password-key"
                    className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-semibold pointer-events-none transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-xs peer-focus:top-2 peer-focus:text-[9px] peer-focus:text-cyan-400 peer-focus:font-black peer-focus:tracking-wider peer-focus:uppercase peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[9px]"
                  >
                    SECURITY ACCESS PIN
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition duration-150 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Error warning panel */}
                {error && (
                  <div className="rounded-xl border border-rose-500/15 bg-rose-500/5 p-3 text-[11px] text-rose-400 font-bold flex items-center gap-2.5 animate-shake">
                    <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
                    <p className="leading-snug">{error}</p>
                  </div>
                )}

                {/* Liquid glow cybernetic submission button */}
                <button
                  type="submit"
                  className="relative w-full group overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:via-indigo-500 hover:to-purple-500 p-[1.5px] font-bold text-white transition-all duration-200 active:scale-[0.98] shadow-[0_4px_20px_rgba(6,182,212,0.25)] cursor-pointer"
                >
                  <div className="relative rounded-[10px] bg-[#070d1e] group-hover:bg-transparent py-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2.5 transition-colors duration-200">
                    <Sparkles className="h-4 w-4 text-cyan-400 group-hover:text-white" />
                    Decrypt Registry Workspace
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                  {/* Subtle liquid border shine element */}
                  <div className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] translate-x-[-150%] group-hover:translate-x-[350%] transition-transform duration-[1200ms]" />
                </button>

              </form>

              {/* Quantum bypass developer utility sector */}
              <div className="rounded-2xl border border-slate-900 bg-slate-950/80 p-4 space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-extrabold text-cyan-400 tracking-wider uppercase flex items-center gap-1.5">
                    <Cpu className="h-3 w-3 animate-spin duration-3000" />
                    AUTHORIZED DEMO PROFILE
                  </span>
                  <button
                    onClick={handleQuickBypass}
                    className="text-[9px] font-bold text-indigo-400 hover:text-cyan-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg hover:scale-102 active:scale-98 transition duration-200 cursor-pointer"
                    title="Bypass and automatically sign in with credentials"
                  >
                    Instant Decrypt
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-500">
                  <div>
                    <span className="text-[9px] text-slate-600 block font-bold uppercase tracking-wider">DEMO USERNAME</span>
                    <code className="text-slate-300 font-mono font-bold block mt-0.5 bg-slate-900 px-2 py-1 rounded border border-slate-850 w-fit">Raja@05</code>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-600 block font-bold uppercase tracking-wider">SECURITY PIN</span>
                    <code className="text-slate-300 font-mono font-bold block mt-0.5 bg-slate-900 px-2 py-1 rounded border border-slate-850 w-fit">123456</code>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Corporate bottom credit footer block */}
        <div className="text-center text-[9px] font-bold text-slate-600 tracking-wider mt-4 flex justify-between items-center px-4">
          <span>AES-256 ENCRYPTED TRANSACTION PROTOCOL</span>
          <span>RAJA@05 SHELL SECURED</span>
        </div>

      </div>

      {/* Embedded advanced styling animations */}
      <style>{`
        /* Futuristic laser scan lines sweeping down screen */
        .bg-laser-scan {
          background: linear-gradient(
            to bottom,
            rgba(6, 182, 212, 0) 0%,
            rgba(6, 182, 212, 0.05) 45%,
            rgba(6, 182, 212, 0.2) 50%,
            rgba(6, 182, 212, 0.05) 55%,
            rgba(6, 182, 212, 0) 100%
          );
          background-size: 100% 400px;
          animation: sweep 8s linear infinite;
        }

        @keyframes sweep {
          0% { background-position: 0% -400px; }
          100% { background-position: 0% 100vh; }
        }

        @keyframes scale-up {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }

        .animate-scale-up {
          animation: scale-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>

    </div>
  );
}
