import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0); // Full screen quad
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;

  // Simplex 2D noise
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;
    float time = uTime * 0.2;

    // Organic movement
    float n1 = snoise(uv * 2.0 + vec2(time * 0.3, time * 0.1));
    float n2 = snoise(uv * 3.0 - vec2(time * 0.2, -time * 0.3));

    // Mix noise
    float fluid = n1 * 0.5 + n2 * 0.5;

    // Colors: Crista Online brand palette (teal/cyan gradient)
    // Light background base
    vec3 col = vec3(0.94, 0.97, 0.98);

    // Blobs
    // Light Cyan (#5BC4F7)
    float blob1 = smoothstep(0.2, 0.9, snoise(uv * 1.5 + vec2(time * 0.5)) + 0.1);
    col = mix(col, vec3(0.357, 0.769, 0.969), blob1 * 0.5);

    // Teal (#3BA8B8)
    float blob2 = smoothstep(0.3, 1.0, snoise(uv * 2.0 - vec2(time * 0.4)) + 0.2);
    col = mix(col, vec3(0.231, 0.659, 0.722), blob2 * 0.4);

    // Deep Teal (#1A8A9C)
    float blob3 = smoothstep(0.4, 1.1, n1 + 0.3);
    col = mix(col, vec3(0.102, 0.541, 0.612), blob3 * 0.3);

    // Soft Glow
    float glow = 1.0 - length(uv - vec2(0.5)) * 0.5;
    col += vec3(0.03, 0.05, 0.05) * glow;

    gl_FragColor = vec4(col, 1.0);
  }
`;

const LiquidPlane = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) }
    }), []);

    useFrame((state) => {
        if (meshRef.current) {
            (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                fragmentShader={fragmentShader}
                vertexShader={vertexShader}
                uniforms={uniforms}
                depthWrite={false}
                depthTest={false}
            />
        </mesh>
    );
};

export default function LiquidBackground() {
    return (
        <div className="fixed inset-0 -z-10">
            <Canvas camera={{ position: [0, 0, 1] }} dpr={[1, 1.5]}>
                <LiquidPlane />
            </Canvas>
        </div>
    );
}
