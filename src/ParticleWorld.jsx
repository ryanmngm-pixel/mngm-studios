
import {
  Component,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
  uniform float uTime;
  uniform float uMorph;
  uniform float uVisibility;
  uniform float uDpr;
  uniform vec2 uPointer;

  attribute vec3 aField;
  attribute float aSeed;
  attribute float aRadius;
  attribute float aAngle;

  varying float vSeed;
  varying float vFade;
  varying float vMorph;
  varying float vLight;

  void main() {
    float radius = aRadius;

    float angle =
      aAngle +
      uTime * (0.045 + 0.1 / (radius + 0.5));

    angle += sin(radius * 2.5 + uTime * 0.2) * 0.12;

    vec3 vortex = vec3(
      cos(angle) * radius,
      sin(angle) * radius * 0.8,
      position.z +
      sin(angle * 3.0 + radius * 2.0) * 0.3
    );

    vortex.x += 2.2;
    vortex.y += 0.3;

    vortex.xy += uPointer * (0.12 + aSeed * 0.2);

    float x = aField.x;
    float z = aField.z;

    float wave =
      sin(x * 0.48 + z * 0.22 + uTime * 0.3)
      * 0.62;

    wave +=
      sin(x * 0.21 - z * 0.47 - uTime * 0.17)
      * 0.58;

    wave +=
      cos(x * 0.85 + z * 0.31 + uTime * 0.12)
      * 0.16;

    wave +=
      sin(x * 0.13 + z * 0.19)
      * 0.4;

    vec3 field = vec3(
      x,
      -3.7 + wave + aField.y,
      z - 6.0
    );

    field.y += uPointer.y * 0.12;

    float blend = smoothstep(0.0, 1.0, uMorph);

    vec3 p = mix(vortex, field, blend);

    vec4 mv =
      modelViewMatrix * vec4(p, 1.0);

    gl_Position = projectionMatrix * mv;

    gl_PointSize = clamp(
      (6.0 + aSeed * 9.0) *
      uDpr / max(1.0, -mv.z),
      0.45,
      2.1 * uDpr
    );

    float edge =
      1.0 - smoothstep(3.0, 5.0, radius);

    float distanceFade =
      1.0 - smoothstep(16.0, 34.0, -mv.z);

    vSeed = aSeed;
    vMorph = blend;

    vLight =
      clamp(0.45 + wave * 0.16, 0.1, 0.85);

    vFade =
      mix(edge, distanceFade, blend) *
      uVisibility;
  }
`;

const fragmentShader = `
  varying float vSeed;
  varying float vFade;
  varying float vMorph;
  varying float vLight;

  void main() {
    float d =
      length(gl_PointCoord - vec2(0.5));

    if (d > 0.5) discard;

    float shape =
      1.0 - smoothstep(0.06, 0.5, d);

    vec3 coral = vec3(1.0, 0.37, 0.20);
    vec3 amber = vec3(0.61, 0.24, 0.12);
    vec3 silver = vec3(0.68, 0.66, 0.63);

    vec3 vortexColor =
      mix(amber, coral, vSeed);

    vortexColor = mix(
      vortexColor,
      vec3(1.0, 0.78, 0.62),
      pow(vSeed, 9.0) * 0.75
    );

    vec3 waveColor =
      mix(silver, coral, smoothstep(
        0.4, 0.95, vSeed
      ));

    waveColor *= 0.5 + vLight * 0.6;

    vec3 color =
      mix(vortexColor, waveColor, vMorph);

    float opacity =
      mix(0.55, 0.32, vMorph);

    gl_FragColor = vec4(
      color,
      shape * vFade *
      opacity * (0.35 + vSeed * 0.65)
    );
  }
`;

function ParticleField({
  mobile,
  pointer,
  scroll,
}) {
  const material = useRef();
  const group = useRef();

  const data = useMemo(() => {
    const count = mobile ? 28000 : 100000;

    const positions = new Float32Array(count * 3);
    const fields = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const radii = new Float32Array(count);
    const angles = new Float32Array(count);

    let seed = 420;

    const random = () => {
      seed =
        (Math.imul(seed, 1664525) + 1013904223) >>> 0;

      return seed / 4294967296;
    };

    for (let i = 0; i < count; i++) {
      const radius =
        0.65 + Math.pow(random(), 1.45) * 4.6;

      const arm =
        Math.floor(random() * 6);

      const angle =
        arm * Math.PI * 2 / 6 +
        radius * 1.45 +
        (random() - 0.5) * 1.2;

      positions[i * 3] =
        Math.cos(angle) * radius;

      positions[i * 3 + 1] =
        Math.sin(angle) * radius;

      positions[i * 3 + 2] =
        (random() - 0.5) * 0.8;

      fields[i * 3] =
        (random() - 0.5) * 39;

      fields[i * 3 + 1] =
        (random() - 0.5) * 0.12;

      fields[i * 3 + 2] =
        random() * -22 + 13;

      seeds[i] = random();
      radii[i] = radius;
      angles[i] = angle;
    }

    return {
      positions,
      fields,
      seeds,
      radii,
      angles,
    };
  }, [mobile]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMorph: { value: 0 },
    uVisibility: { value: 1 },
    uDpr: { value: 1 },
    uPointer: { value: new THREE.Vector2() },
  }), []);

  useFrame((state, delta) => {
    if (!material.current) return;

    const dt = Math.min(delta, 0.05);
    const u = material.current.uniforms;

    u.uTime.value += dt;
    u.uDpr.value = state.gl.getPixelRatio();

    u.uMorph.value = THREE.MathUtils.damp(
      u.uMorph.value,
      scroll.current.morph,
      2.8,
      dt
    );

    u.uVisibility.value = THREE.MathUtils.damp(
      u.uVisibility.value,
      scroll.current.visibility,
      3,
      dt
    );

    u.uPointer.value.x = THREE.MathUtils.damp(
      u.uPointer.value.x,
      pointer.current.x,
      3,
      dt
    );

    u.uPointer.value.y = THREE.MathUtils.damp(
      u.uPointer.value.y,
      pointer.current.y,
      3,
      dt
    );

    if (group.current) {
      group.current.rotation.x =
        u.uMorph.value * -0.12;

      group.current.rotation.z =
        (1 - u.uMorph.value) * -0.15;

      group.current.position.x =
        mobile ? -2.2 * (1 - u.uMorph.value) : 0;

      group.current.position.y =
        mobile ? 2.2 * (1 - u.uMorph.value) : 0;
    }
  });

  return (
    <group ref={group}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[data.positions, 3]}
          />

          <bufferAttribute
            attach="attributes-aField"
            args={[data.fields, 3]}
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
            attach="attributes-aAngle"
            args={[data.angles, 1]}
          />
        </bufferGeometry>

        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
    </group>
  );
}

class GraphicsBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.warn("Particle graphics unavailable:", error);
  }

  render() {
    return this.state.failed
      ? null
      : this.props.children;
  }
}

export default function ParticleWorld() {
  const pointer = useRef({ x: 0, y: 0 });

  const scroll = useRef({
    morph: 0,
    visibility: 1,
  });

  const [mobile, setMobile] = useState(
    () => window.innerWidth < 768
  );

  const [reduced, setReduced] = useState(
    () => window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
  );

  const [visible, setVisible] = useState(
    () => !document.hidden
  );

  useEffect(() => {
    const media = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    let frame = 0;

    const sectionOpacity = [
      ["work", 0.4],
      ["services", 1],
      ["investment", 0.23],
      ["contact", 0.6],
    ].map(([id, opacity]) => ({
      element: document.getElementById(id),
      opacity,
    }));

    const resetPointer = () => {
      pointer.current.x = 0;
      pointer.current.y = 0;
    };

    const updatePointer = (event) => {
      if (event.pointerType !== "mouse") return;

      pointer.current.x =
        event.clientX / window.innerWidth * 2 - 1;

      pointer.current.y =
        -(event.clientY / window.innerHeight * 2 - 1);
    };

    const updateScroll = () => {
      const height = Math.max(window.innerHeight, 1);
      const center = height * 0.5;
      const y = window.scrollY;
      const { clamp, lerp, smoothstep } = THREE.MathUtils;

      scroll.current.morph = clamp(y / (height * 1.25), 0, 1);
      let visibility = lerp(1, 0.85, smoothstep(y, height * 0.6, height));

      for (const { element, opacity } of sectionOpacity) {
        if (!element) continue;

        const { top, bottom } = element.getBoundingClientRect();
        const depth = Math.min(center - top, bottom - center);
        const blend = smoothstep(depth, 0, height * 0.2);
        visibility = lerp(visibility, opacity, blend);
      }

      scroll.current.visibility = visibility;
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateScroll);
    };

    const resize = () => {
      setMobile(window.innerWidth < 768);
      onScroll();
    };

    const motionChanged = () => {
      setReduced(media.matches);
    };

    const visibilityChanged = () => {
      setVisible(!document.hidden);
    };

    window.addEventListener(
      "pointermove",
      updatePointer
    );

    document.documentElement.addEventListener("pointerleave", resetPointer);
    window.addEventListener("blur", resetPointer);
    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    window.addEventListener("resize", resize);

    document.addEventListener(
      "visibilitychange",
      visibilityChanged
    );

    media.addEventListener("change", motionChanged);

    updateScroll();

    return () => {
      cancelAnimationFrame(frame);

      window.removeEventListener(
        "pointermove",
        updatePointer
      );

      document.documentElement.removeEventListener("pointerleave", resetPointer);
      window.removeEventListener("blur", resetPointer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);

      document.removeEventListener(
        "visibilitychange",
        visibilityChanged
      );

      media.removeEventListener("change", motionChanged);
    };
  }, []);

  return (
    <div className="m-particle-world" aria-hidden="true">
      <div className="m-particle-ambient" />

      {!reduced && (
        <GraphicsBoundary>
          <Canvas
            dpr={[1, mobile ? 1.15 : 1.5]}
            frameloop={visible ? "always" : "never"}
            camera={{
              position: [0, 0, mobile ? 13 : 11],
              fov: 48,
              near: 0.1,
              far: 100,
            }}
            gl={{
              alpha: true,
              antialias: false,
              powerPreference: "high-performance",
            }}
            fallback={null}
          >
            <ParticleField
              mobile={mobile}
              pointer={pointer}
              scroll={scroll}
            />
          </Canvas>
        </GraphicsBoundary>
      )}

      <div className="m-particle-vignette" />
    </div>
  );
}
