import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreatmentUnitType } from '../../types';
import { useSimulationStore } from '../../store/useSimulationStore';
import { getWaterColor } from '../../utils/waterTreatment';

interface TankProps {
  unitId: TreatmentUnitType;
  onClick?: () => void;
}

export function Tank({ unitId, onClick }: TankProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);
  const waterRef = useRef<THREE.Mesh>(null);
  const alertRef = useRef<THREE.Mesh>(null);
  const highlightRef = useRef<THREE.Mesh>(null);
  
  const unit = useSimulationStore((state) => state.units[unitId]);
  const isSelected = useSimulationStore((state) => state.selectedUnit === unitId);
  const isHighlighted = useSimulationStore((state) => state.highlightedUnit === unitId);
  const isTeachingMode = useSimulationStore((state) => state.isTeachingMode);
  const aerationIntensity = useSimulationStore((state) => state.aerationIntensity);

  const waterColor = useMemo(() => {
    return getWaterColor(unit.waterQuality.cod);
  }, [unit.waterQuality.cod]);

  const waterHeight = useMemo(() => {
    return (unit.waterLevel / unit.maxWaterLevel) * (unit.size.height * 0.8);
  }, [unit.waterLevel, unit.maxWaterLevel, unit.size.height]);

  const waterScale = useMemo(() => {
    return waterHeight / (unit.size.height * 0.8);
  }, [waterHeight, unit.size.height]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (waterRef.current) {
      const baseY = -unit.size.height / 2 + waterHeight / 2;
      const waveEffect = Math.sin(time * 2 + unit.position.x) * 0.05;
      waterRef.current.position.y = baseY + waveEffect;
      waterRef.current.scale.y = waterScale;
      
      const waterMaterial = waterRef.current.material as THREE.MeshStandardMaterial;
      const qualityFactor = Math.max(0, Math.min(1, (unit.waterQuality.cod - 5) / 295));
      waterMaterial.emissiveIntensity = 0.3 + qualityFactor * 0.4 + Math.sin(time * 1.5) * 0.1;
    }

    if (alertRef.current && unit.isAlert) {
      const pulse = 0.5 + Math.sin(time * 6) * 0.5;
      const material = alertRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.2 + pulse * 0.6;
      alertRef.current.scale.setScalar(1 + pulse * 0.05);
    }

    if (highlightRef.current && isHighlighted) {
      const pulse = 0.5 + Math.sin(time * 4) * 0.5;
      const material = highlightRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.15 + pulse * 0.35;
      highlightRef.current.scale.setScalar(1.08 + pulse * 0.04);
    }

    if (meshRef.current && isSelected) {
      meshRef.current.rotation.y = Math.sin(time * 0.5) * 0.05;
    }

    if (unitId === 'aerationTank' && waterRef.current) {
      const aerationEffect = aerationIntensity / 100;
      waterRef.current.position.y += Math.sin(time * 5) * 0.05 * aerationEffect;
      
      const waterMaterial = waterRef.current.material as THREE.MeshStandardMaterial;
      waterMaterial.opacity = 0.5 + Math.sin(time * 4) * 0.1 * aerationEffect;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (onClick) onClick();
  };

  return (
    <group
      position={[unit.position.x, unit.position.y, unit.position.z]}
      onClick={handleClick}
    >
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry
          args={[unit.size.width, unit.size.height, unit.size.depth]}
        />
        <meshStandardMaterial
          color={unit.color}
          transparent
          opacity={0.3}
          roughness={0.1}
          metalness={0.8}
          emissive={unit.color}
          emissiveIntensity={isSelected ? 0.3 : 0.1}
        />
      </mesh>

      <lineSegments ref={edgesRef}>
        <edgesGeometry
          args={[
            new THREE.BoxGeometry(unit.size.width, unit.size.height, unit.size.depth),
          ]}
        />
        <lineBasicMaterial
          color={unit.color}
          transparent
          opacity={isSelected ? 1 : 0.6}
        />
      </lineSegments>

      <mesh ref={waterRef} position={[0, -unit.size.height / 2 + waterHeight / 2, 0]}>
        <boxGeometry
          args={[
            unit.size.width * 0.9,
            unit.size.height * 0.8,
            unit.size.depth * 0.9,
          ]}
        />
        <meshStandardMaterial
          color={waterColor}
          transparent
          opacity={0.7}
          roughness={0.1}
          metalness={0.3}
          emissive={waterColor}
          emissiveIntensity={0.2}
        />
      </mesh>

      {isTeachingMode && (
        <mesh position={[0, unit.size.height / 2 + 0.5, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial
            color={isSelected ? '#2ec4b6' : '#3e92cc'}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}

      {unit.isAlert && (
        <mesh ref={alertRef}>
          <boxGeometry
            args={[
              unit.size.width + 0.2,
              unit.size.height + 0.2,
              unit.size.depth + 0.2,
            ]}
          />
          <meshBasicMaterial
            color="#e71d36"
            transparent
            opacity={0.3}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {isHighlighted && !unit.isAlert && (
        <mesh ref={highlightRef}>
          <boxGeometry
            args={[
              unit.size.width + 0.4,
              unit.size.height + 0.4,
              unit.size.depth + 0.4,
            ]}
          />
          <meshBasicMaterial
            color="#fbbf24"
            transparent
            opacity={0.3}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </group>
  );
}
