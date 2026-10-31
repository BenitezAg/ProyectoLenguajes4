import { useEffect, useRef } from "react";

export default function Reveal({ as: Element = "div", className = "", style, children, onVisible, ...props }) {
  const ref = useRef(null);
  const onVisibleRef = useRef(onVisible);

  useEffect(() => {
    onVisibleRef.current = onVisible;
  }, [onVisible]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof IntersectionObserver === "undefined"
    ) {
      element.classList.add("visible");
      onVisibleRef.current?.();
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        onVisibleRef.current?.();
        observer.disconnect();
      },
      { threshold: 0.14 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Element
      ref={ref}
      className={`reveal ${className}`.trim()}
      style={style}
      {...props}
    >
      {children}
    </Element>
  );
}
