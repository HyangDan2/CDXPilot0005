import Phaser from 'phaser';
import { Simulation } from '../entities/simulation';
import { Controller } from '../input/controller';
import { FixedClock } from '../physics/world';
import { Interface } from '../ui/interface';
import { AudioEngine } from '../ui/AudioEngine';
import { preloadAssets, ensureFallbacks } from '../animation/assets';
import { ArenaView } from './ArenaView';
import { installHarness } from './testHarness';
export class ArenaScene extends Phaser.Scene {
  sim = new Simulation();
  ui!: Interface;
  private controller!: Controller;
  private clock = new FixedClock();
  private debug = false;
  private soundEngine = new AudioEngine();
  private view!: ArenaView;
  preload() {
    preloadAssets(this);
  }
  create() {
    ensureFallbacks(this);
    this.ui = new Interface({
      start: () => this.start(),
      pause: () => this.pause(),
      resume: () => this.resume(),
      volume: (v) => this.soundEngine.setVolume(v),
      musicVolume: (v) => this.soundEngine.setMusicVolume(v),
    });
    document.querySelector('#game')!.append(this.game.canvas);
    this.game.canvas.setAttribute('aria-label', 'Valkyrie game world');
    this.controller = new Controller(
      () => (this.ui.mode === 'paused' ? this.resume() : this.pause()),
      () => (this.debug = !this.debug),
      () => ({
        free:
          ['Idle', 'Walk', 'Run'].includes(this.sim.player.state) &&
          !this.sim.player.attack &&
          this.sim.player.z === 0,
        facing: this.sim.player.facing,
      }),
    );
    this.view = new ArenaView(this);
    const enter = (e: KeyboardEvent) => {
      if (e.code === 'Enter' && this.ui.mode === 'title') this.start();
    };
    window.addEventListener('keydown', enter);
    const blur = () => this.pause();
    window.addEventListener('blur', blur);
    this.events.on('update', (_time: number, delta: number) => {
      if (this.ui.mode === 'playing') {
        this.clock.advance(delta / 1000, (dt) => {
          this.sim.step(dt, this.controller.read());
          if (!['Idle', 'Walk', 'Run'].includes(this.sim.player.state)) this.controller.cancelRun();
        });
        this.ui.update(this.sim);
        for (const event of this.sim.drainEvents()) {
          this.view.event(event);
          this.soundEngine.play(event);
        }
        this.soundEngine.update(!!this.sim.boss);
        if (this.sim.status !== 'playing') {
          this.ui.setMode(this.sim.status, this.sim);
          this.soundEngine.finish(this.sim.status === 'clear');
        }
      }
      this.view.render(
        this.sim,
        delta,
        this.debug,
        this.ui.mode === 'title',
        this.ui.mode !== 'playing' && this.ui.mode !== 'title',
      );
    });
    installHarness(this);
    this.events.once('shutdown', () => {
      this.controller.destroy();
      this.soundEngine.destroy();
      window.removeEventListener('keydown', enter);
      window.removeEventListener('blur', blur);
    });
  }
  audioStatus() {
    return this.soundEngine.status();
  }
  start() {
    this.sim = new Simulation();
    this.controller.clear();
    this.clock.reset();
    this.view.reset();
    this.ui.setMode('playing');
    this.ui.update(this.sim);
    this.soundEngine.start();
  }
  pause() {
    if (this.ui.mode === 'playing') {
      this.ui.setMode('paused');
      this.controller.clear();
      this.soundEngine.pause(true);
    }
  }
  resume() {
    if (this.ui.mode === 'paused') {
      this.controller.clear();
      this.clock.reset();
      this.ui.setMode('playing');
      this.soundEngine.pause(false);
    }
  }
}
