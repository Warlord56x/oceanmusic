import * as THREE from "three";

export default class GradientTexture {
  private readonly width: number = 512;
  private readonly height: number = 512;

  private canvas = THREE.createCanvasElement();
  private ctx = this.canvas.getContext("2d")!;

  private readonly _texture;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    this._texture = new THREE.CanvasTexture(this.canvas);
    this.canvas.width = width;
    this.canvas.height = height;

    this.canvas.id = "gradientTexture";
    this.canvas.style.width = `${this.canvas.width}px`;
    this.canvas.style.height = `${this.canvas.height}px`;

    this.createRadialGradient();
  }

  private createRadialGradient() {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const radius = Math.min(this.width, this.height) / 2;

    const gradient = this.ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      radius,
    );

    gradient.addColorStop(0, "White");
    gradient.addColorStop(1, "Black");

    // Apply gradient to the canvas
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw a circle with the gradient as the fill style
    this.ctx.fillStyle = "black";
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius / 8, 0, 2 * Math.PI);
    this.ctx.fill();

    this._texture.needsUpdate = true;
  }

  get texture() {
    return this._texture;
  }
}
