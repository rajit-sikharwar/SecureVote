import type { PropsWithChildren } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface TiltSurfaceProps extends PropsWithChildren {
  className?: string;
}

export function TiltSurface({ children, className }: TiltSurfaceProps) {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const smoothRotateX = useSpring(rotateX, { stiffness: 150, damping: 18 });
  const smoothRotateY = useSpring(rotateY, { stiffness: 150, damping: 18 });
  const shadowY = useTransform(smoothRotateX, [-8, 8], [12, 24]);

  return (
    <motion.div
      className={className}
      style={{
        rotateX: smoothRotateX,
        rotateY: smoothRotateY,
        transformStyle: 'preserve-3d',
        boxShadow: shadowY.get() ? undefined : undefined,
      }}
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const offsetX = event.clientX - bounds.left;
        const offsetY = event.clientY - bounds.top;
        const x = ((offsetY / bounds.height) - 0.5) * -12;
        const y = ((offsetX / bounds.width) - 0.5) * 12;
        rotateX.set(x);
        rotateY.set(y);
      }}
      onPointerLeave={() => {
        rotateX.set(0);
        rotateY.set(0);
      }}
      transition={{ type: 'spring', stiffness: 160, damping: 18 }}
    >
      {children}
    </motion.div>
  );
}
