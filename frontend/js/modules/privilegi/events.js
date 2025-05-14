// frontend/js/modules/privilegi/events.js
/**
 * events.js - Gestione eventi per privilegi/utenti
 */
import privilegiState from './state.js';
import PrivilegiUI from './ui.js';
import PrivilegiAPI from './api.js';
import { Notifications } from '../../main.js';
import { PRIVILEGI_CONFIG, ROLES } from './config.js';

export const PrivilegiEvents = {
  setupEventListeners() {
    // Listener per il form
    const form = document.getElementById('formUtente');
    if (form) {
      form.addEventListener('submit', this.handleSubmitUser.bind(this));
    }

    // Listener per il pulsante reset
    const resetBtn = document.querySelector('[onclick*="resetForm"]');
    if (resetBtn) {
      resetBtn.removeAttribute('onclick');
      resetBtn.addEventListener('click', this.handleResetForm.bind(this));
    }

    // Listener per la ricerca
    const searchInput = document.getElementById('user-search');
    if (searchInput) {
      searchInput.addEventListener('input', this.handleSearch.bind(this));
    }

    // Listener per il pulsante di conferma eliminazione
    const confirmDeleteBtn = document.getElementById('confirmDeleteUserBtn');
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener('click', this.handleConfirmDelete.bind(this));
    }
  },

  async handleSubmitUser(e) {
    e.preventDefault();
    
    if (privilegiState.isLoadingData()) return;
    
    const userId = document.getElementById('userId').value;
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const ruolo = document.getElementById('ruolo').value;
    
    // Validazioni
    if (!username) {
      Notifications.warning(PRIVILEGI_CONFIG.MESSAGES.VALIDATION_USERNAME_REQUIRED);
      return;
    }
    
    if (username.length < 3) {
      Notifications.warning(PRIVILEGI_CONFIG.MESSAGES.VALIDATION_USERNAME_MIN_LENGTH);
      return;
    }
    
    // Per nuovi utenti, password obbligatoria
    if (!userId && !password) {
      Notifications.warning(PRIVILEGI_CONFIG.MESSAGES.VALIDATION_PASSWORD_REQUIRED);
      return;
    }
    
    // Verifica username duplicato (solo per nuovi utenti)
    if (!userId) {
      const existingUser = privilegiState.findUserByUsername(username);
      if (existingUser) {
        Notifications.warning(PRIVILEGI_CONFIG.MESSAGES.VALIDATION_USERNAME_EXISTS);
        return;
      }
    }
    
    privilegiState.setLoading(true);
    
    try {
      const userData = { username, ruolo };
      
      if (userId) {
        // Modifica utente esistente
        userData.id = userId;
        if (password) {
          userData.password = password;
        }
        
        const result = await PrivilegiAPI.updateUser(userData);
        
        if (result.success) {
          Notifications.success(PRIVILEGI_CONFIG.MESSAGES.SUCCESS_UPDATE);
          
          // Aggiorna lo stato
          privilegiState.updateUser(userData);
          
          // Aggiorna l'interfaccia
          PrivilegiUI.renderTable(privilegiState.getCurrentFilter());
          PrivilegiUI.resetForm();
          PrivilegiUI.updateBadgeCounts();
        } else {
          Notifications.error(PRIVILEGI_CONFIG.MESSAGES.ERROR_UPDATE + ': ' + 
                            (result.error || 'Errore sconosciuto'));
        }
      } else {
        // Nuovo utente
        userData.password = password;
        
        const result = await PrivilegiAPI.addUser(userData);
        
        if (result.success) {
          Notifications.success(PRIVILEGI_CONFIG.MESSAGES.SUCCESS_ADD);
          
          // Aggiungi allo stato
          const newUser = {
            id: result.id || Math.max(...privilegiState.getUsers().map(u => u.id)) + 1,
            username,
            ruolo
          };
          privilegiState.addUser(newUser);
          
          // Aggiorna l'interfaccia
          PrivilegiUI.renderTable(privilegiState.getCurrentFilter());
          PrivilegiUI.resetForm();
          PrivilegiUI.highlightAddedUser(newUser.id);
          PrivilegiUI.updateBadgeCounts();
        } else {
          Notifications.error(PRIVILEGI_CONFIG.MESSAGES.ERROR_ADD + ': ' + 
                            (result.error || 'Errore sconosciuto'));
        }
      }
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
      Notifications.error(PRIVILEGI_CONFIG.MESSAGES.CONNECTION_ERROR);
    } finally {
      privilegiState.setLoading(false);
    }
  },

  handleResetForm() {
    PrivilegiUI.resetForm();
    privilegiState.clearEditingUser();
  },

  handleSearch(e) {
    const searchValue = e.target.value.trim();
    privilegiState.setCurrentFilter(searchValue);
    PrivilegiUI.renderTable(searchValue);
  },

  async handleConfirmDelete() {
    const idToDelete = privilegiState.getUserToDelete();
    if (!idToDelete) return;
    
    // Verifica se può essere eliminato
    if (!privilegiState.canDeleteUser(idToDelete)) {
      Notifications.error("Non puoi eliminare l'ultimo Super Admin del sistema!");
      return;
    }
    
    // Chiudi il modale
    const modalElement = document.getElementById('confirmDeleteUserModal');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) {
      modalInstance.hide();
    }
    
    if (privilegiState.isLoadingData()) return;
    privilegiState.setLoading(true);
    
    try {
      const result = await PrivilegiAPI.deleteUser(idToDelete);
      
      if (result.success) {
        Notifications.success(PRIVILEGI_CONFIG.MESSAGES.SUCCESS_DELETE);
        
        // Aggiorna lo stato
        privilegiState.removeUser(idToDelete);
        
        // Aggiorna l'interfaccia
        PrivilegiUI.renderTable(privilegiState.getCurrentFilter());
        PrivilegiUI.updateBadgeCounts();
      } else {
        Notifications.error(PRIVILEGI_CONFIG.MESSAGES.ERROR_DELETE + ': ' + 
                          (result.error || 'Errore sconosciuto'));
      }
    } catch (error) {
      console.error("Errore durante l'eliminazione:", error);
      Notifications.error(PRIVILEGI_CONFIG.MESSAGES.CONNECTION_ERROR);
    } finally {
      privilegiState.setLoading(false);
      privilegiState.clearUserToDelete();
    }
  }
};

export default PrivilegiEvents;