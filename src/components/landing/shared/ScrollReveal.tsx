"use client";

import React, { useEffect, useRef } from "react";

/**
 * ScrollReveal — IntersectionObserver wrapper for scroll-triggered animations.
 * Add className="scroll-reveal" to children. Adds "visible" class when in view.
 * Supports delay-1..delay-5 classes for staggered reveals.
 */
export function useScrollReveal(rootRef?: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef?.current ?? document;
    const elements = root.querySelectorAll(".scroll-reveal:not(.visible)");
    if (!elements.length) return;

    // Respect prefers-reduced-motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      elements.forEach((el) => el.classList.add("visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -60px 0px" }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [rootRef]);
}

/**
 * ScrollReveal component wrapper — wraps children and triggers reveal.
 */
export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: React.ElementType;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      el.classList.add("visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -60px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const delayClass = delay > 0 ? ` delay-${delay}` : "";

  return (
    <Tag
      ref={ref}
      className={`scroll-reveal${delayClass} ${className}`}
    >
      {children}
    </Tag>
  );
}
