"use client";

import {
  BedDouble, Bell, Building2, CalendarDays, ChartNoAxesCombined, Hotel,
  LayoutDashboard, Loader2, LogOut, Megaphone, Menu, QrCode, Settings,
  Sparkles, Star, TrendingUp, Users, Wrench, X, Zap, MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { OSLayoutProvider } from "./OSLayoutContext";
import styles from "./PersistentOSLayout.module.css";

const navigation = [
  ["Dashboard", "/dashboard", LayoutDashboard],
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

const mobileNavigation = [
  ["Home", "/dashboard", LayoutDashboard],
  ["Calendar", "/calendar", CalendarDays],
  ["Occupancy", "/occupancy", ChartNoAxesCombined],
  ["Revenue", "/revenue-manager", Sparkles],
] as const;

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/calendar": "Booking Calendar",
  "/occupancy": "Occupancy",
  "/revenue-manager": "Revenue Manager",
  "/marketing-manager": "Marketing Manager",
  "/reputation-manager": "Reputation Manager",
  "/tools": "Tools",
  "/actions": "Actions",
  "/qr-menu": "QR Menu",
  "/reports": "Reports",
  "/property": "Property",
  "/rooms": "Rooms & Room Types",
  "/staff": "Staff",
  "/notifications": "Notifications",
  "/settings": "Settings",
};

export default function PersistentOSLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [ready, setReady] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [name, setName] = useState("Hotelier");
  const [role, setRole] = useState("Master");
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;

      if (!session) {
        router.replace("/login");
        return;
      }

      const { data } = await supabase
        .from("os_profiles")
        .select("full_name,display_name,platform_role,is_active")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!active) return;

      if (!data?.is_active) {
        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }

      setName(data.display_name || data.full_name || "Hotelier");
      setRole(data.platform_role || "Master");
      setReady(true);
    }

    void load();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) router.replace("/login");
      },
    );

    return () => {
      active = false;
      subscription.unsubscribe();
      if (closeTimer.current !== null) {
        window.clearTimeout(closeTimer.current);
      }
    };
  }, [router, supabase]);

  function openDesktopMenu() {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setDesktopOpen(true);
  }

  function scheduleDesktopClose() {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
    }
    closeTimer.current = window.setTimeout(() => {
      setDesktopOpen(false);
      closeTimer.current = null;
    }, 180);
  }

  function closeDesktopMenu() {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setDesktopOpen(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (!ready) {
    return (
      <main className={styles.loading}>
        <Loader2 className={styles.spin} />
      </main>
    );
  }

  const renderLinks = (items: typeof navigation | typeof moreNavigation) =>
    items.map(([label, href, Icon]) => {
      const active = pathname === href || pathname.startsWith(`${href}/`);
      return (
        <Link
          key={href}
          href={href}
          className={active ? styles.active : ""}
          onClick={() => {
            setMobileOpen(false);
            closeDesktopMenu();
          }}
        >
          <Icon size={18} />
          <span>{label}</span>
        </Link>
      );
    });

  const compact =
    pathname === "/calendar" ||
    pathname === "/occupancy" ||
    pathname === "/revenue-manager";

  return (
    <OSLayoutProvider>
      <main className={styles.shell}>
        <div
          className={styles.hoverZone}
          onMouseEnter={openDesktopMenu}
          aria-hidden="true"
        />

        <button
          type="button"
          className={`${styles.menuClip} ${desktopOpen ? styles.clipHidden : ""}`}
          onMouseEnter={openDesktopMenu}
          onFocus={openDesktopMenu}
          aria-label="Open menu"
        >
          <span>MENU</span>
          <b>â€º</b>
        </button>

        <aside
          className={`${styles.sidebar} ${desktopOpen ? styles.desktopOpen : ""} ${
            mobileOpen ? styles.mobileOpen : ""
          }`}
          onMouseEnter={openDesktopMenu}
          onMouseLeave={scheduleDesktopClose}
        >
          <button
            type="button"
            className={styles.closeClip}
            onClick={closeDesktopMenu}
            onMouseEnter={openDesktopMenu}
            aria-label="Close menu"
          >
            <span>CLOSE</span>
            <b>â€¹</b>
          </button>

          <div className={styles.brand}>
            <span><img src="/icons/icon-192.png" alt="N K Hotel OS" /></span>
            <div>
              <strong>N K Hotel <b>OS</b></strong>
              <small>Simplifying Life</small>
            </div>
            <button
              type="button"
              className={styles.mobileClose}
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={19} />
            </button>
          </div>

          <nav>{renderLinks(navigation)}</nav>
          <p className={styles.sectionLabel}>MANAGE</p>
          <nav>{renderLinks(moreNavigation)}</nav>

          <div className={styles.user}>
            <i>{name.charAt(0).toUpperCase()}</i>
            <div>
              <strong>{name}</strong>
              <small>{role}</small>
            </div>
            <button type="button" onClick={signOut} title="Sign out">
              <LogOut size={17} />
            </button>
          </div>
        </aside>

        {mobileOpen ? (
          <button
            type="button"
            className={styles.backdrop}
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
        ) : null}

        <section className={styles.main}>
          <header>
            <button
              type="button"
              className={styles.mobileMenu}
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <small>N K HOTEL OS</small>
              <h1>{titles[pathname] || "Hotel OS"}</h1>
            </div>
          </header>

          <div className={compact ? styles.compact : styles.content}>
            {children}
          </div>
        </section>

        <nav className={styles.mobileBottomNav} aria-label="Mobile navigation">
          {mobileNavigation.map(([label, href, Icon]) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={active ? styles.mobileNavActive : ""}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={20} />
                <span>{label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            className={mobileOpen ? styles.mobileNavActive : ""}
            onClick={() => setMobileOpen(true)}
            aria-label="Open all features"
          >
            <MoreHorizontal size={21} />
            <span>More</span>
          </button>
        </nav>
      </main>
    </OSLayoutProvider>
  );
}

