"use strict";
class DcAddChips extends HTMLElement {
    constructor() {
        super();
        this.chipsArr = [];
        this._chips = new Set();
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
    connectedCallback() {
        const fakeInputElem = this.shadowRoot.querySelector('.chips-input');
        const actionableKeyValues = ["Enter", ...this.getAttribute('separators').split('')];
        fakeInputElem.placeholder = this.getAttribute('placeholder') || '';
        fakeInputElem.addEventListener('keydown', ($event) => {
            if (actionableKeyValues.indexOf($event.key) !== -1) {
                $event.preventDefault();
                if (fakeInputElem.value.length) {
                    this.value = `${this.value},${fakeInputElem.value}`;
                    fakeInputElem.value = '';
                }
            }
        });
    }
    get chips() {
        return this._chips;
    }
    get value() {
        return this._value;
    }
    set value(val) {
        this._value = val;
        const valueArr = val.split(',');
        valueArr.forEach((v) => {
            if (v) {
                this._chips.add(v);
            }
        });
        this.renderChips(this.chips);
        this.emitValue(this.value);
        this.setAttribute('value', this.value);
    }
    attributeChangedCallback(attrName, oldValue, newValue) {
        switch (attrName) {
            case ('value'): {
                if (!oldValue) {
                    this.value = newValue;
                }
                break;
            }
        }
    }
    renderChips(newChips) {
        const chipsContainer = this.shadowRoot.querySelector('.chips-container');
        chipsContainer.innerHTML = '';
        this.setAttribute('chips', this.chipsArr.toString());
        newChips.forEach(chip => {
            const chipElem = this.generateChip(chip);
            chipsContainer.appendChild(chipElem);
        });
    }
    generateChip(chipValue) {
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
        const deleteButtonElem = chipElem.querySelector('.delete-chip');
        deleteButtonElem.onclick = ($event) => {
            // Remove the DOM element from the parent
            const chipsContainerElem = $event.target.parentElement.parentElement;
            const chip = $event.target.parentElement;
            chipsContainerElem.removeChild(chip);
            // Remove the chipValue from the values
            this.chips.delete(chipValue);
            const newChipsArr = Array.from(this.chips);
            this.value = newChipsArr.join(',');
        };
        return chipElem;
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
