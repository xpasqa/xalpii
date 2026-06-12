"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

type FooterAwareFixedPanelProps = {
  bottomOffset?: number;
  children: ReactNode;
  className?: string;
  footerSelector?: string;
  style?: CSSProperties;
  topOffset?: number;
};

export function FooterAwareFixedPanel({
  bottomOffset = 32,
  children,
  className,
  footerSelector = "[data-site-footer]",
  style,
  topOffset = 88
}: FooterAwareFixedPanelProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [panelTop, setPanelTop] = useState(topOffset);

  useEffect(() => {
    let frameId = 0;

    const updateSafeBottom = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const footer = document.querySelector<HTMLElement>(footerSelector);

        if (!footer) {
          setPanelTop(topOffset);
          return;
        }

        const panelHeight = panelRef.current?.offsetHeight ?? 0;
        const footerTop = footer.getBoundingClientRect().top;
        const lowestTopBeforeFooter = footerTop - panelHeight - bottomOffset;
        const nextTop = Math.max(16, Math.min(topOffset, Math.floor(lowestTopBeforeFooter)));

        setPanelTop((currentTop) => (currentTop === nextTop ? currentTop : nextTop));
      });
    };

    updateSafeBottom();
    window.addEventListener("scroll", updateSafeBottom, { passive: true });
    window.addEventListener("resize", updateSafeBottom);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", updateSafeBottom);
      window.removeEventListener("resize", updateSafeBottom);
    };
  }, [bottomOffset, footerSelector, topOffset]);

  return (
    <div
      className={className}
      ref={panelRef}
      style={{
        ...style,
        top: panelTop
      }}
    >
      {children}
    </div>
  );
}
