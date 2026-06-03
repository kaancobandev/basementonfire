'use client';

import { useSpring, animated } from '@react-spring/web';

interface Props {
  value: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Spring-physics animated integer (react-spring).
 * Counts up from 0 on mount and smoothly springs to the new value whenever
 * `value` changes — e.g. the follower count when you follow/unfollow.
 */
export default function AnimatedNumber({ value, className, style }: Props) {
  const spring = useSpring({
    from: { n: 0 },
    n: value,
    config: { tension: 210, friction: 22 },
  });
  return (
    <animated.span className={className} style={style}>
      {spring.n.to((v) => Math.round(v).toLocaleString('tr-TR'))}
    </animated.span>
  );
}
