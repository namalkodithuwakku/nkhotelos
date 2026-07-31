"use client";

import {
  Eye,
  EyeOff,
  Hotel,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";
import styles from "./login.module.css";

async function createHotelOSServerSession(accessToken: string) {
  const response = await fetch("/api/auth/os-session", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || "Unable to create Hotel OS session.");
  }
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("nkhotelsup@gmail.com");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    async function check() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) return;

      if (session?.access_token) {
        try {
          await createHotelOSServerSession(session.access_token);
          router.replace("/dashboard");
          router.refresh();
          return;
        } catch (reason) {
          console.error("Unable to restore Hotel OS server session.", reason);
        }
      }

      setReady(true);
    }

    void check();

    return () => {
      active = false;
    };
  }, [router, supabase]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");

    const { data, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (signInError || !data.session?.access_token) {
      setError(signInError?.message || "Unable to create a session.");
      setBusy(false);
      return;
    }

    try {
      await createHotelOSServerSession(data.session.access_token);
    } catch (reason) {
      await supabase.auth.signOut();
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to create Hotel OS server session.",
      );
      setBusy(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  async function resetPassword() {
    if (!email.trim()) {
      setError("Enter your email first.");
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");

    const { error: resetError } =
      await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

    if (resetError) setError(resetError.message);
    else setNotice("Password recovery email sent.");

    setBusy(false);
  }

  if (!ready) {
    return (
      <main className={styles.loading}>
        <Loader2 className={styles.spin} />
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.brand}>
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

        <div className={styles.title}>
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
              <button
                type="button"
                onClick={() => setShow((value) => !value)}
              >
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
            className={styles.forgot}
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
