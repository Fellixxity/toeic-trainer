'use strict';
/**
 * TOEIC Trainer v2.5
 *  - Web Audio API (効果音)
 *  - Web Speech API (英語音声読み上げ)
 *  - Canvas Confetti (紙吹雪)
 */

// 音声効果音モジュール
const Sound = {
  muted: false,
  audioCtx: null,

  init() {
    this.muted = localStorage.getItem('sound_muted') === 'true';
    this.updateIcon();
  },

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('sound_muted', this.muted);
    this.updateIcon();
  },

  updateIcon() {
    const btn = document.getElementById('sound-toggle-btn');
    if (btn) btn.textContent = this.muted ? '🔇' : '🔊';
  },

  getContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  },

  // 正解音 (ピロリン♪)
  playCorrect() {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(523.25, now);       // C5
    osc1.frequency.setValueAtTime(659.25, now + 0.1); // E5
    osc1.frequency.setValueAtTime(783.99, now + 0.2); // G5

    osc2.frequency.setValueAtTime(1046.50, now + 0.2); // C6

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.2);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
  },

  // 不正解音 (ブッ)
  playWrong() {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.25);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  },

  // セッション完了ファンファーレ
  playFanfare() {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime + idx * 0.12;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    });
  }
};

// Web Speech API (ネイティブ英語読み上げ)
const TTS = {
  available() {
    return 'speechSynthesis' in window;
  },

  /**
   * 読み上げ速度。0.75(ゆっくり) / 0.9(標準) / 1.0(本番相当)
   * 本番のTOEICは概ね等速なので、慣れてきたら上げる想定。
   */
  getRate() {
    const v = parseFloat(localStorage.getItem('toeic_tts_rate'));
    return Number.isFinite(v) ? v : 0.9;
  },

  setRate(rate) {
    localStorage.setItem('toeic_tts_rate', String(rate));
  },

  pickVoice() {
    const voices = window.speechSynthesis.getVoices() || [];
    return voices.find(v => /^en[-_]US/i.test(v.lang) && /Google|Natural|Samantha|Zira|Aria/i.test(v.name))
        || voices.find(v => /^en[-_]US/i.test(v.lang))
        || voices.find(v => /^en/i.test(v.lang))
        || null;
  },

  makeUtterance(text, opts = {}) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = opts.rate || this.getRate();
    u.pitch = opts.pitch || 1.0;
    const voice = this.pickVoice();
    if (voice) u.voice = voice;
    return u;
  },

  speak(text) {
    if (!this.available()) {
      alert('お使いのブラウザは音声読み上げに対応していません。');
      return;
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(this.makeUtterance(text));
  },

  cancel() {
    if (this.available()) window.speechSynthesis.cancel();
  },

  /**
   * 複数の文を間を空けて順に読み上げる（Part 2 の問いかけ→応答A/B/C 用）
   * @param {Array<{text:string, pauseAfterMs?:number, pitch?:number}>} items
   * @param {{onEnd?:Function, onItem?:Function}} handlers
   */
  speakSequence(items, handlers = {}) {
    if (!this.available()) {
      alert('お使いのブラウザは音声読み上げに対応していません。');
      if (handlers.onEnd) handlers.onEnd();
      return;
    }
    window.speechSynthesis.cancel();

    let i = 0;
    const next = () => {
      if (i >= items.length) {
        if (handlers.onEnd) handlers.onEnd();
        return;
      }
      const item = items[i];
      if (handlers.onItem) handlers.onItem(i, item);
      const u = this.makeUtterance(item.text, { pitch: item.pitch });
      u.onend = () => {
        i++;
        const wait = item.pauseAfterMs != null ? item.pauseAfterMs : 500;
        setTimeout(next, wait);
      };
      // 読み上げに失敗しても止まらないよう次へ進める
      u.onerror = () => { i++; setTimeout(next, 200); };
      window.speechSynthesis.speak(u);
    };
    next();
  }
};

// 一部ブラウザは初回 getVoices() が空なので、読み込み完了時に取り直す
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => { /* キャッシュせず都度取得するため何もしない */ };
}

// Canvas 紙吹雪 (Confetti) アニメーション
const Confetti = {
  fire() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#3b82f6', '#a855f7', '#ec4899', '#22c55e', '#f59e0b', '#60a5fa'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.7) * 16,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    let frame = 0;
    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let activeCount = 0;

      particles.forEach(p => {
        if (p.opacity <= 0) return;
        activeCount++;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3; // 重力
        p.rotation += p.rSpeed;
        p.opacity -= 0.012;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      frame++;
      if (activeCount > 0 && frame < 180) {
        requestAnimationFrame(loop);
      } else {
        canvas.remove();
      }
    }
    loop();
  }
};
