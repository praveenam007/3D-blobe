import React, { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { SceneState, ShapeType } from '../types';

// Add global type augmentation to fix 'Property ... does not exist on type JSX.IntrinsicElements'
declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      boxGeometry: any;
      sphereGeometry: any;
      icosahedronGeometry: any;
      torusGeometry: any;
      meshStandardMaterial: any;
      ambientLight: any;
      spotLight: any;
      pointLight: any;
      color: any;
    }
  }
}

export interface Scene3DRef {
  recordVideo: (onComplete: () => void) => void;
}

interface MeshProps {
  config: SceneState;
}

const AnimatedMesh: React.FC<MeshProps> = ({ config }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Rotation logic
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * config.speed * 0.5;
      meshRef.current.rotation.y += delta * config.speed * 0.8;
    }
  });

  // Geometry selection
  const geometry = useMemo(() => {
    switch (config.shape) {
      case ShapeType.CUBE:
        return <boxGeometry args={[2.5, 2.5, 2.5]} />;
      case ShapeType.SPHERE:
        return <sphereGeometry args={[1.8, 64, 64]} />;
      case ShapeType.ICOSAHEDRON:
        return <icosahedronGeometry args={[2, 0]} />;
      case ShapeType.TORUS:
      default:
        return <torusGeometry args={[1.5, 0.6, 32, 100]} />;
    }
  }, [config.shape]);

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      {geometry}
      <meshStandardMaterial
        color={config.color}
        roughness={config.roughness}
        metalness={config.metalness}
        wireframe={config.wireframe}
        emissive={config.color}
        emissiveIntensity={0.1}
      />
    </mesh>
  );
};

// Internal component to handle recording logic via useThree
const Recorder = forwardRef<{ record: (cb: () => void) => void }, {}>((_, ref) => {
  const { gl } = useThree();

  useImperativeHandle(ref, () => ({
    record: (onComplete: () => void) => {
      const canvas = gl.domElement;
      // 60 FPS capture
      const stream = (canvas as any).captureStream(60);
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp9'
      });
      
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Updated filename to match Android project expectation
        a.download = `video.webm`;
        a.click();
        URL.revokeObjectURL(url);
        onComplete();
      };

      recorder.start();
      // Record for 5 seconds
      setTimeout(() => {
        recorder.stop();
      }, 5000);
    }
  }));

  return null;
});

interface Scene3DProps {
  config: SceneState;
  autoRotate?: boolean;
}

const Scene3D = forwardRef<Scene3DRef, Scene3DProps>(({ config, autoRotate = false }, ref) => {
  const recorderRef = useRef<{ record: (cb: () => void) => void }>(null);

  useImperativeHandle(ref, () => ({
    recordVideo: (onComplete) => {
      if (recorderRef.current) {
        recorderRef.current.record(onComplete);
      } else {
        onComplete();
      }
    }
  }));

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
    >
      <color attach="background" args={['#050505']} />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        intensity={100}
        castShadow
        shadow-mapSize={1024}
      />
      <pointLight position={[-10, -10, -10]} intensity={50} color={config.color} />

      {/* Environment */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Environment preset="city" />

      {/* Main Object */}
      <AnimatedMesh config={config} />

      {/* Ground Reflections */}
      <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.5} far={10} color="#000000" />
      
      <OrbitControls makeDefault autoRotate={autoRotate} autoRotateSpeed={1.5} />
      
      <Recorder ref={recorderRef} />
    </Canvas>
  );
});

export default Scene3D;