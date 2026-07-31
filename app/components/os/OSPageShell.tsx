"use client";

import {
  Bell,
  Building2,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronLeft,
  Hotel,
  LayoutDashboard,
  Loader2,
  LogOut,
  Megaphone,
  Menu,
  Settings,
  Sparkles,
  Star,
  Users,
  Wrench,
  X,
  Zap,
  QrCode,
  FileChartColumn,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import styles from "./OSPageShell.module.css";

const navigation = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Booking Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Occupancy", href: "/occupancy", icon: ChartNoAxesCombined },
  { label: "Revenue Manager", href: "/revenue-manager", icon: Sparkles },
  { label: "Marketing Manager", href: "/marketing-manager", icon: Megaphone },
  { label: "Reputation Manager", href: "/reputation-manager", icon: Star },
  { label: "Tools", href: "/tools", icon: Wrench },
  { label: "Actions", href: "/actions", icon: Zap },
  { label: "QR Menu", href: "/qr-menu", icon: QrCode },
];

const moreNavigation = [
  { label: "Reports", href: "/reports", icon: FileChartColumn },
  { label: "Property", href: "/property", icon: Building2 },
  { label: "Staff", href: "/staff", icon: Users },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function OSPageShell({
  title,
  eyebrow = "N K Hotel OS",
  children,
  compact = false,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [ready, setReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) return;

      if (!session) {
        router.replace("/");
        return;
      }

      setReady(true);
    }

    void checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/");
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  if (!ready) {
    return (
      <main className={styles.loading}>
        <Loader2 className={styles.spinner} />
      </main>
    );
  }

  const renderLink = (item: (typeof navigation)[number]) => {
    const Icon = item.icon;
    const active =
      item.href === "/"
        ? pathname === "/"
        : pathname === item.href || pathname.startsWith(`${item.href}/`);

    return (
      <Link
        key={item.href}
        href={item.href}
        className={active ? styles.active : ""}
        onClick={() => setMobileOpen(false)}
      >
        <Icon size={18} />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <main className={styles.shell}>
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.open : ""}`}>
        <div className={styles.brand}>
          <span className={styles.logo}>
            <Hotel size={21} />
          </span>
          <div>
            <strong>
              N K Hotel <b>OS</b>
            </strong>
            <small>Simplifying Life</small>
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={() => setMobileOpen(false)}
          >
            <X size={19} />
          </button>
        </div>

        <nav>{navigation.map(renderLink)}</nav>

        <p className={styles.moreLabel}>MORE</p>
        <nav>{moreNavigation.map(renderLink)}</nav>

        <div className={styles.sidebarBottom}>
          <button type="button" onClick={signOut}>
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className={styles.backdrop}
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <section className={styles.main}>
        <header className={styles.header}>
          <button
            type="button"
            className={styles.menu}
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>

          {pathname !== "/" ? (
            <Link href="/" className={styles.back}>
              <ChevronLeft size={18} />
            </Link>
          ) : null}

          <div>
            <small>{eyebrow}</small>
            <h1>{title}</h1>
          </div>
        </header>

        <div className={compact ? styles.compactContent : styles.content}>
          {children}
        </div>
      </section>
    </main>
  );
}
