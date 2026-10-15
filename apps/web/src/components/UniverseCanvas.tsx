import { Suspense, useEffect, useMemo, useRef, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, Line, OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { AdditiveBlending, BackSide, BufferGeometry, DoubleSide, Float32BufferAttribute, Group, Vector3 } from 'three';
import { OBJECTS, ORBIT_MODEL_NOTE, PLANETS, type CelestialObject } from '@nexsolarix/astronomy';
import { ORBIT_DISPLAY_SCALE, heliocentricPosition, orbitPathAtDate } from '../lib/orbitalMechanics';
import { useExplorerStore } from '../stores/useExplorerStore';

const planetObjects = PLANETS.filter((object) => object.orbitalElements);
const sunObject = OBJECTS.find((object) => object.id === 'sun')!;
const objectById = new Map(OBJECTS.map((object) => [object.id, object]));

function currentPosition(object: CelestialObject, timestamp: number): Vector3 {
  if (!object.orbitalElements) return new Vector3(0, 0, 0);
  const position = heliocentricPosition(object.orbitalElements, new Date(timestamp));
  return new Vector3(position.x * ORBIT_DISPLAY_SCALE, position.y * ORBIT_DISPLAY_SCALE, position.z * ORBIT_DISPLAY_SCALE);
}

function Starfield({ count }: { count: number }) {
  const geometry = useMemo(() => {
    const random = (() => {
      let seed = 9_120_271;
      return () => {
        seed = (seed * 16_807) % 2_147_483_647;
        return (seed - 1) / 2_147_483_646;
      };
    })();
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const radius = 16 + random() * 34;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[index * 3 + 1] = radius * Math.cos(phi);
      positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    const result = new BufferGeometry();
    result.setAttribute('position', new Float32BufferAttribute(positions, 3));
    return result;
  }, [count]);

  return (
    <points geometry={geometry} frustumCulled={false}>
      <pointsMaterial color="#b8d4e2" size={0.065} sizeAttenuation transparent opacity={0.78} depthWrite={false} />
    </points>
  );
}

function TimeAdvancer() {
  const elapsed = useRef(0);
  useFrame((_state, delta) => {
    elapsed.current += Math.min(delta, 0.1);
    if (elapsed.current >= 0.2) {
      useExplorerStore.getState().advanceTime(elapsed.current);
      elapsed.current = 0;
    }
  });
  return null;
}

function OrbitalPaths({ date }: { date: Date }) {
  const paths = useMemo(() => planetObjects.map((object) => ({
    object,
    points: orbitPathAtDate(object.orbitalElements!, date, 200).map((point) => [
      point.x * ORBIT_DISPLAY_SCALE,
      point.y * ORBIT_DISPLAY_SCALE,
      point.z * ORBIT_DISPLAY_SCALE
    ] as [number, number, number])
  })), [date]);

  return (
    <group>
      {paths.map(({ object, points }) => (
        <Line
          key={object.id}
          points={points}
          color={object.color}
          transparent
          opacity={object.id === 'earth' ? 0.26 : 0.15}
          lineWidth={0.72}
          depthWrite={false}
        />
      ))}
    </group>
  );
}

function Atmosphere({ color, radius }: { color: string; radius: number }) {
  return (
    <mesh scale={radius * 1.13}>
      <sphereGeometry args={[1, 24, 24]} />
      <meshBasicMaterial color={color} transparent opacity={0.13} side={BackSide} blending={AdditiveBlending} depthWrite={false} />
    </mesh>
  );
}

function PlanetBody({ object }: { object: CelestialObject }) {
  const group = useRef<Group>(null);
  const selectedId = useExplorerStore((state) => state.selectedObjectId);
  const selected = selectedId === object.id;
  const clickable = () => useExplorerStore.getState().selectObject(object.id);

  useFrame((_state, delta) => {
    if (!group.current || !object.orbitalElements) return;
    const time = useExplorerStore.getState().simulationTime;
    const position = currentPosition(object, time);
    group.current.position.lerp(position, Math.min(1, delta * 6));
  });

  return (
    <group ref={group}>
      <mesh
        scale={object.visualRadius}
        onClick={(event) => { event.stopPropagation(); clickable(); }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = ''; }}
      >
        <sphereGeometry args={[1, 40, 40]} />
        <meshStandardMaterial color={object.color} roughness={0.86} metalness={0.02} emissive={object.id === 'earth' ? '#082b3d' : '#000000'} emissiveIntensity={0.28} />
      </mesh>
      {(object.id === 'earth' || object.id === 'venus') && <Atmosphere color={object.id === 'earth' ? '#53bbef' : '#eccb90'} radius={object.visualRadius} />}
      {object.id === 'saturn' && (
        <mesh rotation={[Math.PI / 2.17, 0.12, 0]}>
          <ringGeometry args={[object.visualRadius * 1.38, object.visualRadius * 2.2, 72]} />
          <meshStandardMaterial color="#c6b18d" side={DoubleSide} transparent opacity={0.72} roughness={0.92} />
        </mesh>
      )}
      {selected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[object.visualRadius * 1.48, 0.009, 6, 80]} />
          <meshBasicMaterial color="#83e8d1" transparent opacity={0.9} />
        </mesh>
      )}
      <Html position={[0, object.visualRadius + 0.18, 0]} center distanceFactor={13} occlude={false} zIndexRange={[8, 0]}>
        <button className={`scene-label${selected ? ' is-selected' : ''}`} type="button" onClick={(event) => { event.stopPropagation(); clickable(); }} aria-label={`Select ${object.name}`}>
          <span className="scene-label-dot" style={{ backgroundColor: object.color }} />{object.name}
        </button>
      </Html>
    </group>
  );
}

