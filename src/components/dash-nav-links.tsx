"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function DashNavLinks() {
  const pathname = usePathname();

  return (
    <div className="dash-nav-links">
      <Link
        href="/dashboard"
        className={`dash-nav-link${pathname === "/dashboard" ? " active" : ""}`}
      >
        Repositories
      </Link>
      <Link
        href="/dashboard/analyses"
        className={`dash-nav-link${pathname === "/dashboard/analyses" ? " active" : ""}`}
      >
        My analyses
      </Link>
    </div>
  );
}
