class DcCheckbox extends HTMLElement {
  boxContainer: HTMLDivElement;
  boxInput: HTMLInputElement;
  boxLabel: HTMLLabelElement;
  checked: boolean = false;
  labelText: string;
  boxPosition: string;

  constructor() {
    super();
    const style = document.createElement('style');
    const shadowRoot = this.attachShadow({ mode: 'open' });

    this.boxContainer = document.createElement('div');

    this.boxLabel = document.createElement('label');
    this.boxInput = document.createElement('input');

    this.boxContainer.classList.add('box-container');
    this.boxContainer.setAttribute('tabindex', '0');

    this.labelText = this.getAttribute('label-text') || 'Checkbox';
    this.boxPosition = this.getAttribute('box-position') || 'right';
    this.checked = this.getCheckedStateFromAttr(this.getAttribute('checked'));
    this.setLocalCheckState(this.checked);

    this.boxInput.type = 'checkbox';
    this.boxInput.id = this.id;
    this.boxLabel.setAttribute('for', this.id);

    this.updateLabel(this.labelText);

    this.addEventListener('keyup', (event) => {
      const actionableKeyValues = ["Enter", " ", "Space"];
      if (actionableKeyValues.indexOf(event.key) !== -1) {
        this.toggleCheckedState();
      }
    })

    this.createCheckBoxes(this.boxLabel);

    this.boxContainer.appendChild(this.boxInput);
    this.boxContainer.appendChild(this.boxLabel);

    style.textContent = this.styles();
    shadowRoot.appendChild(style);
    shadowRoot.appendChild(this.boxContainer);
  }

  static get observedAttributes() {
    return ['checked'];
  }

  triggerChange() {
    const changeEvent = new CustomEvent('change', {
      detail: { elemId: this.id, value: !this.checked }
    });

    this.dispatchEvent(changeEvent);
  }

  toggleCheckedState() {
    this.triggerChange();
    this.checked = !this.checked
    this.setLocalCheckState(this.checked);
  }

  attributeChangedCallback(attrName: string, oldValue: string, newValue: string) {
    switch (attrName) {
      case ('checked'): {
        if (newValue !== String(this.checked)) {
          this.checked = this.getCheckedStateFromAttr(newValue);
          this.setLocalCheckState(this.checked);
        }
        break;
      }
    }
  }

  _updateRendering(attrName: string, newVal: string) {
  }

  getCheckedStateFromAttr(attrVal: string | null) {
    if (attrVal !== null) {
      return attrVal === '' || attrVal === 'checked' || attrVal === 'true';
    }
    return false;
  }

  updateLabel(text: string | null) {
    this.boxLabel.insertAdjacentHTML('afterbegin', `<span>${text || 'Option'}</span>`);
  }

  setLocalCheckState(checkedState: boolean) {
    if (checkedState) {
      this.boxInput.checked = true;
      this.setAttribute('aria-checked', 'true');
    } else {
      this.boxInput.checked = false;
      this.setAttribute('aria-checked', 'false');
    }
  }

  styles() {
    return `
      :host {
        font-family: sans-serif;
        display: flex;
        align-items: normal;
      }
      
      .box-container {
        padding: 0.25rem 0.1rem;
      }

      input[type="checkbox"] {
        display: none;
      }

      input[type="checkbox"]:checked ~ label .svg-checkbox-checked {
        display: inherit;
      }

      input[type="checkbox"]:checked ~ label .svg-checkbox-unchecked {
        display: none;
      }

      label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        flex-direction: ${this.boxPosition === 'left' ? 'row-reverse' : 'row'}
      }

      label>span {
        margin: 0 1rem;
      }

      label .svg-checkbox-checked {
        display: none;
      }

      label .svg-checkbox-unchecked {
        display: inherit;
      }
    `;
  }

  createCheckBoxes(containerElem: HTMLElement) {
    const svgChecked = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const svgUnchecked = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    svgChecked.setAttribute('width', '24');
    svgChecked.setAttribute('height', '24');
    svgChecked.setAttribute('viewBox', '0 0  24 24');
    svgChecked.classList.add('svg-checkbox-checked');

    svgUnchecked.setAttribute('width', '24');
    svgUnchecked.setAttribute('height', '24');
    svgUnchecked.setAttribute('viewBox', '0 0  24 24');
    svgUnchecked.classList.add('svg-checkbox-unchecked');

    svgChecked.innerHTML = '<path d="M22 2v20h-20v-20h20zm2-2h-24v24h24v-24zm-5.541 8.409l-1.422-1.409-7.021 7.183-3.08-2.937-1.395 1.435 4.5 4.319 8.418-8.591z"/>'

    svgUnchecked.innerHTML = '<path d="M22 2v20h-20v-20h20zm2-2h-24v24h24v-24z"/>';

    containerElem.appendChild(svgChecked);
    containerElem.appendChild(svgUnchecked);
  }
}

window.customElements.define('dc-checkbox', DcCheckbox);