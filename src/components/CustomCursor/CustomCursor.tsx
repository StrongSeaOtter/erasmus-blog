import React, { useEffect, useRef, useState } from 'react';
import styles from './CustomCursor.module.css';

export default function CustomCursor(): React.ReactNode {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isHeroHovering, setIsHeroHovering] = useState(false);

  useEffect(() => {
    // Detect mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || navigator.maxTouchPoints > 0);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return; // Disable on mobile

    const cursor = cursorRef.current;
    if (!cursor) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let animationId: number;

    const heroSection = document.querySelector('[role="region"]');

    const moveCursor = () => {
      // Smooth easing: follow with slight delay
      cursorX += (mouseX - cursorX) * 0.2;
      cursorY += (mouseY - cursorY) * 0.2;

      cursor.style.left = cursorX + 'px';
      cursor.style.top = cursorY + 'px';

      animationId = requestAnimationFrame(moveCursor);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Check if hovering over hero
      if (heroSection && heroSection.contains(e.target as Node)) {
        setIsHeroHovering(true);
      } else {
        setIsHeroHovering(false);
      }
    };

    const handleMouseEnter = () => {
      if (cursor) {
        cursor.style.opacity = '1';
      }
    };

    const handleMouseLeave = () => {
      if (cursor) {
        cursor.style.opacity = '0';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseleave', handleMouseLeave);

    animationId = requestAnimationFrame(moveCursor);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, [isMobile]);

  if (isMobile) {
    return null; // No custom cursor on mobile
  }

  return (
    <div
      ref={cursorRef}
      className={`${styles.cursor} ${isHeroHovering ? styles.active : ''}`}
    />
  );
}
