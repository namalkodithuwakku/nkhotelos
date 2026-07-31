"use client";

import {
  Bell,
  Building2,
  CalendarDays,
  ChartNoAxesCombined,
  Eye,
  EyeOff,
  FileChartColumn,
  Hotel,
  LayoutDashboard,
  Loader2,
  LogOut,
  Megaphone,
  Menu,
  QrCode,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "./lib/supabase/client";
import styles from "./page.module.css";

type Profile = {
  full_name: string;
  display_name: string | null;
  platform_role: string;
  is_active: boolean;
};

type Property = {
  id: string;
  hotel_code: string;
  hotel_name: string;
  number_of_rooms: number;
  currency: string;
  timezone: string;
  status: string;
};

const menu = [
  ["Dashboard", "/", LayoutDashboard],
  ["Booking Calendar", "/calendar", CalendarDays],
  ["Occupancy", "/occupancy", ChartNoAxesCombined],
  ["Revenue Manager", "/revenue-manager", Sparkles],
  ["Marketing Manager", "/marketing-manager", Megaphone],
  ["Reputation Manager", "/reputation-manager", Star],
  ["Tools", "/tools", Wrench],
  ["Actions", "/actions", Zap],
  ["QR Menu", "/qr-menu", QrCode],
] as const;

const moreMenu = [
  ["Reports", "/reports", FileChartColumn],
  ["Property", "/property", Building2],
  ["Staff", "/staff", Users],
  ["Notifications", "/notifications", Bell],
  ["Settings", "/settings", Settings],
] as const;

export default function Home() {
  const supabase = useMemo(() => createClient(), []);

  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [mobile, setMobile] = useState(false);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [property, setProperty] = useState<Property | null>(null);

  const [email, setEmail] = useState("nkhotelsup@gmail.com");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadAccount = useCallback(async () => {
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSignedIn(false);
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from("os_profiles")
      .select("full_name,display_name,platform_role,is_active")
      .eq("id", user.id)
      .maybeSingle<Profile>();

    if (profileError) {
      setError(profileError.message);
      return;
    }

    if (!profileData?.is_active) {
      await supabase.auth.signOut();
      setError("This OS account is not active.");
      return;
    }

    const { data: propertyData, error: propertyError } = await supabase
      .from("os_properties")
      .select("id,hotel_code,hotel_name,number_of_rooms,currency,timezone,status")
      .eq("hotel_code", "NKH001")
      .is("deleted_at", null)
      .maybeSingle<Property>();

    if (propertyError) {
      setError(propertyError.message);
      return;
    }

    setProfile(profileData);
    setProperty(propertyData ?? null);
    setSignedIn(true);
  }, [supabase]);

  useEffect(() => {
    let active = true;

    async function start() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) await loadAccount();
      if (active) setReady(true);
    }

    void start();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setSignedIn(false);
        setProfile(null);
        setProperty(null);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadAccount, supabase]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setBusy(false);
      return;
    }

    setPassword("");
    await loadAccount();
    setBusy(false);
  }

  async function resetPassword() {
    if (!email.trim()) {
      setError("Enter your email first.");
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${window.location.origin}/auth/update-password` },
    );

    if (resetError) setError(resetError.message);
    else setNotice("Password recovery email sent.");

    setBusy(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  if (!ready) {
    return (
      <main className={styles.loading}>
        <Loader2 className={styles.spin} />
      </main>
    );
  }

  if (!signedIn) {
    return (
      <main className={styles.loginPage}>
        <section className={styles.loginCard}>
          <div className={styles.brand}>
            <span>
              <Hotel size={24} />
            </span>
            <div>
              <strong>
                N K Hotel <b>OS</b>
              </strong>
              <small>Simplifying Hotel Management</small>
            </div>
          </div>

          <div className={styles.loginTitle}>
            <h1>Welcome back</h1>
            <p>Sign in to manage your hotel.</p>
          </div>

          <form onSubmit={signIn} className={styles.form}>
            <label>
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label>
              <span>Password</span>
              <div className={styles.password}>
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button type="button" onClick={() => setShow((value) => !value)}>
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {error ? <div className={styles.error}>{error}</div> : null}
            {notice ? <div className={styles.notice}>{notice}</div> : null}

            <button className={styles.primary} disabled={busy}>
              {busy ? (
                <Loader2 size={18} className={styles.spin} />
              ) : (
                <ShieldCheck size={18} />
              )}
              Sign in
            </button>

            <button
              type="button"
              className={styles.linkButton}
              onClick={resetPassword}
            >
              Forgot password?
            </button>
          </form>
        </section>
      </main>
    );
  }

  const name = profile?.display_name || profile?.full_name || "Hotelier";

  const cards = [
    [
      "Booking Calendar",
      "Manage bookings and room availability.",
      "/calendar",
      CalendarDays,
    ],
    [
      "Occupancy",
      "View occupancy and available rooms.",
      "/occupancy",
      ChartNoAxesCombined,
    ],
    [
      "Revenue Manager",
      "Review rates and important dates.",
      "/revenue-manager",
      Sparkles,
    ],
    [
      "Marketing Manager",
      "See the best activities for the period.",
      "/marketing-manager",
      Megaphone,
    ],
    [
      "Reputation Manager",
      "Turn reviews into improvement actions.",
      "/reputation-manager",
      Star,
    ],
    [
      "Property & Rooms",
      "Manage hotel details and inventory.",
      "/property",
      Building2,
    ],
  ] as const;

  return (
    <main className={styles.shell}>
      <aside className={`${styles.sidebar} ${mobile ? styles.open : ""}`}>
        <div className={styles.brand}>
          <span>
            <Hotel size={21} />
          </span>
          <div>
            <strong>
              N K Hotel <b>OS</b>
            </strong>
            <small>Simplifying Life</small>
          </div>
          <button className={styles.close} onClick={() => setMobile(false)}>
            <X size={19} />
          </button>
        </div>

        <nav>
          {menu.map(([label, href, Icon]) => (
            <Link
              key={label}
              href={href}
              className={label === "Dashboard" ? styles.active : ""}
              onClick={() => setMobile(false)}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <p className={styles.heading} style={{ marginTop: 18 }}>
          MORE
        </p>

        <nav>
          {moreMenu.map(([label, href, Icon]) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMobile(false)}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <footer>
          <i>{name.charAt(0).toUpperCase()}</i>
          <div>
            <strong>{name}</strong>
            <small>{profile?.platform_role || "Master"}</small>
          </div>
          <button onClick={signOut}>
            <LogOut size={18} />
          </button>
        </footer>
      </aside>

      {mobile ? (
        <button className={styles.backdrop} onClick={() => setMobile(false)} />
      ) : null}

      <section className={styles.main}>
        <header>
          <button className={styles.menu} onClick={() => setMobile(true)}>
            <Menu size={20} />
          </button>

          <div>
            <small>DASHBOARD</small>
            <h1>Good day, {name}</h1>
          </div>

          <div className={styles.hotel}>
            <Building2 size={18} />
            <div>
              <strong>{property?.hotel_name || "No property"}</strong>
              <small>
                {property
                  ? `${property.hotel_code} • ${property.number_of_rooms} rooms`
                  : "Not assigned"}
              </small>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          <section className={styles.welcome}>
            <div>
              <small>YOUR HOTEL TODAY</small>
              <h2>{property?.hotel_name || "Complete property setup"}</h2>
              <p>
                Manage bookings, occupancy and growth from one simple workspace.
              </p>
            </div>
            <Link href="/property">Property settings</Link>
          </section>

          <section className={styles.metrics}>
            <div>
              <span>Rooms</span>
              <strong>{property?.number_of_rooms ?? 0}</strong>
              <small>Total inventory</small>
            </div>
            <div>
              <span>Currency</span>
              <strong>{property?.currency || "LKR"}</strong>
              <small>Property currency</small>
            </div>
            <div>
              <span>Status</span>
              <strong className={styles.green}>
                {property?.status || "Active"}
              </strong>
              <small>OS access</small>
            </div>
          </section>

          <div className={styles.heading}>
            <h2>Main workspace</h2>
            <p>Open only what you need.</p>
          </div>

          <section className={styles.grid}>
            {cards.map(([title, description, href, Icon]) => (
              <Link key={title} href={href} className={styles.card}>
                <span>
                  <Icon size={21} />
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </Link>
            ))}
          </section>
        </div>
      </section>
    </main>
  );
}
