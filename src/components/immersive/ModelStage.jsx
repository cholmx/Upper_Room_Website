import React, { useEffect, useRef, useState } from 'react';
import { DEFAULT_MODEL, loadModelViewer, readEnvironment, webglAvailable } from '../../lib/immersive';
import { usePhoto } from '../../photos';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiBox, FiRotateCcw } = FiIcons;

const VIEWS = [
  { id: 'overview', label: 'Whole campus', orbit: '35deg 65deg 95m', note: 'The grounds, with the building as it stands in cream and the proposed expansion in gold.' },
  { id: 'front', label: 'From the front', orbit: '0deg 75deg 80m', note: 'The proposed gathering space and entrance wing across the front of the building.' },
  { id: 'side', label: 'From the side', orbit: '90deg 72deg 85m', note: 'The proposed wing on the right, next to the existing sanctuary.' },
  { id: 'above', label: 'From above', orbit: '0deg 10deg 110m', note: 'How the footprint grows across the property.' },
];

// An interactive 3D model people can turn and zoom, with a "view in your space" button on phones
// that support augmented reality. The viewer script is about 1 MB, so it loads only after
// someone asks for it.
export default function ModelStage() {
  const custom = usePhoto('campaign-model').url;
  const src = custom || DEFAULT_MODEL;
  const [phase, setPhase] = useState('idle');
  const [view, setView] = useState(VIEWS[0]);
  const viewer = useRef(null);
  const calm = readEnvironment().reducedMotion;

  const start = async () => {
    if (!webglAvailable()) { setPhase('unsupported'); return; }
    setPhase('loading');
    try { await loadModelViewer(); setPhase('ready'); } catch { setPhase('error'); }
  };

  useEffect(() => {
    const el = viewer.current;
    if (phase !== 'ready' || !el) return undefined;
    const done = () => el.setAttribute('data-loaded', 'true');
    const fail = () => setPhase('error');
    el.addEventListener('load', done);
    el.addEventListener('error', fail);
    return () => { el.removeEventListener('load', done); el.removeEventListener('error', fail); };
  }, [phase]);

  const go = (v) => {
    setView(v);
    const el = viewer.current;
    if (el) { el.autoRotate = false; el.cameraOrbit = v.orbit; el.jumpCameraToGoal?.(); }
  };

  return (
    <div>
      <div className="neu rounded-[2rem] p-3 md:p-4">
        <div className="relative rounded-[1.5rem] overflow-hidden bg-gradient-to-b from-[#16241f] to-[#0B1613] aspect-[4/3] md:aspect-[16/9]">
          {phase === 'ready' ? (
            <model-viewer
              ref={viewer}
              src={src}
              alt="A 3D concept model of the Upper Room Fellowship building. The existing building is cream and the proposed expansion is gold."
              camera-controls=""
              touch-action="pan-y"
              auto-rotate={calm ? undefined : ''}
              auto-rotate-delay="4000"
              rotation-per-second="8deg"
              camera-orbit={VIEWS[0].orbit}
              min-camera-orbit="auto auto 40m"
              max-camera-orbit="auto 88deg 160m"
              shadow-intensity="1.1"
              shadow-softness="1"
              exposure="0.8"
              interaction-prompt="auto"
              ar=""
              ar-modes="webxr scene-viewer quick-look"
              ar-scale="auto"
              style={{ width: '100%', height: '100%', background: 'transparent', '--poster-color': 'transparent' }}
            >
              <button slot="ar-button" type="button" className="btn btn-solid !py-2.5 !px-5 !text-[0.8rem] absolute bottom-4 right-4">View in your space</button>
            </model-viewer>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-white">
              <span className="w-20 h-20 rounded-full neu-dark flex items-center justify-center text-[#FFC44F] mb-5"><SafeIcon icon={FiBox} size={32} /></span>
              {phase === 'unsupported' && <p className="max-w-[34ch]">Your browser cannot show 3D here. The plans are described in the text above.</p>}
              {phase === 'error' && <p className="max-w-[34ch]">The 3D view could not load. Please try again in a moment.</p>}
              {(phase === 'idle' || phase === 'loading' || phase === 'error') && (
                <button type="button" onClick={start} aria-busy={phase === 'loading'} className="btn btn-solid mt-4">{phase === 'loading' ? 'Loading' : 'Explore in 3D'}</button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6" role="group" aria-label="Choose a view">
        <div className="flex flex-wrap gap-3">
          {VIEWS.map(v => (
            <button
              key={v.id}
              type="button"
              disabled={phase !== 'ready'}
              aria-pressed={view.id === v.id}
              onClick={() => go(v)}
              className={`min-h-[44px] px-5 rounded-full font-semibold text-[0.95rem] transition-shadow disabled:opacity-50 ${view.id === v.id ? 'neu-inset' : 'neu'}`}
            >
              {v.label}
            </button>
          ))}
          <button type="button" disabled={phase !== 'ready'} onClick={() => go(VIEWS[0])} className="min-h-[44px] px-4 rounded-full neu font-semibold inline-flex items-center gap-2 disabled:opacity-50">
            <SafeIcon icon={FiRotateCcw} /> Reset
          </button>
        </div>
        <p className="mt-4 text-lg text-black/80" aria-live="polite">{view.note}</p>
        <p className="mt-2 text-sm text-black/70">Drag to turn the model, pinch or scroll to zoom. On a supported phone, choose “View in your space” to place it on the ground in front of you. This is a simple concept model that shows size and placement. The final plans may differ.</p>
      </div>
    </div>
  );
}
