import React, { useEffect, useRef } from 'react';
import { canRunImmersive, readEnvironment, webglAvailable } from '../../lib/immersive';

// Drifting points of golden light over a soft beam, like lamplight in an upper room.
// Plain WebGL with no library. It sits behind the page text, ignores the pointer unless a mouse is
// present, pauses when off screen or in a background tab, and does not run at all for
// visitors who prefer reduced motion, are saving data, or are on a small device.
const COUNT = 90;

const VERT = `
attribute vec3 a_seed;
uniform float u_time;
uniform vec2 u_pointer;
uniform float u_scroll;
uniform float u_aspect;
uniform float u_scale;
varying float v_alpha;
void main() {
  float depth = 0.25 + a_seed.z * 0.75;
  float speed = 0.012 + depth * 0.03;
  float y = fract(a_seed.y + u_time * speed);
  float x = a_seed.x + sin(u_time * 0.25 + a_seed.y * 12.0) * 0.03 * depth;
  vec2 p = vec2(x * 2.0 - 1.0, y * 2.0 - 1.0);
  p += u_pointer * 0.04 * depth;
  p.y += u_scroll * 0.25 * depth;
  gl_Position = vec4(p, 0.0, 1.0);
  gl_PointSize = (3.0 + depth * 9.0) * u_scale;
  float edge = smoothstep(0.0, 0.15, y) * (1.0 - smoothstep(0.75, 1.0, y));
  v_alpha = edge * (0.25 + depth * 0.55);
}`;
const FRAG = `
precision mediump float;
varying float v_alpha;
void main() {
  float d = distance(gl_PointCoord, vec2(0.5));
  float a = smoothstep(0.5, 0.0, d) * v_alpha;
  gl_FragColor = vec4(1.0, 0.77, 0.31, a);
}`;
const BEAM_VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() { v_uv = a_pos * 0.5 + 0.5; gl_Position = vec4(a_pos, 0.0, 1.0); }`;
const BEAM_FRAG = `
precision mediump float;
varying vec2 v_uv;
uniform float u_time;
uniform vec2 u_pointer;
void main() {
  vec2 c = vec2(0.78 + u_pointer.x * 0.03, 1.05);
  vec2 d = v_uv - c;
  float ang = atan(d.x, -d.y);
  float beam = smoothstep(0.55, 0.0, abs(ang + 0.35)) * smoothstep(1.6, 0.0, length(d));
  float pulse = 0.85 + 0.15 * sin(u_time * 0.5);
  gl_FragColor = vec4(1.0, 0.77, 0.31, beam * 0.22 * pulse);
}`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
  return s;
}
function program(gl, v, f) {
  const p = gl.createProgram();
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, v));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, f));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('link');
  return p;
}

export default function LightField({ className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !canRunImmersive(readEnvironment()) || !webglAvailable()) return undefined;
    const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false, powerPreference: 'low-power' });
    if (!gl) return undefined;

    let raf = 0, visible = true, tabVisible = true, dead = false;
    const state = { px: 0, py: 0, tx: 0, ty: 0, scroll: 0 };
    let pts, beam, buf, quad;
    try {
      pts = program(gl, VERT, FRAG);
      beam = program(gl, BEAM_VERT, BEAM_FRAG);
    } catch { return undefined; }

    const seeds = new Float32Array(COUNT * 3);
    for (let i = 0; i < seeds.length; i++) seeds[i] = Math.random();
    buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW);
    quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, w, h);
    };

    const frame = (ms) => {
      raf = 0;
      if (dead) return;
      const t = ms / 1000;
      state.px += (state.tx - state.px) * 0.05;
      state.py += (state.ty - state.py) * 0.05;
      resize();
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(beam);
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      const bp = gl.getAttribLocation(beam, 'a_pos');
      gl.enableVertexAttribArray(bp);
      gl.vertexAttribPointer(bp, 2, gl.FLOAT, false, 0, 0);
      gl.uniform1f(gl.getUniformLocation(beam, 'u_time'), t);
      gl.uniform2f(gl.getUniformLocation(beam, 'u_pointer'), state.px, state.py);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      gl.useProgram(pts);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      const sp = gl.getAttribLocation(pts, 'a_seed');
      gl.enableVertexAttribArray(sp);
      gl.vertexAttribPointer(sp, 3, gl.FLOAT, false, 0, 0);
      gl.uniform1f(gl.getUniformLocation(pts, 'u_time'), t);
      gl.uniform2f(gl.getUniformLocation(pts, 'u_pointer'), state.px, state.py);
      gl.uniform1f(gl.getUniformLocation(pts, 'u_scroll'), state.scroll);
      gl.uniform1f(gl.getUniformLocation(pts, 'u_aspect'), canvas.width / canvas.height);
      gl.uniform1f(gl.getUniformLocation(pts, 'u_scale'), canvas.height / 600);
      gl.drawArrays(gl.POINTS, 0, COUNT);
      schedule();
    };
    const schedule = () => { if (!raf && visible && tabVisible && !dead) raf = requestAnimationFrame(frame); };

    const onPointer = (e) => {
      if (e.pointerType === 'touch') return;
      const r = canvas.getBoundingClientRect();
      state.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      state.ty = -(((e.clientY - r.top) / r.height) * 2 - 1);
    };
    const onScroll = () => {
      const r = canvas.getBoundingClientRect();
      state.scroll = Math.max(-1, Math.min(1, -r.top / Math.max(1, r.height)));
    };
    const onVisibility = () => { tabVisible = !document.hidden; schedule(); };
    const onLost = (e) => { e.preventDefault(); dead = true; if (raf) cancelAnimationFrame(raf); };

    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); });
    io.observe(canvas);
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.dataset.running = 'true';
    schedule();

    return () => {
      dead = true;
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onLost);
      delete canvas.dataset.running;
      const lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={`absolute inset-0 w-full h-full pointer-events-none z-[1] ${className}`} />;
}
