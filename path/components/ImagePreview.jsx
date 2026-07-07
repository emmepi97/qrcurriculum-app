'use client';
import { useState } from 'react';

export default function ImagePreview({ url, alt = 'Profile image' }) {
  const [failed, setFailed] = useState(false);
  if (!url || failed) return <div className="imagePlaceholder">Foto</div>;
  return <img className="photoPreview" src={url} alt={alt} referrerPolicy="no-referrer" onError={() => setFailed(true)} />;
}
