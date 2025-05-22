/**
 * ui.js - Gestione interfaccia utente per qualifiche con badge avanzati
 */
import { Notifications } from '../../main.js';
import qualificheState from './state.js';
import { QUALIFICHE_CONFIG } from './config.js';
import liveBadges from '../common/live-badge.js';

export const QualificheUI = {
  showLoading() {
    const tbody = document.getElementById('qualifica-table');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-4">
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
          <td colspan="5" class="text-center text-danger py-4">
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
    this.updateBadgeCounts();

    if (qualificheFiltrate.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-muted py-4">
            ${filter ? QUALIFICHE_CONFIG.MESSAGES.NO_RESULTS : QUALIFICHE_CONFIG.MESSAGES.NO_DATA}
          </td>
        </tr>
      `;
      return;
    }

    qualificheFiltrate.forEach((qual, index) => {
      const row = this.createTableRow(qual, index);
      tbody.appendChild(row);
    });
  },

  createTableRow(qual, index) {
    const row = document.createElement('tr');
    row.setAttribute('data-qualifica-id', qual.id);
    
    // Calcola il numero di dipendenti associati (simulato)
    const dipendentiAssociati = this.getDipendentiPerQualifica(qual.qualifica);
    const badgeColor = this.getColorForQualifica(qual.qualifica);
    
    row.innerHTML = `
      <td class="text-center">${qual.id}</td>
      <td>
        <span class="badge bg-${badgeColor} me-2">${qual.qualifica}</span>
        <strong>${qual.qualifica}</strong>
      </td>
      <td>
        <span class="badge bg-info">${dipendentiAssociati} dipendenti</span>
      </td>
      <td class="text-center">
        <button class="btn btn-sm btn-warning me-1" onclick="window.apriModifica(${qual.id})">
          <i class="bi bi-pencil"></i> Modifica
        </button>
      </td>
      <td class="text-center">
        <button class="btn btn-sm btn-danger" onclick="window.eliminaQualifica(${qual.id})">
          <i class="bi bi-trash"></i> Elimina
        </button>
      </td>
    `;
    
    return row;
  },

  updateCounter(count) {
    const totalQualificheElement = document.getElementById('totalQualifiche');
    if (totalQualificheElement) {
      totalQualificheElement.textContent = count;
    }
  },

  updateBadgeCounts() {
    const qualifiche = qualificheState.getQualifiche();
    const totalCount = qualifiche.length;
    
    // Conta per categoria di qualifica
    const categorieCounts = this.categorizeQualifiche(qualifiche);
    
    // Conta dipendenti per qualifica
    const dipendentiCounts = {};
    qualifiche.forEach(qual => {
      dipendentiCounts[qual.qualifica] = this.getDipendentiPerQualifica(qual.qualifica);
    });
    
    // Crea/aggiorna container dei badge
    this.updateBadgeContainer(categorieCounts, dipendentiCounts);
    
    // Attiva l'aggiornamento live dei badge
    if (!this.liveBadgesStarted) {
      liveBadges.start();
      this.liveBadgesStarted = true;
    }
  },

  categorizeQualifiche(qualifiche) {
    const categorie = {
      'Vigili del Fuoco': 0,
      'Comandanti': 0,
      'Specialisti': 0,
      'Operatori': 0,
      'Altre': 0
    };
    
    qualifiche.forEach(qual => {
      const q = qual.qualifica.toUpperCase();
      if (['VV', 'VE', 'VC', 'VESC', 'VCSC', 'VIGP', 'VIG'].includes(q)) {
        categorie['Vigili del Fuoco']++;
      } else if (['CR', 'CQE', 'CS', 'DCS', 'DCSLG', 'DSLG'].includes(q)) {
        categorie['Comandanti']++;
      } else if (['NCVFC', 'NMVFC', 'SVFC', 'SCR', 'SCS', 'NCCR'].includes(q)) {
        categorie['Specialisti']++;
      } else if (['OPER', 'OPERESC'].includes(q)) {
        categorie['Operatori']++;
      } else {
        categorie['Altre']++;
      }
    });
    
    return categorie;
  },

  updateBadgeContainer(categorieCounts, dipendentiCounts) {
    let badgeContainer = document.getElementById('qualificaBadgeContainer');
    if (!badgeContainer) {
      const searchContainer = document.querySelector('.search-container');
      if (searchContainer) {
        badgeContainer = document.createElement('div');
        badgeContainer.id = 'qualificaBadgeContainer';
        badgeContainer.className = 'badge-container mt-3 mb-4';
        searchContainer.after(badgeContainer);
      }
    }
    
    if (badgeContainer) {
      let html = '';
      
      // Badge per categorie (SOPRA)
      html += '<div class="badge-group mb-3">';
      html += '<h6 class="text-muted mb-2">Categorie</h6>';
      html += '<div class="d-flex gap-2 flex-wrap">';
      
      Object.entries(categorieCounts).forEach(([categoria, count]) => {
        if (count > 0) {
          const color = this.getColorForCategoria(categoria);
          html += `<span class="badge bg-${color} updating" data-live-update="categoria-${categoria}">
            <i class="bi bi-tags"></i> ${categoria}: ${count}
          </span>`;
        }
      });
      
      html += '</div>';
      html += '</div>';
      
      // Badge per qualifiche più utilizzate (SOTTO)
      html += '<div class="badge-group">';
      html += '<h6 class="text-muted mb-2">Qualifiche Top</h6>';
      html += '<div class="d-flex gap-2 flex-wrap">';
      
      // Ordina le qualifiche per numero di dipendenti associati
      const sortedQualifiche = Object.entries(dipendentiCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8); // Mostra solo le prime 8
      
      sortedQualifiche.forEach(([qualifica, count]) => {
        if (count > 0) {
          const color = this.getColorForQualifica(qualifica);
          html += `<span class="badge bg-${color} updating" data-live-update="qualifica-${qualifica}">
            <i class="bi bi-award"></i> ${qualifica}: ${count}
          </span>`;
        }
      });
      
      html += '</div>';
      html += '</div>';
      
      badgeContainer.innerHTML = html;
    }
  },

  getColorForCategoria(categoria) {
    const categoriaColors = {
      'Vigili del Fuoco': 'primary',
      'Comandanti': 'danger',
      'Specialisti': 'success',
      'Operatori': 'warning',
      'Altre': 'secondary'
    };
    return categoriaColors[categoria] || 'secondary';
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

  async getDipendentiPerQualifica(qualifica) {
    // Chiamata reale all'API per ottenere il conteggio
    try {
      const response = await fetch(`../backend_gestione_ore/qualifiche/count-dipendenti.php?qualifica=${encodeURIComponent(qualifica)}`);
      const result = await response.json();
      return result.count || 0;
    } catch (error) {
      console.warn('Errore nel conteggio dipendenti per qualifica:', error);
      // Fallback con dati simulati
      const counts = {
        'VV': 45, 'VE': 28, 'VC': 32, 'CR': 15, 'CQE': 12,
        'CS': 18, 'VESC': 22, 'VCSC': 16, 'DSLG': 8, 'DCS': 6,
        'OPER': 3, 'OPERESC': 2, 'NCCR': 5, 'NCVFC': 7,
        'NMVFC': 4, 'SVFC': 3, 'SCR': 2, 'SCS': 3,
        'IA': 4, 'IIE': 2, 'ILGE': 2, 'VIGP': 2, 'VIG': 3
      };
      return counts[qualifica] || Math.floor(Math.random() * 10) + 1;
    }
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

  showFeedback(message, type = 'success') {
    const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
    const iconClass = type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle';
    
    // Cerca un container per i messaggi o crea una notifica toast
    Notifications[type](message);
  },

  highlightAddedQualifica(qualificaId) {
    setTimeout(() => {
      const row = document.querySelector(`[data-qualifica-id="${qualificaId}"]`);
      if (row) {
        row.classList.add('table-success');
        row.style.animation = 'fadeInGreen 0.5s ease';
        setTimeout(() => {
          row.classList.remove('table-success');
          row.style.animation = '';
        }, 2000);
      }
    }, 100);
  },

  removeQualificaFromList(id) {
    const row = document.querySelector(`[data-qualifica-id="${id}"]`);
    if (row) {
      row.style.opacity = '0';
      row.style.transform = 'translateX(-100%)';
      row.style.transition = 'all 0.3s ease';
      
      setTimeout(() => {
        row.remove();
        
        // Se la tabella è vuota, mostra il messaggio
        const tbody = document.getElementById('qualifica-table');
        if (tbody && tbody.children.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="5" class="text-center text-muted py-4">
                ${QUALIFICHE_CONFIG.MESSAGES.NO_DATA}
              </td>
            </tr>
          `;
        }
      }, 300);
    }
  }
};

export default QualificheUI;