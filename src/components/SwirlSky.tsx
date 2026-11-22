"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * A living, swirling night sky drawn entirely in a fragment shader.
 * Streamlines are the contour lines of a stream function made from a
 * gentle horizontal flow plus a few Gaussian vortices — so the strokes
 * always curl around the "moons" the way brush strokes would.
 */

const vertex = /* glsl */ `
  void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform vec2 uRes;
  uniform float uTime;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }

  // x, y (0..1 of screen, y up), radius, spin
  const int N = 6;
  vec4 V[N];

  void main() {
    V[0] = vec4(0.12, 0.80, 0.11, 1.0);
    V[1] = vec4(0.33, 0.87, 0.08, -1.0);
    V[2] = vec4(0.78, 0.80, 0.13, 1.0);
    V[3] = vec4(0.58, 0.66, 0.09, -1.0);
    V[4] = vec4(0.93, 0.52, 0.085, -1.0);
    V[5] = vec4(0.21, 0.52, 0.085, 1.0);

    float aspect = uRes.x / uRes.y;
    vec2 uv = gl_FragCoord.xy / uRes;
    vec2 p = vec2(uv.x * aspect, uv.y);
    float t = uTime;

    // Stream function
    float psi = p.y + 0.035 * sin(p.x * 4.0 + t * 0.12) + 0.02 * sin(p.x * 9.0 - p.y * 3.0);
    float glow = 0.0;
    for (int i = 0; i < N; i++) {
      vec2 c = vec2(V[i].x * aspect, V[i].y);
      float R = V[i].z * max(1.0, aspect * 0.62);
      float d2 = dot(p - c, p - c);
      psi += V[i].w * 2.6 * R * exp(-d2 / (2.0 * R * R));
      if (i == 0 || i == 2 || i == 1) glow += exp(-d2 / (2.0 * pow(R * 0.32, 2.0)));
    }
    psi += 0.012 * noise(p * 7.0 + vec2(t * 0.05, 0.0));

    // Strokes: contour lines of psi, broken into brush dashes that drift with the flow
    float freq = 150.0;
    float v = psi * freq;
    float id = floor(v);
    float f = fract(v);
    float dist = min(f, 1.0 - f);
    float w = fwidth(v);
    float strand = noise(vec2(id * 3.1, 0.0));
    float thick = 0.12 + 0.18 * strand;
    float line = 1.0 - smoothstep(thick, thick + w * 1.2, dist);
    float dash = smoothstep(0.25, 0.6, noise(vec2(p.x * 14.0 - t * 0.35 + id * 7.3, id * 0.37)));
    float lum = line * (0.10 + 0.55 * strand) * (0.35 + 0.65 * dash);

    // Moon glows with rings
    lum += glow * 0.45;
    lum += glow * 0.25 * (0.5 + 0.5 * sin(psi * 420.0));

    // Fade toward the horizon and edges
    lum *= smoothstep(0.05, 0.35, uv.y);
    vec3 col = vec3(0.02) + vec3(lum) * vec3(0.92, 0.92, 0.94);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function SwirlSky({ paused = false, className = "" }: { paused?: boolean; className?: string }) {
  const mount = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const el = mount.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    } catch {
      el.classList.add("hatch"); // no WebGL: quiet fallback
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    el.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uniforms = { uRes: { value: new THREE.Vector2() }, uTime: { value: 0 } };
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms })
    );
    scene.add(mesh);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = el;
      renderer.setSize(w, h, false);
      renderer.getDrawingBufferSize(uniforms.uRes.value);
      renderer.render(scene, camera);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    const start = performance.now();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible || pausedRef.current || reduce) return;
      uniforms.uTime.value = (performance.now() - start) / 1000;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mount} aria-hidden="true" className={`absolute inset-0 bg-deep ${className}`} />;
}
