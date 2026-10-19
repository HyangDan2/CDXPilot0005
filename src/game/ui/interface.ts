import { waves } from '../../data/stage';
import type { Simulation } from '../entities/simulation';
export type Mode = 'title' | 'playing' | 'paused' | 'over' | 'clear';
export interface UIActions {
  start: () => void;
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
  private lastWave = -1;
  constructor(actions: UIActions) {
    this.actions = actions;
    document.querySelector('#app')!.innerHTML = `
  <div class="shell">
   <header class="masthead"><a class="wordmark" href="./" aria-label="Valkyrie home"><span class="rune">ᛉ</span> VALKYRIE<span class="edition">THE ASHEN GATE</span></a><div class="header-right"><span class="status-dot"></span> LOCAL ARCADE <span class="version">VOL. 01 — 2026</span></div></header>
   <section class="chapter-heading"><div><div class="eyebrow">A FORGOTTEN REALM. AN UNBROKEN OATH.</div><h1>The Ashen Gate<span class="chapter-number"> / I</span></h1></div><div class="chapter-meta"><span class="small-rune">◇</span><div>STORY MODE<small>1 PLAYER · KEYBOARD</small></div></div></section>
   <section id="stage" aria-label="Valkyrie game"><div id="game"></div><div class="screen-vignette"></div>
    <div id="hud" hidden><div class="player-hud"><div class="portrait"><span>ᛉ</span><img src="${import.meta.env.BASE_URL}assets/sd-v3/portrait.png" alt="Eira" /></div><div class="vital"><div class="hud-label">EIRA <span>OATHKEEPER</span></div><div class="hp-track"><div id="hp-fill"></div></div><div class="hp-caption"><span id="hp-text"></span><span>VITALITY</span></div></div></div><div class="wave-hud"><span id="wave-label"></span><small id="wave-name"></small></div><button id="pause-button" class="icon-button" aria-label="Pause game">Ⅱ</button><div id="combo" hidden><strong></strong><span>HIT COMBO</span></div><div id="boss-hud" hidden><div class="hud-label">HROTH, THE HOLLOW KING <span id="boss-phase"></span></div><div class="hp-track"><div id="boss-fill"></div></div></div><div id="travel-hint">FOLLOW THE FALLEN LIGHT <span>→</span></div></div>
    <div id="overlay"></div><div class="scene-caption"><span>THE RUINS OF HALVARD</span><span>ᛟ &nbsp; ᛉ &nbsp; ᚱ</span></div>
   </section>
   <section class="control-bar" aria-label="Game controls"><div class="controls-group"><span class="keys"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></span><span>Move</span></div><div class="controls-group"><kbd>J</kbd><span>Slash</span><kbd>K</kbd><span>Guard</span><kbd>↓ → J</kbd><span>Rising</span><kbd>J+K</kbd><span>Spin</span></div><div class="controls-group secondary"><kbd>SPACE</kbd><span>Jump</span><kbd>→ →</kbd><span>Run</span></div><div class="sound-control"><label for="volume">♪ <span>SFX</span></label><input id="volume" type="range" min="0" max="100" value="35" aria-label="Volume"/><label for="music-volume">BGM</label><input id="music-volume" type="range" min="0" max="100" value="35" aria-label="BGM Volume"/></div></section>
   <footer class="below-game"><div><span class="footer-diamond">◆</span> <strong>THE FIRST OATH</strong><span class="footer-description">Beyond the gate, the old gods are silent.</span></div><button id="help-button">FIELD GUIDE <span>↗</span></button></footer>
   <div class="page-foot"><span>AN ORIGINAL PIXEL ARCADE ADVENTURE</span><span>F1 DEBUG &nbsp; · &nbsp; ESC PAUSE &nbsp; · &nbsp; v0.4.0</span></div>
  </div><dialog id="guide"><button id="close-guide" aria-label="Close field guide">×</button><div class="eyebrow">THE OATHKEEPER'S FIELD GUIDE</div><h2>Make every strike count.</h2><p>Move with WASD or arrow keys. Match an enemy's ground depth to strike them. Clear each encounter, then follow the light to the right.</p><dl><dt>J · K · ↓ → J</dt><dd>Tap J to chain four strikes: overhead cut, rising cut, thrust, turning finisher. Each strike has a vulnerable wind-up; taking a hit resets the chain. Hold K to guard the front. Down, forward, J within 400ms launches a rising slash; facing left uses ↓ ← J.</dd><dt>J + K · deliberate simultaneous press</dt><dd>Release both keys first, then press within 40ms while idle or moving on the ground. Never cancels an attack or guard. Spin resists stagger and reduces incoming damage; its first hit costs 20% of maximum HP, once per use. Requires more HP than the cost.</dd><dt>SPACE + J</dt><dd>Jump, then attack in the air. Double-tap and hold a direction to run; K holds sword guard.</dd><dt>Watch the red tell</dt><dd>Enemy attacks have a wind-up. Step up or down to evade. The king grows faster below half health.</dd><dt>Break the loop</dt><dd>Repeated launches weaken. Three additional air hits force a protected knockdown; wait for recovery before re-engaging. The king resists launch.</dd><dt>Between encounters</dt><dd>No automatic healing. Each defeated enemy has a 5% chance to drop a potion: green +10%, blue +20%, gold +50% maximum HP. Walk over it to collect.</dd></dl><p class="guide-note">Desktop keyboard recommended. Sound begins when you enter the game.</p></dialog>`;
    document.querySelector<HTMLImageElement>('.portrait img')?.addEventListener('error', (e) => {
      (e.target as HTMLImageElement).hidden = true;
    });
    this.root = document.querySelector('#app')!;
    this.overlay = document.querySelector('#overlay')!;
    this.hud = document.querySelector('#hud')!;
    this.root.querySelector('#pause-button')!.addEventListener('click', actions.pause);
    this.root
      .querySelector('#volume')!
      .addEventListener('input', (e) =>
        actions.volume(Number((e.target as HTMLInputElement).value) / 100),
      );
    this.root
      .querySelector('#music-volume')!
      .addEventListener('input', (e) =>
        actions.musicVolume(Number((e.target as HTMLInputElement).value) / 100),
      );
    const guide = document.querySelector<HTMLDialogElement>('#guide')!;
    document.querySelector('#help-button')!.addEventListener('click', () => {
      if (this.mode === 'playing') actions.pause();
      guide.showModal();
    });
    document.querySelector('#close-guide')!.addEventListener('click', () => guide.close());
    this.setMode('title');
  }
  setMode(mode: Mode, sim?: Simulation) {
    this.mode = mode;
    this.hud.hidden = mode === 'title';
    this.overlay.hidden = mode === 'playing';
    this.overlay.className = mode === 'title' ? 'title-overlay' : 'menu-overlay';
    if (mode === 'playing') {
      this.overlay.innerHTML = '';
      return;
    }
    if (mode === 'title')
      this.overlay.innerHTML = `<div class="title-content"><div class="eyebrow"><span class="gold-line"></span> CHAPTER ONE</div><h2>VALKYRIE</h2><div class="title-subtitle">THE ASHEN GATE</div><p>The light has left these halls.<br>Give the darkness something to fear.</p><button class="primary-button" id="start-button">BEGIN YOUR OATH <span>→</span></button><div class="start-note">PRESS ENTER TO BEGIN</div></div><div class="hero-caption"><span>ᛉ</span><div>EIRA<small>THE LAST OATHKEEPER</small></div></div>`;
    else {
      const title =
        mode === 'paused'
          ? 'A moment of stillness.'
          : mode === 'clear'
            ? 'The oath endures.'
            : 'Even light can fall.';
      const label = mode === 'paused' ? 'PAUSED' : mode === 'clear' ? 'STAGE CLEAR' : 'GAME OVER';
      this.overlay.innerHTML = `<div class="menu-card"><span class="menu-rune">ᛉ</span><div class="eyebrow">${label}</div><h2>${title}</h2><p>${mode === 'paused' ? 'Your journey will wait.' : `Score ${String(sim?.score ?? 0).padStart(6, '0')} &nbsp; · &nbsp; Best combo ${sim?.bestCombo ?? 0}`}</p>${mode === 'paused' ? '<button class="primary-button" id="resume-button">RESUME JOURNEY <span>→</span></button>' : ''}<button class="${mode === 'paused' ? 'text-button' : 'primary-button'}" id="restart-button">${mode === 'clear' ? 'PLAY AGAIN' : 'RESTART JOURNEY'} <span>↻</span></button></div>`;
    }
    this.overlay.querySelector('#start-button')?.addEventListener('click', this.actions.start);
    this.overlay.querySelector('#restart-button')?.addEventListener('click', this.actions.start);
    this.overlay.querySelector('#resume-button')?.addEventListener('click', this.actions.resume);
  }
  update(s: Simulation) {
    document.querySelector<HTMLElement>('#hp-fill')!.style.width =
      `${(s.player.hp / s.player.maxHp) * 100}%`;
    document.querySelector('#hp-text')!.textContent = `${s.player.hp} / ${s.player.maxHp}`;
    if (this.lastWave !== s.wave) {
      this.lastWave = s.wave;
      document.querySelector('#wave-label')!.textContent =
        s.wave === 3
          ? 'FINAL ENCOUNTER'
          : `ENCOUNTER ${String(Math.min(s.wave + 1, 4)).padStart(2, '0')} / 04`;
      document.querySelector('#wave-name')!.textContent = waves[s.wave]?.name ?? 'THE GATE IS OPEN';
    }
    const combo = document.querySelector<HTMLElement>('#combo')!;
    combo.hidden = s.combo < 2;
    combo.querySelector('strong')!.textContent = `${s.combo}`;
    const boss = s.boss;
    document.querySelector<HTMLElement>('#boss-hud')!.hidden = !boss;
    if (boss) {
      document.querySelector<HTMLElement>('#boss-fill')!.style.width =
        `${(boss.hp / boss.maxHp) * 100}%`;
      document.querySelector('#boss-phase')!.textContent =
        boss.hp <= boss.maxHp / 2 ? 'ENRAGED' : 'THE GATEKEEPER';
    }
    document.querySelector<HTMLElement>('#travel-hint')!.hidden = s.active;
  }
}
