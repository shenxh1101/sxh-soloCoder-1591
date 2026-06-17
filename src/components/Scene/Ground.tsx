import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Ground() {
  const gridRef = useRef<THREE.GridHelper>(null);

  useEffect(() => {
    if (gridRef.current) {
      const material = gridRef.current.material as THREE.LineBasicMaterial;
      material.transparent = true;
      material.opacity = 0.3;
    }
  }, []);

  useFrame((state) => {
    if (gridRef.current) {
      const material = gridRef.current.material as THREE.LineBasicMaterial;
      material.opacity = 0.25 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial
          color="#16213e"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      <gridHelper
        ref={gridRef}
        args={[100, 50, '#3e92cc', '#1a1a2e']}
        position={[0, -2.99, 0]}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.98, 0]}>
        <planeGeometry args={[60, 12]} />
        <meshStandardMaterial
          color="#1a1a2e"
          transparent
          opacity={0.5}
          roughness={0.9}
        />
      </mesh>
    </group>
  );
}
