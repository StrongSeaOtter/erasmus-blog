import React from 'react';
import Link from '@docusaurus/Link';
import styles from './OverlayCards.module.css';

const cards = [
  {
    label: 'Blog',
    to: '/blog',
    gif: '/img/departure/marseille-sea.gif',
  },
  {
    label: 'Gallery',
    to: '/gallery',
    gif: '/img/departure/old-port.jpg',
  },
];

export default function OverlayCards(): React.ReactNode {
  return (
    <div className={styles.overlayWrapper} aria-label="Landing cards overlay">
      <p className={styles.heading}></p>
      <div className={styles.cards}>
        {cards.map((card) => (
          <Link
            key={card.label}
            className={styles.cardLink}
            to={card.to}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={styles.card}
              style={{ backgroundImage: `url('${card.gif}')` }}
            >
              <span className={styles.cardLabel}>{card.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}