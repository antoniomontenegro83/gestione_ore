/**
 * ui.js per new-dipendenti - Gestione interfaccia per l'aggiunta di nuovi dipendenti
 */
import { Notifications } from '../../main.js';

export const NewDipendentiUI = {
  /**
   * Mostra indicatore di caricamento nel form
   */
  showLoading(message = 'Caricamento in corso...') {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        ${message}
      `;
    }
  },

  /**
   * Rimuove indicatore di caricamento dal form
   */
  hideLoading() {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="bi bi-person-plus"></i> Aggiungi Dipendente';
    }
  },

  /**
   * Popola una select con le opzioni
   * @param {string} selectId - ID della select
   * @param {Array} items - Items da aggiungere
   * @param {string} defaultText - Testo dell'opzione default
   */
  populateSelect(selectId, items, defaultText = 'Seleziona...') {
    const select = document.getElementById(selectId);
    if (!select) {
      console.error(`Select ${selectId} non trovata`);
      return;
    }

    // Conserva l'opzione predefinita
    const defaultOption = select.querySelector('option[value=""]');
    if (defaultOption) {
      defaultOption.textContent = defaultText;
    }

    // Svuota le opzioni esistenti mantenendo la predefinita
    while (select.options.length > 1) {
      select.remove(1);
    }

    // Aggiungi le nuove opzioni
    items.forEach(item => {
      const option = document.createElement('option');
      if (typeof item === 'string') {
        option.value = item;
        option.textContent = item;
      } else if (item.qualifica) {
        option.value = item.qualifica;
        option.textContent = item.qualifica;
      } else if (item.nome) {
        option.value = item.nome;
        option.textContent = item.nome;
      }
      select.appendChild(option);
    });
  },

  /**
   * Resetta il form
   */
  resetForm() {
    const form = document.getElementById('add-form');
    if (form) {
      form.reset();
    }
  },

  /**
   * Mostra feedback di successo
   * @param {string} cognome - Cognome del dipendente aggiunto
   * @param {string} nome - Nome del dipendente aggiunto
   */
  showSuccess(cognome, nome) {
    const resultDiv = document.getElementById('result');
    if (resultDiv) {
      resultDiv.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
          <strong><i class="bi bi-check-circle me-2"></i>Successo!</strong> 
          Dipendente ${cognome} ${nome} aggiunto correttamente.
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      `;

      // Rimuovi il feedback dopo 5 secondi
      setTimeout(() => {
        const alert = resultDiv.querySelector('.alert');
        if (alert) {
          alert.classList.remove('show');
          setTimeout(() => resultDiv.innerHTML = '', 300);
        }
      }, 5000);
    }
  },

  /**
   * Mostra errore nel div risultato
   * @param {string} message - Messaggio di errore
   */
  showError(message) {
    const resultDiv = document.getElementById('result');
    if (resultDiv) {
      resultDiv.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
          <strong><i class="bi bi-exclamation-triangle me-2"></i>Errore!</strong> 
          ${message}
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      `;
    }
  },

  /**
   * Mostra avviso nel div risultato
   * @param {string} message - Messaggio di avviso
   */
  showWarning(message) {
    const resultDiv = document.getElementById('result');
    if (resultDiv) {
      resultDiv.innerHTML = `
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
          <strong><i class="bi bi-exclamation-circle me-2"></i>Attenzione!</strong> 
          ${message}
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      `;
    }
  },

  /**
   * Aggiorna il badge del contatore dipendenti
   * @param {number} count - Numero totale di dipendenti
   */
  updateCounter(count) {
    const counterBadge = document.getElementById('totalEmployees');
    if (counterBadge) {
      counterBadge.textContent = count;
    }
  },

  /**
   * Abilita/disabilita il form
   * @param {boolean} enabled - True per abilitare, false per disabilitare
   */
  setFormEnabled(enabled) {
    const form = document.getElementById('add-form');
    if (form) {
      const elements = form.querySelectorAll('input, select, button');
      elements.forEach(element => {
        element.disabled = !enabled;
      });
    }
  },

  /**
   * Ottieni i valori dal form
   * @returns {Object} - Oggetto con i valori del form
   */
  getFormValues() {
    return {
      cognome: document.getElementById('cognome')?.value.trim().toUpperCase() || '',
      nome: document.getElementById('nome')?.value.trim().toUpperCase() || '',
      qualifica: document.getElementById('qualifica')?.value || '',
      sede: document.getElementById('sede')?.value || ''
    };
  },

  /**
   * Valida i campi del form
   * @returns {Object} - {valid: boolean, errors: Array}
   */
  validateForm() {
    const values = this.getFormValues();
    const errors = [];

    if (!values.cognome) {
      errors.push('Il cognome è obbligatorio');
    }
    if (!values.nome) {
      errors.push('Il nome è obbligatorio');
    }
    if (!values.qualifica) {
      errors.push('La qualifica è obbligatoria');
    }
    if (!values.sede) {
      errors.push('La sede è obbligatoria');
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  },

  /**
   * Evidenzia i campi con errori
   * @param {Array} fields - Array di ID dei campi con errori
   */
  highlightErrors(fields) {
    // Rimuovi evidenziazione precedente
    const form = document.getElementById('add-form');
    if (form) {
      form.querySelectorAll('.is-invalid').forEach(el => {
        el.classList.remove('is-invalid');
      });

      // Aggiungi evidenziazione ai campi specificati
      fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
          field.classList.add('is-invalid');
        }
      });
    }
  }
};

export default NewDipendentiUI;