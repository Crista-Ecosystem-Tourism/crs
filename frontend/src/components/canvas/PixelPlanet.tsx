import { useRef, useMemo, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
    PerspectiveCamera,
    Instance,
    Instances,
} from '@react-three/drei'
import * as THREE from 'three'

// --- Constants (optimized for 60 FPS) ---
const BLOCKS_WIDE = 30;
const BLOCKS_DEEP = 30;
const MOVEMENT_SPEED = 4.317;
const ROTATION_SPEED = 15;
const WORLD_SEED = 12345;

// --- Seeded PRNG (Mulberry32) ---
function mulberry32(a: number) {
    return function () {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

// --- Simplex Noise Helper ---
export function noise2D(x: number, z: number) {
    return Math.sin(x * 0.1) * Math.cos(z * 0.1) * 3 + Math.sin(x * 0.3 + z * 0.2) * 1;
}

// --- Texture Generation ---
const useMinecraftTextures = () => {
    return useMemo(() => {
        const prng = mulberry32(WORLD_SEED);

        const createTexture = (baseColor: string, noiseAmt: number, type: 'basic' | 'stone' | 'grass' | 'leaves' | 'diamond' | 'gold') => {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d')!;
            ctx.fillStyle = baseColor;
            ctx.fillRect(0, 0, 64, 64);

            for (let y = 0; y < 16; y++) {
                for (let x = 0; x < 16; x++) {
                    const n = prng();
                    if (n < noiseAmt) {
                        ctx.fillStyle = prng() > 0.5 ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
                        ctx.fillRect(x * 4, y * 4, 4, 4);
                    }

                    if (type === 'diamond' && prng() < 0.05) {
                        ctx.fillStyle = '#00ffff';
                        ctx.fillRect(x * 4, y * 4, 4, 4);
                    }
                    if (type === 'gold' && prng() < 0.05) {
                        ctx.fillStyle = '#ffaa00';
                        ctx.fillRect(x * 4, y * 4, 4, 4);
                    }
                    if (type === 'leaves' && prng() < 0.2) {
                        ctx.fillStyle = 'rgba(0,0,0,0.2)';
                        ctx.fillRect(x * 4, y * 4, 2, 2);
                    }
                }
            }
            if (type === 'grass') {
                for (let i = 0; i < 10; i++) {
                    const gx = Math.floor(prng() * 16) * 4;
                    const gy = Math.floor(prng() * 16) * 4;
                    ctx.fillStyle = 'rgba(50, 255, 50, 0.1)';
                    ctx.fillRect(gx, gy, 4, 4);
                }
            }

            const tex = new THREE.CanvasTexture(canvas);
            tex.magFilter = THREE.NearestFilter;
            tex.minFilter = THREE.NearestFilter;
            tex.colorSpace = THREE.SRGBColorSpace;
            return tex;
        }

        return {
            grassTop: createTexture('#5b9c46', 0.15, 'grass'),
            dirt: createTexture('#755331', 0.2, 'basic'),
            stone: createTexture('#7d7d7d', 0.15, 'stone'),
            leaves: createTexture('#4c803a', 0.1, 'leaves'),
            wood: createTexture('#5c4033', 0.1, 'basic'),
            steveSkin: createTexture('#d4a17c', 0.05, 'basic'),
            steveShirt: createTexture('#00cccc', 0.1, 'basic'),
            stevePants: createTexture('#333399', 0.1, 'basic'),
        };
    }, []);
};

// --- Shaders ---
const waterVertexShader = `
  varying vec2 vUv;
  uniform float uTime;
  void main() {
    vUv = uv;
    vec3 pos = position;
    float wave = sin(pos.x * 0.5 + uTime) * 0.1 + cos(pos.z * 0.3 + uTime * 0.8) * 0.1;
    pos.y += wave;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const waterFragmentShader = `
  varying vec2 vUv;
  void main() {
    gl_FragColor = vec4(0.2, 0.4, 0.9, 0.5);
  }
`;

// --- Components ---

const Water = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (meshRef.current) {
            (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.1, 0]}>
            <planeGeometry args={[80, 80, 16, 16]} />
            <shaderMaterial
                vertexShader={waterVertexShader}
                fragmentShader={waterFragmentShader}
                uniforms={uniforms}
                transparent
                depthWrite={false}
            />
        </mesh>
    );
};

const Steve = ({ target }: { target: THREE.Vector3 }) => {
    const group = useRef<THREE.Group>(null);
    const isMovingRef = useRef(false);

    const leftArm = useRef<THREE.Group>(null);
    const rightArm = useRef<THREE.Group>(null);
    const leftLeg = useRef<THREE.Group>(null);
    const rightLeg = useRef<THREE.Group>(null);

    const textures = useMinecraftTextures();
    const animTime = useRef(0);

    const matSkin = useMemo(() => new THREE.MeshStandardMaterial({ map: textures.steveSkin }), [textures]);
    const matShirt = useMemo(() => new THREE.MeshStandardMaterial({ map: textures.steveShirt }), [textures]);
    const matPants = useMemo(() => new THREE.MeshStandardMaterial({ map: textures.stevePants }), [textures]);

    useFrame((state, delta) => {
        if (!group.current) return;

        const currentPos = group.current.position;
        const diffX = target.x - currentPos.x;
        const diffZ = target.z - currentPos.z;
        const dist = Math.sqrt(diffX * diffX + diffZ * diffZ);

        if (dist > 0.1) {
            isMovingRef.current = true;
            animTime.current += delta * 15;

            const angle = Math.atan2(diffX, diffZ);
            const targetQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
            group.current.quaternion.slerp(targetQuat, delta * ROTATION_SPEED);

            const moveStep = Math.min(MOVEMENT_SPEED * delta, dist);
            group.current.position.x += Math.sin(angle) * moveStep;
            group.current.position.z += Math.cos(angle) * moveStep;

        } else {
            isMovingRef.current = false;
            animTime.current = 0;
        }

        const groundHeight = Math.floor(noise2D(group.current.position.x, group.current.position.z));
        const targetY = groundHeight + 1;

        group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, targetY, delta * 10);

        const swing = isMovingRef.current ? Math.sin(animTime.current) : 0;
        const armSwingRange = 0.8;
        const legSwingRange = 0.8;

        if (leftArm.current) leftArm.current.rotation.x = -swing * armSwingRange;
        if (rightArm.current) rightArm.current.rotation.x = swing * armSwingRange;
        if (leftLeg.current) leftLeg.current.rotation.x = swing * legSwingRange;
        if (rightLeg.current) rightLeg.current.rotation.x = -swing * legSwingRange;

        const bobOffset = isMovingRef.current ? Math.sin(animTime.current * 2) * 0.15 : 0;

        state.camera.position.lerp(
            new THREE.Vector3(group.current.position.x + 12, group.current.position.y + 12, group.current.position.z + 12),
            0.05
        );
        state.camera.lookAt(group.current.position.x, group.current.position.y + 2, group.current.position.z);
        state.camera.position.y += bobOffset * 0.1;
    });

    return (
        <group ref={group} position={[0, 1, 0]}>
            <mesh position={[0, 1.5, 0]} castShadow>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <primitive object={matSkin} attach="material" />
            </mesh>
            <mesh position={[0, 0.75, 0]} castShadow>
                <boxGeometry args={[0.5, 0.75, 0.25]} />
                <primitive object={matShirt} attach="material" />
            </mesh>
            <group ref={leftArm} position={[-0.38, 1.1, 0]}>
                <mesh position={[0, -0.375, 0]} castShadow>
                    <boxGeometry args={[0.25, 0.75, 0.25]} />
                    <primitive object={matShirt} attach="material" />
                </mesh>
            </group>
            <group ref={rightArm} position={[0.38, 1.1, 0]}>
                <mesh position={[0, -0.375, 0]} castShadow>
                    <boxGeometry args={[0.25, 0.75, 0.25]} />
                    <primitive object={matShirt} attach="material" />
                </mesh>
            </group>
            <group ref={leftLeg} position={[-0.13, 0.375, 0]}>
                <mesh position={[0, -0.375, 0]} castShadow>
                    <boxGeometry args={[0.25, 0.75, 0.25]} />
                    <primitive object={matPants} attach="material" />
                </mesh>
            </group>
            <group ref={rightLeg} position={[0.13, 0.375, 0]}>
                <mesh position={[0, -0.375, 0]} castShadow>
                    <boxGeometry args={[0.25, 0.75, 0.25]} />
                    <primitive object={matPants} attach="material" />
                </mesh>
            </group>
        </group>
    );
};

const Terrain = () => {
    const textures = useMinecraftTextures();

    // Procedural Generation with Seed (optimized: reduced depth)
    const blocksByType = useMemo(() => {
        const prng = mulberry32(WORLD_SEED);

        const grass: number[][] = [];
        const dirt: number[][] = [];
        const stone: number[][] = [];
        const wood: number[][] = [];
        const leaves: number[][] = [];

        for (let x = -BLOCKS_WIDE / 2; x < BLOCKS_WIDE / 2; x++) {
            for (let z = -BLOCKS_DEEP / 2; z < BLOCKS_DEEP / 2; z++) {

                const surfaceY = Math.floor(noise2D(x, z));

                // Reduced depth: -5 instead of -10
                for (let y = surfaceY; y >= -5; y--) {

                    const caveNoise = Math.sin(x * 0.3 + y * 0.5) * Math.cos(z * 0.3 + y * 0.2);
                    const isCave = y < 0 && Math.abs(caveNoise) < 0.2;

                    if (isCave) continue;

                    if (y === surfaceY) {
                        grass.push([x, y, z]);
                        // Deterministic Tree Placement
                        if (prng() < 0.015) {
                            wood.push([x, y + 1, z]);
                            wood.push([x, y + 2, z]);
                            wood.push([x, y + 3, z]);
                            for (let lx = -2; lx <= 2; lx++)
                                for (let lz = -2; lz <= 2; lz++)
                                    for (let ly = 3; ly <= 4; ly++)
                                        if (Math.abs(lx) + Math.abs(lz) < 3) leaves.push([x + lx, y + ly, z + lz]);
                            leaves.push([x, y + 5, z]);
                        }
                    } else if (y >= surfaceY - 2) {
                        dirt.push([x, y, z]);
                    } else {
                        stone.push([x, y, z]);
                    }
                }
            }
        }
        return { grass, dirt, stone, wood, leaves };
    }, []);

    return (
        <group>
            <Instances range={2000} receiveShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial map={textures.grassTop} />
                {blocksByType.grass.map((pos, i) => (
                    <Instance key={i} position={pos as [number, number, number]} />
                ))}
            </Instances>

            <Instances range={5000} receiveShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial map={textures.stone} />
                {blocksByType.stone.map((pos, i) => (
                    <Instance key={i} position={pos as [number, number, number]} />
                ))}
            </Instances>

            <Instances range={3000} receiveShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial map={textures.dirt} />
                {blocksByType.dirt.map((pos, i) => (
                    <Instance key={i} position={pos as [number, number, number]} />
                ))}
            </Instances>

            <Instances range={500} receiveShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial map={textures.wood} />
                {blocksByType.wood.map((pos, i) => (
                    <Instance key={i} position={pos as [number, number, number]} />
                ))}
            </Instances>

            <Instances range={2000} receiveShadow>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial map={textures.leaves} transparent alphaTest={0.5} />
                {blocksByType.leaves.map((pos, i) => (
                    <Instance key={i} position={pos as [number, number, number]} />
                ))}
            </Instances>

            <Water />
        </group>
    );
};

const Sun = () => {
    return (
        <group position={[-30, 40, 30]}>
            <mesh>
                <boxGeometry args={[12, 12, 12]} />
                <meshBasicMaterial color="#ffffee" />
            </mesh>
        </group>
    );
}

const Clouds = () => {
    // Optimized: reduced from 20 to 10 clouds
    const clouds = useMemo(() => {
        const prng = mulberry32(WORLD_SEED + 100);
        return Array.from({ length: 10 }).map(() => ({
            pos: [(prng() - 0.5) * 80, (prng() - 0.5) * 5, (prng() - 0.5) * 80],
            args: [10 + prng() * 10, 2, 5 + prng() * 5]
        }));
    }, []);

    return (
        <group position={[0, 25, 0]}>
            {clouds.map((data, i) => (
                <mesh key={i} position={data.pos as [number, number, number]}>
                    <boxGeometry args={data.args as [number, number, number]} />
                    <meshBasicMaterial color="white" transparent opacity={0.6} />
                </mesh>
            ))}
        </group>
    )
}

// Hook for keyboard controls
function useKeyboardControls() {
    const keys = useRef({ up: false, down: false, left: false, right: false });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.code) {
                case 'ArrowUp':
                case 'KeyW':
                    keys.current.up = true;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    keys.current.down = true;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    keys.current.left = true;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    keys.current.right = true;
                    break;
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            switch (e.code) {
                case 'ArrowUp':
                case 'KeyW':
                    keys.current.up = false;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    keys.current.down = false;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    keys.current.left = false;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    keys.current.right = false;
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    return keys;
}

// Component to handle keyboard movement inside Canvas
function KeyboardController({ targetRef }: { targetRef: React.MutableRefObject<THREE.Vector3> }) {
    const keys = useKeyboardControls();
    const MOVE_SPEED = 0.3;

    useFrame(() => {
        let dx = 0;
        let dz = 0;

        if (keys.current.up) dz -= MOVE_SPEED;
        if (keys.current.down) dz += MOVE_SPEED;
        if (keys.current.left) dx -= MOVE_SPEED;
        if (keys.current.right) dx += MOVE_SPEED;

        if (dx !== 0 || dz !== 0) {
            targetRef.current.x += dx;
            targetRef.current.z += dz;
        }
    });

    return null;
}

export default function PixelPlanet() {
    const targetRef = useRef(new THREE.Vector3(0, 0, 0));
    const [, forceUpdate] = useState(0);

    // Force re-render periodically to sync target with Steve
    useEffect(() => {
        const interval = setInterval(() => forceUpdate(n => n + 1), 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full min-h-[600px] bg-sky-300" tabIndex={0}>
            <Canvas shadows dpr={1} performance={{ min: 0.5 }}>
                <PerspectiveCamera makeDefault position={[20, 20, 20]} fov={45} />

                <color attach="background" args={['#88aaff']} />
                <fog attach="fog" args={['#88aaff', 20, 60]} />

                <ambientLight intensity={0.5} color="#ffffff" />
                <directionalLight
                    position={[-30, 40, 30]}
                    intensity={1.2}
                    color="#fffcd9"
                    castShadow
                    shadow-mapSize={[512, 512]}
                    shadow-bias={-0.0005}
                >
                    <orthographicCamera attach="shadow-camera" args={[-30, 30, 30, -30]} />
                </directionalLight>

                <Suspense fallback={null}>
                    <KeyboardController targetRef={targetRef} />
                    <Sun />
                    <Terrain />
                    <Steve target={targetRef.current} />
                    <Clouds />
                </Suspense>
            </Canvas>
        </div>
    );
}
