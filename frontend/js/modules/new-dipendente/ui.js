/**
 * modules/new-dipendente/ui.js - Gestione interfaccia utente
 */
import newDipendenteState from './state.js';
import { NEW_DIPENDENTE_CONFIG } from './config.js';

export const NewDipendenteUI = {
  populateQualificheSelect() {
    const select = document.getElementById('qualifica');
    if (!select) {
      console.error('Select qualifica non trovato!');
      return;
    }
    
    const qualifiche = newDipendenteState.getQualifiche();
    
    // Conserva l'opzione predefinita
    const defaultOption = select.querySelector('option[value=""]') || 
                         this.createDefaultOption('qualifica');
    
    select.innerHTML = '';
    select.appendChild(defaultOption);
    
    // Aggiungi le opzioni ordinate
    const sortedQualifiche = [...qualifiche].sort((a, b) => 
      a.qualifica.localeCompare(b.qualifica)
    );
    
    sortedQualifiche.forEach(q => {
      const option = document.createElement('option');
      option.value = q.qualifica;
      option.textContent = q.qualifica;
      select.appendChild(option);
    });
  },

  populateSediSelect() {
    const select = document.getElementById('sede');
    if (!select) {
      console.error('Select sede non trovato!');
      return;
    }
    
    const sedi = newDipendenteState.getSedi();
    
    // Conserva l'opzione predefinita
    const defaultOption = select.querySelector('option[value=""]') || 
                         this.createDefaultOption('sede');
    
    select.innerHTML = '';
    select.appendChild(defaultOption);
    
    // Aggiungi le opzioni ordinate
    const sortedSedi = [...sedi].sort((a, b) => a.nome.localeCompare(b.nome));
    
    sortedSedi.forEach(s => {
      const option = document.createElement('option');
      option.value = s.nome;
      option.textContent = s.nome;
      select.appendChild(option);
    });
  },

  createDefaultOption(type) {
    const option = document.createElement('option');
    option.value = '';
    option.disabled = true;
    option.selected = true;
    option.textContent = type === 'qualifica' ? 
                        'Seleziona qualifica...' : 
                        'Seleziona sede...';
    return option;
  },

  clearForm() {
    const form = document.getElementById(NEW_DIPENDENTE_CONFIG.FORM_ID);
    if (form) {
      form.reset();
    }
    this.clearFeedback();
  },

  showFeedback(message, type = 'success') {
    const resultDiv = document.getElementById(NEW_DIPENDENTE_CONFIG.RESULT_ID);
    if (!resultDiv) return;
    
    const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
    const iconClass = type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle';
    
    resultDiv.innerHTML = `
      <div class="alert ${alertClass} d-flex align-items-center" role="alert">
        <i class="bi ${iconClass} me-2"></i>
        <div>${message}</div>
      </div>
    `;
    
    // Auto-nasconde il feedback dopo il tempo specificato
    if (type === 'success') {
      setTimeout(() => {
        this.clearFeedback();
      }, NEW_DIPENDENTE_CONFIG.FEEDBACK_DURATION);
    }
  },

  clearFeedback() {
    const resultDiv = document.getElementById(NEW_DIPENDENTE_CONFIG.RESULT_ID);
    if (resultDiv) {
      resultDiv.innerHTML = '';
    }
  },

  getFormData() {
    const cognome = document.getElementById('cognome').value.trim().toUpperCase();
    const nome = document.getElementById('nome').value.trim().toUpperCase();
    const qualifica = document.getElementById('qualifica').value;
    const sede = document.getElementById('sede').value;
    
    return {
      cognome,
      nome,
      qualifica,
      sede
    };
  }
};

export default NewDipendenteUI;