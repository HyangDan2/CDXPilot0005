import type { GameEvent } from '../entities/types';
export class AudioEngine {
  private context: AudioContext | null = null;
  private gain: GainNode | null = null;
  private volume = 0.35;
  private music: HTMLAudioElement[] = [];
  private musicVolume = 0.35;
  private boss = false;
  private enabled = false;
  private track = 0;
  private fade: ReturnType<typeof setInterval> | null = null;
  start() {
    try {
      if (this.fade) clearInterval(this.fade);
      this.fade = null;
      this.track = 0;
      this.context ??= new AudioContext();
      if (!this.gain) {
        this.gain = this.context.createGain();
        this.gain.connect(this.context.destination);
      }
      void this.context.resume().catch(() => {});
      this.enabled = true;
      if (!this.music.length)
        this.music = ['cloister-march', 'ashen-king', 'victory', 'defeat'].map((name) => {
          const a = new Audio(import.meta.env.BASE_URL + 'assets/audio/' + name + '.wav');
          a.loop = true;
          a.preload = 'auto';
          a.volume = this.musicVolume;
          return a;
        });
      this.boss = false;
      for (const a of this.music) {
        a.pause();
        a.currentTime = 0;
        a.volume = this.musicVolume;
      }
      void this.music[0].play().catch(() => {});
      this.gain.gain.value = this.volume * 0.25;
    } catch {
      this.context = null;
    }
  }
  setVolume(value: number) {
    this.volume = value;
    if (this.gain && this.context)
      this.gain.gain.setTargetAtTime(
        this.enabled ? value * 0.25 : 0,
        this.context.currentTime,
        0.03,
      );
  }
  pause(paused: boolean) {
    this.enabled = !paused;
    for (const a of this.music) a.pause();
    if (!paused) void this.music[this.track]?.play().catch(() => {});
    if (this.gain && this.context)
      this.gain.gain.setTargetAtTime(
        paused ? 0 : this.volume * 0.25,
        this.context.currentTime,
        0.05,
      );
  }
  private tone(
    freq: number,
    duration: number,
    type: OscillatorType = 'triangle',
    volume = 0.3,
    end = freq,
  ) {
    if (!this.context || !this.gain || !this.enabled) return;
    const now = this.context.currentTime,
      o = this.context.createOscillator(),
      g = this.context.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, now);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, end), now + duration);
    g.gain.setValueAtTime(0.001, now);
    g.gain.exponentialRampToValueAtTime(volume, now + 0.008);
    g.gain.exponentialRampToValueAtTime(0.001, now + duration);
    o.connect(g);
    g.connect(this.gain);
    o.start();
    o.stop(now + duration + 0.01);
    o.onended = () => {
      o.disconnect();
      g.disconnect();
    };
  }
  play(event: GameEvent) {
    switch (event.type) {
      case 'swing':
        this.tone(430, 0.11, 'sawtooth', 0.12, 70);
        break;
      case 'hit':
        this.tone(125, 0.14, 'square', 0.4, 35);
        this.tone(800, 0.055, 'triangle', 0.2, 180);
        break;
      case 'kick':
        this.tone(180, 0.13, 'triangle', 0.5, 35);
        break;
      case 'jump':
        this.tone(210, 0.15, 'sine', 0.3, 500);
        break;
      case 'land':
        this.tone(85, 0.1, 'triangle', 0.2, 35);
        break;
      case 'boss':
        this.tone(55, 1.5, 'sawtooth', 0.25, 70);
        break;
      case 'heal':
        this.tone(660, 0.3, 'sine', 0.2, 990);
        break;
      case 'clear':
        this.tone(440, 1, 'sine', 0.3, 880);
        break;
      case 'death':
        this.tone(150, 0.25, 'triangle', 0.2, 30);
    }
  }
  setMusicVolume(value: number) {
    this.musicVolume = Math.max(0, Math.min(1, value));
    for (const a of this.music) a.volume = this.musicVolume;
  }
  status() {
    return {
      enabled: this.enabled,
      boss: this.boss,
      track: this.track,
      tracks: this.music.map((a) => ({
        paused: a.paused,
        time: a.currentTime,
        volume: a.volume,
        ready: a.readyState,
        error: a.error?.code ?? null,
      })),
    };
  }
  update(boss = false) {
    if (!this.enabled || boss === this.boss) return;
    const previous = this.music[Number(this.boss)],
      next = this.music[Number(boss)];
    this.boss = boss;
    this.track = Number(boss);
    if (previous && next) {
      previous.pause();
      if (Number.isFinite(next.duration)) next.currentTime = previous.currentTime % next.duration;
      void next.play().catch(() => {});
    }
  }
  finish(won: boolean) {
    if (this.fade) clearInterval(this.fade);
    const old = this.music[this.track];
    this.track = won ? 2 : 3;
    const next = this.music[this.track];
    let elapsed = 0;
    this.fade = setInterval(() => {
      elapsed += 40;
      if (old) old.volume = this.musicVolume * Math.max(0, 1 - elapsed / 320);
      if (elapsed >= 320) {
        if (this.fade) clearInterval(this.fade);
        this.fade = null;
        for (const a of this.music) a.pause();
        if (next) {
          next.currentTime = 0;
          next.volume = this.musicVolume;
          void next.play().catch(() => {});
        }
      }
    }, 40);
  }
  destroy() {
    if (this.fade) clearInterval(this.fade);

    for (const a of this.music) {
      a.pause();
      a.removeAttribute('src');
      a.load();
    }
    this.music = [];
    void this.context?.close();
  }
}
