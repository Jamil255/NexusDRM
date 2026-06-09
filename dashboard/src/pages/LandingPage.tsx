import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Lock, BarChart3, Database, Key, Server, Play, Globe, Eye, Compass, ChevronRight, PlayCircle, Radio, Code, UserCheck, Cpu, Activity, Terminal, Send, CheckCircle2 } from 'lucide-react';

export const LandingPage: React.FC = () => {
  // Live Telemetry states
  const [keysGenerated, setKeysGenerated] = useState(1284592);
  const [cpuUsage, setCpuUsage] = useState(1.2);
  const [pingTime, setPingTime] = useState(14);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    '[INIT] Security daemon started on node-client-88',
    '[OK] Generated key package #482910 for HLS manifest',
    '[INFO] Handshake verified for tenant organization',
    '[OK] Dynamic licensing envelope sealed (AES-256-GCM)',
    '[OK] Streaming edge latency verified at 12ms',
  ]);

  useEffect(() => {
    // Increment keys generated count
    const keysInterval = setInterval(() => {
      setKeysGenerated(prev => prev + Math.floor(Math.random() * 5) + 1);
    }, 2500);

    // Fluctuate CPU usage
    const cpuInterval = setInterval(() => {
      setCpuUsage(prev => {
        const diff = (Math.random() - 0.5) * 0.4;
        const next = prev + diff;
        return parseFloat(Math.min(Math.max(next, 0.8), 3.2).toFixed(1));
      });
    }, 3000);

    // Fluctuate Ping time
    const pingInterval = setInterval(() => {
      setPingTime(prev => {
        const diff = Math.floor(Math.random() * 5) - 2;
        const next = prev + diff;
        return Math.min(Math.max(next, 9), 24);
      });
    }, 4000);

    // Scrolling logs simulator
    const logTemplates = [
      'Encrypted manifest segment #$NUM: signed & pushed',
      'Handshake completed with edge nodes in $REGION',
      'License issued for transaction ID: trx-$TRX',
      'Policy verified: geo-restriction enforcement check passed',
      'Cryptographic key rotation cycle successful',
      'Token verified: user organizational payload valid',
    ];

    const regions = ['EU-CENTRAL', 'US-WEST', 'AP-NORTHEAST', 'SA-EAST', 'US-EAST'];

    const logInterval = setInterval(() => {
      const template = logTemplates[Math.floor(Math.random() * logTemplates.length)];
      const num = Math.floor(Math.random() * 900) + 100;
      const region = regions[Math.floor(Math.random() * regions.length)];
      const trx = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const logMsg = template
        .replace('$NUM', num.toString())
        .replace('$REGION', region)
        .replace('$TRX', trx);

      const timestamp = new Date().toLocaleTimeString();
      const finalMsg = `[${timestamp}] ${logMsg}`;

      setLogs(prev => {
        const next = [...prev, finalMsg];
        if (next.length > 5) {
          next.shift();
        }
        return next;
      });
    }, 3500);

    return () => {
      clearInterval(keysInterval);
      clearInterval(cpuInterval);
      clearInterval(pingInterval);
      clearInterval(logInterval);
    };
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 5000);
    }
  };

  // Smooth scroll handler preventing URL hash modification
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-dark-50 flex flex-col font-sans selection:bg-brand-500/30 selection:text-brand-300">
      
      {/* Navbar */}
      <header className="h-20 bg-dark-950/40 border-b border-dark-900 backdrop-blur-md sticky top-0 z-50 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center space-x-2 animate-fade-in-up">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center border-glow-brand shadow-lg shadow-brand-500/10">
            <Shield size={20} className="text-dark-950 font-bold" />
          </div>
          <span className="text-xl font-bold font-sans tracking-wide text-dark-50">
            Nexus<span className="text-brand-400">DRM</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-dark-300 animate-fade-in-up animation-delay-200">
          <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:text-brand-400 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-brand-400 hover:after:w-full after:transition-all">Features</a>
          <a href="#solutions" onClick={(e) => scrollToSection(e, 'solutions')} className="hover:text-brand-400 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-brand-400 hover:after:w-full after:transition-all">Solutions</a>
          <a href="#architecture" onClick={(e) => scrollToSection(e, 'architecture')} className="hover:text-brand-400 transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-brand-400 hover:after:w-full after:transition-all">Architecture</a>
        </nav>

        <div className="animate-fade-in-up animation-delay-400">
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-lg text-sm font-bold bg-brand-500 text-dark-950 hover:bg-brand-400 hover:shadow-lg hover:shadow-brand-500/25 transition-all border border-brand-450 active:scale-95"
          >
            Launch Console
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 md:px-12 pt-20 pb-28 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center overflow-hidden">
        
        {/* Glow circles */}
        <div className="absolute top-1/4 left-1/10 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-3xl -z-10 animate-pulse-subtle"></div>
        <div className="absolute bottom-1/4 right-1/10 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl -z-10"></div>

        {/* Hero Left Content */}
        <div className="lg:col-span-7 space-y-6 text-left animate-fade-in-up">
          <span className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-brand-500/10 border border-brand-500/20 text-brand-400 uppercase tracking-wider animate-pulse-subtle">
            <Radio size={12} className="text-brand-400" />
            <span>Next-Gen Digital Rights Management SaaS</span>
          </span>

          <h1 className="text-4xl md:text-6xl font-extrabold text-dark-50 font-sans tracking-tight leading-tight">
            Secure, Transcode, and <br />
            Stream Videos with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-emerald-400 to-green-500 text-glow-brand">
              Military-Grade DRM
            </span>
          </h1>

          <p className="text-base md:text-lg text-dark-300 max-w-xl leading-relaxed">
            NexusDRM is an enterprise-ready SaaS console built to shield high-value streaming assets. Encrypt videos in real-time, issue dynamic licenses, and monitor streaming telemetry with custom dashboards.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-start space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-lg text-base font-bold bg-brand-500 text-dark-950 hover:bg-brand-400 hover:shadow-xl hover:shadow-brand-500/25 transition-all border border-brand-450 flex items-center justify-center space-x-2 active:scale-95"
            >
              <span>Go to Admin Dashboard</span>
              <ChevronRight size={16} />
            </Link>
            <a
              href="#features"
              onClick={(e) => scrollToSection(e, 'features')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-lg text-base font-bold bg-dark-900/60 border border-dark-800 text-dark-200 hover:border-brand-500/35 hover:text-dark-50 hover:bg-dark-900/90 transition-all flex items-center justify-center space-x-2"
            >
              <Play size={16} className="text-brand-400 fill-current" />
              <span>Explore Features</span>
            </a>
          </div>
        </div>

        {/* Hero Right Visual: Floating Mock Dashboard Graphic */}
        <div className="lg:col-span-5 flex justify-center animate-fade-in-up animation-delay-400">
          <div className="w-full max-w-[430px] p-6 glass-card rounded-2xl border border-dark-800/80 shadow-2xl relative animate-float">
            
            {/* Shimmer element */}
            <div className="absolute inset-0 rounded-2xl animate-shimmer pointer-events-none"></div>

            {/* Glowing Corner */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl -z-10"></div>

            {/* Header of Mock Console */}
            <div className="flex justify-between items-center pb-4 border-b border-dark-800/85">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>
              <span className="text-[10px] uppercase font-bold text-dark-500 tracking-wider">Console Terminal</span>
            </div>

            {/* Telemetry Cards mock */}
            <div className="space-y-4 pt-4">
              {/* Box 1 */}
              <div className="p-3 bg-dark-950/60 rounded-xl border border-dark-850 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <PlayCircle className="text-brand-400 shrink-0" size={18} />
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-dark-100">Dynamic HLS Transcoder</p>
                    <p className="text-[9px] text-dark-500 font-medium">Cloudinary Eager Transformation</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">720p ABR</span>
              </div>

              {/* Box 2 (Progress) */}
              <div className="p-3 bg-dark-950/60 rounded-xl border border-dark-850 space-y-2">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-dark-200">Encrypting video chunks...</span>
                  <span className="text-brand-400 text-[9px]">AES-256 Active</span>
                </div>
                <div className="w-full bg-dark-900 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-brand-500 h-1.5 rounded-full w-4/5 animate-pulse-subtle"></div>
                </div>
              </div>

              {/* Box 3 (Console payload manifest) */}
              <div className="p-3 bg-dark-950/90 rounded-xl border border-dark-850 text-left space-y-1">
                <span className="text-[8px] font-bold text-dark-500 uppercase tracking-wider block">Authorized Playback Manifest</span>
                <div className="font-mono text-[9px] text-emerald-400 break-all select-all leading-tight bg-dark-950 p-2 rounded border border-dark-900 truncate">
                  http://localhost:3000/stream/video/c1d2e3f4/manifest.m3u8?token=sig_eyJh...
                </div>
              </div>

              {/* Box 4 (Stats widgets) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-dark-950/60 rounded-xl border border-dark-850 flex flex-col justify-center items-start">
                  <span className="text-[8px] font-bold text-dark-500 uppercase tracking-wider">Telemetry RSS</span>
                  <span className="text-sm font-bold text-dark-100 font-mono mt-0.5">84.9 MB</span>
                </div>
                <div className="p-3 bg-dark-950/60 rounded-xl border border-dark-850 flex flex-col justify-center items-start">
                  <span className="text-[8px] font-bold text-dark-500 uppercase tracking-wider">Access TTL</span>
                  <span className="text-sm font-bold text-brand-400 font-mono mt-0.5">3600s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Divider Bar */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-dark-800 to-transparent relative my-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-dark-950 border border-dark-800 rounded-full flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-ping"></div>
        </div>
      </div>

      {/* Feature Section */}
      <section id="features" className="py-24 px-6 md:px-12 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-in-up">
          <h2 className="text-3xl font-extrabold text-dark-50 font-sans tracking-tight">Enterprise DRM Protection Shield</h2>
          <p className="text-dark-400 mt-3 text-sm md:text-base font-medium">
            Everything you need to transcode, encrypt, lease, and stream video content under a multi-tenant subscription.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Card 1: Dynamic Encryption */}
          <div className="glass-card p-8 rounded-xl border border-dark-850 hover:border-brand-500/40 hover:-translate-y-2 hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 group flex flex-col justify-between cursor-default">
            <div>
              <div className="p-3 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-lg w-fit group-hover:text-brand-350 group-hover:scale-110 transition-all">
                <Lock size={22} />
              </div>
              <h3 className="text-lg font-bold text-dark-100 mt-5 transition-colors group-hover:text-brand-400">Dynamic Encryption</h3>
              <p className="text-xs text-dark-400 mt-2 leading-relaxed">
                Encrypt files using advanced AES-256 GCM master keys. Zero static key storage ensures maximum containment.
              </p>
            </div>
            {/* Embedded Micro UI */}
            <div className="mt-6 p-3 rounded-lg bg-dark-950/60 border border-dark-850 flex items-center justify-between text-[10px] font-mono">
              <span className="text-dark-400">AES KEY STATE:</span>
              <span className="text-brand-400 font-bold animate-pulse-subtle">[ ENCRYPTED ]</span>
            </div>
          </div>

          {/* Card 2: Cloudinary Transcoding */}
          <div className="glass-card p-8 rounded-xl border border-dark-850 hover:border-brand-500/40 hover:-translate-y-2 hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 group flex flex-col justify-between cursor-default">
            <div>
              <div className="p-3 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-lg w-fit group-hover:text-brand-350 group-hover:scale-110 transition-all">
                <Zap size={22} />
              </div>
              <h3 className="text-lg font-bold text-dark-100 mt-5 transition-colors group-hover:text-brand-400">Cloudinary Transcoding</h3>
              <p className="text-xs text-dark-400 mt-2 leading-relaxed">
                Accelerate workflow using eager transformations to generate secure, HLS Adaptive Bitrate streaming playlists automatically.
              </p>
            </div>
            {/* Embedded Micro UI */}
            <div className="mt-6 flex space-x-1.5">
              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 font-mono">1080p ABR</span>
              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-teal-500/10 text-teal-450 border border-teal-500/20 font-mono">HLS MANIFEST</span>
            </div>
          </div>

          {/* Card 3: License Leases */}
          <div className="glass-card p-8 rounded-xl border border-dark-850 hover:border-brand-500/40 hover:-translate-y-2 hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 group flex flex-col justify-between cursor-default">
            <div>
              <div className="p-3 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-lg w-fit group-hover:text-brand-350 group-hover:scale-110 transition-all">
                <Key size={22} />
              </div>
              <h3 className="text-lg font-bold text-dark-100 mt-5 transition-colors group-hover:text-brand-400">License Leases</h3>
              <p className="text-xs text-dark-400 mt-2 leading-relaxed">
                Configure strict licensing criteria: geographic location, playback window duration, and device concurrency limits.
              </p>
            </div>
            {/* Embedded Micro UI */}
            <div className="mt-6 flex items-center justify-between text-[9px] text-dark-400 font-semibold">
              <span>Concurrent Limit: <b>1 Device</b></span>
              <span className="text-rose-400">GEO-BLOCKED</span>
            </div>
          </div>

          {/* Card 4: Telemetry & Analytics */}
          <div className="glass-card p-8 rounded-xl border border-dark-850 hover:border-brand-500/40 hover:-translate-y-2 hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 group flex flex-col justify-between cursor-default">
            <div>
              <div className="p-3 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-lg w-fit group-hover:text-brand-350 group-hover:scale-110 transition-all">
                <BarChart3 size={22} />
              </div>
              <h3 className="text-lg font-bold text-dark-100 mt-5 transition-colors group-hover:text-brand-400">Telemetry & Analytics</h3>
              <p className="text-xs text-dark-400 mt-2 leading-relaxed">
                Track stream starts, usage charts, and licensing metrics inside interactive dashboards with full Excel/CSV export capabilities.
              </p>
            </div>
            {/* Embedded Micro UI */}
            <div className="mt-6 p-2 rounded bg-dark-950/40 border border-dark-850 flex items-center justify-between">
              <span className="text-[9px] text-dark-400">MRR Revenue Curve</span>
              <span className="text-emerald-400 text-[9px] font-bold">+15.2%</span>
            </div>
          </div>

          {/* Card 5: Secure Audit Trail */}
          <div className="glass-card p-8 rounded-xl border border-dark-850 hover:border-brand-500/40 hover:-translate-y-2 hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 group flex flex-col justify-between cursor-default">
            <div>
              <div className="p-3 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-lg w-fit group-hover:text-brand-350 group-hover:scale-110 transition-all">
                <Database size={22} />
              </div>
              <h3 className="text-lg font-bold text-dark-100 mt-5 transition-colors group-hover:text-brand-400">Secure Audit Trail</h3>
              <p className="text-xs text-dark-400 mt-2 leading-relaxed">
                Automatically capture detailed operational events like license generation, key revocation, and admin logons.
              </p>
            </div>
            {/* Embedded Micro UI */}
            <div className="mt-6 font-mono text-[9px] text-dark-500 leading-tight space-y-1">
              <p><span className="text-brand-550">03:30</span> LICENSE_ISSUED [SUCCESS]</p>
              <p><span className="text-rose-500">03:35</span> KEY_REVOKED [SUCCESS]</p>
            </div>
          </div>

          {/* Card 6: Multi-Tenant Subscriptions */}
          <div className="glass-card p-8 rounded-xl border border-dark-850 hover:border-brand-500/40 hover:-translate-y-2 hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 group flex flex-col justify-between cursor-default">
            <div>
              <div className="p-3 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-lg w-fit group-hover:text-brand-350 group-hover:scale-110 transition-all">
                <Server size={22} />
              </div>
              <h3 className="text-lg font-bold text-dark-100 mt-5 transition-colors group-hover:text-brand-400">Multi-Tenant Subscriptions</h3>
              <p className="text-xs text-dark-400 mt-2 leading-relaxed">
                Isolate content, tenants, organization rules, and active licenses for different corporate entities seamlessly.
              </p>
            </div>
            {/* Embedded Micro UI */}
            <div className="mt-6 flex justify-between items-center text-[9px] text-dark-450 font-bold">
              <span>Isolate Sandboxes:</span>
              <span className="text-teal-400">Enterprise Tenant</span>
            </div>
          </div>

        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-24 border-t border-dark-900 px-6 md:px-12 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-dark-50 font-sans tracking-tight">Custom Tailored Industry Solutions</h2>
          <p className="text-dark-400 mt-3 text-sm md:text-base font-medium">
            No matter your business model, protect your valuable IP against piracy and leaks.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Card 1: OTT */}
          <div className="p-6 rounded-2xl bg-dark-900/30 border border-dark-800/80 hover:border-brand-500/30 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <Globe className="text-brand-400 mb-4 group-hover:scale-110 transition-transform" size={24} />
              <h3 className="text-lg font-bold text-dark-100 mb-2 transition-colors group-hover:text-brand-450">OTT & Media Broadcasters</h3>
              <p className="text-xs text-dark-400 leading-relaxed mb-5">
                Stream premium movies, series, or live events globally. Block unauthorized geographic regions and limit playbacks to paying account nodes.
              </p>
              
              {/* Visual Player Mockup */}
              <div className="w-full aspect-video rounded-xl bg-dark-950/80 border border-dark-800 flex items-center justify-center relative overflow-hidden group-hover:border-brand-500/20 transition-colors">
                <PlayCircle className="text-brand-400 group-hover:scale-125 transition-transform" size={32} />
                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[8px] bg-dark-950 border border-dark-850 font-mono text-dark-400">1:42:09</span>
                {/* Glowing Watermark overlay */}
                <span className="absolute top-2 left-2 text-[8px] font-bold text-dark-600 tracking-widest uppercase opacity-40 select-none">nexusdrm_secured_stream</span>
              </div>
            </div>
            <Link to="/login" className="mt-6 flex items-center space-x-1 text-xs font-bold text-brand-400 hover:text-brand-350">
              <span>Deploy Media Solution</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {/* Card 2: Academy */}
          <div className="p-6 rounded-2xl bg-dark-900/30 border border-dark-800/80 hover:border-brand-500/30 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <Eye className="text-teal-400 mb-4 group-hover:scale-110 transition-transform" size={24} />
              <h3 className="text-lg font-bold text-dark-100 mb-2 transition-colors group-hover:text-teal-450">E-Learning & Training Academy</h3>
              <p className="text-xs text-dark-400 leading-relaxed mb-5">
                Shield online courses, cohort recordings, and masterclasses from illegal downloads, copy-paste attempts, and account sharing sharing leaks.
              </p>

              {/* Visual Switches Mockup */}
              <div className="p-3.5 rounded-xl bg-dark-950/80 border border-dark-800 space-y-2 text-[10px] font-semibold text-dark-300">
                <div className="flex justify-between items-center">
                  <span>Download Blocker</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">PROTECTED</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Print & Copy Block</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">PROTECTED</span>
                </div>
              </div>
            </div>
            <Link to="/login" className="mt-6 flex items-center space-x-1 text-xs font-bold text-brand-400 hover:text-brand-350">
              <span>Deploy Academy Solution</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {/* Card 3: Enterprise */}
          <div className="p-6 rounded-2xl bg-dark-900/30 border border-dark-800/80 hover:border-brand-500/30 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <Compass className="text-sky-400 mb-4 group-hover:scale-110 transition-transform" size={24} />
              <h3 className="text-lg font-bold text-dark-100 mb-2 transition-colors group-hover:text-sky-455">Enterprise Strategy Vault</h3>
              <p className="text-xs text-dark-400 leading-relaxed mb-5">
                Keep company meetings, investor roadshows, product launches, and legal briefings strictly confidential. Enable dynamic overlay watermarks.
              </p>

              {/* Visual Logs Mockup */}
              <div className="p-3 rounded-xl bg-dark-950/80 border border-dark-800 space-y-1.5 font-mono text-[9px] text-left">
                <div className="flex justify-between text-dark-500">
                  <span>Admin Logon</span>
                  <span className="text-emerald-450">SUCCESS</span>
                </div>
                <div className="flex justify-between text-dark-500">
                  <span>Revoke Key</span>
                  <span className="text-emerald-450">SUCCESS</span>
                </div>
              </div>
            </div>
            <Link to="/login" className="mt-6 flex items-center space-x-1 text-xs font-bold text-brand-400 hover:text-brand-350">
              <span>Deploy Enterprise Solution</span>
              <ChevronRight size={14} />
            </Link>
          </div>

        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="py-24 bg-dark-900/10 border-t border-dark-900 px-6 md:px-12 max-w-6xl mx-auto w-full relative">
        
        {/* Glow backdrop inside */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-3xl font-extrabold text-dark-50 font-sans tracking-tight">How NexusDRM Secure Streaming Works</h2>
          <p className="text-dark-400 mt-3 text-sm md:text-base font-medium">
            Ingest assets smoothly and secure them automatically in a multi-tenant pipeline.
          </p>
        </div>

        {/* Dynamic Connected Node Flowchart */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 relative items-start">
          
          {/* Step 1 */}
          <div className="p-6 glass-card rounded-2xl border border-dark-800 hover:border-brand-500/35 transition-all duration-300 relative z-10 flex flex-col items-center text-center group">
            <div className="w-12 h-12 rounded-full bg-brand-500/10 border border-brand-500/35 flex items-center justify-center text-brand-400 font-bold mb-4 group-hover:bg-brand-500 group-hover:text-dark-950 transition-colors shadow-lg">
              <Code size={18} />
            </div>
            <h4 className="text-sm font-bold text-dark-100 mb-1 group-hover:text-brand-400 transition-colors">1. Ingest Raw Asset</h4>
            <p className="text-[11px] text-dark-450 leading-relaxed">Upload video files securely directly into your storage sandbox.</p>
          </div>

          {/* Dotted path 1 to 2 */}
          <div className="hidden md:block absolute top-12 left-[20%] w-[15%] h-[2px] z-0">
            <svg className="w-full overflow-visible" fill="none">
              <path d="M0 0 h120" stroke="rgba(34, 197, 94, 0.4)" strokeWidth="2" className="animate-dash" />
            </svg>
          </div>

          {/* Step 2 */}
          <div className="p-6 glass-card rounded-2xl border border-dark-800 hover:border-brand-500/35 transition-all duration-300 relative z-10 flex flex-col items-center text-center group">
            <div className="w-12 h-12 rounded-full bg-brand-500/10 border border-brand-500/35 flex items-center justify-center text-brand-400 font-bold mb-4 group-hover:bg-brand-500 group-hover:text-dark-950 transition-colors shadow-lg">
              <Cpu size={18} />
            </div>
            <h4 className="text-sm font-bold text-dark-100 mb-1 group-hover:text-brand-400 transition-colors">2. Eager Transcode</h4>
            <p className="text-[11px] text-dark-450 leading-relaxed">Cloudinary transcoders automatically generate ABR HLS streaming files.</p>
          </div>

          {/* Dotted path 2 to 3 */}
          <div className="hidden md:block absolute top-12 left-[46%] w-[15%] h-[2px] z-0">
            <svg className="w-full overflow-visible" fill="none">
              <path d="M0 0 h120" stroke="rgba(34, 197, 94, 0.4)" strokeWidth="2" className="animate-dash" />
            </svg>
          </div>

          {/* Step 3 */}
          <div className="p-6 glass-card rounded-2xl border border-dark-800 hover:border-brand-500/35 transition-all duration-300 relative z-10 flex flex-col items-center text-center group">
            <div className="w-12 h-12 rounded-full bg-brand-500/10 border border-brand-500/35 flex items-center justify-center text-brand-400 font-bold mb-4 group-hover:bg-brand-500 group-hover:text-dark-950 transition-colors shadow-lg">
              <Key size={18} />
            </div>
            <h4 className="text-sm font-bold text-dark-100 mb-1 group-hover:text-brand-400 transition-colors">3. Dynamic Keying</h4>
            <p className="text-[11px] text-dark-450 leading-relaxed">Generate dynamic AES-256 keys on demand when playback starts.</p>
          </div>

          {/* Dotted path 3 to 4 */}
          <div className="hidden md:block absolute top-12 left-[71%] w-[15%] h-[2px] z-0">
            <svg className="w-full overflow-visible" fill="none">
              <path d="M0 0 h120" stroke="rgba(34, 197, 94, 0.4)" strokeWidth="2" className="animate-dash" />
            </svg>
          </div>

          {/* Step 4 */}
          <div className="p-6 glass-card rounded-2xl border border-dark-800 hover:border-brand-500/35 transition-all duration-300 relative z-10 flex flex-col items-center text-center group">
            <div className="w-12 h-12 rounded-full bg-brand-500/10 border border-brand-500/35 flex items-center justify-center text-brand-400 font-bold mb-4 group-hover:bg-brand-500 group-hover:text-dark-950 transition-colors shadow-lg">
              <UserCheck size={18} />
            </div>
            <h4 className="text-sm font-bold text-dark-100 mb-1 group-hover:text-brand-400 transition-colors">4. Secured Delivery</h4>
            <p className="text-[11px] text-dark-450 leading-relaxed">Temporary TTL URLs stream chunks to validated reader endpoints.</p>
          </div>

        </div>
      </section>

      {/* Highly Creative Dashboard Glassmorphism Footer */}
      <footer className="border-t border-dark-900 bg-dark-950 py-16 px-6 md:px-12 mt-auto relative overflow-hidden">
        {/* Dynamic ambient bottom glows */}
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="absolute top-0 left-10 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Animated Cyber Grid backdrop overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#05966903_1px,transparent_1px),linear-gradient(to_bottom,#05966903_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-60"></div>
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-500/35 to-transparent"></div>

        <div className="max-w-6xl mx-auto space-y-12 relative z-10">
          
          {/* Creative Footer Top SaaS Call-To-Action Banner */}
          <div className="relative glass-card p-8 md:p-10 rounded-3xl border border-brand-500/20 bg-dark-900/40 backdrop-blur-xl overflow-hidden group shadow-2xl shadow-brand-500/5">
            {/* Dynamic light rays */}
            <div className="absolute top-0 right-1/4 w-80 h-80 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-brand-500/15 transition-all duration-700"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-left space-y-3">
                <div className="inline-flex items-center space-x-2 bg-brand-500/10 border border-brand-400/25 px-3 py-1 rounded-full text-[10px] font-bold text-brand-400 uppercase tracking-widest">
                  <Sparkles size={10} className="animate-pulse" />
                  <span>Instant Cloud Protection</span>
                </div>
                <h3 className="text-2xl font-extrabold text-dark-50 tracking-tight leading-tight md:max-w-xl">
                  Ready to Protect Your High-Value Streaming Media?
                </h3>
                <p className="text-xs text-dark-400 max-w-xl leading-relaxed">
                  Connect your Cloudinary account and start generating signed DRM manifest segments in minutes. Dynamic licensing envelopes and adaptive transcoders at your command.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto shrink-0">
                <form onSubmit={handleSubscribe} className="relative flex items-center bg-dark-950/80 border border-dark-800 rounded-xl p-1 focus-within:border-brand-500/50 transition-all duration-300 w-full sm:w-80">
                  <input
                    type="email"
                    required
                    placeholder="Subscribe to secure updates..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent border-0 ring-0 outline-none focus:ring-0 focus:outline-none text-xs text-dark-100 placeholder:text-dark-600 px-3 w-full font-medium"
                  />
                  <button
                    type="submit"
                    disabled={subscribed}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-brand-500 hover:bg-brand-400 text-dark-950 transition-all cursor-pointer flex items-center justify-center space-x-1 shrink-0"
                  >
                    {subscribed ? (
                      <>
                        <CheckCircle2 size={12} className="text-dark-950" />
                        <span>Saved!</span>
                      </>
                    ) : (
                      <>
                        <span>Subscribe</span>
                        <Send size={10} />
                      </>
                    )}
                  </button>
                </form>

                <Link
                  to="/login"
                  className="px-6 py-3 rounded-xl text-xs font-extrabold bg-gradient-to-r from-brand-500 to-emerald-500 text-dark-950 hover:brightness-110 hover:shadow-lg hover:shadow-brand-500/25 transition-all text-center border border-brand-400/30 flex items-center justify-center space-x-1 active:scale-95 shrink-0"
                >
                  <span>Launch Free Console</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            
            {/* Col 1 Brand & Live Node Handshake Terminal */}
            <div className="md:col-span-2 space-y-4 text-left">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                  <Shield size={16} className="text-dark-950 font-bold" />
                </div>
                <span className="text-lg font-bold font-sans tracking-wide text-dark-50">
                  Nexus<span className="text-brand-400">DRM</span>
                </span>
              </div>
              <p className="text-xs text-dark-400 leading-relaxed max-w-sm font-medium">
                Securing high-value streaming assets and corporate media workflows through next-generation dynamic licensing envelopes and adaptive transcoders.
              </p>
              
              {/* Dynamic Live Logs Terminal */}
              <div className="p-3 bg-dark-950/80 border border-brand-500/15 rounded-xl font-mono text-[9px] text-brand-400/90 shadow-inner max-w-sm">
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-dark-900/60">
                  <span className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-ping"></span>
                    <span className="text-[8px] uppercase tracking-wider text-dark-400 font-bold">Node Live Stream</span>
                  </span>
                  <span className="text-[7px] text-dark-500 font-semibold">SYNC_ACTIVE</span>
                </div>
                <div className="space-y-1 h-[75px] overflow-hidden leading-relaxed select-none">
                  {logs.map((log, i) => (
                    <div key={i} className="truncate select-none text-[8px] tracking-wide text-brand-400 opacity-90">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Col 2 Product */}
            <div className="text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-dark-300 mb-4">DRM Platform</h4>
              <ul className="space-y-2.5 text-xs text-dark-450 font-semibold">
                <li><Link to="/login" className="hover:text-brand-400 transition-colors">Media Catalog</Link></li>
                <li><Link to="/login" className="hover:text-brand-400 transition-colors">Key Management</Link></li>
                <li><Link to="/login" className="hover:text-brand-400 transition-colors">Security Audit</Link></li>
                <li><Link to="/login" className="hover:text-brand-400 transition-colors">Live Telemetry</Link></li>
              </ul>
            </div>

            {/* Col 3 Resources */}
            <div className="text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-dark-300 mb-4">Resources</h4>
              <ul className="space-y-2.5 text-xs text-dark-450 font-semibold">
                <li><a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:text-brand-400 transition-colors">Product Features</a></li>
                <li><a href="#solutions" onClick={(e) => scrollToSection(e, 'solutions')} className="hover:text-brand-400 transition-colors">SaaS Solutions</a></li>
                <li><a href="#architecture" onClick={(e) => scrollToSection(e, 'architecture')} className="hover:text-brand-400 transition-colors">Security Design</a></li>
                <li><Link to="/login" className="hover:text-brand-400 transition-colors">Developer Portal</Link></li>
              </ul>
            </div>

            {/* Col 4 Enterprise */}
            <div className="text-left">
              <h4 className="text-xs font-bold uppercase tracking-wider text-dark-300 mb-4">Corporate</h4>
              <ul className="space-y-2.5 text-xs text-dark-450 font-semibold">
                <li><span className="text-dark-550 font-normal">Enterprise SLA</span></li>
                <li><span className="text-dark-550 font-normal">SaaS Agreements</span></li>
                <li><span className="text-dark-550 font-normal">GDPR Compliance</span></li>
                <li><span className="text-dark-550 font-normal">Terms & Privacy</span></li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom Telemetry Row */}
          <div className="border-t border-dark-900/60 pt-8 flex flex-col md:flex-row items-center justify-between text-[10px] text-dark-500 font-semibold space-y-4 md:space-y-0">
            <p>© {new Date().getFullYear()} NexusDRM Inc. All rights reserved.</p>
            
            {/* Live Ticker Telemetry Widget */}
            <div className="flex flex-wrap items-center justify-center gap-4 bg-dark-900/30 backdrop-blur-sm px-5 py-2.5 rounded-xl border border-brand-500/10 font-mono text-[9px] shadow-inner">
              <span className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-ping"></span>
                <span>STATUS: <b className="text-brand-400">ACTIVE</b></span>
              </span>
              <span className="text-dark-800">|</span>
              <span className="flex items-center space-x-1">
                <Activity size={10} className="text-brand-400 animate-pulse" />
                <span>PING: <b className="text-dark-200">{pingTime}ms</b></span>
              </span>
              <span className="text-dark-800">|</span>
              <span className="flex items-center space-x-1">
                <Cpu size={10} className="text-emerald-400" />
                <span>CPU: <b className="text-dark-200">{cpuUsage}%</b></span>
              </span>
              <span className="text-dark-800">|</span>
              <span className="flex items-center space-x-1">
                <Terminal size={10} className="text-sky-400" />
                <span>KEYS SEALED: <b className="text-brand-400">{keysGenerated.toLocaleString()}</b></span>
              </span>
            </div>
            
            <div className="flex space-x-6">
              <span className="hover:text-dark-350 cursor-pointer">Status: Operational</span>
              <span className="hover:text-dark-350 cursor-pointer">System Node v1.0.0</span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
};

// Internal Sparkles Helper icon
const Sparkles = ({ className, style, size }: { className?: string; style?: React.CSSProperties; size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5z" />
    <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" />
  </svg>
);
