import { HUB_URL } from '../config/navigation';
import { PLAYER } from '../config/constants';
import { canRoll } from '../entities/movement';
import type { Simulation } from '../entities/simulation';
export type Mode = 'title' | 'playing' | 'paused' | 'over' | 'clear';
export interface UIActions {
  start: () => void;
  startForge: () => void;
  nextStage: () => void;
  pause: () => void;
  resume: () => void;
  volume: (v: number) => void;
  musicVolume: (v: number) => void;
}
export class Interface {
  mode: Mode = 'title';
  private root: HTMLElement;
  private overlay: HTMLElement;
  private hud: HTMLElement;
  private actions: UIActions;
  private lastWave = '';

  constructor(actions: UIActions) {
    this.actions = actions;
    document.querySelector('#app')!.innerHTML = `
  <div class="shell">
   <header class="masthead"><a class="wordmark" href="./" aria-label="Valkyrie home"><span class="rune">ᛉ</span> VALKYRIE<span class="edition">THE ASHEN GATE</span></a><div class="header-right"><div class="header-actions"><a id="hub-button" class="hub-link" href="${HUB_URL}">게임 허브로</a><button id="settings-button" aria-label="Settings">⚙</button></div><span class="status-dot"></span> LOCAL ARCADE <span class="version">VOL. 01 — 2026</span></div></header>
   <section class="chapter-heading"><div><div class="eyebrow">A FORGOTTEN REALM. AN UNBROKEN OATH.</div><h1 id="chapter-title">The Ashen Gate<span class="chapter-number"> / I</span></h1></div><div class="chapter-meta"><span class="small-rune">◇</span><div>STORY MODE<small>1 PLAYER · KEYBOARD</small></div></div></section>
   <section id="stage" aria-label="Valkyrie game"><div id="game"></div><div class="screen-vignette"></div>
    <div id="hud" hidden><div class="player-hud"><div class="portrait"><span>ᛉ</span><img src="${import.meta.env.BASE_URL}assets/sd-v3/portrait.png" alt="Eira" /></div><div class="vital"><div class="hud-label">EIRA <span id="weapon-label">SWORD</span></div><div class="hp-track"><div id="hp-fill"></div></div><div class="hp-caption"><span id="hp-text"></span><span>VITALITY</span></div><div id="roll-meter" role="progressbar" aria-label="Dodge recharge" aria-valuemin="0" aria-valuemax="100"><div id="roll-fill"></div></div><div class="roll-caption">DODGE <span id="roll-label">READY</span></div></div></div><div class="wave-hud"><span id="wave-label"></span><small id="wave-name"></small></div><button id="pause-button" class="icon-button" aria-label="Pause game">Ⅱ</button><div id="combo" hidden><strong></strong><span>HIT COMBO</span></div><div id="boss-hud" hidden><div class="hud-label"><span id="boss-name">HROTH, THE HOLLOW KING</span> <span id="boss-phase"></span></div><div class="hp-track"><div id="boss-fill"></div></div></div><div id="reinforcement-warning" hidden>⚠ REINFORCEMENTS INCOMING</div><div id="travel-hint">FOLLOW THE FALLEN LIGHT <span>→</span></div></div>
    <div id="overlay"></div><div class="scene-caption"><span>THE RUINS OF HALVARD</span><span>ᛟ &nbsp; ᛉ &nbsp; ᚱ</span></div>
   </section>

   <footer class="below-game"><div><span class="footer-diamond">◆</span> <strong>THE FIRST OATH</strong><span class="footer-description">Beyond the gate, the old gods are silent.</span></div><button id="help-button">FIELD GUIDE <span>↗</span></button></footer>
   <div class="page-foot"><span>AN ORIGINAL PIXEL ARCADE ADVENTURE</span><span>F1 DEBUG &nbsp; · &nbsp; ESC PAUSE &nbsp; · &nbsp; v0.7.1</span></div>
  </div><dialog id="guide"><button id="close-guide" aria-label="Close field guide">×</button><div class="eyebrow">THE OATHKEEPER'S FIELD GUIDE</div><h2>Settings &amp; controls</h2>   <section class="control-bar" aria-label="Game controls"><div class="controls-group"><span class="keys"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></span><span>Move</span></div><div class="controls-group"><kbd>J</kbd><span>Slash</span><kbd>K</kbd><span>Guard</span><kbd>↓ → J</kbd><span>Rising</span><kbd>J+K</kbd><span>Spin</span></div><div class="controls-group secondary"><kbd>SPACE</kbd><span>Jump</span><kbd>→ →</kbd><span>Run</span></div><div class="sound-control"><label for="volume">♪ <span>SFX</span></label><input id="volume" type="range" min="0" max="100" value="35" aria-label="Volume"/><label for="music-volume">BGM</label><input id="music-volume" type="range" min="0" max="100" value="35" aria-label="BGM Volume"/></div></section><p><kbd>I</kbd> Switch sword / bow · <kbd>L</kbd> Dodge roll · <kbd>J</kbd> Attack / shoot · <kbd>K</kbd> Guard</p><p>Bow shots: 0.7s draw, 0.6s recovery. Bow guard takes 40% damage; sword guard takes 20%. Roll is briefly invulnerable during its middle, with a vulnerable landing.</p><p>Move with WASD or arrow keys. Match an enemy's ground depth to strike them. Clear each encounter, then follow the light to the right.</p><dl><dt>J · K · ↓ → J</dt><dd>Tap J to chain four strikes: overhead cut, rising cut, thrust, turning finisher. Each strike has a vulnerable wind-up; taking a hit resets the chain. Hold K to guard the front. Down, forward, J within 400ms launches a rising slash; facing left uses ↓ ← J.</dd><dt>J + K · deliberate simultaneous press</dt><dd>Release both keys first, then press within 40ms while idle or moving on the ground. Never cancels an attack or guard. Spin resists stagger and reduces incoming damage; its first hit costs 20% of maximum HP, once per use. Requires more HP than the cost.</dd><dt>SPACE + J</dt><dd>Jump, then attack in the air. Double-tap and hold a direction to run; K holds sword guard.</dd><dt>Watch the red tell</dt><dd>Enemy attacks have a wind-up. Step up or down to evade. The king grows faster below half health.</dd><dt>Break the loop</dt><dd>Repeated launches weaken. Three additional air hits force a protected knockdown; wait for recovery before re-engaging. The king resists launch.</dd><dt>Between encounters</dt><dd>No automatic healing. Each defeated enemy has a 5% chance to drop a potion: green +10%, blue +20%, gold +50% maximum HP. Walk over it to collect.</dd></dl><section class="touch-options"><label>터치 버튼 크기 <input id="touch-size" type="range" min="80" max="120" value="100" /></label><label>터치 투명도 <input id="touch-opacity" type="range" min="30" max="90" value="65" /></label><label>터치 좌우 여백 <input id="touch-inset" type="range" min="12" max="64" value="20" /></label></section><p>THE ASHEN FORGE: five areas, breakable stockade, alternating vents and an optional cooling-garden potion. Skarn’s slam warns before igniting one vent bank; the other depth lane stays open. His charge breaks wooden barricades. Stage entry restores HP and carries score/best combo; restart returns to that stage’s entry score.</p><p class="guide-note">Touch: left stick moves; outer ring runs. Tap attack or swipe upward for rising. Hold guard. Separate buttons roll, jump, switch and spin. Sound begins when you enter the game.</p></dialog><dialog id="hub-exit" aria-labelledby="hub-exit-title" aria-describedby="hub-exit-note"><h2 id="hub-exit-title">게임 허브로 이동할까요?</h2><p id="hub-exit-note">허브로 나가면 현재 진행 상황은 저장되지 않습니다.</p><div class="exit-actions"><button id="cancel-hub-exit" class="text-button" autofocus>계속 머무르기</button><a class="hub-link" href="${HUB_URL}">허브로 이동</a></div></dialog>`;
    document.querySelector<HTMLImageElement>('.portrait img')?.addEventListener('error', (e) => {
      (e.target as HTMLImageElement).hidden = true;
    });
    this.root = document.querySelector('#app')!;
    this.overlay = document.querySelector('#overlay')!;
    this.hud = document.querySelector('#hud')!;
    this.root.querySelector('#pause-button')!.addEventListener('click', actions.pause);
    const hubButton = this.root.querySelector<HTMLAnchorElement>('#hub-button')!;
    const hubExit = this.root.querySelector<HTMLDialogElement>('#hub-exit')!;
    hubButton.addEventListener('click', (event) => {
      if (this.mode !== 'playing' && this.mode !== 'paused') return;
      event.preventDefault();
      actions.pause();
      hubExit.showModal();
    });
    this.root.querySelector('#cancel-hub-exit')!.addEventListener('click', () => hubExit.close());
    hubExit.querySelector('a')!.addEventListener('click', () => hubExit.close());
    hubExit.addEventListener('close', () => hubButton.focus({ preventScroll: true }));
    for (const [id, key, callback] of [
      ['volume', 'valkyrie.sfx', actions.volume],
      ['music-volume', 'valkyrie.bgm', actions.musicVolume],
    ] as const) {
      const slider = this.root.querySelector<HTMLInputElement>('#' + id)!;
      try {
        const saved = localStorage.getItem(key);
        if (saved !== null) slider.value = String(Math.max(0, Math.min(100, Number(saved) || 0)));
      } catch {
        /* Storage may be disabled. */
      }
      callback(Number(slider.value) / 100);
      slider.addEventListener('input', () => {
        callback(Number(slider.value) / 100);
        try {
          localStorage.setItem(key, slider.value);
        } catch {
          /* Optional persistence. */
        }
      });
    }
    const guide = document.querySelector<HTMLDialogElement>('#guide')!;
    let resumeAfterSettings = false;
    const openSettings = () => {
      resumeAfterSettings = this.mode === 'playing';
      if (resumeAfterSettings) actions.pause();
      guide.showModal();
    };
    document.querySelector('#settings-button')!.addEventListener('click', openSettings);
    document.querySelector('#help-button')!.addEventListener('click', openSettings);
    const restoreSettingsState = () => {
      const resume = resumeAfterSettings;
      resumeAfterSettings = false;
      if (resume && this.mode === 'paused') actions.resume();
    };
    document.querySelector('#close-guide')!.addEventListener('click', () => {
      guide.close();
      restoreSettingsState();
    });
    guide.addEventListener('close', restoreSettingsState);
    for (const [id, property, factor, unit] of [
      ['touch-size', '--touch-scale', 0.01, ''],
      ['touch-opacity', '--touch-opacity', 0.01, ''],
      ['touch-inset', '--touch-inset', 1, 'px'],
    ] as const) {
      const slider = document.querySelector<HTMLInputElement>('#' + id)!;
      const apply = () =>
        document.documentElement.style.setProperty(
          property,
          String(Number(slider.value) * factor) + unit,
        );
      try {
        const saved = localStorage.getItem('valkyrie.' + id);
        if (saved) slider.value = saved;
      } catch {
        /* Optional. */
      }
      apply();
      slider.addEventListener('input', () => {
        apply();
        try {
          localStorage.setItem('valkyrie.' + id, slider.value);
        } catch {
          /* Optional. */
        }
      });
    }
    this.setMode('title');
  }
  setMode(mode: Mode, sim?: Simulation) {
    this.mode = mode;
    document.querySelector('#stage')?.setAttribute('data-mode', mode);
    this.hud.hidden = mode === 'title';
    this.overlay.hidden = mode === 'playing';
    this.overlay.className = mode === 'title' ? 'title-overlay' : 'menu-overlay';
    if (mode === 'playing') {
      this.overlay.innerHTML = '';
      return;
    }
    if (mode === 'title')
      this.overlay.innerHTML = `<div class="title-content"><div class="eyebrow"><span class="gold-line"></span> CHAPTER ONE</div><h2>VALKYRIE</h2><div class="title-subtitle">THE ASHEN GATE</div><p>The light has left these halls.<br>Give the darkness something to fear.</p><button class="primary-button" id="start-button">BEGIN YOUR OATH <span>→</span></button><button class="text-button forge-entry" id="forge-start-button">PLAY THE ASHEN FORGE</button><div class="start-note">PRESS ENTER TO BEGIN</div></div><div class="hero-caption"><span>ᛉ</span><div>EIRA<small>THE LAST OATHKEEPER</small></div></div>`;
    else {
      const title =
        mode === 'paused'
          ? 'A moment of stillness.'
          : mode === 'clear'
            ? sim?.stageId === 'forge'
              ? 'The forge falls silent.'
              : 'The oath endures.'
            : 'Even light can fall.';
      const label = mode === 'paused' ? 'PAUSED' : mode === 'clear' ? 'STAGE CLEAR' : 'GAME OVER';
      this.overlay.innerHTML = `<div class="menu-card"><span class="menu-rune">ᛉ</span><div class="eyebrow">${label}</div><h2>${title}</h2><p>${mode === 'paused' ? 'Your journey will wait.' : `Score ${String(sim?.score ?? 0).padStart(6, '0')} &nbsp; · &nbsp; Best combo ${sim?.bestCombo ?? 0}`}</p>${mode === 'paused' ? '<button class="primary-button" id="resume-button">RESUME JOURNEY <span>→</span></button>' : ''}${mode === 'clear' && sim?.stageId === 'gate' ? '<button class="primary-button" id="next-stage-button">ENTER THE ASHEN FORGE <span>→</span></button><p class="stage-carry">Carry score &amp; best combo · Restore HP</p>' : ''}<button class="${mode === 'paused' ? 'text-button' : 'primary-button'}" id="restart-button">${mode === 'clear' ? 'PLAY AGAIN' : 'RESTART JOURNEY'} <span>↻</span></button></div>`;
    }
    if (mode !== 'title') this.overlay.querySelector<HTMLButtonElement>('button')?.focus();
    this.overlay
      .querySelector('#forge-start-button')
      ?.addEventListener('click', this.actions.startForge);
    this.overlay
      .querySelector('#next-stage-button')
      ?.addEventListener('click', this.actions.nextStage);
    this.overlay.querySelector('#start-button')?.addEventListener('click', this.actions.start);
    this.overlay.querySelector('#restart-button')?.addEventListener('click', this.actions.start);
    this.overlay.querySelector('#resume-button')?.addEventListener('click', this.actions.resume);
  }
  update(s: Simulation) {
    const charge = Math.max(0, Math.min(1, 1 - s.player.rollCooldown / PLAYER.rollCooldown));
    const percent = charge === 1 ? 100 : Math.floor(charge * 100);
    const ready = canRoll(s.player);
    const meter = document.querySelector<HTMLElement>('#roll-meter')!;
    meter.setAttribute('aria-valuenow', String(percent));
    meter.dataset.ready = String(ready);
    document.querySelector<HTMLElement>('#roll-fill')!.style.width = `${percent}%`;
    const label = charge < 1 ? `${percent}%` : ready ? 'READY' : 'WAIT';
    document.querySelector('#roll-label')!.textContent = label;
    const button = document.querySelector<HTMLButtonElement>('[data-action="roll"]');
    if (button) {
      button.style.setProperty('--charge', `${percent}%`);
      button.dataset.ready = String(ready);
      button.setAttribute('aria-label', `회피 ${label}`);
      button.innerHTML = `회피<small>${label}</small>`;
    }
    document.querySelector<HTMLElement>('#reinforcement-warning')!.hidden =
      s.reinforcements.warnings.length === 0;

    document.querySelector('#weapon-label')!.textContent =
      s.player.weapon === 'bow' ? 'BOW · I SWITCH' : 'SWORD · I SWITCH';
    document.querySelector<HTMLElement>('#hp-fill')!.style.width =
      `${(s.player.hp / s.player.maxHp) * 100}%`;
    document.querySelector('#hp-text')!.textContent = `${s.player.hp} / ${s.player.maxHp}`;
    const waveKey = `${s.stageId}:${s.wave}:${s.sectionIndex}`;
    if (this.lastWave !== waveKey) {
      this.lastWave = waveKey;
      document.querySelector('#wave-label')!.textContent =
        s.stageId === 'forge'
          ? `AREA ${String(s.sectionIndex + 1).padStart(2, '0')} / 05`
          : s.wave === 3
            ? 'FINAL ENCOUNTER'
            : `ENCOUNTER ${String(Math.min(s.wave + 1, 4)).padStart(2, '0')} / 04`;
      document.querySelector('#wave-name')!.textContent =
        s.stage.sections[s.sectionIndex]?.name ?? s.stage.waves[s.wave]?.name ?? 'THE GATE IS OPEN';
    }
    document.querySelector('#chapter-title')!.textContent = `${s.stage.title} / ${s.stage.chapter}`;
    document.querySelector('.scene-caption span')!.textContent =
      s.stageId === 'forge' ? 'THE ASHEN FORGE' : 'THE RUINS OF HALVARD';
    document.querySelector('#boss-name')!.textContent = s.stage.bossName;
    const combo = document.querySelector<HTMLElement>('#combo')!;
    combo.hidden = s.combo < 2;
    combo.querySelector('strong')!.textContent = `${s.combo}`;
    const boss = s.boss;
    document.querySelector<HTMLElement>('#boss-hud')!.hidden = !boss;
    if (boss) {
      document.querySelector<HTMLElement>('#boss-fill')!.style.width =
        `${(boss.hp / boss.maxHp) * 100}%`;
      document.querySelector('#boss-phase')!.textContent =
        boss.hp <= boss.maxHp / 2
          ? 'ENRAGED'
          : s.stageId === 'forge'
            ? 'THE FORGE WARDEN'
            : 'THE GATEKEEPER';
    }
    document.querySelector<HTMLElement>('#travel-hint')!.hidden = s.active;
    document.querySelector('#travel-hint')!.textContent =
      s.stageId === 'forge' && s.sectionIndex === 3
        ? 'COOLING GARDEN · OPTIONAL HEAL ABOVE →'
        : 'FOLLOW THE FALLEN LIGHT →';
  }
}
