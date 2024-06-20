import { Music } from "@/lib/data/music";
import { Observable, Subject } from "rxjs";

class MusicService {
  public isPlaying = false;

  public bassAnalyser!: AnalyserNode;
  public midAnalyser!: AnalyserNode;
  public trebleAnalyser!: AnalyserNode;

  public audio!: HTMLAudioElement;
  private audioContext!: AudioContext;
  private source!: MediaElementAudioSourceNode;

  private readonly lowPassFilter;
  private readonly bandPassFilter;
  private readonly highPassFilter;

  private _music!: Music;

  private musicSubject = new Subject<Music>();
  private musicObserver = this.musicSubject.asObservable();

  private musicPlayingSubject = new Subject<boolean>();
  private musicPlaying$ = this.musicPlayingSubject.asObservable();

  set music(music: Music) {
    this.audio.src = music.audio;
    this._music = music;
    this.isPlaying = false;
    this.musicPlayingSubject.next(false);
    this.musicSubject.next(music);
    console.log(this.audio.duration);
  }

  get music() {
    return this._music;
  }

  onPlayStateChange(cb: (state: boolean) => void) {
    return this.musicPlaying$.subscribe(cb);
  }

  onMusicChange(cb: (music: Music) => void) {
    return this.musicObserver.subscribe(cb);
  }

  set src(src: string) {
    this.audio.src = src;
    this.play();
  }

  set volume(volume: number) {
    if (this.audio) {
      this.audio.volume = volume;
    }
  }

  play() {
    this.audio.play();
    this.audioContext.resume();
    this.isPlaying = true;
    this.musicPlayingSubject.next(true);
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    this.musicPlayingSubject.next(false);
  }

  constructor() {
    if (typeof window !== "undefined") {
      this.audio = new Audio("Digital Dreams.mp3");
      this.audio.crossOrigin = "anonymous";
      this.audioContext = new AudioContext();

      this.bassAnalyser = this.audioContext.createAnalyser();
      this.midAnalyser = this.audioContext.createAnalyser();
      this.trebleAnalyser = this.audioContext.createAnalyser();

      this.lowPassFilter = this.audioContext.createBiquadFilter();
      this.bandPassFilter = this.audioContext.createBiquadFilter();
      this.highPassFilter = this.audioContext.createBiquadFilter();

      this.source = this.audioContext.createMediaElementSource(this.audio);
      this.source.connect(this.audioContext.destination);

      this.source.connect(this.lowPassFilter);
      this.lowPassFilter.connect(this.bassAnalyser);

      this.source.connect(this.bandPassFilter);
      this.bandPassFilter.connect(this.midAnalyser);

      this.source.connect(this.highPassFilter);
      this.highPassFilter.connect(this.trebleAnalyser);

      this.source.connect(this.audioContext.destination);

      this.lowPassFilter.type = "lowpass";
      this.lowPassFilter.frequency.value = 250; // Cutoff frequency for bass
      this.lowPassFilter.Q.value = 0.5;

      this.bandPassFilter.type = "bandpass";
      this.bandPassFilter.frequency.value = 4000; // Center frequency for midrange
      this.bandPassFilter.Q.value = 1; // Q value determines the width of the band

      this.highPassFilter.type = "highpass";
      this.highPassFilter.frequency.value = 14000; // Cutoff frequency for treble
      this.highPassFilter.Q.value = 0.5;
    }
  }
}

const dataService = new MusicService();
export default dataService;
