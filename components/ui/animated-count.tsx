"use client";

import { useLayoutEffect, useRef, useEffectEvent } from "react";
import { cn, numberLabel } from "@/lib/utils";

function easeOutCubic(progress: number) {
  return 1 - (1 - progress) ** 3;
}

function formatCount(value: number, suffix: string) {
  return `${numberLabel(value)}${suffix}`;
}

function isInViewport(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
}

export function AnimatedCount({
  value,
  suffix = "",
  duration = 1400,
  className,
}: {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const frameRef = useRef<number | null>(null);
  const startedRef = useRef(false);

  const runAnimation = useEffectEvent(() => {
    const element = ref.current;
    if (!element || startedRef.current) {
      return;
    }

    startedRef.current = true;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const nextValue = Math.round(value * easeOutCubic(progress));
      element.textContent = formatCount(nextValue, suffix);

      if (progress < 1) {
        frameRef.current = window.requestAnimationFrame(tick);
        return;
      }

      frameRef.current = null;
      element.textContent = formatCount(value, suffix);
    };

    frameRef.current = window.requestAnimationFrame(tick);
  });

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    startedRef.current = false;
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      element.textContent = formatCount(value, suffix);
      return;
    }

    // We update the text imperatively so the server-rendered markup can stay lightweight.
    element.textContent = formatCount(0, suffix);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          runAnimation();
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.35,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    if (isInViewport(element)) {
      runAnimation();
    } else {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [duration, suffix, value]);

  return (
    <span ref={ref} className={cn("inline-block tabular-nums", className)}>
      {formatCount(value, suffix)}
    </span>
  );
}
