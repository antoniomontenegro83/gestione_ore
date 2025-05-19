// frontend/js/modules/sedi/ui.js
/**
 * ui.js - Gestione interfaccia utente per sedi
 */
import { Notifications } from '../../main.js';
import sediState from './state.js';
import { SEDI_CONFIG } from './config.js';

export const SediUI = {
  showLoading() {
    const list = document.getElementById('sedi-list');
    if (list) {
      list.innerHTML = `
        <li class="list-group-item text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Caricamento...</span>
          </div>
          <p class="mt-2">${SEDI_CONFIG.MESSAGES.LOADING}</p>
        </li>
      `;
    }
  },

  showError(message) {
    const list = document.getElementById('sedi-list');
    if (list) {
      list.innerHTML = `
        <li class="list-group-item text-center text-danger py-4">
          <i class="bi bi-exclamation-triangle" style="font-size: 2rem;"></i>
          <p class="mt-2">${message}</p>
        </li>
      `;
    }
  },

  showEmpty(message = SEDI_CONFIG.MESSAGES.NO_DATA) {
    const list = document.getElementById('sedi-list');
    if (list) {
      list.innerHTML = `
        <li class="list-group-item text-center text-muted">
          ${message}
        </li>
      `;
    }
  },

  renderList(filter = '') {
    const list = document.getElementById('sedi-list');
    if (!list) return;

    list.innerHTML = '';

    const sediFiltered = sediState.getFilteredSedi(filter);

    if (sediFiltered.length === 0) {
      this.showEmpty(filter ? SEDI_CONFIG.MESSAGES.NO_RESULTS : SEDI_CONFIG.MESSAGES.NO_DATA);
      return;
    }

    sediFiltered.forEach(sede => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.setAttribute('data-sede-id', sede.id);
      
      const nomeSpan = document.createElement('span');
      nomeSpan.textContent = sede.nome;
      nomeSpan.className = 'sede-nome';
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn btn-sm btn-danger delete-sede-btn';
      deleteBtn.innerHTML = '<i class="bi bi-trash"></i> Elimina';
      deleteBtn.onclick = () => window.eliminaSede(sede.id);
      
      li.appendChild(nomeSpan);
      li.appendChild(deleteBtn);
      list.appendChild(li);
    });
  },

  clearForm() {
    const input = document.getElementById('sede-nome');
    if (input) {
      input.value = '';
      input.focus();
    }
  },

  populateDeleteModal(sede) {
    const deleteSedeNameElement = document.getElementById('deleteSedeName');
    if (deleteSedeNameElement) {
      deleteSedeNameElement.textContent = sede.nome;
    }
  },

  updateSedeInList(updatedSede) {
    const listItem = document.querySelector(`[data-sede-id="${updatedSede.id}"]`);
    if (listItem) {
      const nomeSpan = listItem.querySelector('.sede-nome');
      if (nomeSpan) {
        nomeSpan.textContent = updatedSede.nome;
      }
    }
  },

  removeSedeFromList(id) {
    const listItem = document.querySelector(`[data-sede-id="${id}"]`);
    if (listItem) {
      listItem.style.opacity = '0';
      listItem.style.transform = 'translateX(-100%)';
      listItem.style.transition = 'all 0.3s ease';
      
      setTimeout(() => {
        listItem.remove();
        
        // Se la lista è vuota, mostra il messaggio
        const list = document.getElementById('sedi-list');
        if (list && list.children.length === 0) {
          this.showEmpty();
        }
      }, 300);
    }
  },

  highlightAddedSede(sedeId) {
    const listItem = document.querySelector(`[data-sede-id="${sedeId}"]`);
    if (listItem) {
      listItem.classList.add('list-group-item-success');
      setTimeout(() => {
        listItem.classList.remove('list-group-item-success');
      }, 2000);
    }
  }
};

export default SediUI;