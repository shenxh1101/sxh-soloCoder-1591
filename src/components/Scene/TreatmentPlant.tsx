import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Tank } from './Tank';
import { WaterParticles } from './WaterParticles';
import { AerationBubbles } from './AerationBubbles';
import { Lights } from './Lights';
import { Ground } from './Ground';
import { TREATMENT_UNIT_ORDER } from '../../utils/constants';
import { useSimulationStore } from '../../store/useSimulationStore';
import { TreatmentUnitType } from '../../types';

export function TreatmentPlant() {
  const selectUnit = useSimulationStore((state) => state.selectUnit);
  const isTeachingMode = useSimulationStore((state) => state.isTeachingMode);

  const handleUnitClick = (unitId: TreatmentUnitType) => {
    if (isTeachingMode) {
      selectUnit(unitId);
    }
  };

  const handleSceneClick = () => {
    selectUnit(null);
  };

  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: [0, 15, 20], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
        onClick={handleSceneClick}
      >
        <color attach="background" args={['#0f0f1a']} />
        <fog attach="fog" args={['#0f0f1a', 30, 60]} />

        <Lights />
        <Ground />

        {TREATMENT_UNIT_ORDER.map((unitId) => (
          <Tank
            key={unitId}
            unitId={unitId}
            onClick={() => handleUnitClick(unitId)}
          />
        ))}

        <WaterParticles count={200} />
        <AerationBubbles count={150} />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={10}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2.2}
          target={[3, 0, 0]}
        />

        <EffectComposer>
          <Bloom
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            height={300}
            intensity={1.5}
          />
          <Vignette offset={0.5} darkness={0.5} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
