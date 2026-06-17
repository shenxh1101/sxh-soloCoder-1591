export function Lights() {
  return (
    <>
      <ambientLight intensity={0.4} color="#3e92cc" />
      
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        color="#ffffff"
      />

      <pointLight position={[-12, 5, 0]} intensity={0.5} color="#3e92cc" distance={10} />
      <pointLight position={[-7, 5, 0]} intensity={0.5} color="#2ec4b6" distance={10} />
      <pointLight position={[-1, 5, 0]} intensity={0.5} color="#8338ec" distance={10} />
      <pointLight position={[6, 5, 0]} intensity={0.5} color="#fb5607" distance={12} />
      <pointLight position={[13, 5, 0]} intensity={0.5} color="#3a86ff" distance={10} />
      <pointLight position={[18, 5, 0]} intensity={0.5} color="#06d6a0" distance={10} />

      <hemisphereLight
        color="#1a1a2e"
        groundColor="#16213e"
        intensity={0.3}
      />
    </>
  );
}
