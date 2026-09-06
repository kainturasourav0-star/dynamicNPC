import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Scale, Fingerprint, Wand2, Film, Lock, Mic, Video, Clock,
} from 'lucide-react';
import { API } from '../api/client';
import ReadinessChecklist from '../components/ReadinessChecklist';

function DubThumb({ jobId, fallback }) {
  const [failed, setFailed] = useState(false);
  if (!jobId || failed) return fallback;
  return (
    <img
      src={`${API}/dub/thumb/${jobId}`}
      alt=""
      onError={() => setFailed(true)}
      loading="lazy"
      className="lp-dub-thumb"
    />
  );
}

/**
 * ActionCard — 3D perspective tilt on hover, cursor-tracked spotlight,
 * eternal breath ring. Reads its accent from `--card-hue`.
 */
function ActionCard({ hue, Icon, title, accent, count, onClick, children }) {
  const cardRef = React.useRef(null);

  const handleMouseMove = useCallback((e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;
    const cx = r.width / 2;
    const cy = r.height / 2;

    // Tilt — clamped to ±10deg
    const rotX = ((my - cy) / cy) * -8;
    const rotY = ((mx - cx) / cx) * 8;

    el.style.setProperty('--mx', `${mx}px`);
    el.style.setProperty('--my', `${my}px`);
    el.style.setProperty('--rot-x', `${rotX}deg`);
    el.style.setProperty('--rot-y', `${rotY}deg`);
  }, []);

  const handleMouseLeave = useCallback((e) => {
    const el = e.currentTarget;
    el.style.setProperty('--rot-x', '0deg');
    el.style.setProperty('--rot-y', '0deg');
  }, []);

  return (
    <button
      ref={cardRef}
      type="button"
      className="lp-action-card lp-animate lp-glow-card"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ '--card-hue': hue }}
    >
      <span className="lp-glow-layer" aria-hidden="true" />
      {count > 0 && <span className="card-count">{count}</span>}
      <div className="card-icon">
        <Icon size={18} color={hue} />
      </div>
      <h3>
        {title} <span className="lp-action-card__emoji" aria-hidden="true">{accent}</span>
      </h3>
      <p className="card-desc">{children}</p>
    </button>
  );
}

/**
 * QuickStat — small metric chip shown in the hero area.
 */
function QuickStat({ icon: Icon, value, label, hue }) {
  return (
    <div className="lp-stat" style={{ '--stat-hue': hue }}>
      <span className="lp-stat__icon"><Icon size={12} /></span>
      <span className="lp-stat__value">{value}</span>
      <span className="lp-stat__label">{label}</span>
    </div>
  );
}

