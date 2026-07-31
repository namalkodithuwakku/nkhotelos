"use client";

import {
  ArrowRight,
  BedDouble,
  Bell,
  Building2,
  CalendarCheck2,
  CalendarDays,
  ChartNoAxesCombined,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
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
  TrendingUp,
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

type Booking = {
  id: string;
  check_in: string;
  check_out: string;
  booking_status: string;
};

type ActionRow = {
  id: string;
  title: string;
  module: string;
  priority: string;
  status: string;
  due_date: string | null;
};

const navigation = [
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

const moreNavigation = [
  ["Reports", "/reports", TrendingUp],
  ["Property", "/property", Building2],
  ["Rooms", "/rooms", BedDouble],
  ["Staff", "/staff", Users],
  ["Notifications", "/notifications", Bell],
  ["Settings", "/settings", Settings],
] as const;

const modules = [
  {
    title: "Booking Calendar",
    description: "Bookings, room blocks and availability in one clear view.",
    href: "/calendar",
    icon: CalendarDays,
    tone: "cyan",
    label: "OPERATIONS",
  },
  {
    title: "Occupancy",
    description: "Understand demand, availability and pickup instantly.",
    href: "/occupancy",
    icon: ChartNoAxesCombined,
    tone: "sage",
    label: "INSIGHT",
  },
  {
    title: "Revenue Manager",
    description: "See rate opportunities, peak days and revenue actions.",
    href: "/revenue-manager",
    icon: Sparkles,
    tone: "gold",
    label: "SMART MANAGER",
  },
  {
    title: "Marketing Manager",
    description: "Get practical marketing activities for weak periods.",
    href: "/marketing-manager",
    icon: Megaphone,
    tone: "lavender",
    label: "SMART MANAGER",
  },
  {
    title: "Reputation Manager",
    description: "Turn guest feedback into improvements and better responses.",
    href: "/reputation-manager",
    icon: Star,
    tone: "rose",
    label: "SMART MANAGER",
  },
  {
    title: "Property & Rooms",
    description: "Keep room types, rates, rooms and hotel details accurate.",
    href: "/rooms",
    icon: Building2,
    tone: "orange",
    label: "SETUP",
  },
] as const;

function localDateKey(date = new Date()) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

export default function Home() {
  const supabase = useMemo(() => createClient(), []);

  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);
  const [actions, setActions] = useState<ActionRow[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const [email, setEmail] = useState("nkhotelsup@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadWorkspace = useCallback(async () => {
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
      setError("This N K Hotel OS account is not active.");
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

    if (!propertyData) {
      setError("No assigned property was found.");
      return;
    }

    const today = localDateKey();

    const [bookingResult, actionResult, notificationResult] = await Promise.all([
      supabase
        .from("os_bookings")
        .select("id,check_in,check_out,booking_status")
        .eq("property_id", propertyData.id)
        .lte("check_in", today)
        .gte("check_out", today)
        .not("booking_status", "in", '("cancelled","no_show")'),
      supabase
        .from("os_actions")
        .select("id,title,module,priority,status,due_date")
        .eq("property_id", propertyData.id)
        .not("status", "in", '("completed","ignored","cancelled")')
        .order("due_date", { ascending: true, nullsFirst: false })
        .limit(8),
      supabase
        .from("os_notifications")
        .select("id", { count: "exact", head: true })
        .eq("property_id", propertyData.id)
        .eq("status", "unread"),
    ]);

    setProfile(profileData);
    setProperty(propertyData);
    setTodayBookings((bookingResult.data ?? []) as Booking[]);
    setActions((actionResult.data ?? []) as ActionRow[]);
    setUnreadNotifications(notificationResult.count ?? 0);
    setSignedIn(true);
  }, [supabase]);

  useEffect(() => {
    let active = true;

    async function start() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) await loadWorkspace();
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
  }, [loadWorkspace, supabase]);

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
    await loadWorkspace();
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
          <div className={styles.loginBrand}>
            <span>
              <Hotel size={25} />
            </span>
            <div>
              <strong>
                N K Hotel <b>OS</b>
              </strong>
              <small>Simplifying Hotel Management</small>
            </div>
          </div>

          <div className={styles.loginTitle}>
            <span>SMART HOTEL MANAGEMENT</span>
            <h1>Welcome back</h1>
            <p>Sign in to manage, understand and grow your hotel.</p>
          </div>

          <form onSubmit={signIn} className={styles.form}>
            <label>
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </label>

            <label>
              <span>Password</span>
              <div className={styles.passwordField}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {error ? <div className={styles.error}>{error}</div> : null}
            {notice ? <div className={styles.notice}>{notice}</div> : null}

            <button type="submit" className={styles.signInButton} disabled={busy}>
              {busy ? (
                <Loader2 size={18} className={styles.spin} />
              ) : (
                <ShieldCheck size={18} />
              )}
              Sign in
            </button>

            <button
              type="button"
              className={styles.forgotButton}
              onClick={resetPassword}
              disabled={busy}
            >
              Forgot password?
            </button>
          </form>
        </section>
      </main>
    );
  }

  const displayName = profile?.display_name || profile?.full_name || "Hotelier";
  const today = localDateKey();
  const arrivals = todayBookings.filter((booking) => booking.check_in === today).length;
  const departures = todayBookings.filter((booking) => booking.check_out === today).length;
  const occupied = todayBookings.filter(
    (booking) => booking.check_in <= today && booking.check_out > today,
  ).length;
  const occupancy = property?.number_of_rooms
    ? Math.min(100, Math.round((occupied / property.number_of_rooms) * 100))
    : 0;
  const priorityAction =
    actions.find((action) => action.priority === "urgent") ||
    actions.find((action) => action.priority === "high") ||
    actions[0];

  return (
    <main className={styles.shell}>
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarBrand}>
          <span>
            <Hotel size={22} />
          </span>
          <div>
            <strong>
              N K Hotel <b>OS</b>
            </strong>
            <small>Simplifying Life</small>
          </div>
          <button type="button" onClick={() => setMobileOpen(false)}>
            <X size={19} />
          </button>
        </div>

        <nav className={styles.nav}>
          {navigation.map(([label, href, Icon]) => (
            <Link
              key={label}
              href={href}
              className={label === "Dashboard" ? styles.activeNav : ""}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <p className={styles.moreLabel}>MANAGE</p>

        <nav className={styles.nav}>
          {moreNavigation.map(([label, href, Icon]) => (
            <Link key={label} href={href} onClick={() => setMobileOpen(false)}>
              <Icon size={18} />
              <span>{label}</span>
              {label === "Notifications" && unreadNotifications > 0 ? (
                <em>{unreadNotifications}</em>
              ) : null}
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarUser}>
          <i>{displayName.charAt(0).toUpperCase()}</i>
          <div>
            <strong>{displayName}</strong>
            <small>{profile?.platform_role || "Master"}</small>
          </div>
          <button type="button" onClick={signOut} title="Sign out">
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      {mobileOpen ? (
        <button
          className={styles.backdrop}
          type="button"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <section className={styles.main}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.menuButton}
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div className={styles.pageTitle}>
            <span>HOTEL DASHBOARD</span>
            <h1>Good day, {displayName}</h1>
          </div>

          <Link href="/property" className={styles.propertyChip}>
            <Building2 size={18} />
            <div>
              <strong>{property?.hotel_name}</strong>
              <small>
                {property?.hotel_code} • {property?.number_of_rooms} rooms
              </small>
            </div>
            <ArrowRight size={16} />
          </Link>
        </header>

        <div className={styles.content}>
          <section className={styles.hero}>
            <div className={styles.heroCopy}>
              <span>YOUR HOTEL TODAY</span>
              <h2>{property?.hotel_name}</h2>
              <p>
                Manage bookings, understand demand and take the next best action
                from one simple workspace.
              </p>
              <div className={styles.heroActions}>
                <Link href="/calendar">
                  <CalendarDays size={17} />
                  Open calendar
                </Link>
                <Link href="/actions">
                  <CheckCircle2 size={17} />
                  View actions
                </Link>
              </div>
            </div>

            <div className={styles.heroScore}>
              <small>OCCUPANCY TODAY</small>
              <strong>{occupancy}%</strong>
              <span>{occupied} of {property?.number_of_rooms} rooms occupied</span>
            </div>
          </section>

          <section className={styles.metrics}>
            <Link href="/calendar" className={styles.metricCard}>
              <span className={styles.cyanIcon}>
                <CalendarCheck2 size={21} />
              </span>
              <div>
                <small>ARRIVALS TODAY</small>
                <strong>{arrivals}</strong>
                <p>Expected check-ins</p>
              </div>
            </Link>

            <Link href="/calendar" className={styles.metricCard}>
              <span className={styles.roseIcon}>
                <Clock3 size={21} />
              </span>
              <div>
                <small>DEPARTURES TODAY</small>
                <strong>{departures}</strong>
                <p>Expected check-outs</p>
              </div>
            </Link>

            <Link href="/actions" className={styles.metricCard}>
              <span className={styles.goldIcon}>
                <Zap size={21} />
              </span>
              <div>
                <small>PENDING ACTIONS</small>
                <strong>{actions.length}</strong>
                <p>Need attention</p>
              </div>
            </Link>

            <Link href="/notifications" className={styles.metricCard}>
              <span className={styles.lavenderIcon}>
                <Bell size={21} />
              </span>
              <div>
                <small>NOTIFICATIONS</small>
                <strong>{unreadNotifications}</strong>
                <p>Unread alerts</p>
              </div>
            </Link>
          </section>

          <section className={styles.smartRow}>
            <div className={styles.smartAction}>
              <div className={styles.smartHeader}>
                <span>
                  <Sparkles size={19} />
                </span>
                <div>
                  <small>SMART PRIORITY</small>
                  <h3>Next best action</h3>
                </div>
              </div>

              {priorityAction ? (
                <div className={styles.actionBody}>
                  <div>
                    <span>{priorityAction.module}</span>
                    <h4>{priorityAction.title}</h4>
                    <p>
                      Priority: {priorityAction.priority}
                      {priorityAction.due_date
                        ? ` • Due ${priorityAction.due_date}`
                        : " • No due date"}
                    </p>
                  </div>
                  <Link href="/actions">
                    Open action <ArrowRight size={15} />
                  </Link>
                </div>
              ) : (
                <div className={styles.noAction}>
                  <CheckCircle2 size={22} />
                  <div>
                    <h4>Everything is clear</h4>
                    <p>No pending action is currently waiting.</p>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.quickPanel}>
              <div>
                <small>QUICK WORKSPACE</small>
                <h3>Do the important work faster</h3>
              </div>
              <Link href="/calendar">
                <CalendarDays size={18} />
                New booking
              </Link>
              <Link href="/rooms">
                <BedDouble size={18} />
                Room status
              </Link>
              <Link href="/revenue-manager">
                <TrendingUp size={18} />
                Rate actions
              </Link>
            </div>
          </section>

          <div className={styles.sectionHeading}>
            <div>
              <span>MAIN WORKSPACE</span>
              <h2>Everything your hotel needs</h2>
            </div>
            <p>Simple tools, clear insights and practical actions.</p>
          </div>

          <section className={styles.moduleGrid}>
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Link
                  href={module.href}
                  key={module.title}
                  className={`${styles.moduleCard} ${styles[module.tone]}`}
                >
                  <div className={styles.moduleTop}>
                    <span>
                      <Icon size={22} />
                    </span>
                    <small>{module.label}</small>
                  </div>
                  <h3>{module.title}</h3>
                  <p>{module.description}</p>
                  <div className={styles.moduleOpen}>
                    Open module <ArrowRight size={15} />
                  </div>
                </Link>
              );
            })}
          </section>
        </div>
      </section>
    </main>
  );
}
