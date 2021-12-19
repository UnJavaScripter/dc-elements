const template = document.createElement('template');
template.innerHTML = `
<style>
  :host {
    --color-active: hsla(200, 25%, 80%, 1);
    --color-hover: hsla(200, 25%, 50%, 1);
    --color-step: hsla(200, 25%, 30%, 1);

    display: flex;
    align-items: center;
    flex-direction: row;
    width: 100%;
    height: 2rem;
  }

  .step-selector-container {
    display: flex;
    justify-content: space-evenly;
    width: 100%;
  }

  .action-button {
    appearance: none;
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .icon-less svg,
  .icon-more svg {
    fill: var(--color-active);
    background-color: var(--color-hover);
    border-radius: 100%;
    height: 2rem;
    width: 2rem;
    padding: 0.2rem;
    box-sizing: border-box;
  }

  .step {
    appearance: none;
    background: transparent;
    border: none;
    background-color: var(--color-step);
    height: 2rem;
    width: 2rem;
    border-radius: 100%;
  }

  .step:hover, .step:focus {
    background-color: var(--color-hover);
    cursor: pointer;
  }

  .step.active {
    background-color: var(--color-active);
  }

</style>
<button id="button-less" class="action-button" tabindex="0">
  <div class="icon-less">
    <slot name="icon-less">
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 13H5v-2h14v2z"/></svg>
    </slot>
  </div>
</button>

<div class="step-selector-container"></div>

<button id="button-more" class="action-button" tabindex="0">
  <div class="icon-more">
    <slot name="icon-more">
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
    </slot>
  </div>
</button>
`;

class DcStepSelector extends HTMLElement {
  _value: number;
  min: number;
  max: number;

  constructor() {
    super();
    
    this.attachShadow({mode: 'open'});
    
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    const lessButtonElement = this.shadowRoot.getElementById('button-less');
    const moreButtonElement = this.shadowRoot.getElementById('button-more');
    
    lessButtonElement.onclick = this.removeStep.bind(this);
    moreButtonElement.onclick = this.addStep.bind(this);
    
  }

  static get observedAttributes() {
    return ['color'];
  }

  connectedCallback(): void {
    const initialValue = Number(this.getAttribute('value')) || 1;
    this.min = !isNaN(Number(this.getAttribute('min'))) ? Number(this.getAttribute('min')) : 1;
    this.max = Number(this.getAttribute('max')) || 10;

    const stepSelectorContainer = this.shadowRoot.querySelector('.step-selector-container');
    
    for(let i = this.min || 1; i <= this.max ; i++) {
      const stepElement = document.createElement('button');
      
      stepElement.setAttribute('data-val', String(i));
      stepElement.setAttribute('aria-label', String(i));
      stepElement.classList.add('step');
      stepElement.onclick = this.stepSelected.bind(this)
      stepSelectorContainer.appendChild(stepElement);
    }
    
    this.value = initialValue;
  }

  get value(): number {
    return this._value;
  }

  set value(newValue: number) {
    if ((this.min <= newValue) && (newValue <= this.max) ) {
      this._value = newValue;
      this.highlightUpTo(this.value);
      this.emitValue(this.value);
    }
  }

  highlightUpTo(value: number) {
    const stepSelectorContainer = this.shadowRoot.querySelector('.step-selector-container');
    
    for (let step of stepSelectorContainer.children) {
      const stepValue = Number((step as HTMLElement).dataset.val);
      step.setAttribute('aria-label', String(stepValue));

      if (stepValue < value) {
        step.classList.add('active');
      } else if (stepValue === value) {
        step.classList.add('active');
        step.setAttribute('aria-label', `selected: ${stepValue}`);
      } else {
        step.classList.remove('active');
      }
    }
  }

  addStep() {
    ++this.value;
  }

  removeStep() {
    --this.value;
  }

  stepSelected($event: PointerEvent | MouseEvent) {
    const step = $event.target;
    const value = (step as HTMLElement).dataset.val;
    this.value = Number(value);
  }

  emitValue(value: number) {
    const event = new CustomEvent('change', {
      detail: {
        value
      },
      bubbles: true
    });

    this.dispatchEvent(event);
  }
}

window.customElements.define('dc-step-selector', DcStepSelector);