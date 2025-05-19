// frontend/js/modules/turni/ui.js
/**
 * modules/turni/ui.js - Gestione interfaccia utente per turni con badge
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

    // Aggiorna badge
    this.updateBadgeCounts();

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

  updateBadgeCounts() {
    const turni = turniState.getFilteredTurni();
    const today = new Date().toISOString().split('T')[0];
    
    const stats = {
      totale: turni.length,
      oggi: turni.filter(t => t.entry_date === today).length,
      settimana: this.countTurniSettimana(turni),
      mese: this.countTurniMese(turni),
      notturni: turni.filter(t => this.isTurnoNotturno(t)).length,
      festivi: turni.filter(t => this.isTurnoFestivo(t)).length
    };
    
    this.renderTurniBadges(stats);
    this.updateSediBadges(turni);
  },

  renderTurniBadges(stats) {
    let badgeContainer = document.getElementById('turniBadgeContainer');
    if (!badgeContainer) {
      const filterCard = document.querySelector('.card-body');
      if (filterCard) {
        badgeContainer = document.createElement('div');
        badgeContainer.id = 'turniBadgeContainer';
        badgeContainer.className = 'badge-container mt-3 mb-3';
        filterCard.prepend(badgeContainer);
      }
    }
    
    if (badgeContainer) {
      badgeContainer.innerHTML = `
        <div class="d-flex gap-2 flex-wrap align-items-center">
          <span class="badge bg-primary" data-live-update="turni-totale">
            <i class="bi bi-calendar3"></i> Totale: ${stats.totale}
          </span>
          <span class="badge bg-success" data-live-update="turni-oggi">
            <i class="bi bi-calendar-day"></i> Oggi: ${stats.oggi}
          </span>
          <span class="badge bg-info" data-live-update="turni-settimana">
            <i class="bi bi-calendar-week"></i> Settimana: ${stats.settimana}
          </span>
          <span class="badge bg-warning text-dark" data-live-update="turni-mese">
            <i class="bi bi-calendar-month"></i> Mese: ${stats.mese}
          </span>
          <span class="badge bg-dark" data-live-update="turni-notturni">
            <i class="bi bi-moon-stars"></i> Notturni: ${stats.notturni}
          </span>
          <span class="badge bg-danger" data-live-update="turni-festivi">
            <i class="bi bi-calendar-x"></i> Festivi: ${stats.festivi}
          </span>
        </div>
      `;
    }
  },

  updateSediBadges(turni) {
    const sediCount = {};
    turni.forEach(t => {
      const sede = t.sede || 'Non specificata';
      sediCount[sede] = (sediCount[sede] || 0) + 1;
    });
    
    let badgeContainer = document.getElementById('turniSediBadgeContainer');
    if (!badgeContainer) {
      const mainContainer = document.getElementById('turniBadgeContainer');
      if (mainContainer) {
        badgeContainer = document.createElement('div');
        badgeContainer.id = 'turniSediBadgeContainer';
        badgeContainer.className = 'mt-2';
        mainContainer.appendChild(badgeContainer);
      }
    }
    
    if (badgeContainer) {
      let html = '<div class="d-flex gap-2 flex-wrap">';
      Object.entries(sediCount).forEach(([sede, count]) => {
        const color = this.getColorForSede(sede);
        html += `<span class="badge bg-${color}" data-live-update="turni-sede-${sede}">
          <i class="bi bi-geo-alt"></i> ${sede}: ${count}
        </span>`;
      });
      html += '</div>';
      badgeContainer.innerHTML = html;

    // Rendi i badge sede cliccabili per filtrare la tabella
    badgeContainer.querySelectorAll('[data-live-update^="turni-sede-"]').forEach(badge => {
      badge.style.cursor = 'pointer';
      badge.addEventListener('click', () => {
        const sede = badge.getAttribute('data-live-update').replace('turni-sede-', '');
        const searchInput = document.getElementById('dipendenteSearch');
        if (searchInput) {
          searchInput.value = sede;
          searchInput.dispatchEvent(new Event('input'));
        }
      });
    });
    }
  },

  getColorForSede(sede) {
    const sedeColors = {
      'Centrale': 'primary',
      'Ostuni': 'success',
      'Francavilla Fontana': 'warning',
      'Brindisi (Aeroportuale)': 'info',
      'Nucleo Nautico': 'danger',
      'Nucleo Sommozzatori': 'dark',
      'Non specificata': 'secondary'
    };
    return sedeColors[sede] || 'secondary';
  },

  countTurniSettimana(turni) {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    return turni.filter(t => {
      const turnoDate = new Date(t.entry_date);
      return turnoDate >= weekStart && turnoDate <= weekEnd;
    }).length;
  },

  countTurniMese(turni) {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    return turni.filter(t => {
      const turnoDate = new Date(t.entry_date);
      return turnoDate >= monthStart && turnoDate <= monthEnd;
    }).length;
  },

  isTurnoNotturno(turno) {
    const oraIngresso = parseInt(turno.entry_time.split(':')[0]);
    const oraUscita = parseInt(turno.exit_time.split(':')[0]);
    return oraIngresso >= 22 || oraIngresso < 6 || oraUscita >= 22 || oraUscita < 6;
  },

  isTurnoFestivo(turno) {
    const date = new Date(turno.entry_date);
    const dayOfWeek = date.getDay();
    
    // Domenica o Sabato
    if (dayOfWeek === 0 || dayOfWeek === 6) return true;
    
    // Controlla anche le festività italiane
    const festivita = [
      '01-01', // Capodanno
      '01-06', // Epifania
      '04-25', // Liberazione
      '05-01', // Festa del Lavoro
      '06-02', // Repubblica
      '08-15', // Ferragosto
      '11-01', // Ognissanti
      '12-08', // Immacolata
      '12-25', // Natale
      '12-26', // Santo Stefano
    ];
    
    const monthDay = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    return festivita.includes(monthDay);
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