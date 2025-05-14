/**
 * ui.js - Gestione interfaccia utente per dipendenti
 */
import { Notifications } from '../../main.js';
import dipendentiState from './state.js';
import { DIPENDENTI_CONFIG } from './config.js';

export const DipendentiUI = {
  showLoading() {
    const tbody = document.getElementById('employee-table');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Caricamento...</span>
            </div>
            <p class="mt-2">${DIPENDENTI_CONFIG.MESSAGES.LOADING}</p>
          </td>
        </tr>
      `;
    }
  },

  showError(message) {
    const tbody = document.getElementById('employee-table');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-danger py-4">
            <i class="bi bi-exclamation-triangle" style="font-size: 2rem;"></i>
            <p class="mt-2">${message}</p>
          </td>
        </tr>
      `;
    }
  },

  renderTable(filter = '') {
    const tbody = document.getElementById('employee-table');
    if (!tbody) return;

    tbody.innerHTML = '';
    const lowerFilter = filter.toLowerCase();
    let dipendentiFiltrati = dipendentiState.getEmployees();

    if (filter) {
      dipendentiFiltrati = dipendentiFiltrati.filter(emp => {
        const searchableText = [
          emp.id?.toString(),
          emp.nome,
          emp.cognome,
          emp.qualifica,
          emp.sede
        ].filter(Boolean).join(' ').toLowerCase();
        
        return searchableText.includes(lowerFilter);
      });
    }

    this.updateCounter(dipendentiFiltrati.length);

    if (dipendentiFiltrati.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-muted py-4">
            ${filter ? DIPENDENTI_CONFIG.MESSAGES.NO_RESULTS : DIPENDENTI_CONFIG.MESSAGES.NO_DATA}
          </td>
        </tr>
      `;
      return;
    }

    // Crea le righe con l'indice per lo stile zebrato
    dipendentiFiltrati.forEach((emp, index) => {
      const row = this.createTableRow(emp, index);
      tbody.appendChild(row);
    });
    
    // Assicurati che la tabella abbia lo stile di Bootstrap
    const table = document.getElementById('employee-table-container');
    if (table && !table.classList.contains('table-striped')) {
      table.classList.add('table-striped');
    }
  },

  createTableRow(emp, index) {
    const row = document.createElement('tr');
    row.setAttribute('data-employee-id', emp.id);
    
    // Aggiungi una classe per lo stile zebrato se Bootstrap non funziona
    if (index % 2 === 0) {
      row.style.backgroundColor = '#f8f9fa';
    }
    
    // ORDINE CORRETTO SENZA ID: Cognome, Nome, Qualifica, Sede, Modifica, Elimina
    row.innerHTML = `
      <td>${emp.cognome || ''}</td>
      <td>${emp.nome || ''}</td>
      <td>${emp.qualifica || ''}</td>
      <td>${emp.sede || ''}</td>
      <td>
        <button class="btn btn-sm btn-warning me-1" onclick="window.apriModifica(${emp.id})">Modifica</button>
      </td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="window.eliminaDipendente(${emp.id})">Elimina</button>
      </td>
    `;
    
    // Aggiungi effetto hover
    row.addEventListener('mouseenter', function() {
      this.style.backgroundColor = '#e3f2fd';
    });
    
    row.addEventListener('mouseleave', function() {
      if (index % 2 === 0) {
        this.style.backgroundColor = '#f8f9fa';
      } else {
        this.style.backgroundColor = '#ffffff';
      }
    });
    
    return row;
  },

  updateCounter(count) {
    const totalEmployeesElement = document.getElementById('totalEmployees');
    if (totalEmployeesElement) {
      totalEmployeesElement.textContent = count;
    }
  },

  populateSelect(selectId, items, selectedValue) {
    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = '<option value="">-- Seleziona --</option>';
    items.forEach(item => {
      const option = document.createElement('option');
      const value = item.nome || item.qualifica || item.sede || item;
      option.value = value;
      option.textContent = value;
      if (value === selectedValue) {
        option.selected = true;
      }
      select.appendChild(option);
    });
  },

  populateModifyModal(employee) {
    document.getElementById('modificaId').value = employee.id;
    document.getElementById('modificaCognome').value = employee.cognome || '';
    document.getElementById('modificaNome').value = employee.nome || '';
    
    this.populateSelect('modificaQualifica', dipendentiState.getQualifiche(), employee.qualifica);
    this.populateSelect('modificaSede', dipendentiState.getSedi(), employee.sede);
  },

  populateDeleteModal(employee) {
    const deleteEmployeeName = document.getElementById('deleteEmployeeName');
    if (deleteEmployeeName) {
      deleteEmployeeName.textContent = `${employee.cognome} ${employee.nome}`;
    }
  }
};

export default DipendentiUI;