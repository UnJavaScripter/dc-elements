"use strict";
class DCAnyRating extends HTMLElement {
    constructor() {
        super();
        this.value = 0;
        this.total = 5;
        this.static = false;
        this.ratingContainer = document.createElement('div');
        this.shadow = this.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        this.templateId = this.getAttribute('template-id');
        this.thingColorFull = this.getAttribute('full-color') || 'black';
        this.thingColorEmpty = this.getAttribute('empty-color');
        this.thingColorHover = this.getAttribute('hover-color');
        this.thingStrokeColor = this.getAttribute('stroke-color') || 'black';
        this.value = Number(this.getAttribute('value'));
        this.total = Number(this.getAttribute('total'));
        const staticAttr = this.getAttribute('static');
        this.static = staticAttr === 'true' || staticAttr === '';
        this.ratingContainer.setAttribute('class', 'container');
        this.ratingContainer.setAttribute('tabindex', '0');
        if (this.static) {
            this.ratingContainer.classList.add('static');
        }
        style.textContent = this.css();
        this.shadow.appendChild(style);
    }
    css() {
        return `
      .container {
        display: flex;
        flex-direction: row;
        height: 100%;
      }
      .container:active {
        outline: none;
      }
      svg {
        width: 100%;
        height: auto;
        stroke: ${this.thingStrokeColor}
      }
      .full {
        fill: ${this.thingColorFull};
      }
      :not(.static) svg:hover {
        cursor: pointer;
      }
      .empty {
        fill: ${this.thingColorFull};
        ${this.thingColorEmpty ? `fill: ${this.thingColorEmpty}` : 'fill-opacity: 30%;'}
      }
      :not(.static) .empty:hover {
        ${this.thingColorHover ? `fill: ${this.thingColorHover}` : 'fill-opacity: 60%;'}
      }
    `;
    }
    renderStars() {
        var _a, _b, _c;
        this.ratingContainer.innerHTML = '';
        const template = document.getElementById(String(this.templateId));
        const templateContent = template.content;
        const templateElement = templateContent.firstElementChild;
        const cloneNodes = [];
        for (let i = 0; i < this.total; i++) {
            (_a = templateElement) === null || _a === void 0 ? void 0 : _a.classList.remove('full', 'empty');
            if (i < this.value) {
                (_b = templateElement) === null || _b === void 0 ? void 0 : _b.classList.add('full');
            }
            else {
                (_c = templateElement) === null || _c === void 0 ? void 0 : _c.classList.add('empty');
            }
            const templateElementClone = templateElement.cloneNode(true);
            if (!this.static) {
                templateElementClone.addEventListener('click', () => {
                    this.handleClick(i + 1);
                });
            }
            cloneNodes.push(templateElementClone);
        }
        this.ratingContainer.append(...cloneNodes);
        this.shadow.appendChild(this.ratingContainer);
    }
    handleClick(starPosition) {
        this.value = starPosition;
        this.setAttribute('value', String(starPosition));
        this.renderStars();
        this.setAttribute('value', String(this.value));
        const ratingChangedEvent = new CustomEvent('rating-changed', {
            detail: { total: this.total, value: this.value }
        });
        this.dispatchEvent(ratingChangedEvent);
    }
    static get observedAttributes() {
        return ['aria-label', 'value', 'total', 'static'];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (newValue !== oldValue) {
            this._updateRendering(name, oldValue, newValue);
        }
    }
    _updateRendering(attrName, oldVal, newVal) {
        if (oldVal === newVal && oldVal !== null) {
            return;
        }
        switch (attrName) {
            case ('aria-label'): {
                this.ratingContainer.setAttribute('aria-label', String(newVal));
                break;
            }
            case ('value'): {
                this.value = Number(newVal);
                break;
            }
            case ('total'): {
                this.total = Number(newVal);
                break;
            }
            case ('static'): {
                this.static = newVal === '' || newVal === 'true';
                break;
            }
        }
        this.renderStars();
    }
}
customElements.define('dc-svg-rating', DCAnyRating);
