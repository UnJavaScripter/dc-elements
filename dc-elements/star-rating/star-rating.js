class DcStarRating extends HTMLElement {
  constructor() {
    super();
    const style = document.createElement('style');
    const shadowRoot = this.attachShadow({ mode: 'open' });

    this.starRatingContainer = document.createElement('div');
    this.ratingValue = 0;
    this.total = 0;
    this.selectable = false;

    style.textContent = this.styles();

    shadowRoot.appendChild(style);
    shadowRoot.appendChild(this.starRatingContainer);
  }

  getStar() {
    return {
      full: () => "★",
      empty: () => "☆"
    }
  }

  createStars() {
    const arr = [...Array(this.total).keys()];

    return arr.map((_, index) => {
        const starPosition = index +1;
        const star = document.createElement('span'); // <star />?
        star.classList.add('star');
        star.setAttribute('aria-label', starPosition);
        star.setAttribute('title', starPosition);
        star.style.cursor = 'default';
        if(this.selectable) {
          star.style.cursor = 'pointer';
          star.addEventListener('click', () => {
            this.handleClick(starPosition);
          });
        }
        star.innerHTML = this.getStarState(starPosition, this.ratingValue);
        
        return star;
      });
  }

  renderStars() {
    this.starRatingContainer.innerHTML = '';
    this.createStars().forEach(star => this.starRatingContainer.appendChild(star));
  }

  getStarState(starPosition, ratingValue) {
    if(starPosition <= ratingValue) {
     return this.getStar().full();
    }
    return this.getStar().empty();
  }

  handleClick(starPosition) {
    this.ratingValue = starPosition;
    this.renderStars();

    const ratingChangedEvent = new CustomEvent('rating-changed', {
      detail: {total: this.total, value: this.ratingValue}
    });
    this.dispatchEvent(ratingChangedEvent);
  }

  static get observedAttributes() {
    return ['aria-label', 'value', 'total', 'selectable'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (newValue !== oldValue) {
      this._updateRendering(name, oldValue, newValue);
    }
  }

  _updateRendering(attrName, oldVal, newVal) {
    switch(attrName) {
      case('aria-label'): {
        this.starRatingContainer.setAttribute('aria-label', newVal);
        break;
      }
      case('value'): {
        this.ratingValue = Number(newVal);
        break;
      }
      case('total'): {
        this.total = Number(newVal);
        break;
      }
      case('selectable'): {
        this.selectable = newVal === '' || newVal === 'true';
        break;
      }
      
    }
    this.renderStars();
  }

  styles() {
    return `
      :host {
        font-family: sans-serif;
        display: flex;
        align-items: normal;
        font-size: 3rem;
      }
    `;
  }
}

customElements.define('dc-star-rating', DcStarRating);