"use client";

import { ArrowRight, Building2, CalendarDays, ChartNoAxesCombined, CheckCircle2, Eye, EyeOff, Hotel, Loader2, LogOut, Megaphone, ShieldCheck, Sparkles, Star, Wrench } from "lucide-react";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "./lib/supabase/client";

type Profile = { full_name: string; display_name: string | null; platform_role: string; is_active: boolean; };
type Property = { id: string; hotel_code: string; hotel_name: string; number_of_rooms: number; currency: string; timezone: string; status: string; };

const modules = [
  { title: "Property", description: "Hotel profile, contacts and operating settings.", href: "/property", icon: Building2, ready: true },
  { title: "Booking Calendar", description: "Existing room-by-room booking workspace.", href: "/legacy-dashboard", icon: CalendarDays, ready: true },
  { title: "Occupancy", description: "Existing occupancy and availability workspace.", href: "/legacy-dashboard", icon: ChartNoAxesCombined, ready: true },
  { title: "Revenue Manager", description: "Existing live revenue recommendation workspace.", href: "/legacy-dashboard", icon: Sparkles, ready: true },
  { title: "Marketing Manager", description: "Marketing recommendations and campaigns.", href: "/marketing", icon: Megaphone, ready: false },
  { title: "Reputation Manager", description: "Review intelligence and improvement actions.", href: "/reputation", icon: Star, ready: false },
  { title: "Hotel Tools", description: "Revenue, marketing and operations tools.", href: "/tools", icon: Wrench, ready: true },
];

