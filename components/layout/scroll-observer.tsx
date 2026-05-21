"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function isInViewport(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
}

export function ScrollObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const element = entry.target as HTMLElement;
          element.dataset.revealVisible = "true";
          observer.unobserve(element);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    const syncElements = () => {
      const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
      if (elements.length === 0) {
        return;
      }

      elements.forEach((element) => {
        if (prefersReducedMotion) {
          element.dataset.revealVisible = "true";
          delete element.dataset.revealState;
          return;
        }

        if (element.dataset.revealVisible === "true") {
          return;
        }

        if (isInViewport(element)) {
          element.dataset.revealVisible = "true";
          delete element.dataset.revealState;
          return;
        }

        element.dataset.revealState = "pending";
        observer.observe(element);
      });
    };

    syncElements();

    const mutationObserver = new MutationObserver(() => {
      syncElements();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [pathname]);

  return null;
}
