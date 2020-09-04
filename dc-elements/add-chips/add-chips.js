"use strict";
class DcAddChips extends HTMLElement {
    constructor() {
        super();
        this.chipsArr = [];
        this.chipsContainer = document.createElement('div');
        // Debounce
        // API call
        // Autocomplete list
        // Navigation
        // Enter = keep open
        // Click = close and clear
        const shadowRoot = this.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        const fakeInput = document.createElement('pre');
        this.chipsContainer.classList.add('chips-container');
        fakeInput.addEventListener('keydown', (event) => {
            const actionableKeyValues = ["Enter"];
            if (actionableKeyValues.indexOf(event.key) !== -1) {
                event.preventDefault();
                console.log('enter');
                if (fakeInput.innerText.length) {
                    this.chipsArr = this.chipsArr.concat(...[fakeInput.innerText]);
                    this.renderChips(this.chipsArr);
                    fakeInput.innerText = '';
                }
            }
        });
        fakeInput.classList.add('input');
        fakeInput.setAttribute('contenteditable', 'true');
        fakeInput.innerHTML = 'lorem';
        style.textContent = this.styles();
        shadowRoot.appendChild(style);
        shadowRoot.appendChild(this.chipsContainer);
        shadowRoot.appendChild(fakeInput);
    }
    static get observedAttributes() {
        return ['chips'];
    }
    attributeChangedCallback(attrName, oldValue, newValue) {
        switch (attrName) {
            case ('chips'): {
                console.log(newValue);
                if (!oldValue) {
                    this.chipsArr = this.chipsArr.concat(...newValue.split(','));
                    this.renderChips(this.chipsArr);
                }
                break;
            }
        }
    }
    renderChips(newChips) {
        this.chipsContainer.innerHTML = '';
        console.log(this.chipsArr.toString());
        this.setAttribute('chips', this.chipsArr.toString());
        let chipElem;
        let chipLabelElem;
        let deleteChipElem;
        newChips.map(chip => {
            chipElem = document.createElement('div');
            deleteChipElem = document.createElement('div');
            chipLabelElem = document.createElement('div');
            chipElem.classList.add('chip');
            chipLabelElem.innerText = chip;
            deleteChipElem.classList.add('delete-chip');
            deleteChipElem.innerText = 'x';
            deleteChipElem.addEventListener('pointerdown', () => {
                this.chipsArr = newChips.filter(curentChip => curentChip != chip);
                this.renderChips(this.chipsArr);
            });
            chipElem.appendChild(chipLabelElem);
            chipElem.appendChild(deleteChipElem);
            this.chipsContainer.appendChild(chipElem);
        });
    }
    styles() {
        return `
      :host {
        color: darkslategray;
      }
      .input {
        background: #eee;
        padding: 0.4rem 0.3rem;
        border: lightgray;
        white-space: pre;
      }
      .chips-container {
        display: flex;
        min-height: 2rem;
        flex-wrap: wrap;
      }
      .chip {
        display: flex;
        background: rebeccapurple;
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
        padding-left: 0.8rem;
        color: darkgray;
        cursor: pointer;
      }
      `;
    }
}
window.customElements.define('dc-add-chips', DcAddChips);
