
class DcCheckbox extends HTMLElement {
  constructor(checkedCallback) {
    super();
    const style = document.createElement('style');
    const shadowRoot = this.attachShadow({ mode: 'open' });

    this.boxContainer = document.createElement('div');

    this.boxLabel = document.createElement('label');
    this.boxInput = document.createElement('input');

    this.boxInput.type = 'checkbox';
    this.boxInput.checked = null;

    this.boxInput
      .addEventListener('change', () => {
        const changeEvent = new CustomEvent('change', {
          detail: {elemId: this.elemId, value: this.checked}
        });
        // Toggle the current state inside the component
        this.checked = !this.checked;

        // Populate the changes locally
        this.setLocalCheckState(this.checked);

        this.dispatchEvent(changeEvent);
      });

    style.textContent = this.styles();

    this.createCheckBoxes(this.boxLabel);

    shadowRoot.appendChild(style);

    this.boxContainer.appendChild(this.boxInput);
    this.boxContainer.appendChild(this.boxLabel);

    shadowRoot.appendChild(this.boxContainer);
  }

  static get observedAttributes() {
    return ['label-text', 'checked', 'elem-id'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (newValue !== oldValue) {
      this._updateRendering(name, oldValue, newValue);
    }
  }

  _updateRendering(attrName, oldVal, newVal) {
    switch (attrName) {
      case ('label-text'): {
        this.labelText = newVal;
        this.boxLabel.insertAdjacentHTML('afterbegin', `<span>${this.labelText}</span>`);
        break;
      }
      case ('checked'): {
        this.checked = newVal === '' || newVal === 'checked' || newVal === 'true';
        this.setLocalCheckState(this.checked);
        break;
      }
      case ('elem-id'): {
        this.elemId = newVal;
        this.boxInput.id = this.elemId;
        this.boxLabel.setAttribute('for', this.elemId);
        break;
      }
    }
  }

  setLocalCheckState(checkedState) {
    if (checkedState) {
      this.boxInput.checked = true;
      this.setAttribute('checked', '');
      this.boxInput.setAttribute('checked', ''); // necessary?
    } else {
      this.boxInput.checked = false;
      this.removeAttribute('checked');
      this.boxInput.removeAttribute('checked'); // necessary?
    }
  }

  styles() {
    return `
      :host {
        font-family: sans-serif;
        display: flex;
        align-items: normal;
      }

      div {
        width: 100%;
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
      }

      label .svg-checkbox-checked {
        display: none;
      }

      label .svg-checkbox-unchecked {
        display: inherit;
      }
    `;
  }

  createCheckBoxes(containerElem) {
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