export default function Home() {
  const supabase = useMemo(() => createClient(), []);
  const [ready,setReady]=useState(false), [signedIn,setSignedIn]=useState(false), [busy,setBusy]=useState(false);
  const [profile,setProfile]=useState<Profile|null>(null), [property,setProperty]=useState<Property|null>(null);
  const [email,setEmail]=useState("nkhotelsup@gmail.com"), [password,setPassword]=useState(""), [showPassword,setShowPassword]=useState(false);
  const [error,setError]=useState(""), [notice,setNotice]=useState("");

  const loadAccount = useCallback(async () => {
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSignedIn(false); setProfile(null); setProperty(null); return; }
    const { data: profileData, error: profileError } = await supabase.from("os_profiles").select("full_name, display_name, platform_role, is_active").eq("id", user.id).maybeSingle<Profile>();
    if (profileError) { setError(profileError.message); return; }
    if (!profileData || !profileData.is_active) { await supabase.auth.signOut(); setError("This OS account is not active or has no profile."); return; }
    const { data: propertyData, error: propertyError } = await supabase.from("os_properties").select("id, hotel_code, hotel_name, number_of_rooms, currency, timezone, status").eq("hotel_code", "NKH001").is("deleted_at", null).maybeSingle<Property>();
    if (propertyError) { setError(propertyError.message); return; }
    setProfile(profileData); setProperty(propertyData ?? null); setSignedIn(true);
  }, [supabase]);

  useEffect(() => { let active=true; (async()=>{ const {data:{session}}=await supabase.auth.getSession(); if(session) await loadAccount(); if(active) setReady(true); })(); const {data:{subscription}}=supabase.auth.onAuthStateChange((event)=>{ if(event==="SIGNED_OUT"){setSignedIn(false);setProfile(null);setProperty(null);} }); return()=>{active=false;subscription.unsubscribe();}; },[loadAccount,supabase]);

  async function signIn(event:FormEvent<HTMLFormElement>){ event.preventDefault(); setBusy(true); setError(""); setNotice(""); const {error:e}=await supabase.auth.signInWithPassword({email:email.trim(),password}); if(e){setError(e.message);setBusy(false);return;} setPassword(""); await loadAccount(); setBusy(false); }
  async function resetPassword(){ if(!email.trim()){setError("Enter your email address first.");return;} setBusy(true); setError(""); setNotice(""); const {error:e}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:`${window.location.origin}/auth/update-password`}); if(e)setError(e.message); else setNotice("Password recovery email sent."); setBusy(false); }
  async function signOut(){ await supabase.auth.signOut(); }

  if(!ready) return <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5]"><Loader2 className="h-8 w-8 animate-spin text-[#ef7d00]"/></main>;

  if(!signedIn) return <main className="min-h-screen bg-[#f7f7f5] px-4 py-8 sm:py-12"><div className="mx-auto grid max-w-6xl overflow-hidden rounded-[32px] border border-black/10 bg-white shadow-xl shadow-black/5 lg:grid-cols-[1.05fr_.95fr]">
    <section className="relative hidden min-h-[650px] overflow-hidden bg-[#20252b] p-10 text-white lg:block"><div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#ef7d00]/25 blur-3xl"/><div className="relative flex h-full flex-col"><div><p className="text-sm font-bold uppercase tracking-[0.22em] text-[#ff9c34]">N K Hotel OS</p><h1 className="mt-5 max-w-lg text-5xl font-extrabold leading-[1.08]">Manage your bookings. Understand your business. Grow your hotel.</h1><p className="mt-6 max-w-lg text-base leading-7 text-white/65">A simple hotel management and business growth platform for boutique hotels, villas and small resorts.</p></div><div className="mt-auto space-y-4">{["Simple booking calendar","Occupancy intelligence","Revenue, Marketing and Reputation Managers"].map(i=><div key={i} className="flex items-center gap-3 text-sm font-semibold text-white/85"><CheckCircle2 className="h-5 w-5 text-[#ff9c34]"/>{i}</div>)}</div></div></section>
    <section className="flex min-h-[650px] items-center px-6 py-10 sm:px-12"><div className="mx-auto w-full max-w-md"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff3e5] text-[#ef7d00]"><Hotel className="h-7 w-7"/></div><p className="mt-7 text-sm font-bold uppercase tracking-[0.2em] text-[#ef7d00]">Secure access</p><h2 className="mt-2 text-3xl font-extrabold text-[#20252b]">Sign in to Hotel OS</h2><p className="mt-3 text-sm leading-6 text-[#6d757d]">Use the Supabase account assigned to your property.</p><form onSubmit={signIn} className="mt-8 space-y-5">
      <label><span className="mb-2 block text-sm font-bold text-[#3e454c]">Email</span><input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required className={inputClass}/></label>
      <label><span className="mb-2 block text-sm font-bold text-[#3e454c]">Password</span><div className="relative"><input type={showPassword?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required className={`${inputClass} pr-12`}/><button type="button" onClick={()=>setShowPassword(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#727980] hover:bg-black/5">{showPassword?<EyeOff className="h-5 w-5"/>:<Eye className="h-5 w-5"/>}</button></div></label>
      {error?<Message tone="error">{error}</Message>:null}{notice?<Message tone="success">{notice}</Message>:null}
      <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#20252b] px-5 py-3.5 font-extrabold text-white hover:bg-black disabled:opacity-60">{busy?<Loader2 className="h-5 w-5 animate-spin"/>:<ShieldCheck className="h-5 w-5"/>}Sign in</button>
      <button type="button" disabled={busy} onClick={resetPassword} className="w-full text-center text-sm font-bold text-[#ef7d00] hover:underline">Forgot password?</button>
    </form></div></section></div></main>;

  const displayName=profile?.display_name||profile?.full_name||"Hotelier";
  return <main className="min-h-screen bg-[#f7f7f5] px-4 py-6 sm:px-6"><div className="mx-auto max-w-7xl"><header className="flex flex-col gap-5 rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold uppercase tracking-[0.2em] text-[#ef7d00]">N K Hotel OS</p><h1 className="mt-2 text-3xl font-extrabold text-[#20252b]">Good day, {displayName}</h1><p className="mt-2 text-sm text-[#6c747c]">{property?`${property.hotel_name} • ${property.hotel_code} • ${property.number_of_rooms} rooms`:"No property is currently assigned."}</p></div><button onClick={signOut} className="flex items-center justify-center gap-2 rounded-xl border border-black/10 px-4 py-2.5 text-sm font-bold text-[#20252b]"><LogOut className="h-4 w-4"/>Sign out</button></header>
  <section className="mt-6 rounded-3xl bg-[#20252b] p-7 text-white"><div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#ff9c34]">Today’s workspace</p><h2 className="mt-2 text-2xl font-extrabold">One simple system to manage and grow the property</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">Supabase is now the live database. Continue configuring the property, rooms and booking workflow.</p></div><Link href="/property" className="flex items-center justify-center gap-2 rounded-xl bg-[#ef7d00] px-5 py-3 font-extrabold text-white">Open property<ArrowRight className="h-5 w-5"/></Link></div></section>
  <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{modules.map(m=>{const Icon=m.icon;return <Link key={m.title} href={m.href} className="group rounded-3xl border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#ef7d00]/40"><div className="flex items-start justify-between gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff3e5] text-[#ef7d00]"><Icon className="h-5 w-5"/></div><span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide ${m.ready?"bg-emerald-50 text-emerald-700":"bg-[#f2f2ef] text-[#777f86]"}`}>{m.ready?"Available":"Building"}</span></div><h3 className="mt-5 text-lg font-extrabold text-[#20252b]">{m.title}</h3><p className="mt-2 text-sm leading-6 text-[#707880]">{m.description}</p><div className="mt-5 flex items-center gap-2 text-sm font-extrabold text-[#ef7d00]">Open<ArrowRight className="h-4 w-4"/></div></Link>})}</section></div></main>;
}

const inputClass="w-full rounded-xl border border-black/10 bg-white px-3.5 py-3 text-sm font-medium text-[#20252b] outline-none transition focus:border-[#ef7d00] focus:ring-4 focus:ring-orange-500/10";
function Message({tone,children}:{tone:"error"|"success";children:React.ReactNode}){return <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${tone==="success"?"border-emerald-200 bg-emerald-50 text-emerald-800":"border-red-200 bg-red-50 text-red-800"}`}>{children}</div>}
