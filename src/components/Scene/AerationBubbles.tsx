import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/useSimulationStore';
import { UNIT_CONFIGS } from '../../utils/constants';

interface AerationBubblesProps {
  count?: number;
}

export function AerationBubbles({ count = 150 }: AerationBubblesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const isRunning = useSimulationStore((state) => state.isRunning);
  const aerationIntensity = useSimulationStore((state) => state.aerationIntensity);

  const config = UNIT_CONFIGS.aerationTank;

  const particleData = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = config.position.x + (Math.random() - 0.5) * config.size.width * 0.8;
      positions[i * 3 + 1] = config.position.y - config.size.height / 2 + Math.random() * 0.5;
      positions[i * 3 + 2] = config.position.z + (Math.random() - 0.5) * config.size.depth * 0.8;

      speeds[i] = 0.02 + Math.random() * 0.03;
      sizes[i] = 0.05 + Math.random() * 0.1;
    }

    return { positions, speeds, sizes };
  }, [count, config]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;
    const intensity = isRunning ? aerationIntensity / 100 : 0;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const iy = ix + 1;
      const iz = ix + 2;

      if (intensity > 0.1) {
        positions[iy] += particleData.speeds[i] * intensity * 3;
        positions[ix] += Math.sin(time * 3 + i) * 0.002 * intensity;
        positions[iz] += Math.cos(time * 2 + i * 0.7) * 0.002 * intensity;

        if (positions[iy] > config.position.y + config.size.height * 0.7) {
          positions[ix] = config.position.x + (Math.random() - 0.5) * config.size.width * 0.8;
          positions[iy] = config.position.y - config.size.height / 2 + Math.random() * 0.5;
          positions[iz] = config.position.z + (Math.random() - 0.5) * config.size.depth * 0.8;
        }
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particleData.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
