import React, { useState } from 'react';
import styles from './OverlayCards.module.css';

interface Card {
  label: string;
  to: string;
  gif: string;
}

const cards: Card[] = [
  {
    label: 'Blog',
    to: '/blog',
    gif: '/img/departure/marseille-sea.gif',
  },
  {
    label: 'Gallery',
    to: '/gallery',
    gif: '/img/departure/old-port-800.jpg',
  },
];

export default function OverlayCards() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleCardClick = (index: number, href: string, event: React.MouseEvent<HTMLAnchorElement>) => {
    if (expandedIndex === index) {
      // Second tap: navigate (let default anchor behavior happen)
      return;
    }
    
    // First tap: expand to center, prevent navigation
    event.preventDefault();
    setExpandedIndex(index);
  };

  const handleWrapperClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking on the wrapper itself, not on a card
    if (event.target === event.currentTarget) {
      setExpandedIndex(null);
    }
  };

  return (
    <div 
      className={styles.overlayWrapper}
      onClick={handleWrapperClick}
    >
      <div className={styles.cards}>
        {cards.map((card, index) => (
          <a
            key={index}
            href={card.to}
            className={`${styles.cardLink} ${expandedIndex === index ? styles.expanded : ''}`}
            onClick={(e) => handleCardClick(index, card.to, e)}
            aria-expanded={expandedIndex === index}
            aria-label={`Tap again to open ${card.label}`}
          >
            <div 
              className={styles.card} 
              style={{ backgroundImage: `url(${card.gif})` }}
            >
              <span className={styles.cardLabel}>{card.label}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}