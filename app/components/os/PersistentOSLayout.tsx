"use client";

import {
  BedDouble,
  Bell,
  Building2,
  CalendarDays,
  ChartNoAxesCombined,
  Hotel,
  LayoutDashboard,
  Loader2,
  LogOut,
  Megaphone,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  QrCode,
  Settings,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import styles from "./PersistentOSLayout.module.css";

const SIDEBAR_STORAGE_KEY = "nkh-os-sidebar-hidden";

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

export default function PersistentOSLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [ready, setReady] = useState(false);
  const [sidebarReady, setSidebarReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [name, setName] = useState("Hotelier");
  const [role, setRole] = useState("Master");

  useEffect(() => {
    setSidebarHidden(
      window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true",
    );
    setSidebarReady(true);
  }, []);

  useEffect(() => {
    let active = true;

    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  function hideSidebar() {
    setSidebarHidden(true);
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, "true");
  }

  function showSidebar() {
    setSidebarHidden(false);
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, "false");
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (!ready || !sidebarReady) {
    return (
      <main className={styles.loading}>
        <Loader2 className={styles.spin} />
      </main>
    );
  }

  const renderLinks = (
    items: typeof navigation | typeof moreNavigation,
  ) =>
    items.map(([label, href, Icon]) => {
      const active = pathname === href || pathname.startsWith(`${href}/`);

      return (
        <Link
          key={href}
          href={href}
          className={active ? styles.active : ""}
          onClick={() => setMobileOpen(false)}
        >
          <Icon size={18} />
          <span>{label}</span>
        </Link>
      );
    });

  return (
    <main
      className={`${styles.shell} ${
        sidebarHidden ? styles.sidebarIsHidden : ""
      }`}
    >
      <aside
        className={`${styles.sidebar} ${
          mobileOpen ? styles.mobileOpen : ""
        } ${sidebarHidden ? styles.hiddenSidebar : ""}`}
      >
        <div className={styles.brand}>
          <span>
            <Hotel size={22} />
          </span>

          <div>
            <strong>
              N K Hotel <b>OS</b>
            </strong>
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

        <button
          type="button"
          className={styles.hideMenuButton}
          onClick={hideSidebar}
        >
          <PanelLeftClose size={17} />
          <span>Hide menu</span>
        </button>

        <nav>{renderLinks(navigation)}</nav>

        <p className={styles.sectionLabel}>MANAGE</p>

        <nav>{renderLinks(moreNavigation)}</nav>

        <div className={styles.user}>
          <i>{name.charAt(0).toUpperCase()}</i>
          <div>
            <strong>{name}</strong>
            <small>{role}</small>
          </div>
          <button
            type="button"
            onClick={signOut}
            title="Sign out"
            aria-label="Sign out"
          >
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

      {sidebarHidden ? (
        <button
          type="button"
          className={styles.showMenuButton}
          onClick={showSidebar}
          title="Show menu"
          aria-label="Show menu"
        >
          <PanelLeftOpen size={19} />
          <span>Show menu</span>
        </button>
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

        <div
          className={
            pathname === "/calendar" ||
            pathname === "/occupancy" ||
            pathname === "/revenue-manager"
              ? styles.compact
              : styles.content
          }
        >
          {children}
        </div>
      </section>
    </main>
  );
}
