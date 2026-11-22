"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

/**
 * Builds the portrait out of particles with Three.js.
 * Every particle is one sampled pixel of the photo. They drift in from the
 * right like dust, settle into place, then the real photo fades in on top
 * and `onReady` fires so the rest of the page can animate.
 */

const vertex = /* glsl */ `
  attribute vec2 aTarget;
  attribute vec2 aStart;
  attribute vec3 aColor;
  attribute float aDelay;
  attribute float aSeed;
  uniform float uProgress;
  uniform float uTime;
  uniform float uSize;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float t = clamp((uProgress * 1.25 - aDelay) / 0.5, 0.0, 1.0);
    float e = 1.0 - pow(1.0 - t, 3.0);
    vec2 pos = mix(aStart, aTarget, e);
    float loose = 1.0 - e;
    pos += vec2(sin(aSeed * 6.283 + uTime * 1.7), cos(aSeed * 4.1 + uTime * 1.3)) * 6.0 * loose;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 0.0, 1.0);
    // Every particle keeps the true colour and size of its pixel from start to finish
    gl_PointSize = uSize;
    vColor = aColor;
    vAlpha = t > 0.0 ? 1.0 : 0.0;
  }
`;

const fragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  uniform float uFade;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    if (max(abs(c.x), abs(c.y)) > 0.5) discard;
    gl_FragColor = vec4(vColor, vAlpha * uFade);
  }
`;

type Props = {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  onReady?: () => void;
};

export default function ParticlePortrait({ src, alt, className = "", imgClassName = "", onReady }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const readyRef = useRef(onReady);
  useEffect(() => {
    readyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    const el = box.current;
    const photo = img.current;
    if (!el || !photo) return;

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      readyRef.current?.();
    };
    const showPhotoNow = () => {
      gsap.set(photo, { autoAlpha: 1 });
      finish();
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      showPhotoNow();
      return;
    }

    let renderer: THREE.WebGLRenderer | null = null;
    let raf = 0;
    let tl: gsap.core.Timeline | null = null;
    let disposed = false;
    const cleanups: (() => void)[] = [];

    const source = new Image();
    source.decoding = "async";
    source.src = src;
    source
      .decode()
      .then(() => {
        if (disposed) return;
        const W = el.clientWidth;
        const H = el.clientHeight;
        if (!W || !H) return showPhotoNow();

        // The canvas extends beyond the photo so particles can travel outside its box.
        const padX = Math.round(W * 0.5);
        const padY = Math.round(H * 0.15);
        const CW = W + padX * 2;
        const CH = H + padY * 2;

        // Sample the photo
        const sw = W < 500 ? 220 : 340;
        const sh = Math.round((sw * source.naturalHeight) / source.naturalWidth);
        const cv = document.createElement("canvas");
        cv.width = sw;
        cv.height = sh;
        const ctx = cv.getContext("2d", { willReadFrequently: true });
        if (!ctx) return showPhotoNow();
        ctx.drawImage(source, 0, 0, sw, sh);
        const data = ctx.getImageData(0, 0, sw, sh).data;

        const targets: number[] = [];
        const starts: number[] = [];
        const colors: number[] = [];
        const delays: number[] = [];
        const seeds: number[] = [];
        const cell = W / sw;

        for (let y = 0; y < sh; y++) {
          for (let x = 0; x < sw; x++) {
            const i = (y * sw + x) * 4;
            const a = data[i + 3] / 255;
            if (a < 0.35) continue;
            const tx = (x - sw / 2) * cell;
            const ty = (sh / 2 - y) * cell;
            targets.push(tx, ty);
            // Particles rise from the bottom edge and settle into place
            starts.push(
              tx + (Math.random() - 0.5) * W * 0.35,
              -H / 2 - padY * 0.2 + Math.random() * H * 0.12
            );
            colors.push(data[i] / 255, data[i + 1] / 255, data[i + 2] / 255);
            // Develops from the bottom to the top, with a little randomness
            delays.push((1 - y / sh) * 0.6 + Math.random() * 0.12);
            seeds.push(Math.random());
          }
        }

        try {
          renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
        } catch {
          return showPhotoNow();
        }
        const dpr = Math.min(window.devicePixelRatio, 2);
        renderer.setPixelRatio(dpr);
        renderer.setSize(CW, CH);
        renderer.setClearColor(0x000000, 0);
        renderer.domElement.style.cssText = `position:absolute;left:${-padX}px;top:${-padY}px;width:${CW}px;height:${CH}px;pointer-events:none`;
        renderer.domElement.setAttribute("aria-hidden", "true");
        el.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-CW / 2, CW / 2, CH / 2, -CH / 2, -1, 1);
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(seeds.length * 3), 3));
        geo.setAttribute("aTarget", new THREE.Float32BufferAttribute(targets, 2));
        geo.setAttribute("aStart", new THREE.Float32BufferAttribute(starts, 2));
        geo.setAttribute("aColor", new THREE.Float32BufferAttribute(colors, 3));
        geo.setAttribute("aDelay", new THREE.Float32BufferAttribute(delays, 1));
        geo.setAttribute("aSeed", new THREE.Float32BufferAttribute(seeds, 1));
        const uniforms = {
          uProgress: { value: 0 },
          uTime: { value: 0 },
          uSize: { value: Math.max(1, cell * dpr * 1.08) },
          uFade: { value: 1 },
        };
        const mat = new THREE.ShaderMaterial({
          vertexShader: vertex,
          fragmentShader: fragment,
          uniforms,
          transparent: true,
          depthTest: false,
        });
        const points = new THREE.Points(geo, mat);
        points.frustumCulled = false;
        scene.add(points);
        cleanups.push(() => {
          geo.dispose();
          mat.dispose();
        });

        const start = performance.now();
        const tick = () => {
          raf = requestAnimationFrame(tick);
          uniforms.uTime.value = (performance.now() - start) / 1000;
          renderer?.render(scene, camera);
        };
        tick();

        // Wait for the loading screen to finish before the portrait develops
        const loading = document.documentElement.dataset.loading === "1";
        tl = gsap
          .timeline({ paused: loading })
          .to(uniforms.uProgress, { value: 1, duration: 3.2, ease: "power1.inOut" })
          .add(finish) // portrait is fully developed: let the page continue right away
          .to(photo, { autoAlpha: 1, duration: 0.5, ease: "none" })
          .to(uniforms.uFade, { value: 0, duration: 0.3 }, ">-0.1")
          .add(() => {
            cancelAnimationFrame(raf);
            renderer?.domElement.remove();
          });
      })
      .catch(showPhotoNow);
    const go = () => tl?.play();
    window.addEventListener("loader:done", go);

    return () => {
      disposed = true;
      window.removeEventListener("loader:done", go);
      tl?.kill();
      cancelAnimationFrame(raf);
      cleanups.forEach((f) => f());
      renderer?.dispose();
      renderer?.domElement.remove();
    };
  }, [src]);

  return (
    <div ref={box} className={`relative ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={img}
        src={src}
        alt={alt}
        fetchPriority="high"
        className={`invisible absolute inset-0 h-full w-full object-contain opacity-0 ${imgClassName}`}
      />
    </div>
  );
}
