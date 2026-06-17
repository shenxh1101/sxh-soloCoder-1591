import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreatmentUnitType } from '../../types';
import { useSimulationStore } from '../../store/useSimulationStore';
import { UNIT_CONFIGS, TREATMENT_UNIT_ORDER } from '../../utils/constants';

interface WaterParticlesProps {
  count?: number;
}

export function WaterParticles({ count = 200 }: WaterParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const isRunning = useSimulationStore((state) => state.isRunning);
  const inflowRate = useSimulationStore((state) => state.inflowRate);

  const particleData = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const targets = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const unitIndex = Math.floor(Math.random() * TREATMENT_UNIT_ORDER.length);
      const unitId = TREATMENT_UNIT_ORDER[unitIndex];
      const config = UNIT_CONFIGS[unitId];

      positions[i * 3] = config.position.x + (Math.random() - 0.5) * config.size.width * 0.8;
      positions[i * 3 + 1] = config.position.y + Math.random() * config.size.height * 0.6;
      positions[i * 3 + 2] = config.position.z + (Math.random() - 0.5) * config.size.depth * 0.8;

      const nextUnitIndex = Math.min(unitIndex + 1, TREATMENT_UNIT_ORDER.length - 1);
      const nextUnitId = TREATMENT_UNIT_ORDER[nextUnitIndex];
      const nextConfig = UNIT_CONFIGS[nextUnitId];

      targets[i * 3] = nextConfig.position.x + (Math.random() - 0.5) * nextConfig.size.width * 0.5;
      targets[i * 3 + 1] = nextConfig.position.y + Math.random() * nextConfig.size.height * 0.5;
      targets[i * 3 + 2] = nextConfig.position.z + (Math.random() - 0.5) * nextConfig.size.depth * 0.5;

      velocities[i * 3] = (Math.random() - 0.5) * 0.01;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;

      const color = new THREE.Color(config.color);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return { positions, velocities, targets, colors };
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current || !isRunning) return;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;
    const speedMultiplier = 1 + (inflowRate / 100) * 2;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const iy = ix + 1;
      const iz = ix + 2;

      const targetX = particleData.targets[ix];
      const targetY = particleData.targets[iy];
      const targetZ = particleData.targets[iz];

      const dx = targetX - positions[ix];
      const dy = targetY - positions[iy];
      const dz = targetZ - positions[iz];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < 0.5) {
        const unitIndex = Math.floor(Math.random() * TREATMENT_UNIT_ORDER.length);
        const unitId = TREATMENT_UNIT_ORDER[unitIndex];
        const config = UNIT_CONFIGS[unitId];

        positions[ix] = config.position.x + (Math.random() - 0.5) * config.size.width * 0.8;
        positions[iy] = config.position.y + Math.random() * config.size.height * 0.6;
        positions[iz] = config.position.z + (Math.random() - 0.5) * config.size.depth * 0.8;

        const nextUnitIndex = Math.min(unitIndex + 1, TREATMENT_UNIT_ORDER.length - 1);
        const nextUnitId = TREATMENT_UNIT_ORDER[nextUnitIndex];
        const nextConfig = UNIT_CONFIGS[nextUnitId];

        particleData.targets[ix] = nextConfig.position.x + (Math.random() - 0.5) * nextConfig.size.width * 0.5;
        particleData.targets[iy] = nextConfig.position.y + Math.random() * nextConfig.size.height * 0.5;
        particleData.targets[iz] = nextConfig.position.z + (Math.random() - 0.5) * nextConfig.size.depth * 0.5;
      } else {
        const speed = 0.003 * speedMultiplier;
        positions[ix] += (dx / dist) * speed;
        positions[iy] += (dy / dist) * speed;
        positions[iz] += (dz / dist) * speed;

        positions[iy] += Math.sin(time * 2 + i) * 0.002;
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
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particleData.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
