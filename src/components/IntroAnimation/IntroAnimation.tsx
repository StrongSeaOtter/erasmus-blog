import React, { useState, useEffect, useRef } from 'react';
import Typewriter from 'typewriter-effect';
import OverlayCards from '@site/src/components/OverlayCards/OverlayCards';
import styles from './IntroAnimation.module.css';

interface IntroAnimationProps {
  onAnimationComplete: () => void;
}

export default function IntroAnimation({ onAnimationComplete }: IntroAnimationProps): React.ReactNode {
  const [isVisible, setIsVisible] = useState(true);
  const [typewriterDone, setTypewriterDone] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const cardsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Check if animation has been shown in this session
    const hasShownAnimation = sessionStorage.getItem('introAnimationShown');

    if (hasShownAnimation) {
      setIsVisible(false);
      onAnimationComplete();
      return;
    }

    // Mark animation as shown
    sessionStorage.setItem('introAnimationShown', 'true');

    // Prevent body scroll while animation is active
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'unset';
      if (cardsTimerRef.current) clearTimeout(cardsTimerRef.current);
    };
  }, [onAnimationComplete]);

  // When typewriter finishes, wait briefly then show cards
  useEffect(() => {
    if (typewriterDone) {
      cardsTimerRef.current = setTimeout(() => {
        setShowCards(true);
      }, 700);
    }
    return () => {
      if (cardsTimerRef.current) clearTimeout(cardsTimerRef.current);
    };
  }, [typewriterDone]);

  const handleCardClick = () => {
    // Restore scroll and signal parent before navigation
    document.body.style.overflow = 'unset';
    setIsVisible(false);
    onAnimationComplete();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <h1 className={styles.text}>
          <Typewriter
            options={{
              delay: 75,
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

      {/* OverlayCards fades in after typewriter completes */}
      <div
        className={`${styles.cardsContainer} ${showCards ? styles.cardsVisible : ''}`}
        onClick={handleCardClick}
      >
        <OverlayCards />
      </div>
    </div>
  );
}
