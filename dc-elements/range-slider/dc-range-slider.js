"use strict";
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

  .slider-container {
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

  .icon-less>svg,
  .icon-more>svg {
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
  <slot class="icon-less" name="icon-less">
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 13H5v-2h14v2z"/></svg>
  </slot>
</button>

<div class="slider-container"></div>

<button id="button-more" class="action-button" tabindex="0">
  <slot class="icon-more" name="icon-more">
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
  </slot>
</button>
`;
class DcRangeSlider extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        const lessButtonElement = this.shadowRoot.getElementById('button-less');
        const moreButtonElement = this.shadowRoot.getElementById('button-more');
        lessButtonElement.onclick = this.removeStep.bind(this);
        console.log(lessButtonElement);
        moreButtonElement.onclick = this.addStep.bind(this);
        console.log(moreButtonElement);
    }
    static get observedAttributes() {
        return ['color'];
    }
    connectedCallback() {
        const initialValue = Number(this.getAttribute('value')) || 1;
        this.min = !isNaN(Number(this.getAttribute('min'))) ? Number(this.getAttribute('min')) : 1;
        this.max = Number(this.getAttribute('max')) || 10;
        const sliderContainer = this.shadowRoot.querySelector('.slider-container');
        for (let i = this.min || 1; i <= this.max; i++) {
            const stepElement = document.createElement('button');
            stepElement.setAttribute('data-val', String(i));
            stepElement.setAttribute('aria-label', String(i));
            stepElement.classList.add('step');
            stepElement.onclick = this.stepSelected.bind(this);
            sliderContainer.appendChild(stepElement);
        }
        this.value = initialValue;
    }
    get value() {
        return this._value;
    }
    set value(newValue) {
        if ((this.min <= newValue) && (newValue <= this.max)) {
            this._value = newValue;
            this.highlightUpTo(this.value);
            this.emitValue(this.value);
        }
    }
    highlightUpTo(value) {
        const sliderContainer = this.shadowRoot.querySelector('.slider-container');
        for (let step of sliderContainer.children) {
            const stepValue = Number(step.dataset.val);
            step.setAttribute('aria-label', String(stepValue));
            if (stepValue < value) {
                step.classList.add('active');
            }
            else if (stepValue === value) {
                step.classList.add('active');
                step.setAttribute('aria-label', `selected: ${stepValue}`);
            }
            else {
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
    stepSelected($event) {
        const step = $event.target;
        const value = step.dataset.val;
        this.value = Number(value);
    }
    emitValue(value) {
        const event = new CustomEvent('change', {
            detail: {
                value
            },
            bubbles: true
        });
        this.dispatchEvent(event);
    }
}
window.customElements.define('dc-range-slider', DcRangeSlider);