function SunBody() {
  const selected = useExplorerStore((state) => state.selectedObjectId === 'sun');
  const select = () => useExplorerStore.getState().selectObject('sun');
  return (
    <group>
      <mesh scale={sunObject.visualRadius} onClick={(event) => { event.stopPropagation(); select(); }} onPointerOver={() => { document.body.style.cursor = 'pointer'; }} onPointerOut={() => { document.body.style.cursor = ''; }}>
        <sphereGeometry args={[1, 56, 56]} />
        <meshStandardMaterial color="#ffb45f" emissive="#f47e2b" emissiveIntensity={2.2} roughness={0.55} />
      </mesh>
      <mesh scale={sunObject.visualRadius * 1.42}>
        <sphereGeometry args={[1, 40, 40]} />
        <meshBasicMaterial color="#ffad5d" transparent opacity={0.08} side={BackSide} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
      {selected && <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[sunObject.visualRadius * 1.55, 0.014, 8, 96]} /><meshBasicMaterial color="#83e8d1" /></mesh>}
      <Html position={[0, sunObject.visualRadius + 0.28, 0]} center distanceFactor={13} occlude={false} zIndexRange={[8, 0]}>
        <button className={`scene-label${selected ? ' is-selected' : ''}`} type="button" onClick={(event) => { event.stopPropagation(); select(); }} aria-label="Select the Sun">
          <span className="scene-label-dot" style={{ backgroundColor: sunObject.color }} />Sun
        </button>
      </Html>
      <pointLight color="#ffd3a0" intensity={48} distance={48} decay={2} />
    </group>
  );
}

