/**
 * modules/time-entry/ui.js - Gestione interfaccia utente per l'inserimento turni
 */
import { Utils } from '../../main.js';
import timeEntryState from './state.js';
import { TIME_ENTRY_CONFIG } from './config.js';

export const TimeEntryUI = {
  populateDipendentiSelect(filteredDipendenti = null) {
    const select = document.getElementById('employee_id');
    if (!select) return;
    
    const dipendenti = filteredDipendenti || timeEntryState.getDipendenti();
    
    // Mantieni l'opzione predefinita
    const defaultOption = select.querySelector('option[value=""]') || 
                         this.createDefaultOption('employee');
    
    select.innerHTML = '';
    select.appendChild(defaultOption);
    
    // Ordina i dipendenti
    const sortedDipendenti = [...dipendenti].sort((a, b) => {
      const cognomeCompare = a.cognome.localeCompare(b.cognome);
      return cognomeCompare !== 0 ? cognomeCompare : a.nome.localeCompare(b.nome);
    });
    
    // Aggiungi le opzioni
    sortedDipendenti.forEach(dip => {
      const option = document.createElement('option');
      option.value = dip.id;
      option.textContent = `${dip.cognome} ${dip.nome} - ${dip.qualifica || ''} - ${dip.sede || ''}`;
      select.appendChild(option);
    });
    
    // Se c'è un solo risultato filtrato, selezionalo automaticamente
    if (filteredDipendenti && filteredDipendenti.length === 1) {
      select.value = filteredDipendenti[0].id;
      timeEntryState.setSelectedEmployee(filteredDipendenti[0].id);
    }
  },

  populateSediSelect() {
    const select = document.getElementById('entry_sede');
    if (!select) return;
    
    const sedi = timeEntryState.getSedi();
    const selectedValue = select.value;
    
    // Mantieni l'opzione predefinita
    const defaultOption = select.querySelector('option[value=""]') || 
                         this.createDefaultOption('sede');
    
    select.innerHTML = '';
    select.appendChild(defaultOption);
    
    // Aggiungi le sedi ordinate
    const sortedSedi = [...sedi].sort((a, b) => a.nome.localeCompare(b.nome));
    
    sortedSedi.forEach(sede => {
      const option = document.createElement('option');
      option.value = sede.nome;
      option.textContent = sede.nome;
      
      if (sede.nome === selectedValue) {
        option.selected = true;
      }
      
      select.appendChild(option);
    });
  },

  createDefaultOption(type) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = type === 'employee' ? 
                        TIME_ENTRY_CONFIG.EMPLOYEE_DEFAULT : 
                        TIME_ENTRY_CONFIG.SEDE_DEFAULT;
    return option;
  },

  clearForm() {
    const form = document.getElementById('shift-form');
    if (form) {
      form.reset();
    }
    
    // Reset degli stati
    timeEntryState.clearState();
    
    // CORREZIONE: Assicurati che il campo dipendente torni all'opzione default
    const employeeSelect = document.getElementById('employee_id');
    if (employeeSelect) {
      employeeSelect.selectedIndex = 0;
    }
    
    // Reset della sede all'opzione default
    const sedeSelect = document.getElementById('entry_sede');
    if (sedeSelect) {
      sedeSelect.selectedIndex = 0;
    }
  },

  showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('status');
    if (!statusDiv) return;
    
    statusDiv.className = `alert alert-${type} mt-3`;
    statusDiv.textContent = message;
    statusDiv.style.display = 'block';
    
    // Auto-nascondi dopo 5 secondi per i messaggi di successo
    if (type === 'success') {
      setTimeout(() => {
        statusDiv.style.display = 'none';
      }, 5000);
    }
  }
};

export default TimeEntryUI;