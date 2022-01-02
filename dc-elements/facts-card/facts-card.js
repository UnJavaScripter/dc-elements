"use strict";
const factTemplate = document.createElement('template');
factTemplate.innerHTML = `
<style>
  :host {
    --color-base: hsla(220, 9%, 46%, 1);
    --color-lighter: hsla(220, 9%, 76%, 1);
    --color-darker: hsla(220, 9%, 26%, 1);
    --color-card-background: hsla(0, 0%, 100%, 1);
    margin: 0 0.5rem;
  }

  .card {
    color: var(--color-base);
    background-color: var(--color-card-background);
    display: block;
    border-radius: 0.375rem;
    box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px
  }

  .header {
    color: var(--color-darker);
    padding: 0.8rem 0 0.5rem 0.5rem;
    font-size: large;
    font-weight: bold;
  }
  
  .list {
    list-style: none;
    margin: 0;
    padding: 0;
    width: 100%;
  }
  
  .fact {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 0.7rem;
    
  }

  .fact:not(:last-child) {
    border-bottom: 1px dashed var(--color-lighter);
  }

  .separator {
    padding: 0.1ch;
  }

</style>
<article id="card" class="card">
  <header id="header" class="header"></header>
  <ul id="list" class="list">
  </ul>
<article>
`;
class DcFactsCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(factTemplate.content.cloneNode(true));
        this.setHeader();
        this.separator = this.getAttribute('separator');
    }
    static get observedAttributes() {
        return ['facts'];
    }
    connectedCallback() {
        this.setNewFacts();
    }
    attributeChangedCallback(attrName, oldValue, newValue) {
        switch (attrName) {
            case ('facts'): {
                if (newValue !== oldValue) {
                    this.setNewFacts();
                }
                break;
            }
        }
    }
    get facts() {
        return this._facts;
    }
    set facts(newFacts) {
        this._facts = newFacts;
        this.renderFacts();
    }
    setNewFacts() {
        const factsAttr = this.getAttribute('facts');
        if (!factsAttr) {
            return;
        }
        const facts = JSON.parse(factsAttr);
        this.facts = new Map(Object.entries(facts));
    }
    renderFacts() {
        const factsList = this.shadowRoot.querySelector('#list');
        let factsListContent = '';
        for (let [fact, value] of this.facts) {
            factsListContent += `<li class="fact">
        <div class="label">${fact} ${this.separator ? `<span class="separator">${this.separator}</span>` : ''}</div>
        <div class="value">${value}</div>
      </li>`;
        }
        factsList.innerHTML = factsListContent;
    }
    setHeader() {
        const headerText = this.getAttribute('header');
        const cardElem = this.shadowRoot.getElementById('card');
        const headerElem = cardElem.querySelector('header');
        if (headerText) {
            headerElem.innerText = headerText;
        }
        else {
            cardElem.removeChild(headerElem);
        }
    }
}
window.customElements.define('dc-facts-card', DcFactsCard);
