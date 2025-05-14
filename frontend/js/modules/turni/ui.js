/**
 * modules/turni/ui.js - Gestione interfaccia utente per turni
 */
import { Utils } from '../../main.js';
import turniState from './state.js';
import { TURNI_CONFIG } from './config.js';

export const TurniUI = {
  showLoading() {
    const tbody = document.querySelector('#shifts-table tbody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="${TURNI_CONFIG.TABLE_COLUMNS}" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Caricamento...</span>
            </div>
            <p class="mt-2">${TURNI_CONFIG.MESSAGES.LOADING}</p>
          </td>
        </tr>
      `;
    }
  },

  showError(message) {
    const tbody = document.querySelector('#shifts-table tbody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="${TURNI_CONFIG.TABLE_COLUMNS}" class="text-center text-danger py-4">
            <i class="bi bi-exclamation-triangle" style="font-size: 2rem;"></i>
            <p class="mt-2">${message}</p>
          </td>
        </tr>
      `;
    }
  },

  showEmpty(message = TURNI_CONFIG.MESSAGES.NO_RESULTS) {
    const tbody = document.querySelector('#shifts-table tbody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="${TURNI_CONFIG.TABLE_COLUMNS}" class="text-center text-muted py-4">
            ${message}
          </td>
        </tr>
      `;
    }
  },

  renderTable() {
    const tbody = document.querySelector('#shifts-table tbody');
    if (!tbody) return;

    const turni = turniState.getFilteredTurni();
    const isAdmin = turniState.getAdminStatus();

    tbody.innerHTML = '';

    if (turni.length === 0) {
      this.showEmpty();
      return;
    }

    turni.forEach(turno => {
      if (!turno.nome || !turno.cognome) return;
      
      const row = this.createTableRow(turno, isAdmin);
      tbody.appendChild(row);
    });
  },

  createTableRow(turno, isAdmin) {
    const row = document.createElement('tr');
    row.setAttribute('data-turno-id', turno.id);
    
    const ingresso = Utils.formatDateTime(turno.entry_date, turno.entry_time);
    const uscita = Utils.formatDateTime(turno.exit_date, turno.exit_time);
    
    let azioni = '';
    if (isAdmin) {
      azioni = `
        <button class="btn btn-sm btn-warning me-1" onclick="window.apriModifica(${turno.id}, '${turno.entry_date}', '${turno.entry_time}', '${turno.exit_date}', '${turno.exit_time}')">
          Modifica
        </button>
        <button class="btn btn-sm btn-danger" onclick="window.preparaEliminazioneTurno(${turno.id})">
          Elimina
        </button>
      `;
    }
    
    row.innerHTML = `
      <td>${turno.qualifica || '-'}</td>
      <td>${turno.cognome}</td>
      <td>${turno.nome}</td>
      <td>${ingresso}</td>
      <td>${uscita}</td>
      <td>${azioni}</td>
    `;
    
    return row;
  },

  populateDipendenteSelect(filtro = '') {
    const select = document.getElementById('dipendenteSelect');
    if (!select) return;
    
    const selectedValue = select.value;
    select.innerHTML = '<option value="">-- Seleziona dipendente --</option>';
    
    const dipendenti = turniState.getDipendentiUnici();
    
    dipendenti.forEach(dip => {
      const descrizione = `${dip.cognome} ${dip.nome} - ${dip.qualifica || ''}`;
      if (!filtro || descrizione.toLowerCase().includes(filtro.toLowerCase())) {
        const option = document.createElement('option');
        option.value = dip.nomeCompleto;
        option.textContent = descrizione;
        if (dip.nomeCompleto === selectedValue) {
          option.selected = true;
        }
        select.appendChild(option);
      }
    });
  },

  setFilterDate(dateInputId, value) {
    const input = document.getElementById(dateInputId);
    if (input) {
      input.value = value;
    }
  },

  populateModifyModal(turno) {
    document.getElementById('modificaId').value = turno.id;
    document.getElementById('modificaIngresso').value = `${turno.entry_date}T${turno.entry_time}`;
    document.getElementById('modificaUscita').value = `${turno.exit_date}T${turno.exit_time}`;
  },

  clearFilters() {
    const elements = {
      dipendenteSearch: document.getElementById('dipendenteSearch'),
      dipendenteSelect: document.getElementById('dipendenteSelect'),
      dataInizio: document.getElementById('dataInizio'),
      dataFine: document.getElementById('dataFine')
    };
    
    if (elements.dipendenteSearch) elements.dipendenteSearch.value = '';
    if (elements.dipendenteSelect) elements.dipendenteSelect.selectedIndex = 0;
    if (elements.dataInizio) elements.dataInizio.value = '';
    if (elements.dataFine) elements.dataFine.value = '';
  }
};

export default TurniUI;