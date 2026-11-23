import { Component, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { LITE } from "./site";

/*
  One particle body travels with the visitor through the page.
  Each homepage section has its own form; scrolling morphs between them,
  the cursor pushes particles aside, and a click sends a ripple outward.

  Shapes: 0 vortex, 1 planet, 2 wave field, 3 knot, 4 helix, 5 starfield, 6 portal
*/

const HOME_SEQUENCE = [
  // section id, shape, brightness
  ["top", 0, 1],
  ["studio", 1, 1.35],
  ["work", 2, 0.5],
  ["services", 3, 1.8],
  ["process", 4, 1.4],
  ["investment", 5, 0.9],
  ["contact", 6, 1.1],
];

const PAGE_SEQUENCE = [
  [null, 0, 1],
  [null, 2, 0.7],
];

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uFrom;
  uniform float uTo;
  uniform float uMix;
  uniform float uSpin;
  uniform float uDpr;
  uniform float uMobile;
  uniform float uAspect;
  uniform float uVelocity;
  uniform float uVisibility;
  uniform float uBoost;
  uniform vec2 uMouse;
  uniform vec2 uMouseVel;
  uniform float uMouseActive;
  uniform vec2 uPulseOrigin;
  uniform float uPulse;

  attribute vec3 aField;
  attribute vec3 aRand;
  attribute float aSeed;
  attribute float aRadius;
  attribute float aAngle;

  varying float vSeed;
  varying float vFade;
  varying float vSilver;
  varying float vLight;
  varying float vGlow;

  const float TAU = 6.2831853;

  mat2 rot(float a) {
    float c = cos(a);
    float s = sin(a);
    return mat2(c, -s, s, c);
  }

  vec3 jitter() {
    return vec3(fract(aSeed * 13.17), fract(aSeed * 7.31), fract(aSeed * 3.77)) - 0.5;
  }

  vec3 vortex() {
    float radius = aRadius;
    float angle = aAngle + uTime * (0.045 + 0.1 / (radius + 0.5));
    angle += sin(radius * 2.5 + uTime * 0.2) * 0.12;

    vec3 p = vec3(
      cos(angle) * radius,
      sin(angle) * radius * 0.8,
      position.z + sin(angle * 3.0 + radius * 2.0) * 0.3
    );

    p.xy = rot(-0.15) * p.xy;
    p.yz = rot(-0.1) * p.yz;
    p += mix(vec3(2.2, 0.3, 0.0), vec3(0.0, 2.5, 0.0), uMobile);
    return p;
  }

  vec3 planet() {
    vec3 p;
    if (aRand.z < 0.7) {
      float th = aRand.x * TAU;
      float ph = acos(2.0 * aRand.y - 1.0);
      float r = 2.25 + sin(th * 5.0 + ph * 4.0 + uTime * 0.5) * 0.06 + jitter().x * 0.06;
      p = vec3(sin(ph) * cos(th), cos(ph), sin(ph) * sin(th)) * r;
      p.xz = rot(uSpin * 0.7) * p.xz;
    } else {
      float a = aRand.x * TAU + uTime * (0.08 + aRand.y * 0.08);
      float r = 3.0 + pow(aRand.y, 1.6) * 1.6;
      p = vec3(cos(a) * r, jitter().y * 0.06, sin(a) * r);
    }
    p.yz = rot(0.38) * p.yz;
    p.xy = rot(-0.28) * p.xy;
    p *= mix(1.0, 0.72, uMobile);
    return p + mix(vec3(3.2, -0.2, -1.0), vec3(0.0, 2.6, -1.0), uMobile);
  }

  vec3 field() {
    float x = aField.x;
    float z = aField.z;
    float wave = sin(x * 0.48 + z * 0.22 + uTime * 0.3) * 0.62;
    wave += sin(x * 0.21 - z * 0.47 - uTime * 0.17) * 0.58;
    wave += cos(x * 0.85 + z * 0.31 + uTime * 0.12) * 0.16;
    wave += sin(x * 0.13 + z * 0.19) * 0.4;
    vLight = clamp(0.45 + wave * 0.16, 0.1, 0.85);
    return vec3(x, -3.7 + wave + aField.y, z - 6.0);
  }

  vec3 knot() {
    float t = aRand.x * TAU;
    float r = cos(3.0 * t) + 2.2;
    vec3 p = vec3(r * cos(2.0 * t), r * sin(2.0 * t), -sin(3.0 * t) * 1.2);
    float ta = aRand.y * TAU;
    float tr = 0.34 * sqrt(aRand.z);
    p += vec3(cos(ta), sin(ta), sin(ta + 1.7)) * tr;
    p *= 0.88;
    p.xz = rot(uSpin * 0.8) * p.xz;
    p.yz = rot(0.55 + sin(uTime * 0.1) * 0.15) * p.yz;
    p *= mix(1.0, 0.68, uMobile);
    return p + mix(vec3(-3.0, -0.4, 0.0), vec3(0.0, 2.4, -1.5), uMobile);
  }

  vec3 helix() {
    float len = mix(19.0, 9.0, uMobile);
    float rad = mix(1.35, 0.95, uMobile);
    float twist = 18.0;
    float phase = uTime * 0.35 + uSpin;
    vec3 p;

    if (aRand.z < 0.8) {
      float t = aRand.x;
      float a = t * twist + step(0.5, aRand.y) * 3.14159 + phase;
      p = vec3((t - 0.5) * len, cos(a) * rad, sin(a) * rad) + jitter() * 0.22;
    } else {
      float rung = (floor(aRand.x * 38.0) + 0.5) / 38.0;
      float a = rung * twist + phase;
      float u = aRand.y * 2.0 - 1.0;
      p = vec3((rung - 0.5) * len, cos(a) * rad * u, sin(a) * rad * u) + jitter() * 0.05;
    }

    p.xy = rot(0.08) * p.xy;
    return p + mix(vec3(0.0, -2.0, -1.5), vec3(0.0, 2.4, -1.5), uMobile);
  }

  vec3 starfield() {
    float depth = mod(aRand.z * 44.0 + uTime * 0.9, 44.0);
    return vec3(aField.x * 0.8, (aRand.y - 0.5) * 18.0, 8.0 - depth);
  }

  vec3 portal() {
    float a = aAngle + uTime * (0.06 + 0.22 / (aRadius + 0.5));
    float r = 1.7 + aRadius * 0.5;
    vec3 p = vec3(cos(a) * r, sin(a) * r, jitter().z * 0.5 + sin(a * 3.0 + r) * 0.22);
    p.yz = rot(-0.5) * p.yz;
    p.xz = rot(uSpin * 0.3) * p.xz;
    p *= mix(1.0, 0.62, uMobile);
    return p + vec3(0.0, mix(-0.2, 0.6, uMobile), -1.5);
  }

  vec3 shape(float id) {
    if (id < 0.5) return vortex();
    if (id < 1.5) return planet();
    if (id < 2.5) return field();
    if (id < 3.5) return knot();
    if (id < 4.5) return helix();
    if (id < 5.5) return starfield();
    return portal();
  }

  float silver(float id) {
    if (id > 1.5 && id < 2.5) return 1.0;
    if (id > 4.5 && id < 5.5) return 0.45;
    return 0.0;
  }

  void main() {
    vLight = 0.6;

    // Each particle leaves a little earlier or later, so morphs flow instead of snapping
    float m = clamp((uMix - aSeed * 0.35) / 0.65, 0.0, 1.0);
    m = m * m * (3.0 - 2.0 * m);

    vec3 a = shape(uFrom);
    float lightA = vLight;
    vec3 b = shape(uTo);
    vLight = mix(lightA, vLight, m);

    vec3 p = mix(a, b, m);

    // Swirl through space mid-morph
    float mid = sin(m * 3.14159);
    p += vec3(
      sin(aSeed * 40.0 + uTime * 0.7),
      cos(aSeed * 31.0 + uTime * 0.6),
      sin(aSeed * 17.0 + uTime * 0.5)
    ) * mid * 1.3;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float depth = max(0.2, -mv.z);

    // Work in screen space so the cursor affects near and far particles alike
    vec4 clip = projectionMatrix * mv;
    vec2 ndc = clip.xy / clip.w;
    vec2 aspect = vec2(uAspect, 1.0);

    vec2 toMouse = (ndc - uMouse) * aspect;
    float md = length(toMouse);
    float force = exp(-md * md * 14.0) * uMouseActive;
    mv.xy += normalize(toMouse + 1e-5) * force * depth * (0.045 + aSeed * 0.05);
    mv.xy += uMouseVel * force * depth * 0.05;

    vec2 toPulse = (ndc - uPulseOrigin) * aspect;
    float pd = length(toPulse);
    float ring = uPulse * 1.7;
    float band = exp(-pow(pd - ring, 2.0) * 40.0) * (1.0 - smoothstep(0.0, 1.3, uPulse));
    mv.xy += normalize(toPulse + 1e-5) * band * depth * 0.05;

    // Fast scrolling stretches the field
    mv.y += uVelocity * (aSeed - 0.5) * depth * 0.035;

    gl_Position = projectionMatrix * mv;

    float glow = clamp(force * 0.9 + band * 1.2, 0.0, 1.0);

    gl_PointSize = clamp(
      (6.0 + aSeed * 9.0) * uDpr / depth * (1.0 + glow * 0.8),
      0.45,
      2.6 * uDpr
    );

    float far = 1.0 - smoothstep(16.0, 34.0, depth);
    float near = smoothstep(0.6, 3.0, depth);

    vSeed = aSeed;
    vSilver = mix(silver(uFrom), silver(uTo), m);
    vGlow = glow;
    vFade = far * near * uVisibility * uBoost;
  }
`;

const fragmentShader = /* glsl */ `
  varying float vSeed;
  varying float vFade;
  varying float vSilver;
  varying float vLight;
  varying float vGlow;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;

    float shape = 1.0 - smoothstep(0.06, 0.5, d);

    vec3 iris = vec3(0.51, 0.59, 1.0);
    vec3 indigo = vec3(0.25, 0.31, 0.65);
    vec3 silver = vec3(0.68, 0.66, 0.63);
    vec3 white = vec3(0.86, 0.89, 1.0);

    vec3 cool = mix(indigo, iris, vSeed);
    cool = mix(cool, white, pow(vSeed, 9.0) * 0.75);

    vec3 warm = mix(silver, iris, smoothstep(0.4, 0.95, vSeed));
    warm *= 0.5 + vLight * 0.6;

    vec3 color = mix(cool, warm, vSilver);
    color = mix(color, white, vGlow * 0.7);

    float opacity = mix(0.55, 0.34, vSilver) + vGlow * 0.5;

    gl_FragColor = vec4(color, shape * vFade * opacity * (0.35 + vSeed * 0.65));
  }
