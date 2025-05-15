// frontend/js/modules/privilegi/ui.js
/**
 * ui.js - Gestione interfaccia utente per privilegi/utenti
 */
import { Notifications } from '../../main.js';
import privilegiState from './state.js';
import { PRIVILEGI_CONFIG, ROLES } from './config.js';

export const PrivilegiUI = {
  showLoading() {
    const tbody = document.querySelector('#users-table tbody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Caricamento...</span>
            </div>
            <p class="mt-2">${PRIVILEGI_CONFIG.MESSAGES.LOADING}</p>
          </td>
        </tr>
      `;
    }
  },

  showError(message) {
    const tbody = document.querySelector('#users-table tbody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center text-danger py-4">
            <i class="bi bi-exclamation-triangle" style="font-size: 2rem;"></i>
            <p class="mt-2">${message}</p>
          </td>
        </tr>
      `;
    }
  },

  showEmpty(message = PRIVILEGI_CONFIG.MESSAGES.NO_DATA) {
    const tbody = document.querySelector('#users-table tbody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center text-muted py-4">
            ${message}
          </td>
        </tr>
      `;
    }
  },

  renderTable(filter = '') {
    const tbody = document.querySelector('#users-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const usersFiltered = privilegiState.getFilteredUsers(filter);

    if (usersFiltered.length === 0) {
      this.showEmpty(filter ? PRIVILEGI_CONFIG.MESSAGES.NO_RESULTS : PRIVILEGI_CONFIG.MESSAGES.NO_DATA);
      return;
    }

    usersFiltered.forEach(user => {
      const row = this.createTableRow(user);
      tbody.appendChild(row);
    });
  },

  createTableRow(user) {
    const row = document.createElement('tr');
    row.setAttribute('data-user-id', user.id);
    
    const roleInfo = PRIVILEGI_CONFIG.ROLES_HIERARCHY[user.ruolo] || 
                    PRIVILEGI_CONFIG.ROLES_HIERARCHY[PRIVILEGI_CONFIG.DEFAULT_ROLE];
    
    row.innerHTML = `
      <td>${user.id}</td>
      <td class="fw-bold">${user.username}</td>
      <td>
        <span class="badge bg-${roleInfo.color}">
          ${roleInfo.label}
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-warning me-1" onclick="window.modificaUtente(${user.id}, '${user.username}', '${user.ruolo}')">
          <i class="bi bi-pencil"></i> Modifica
        </button>
        <button class="btn btn-sm btn-danger" onclick="window.eliminaUtente(${user.id})">
          <i class="bi bi-trash"></i> Elimina
        </button>
      </td>
    `;
    
    return row;
  },

  populateForm(user = null) {
    const userIdField = document.getElementById('userId');
    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password');
    const ruoloField = document.getElementById('ruolo');
    const passwordHint = document.querySelector('.form-text');
    const formTitle = document.querySelector('.form-container h5');
    
    if (user) {
      // Modalità modifica
      userIdField.value = user.id;
      usernameField.value = user.username;
      passwordField.value = '';
      ruoloField.value = user.ruolo;
      
      if (passwordHint) {
        passwordHint.style.display = 'block';
      }
      
      if (formTitle) {
        formTitle.textContent = 'Modifica Utente';
      }
    } else {
      // Modalità aggiunta
      this.resetForm();
    }
    
    // Scroll al form
    const formContainer = document.querySelector('.form-container');
    if (formContainer) {
      formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  },

  resetForm() {
    const userIdField = document.getElementById('userId');
    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password');
    const ruoloField = document.getElementById('ruolo');
    const passwordHint = document.querySelector('.form-text');
    const formTitle = document.querySelector('.form-container h5');
    
    if (userIdField) userIdField.value = '';
    if (usernameField) usernameField.value = '';
    if (passwordField) passwordField.value = '';
    if (ruoloField) ruoloField.value = PRIVILEGI_CONFIG.DEFAULT_ROLE;
    
    if (passwordHint) {
      passwordHint.style.display = 'none';
    }
    
    if (formTitle) {
      formTitle.textContent = 'Aggiungi Utente';
    }
  },

  populateDeleteModal(user) {
    const deleteUserName = document.getElementById('deleteUserName');
    const deleteUserRole = document.getElementById('deleteUserRole');
    const deleteWarning = document.getElementById('deleteWarning');
    
    if (deleteUserName) {
      deleteUserName.textContent = user.username;
    }
    
    if (deleteUserRole) {
      const roleInfo = PRIVILEGI_CONFIG.ROLES_HIERARCHY[user.ruolo];
      deleteUserRole.textContent = roleInfo.label;
    }
    
    if (deleteWarning) {
      if (user.ruolo === ROLES.SUPERADMIN) {
        const superadminCount = privilegiState.getUsers()
          .filter(u => u.ruolo === ROLES.SUPERADMIN).length;
        
        if (superadminCount <= 1) {
          deleteWarning.innerHTML = `
            <p class="text-danger mb-0">
              <i class="bi bi-exclamation-octagon"></i>
              <strong>Attenzione:</strong> Non puoi eliminare l'ultimo Super Admin del sistema!
            </p>
          `;
        } else {
          deleteWarning.innerHTML = `
            <p class="text-warning mb-0">
              <i class="bi bi-exclamation-triangle"></i>
              Stai eliminando un Super Admin. Assicurati che ci siano altri Super Admin nel sistema.
            </p>
          `;
        }
      } else {
        deleteWarning.innerHTML = '';
      }
    }
  },

  highlightAddedUser(userId) {
    const row = document.querySelector(`[data-user-id="${userId}"]`);
    if (row) {
      row.classList.add('table-success');
      setTimeout(() => {
        row.classList.remove('table-success');
      }, 2000);
    }
  },

  updateBadgeCounts() {
    const users = privilegiState.getUsers();
    const totalCount = users.length;
    
    const counts = {
      total: totalCount,
      superadmin: users.filter(u => u.ruolo === ROLES.SUPERADMIN).length,
      admin: users.filter(u => u.ruolo === ROLES.ADMIN).length,
      supervisor: users.filter(u => u.ruolo === ROLES.SUPERVISOR).length,
      user: users.filter(u => u.ruolo === ROLES.USER).length
    };
    
    // Aggiorna il badge del totale
    const totalBadge = document.getElementById('totalUsersBadge');
    if (totalBadge) {
      totalBadge.textContent = counts.total;
    }
    
    // Aggiorna altri badge se presenti
    Object.keys(counts).forEach(role => {
      const badge = document.getElementById(`${role}CountBadge`);
      if (badge) {
        badge.textContent = counts[role];
      }
    });
  }
};

export default PrivilegiUI;