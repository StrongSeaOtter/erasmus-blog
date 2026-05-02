import React, { useRef, useEffect, useState } from 'react';
import Typewriter from 'typewriter-effect';
import OverlayCards from '@site/src/components/OverlayCards/OverlayCards';
import styles from './HeroLanding.module.css';

interface HeroLandingProps {
  onEnter?: () => void;
}

export default function HeroLanding({ onEnter }: HeroLandingProps): React.ReactNode {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [typewriterDone, setTypewriterDone] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setHasAnimated(true);
    document.body.style.overflow = 'hidden';
    document.documentElement.style.cursor = 'none';

    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.cursor = 'auto';
      if (cardsTimerRef.current) clearTimeout(cardsTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (typewriterDone && !showCards) {
      cardsTimerRef.current = setTimeout(() => {
        setShowCards(true);
      }, 800);
    }

    return () => {
      if (cardsTimerRef.current) clearTimeout(cardsTimerRef.current);
    };
  }, [typewriterDone, showCards]);

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  const handleClick = () => {
    if (cardsTimerRef.current) {
      clearTimeout(cardsTimerRef.current);
      cardsTimerRef.current = null;
    }

    setShowCards(true);
    onEnter?.();
  };

  return (
    <section
      ref={heroRef}
      className={styles.heroSection}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      role="region"
      aria-label="Hero landing section"
    >
      <div className={`${styles.content} ${hasAnimated ? styles.animated : ''}`}>
        <h1 className={styles.heroTitle}>
          <Typewriter
            options={{
              delay: 140,
              cursor: '|',
              cursorClassName: styles.typewriterCursor,
            }}
            onInit={(typewriter) => {
              typewriter
                .typeString('Here Begins My Erasmus Journey')
                .callFunction(() => {
                  setTypewriterDone(true);
                })
                .start();
            }}
          />
        </h1>
      </div>

      <div className={`${styles.cardsWrapper} ${showCards ? styles.cardsVisible : ''}`}>
        <OverlayCards />
      </div>

      {isHovering && <FloatingLabel />}
    </section>
  );
}

function FloatingLabel(): React.ReactNode {
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!labelRef.current) return;
      requestAnimationFrame(() => {
        if (labelRef.current) {
          labelRef.current.style.left = e.clientX + 'px';
          labelRef.current.style.top = e.clientY + 'px';
        }
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={labelRef} className={styles.floatingLabel}>
      <div className={styles.labelContent}>
        <span className={styles.rollingText}>
          Enter • Explore • Discover • Enter • Explore • Discover • Enter • Explore • Discover •
        </span>
      </div>
    </div>
  );
}