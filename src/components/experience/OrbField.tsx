import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

export function OrbField() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { damping: 18, stiffness: 120 });
  const smoothY = useSpring(mouseY, { damping: 18, stiffness: 120 });

  const translatePrimaryX = useTransform(smoothX, [0, 1], [-18, 18]);
  const translatePrimaryY = useTransform(smoothY, [0, 1], [-12, 12]);
  const translateSecondaryX = useTransform(smoothX, [0, 1], [16, -16]);
  const translateSecondaryY = useTransform(smoothY, [0, 1], [12, -12]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      mouseX.set(event.clientX / window.innerWidth);
      mouseY.set(event.clientY / window.innerHeight);
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [mouseX, mouseY]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        style={{ x: translatePrimaryX, y: translatePrimaryY }}
        className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(129,140,248,0.55),_rgba(129,140,248,0))] blur-2xl"
      />
      <motion.div
        style={{ x: translateSecondaryX, y: translateSecondaryY }}
        className="absolute right-[-4rem] top-1/3 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(45,212,191,0.4),_rgba(45,212,191,0))] blur-3xl"
      />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,_rgba(9,14,32,0),_rgba(9,14,32,0.75))]" />
      <div className="absolute inset-0 bg-[linear-gradient(130deg,_rgba(255,255,255,0.06),_rgba(255,255,255,0)_38%,_rgba(56,189,248,0.08)_72%,_rgba(255,255,255,0)_100%)]" />
    </div>
  );
}
