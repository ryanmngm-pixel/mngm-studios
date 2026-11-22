
import {
  useMemo,
  useRef,
} from "react";

import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

import * as THREE from "three";

import {
  clone,
} from "three/addons/utils/SkeletonUtils.js";

import {
  MeshSurfaceSampler,
} from "three/addons/math/MeshSurfaceSampler.js";

const MODEL = "/models/human.glb";

const vertex = `
  uniform float uTime;
  uniform float uHover;
  uniform float uDpr;

  attribute float aSeed;
  attribute vec3 aNormal;

  varying float vSeed;
  varying float vLight;
  varying float vHover;

  void main() {
    vec3 p = position;

    float movement =
      sin(uTime * 0.8 + p.y * 2.0);

    p.x += movement * 0.007;
    p.z += movement * 0.005;

    p += aNormal *
      sin(uTime * 1.6 + aSeed * 80.0) *
      (0.004 + uHover * 0.022);

    vec4 mv =
      modelViewMatrix * vec4(p, 1.0);

    gl_Position =
      projectionMatrix * mv;

    gl_PointSize = clamp(
      (8.0 + aSeed * 6.0) *
      uDpr / max(1.0, -mv.z),
      0.65,
      1.9 * uDpr
    );

    vec3 n = normalize(
      mat3(modelMatrix) * aNormal
    );

    vec3 light = normalize(
      vec3(-0.6, 0.8, 0.45)
    );

    vLight =
      0.18 + max(0.0, dot(n, light)) * 0.82;

    vSeed = aSeed;
    vHover = uHover;
  }
`;

const fragment = `
  uniform vec3 uColor;

  varying float vSeed;
  varying float vLight;
  varying float vHover;

  void main() {
    float d = length(
      gl_PointCoord - vec2(0.5)
    );

    if (d > 0.5) discard;

    float shape =
      1.0 - smoothstep(0.05, 0.5, d);

    vec3 shadow = uColor * 0.2;

    vec3 gold = mix(
      shadow,
      uColor,
      vLight
    );

    vec3 color = mix(
      gold,
      vec3(0.95, 0.82, 0.65),
      vLight * pow(vSeed, 4.0) * 0.45
    );

    float alpha =
      shape *
      (0.45 + vSeed * 0.4) *
      (0.8 + vHover * 0.2);

    gl_FragColor =
      vec4(color, alpha);
  }
`;

function sampleHuman(source, animations, count) {
  const model = clone(source);

  const idle = animations.find(
    (clip) => /idle/i.test(clip.name)
  );

  if (idle) {
    const mixer = new THREE.AnimationMixer(model);

    mixer.clipAction(idle).play();
    mixer.update(0.5);
  }

  model.updateMatrixWorld(true);

  const surfaces = [];

  model.traverse((object) => {
    if (!object.isMesh || !object.geometry) return;

    if (object.isSkinnedMesh) {
      object.skeleton.update();
    }

    const original = object.geometry;

    const geometry = original.clone();

    const position = geometry.attributes.position;

    const point = new THREE.Vector3();

    for (let i = 0; i < position.count; i++) {
      object.getVertexPosition(i, point);

      point.applyMatrix4(object.matrixWorld);

      position.setXYZ(
        i, point.x, point.y, point.z
      );
    }

    position.needsUpdate = true;

    geometry.computeVertexNormals();
    geometry.computeBoundingBox();

    const surface = geometry.index
      ? geometry.toNonIndexed()
      : geometry;

    if (surface !== geometry) {
      geometry.dispose();
    }

    const vertices = surface.attributes.position;

    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const c = new THREE.Vector3();

    let area = 0;

    for (let i = 0; i < vertices.count; i += 3) {
      a.fromBufferAttribute(vertices, i);
      b.fromBufferAttribute(vertices, i + 1);
      c.fromBufferAttribute(vertices, i + 2);

      area += new THREE.Triangle(
        a, b, c
      ).getArea();
    }

    if (area <= 0) {
      surface.dispose();
      return;
    }

    const mesh = new THREE.Mesh(surface);

    surfaces.push({
      area,
      geometry: surface,
      sampler: new MeshSurfaceSampler(mesh).build(),
    });
  });

  const bounds = new THREE.Box3();

  surfaces.forEach(({ geometry }) => {
    geometry.computeBoundingBox();
    bounds.union(geometry.boundingBox);
  });

  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());

  const scale = 3.05 / Math.max(size.y, 0.001);

  const totalArea = surfaces.reduce(
    (sum, item) => sum + item.area,
    0
  );

  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  const seeds = new Float32Array(count);

  const point = new THREE.Vector3();
  const normal = new THREE.Vector3();

  for (let i = 0; i < count; i++) {
    let value = Math.random() * totalArea;
    let surface = surfaces[surfaces.length - 1];

    for (const item of surfaces) {
      value -= item.area;

      if (value <= 0) {
        surface = item;
        break;
      }
    }

    surface.sampler.sample(point, normal);

    positions[i * 3] =
      (point.x - center.x) * scale;

    positions[i * 3 + 1] =
      (point.y - bounds.min.y) * scale;

    positions[i * 3 + 2] =
      (point.z - center.z) * scale;

    normals.set(
      [normal.x, normal.y, normal.z],
      i * 3
    );

    seeds[i] = Math.random();
  }

  surfaces.forEach(({ geometry }) => {
    geometry.dispose();
  });

  return { positions, normals, seeds };
}

export default function ParticleHuman({
  position = [0, 0, 0],
  count = 18000,
  color = "#cda77c",
  active = false,
  reducedMotion = false,
  onHover,
  onSelect,
}) {
  const { scene, animations } = useGLTF(MODEL);

  const material = useRef();

  const data = useMemo(
    () => sampleHuman(scene, animations, count),
    [scene, animations, count]
  );

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uHover: { value: 0 },
    uDpr: { value: 1 },
    uColor: { value: new THREE.Color(color) },
  }), [color]);

  useFrame((state, delta) => {
    if (!material.current) return;

    const u = material.current.uniforms;

    if (!reducedMotion) {
      u.uTime.value += Math.min(delta, 0.05);
    }

    u.uHover.value = reducedMotion
      ? Number(active)
      : THREE.MathUtils.damp(
          u.uHover.value,
          active ? 1 : 0,
          4,
          delta
        );

    u.uDpr.value = state.gl.getPixelRatio();
  });

  return (
    <group position={position}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[data.positions, 3]}
          />

          <bufferAttribute
            attach="attributes-aNormal"
            args={[data.normals, 3]}
          />

          <bufferAttribute
            attach="attributes-aSeed"
            args={[data.seeds, 1]}
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
        position={[0, 1.55, 0]}
        onPointerOver={(event) => {
          event.stopPropagation();
          onHover?.(true);
        }}
        onPointerOut={() => onHover?.(false)}
        onClick={(event) => {
          event.stopPropagation();
          onSelect?.();
        }}
      >
        <boxGeometry args={[1.8, 3.4, 1.5]} />

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

useGLTF.preload(MODEL);