`;

function buildParticles(count) {
  const positions = new Float32Array(count * 3);
  const fields = new Float32Array(count * 3);
  const rands = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const radii = new Float32Array(count);
  const angles = new Float32Array(count);

  let seed = 420;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  for (let i = 0; i < count; i++) {
    const radius = 0.65 + Math.pow(random(), 1.45) * 4.6;
    const arm = Math.floor(random() * 6);
    const angle = (arm * Math.PI * 2) / 6 + radius * 1.45 + (random() - 0.5) * 1.2;

    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = Math.sin(angle) * radius;
    positions[i * 3 + 2] = (random() - 0.5) * 0.8;

    fields[i * 3] = (random() - 0.5) * 39;
    fields[i * 3 + 1] = (random() - 0.5) * 0.12;
    fields[i * 3 + 2] = random() * -22 + 13;

    rands[i * 3] = random();
    rands[i * 3 + 1] = random();
    rands[i * 3 + 2] = random();

    seeds[i] = random();
    radii[i] = radius;
    angles[i] = angle;
  }

  return { positions, fields, rands, seeds, radii, angles };
}

function ParticleField({ mobile, inputRef }) {
  const material = useRef();
  const data = useMemo(() => buildParticles(mobile ? (LITE ? 14000 : 24000) : LITE ? 60000 : 110000), [mobile]);
  const projector = useMemo(() => new THREE.Vector3(), []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFrom: { value: 0 },
      uTo: { value: 0 },
      uMix: { value: 0 },
      uSpin: { value: 0 },
      uDpr: { value: 1 },
      uMobile: { value: 0 },
      uAspect: { value: 1 },
      uVelocity: { value: 0 },
      uVisibility: { value: 1 },
      uBoost: { value: 1 },
      uMouse: { value: new THREE.Vector2(9, 9) },
      uMouseVel: { value: new THREE.Vector2() },
      uMouseActive: { value: 0 },
      uPulseOrigin: { value: new THREE.Vector2() },
      uPulse: { value: 9 },
    }),
    []
  );

  const smooth = useRef({ stage: 0, spin: 0 });

  useFrame((state, delta) => {
    if (!material.current) return;

    const dt = Math.min(delta, 0.05);
    const u = material.current.uniforms;
    const target = inputRef.current;
    const s = smooth.current;
    const { damp } = THREE.MathUtils;

    s.stage = damp(s.stage, target.stage, 2.6, dt);
    s.spin = damp(s.spin, target.spin, 3, dt);

    const sequence = target.sequence;
    const last = sequence.length - 1;
    const stage = THREE.MathUtils.clamp(s.stage, 0, last);
    const from = Math.min(Math.floor(stage), last);
    const to = Math.min(from + 1, last);
    const mix = stage - from;

    u.uTime.value += dt;
    u.uFrom.value = sequence[from][1];
    u.uTo.value = sequence[to][1];
    u.uMix.value = mix;
    u.uSpin.value = s.spin + u.uTime.value * 0.06;
    u.uDpr.value = state.gl.getPixelRatio();
    u.uMobile.value = mobile ? 1 : 0;
    // Fewer particles on phones, so each one shines a little brighter
    u.uBoost.value = mobile && LITE ? 1.45 : 1;
    u.uAspect.value = state.size.width / Math.max(state.size.height, 1);

    const brightness = THREE.MathUtils.lerp(sequence[from][2], sequence[to][2], mix);
    u.uVisibility.value = damp(u.uVisibility.value, brightness, 3, dt);
    u.uVelocity.value = damp(u.uVelocity.value, target.velocity, 6, dt);
    inputRef.current.velocity = damp(target.velocity, 0, 4, dt);

    // Cursor
    const pointer = target.pointer;
    u.uMouse.value.x = damp(u.uMouse.value.x, pointer.x, 10, dt);
    u.uMouse.value.y = damp(u.uMouse.value.y, pointer.y, 10, dt);
    u.uMouseVel.value.x = damp(u.uMouseVel.value.x, pointer.vx, 5, dt);
    u.uMouseVel.value.y = damp(u.uMouseVel.value.y, pointer.vy, 5, dt);
    inputRef.current.pointer.vx = damp(pointer.vx, 0, 6, dt);
    inputRef.current.pointer.vy = damp(pointer.vy, 0, 6, dt);
    u.uMouseActive.value = damp(u.uMouseActive.value, pointer.active ? 1 : 0, 4, dt);

    // Click ripple
    if (target.pulse) {
      u.uPulseOrigin.value.set(target.pulse.x, target.pulse.y);
      u.uPulse.value = 0;
      inputRef.current.pulse = null;
    } else {
      u.uPulse.value += dt;
    }

    // The camera leans toward the cursor, so the scene feels like a space you look into
    const look = pointer.active ? pointer : { x: 0, y: 0 };
    const camera = state.camera;
    camera.position.x = damp(camera.position.x, look.x * 0.9, 2, dt);
    camera.position.y = damp(camera.position.y, look.y * 0.55, 2, dt);
    camera.lookAt(projector.set(0, 0, -2));
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
        <bufferAttribute attach="attributes-aField" args={[data.fields, 3]} />
        <bufferAttribute attach="attributes-aRand" args={[data.rands, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[data.seeds, 1]} />
        <bufferAttribute attach="attributes-aRadius" args={[data.radii, 1]} />
        <bufferAttribute attach="attributes-aAngle" args={[data.angles, 1]} />
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
  );
}

/* On phones, draw the scene at ~30fps so scrolling and touch stay smooth. */
function FrameLimiter({ fps }) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    let frame = 0;
    let last = 0;
    const interval = 1000 / fps;
    const tick = (time) => {
      if (time - last >= interval - 2) {
        last = time;
        invalidate();
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [fps, invalidate]);

  return null;
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
    return this.state.failed ? null : this.props.children;
  }
}

export default function ParticleWorld() {
  const input = useRef({
    sequence: PAGE_SEQUENCE,
    stage: 0,
    spin: 0,
    velocity: 0,
    pointer: { x: 9, y: 9, vx: 0, vy: 0, active: false },
    pulse: null,
  });

  const [mobile, setMobile] = useState(() => window.innerWidth < 768);
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [visible, setVisible] = useState(() => !document.hidden);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const state = input.current;
    let frame = 0;
    let lastY = window.scrollY;
    let lastMove = performance.now();

    const homeSections = HOME_SEQUENCE.map((entry) => document.getElementById(entry[0]));
    const isHome = homeSections.every(Boolean);
    state.sequence = isHome ? HOME_SEQUENCE : PAGE_SEQUENCE;

    const toNdc = (event) => ({
      x: (event.clientX / window.innerWidth) * 2 - 1,
      y: -((event.clientY / window.innerHeight) * 2 - 1),
    });

    const onPointerMove = (event) => {
      if (event.pointerType !== "mouse") return;
      const now = performance.now();
      const { x, y } = toNdc(event);
      const dt = Math.max((now - lastMove) / 1000, 1 / 240);
      const p = state.pointer;

      if (p.active) {
        p.vx = THREE.MathUtils.clamp((x - p.x) / dt, -6, 6);
        p.vy = THREE.MathUtils.clamp((y - p.y) / dt, -6, 6);
      }
      p.x = x;
      p.y = y;
      p.active = true;
      lastMove = now;
    };

    const onPointerDown = (event) => {
      state.pulse = toNdc(event);
    };

    const resetPointer = () => {
      state.pointer.active = false;
    };

    const updateScroll = () => {
      const height = Math.max(window.innerHeight, 1);
      const y = window.scrollY;
      const { smoothstep, clamp } = THREE.MathUtils;

      if (isHome) {
        const center = height * 0.5;
        let stage = 0;
        for (let i = 1; i < homeSections.length; i++) {
          const top = homeSections[i].getBoundingClientRect().top;
          stage += smoothstep(center - top, -height * 0.3, height * 0.3);
        }
        state.stage = stage;
      } else {
        state.stage = smoothstep(y, 0, height * 1.1);
      }

      state.spin = y * 0.0016;
      state.velocity = clamp(state.velocity + (y - lastY) * (LITE ? 0.008 : 0.02), -2.5, 2.5);
      lastY = y;
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateScroll);
    };

    // Phones fire resize whenever the address bar shows or hides; only react to width changes
    let lastWidth = window.innerWidth;
    const resize = () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      setMobile(window.innerWidth < 768);
      onScroll();
    };

    const motionChanged = () => setReduced(media.matches);
    const visibilityChanged = () => setVisible(!document.hidden);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", resetPointer);
    window.addEventListener("blur", resetPointer);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", visibilityChanged);
    media.addEventListener("change", motionChanged);

    updateScroll();
    state.velocity = 0;

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      document.documentElement.removeEventListener("pointerleave", resetPointer);
      window.removeEventListener("blur", resetPointer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibilityChanged);
      media.removeEventListener("change", motionChanged);
    };
  }, []);

  return (
    <div className="m-particle-world" aria-hidden="true">
      <div className="m-particle-ambient" />

      {!reduced && (
        <GraphicsBoundary>
          <Canvas
            dpr={LITE ? 1 : [1, 1.5]}
            frameloop={!visible ? "never" : LITE ? "demand" : "always"}
            camera={{ position: [0, 0, mobile ? 13 : 11], fov: 48, near: 0.1, far: 100 }}
            gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
            fallback={null}
          >
            <ParticleField mobile={mobile} inputRef={input} />
            {LITE && visible && <FrameLimiter fps={30} />}
          </Canvas>
        </GraphicsBoundary>
      )}

      <div className="m-particle-vignette" />
    </div>
  );
}