function CameraRig({ controlsRef, focusOnSelect, resetVersion }: { controlsRef: RefObject<OrbitControlsImpl | null>; focusOnSelect: boolean; resetVersion: number }) {
  const { camera } = useThree();
  const targetPosition = useRef(new Vector3(0, 0, 0));
  const cameraPosition = useRef(new Vector3(0, 8.6, 17.5));
  const transitioning = useRef(false);
  const selectedId = useExplorerStore((state) => state.selectedObjectId);
  const focusVersion = useExplorerStore((state) => state.focusVersion);

  useEffect(() => {
    if (!focusOnSelect || focusVersion === 0) return;
    const selected = objectById.get(selectedId);
    const date = useExplorerStore.getState().simulationTime;
    const target = selected ? currentPosition(selected, date) : new Vector3();
    targetPosition.current.copy(target);
    const distance = selectedId === 'sun' ? 5.2 : selected?.kind === 'planet' ? 2.4 : 3.6;
    cameraPosition.current.copy(target).add(new Vector3(0, distance * 0.44, distance));
    transitioning.current = true;
  }, [camera, focusOnSelect, focusVersion, selectedId]);

  useEffect(() => {
    if (resetVersion === 0) return;
    targetPosition.current.set(0, 0, 0);
    cameraPosition.current.set(0, 8.6, 17.5);
    transitioning.current = true;
  }, [resetVersion]);

  useFrame((_state, delta) => {
    if (!transitioning.current) return;
    camera.position.lerp(cameraPosition.current, Math.min(1, delta * 1.65));
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetPosition.current, Math.min(1, delta * 1.65));
      controlsRef.current.update();
    }
    if (camera.position.distanceTo(cameraPosition.current) < 0.018 && (!controlsRef.current || controlsRef.current.target.distanceTo(targetPosition.current) < 0.018)) {
      transitioning.current = false;
    }
  });
  return null;
}

function SolarScene({ focusOnSelect, starCount }: { focusOnSelect: boolean; starCount: number }) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const simulationTime = useExplorerStore((state) => state.simulationTime);
  const resetVersion = useExplorerStore((state) => state.cameraResetVersion);
  const date = useMemo(() => new Date(simulationTime), [simulationTime]);
  const initialTarget = useMemo(() => new Vector3(0, 0, 0), []);

  return (
    <>
      <color attach="background" args={['#050912']} />
      <ambientLight intensity={0.34} color="#a8c3dc" />
      <Starfield count={starCount} />
      <OrbitalPaths date={date} />
      <SunBody />
      {planetObjects.map((object) => <PlanetBody key={object.id} object={object} />)}
      <CameraRig controlsRef={controlsRef} focusOnSelect={focusOnSelect} resetVersion={resetVersion} />
      <OrbitControls ref={controlsRef} makeDefault target={initialTarget} enablePan enableZoom enableRotate minDistance={1.2} maxDistance={42} zoomSpeed={0.7} rotateSpeed={0.52} panSpeed={0.55} dampingFactor={0.08} enableDamping />
      <TimeAdvancer />
    </>
  );
}

function graphicsStarCount(mode: string): number {
  if (mode === 'low') return 240;
  if (mode === 'medium') return 560;
  if (mode === 'high') return 1_050;
  if (mode === 'ultra') return 1_700;
  return typeof navigator !== 'undefined' && ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4) <= 4 ? 360 : 760;
}

export function UniverseCanvas({
  className = '',
  focusOnSelect = true,
  showNote = false,
  interactive = true
}: {
  className?: string;
  focusOnSelect?: boolean;
  showNote?: boolean;
  interactive?: boolean;
}) {
  const graphicsMode = useExplorerStore((state) => state.graphicsMode);
  const starCount = useMemo(() => graphicsStarCount(graphicsMode), [graphicsMode]);

  return (
    <div className={`universe-canvas ${className}`} aria-label="Interactive 3D model of the Solar System">
      <Canvas
        dpr={graphicsMode === 'ultra' ? [1, 2] : graphicsMode === 'high' ? [1, 1.7] : [1, 1.25]}
        camera={{ position: [0, 8.6, 17.5], fov: 43, near: 0.1, far: 180 }}
        gl={{ antialias: graphicsMode !== 'low', alpha: false, powerPreference: 'high-performance' }}
        fallback={<div className="webgl-fallback">3D graphics are unavailable in this browser. Use the object list to explore the catalog.</div>}
        aria-label="Solar System 3D canvas"
      >
        <Suspense fallback={null}>
          <SolarScene focusOnSelect={focusOnSelect && interactive} starCount={starCount} />
        </Suspense>
      </Canvas>
      {showNote && <div className="scene-model-note"><span className="note-dot" />Schematic scale · {ORBIT_MODEL_NOTE.split('.')[0]}.</div>}
    </div>
  );
}