export default function Launchpad({
  profiles, studioProjects, dubHistory,
  setMode, setIsCompareModalOpen, handleSelectProfile, loadProject,
}) {
  const { t } = useTranslation();
  const cloneProfiles = profiles.filter(p => !p.instruct);
  const designProfiles = profiles.filter(p => !!p.instruct);
  const demoProfile = profiles.find(p => p.id === 'demo0001');

  const totalVoices = profiles.length;
  const totalDubs = (studioProjects.length || 0) + (dubHistory?.length || 0);

  return (
    <div className="launchpad">
      {/* Ambient aurora backdrop */}
      <div className="lp-aurora" aria-hidden="true">
        <span className="lp-aurora__blob lp-aurora__blob--pink" />
        <span className="lp-aurora__blob lp-aurora__blob--green" />
        <span className="lp-aurora__blob lp-aurora__blob--amber" />
      </div>

      {/* Hero */}
      <div className="lp-hero">
        <div className="lp-hero__row">
          <div className="lp-hero__col">
            <div className="lp-hero__kicker-row">
              <div className="lp-hero__wave-group">
                {[10, 14, 8, 16, 12, 14, 9, 12].map((h, i) => (
                  <span
                    key={i}
                    className="lp-wave-bar"
                    style={{
                      '--bar-h': `${h}px`,
                      '--bar-delay': `${i * 0.17}s`,
                      '--bar-dur':   `${1.8 + (i % 3) * 0.4}s`,
                    }}
                  />
                ))}
              </div>
              <span className="lp-kicker">{t('launchpad.greeting')}</span>
            </div>
            <h1 className="lp-hero__title">
              <span className="lp-hero__halo" aria-hidden="true" />
              Make voices that <em>sound like you</em>.
              <span className="lp-hero__sweep" aria-hidden="true" />
            </h1>
            <p>
              Clone a voice, design a new one, or dub a video into any of <span className="lp-pill">{t('common.languages_count')}</span>.
              Built for creators who care how it sounds.
            </p>

            {/* Quick stats row */}
            {(totalVoices > 0 || totalDubs > 0) && (
              <div className="lp-stats-row">
                {totalVoices > 0 && (
                  <QuickStat
                    icon={Mic}
                    value={totalVoices}
                    label={totalVoices === 1 ? 'Voice' : 'Voices'}
                    hue="#d3869b"
                  />
                )}
                {totalDubs > 0 && (
                  <QuickStat
                    icon={Video}
                    value={totalDubs}
                    label={totalDubs === 1 ? 'Project' : 'Projects'}
                    hue="#fe8019"
                  />
                )}
                <QuickStat
                  icon={Clock}
                  value="Local"
                  label="No Cloud"
                  hue="#8ec07c"
                />
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCompareModalOpen(true)}
            className="lp-ab-compare"
            title="Try two voices side by side"
          >
            <Scale size={12} /> {t('launchpad.ab_compare')}
          </button>
        </div>
      </div>

      {/* Action Cards */}
      <div className="lp-actions">
        <ActionCard hue="#d3869b" Icon={Fingerprint} title={t('launchpad.clone_title')} accent="✨" count={cloneProfiles.length} onClick={() => setMode('clone')}>
          {t('launchpad.clone_desc')}
        </ActionCard>
        <ActionCard hue="#8ec07c" Icon={Wand2} title={t('launchpad.design_title')} accent="🧪" count={designProfiles.length} onClick={() => setMode('design')}>
          {t('launchpad.design_desc')}
        </ActionCard>
        <ActionCard hue="#fe8019" Icon={Film} title={t('launchpad.dub_title')} accent="🎬" count={studioProjects.length} onClick={() => setMode('dub')}>
          {t('launchpad.dub_desc')}
        </ActionCard>
      </div>

      {/* Demo profile callout */}
      {demoProfile && profiles.length === 1 && studioProjects.length === 0 && (
        <div className="lp-demo-callout">
          <span className="lp-demo-callout__icon">👋</span>
          <span>{t('launchpad.demo_callout')}</span>
          <button
            className="lp-demo-callout__btn"
            onClick={() => { setMode('clone'); handleSelectProfile(demoProfile); }}
          >
            Try it
          </button>
        </div>
      )}

      {/* Recent Projects */}
      {(profiles.length > 0 || studioProjects.length > 0) && (
        <div className="lp-section">
          <div className="lp-section__grid">
            {/* Cloned voices */}
            {cloneProfiles.length > 0 && (
              <div>
                <div className="lp-section-title"><Fingerprint size={12} color="#d3869b" /> Cloned Voices</div>
                <div className="lp-col">
                  {cloneProfiles.map(p => (
                    <div key={p.id} className="lp-project-card">
                      <div className="proj-icon lp-proj-icon--clone"><Fingerprint size={14} color="#d3869b" /></div>
                      <div className="proj-info">
                        <div className="proj-name">{p.name}</div>
                        <div className="proj-meta">{p.ref_audio_path}</div>
                      </div>
                      <button className="proj-action" onClick={() => { setMode('clone'); handleSelectProfile(p); }}>Open</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Designed voices */}
            {designProfiles.length > 0 && (
              <div>
                <div className="lp-section-title"><Wand2 size={12} color="#8ec07c" /> Designed Voices</div>
                <div className="lp-col">
                  {designProfiles.map(p => (
                    <div key={p.id} className="lp-project-card">
                      <div className={`proj-icon ${p.is_locked ? 'lp-proj-icon--locked' : 'lp-proj-icon--design'}`}>
                        {p.is_locked ? <Lock size={14} color="#b8bb26" /> : <Wand2 size={14} color="#8ec07c" />}
                      </div>
                      <div className="proj-info">
                        <div className="proj-name">{p.name}</div>
                        <div className="proj-meta lp-proj-meta--italic">{p.instruct}</div>
                      </div>
                      {p.is_locked && <span className="lp-locked-badge">LOCKED</span>}
                      <button className="proj-action" onClick={() => { setMode('design'); handleSelectProfile(p); }}>Open</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dubbing projects */}
            {studioProjects.length > 0 && (
              <div>
                <div className="lp-section-title"><Film size={12} color="#fe8019" /> Dubbing Projects</div>
                <div className="lp-col">
                  {studioProjects.map(proj => (
                    <div key={proj.id} className="lp-project-card">
                      <div className="proj-icon lp-proj-icon--dub">
                        <DubThumb
                          jobId={proj.state?.dubJobId || proj.id}
                          fallback={<Film size={14} color="#fe8019" />}
                        />
                      </div>
                      <div className="proj-info">
                        <div className="proj-name">{proj.name}</div>
                        <div className="proj-meta">{proj.video_path || 'Audio Only'}</div>
                      </div>
                      <button className="proj-action" onClick={() => { setMode('dub'); loadProject(proj.id); }}>Open</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {profiles.length === 0 && studioProjects.length === 0 && (
        <div className="lp-empty">
          <div className="lp-empty__inner">
            {/* Animated waveform rings */}
            <div className="lp-empty__visual" aria-hidden="true">
              <span className="lp-empty__ring lp-empty__ring--1" />
              <span className="lp-empty__ring lp-empty__ring--2" />
              <span className="lp-empty__ring lp-empty__ring--3" />
              <div className="lp-empty__bars">
                {[8, 14, 22, 18, 26, 14, 20, 10, 16].map((h, i) => (
                  <span
                    key={i}
                    className="lp-wave-bar"
                    style={{
                      height: h,
                      '--bar-h': `${h}px`,
                      '--bar-delay': `${i * 0.12}s`,
                      '--bar-dur': `${1.8 + (i % 3) * 0.4}s`,
                    }}
                  />
                ))}
              </div>
            </div>
            <p className="lp-empty__hint">
              {t('launchpad.empty_hint')}
            </p>
            <div className="lp-empty__ctas">
              <button
                className="lp-empty__cta lp-empty__cta--primary"
                onClick={() => setMode('clone')}
              >
                <Fingerprint size={14} />
                Clone a Voice
              </button>
              <button
                className="lp-empty__cta"
                onClick={() => setMode('dub')}
              >
                <Film size={14} />
                Dub a Video
              </button>
            </div>
          </div>
          <ReadinessChecklist showWhenAllPass />
        </div>
      )}

      {/* Show checklist alongside existing projects too, but only when issues exist */}
      {(profiles.length > 0 || studioProjects.length > 0) && (
        <ReadinessChecklist compact />
      )}
    </div>
  );
}
