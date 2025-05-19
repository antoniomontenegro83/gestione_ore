/**
 * events.js - Gestione eventi per dipendenti
 */
import dipendentiState from './state.js';
import DipendentiUI from './ui.js';
import DipendentiAPI from './api.js';
import { Notifications, Auth } from '../../main.js';
import { ROLES } from './config.js';

export const DipendentiEvents = {
  setupEventListeners() {
    // Listener per la ricerca
    const searchInput = document.getElementById('employee-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const searchValue = e.target.value;
        dipendentiState.setCurrentFilter(searchValue);
        DipendentiUI.renderTable(searchValue);
      });
    }
    
    // Pulsante di aggiunta dipendente
    const addButton = document.getElementById('addEmployeeBtn');
    if (addButton) {
      addButton.addEventListener('click', () => {
        window.location.href = 'new-dipendenti.html';
      });
    }
    
    // Form di modifica dipendente
    const modifyForm = document.getElementById('formModificaDipendente');
    if (modifyForm) {
      modifyForm.addEventListener('submit', this.handleModifyEmployee.bind(this));
    }
    
    // Pulsante di conferma eliminazione
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener('click', this.confermaEliminazione.bind(this));
    }
  },

  async handleModifyEmployee(e) {
    e.preventDefault();
    
    if (dipendentiState.isLoadingData()) return;
    
    const id = parseInt(document.getElementById('modificaId').value);
    const cognome = document.getElementById('modificaCognome').value.trim();
    const nome = document.getElementById('modificaNome').value.trim();
    const qualifica = document.getElementById('modificaQualifica').value;
    const sede = document.getElementById('modificaSede').value;
    
    dipendentiState.setLoading(true);
    
    try {
      const payload = { id, cognome, nome, qualifica, sede };
      const result = await DipendentiAPI.updateEmployee(payload);
      
      if (result.success) {
        Notifications.success("Dipendente modificato con successo!");
        
        // Chiudi il modale
        const modalElement = document.getElementById('modaleModifica');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
          modalInstance.hide();
        }
        
        // Aggiorna lo stato
        dipendentiState.updateEmployee(payload);
        
        // Ricarica la tabella
        DipendentiUI.renderTable(dipendentiState.getCurrentFilter());
      } else {
        Notifications.error("Errore nella modifica: " + (result.error || "Errore sconosciuto"));
      }
    } catch (error) {
      console.error("Errore durante la modifica:", error);
      Notifications.error("Errore di connessione");
    } finally {
      dipendentiState.setLoading(false);
    }
  },

  async confermaEliminazione() {
    const idToDelete = dipendentiState.getDipendenteToDelete();
    if (!idToDelete) return;
    
    // Chiudi il modale
    const modalElement = document.getElementById('confirmDeleteModal');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) {
      modalInstance.hide();
    }
    
    if (dipendentiState.isLoadingData()) return;
    dipendentiState.setLoading(true);
    
    try {
      const result = await DipendentiAPI.deleteEmployee(idToDelete);
      
      if (result.success) {
        Notifications.success("Dipendente eliminato con successo!");
        
        // Aggiorna lo stato
        dipendentiState.removeEmployee(idToDelete);
        
        // Ricarica la tabella
        DipendentiUI.renderTable(dipendentiState.getCurrentFilter());
      } else {
        Notifications.error("Errore nell'eliminazione: " + (result.error || "Errore sconosciuto"));
      }
    } catch (error) {
      console.error("Errore durante l'eliminazione:", error);
      Notifications.error("Errore di connessione");
    } finally {
      dipendentiState.setLoading(false);
      dipendentiState.clearDipendenteToDelete();
    }
  }
};

export default DipendentiEvents;