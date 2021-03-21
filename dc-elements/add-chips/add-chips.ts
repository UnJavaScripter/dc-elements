class DcAddChips extends HTMLElement {
  chipsArr: string[] = [];
  _value: string[];
  
  constructor() {
    super();
    // Debounce
    // API call
    // Autocomplete list
      // Navigation
      // Enter = keep open
      // Click = close and clear

    const shadowRoot = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    const fakeInput = document.createElement('input');
    const chipsContainer = document.createElement('div');

    chipsContainer.classList.add('chips-container');

    fakeInput.classList.add('chips-input');
    fakeInput.setAttribute('contenteditable', 'true');

    style.textContent = this.styles();
    shadowRoot.append(style, chipsContainer, fakeInput);
  }

  static get observedAttributes() {
    return ['value', 'separators'];
  }

  connectedCallback(): void {
    const fakeInputElem = <HTMLInputElement>this.shadowRoot.querySelector('.chips-input');
    const actionableKeyValues = ["Enter", ...this.getAttribute('separators').split('')];

    fakeInputElem.placeholder = this.getAttribute('placeholder') || '';

    fakeInputElem.addEventListener('keydown', ($event: KeyboardEvent) => {
      if(actionableKeyValues.indexOf($event.key) !== -1) {
        $event.preventDefault();
        if(fakeInputElem.value.length) {
          this.value = this.value.concat(fakeInputElem.value);
          fakeInputElem.value = '';
        }
      }
    });
  }

  get value() {
    return this._value;
  }

  set value(val: string[]) {
    if (!this._value) {
      this._value = [];
    }
    const stringValue = val.join(',');
    this._value = val;

    this.renderChips(this.value);
    this.emitValue(stringValue);
    this.setAttribute('value', stringValue)
  }
  

  attributeChangedCallback(attrName: string, oldValue: string, newValue: string) {
    switch (attrName) {
      case ('value'): {
        if(!oldValue) {
          const newValArr = newValue.split(',');
          this.value = this.value ? this.value.concat(newValArr) : newValArr;
        }
        break;
      }
    }
  }

  renderChips(newChips: string[]) {
    const chipsContainer = this.shadowRoot.querySelector('.chips-container')
    chipsContainer.innerHTML = '';
    
    this.setAttribute('chips', this.chipsArr.toString());
    
    newChips.map(chip => {
      const chipElem = this.generateChip(chip);
      chipsContainer.appendChild(chipElem);
    });
  }

  generateChip(chipValue: string) {
    const chipElem = document.createElement('div');
    const constDismissButtonSlot = document.createElement('slot');
    
    chipElem.classList.add('chip');

    constDismissButtonSlot.setAttribute('name', 'icon-dismiss-chip');
    constDismissButtonSlot.innerText = 'x';

    chipElem.innerHTML = `
      <div class="chip-value">
        ${chipValue}
      </div>
      <button class="delete-chip">
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
      </button>
    `;

    const deleteButtonElem = <HTMLButtonElement>chipElem.querySelector('.delete-chip');

    deleteButtonElem.onclick = ($event: MouseEvent) => {
      // Remove the DOM element from the parent
      const chipsContainerElem = ($event.target as HTMLElement).parentElement.parentElement
      const chip = ($event.target as HTMLElement).parentElement;
      chipsContainerElem.removeChild(chip);

      // Remove the chipValue from the values
      this.value = this.value.filter(val => val !== chipValue);
    };
    
    return chipElem;
  }


  emitValue(value: string) {
    const event = new CustomEvent('change', {
      detail: {
        value
      },
      bubbles: true
    });

    this.dispatchEvent(event);
  }
  
  styles() {
    return `
      :host {
        --color-primary: hsla(300, 60%, 30%, 1);
        --color-secondary: hsla(300, 60%, 90%, 1);
      }
      .chips-input {
        background: #eee;
        padding: 0.4rem 0.3rem;
        border: lightgray;
        white-space: pre;
        width: 100%;
      }
      .chips-container {
        display: flex;
        min-height: 2rem;
        flex-wrap: wrap;
      }
      .chip {
        display: flex;
        justify-content: center;
        gap: 0.9rem;
        background-color: var(--color-primary);
        color: azure;
        padding: 0.2rem 0.5rem;
        margin: 0.1rem 0.5rem;
        border-radius: 0.3rem;
        height: 1.2rem;
      }
      .chip>div {
        margin: auto;
      }
      .delete-chip {
        appearance: none;
        background: transparent;
        border: none;
        color: darkgray;
        cursor: pointer;
        padding: 0;
      }
      .delete-chip svg {
        fill: var(--color-secondary);
        height: 1.2rem;
        width: 1rem;
      }
    `;
  }

}

window.customElements.define('dc-add-chips', DcAddChips);