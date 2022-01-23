// Osilloscope canvas based on https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createAnalyser

const oscTemplate = document.createElement('template');
oscTemplate.innerHTML = `
<style>
  :host {
    --color-osc: rebeccapurple;
    width: inherit;
    height: inherit;
  }
  .canvas-container {
    height: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  canvas {
    border-radius: 50%;
  }
  
</style>
<div id="canvas-container" class="canvas-container">
  <canvas id="osc-canvas"></canvas>
</div>
`;

class DcOscilloscope extends HTMLElement {
  canvasElem: HTMLCanvasElement;
  canvasCtx: CanvasRenderingContext2D | null;
  dataArray: Uint8Array;
  analyser: AnalyserNode;
  width: number;
  height: number;
  bufferLength: any;
  oscilloscopeRAF: any;
  lineColor: string;
  borderColor: string;
  resizeObserver: ResizeObserver;

  constructor() {
    super();
    
    this.attachShadow({mode: 'open'});
    
    this.shadowRoot.appendChild(oscTemplate.content.cloneNode(true));
    
    this.canvasElem = <HTMLCanvasElement>this.shadowRoot.getElementById('osc-canvas');
    this.canvasCtx = this.canvasElem.getContext('2d');

    this.lineColor = this.getAttribute('line-color') || '#d99c9cde';
    this.borderColor = this.getAttribute('border-color') || '#443355';

    const canvasContainerElem = this.shadowRoot.getElementById('canvas-container');
    this.resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        if(entry.contentBoxSize) {
          this.canvasElem.width = Math.min(entry.contentRect.width, entry.contentRect.height);
          this.canvasElem.height = Math.min(entry.contentRect.width, entry.contentRect.height);
          this.width = this.canvasElem.width;
          this.height = this.canvasElem.height;
          
          this.stop();
          this.start();
        }
      }
    });
    this.resizeObserver.observe(canvasContainerElem);
  }

  setStream(stream: MediaStream) {
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    this.analyser = audioCtx.createAnalyser();
    this.analyser.fftSize = 2048;

    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
    source.connect(this.analyser);
  }

  draw(canvasCtx: CanvasRenderingContext2D) {
    if (!this.dataArray) {
      return
    }

    const middlePoint = this.height / 2;

    this.oscilloscopeRAF = requestAnimationFrame(() => this.draw(canvasCtx));
    this.analyser.getByteTimeDomainData(this.dataArray);

    canvasCtx.clearRect(0, 0, this.width, this.height);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = this.lineColor;
    canvasCtx.beginPath();

    const sliceWidth = this.height * 1.0 / this.bufferLength;
    
    let x = 0;

    for (let i = 0; i < this.bufferLength; i++) {
      const v = this.dataArray[i] / 128.0;
      const y = v * middlePoint;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }
    canvasCtx.lineTo(this.width, middlePoint);
    canvasCtx.stroke();
    canvasCtx.closePath();
    
    this.drawContainer(canvasCtx);

  }

  drawContainer(canvasCtx: CanvasRenderingContext2D) {
    canvasCtx.beginPath();
    var gradient = canvasCtx.createRadialGradient(
      this.width / 2, this.width / 2, Math.PI * 2,
      this.width / 2, this.width / 2, this.width / 2
    );
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.7, '#500a0a');
    gradient.addColorStop(1, '#2d1212');
    canvasCtx.fillStyle = gradient;
    
    canvasCtx.arc(this.width / 2, this.height / 2, this.height / 2, 0, Math.PI * 2);
    canvasCtx.fill();
    canvasCtx.closePath();

    canvasCtx.beginPath();
    canvasCtx.strokeStyle = this.borderColor;
    canvasCtx.lineWidth = 5;
    
    canvasCtx.stroke();

  }

  start() {
    if (this.canvasCtx) {
      this.draw(this.canvasCtx);
    }
  }

  stop() {
    if (this.canvasCtx) {
      this.canvasCtx.clearRect(0, 0, this.width, this.height);
      cancelAnimationFrame(this.oscilloscopeRAF);
    }
  }

  disconnectResizeObserver() {
    this.resizeObserver.disconnect();
  }

 
  static get observedAttributes() {
    return [''];
  }

  connectedCallback(): void {
  }

  attributeChangedCallback(attrName: string, oldValue: string, newValue: string) {
    switch (attrName) {
      case (''): {
        if (newValue !== oldValue) {
          //
        }
        break;
      }
    }
  }

}

window.customElements.define('dc-oscilloscope', DcOscilloscope);

