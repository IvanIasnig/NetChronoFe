"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import styles from "./Navbar.module.scss";
import { INavbarProps } from "./Navbar.models";

export default function Navbar({ navLinks }: INavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className={styles.navbar}>
      <div className={styles["navbar__logo"]}>
        <Link href="/">SpeedPro</Link>
      </div>

      <div
        className={`${styles["navbar__links"]} ${
          menuOpen ? styles["navbar__links--open"] : ""
        }`}
      >
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMenuOpen(false)}
            className={styles["navbar__link"]}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <button
        className={styles["navbar__toggle"]}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </nav>
  );
}
