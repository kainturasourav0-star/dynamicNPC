import React, { useRef, useEffect, useState } from 'react';
import {
  Globe, Fingerprint, Wand2, Film, FolderOpen, Settings2, ArrowLeftRight,
  Library, FileText,
} from 'lucide-react';

const ITEMS = [
  { id: 'launchpad', label: 'Launchpad', Icon: Globe,       accent: '#f3a5b6' },
  { id: 'clone',     label: 'Clone',     Icon: Fingerprint, accent: '#d3869b' },
  { id: 'design',    label: 'Design',    Icon: Wand2,       accent: '#8ec07c' },
  { id: 'dub',       label: 'Dub',       Icon: Film,        accent: '#fe8019' },
  { id: 'gallery',   label: 'Gallery',   Icon: Library,     accent: '#b8bb26' },
  { id: 'transcriptions', label: 'Transcripts', Icon: FileText, accent: '#d3869b' },
  { id: 'projects',  label: 'OmniDrive', Icon: FolderOpen,  accent: '#83a598' },
];
const FOOTER_ITEMS = [
  { id: 'settings', label: 'Settings', Icon: Settings2, accent: '#fabd2f' },
];

function RailBtn({ active, Icon, label, accent, onClick, btnRef }) {
  return (
    <button
      ref={btnRef}
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className={`rail-btn ${active ? 'active' : ''}`}
      style={{ '--rail-accent': accent }}
    >
      <Icon size={18} />
      <span className="rail-label">{label}</span>
    </button>
  );
}

export default function NavRail({ mode, setMode, side = 'left', onFlipSide }) {
  // Active pill animation: track top position + height of active button
  const railTopRef = useRef(null);
  const btnRefs = useRef({});
  const [pillStyle, setPillStyle] = useState({ top: 0, height: 0, opacity: 0 });

  // Current active item's accent color
  const activeItem = ITEMS.find(it => it.id === mode) || FOOTER_ITEMS.find(it => it.id === mode);
  const activeAccent = activeItem?.accent || '#f3a5b6';

  useEffect(() => {
    const ref = btnRefs.current[mode];
    const rail = railTopRef.current;
    if (!ref || !rail) return;

    const railRect = rail.getBoundingClientRect();
    const btnRect = ref.getBoundingClientRect();
    const top = btnRect.top - railRect.top;
    setPillStyle({
      top,
      height: btnRect.height,
      opacity: 1,
      '--pill-accent': activeAccent,
    });
  }, [mode, activeAccent]);

  return (
    <aside className={`nav-rail rail-${side}`}>
      <div className="rail-top" ref={railTopRef}>
        {/* Animated sliding active indicator pill */}
        <span
          className="rail-active-pill"
          style={pillStyle}
          aria-hidden="true"
        />

        {ITEMS.map((it) => (
          <RailBtn
            key={it.id}
            {...it}
            active={mode === it.id}
            onClick={() => setMode(it.id)}
            btnRef={el => (btnRefs.current[it.id] = el)}
          />
        ))}
      </div>
      <div className="rail-bottom">
        {FOOTER_ITEMS.map((it) => (
          <RailBtn
            key={it.id}
            {...it}
            active={mode === it.id}
            onClick={() => setMode(it.id)}
            btnRef={el => (btnRefs.current[it.id] = el)}
          />
        ))}
        <button
          onClick={onFlipSide}
          title={`Move rail to the ${side === 'left' ? 'right' : 'left'}`}
          aria-label="Flip rail side"
          className="rail-btn rail-flip"
        >
          <ArrowLeftRight size={15} />
        </button>
      </div>
    </aside>
  );
}
