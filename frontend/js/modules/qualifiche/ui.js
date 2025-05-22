// frontend/js/modules/qualifiche/ui.js
/**
 * ui.js - Gestione interfaccia utente per qualifiche
 */
import { Notifications } from '../../main.js';
import qualificheState from './state.js';
import { QUALIFICHE_CONFIG } from './config.js';

export const QualificheUI = {
  showLoading() {
    const list = document.getElementById('qualifiche-list');
    if (list) {
      list.innerHTML = `
        <li class="list-group-item text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Caricamento...</span>
          </div>
          <p class="mt-2">${QUALIFICHE_CONFIG.MESSAGES.LOADING}</p>
        </li>
      `;
    }
  },

  showError(message) {
    const list = document.getElementById('qualifiche-list');
    if (list) {
      list.innerHTML = `
        <li class="list-group-item text-center text-danger py-4">
          <i class="bi bi-exclamation-triangle" style="font-size: 2rem;"></i>
          <p class="mt-2">${message}</p>
        </li>
      `;
    }
  },

  showEmpty(message = QUALIFICHE_CONFIG.MESSAGES.NO_DATA) {
    const list = document.getElementById('qualifiche-list');
    if (list) {
      list.innerHTML = `
        <li class="list-group-item text-center text-muted">
          ${message}
        </li>
      `;
    }
  },

  renderList(filter = '') {
    const list = document.getElementById('qualifiche-list');
    if (!list) return;

    list.innerHTML = '';

    const qualificheFiltered = qualificheState.getFilteredQualifiche(filter);

    if (qualificheFiltered.length === 0) {
      this.showEmpty(filter ? QUALIFICHE_CONFIG.MESSAGES.NO_RESULTS : QUALIFICHE_CONFIG.MESSAGES.NO_DATA);
      return;
    }

    qualificheFiltered.forEach(qualifica => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.setAttribute('data-qualifica-id', qualifica.id);
      
      const nomeSpan = document.createElement('span');
      nomeSpan.textContent = qualifica.qualifica;
      nomeSpan.className = 'qualifica-nome';
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn btn-sm btn-danger delete-qualifica-btn';
      deleteBtn.innerHTML = '<i class="bi bi-trash"></i> Elimina';
      deleteBtn.onclick = () => window.eliminaQualifica(qualifica.id);
      
      li.appendChild(nomeSpan);
      li.appendChild(deleteBtn);
      list.appendChild(li);
    });
  },

  clearForm() {
    const input = document.getElementById('qualifica-nome');
    if (input) {
      input.value = '';
      input.focus();
    }
  },

  populateDeleteModal(qualifica) {
    const deleteQualificaNameElement = document.getElementById('deleteQualificaName');
    if (deleteQualificaNameElement) {
      deleteQualificaNameElement.textContent = qualifica.qualifica;
    }
  },

  updateQualificaInList(updatedQualifica) {
    const listItem = document.querySelector(`[data-qualifica-id="${updatedQualifica.id}"]`);
    if (listItem) {
      const nomeSpan = listItem.querySelector('.qualifica-nome');
      if (nomeSpan) {
        nomeSpan.textContent = updatedQualifica.qualifica;
      }
    }
  },

  removeQualificaFromList(id) {
    const listItem = document.querySelector(`[data-qualifica-id="${id}"]`);
    if (listItem) {
      listItem.style.opacity = '0';
      listItem.style.transform = 'translateX(-100%)';
      listItem.style.transition = 'all 0.3s ease';
      
      setTimeout(() => {
        listItem.remove();
        
        // Se la lista è vuota, mostra il messaggio
        const list = document.getElementById('qualifiche-list');
        if (list && list.children.length === 0) {
          this.showEmpty();
        }
      }, 300);
    }
  },

  highlightAddedQualifica(qualificaId) {
    const listItem = document.querySelector(`[data-qualifica-id="${qualificaId}"]`);
    if (listItem) {
      listItem.classList.add('list-group-item-success');
      setTimeout(() => {
        listItem.classList.remove('list-group-item-success');
      }, 2000);
    }
  }
};

export default QualificheUI;