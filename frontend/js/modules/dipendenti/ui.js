// frontend/js/modules/dipendenti/ui.js
/**
 * ui.js - Gestione interfaccia utente per dipendenti con badge avanzati
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
          <td colspan="7" class="text-center py-4">
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
          <td colspan="7" class="text-center text-danger py-4">
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
    this.updateBadgeCounts();

    if (dipendentiFiltrati.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-muted py-4">
            ${filter ? DIPENDENTI_CONFIG.MESSAGES.NO_RESULTS : DIPENDENTI_CONFIG.MESSAGES.NO_DATA}
          </td>
        </tr>
      `;
      return;
    }

    dipendentiFiltrati.forEach((emp, index) => {
      const row = this.createTableRow(emp, index);
      tbody.appendChild(row);
    });
    
    const table = document.getElementById('employee-table-container');
    if (table && !table.classList.contains('table-striped')) {
      table.classList.add('table-striped');
    }
  },

  createTableRow(emp, index) {
    const row = document.createElement('tr');
    row.setAttribute('data-employee-id', emp.id);
    
    if (index % 2 === 0) {
      row.style.backgroundColor = '#f8f9fa';
    }
    
    row.innerHTML = `
      <td>${emp.id}</td>
      <td>${emp.cognome || '-'}</td>
      <td>${emp.nome || '-'}</td>
      <td>${emp.qualifica || '-'}</td>
      <td>${emp.sede || '-'}</td>
      <td>
        <button class="btn btn-sm btn-warning me-1" onclick="window.apriModifica(${emp.id})">Modifica</button>
      </td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="window.eliminaDipendente(${emp.id})">Elimina</button>
      </td>
    `;
    
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

  updateBadgeCounts() {
    const employees = dipendentiState.getEmployees();
    const totalCount = employees.length;
    
    // Conta per qualifica
    const qualificheCounts = {};
    employees.forEach(emp => {
      const qualifica = emp.qualifica || 'Non specificata';
      qualificheCounts[qualifica] = (qualificheCounts[qualifica] || 0) + 1;
    });
    
    // Conta per sede
    const sediCounts = {};
    employees.forEach(emp => {
      const sede = emp.sede || 'Non assegnata';
      sediCounts[sede] = (sediCounts[sede] || 0) + 1;
    });
    
    // Aggiorna badge totale
    const totalBadge = document.getElementById('totalEmployeesBadge');
    if (totalBadge) {
      totalBadge.textContent = totalCount;
    }
    
    // Crea/aggiorna container dei badge
    this.updateBadgeContainer(qualificheCounts, sediCounts);
  },

  updateBadgeContainer(qualificheCounts, sediCounts) {
    let badgeContainer = document.getElementById('employeeBadgeContainer');
    if (!badgeContainer) {
      const searchContainer = document.querySelector('.search-container');
      if (searchContainer) {
        badgeContainer = document.createElement('div');
        badgeContainer.id = 'employeeBadgeContainer';
        badgeContainer.className = 'badge-container mt-3';
        searchContainer.after(badgeContainer);
      } else {
        // Se non c'è search container, mettilo prima della tabella
        const cardBody = document.querySelector('.card-body');
        if (cardBody) {
          badgeContainer = document.createElement('div');
          badgeContainer.id = 'employeeBadgeContainer';
          badgeContainer.className = 'badge-container mb-3';
          const table = cardBody.querySelector('.table-responsive');
          if (table) {
            cardBody.insertBefore(badgeContainer, table);
          }
        }
      }
    }
    
    if (badgeContainer) {
      let html = '<div class="d-flex gap-2 flex-wrap">';
      
      // Badge per qualifiche (top 5)
      const topQualifiche = Object.entries(qualificheCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      
      topQualifiche.forEach(([qualifica, count]) => {
        const color = this.getColorForQualifica(qualifica);
        html += `<span class="badge bg-${color}" data-live-update="qualifica-${qualifica}">${qualifica}: ${count}</span>`;
      });
      
      // Badge per sedi
      Object.entries(sediCounts).forEach(([sede, count]) => {
        const color = this.getColorForSede(sede);
        html += `<span class="badge bg-${color}" data-live-update="sede-${sede}"><i class="bi bi-building"></i> ${sede}: ${count}</span>`;
      });
      
      html += '</div>';
      badgeContainer.innerHTML = html;
    }
  },

  getColorForQualifica(qualifica) {
    const colors = ['primary', 'success', 'warning', 'info', 'secondary'];
    const hash = qualifica.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  },

  getColorForSede(sede) {
    const sedeColors = {
      'Centrale': 'primary',
      'Ostuni': 'success',
      'Francavilla Fontana': 'warning',
      'Brindisi (Aeroportuale)': 'info',
      'Nucleo Nautico': 'danger',
      'Nucleo Sommozzatori': 'dark',
      'Non assegnata': 'secondary'
    };
    return sedeColors[sede] || 'secondary';
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