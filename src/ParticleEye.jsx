
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertex = `
  uniform float uTime;
  uniform float uAssembly;
  uniform float uEnter;
  uniform float uDpr;

  attribute vec3 aOrigin;
  attribute float aSeed;
  attribute float aRadius;
  attribute float aShade;

  varying float vSeed;
  varying float vRadius;
  varying float vShade;

  void main() {
    vec3 p = position;

    float r = length(p.xy);
    float a = atan(p.y, p.x);

    a += uTime * 0.012;
    a += sin(r * 3.0 + uTime * 0.4) * 0.025;

    r += sin(
      a * 53.0 + r * 7.0 + uTime * 0.8
    ) * 0.025;

    p.xy = vec2(cos(a), sin(a)) * r;

    p.z += sin(
      a * 18.0 + r * 7.0 + uTime
    ) * 0.035;

    vec3 start = aOrigin;

    float spin = (1.0 - uAssembly) * 4.0;

    mat2 rotation = mat2(
      cos(spin), -sin(spin),
      sin(spin), cos(spin)
    );

    start.xy = rotation * start.xy;

    p = mix(start, p, uAssembly);

    p.xy *= 1.0 + uEnter * 0.35;
    p.z -= uEnter * 0.8;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);

    gl_Position = projectionMatrix * mv;

    gl_PointSize = clamp(
      (6.0 + aSeed * 7.0) *
      uDpr / max(0.6, -mv.z),
      0.6,
      2.2 * uDpr
    );

    vSeed = aSeed;
    vRadius = aRadius;
    vShade = aShade;
  }
`;

const fragment = `
  uniform float uEnter;

  varying float vSeed;
  varying float vRadius;
  varying float vShade;

  void main() {
    float d = length(gl_PointCoord - 0.5);

    if (d > 0.5) discard;

    float shape = 1.0 -
      smoothstep(0.08, 0.5, d);

    vec3 deep = vec3(0.13, 0.045, 0.018);
    vec3 gold = vec3(0.76, 0.36, 0.12);
    vec3 cream = vec3(0.95, 0.78, 0.53);

    vec3 color = mix(
      deep,
      gold,
      vShade
    );

    color = mix(
      color,
      cream,
      pow(vShade, 5.0) * 0.65
    );

    float inner = smoothstep(
      0.65, 0.83, vRadius
    );

    float outer = 1.0 - smoothstep(
      2.05, 2.45, vRadius
    );

    float alpha =
      shape *
      inner *
      outer *
      (0.3 + vSeed * 0.5);

    gl_FragColor = vec4(
      color,
      alpha * (1.0 - uEnter * 0.4)
    );
  }
`;

export default function ParticleEye({
  onEnter,
  entering = false,
  mobile = false,
  reducedMotion = false,
}) {
  const group = useRef();
  const material = useRef();

  const data = useMemo(() => {
    const count = mobile ? 26000 : 95000;

    const positions = new Float32Array(count * 3);
    const origins = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const radii = new Float32Array(count);
    const shades = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;

      const inner =
        0.73 + Math.sin(a * 7.0) * 0.035;

      const r =
        inner + Math.random() * (2.45 - inner);

      const fibers =
        Math.sin(
          a * 190 +
          Math.sin(r * 8) * 3 +
          Math.sin(a * 23) * 2
        );

      const finer =
        Math.sin(
          a * 370 + r * 14
        );

      const shade = THREE.MathUtils.clamp(
        0.43 +
        fibers * 0.27 +
        finer * 0.1 +
        Math.random() * 0.22,
        0,
        1
      );

      const depth =
        Math.sqrt(
          Math.max(0, 7 - r * r)
        ) * 0.23 +
        fibers * 0.025;

      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = Math.sin(a) * r;
      positions[i * 3 + 2] = depth;

      const scatter = 3 + Math.random() * 12;

      origins[i * 3] =
        Math.cos(a) * scatter;

      origins[i * 3 + 1] =
        Math.sin(a) * scatter;

      origins[i * 3 + 2] =
        (Math.random() - 0.5) * 12;

      seeds[i] = Math.random();
      radii[i] = r;
      shades[i] = shade;
    }

    return {
      positions,
      origins,
      seeds,
      radii,
      shades,
    };
  }, [mobile]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uAssembly: { value: 0 },
    uEnter: { value: 0 },
    uDpr: { value: 1 },
  }), []);

  useFrame((state, delta) => {
    if (!material.current || !group.current) return;

    const u = material.current.uniforms;

    if (!reducedMotion) {
      u.uTime.value += Math.min(delta, 0.05);
    }

    u.uAssembly.value = reducedMotion
      ? 1
      : THREE.MathUtils.damp(
          u.uAssembly.value, 1, 1.4, delta
        );

    u.uEnter.value = reducedMotion
      ? Number(entering)
      : THREE.MathUtils.damp(
          u.uEnter.value,
          entering ? 1 : 0,
          2.8,
          delta
        );

    u.uDpr.value = state.gl.getPixelRatio();

    group.current.rotation.y =
      THREE.MathUtils.damp(
        group.current.rotation.y,
        entering || reducedMotion
          ? 0
          : state.pointer.x * 0.13,
        3,
        delta
      );

    group.current.rotation.x =
      THREE.MathUtils.damp(
        group.current.rotation.x,
        entering || reducedMotion
          ? 0
          : -state.pointer.y * 0.1,
        3,
        delta
      );
  });

  return (
    <group ref={group} position={[0, 1.55, 0]}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[data.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-aOrigin"
            args={[data.origins, 3]}
          />
          <bufferAttribute
            attach="attributes-aSeed"
            args={[data.seeds, 1]}
          />
          <bufferAttribute
            attach="attributes-aRadius"
            args={[data.radii, 1]}
          />
          <bufferAttribute
            attach="attributes-aShade"
            args={[data.shades, 1]}
          />
        </bufferGeometry>

        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          vertexShader={vertex}
          fragmentShader={fragment}
          transparent
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </points>

      <mesh
        position={[0, 0, 0.75]}
        onClick={(event) => {
          event.stopPropagation();
          if (!entering) onEnter?.();
        }}
      >
        <circleGeometry args={[2.5, 96]} />

        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
          colorWrite={false}
        />
      </mesh>
    </group>
  );
}
