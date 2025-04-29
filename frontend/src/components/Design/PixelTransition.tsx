import React, {
  useRef,
  useEffect,
  useState,
  ReactNode,
  CSSProperties
} from 'react';
import gsap from 'gsap';             // ← only gsap
// Alias the Tween type
type Tween = gsap.core.Tween;

import './PixelTransition.css';

interface PixelTransitionProps {
  firstContent: ReactNode;
  secondContent: ReactNode;
  gridSize?: number;
  pixelColor?: string;
  animationStepDuration?: number;
  className?: string;
  style?: CSSProperties;
  aspectRatio?: string;
}

function PixelTransition({
  firstContent,
  secondContent,
  gridSize = 7,
  pixelColor = 'currentColor',
  animationStepDuration = 0.3,
  className = '',
  style = {},
  aspectRatio = '100%'
}: PixelTransitionProps) {
  const pixelGridRef = useRef<HTMLDivElement>(null);
  const activeRef    = useRef<HTMLDivElement>(null);
  const delayedCallRef = useRef<Tween | null>(null); // ← use gsap.core.Tween
  const [isActive, setIsActive] = useState(false);

  // Build the grid once
  useEffect(() => {
    const grid = pixelGridRef.current;
    if (!grid) return;
    grid.innerHTML = '';
    const sizePct = 100 / gridSize;
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const px = document.createElement('div');
        px.className = 'pixelated-image-card__pixel';
        px.style.backgroundColor = pixelColor;
        px.style.cssText += `
          width:  ${sizePct}%;
          height: ${sizePct}%;
          left:   ${col * sizePct}%;
          top:    ${row * sizePct}%;
        `;
        grid.appendChild(px);
      }
    }
  }, [gridSize, pixelColor]);

  // Animate in/out
  const animatePixels = (activate: boolean) => {
    setIsActive(activate);
    const grid     = pixelGridRef.current;
    const activeEl = activeRef.current;
    if (!grid || !activeEl) return;

    const pixels = grid.querySelectorAll<HTMLDivElement>(
      '.pixelated-image-card__pixel'
    );
    if (!pixels.length) return;


    gsap.killTweensOf(pixels);
    delayedCallRef.current?.kill();

    gsap.set(pixels, { display: 'none' });

    const staggerAmt = animationStepDuration / pixels.length;

    gsap.to(pixels, {
      display:  'block',
      duration: 0,
      stagger: { each: staggerAmt, from: 'random' }
    });

    delayedCallRef.current = gsap.delayedCall(
      animationStepDuration,
      () => {
        activeEl.style.display       = activate ? 'block' : 'none';
        activeEl.style.pointerEvents = activate ? 'none'  : '';
      }
    );

    // Then hide pixels again
    gsap.to(pixels, {
      display:  'none',
      duration: 0,
      delay:     animationStepDuration,
      stagger:   { each: staggerAmt, from: 'random' }
    });
  };

  // Detect touch to switch handlers
  const isTouch =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches);

  return (
    <div
      className={`pixelated-image-card ${className}`}
      style={style}
      onMouseEnter={!isTouch ? () => animatePixels(true) : undefined}
      onMouseLeave={!isTouch ? () => animatePixels(false) : undefined}
      onClick={isTouch ? () => animatePixels(!isActive) : undefined}
    >
      <div style={{ paddingTop: aspectRatio }} />
      <div className="pixelated-image-card__default">
        {firstContent}
      </div>
      <div
        className="pixelated-image-card__active"
        ref={activeRef}
        style={{ display: 'none' }}
      >
        {secondContent}
      </div>
      <div
        className="pixelated-image-card__pixels"
        ref={pixelGridRef}
      />
    </div>
  );
}

export default PixelTransition;
