"use client";

import {
  Bell,
  Building2,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import styles from "./dashboard.module.css";

type Property = {
  id: string;
  hotel_name: string;
  hotel_code: string;
  number_of_rooms: number;
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
  priority: string;
  module: string;
  due_date: string | null;
};

function getTodayKey() {
  const date = new Date();
  const offset = date.getTimezoneOffset();

  return new Date(date.getTime() - offset * 60_000)
    .toISOString()
    .slice(0, 10);
}

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(), []);

  const [property, setProperty] = useState<Property | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [actions, setActions] = useState<ActionRow[]>([]);
  const [notifications, setNotifications] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);

    const { data: propertyData } = await supabase
      .from("os_properties")
      .select("id,hotel_name,hotel_code,number_of_rooms")
      .eq("hotel_code", "NKH001")
      .is("deleted_at", null)
      .maybeSingle<Property>();

    if (!propertyData) {
      setLoading(false);
      return;
    }

    const today = getTodayKey();

    const [bookingResult, actionResult, notificationResult] =
      await Promise.all([
        supabase
          .from("os_bookings")
          .select("id,check_in,check_out,booking_status")
          .eq("property_id", propertyData.id)
          .lte("check_in", today)
          .gte("check_out", today)
          .not("booking_status", "in", '("cancelled","no_show")'),

        supabase
          .from("os_actions")
          .select("id,title,priority,module,due_date")
          .eq("property_id", propertyData.id)
          .not("status", "in", '("completed","ignored","cancelled")')
          .order("due_date", {
            ascending: true,
            nullsFirst: false,
          })
          .limit(8),

        supabase
          .from("os_notifications")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("property_id", propertyData.id)
          .eq("status", "unread"),
      ]);

    setProperty(propertyData);
    setBookings((bookingResult.data ?? []) as Booking[]);
    setActions((actionResult.data ?? []) as ActionRow[]);
    setNotifications(notificationResult.count ?? 0);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className={styles.loading}>
        Loading today&apos;s hotel workspace…
      </div>
    );
  }

  const today = getTodayKey();

  const arrivals = bookings.filter(
    (booking) => booking.check_in === today,
  ).length;

  const departures = bookings.filter(
    (booking) => booking.check_out === today,
  ).length;

  const occupied = bookings.filter(
    (booking) =>
      booking.check_in <= today &&
      booking.check_out > today,
  ).length;

  const occupancy = property?.number_of_rooms
    ? Math.round(
        (occupied / property.number_of_rooms) * 100,
      )
    : 0;

  const priorityAction =
    actions.find((action) => action.priority === "urgent") ||
    actions.find((action) => action.priority === "high") ||
    actions[0];

  const priorityDetails = priorityAction
    ? [
        priorityAction.module,
        priorityAction.priority,
        priorityAction.due_date
          ? `Due ${priorityAction.due_date}`
          : null,
      ]
        .filter(Boolean)
        .join(" • ")
    : "No pending action is currently waiting.";

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <span>YOUR HOTEL TODAY</span>
          <h2>{property?.hotel_name || "Hotel dashboard"}</h2>
          <p>
            Manage bookings, understand demand and take the
            next best action from one simple workspace.
          </p>

          <div>
            <Link href="/calendar">
              <CalendarDays size={16} />
              Open calendar
            </Link>

            <Link href="/actions">
              <CheckCircle2 size={16} />
              View actions
            </Link>
          </div>
        </div>

        <aside>
          <small>OCCUPANCY TODAY</small>
          <strong>{occupancy}%</strong>
          <span>
            {occupied} of {property?.number_of_rooms ?? 0}
            {" "}rooms occupied
          </span>
        </aside>
      </section>

      <section className={styles.metrics}>
        <Link href="/calendar">
          <i className={styles.cyan}>
            <CalendarCheck2 size={20} />
          </i>
          <div>
            <small>ARRIVALS</small>
            <strong>{arrivals}</strong>
            <p>Expected today</p>
          </div>
        </Link>

        <Link href="/calendar">
          <i className={styles.rose}>
            <Clock3 size={20} />
          </i>
          <div>
            <small>DEPARTURES</small>
            <strong>{departures}</strong>
            <p>Expected today</p>
          </div>
        </Link>

        <Link href="/actions">
          <i className={styles.gold}>
            <Zap size={20} />
          </i>
          <div>
            <small>ACTIONS</small>
            <strong>{actions.length}</strong>
            <p>Need attention</p>
          </div>
        </Link>

        <Link href="/notifications">
          <i className={styles.lavender}>
            <Bell size={20} />
          </i>
          <div>
            <small>NOTIFICATIONS</small>
            <strong>{notifications}</strong>
            <p>Unread alerts</p>
          </div>
        </Link>
      </section>

      <section className={styles.smart}>
        <span>
          <Sparkles size={19} />
        </span>

        <div>
          <small>SMART PRIORITY</small>
          <h3>
            {priorityAction?.title || "Everything is clear"}
          </h3>
          <p>{priorityDetails}</p>
        </div>

        <Link href="/actions">Open</Link>
      </section>

      <section className={styles.shortcuts}>
        <Link href="/rooms">
          <Building2 size={18} />
          <span>
            <strong>Property &amp; Rooms</strong>
            <small>Inventory and rates</small>
          </span>
        </Link>

        <Link href="/revenue-manager">
          <Sparkles size={18} />
          <span>
            <strong>Revenue Manager</strong>
            <small>Rate opportunities</small>
          </span>
        </Link>

        <Link href="/marketing-manager">
          <Zap size={18} />
          <span>
            <strong>Marketing Manager</strong>
            <small>Growth activities</small>
          </span>
        </Link>
      </section>
    </div>
  );
}
