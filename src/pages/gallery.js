import React, { useState, useCallback } from 'react';

import Layout from '@theme/Layout';

import { MasonryPhotoAlbum } from 'react-photo-album';
import 'react-photo-album/masonry.css';

import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

import Captions from 'yet-another-react-lightbox/plugins/captions';
import 'yet-another-react-lightbox/plugins/captions.css';

import photos from '../data/gallery.json';

export default function GalleryPage() {
  const [index, setIndex] = useState(-1);

  return (
    <Layout title="Gallery" description="Erasmus Photo Gallery">
      <div style={{ padding: '2rem' }}>
        <h1>Gallery</h1>
        <MasonryPhotoAlbum
          photos={photos}
          onClick={({ index }) => setIndex(index)}
          columns={6}
          spacing={8}
        />
        <Lightbox
          slides={photos.map(p => ({ src: p.src, title: p.title, description: p.description }))}
          open={index >= 0}
          index={index}
          close={() => setIndex(-1)}
          plugins={[Captions]}
        />
      </div>
    </Layout>
  );
}