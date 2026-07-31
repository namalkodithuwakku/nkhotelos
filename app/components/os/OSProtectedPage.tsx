"use client";

import { ArrowLeft, Hotel, Loader2, LogOut } from "lucide-react";
import Link from "next/link";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import styles from "./OSProtectedPage.module.css";

export default function OSProtectedPage({
  title,
  eyebrow,
  children,
  fullWidth = false,
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
  fullWidth?: boolean;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function check() {
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

    void check();

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

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          <ArrowLeft size={18} />
          Dashboard
        </Link>

        <div className={styles.title}>
          <span className={styles.logo}>
            <Hotel size={19} />
          </span>
          <div>
            <small>{eyebrow}</small>
            <h1>{title}</h1>
          </div>
        </div>

        <button type="button" onClick={signOut} className={styles.signOut}>
          <LogOut size={17} />
          <span>Sign out</span>
        </button>
      </header>

      <section className={fullWidth ? styles.fullContent : styles.content}>
        {children}
      </section>
    </main>
  );
}
