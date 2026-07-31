import {
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  LucideIcon,
} from "lucide-react";
import Link from "next/link";
import styles from "./ModuleComingSoon.module.css";

export default function ModuleComingSoon({
  icon: Icon,
  title,
  description,
  items,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <section className={styles.wrap}>
      <div className={styles.hero}>
        <span>
          <Icon size={26} />
        </span>
        <div>
          <small>MODULE WORKSPACE</small>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      <div className={styles.status}>
        <CircleDashed size={18} />
        <div>
          <strong>Page structure is ready</strong>
          <p>Live data and actions will be connected in the next build stage.</p>
        </div>
      </div>

      <div className={styles.list}>
        {items.map((item) => (
          <div key={item}>
            <CheckCircle2 size={17} />
            <span>{item}</span>
          </div>
        ))}
      </div>

      <Link href="/" className={styles.return}>
        Return to dashboard
        <ArrowRight size={16} />
      </Link>
    </section>
  );
}
