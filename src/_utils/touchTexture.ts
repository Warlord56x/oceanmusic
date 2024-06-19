import * as THREE from "three";

interface TrailPoint {
  x: number;
  y: number;
  age: number;
  force: number;
}

export default class TouchTexture {
  private readonly size: number;
  private readonly maxAge: number;
  private readonly radius: number;
  public readonly trail: TrailPoint[];
  private readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  public texture: THREE.Texture;

  constructor(size: number) {
    this.size = size;
    this.maxAge = 120;
    this.radius = 0.15;
    this.trail = [];

    this.canvas = document.createElement("canvas");
    this.canvas.width = this.canvas.height = this.size;
    this.ctx = this.canvas.getContext("2d")!;
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.texture = new THREE.Texture(this.canvas);

    this.canvas.id = "touchTexture";
    this.canvas.style.width =
      this.canvas.style.height = `${this.canvas.width}px`;
  }

  public update(_delta: number): void {
    this.clear();

    // Age points
    this.trail.forEach((point, i) => {
      point.age++;
      // Remove old
      if (point.age > this.maxAge) {
        this.trail.splice(i, 1);
      }
    });

    this.trail.forEach((point) => {
      this.drawTouch(point);
    });

    this.texture.needsUpdate = true;
  }

  private clear(): void {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public addTouch(point: { x: number; y: number }): void {
    let force = 0;
    const last = this.trail[this.trail.length - 1];
    if (last) {
      const dx = last.x - point.x;
      const dy = last.y - point.y;
      const dd = dx * dx + dy * dy;
      force = Math.min(dd * 10000, 1);
    }
    this.trail.push({ x: point.x, y: point.y, age: 0, force });
  }

  private drawTouch(point: TrailPoint): void {
    const pos = {
      x: point.x + this.size / 2,
      y: 1 - point.y + this.size / 2,
    };

    let intensity = 1;
    if (point.age < this.maxAge * 0.3) {
      intensity = this.easeOutSine(point.age / (this.maxAge * 0.3), 0, 1, 1);
    } else {
      intensity = this.easeOutSine(
        1 - (point.age - this.maxAge * 0.3) / (this.maxAge * 0.7),
        0,
        1,
        1,
      );
    }

    intensity *= point.force;

    const radiusVal = this.size * this.radius * intensity;
    const grd = this.ctx.createRadialGradient(
      pos.x,
      pos.y,
      radiusVal * 0.25,
      pos.x,
      pos.y,
      radiusVal,
    );
    grd.addColorStop(0, `rgba(255, 255, 255, 0.2)`);
    grd.addColorStop(1, "rgba(0, 0, 0, 0.0)");

    this.ctx.beginPath();
    this.ctx.fillStyle = grd;
    this.ctx.arc(pos.x, pos.y, radiusVal, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private easeOutSine(t: number, b: number, c: number, d: number): number {
    return c * Math.sin((t / d) * (Math.PI / 2)) + b;
  }
}
