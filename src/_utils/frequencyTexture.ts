import * as THREE from "three";

export default class FrequencyTexture {
  private readonly width: number = 1024;
  private readonly height: number = 1;

  public canvas = THREE.createCanvasElement();
  private ctx = this.canvas.getContext("2d")!;

  private readonly _texture;

  constructor(width: number = 1024, height: number = 200) {
    this.width = width;
    this.height = height;

    this._texture = new THREE.CanvasTexture(this.canvas);
    this.canvas.width = width;
    this.canvas.height = height;

    this.canvas.id = "frequencyTexture";
    this.canvas.style.width = `${this.canvas.width}px`;
    this.canvas.style.height = `${this.canvas.height}px`;
  }

  update(_delta: number, freqData: Uint8Array): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    freqData.forEach((value, index) => {
      this.ctx.fillStyle = `rgb(${value}%, ${value}%, ${value}%)`;
      this.ctx.fillRect(index, 0, 1, 200);
    });

    this._texture.needsUpdate = true;
  }

  get texture() {
    return this._texture;
  }
}
