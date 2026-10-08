import React, { useState } from 'react';
import { Package } from 'lucide-react';

export default function ProductImage({ src, alt, className = '' }) {
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!src || hasError) {
    return (
      <div 
        className={`image-placeholder ${className}`}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '140px',
          background: 'rgba(255, 255, 255, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          border: '1px dashed rgba(255, 255, 255, 0.1)',
          color: '#64748b'
        }}
      >
        <Package size={28} strokeWidth={1.5} />
        <span style={{ fontSize: '0.75rem', marginTop: '4px', opacity: 0.8 }}>No Image Available</span>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {!loaded && (
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.02) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            borderRadius: '8px'
          }}
        />
      )}
      <img
        src={src}
        alt={alt || 'Product thumbnail'}
        className={`card-image ${className}`}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setHasError(true)}
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.25s ease'
        }}
      />
    </div>
  );
}
