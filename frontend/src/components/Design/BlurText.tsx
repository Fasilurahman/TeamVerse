import React, { useRef, useEffect, useState } from 'react';
import { useSprings, animated, AnimatedProps } from '@react-spring/web';
import { easeCubicOut } from 'd3-ease';

interface BlurTextProps {
  text?: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  threshold?: number;
  rootMargin?: string;
  animationFrom?: React.CSSProperties;
  animationTo?: React.CSSProperties[];
  easing?: (t: number) => number;
  onAnimationComplete?: () => void;
}

const BlurText: React.FC<BlurTextProps> = ({
  text = '',
  delay = 200,
  className = '',
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  rootMargin = '0px',
  animationFrom,
  animationTo,
  easing = easeCubicOut,
  onAnimationComplete,
}) => {
  const elements = animateBy === 'words' ? text.split(/(\s+)/) : text.split('');
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);
  const animatedCount = useRef(0);

  const validDirections = ['top', 'bottom'];
  const finalDirection = validDirections.includes(direction) ? direction : 'top';

  const defaultFrom: React.CSSProperties =
    finalDirection === 'top'
      ? { filter: 'blur(10px)', opacity: 0, transform: 'translate3d(0,-50px,0)' }
      : { filter: 'blur(10px)', opacity: 0, transform: 'translate3d(0,50px,0)' };

  const defaultTo: React.CSSProperties[] = [
    {
      filter: 'blur(5px)',
      opacity: 0.5,
      transform: finalDirection === 'top' ? 'translate3d(0,5px,0)' : 'translate3d(0,-5px,0)',
    },
    { filter: 'blur(0px)', opacity: 1, transform: 'translate3d(0,0,0)' },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const springs = useSprings(
    elements.length,
    elements.map((_, i) => ({
      from: animationFrom || defaultFrom,
      to: inView
        ? async (next: (props: React.CSSProperties) => Promise<void>) => {
            for (const step of animationTo || defaultTo) {
              await next(step);
            }
            animatedCount.current += 1;
            if (animatedCount.current === elements.length && onAnimationComplete) {
              onAnimationComplete();
            }
          }
        : animationFrom || defaultFrom,
      delay: i * delay,
      config: { easing },
    }))
  );

  return (
    <p ref={ref} className={`blur-text ${className}`}>
      {springs.map((props, index) => {
        const AnimatedSpan = animated.span as React.FC<AnimatedProps<React.HTMLAttributes<HTMLSpanElement>> & { children: React.ReactNode }>;
        return (
          <AnimatedSpan
            key={index}
            style={{
              ...props,
              display: 'inline-block',
              willChange: 'transform, filter, opacity',
            }}
          >
            {elements[index] === ' ' ? '\u00A0' : elements[index]}
          </AnimatedSpan>
        );
      })}
    </p>
  );
};

export default BlurText;
