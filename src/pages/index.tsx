import type {ReactNode} from 'react';
import Head from '@docusaurus/Head';
import HeroLanding from '@site/src/components/HeroLanding/HeroLanding';
import CustomCursor from '@site/src/components/CustomCursor/CustomCursor';

/**
 * The landing page renders without Docusaurus Layout (no navbar / footer)
 * for a cinematic, full-screen experience.
 * Navbar + footer are only visible on /blog and /gallery.
 */
export default function LandingPage(): ReactNode {
  return (
    <>
      <Head>
        <title>Otti in Perpignan — Erasmus+</title>
        <meta name="description" content="Follow my Erasmus+ internship journey in Perpignan, France." />
      </Head>
      <CustomCursor />
      <HeroLanding />
    </>
  );
}
