import * as THREE from "three";

export default class EditorTexture {
  private readonly width: number = 512;
  private readonly height: number = 512;

  private canvas = THREE.createCanvasElement();
  private ctx = this.canvas.getContext("2d")!;
  private readonly fontSize: number;
  private text: string = "";
  private line: number = 1;
  private readonly fillStyle: string;

  private readonly escapes = ["Shift", "Alt", "Control", "AltGraph"];

  private readonly _texture;

  private blinkState = true;

  private lastLineWidth: number = 0;

  constructor(
    width: number,
    height: number,
    options: {
      fontSize?: number;
      fontColor?: string;
    } = { fontSize: 50, fontColor: "White" },
  ) {
    this.width = width;
    this.height = height;
    this.fontSize = options.fontSize || 50;
    this.fillStyle = options.fontColor || "White";

    this._texture = new THREE.CanvasTexture(this.canvas);
    this.canvas.width = width;
    this.canvas.height = height;

    this.canvas.id = "editorTexture";
    this.canvas.style.width = `${this.canvas.width}px`;
    this.canvas.style.height = `${this.canvas.height}px`;
  }

  private print() {
    const printText = this.cleanText();

    this.ctx.clearRect(
      0,
      (this.line - 1) * this.fontSize,
      this.width,
      this.height,
    );

    // Remove caret
    const caret = {
      x: this.lastLineWidth + this.fontSize,
      y: (this.line - 2) * this.fontSize,
      w: 2,
      h: this.fontSize,
    };

    this.ctx.clearRect(caret.x - 1, caret.y, caret.w + 2, caret.h);

    this.ctx.fillStyle = this.fillStyle;
    this.ctx.font = `${this.fontSize}px mono`;
    this.ctx.fillText(
      printText,
      this.fontSize,
      this.line * this.fontSize,
      this.width,
    );
    this._texture.needsUpdate = true;
  }

  private addHiddenStyle() {
    const style = document.createElement("style");
    style.innerHTML = `
        .hidden-span {
          visibility: hidden;
          white-space: nowrap;
          position: absolute;
          top: -9999px;
          box-sizing: border-box;
        }
      `;
    document.head.appendChild(style);
    return style;
  }

  private getTextWidth(char: string, font: string) {
    const style = this.addHiddenStyle();

    // Create a hidden span element
    const span = document.createElement("span");
    span.className = "hidden-span";
    span.textContent = char;
    span.style.font = font;

    // Append span to the body
    document.body.appendChild(span);

    // Get the width of the character
    const width = span.getBoundingClientRect().width;

    // Remove the span from the body
    document.body.removeChild(span);

    document.head.removeChild(style);

    return width;
  }

  private cleanText() {
    let printText;

    const characters = this.text.split("");
    const lastLineBreak = characters.findLastIndex((v) => v === "\n");

    if (lastLineBreak !== -1) {
      printText = this.text.slice(lastLineBreak, this.text.length);
    } else {
      printText = this.text;
    }

    return printText.replaceAll("\n", "");
  }

  updateCaret() {
    const printText = this.cleanText();

    const textWidth = this.getTextWidth(printText, `${this.fontSize}px mono`);

    const caret = {
      x: textWidth + this.fontSize,
      y: (this.line - 1) * this.fontSize,
      w: 2,
      h: this.fontSize,
    };

    this.ctx.fillStyle = this.fillStyle;
    if (this.blinkState) {
      this.ctx.fillRect(caret.x, caret.y, caret.w, caret.h);
    } else {
      this.ctx.clearRect(caret.x - 1, caret.y, caret.w + 2, caret.h);
    }
    this.blinkState = !this.blinkState;
    this._texture.needsUpdate = true;
  }

  printKey(key: string) {
    if (this.escapes.includes(key)) return;
    if (key === "Backspace") {
      if (this.text[this.text.length - 1] === "\n") {
        this.lastLineWidth = this.getTextWidth(
          this.cleanText(),
          `${this.fontSize}px mono`,
        );
        this.line--;
      }
      this.text = this.text.slice(0, this.text.length - 1);
      this.print();
      return;
    }
    if (key === "Delete") {
      this.text = this.text.slice(1, this.text.length);
      this.print();
      return;
    }
    if (key === "Enter") {
      this.lastLineWidth = this.getTextWidth(
        this.cleanText(),
        `${this.fontSize}px mono`,
      );
      this.line++;
      this.text += "\n";
      this.print();
      return;
    }

    this.text += key;
    this.print();
  }

  get texture() {
    return this._texture;
  }
}
