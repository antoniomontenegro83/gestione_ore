/**
 * ui.js - Gestione interfaccia utente per qualifiche ottimizzata
 */
import { Notifications } from '../../main.js';
import qualificheState from './state.js';
import { QUALIFICHE_CONFIG } from './config.js';

export const QualificheUI = {
  showLoading() {
    const tbody = document.getElementById('qualifica-table');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Caricamento...</span>
            </div>
            <p class="mt-2">${QUALIFICHE_CONFIG.MESSAGES.LOADING}</p>
          </td>
        </tr>
      `;
    }
  },

  showError(message) {
    const tbody = document.getElementById('qualifica-table');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" class="text-center text-danger py-4">
            <i class="bi bi-exclamation-triangle" style="font-size: 2rem;"></i>
            <p class="mt-2">${message}</p>
          </td>
        </tr>
      `;
    }
  },

  renderTable(filter = '') {
    const tbody = document.getElementById('qualifica-table');
    if (!tbody) return;

    tbody.innerHTML = '';
    const lowerFilter = filter.toLowerCase();
    let qualificheFiltrate = qualificheState.getQualifiche();

    if (filter) {
      qualificheFiltrate = qualificheFiltrate.filter(qual => {
        return qual.qualifica.toLowerCase().includes(lowerFilter);
      });
    }

    this.updateCounter(qualificheFiltrate.length);
    this.updateQualificheBadges();

    if (qualificheFiltrate.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" class="text-center text-muted py-4">
            ${filter ? QUALIFICHE_CONFIG.MESSAGES.NO_RESULTS : QUALIFICHE_CONFIG.MESSAGES.NO_DATA}
          </td>
        </tr>
      `;
      return;
    }

    qualificheFiltrate.forEach((qual) => {
      const row = this.createTableRow(qual);
      tbody.appendChild(row);
    });
  },

  createTableRow(qual) {
    const row = document.createElement('tr');
    row.setAttribute('data-qualifica-id', qual.id);
    
    const badgeColor = this.getColorForQualifica(qual.qualifica);
    
    // Creare gli elementi separatamente per gestire meglio gli eventi
    const qualificaCell = document.createElement('td');
    qualificaCell.innerHTML = `
      <span class="badge bg-${badgeColor} me-2">${qual.qualifica}</span>
      <strong>${qual.qualifica}</strong>
    `;
    
    const modificaCell = document.createElement('td');
    modificaCell.className = 'text-center';
    const modificaBtn = document.createElement('button');
    modificaBtn.className = 'btn btn-sm btn-warning';
    modificaBtn.innerHTML = '<i class="bi bi-pencil"></i> Modifica';
    modificaBtn.addEventListener('click', () => {
      if (window.qualificheManager) {
        window.qualificheManager.apriModifica(qual.id);
      }
    });
    modificaCell.appendChild(modificaBtn);
    
    const eliminaCell = document.createElement('td');
    eliminaCell.className = 'text-center';
    const eliminaBtn = document.createElement('button');
    eliminaBtn.className = 'btn btn-sm btn-danger';
    eliminaBtn.innerHTML = '<i class="bi bi-trash"></i> Elimina';
    eliminaBtn.addEventListener('click', () => {
      if (window.qualificheManager) {
        window.qualificheManager.eliminaQualifica(qual.id);
      }
    });
    eliminaCell.appendChild(eliminaBtn);
    
    row.appendChild(qualificaCell);
    row.appendChild(modificaCell);
    row.appendChild(eliminaCell);
    
    return row;
  },

  updateCounter(count) {
    const totalQualificheElement = document.getElementById('totalQualifiche');
    if (totalQualificheElement) {
      totalQualificheElement.textContent = count;
    }
  },

  updateQualificheBadges() {
    const qualifiche = qualificheState.getQualifiche();
    const badgesContainer = document.getElementById('qualifiche-badges-container');
    
    if (!badgesContainer) return;
    
    if (qualifiche.length === 0) {
      badgesContainer.innerHTML = '<span class="text-muted">Nessuna qualifica disponibile</span>';
      return;
    }
    
    let badgesHtml = '';
    qualifiche.forEach(qual => {
      const color = this.getColorForQualifica(qual.qualifica);
      badgesHtml += `
        <span class="badge bg-${color} fs-6 py-2 px-3 qualifica-badge" 
              data-qualifica="${qual.qualifica}" 
              style="cursor: pointer;">
          <i class="bi bi-award me-1"></i>${qual.qualifica}
        </span>
      `;
    });
    
    badgesContainer.innerHTML = badgesHtml;
    
    // Rendi i badge cliccabili per filtrare la tabella
    badgesContainer.querySelectorAll('.qualifica-badge').forEach(badge => {
      badge.addEventListener('click', () => {
        const qualifica = badge.getAttribute('data-qualifica');
        const searchInput = document.getElementById('qualifica-search');
        if (searchInput) {
          searchInput.value = qualifica;
          this.renderTable(qualifica);
        }
      });
    });
  },

  getColorForQualifica(qualifica) {
    const qualificaColors = {
      'AVIG': 'primary',
      'CQE': 'success',
      'CR': 'warning',
      'CRESC AIB': 'info',
      'CRSC': 'danger',
      'CS': 'dark',
      'D': 'secondary',
      'DCS': 'primary',
      'DCSLG': 'success',
      'DSLG': 'warning',
      'IA': 'info',
      'IAE': 'danger',
      'IIE': 'dark',
      'ILGE': 'secondary',
      'NCCR': 'primary',
      'NCVFC': 'success',
      'NCVFCSC': 'warning',
      'NMCRSC': 'info',
      'NMCSE': 'danger',
      'NMI': 'dark',
      'NMVFC': 'secondary',
      'OPER': 'primary',
      'OPERESC': 'success',
      'PD': 'warning',
      'SCR': 'info',
      'SCS': 'danger',
      'SVFC': 'dark',
      'VC': 'secondary',
      'VCSC': 'primary',
      'VDLG': 'success',
      'VE': 'warning',
      'VESC': 'info',
      'VIG': 'danger',
      'VIGP': 'dark',
      'VV': 'secondary'
    };
    
    if (!qualificaColors[qualifica]) {
      const colors = ['primary', 'success', 'warning', 'info', 'danger', 'dark', 'secondary'];
      const hash = qualifica.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return colors[hash % colors.length];
    }
    
    return qualificaColors[qualifica];
  },

  populateModifyModal(qualifica) {
    document.getElementById('modificaId').value = qualifica.id;
    document.getElementById('modificaNome').value = qualifica.qualifica || '';
  },

  populateDeleteModal(qualifica) {
    const deleteQualificaName = document.getElementById('deleteQualificaName');
    if (deleteQualificaName) {
      deleteQualificaName.textContent = qualifica.qualifica;
    }
  },

  clearForm() {
    const form = document.getElementById('add-qualifica-form');
    if (form) {
      form.reset();
    }
    
    const nomeInput = document.getElementById('qualifica-nome');
    if (nomeInput) {
      nomeInput.focus();
    }
  },

  highlightAddedQualifica(qualificaId) {
    setTimeout(() => {
      const row = document.querySelector(`[data-qualifica-id="${qualificaId}"]`);
      if (row) {
        row.classList.add('table-success');
        row.style.animation = 'fadeInGreen 0.8s ease';
        setTimeout(() => {
          row.classList.remove('table-success');
          row.style.animation = '';
        }, 2500);
      }
    }, 100);
  },

  removeQualificaFromList(id) {
    const row = document.querySelector(`[data-qualifica-id="${id}"]`);
    if (row) {
      row.style.opacity = '0';
      row.style.transform = 'translateX(-100%)';
      row.style.transition = 'all 0.4s ease';
      
      setTimeout(() => {
        row.remove();
        
        // Aggiorna SUBITO i badge dopo la rimozione
        this.updateQualificheBadges();
        this.updateCounter(qualificheState.getQualifiche().length);
        
        // Se la tabella è vuota, mostra il messaggio
        const tbody = document.getElementById('qualifica-table');
        if (tbody && tbody.children.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="3" class="text-center text-muted py-4">
                ${QUALIFICHE_CONFIG.MESSAGES.NO_DATA}
              </td>
            </tr>
          `;
        }
        
        console.log('QualificheUI: Qualifica rimossa e interfaccia aggiornata');
      }, 400);
    }
  }
};

export default QualificheUI;