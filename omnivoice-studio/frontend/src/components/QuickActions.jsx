import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Fingerprint, Wand2, Film, Scale, Plus, X, FileText } from 'lucide-react';
import './QuickActions.css';

const ACTIONS = [
  { id: 'clone',    label: 'New Clone',    Icon: Fingerprint, hue: '#d3869b', mode: 'clone' },
  { id: 'design',   label: 'Design Voice', Icon: Wand2,       hue: '#8ec07c', mode: 'design' },
  { id: 'dub',      label: 'Dub Video',    Icon: Film,        hue: '#fe8019', mode: 'dub' },
  { id: 'transcripts', label: 'Transcribe', Icon: FileText,   hue: '#d3869b', mode: 'transcriptions' },
  { id: 'compare',  label: 'A/B Compare',  Icon: Scale,       hue: '#83a598', mode: 'compare' },
];

export default function QuickActions({ setMode, setIsCompareModalOpen }) {
  const [open, setOpen] = useState(false);
  const [animating, setAnimating] = useState(false);
  const containerRef = useRef(null);

  const toggle = useCallback(() => {
    if (animating) return;
    setAnimating(true);
    setOpen(prev => !prev);
    setTimeout(() => setAnimating(false), 320);
  }, [animating]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && open) setOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  const handleAction = useCallback((action) => {
    setOpen(false);
    if (action.id === 'compare') {
      setIsCompareModalOpen(true);
    } else {
      setMode(action.mode);
    }
  }, [setMode, setIsCompareModalOpen]);

  return (
    <div className="qa-root" ref={containerRef}>
      {/* Backdrop blur overlay */}
      {open && (
        <div className="qa-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />
      )}

      {/* Action items — rendered in reverse so bottom item is closest to FAB */}
      <div className={`qa-items ${open ? 'qa-items--open' : ''}`} aria-hidden={!open}>
        {ACTIONS.map((action, i) => {
          const Icon = action.Icon;
          const delay = open
            ? `${i * 48}ms`
            : `${(ACTIONS.length - 1 - i) * 32}ms`;
          return (
            <div
              key={action.id}
              className="qa-item"
              style={{ '--qa-hue': action.hue, '--qa-delay': delay }}
            >
              <span className="qa-item__label">{action.label}</span>
              <button
                className="qa-item__btn"
                onClick={() => handleAction(action)}
                title={action.label}
                aria-label={action.label}
                tabIndex={open ? 0 : -1}
              >
                <Icon size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Main FAB trigger */}
      <button
        className={`qa-fab ${open ? 'qa-fab--open' : ''}`}
        onClick={toggle}
        aria-label={open ? 'Close quick actions' : 'Open quick actions'}
        aria-expanded={open}
        title="Quick Actions"
      >
        <span className="qa-fab__icon qa-fab__icon--plus">
          <Plus size={20} strokeWidth={2.2} />
        </span>
        <span className="qa-fab__icon qa-fab__icon--close">
          <X size={20} strokeWidth={2.2} />
        </span>
        <span className="qa-fab__ring" aria-hidden="true" />
      </button>
    </div>
  );
}
