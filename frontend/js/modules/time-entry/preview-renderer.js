/**
 * modules/time-entry/preview-renderer.js - Modulo per il rendering dell'anteprima
 */

class PreviewRenderer {
  constructor(containerId = 'anteprima-ore') {
    this.containerId = containerId;
    this.container = null;
  }

  /**
   * Inizializza il renderer
   */
  init(parentElement) {
    console.log('PreviewRenderer: Inizializzazione...');
    
    // Prima verifica se il container esiste già
    this.container = document.getElementById(this.containerId);
    
    if (!this.container) {
      console.log('PreviewRenderer: Container non trovato, lo creo...');
      this.container = document.createElement('div');
      this.container.id = this.containerId;
      this.container.className = 'alert alert-light mt-3';
      
      // Trova il punto dove inserire il container
      // Cerca prima di tutto i campi delle date
      const dateFields = parentElement.querySelector('.row.g-3.mt-2:last-of-type');
      
      if (dateFields) {
        // Inserisci dopo i campi delle date
        dateFields.insertAdjacentElement('afterend', this.container);
      } else {
        // Fallback: cerca il pulsante submit
        const submitBtnContainer = parentElement.querySelector('.d-flex.justify-content-center.mt-4');
        
        if (submitBtnContainer) {
          parentElement.insertBefore(this.container, submitBtnContainer);
        } else {
          // Ultimo fallback: aggiungi alla fine del form
          parentElement.appendChild(this.container);
        }
      }
      
      console.log('PreviewRenderer: Container creato e inserito nel DOM');
    } else {
      console.log('PreviewRenderer: Container già esistente');
    }
    
    this.mostraVuoto();
  }

  /**
   * Mostra l'anteprima vuota
   */
  mostraVuoto() {
    if (!this.container) {
      console.error('PreviewRenderer: Container non inizializzato');
      return;
    }
    
    let html = '<h6><i class="bi bi-calculator"></i> Anteprima Calcolo Ore</h6>';
    html += '<div class="row">';
    html += '<div class="col-md-6">';
    html += '<ul class="list-unstyled mb-0">';
    html += '<li><strong>Ore Feriali Diurne:</strong> <span class="ore-value" data-tipo="feriali_diurne">--:--</span></li>';
    html += '<li><strong>Ore Feriali Notturne:</strong> <span class="ore-value" data-tipo="feriali_notturne">--:--</span></li>';
    html += '<li><strong>Ore Festive Diurne:</strong> <span class="ore-value" data-tipo="festive_diurne">--:--</span></li>';
    html += '<li><strong>Ore Festive Notturne:</strong> <span class="ore-value" data-tipo="festive_notturne">--:--</span></li>';
    html += '</ul>';
    html += '</div>';
    html += '<div class="col-md-6">';
    html += '<p class="h5 mb-2">Totale: <strong><span class="totale-value">--:--</span></strong></p>';
    html += '<p class="small mb-0">Durata turno: <span class="durata-value">--:--</span></p>';
    html += '<div class="info-festivi"></div>';
    html += '</div>';
    html += '</div>';
    html += '<div class="warning-container"></div>';
    
    this.container.innerHTML = html;
    this.container.className = 'alert alert-light mt-3';
    this.container.style.display = 'block';
    
    console.log('PreviewRenderer: Mostrata anteprima vuota');
  }

  /**
   * Mostra il risultato del calcolo
   */
  mostraRisultato(risultatoFormattato) {
    if (!this.container) {
      console.error('PreviewRenderer: Container non inizializzato');
      return;
    }
    
    console.log('PreviewRenderer: Mostro risultato:', risultatoFormattato);
    
    // Prima assicurati che il container abbia il contenuto base
    if (!this.container.querySelector('.ore-value')) {
      this.mostraVuoto();
    }
    
    this.container.className = 'alert alert-info mt-3';
    
    // Aggiorna i valori
    this.updateElement('[data-tipo="feriali_diurne"]', risultatoFormattato.ore.feriali_diurne);
    this.updateElement('[data-tipo="feriali_notturne"]', risultatoFormattato.ore.feriali_notturne);
    this.updateElement('[data-tipo="festive_diurne"]', risultatoFormattato.ore.festive_diurne);
    this.updateElement('[data-tipo="festive_notturne"]', risultatoFormattato.ore.festive_notturne);
    this.updateElement('.totale-value', risultatoFormattato.totale);
    this.updateElement('.durata-value', risultatoFormattato.durata);
    
    // Info festivi
    const infoFestiviDiv = this.container.querySelector('.info-festivi');
    if (infoFestiviDiv) {
      if (risultatoFormattato.infoFestivi && 
          (risultatoFormattato.infoFestivi.inizioFestivo || risultatoFormattato.infoFestivi.fineFestivo)) {
        let testoFestivi = '<p class="small mb-0 text-danger"><i class="bi bi-calendar-x"></i> ';
        
        if (risultatoFormattato.infoFestivi.inizioFestivo && risultatoFormattato.infoFestivi.fineFestivo) {
          testoFestivi += 'Inizio e fine turno in giorni festivi';
        } else if (risultatoFormattato.infoFestivi.inizioFestivo) {
          testoFestivi += 'Inizio turno in giorno festivo';
        } else {
          testoFestivi += 'Fine turno in giorno festivo';
        }
        
        testoFestivi += '</p>';
        infoFestiviDiv.innerHTML = testoFestivi;
      } else {
        infoFestiviDiv.innerHTML = '';
      }
    }
    
    // Warning
    const warningContainer = this.container.querySelector('.warning-container');
    if (warningContainer) {
      if (risultatoFormattato.warning) {
        warningContainer.innerHTML = `<div class="alert alert-warning mt-2 mb-0"><i class="bi bi-exclamation-triangle"></i> ${risultatoFormattato.warning}</div>`;
      } else {
        warningContainer.innerHTML = '';
      }
    }
  }

  /**
   * Mostra un errore
   */
  mostraErrore(messaggio) {
    if (!this.container) {
      console.error('PreviewRenderer: Container non inizializzato');
      return;
    }
    
    console.log('PreviewRenderer: Mostro errore:', messaggio);
    
    this.container.className = 'alert alert-danger mt-3';
    let html = '<h6><i class="bi bi-calculator"></i> Anteprima Calcolo Ore</h6>';
    html += `<p class="mb-0"><i class="bi bi-exclamation-circle"></i> ${messaggio}</p>`;
    this.container.innerHTML = html;
    this.container.style.display = 'block';
  }

  /**
   * Mostra indicatore di caricamento
   */
  mostraCaricamento() {
    if (!this.container) return;
    
    this.container.className = 'alert alert-light mt-3';
    this.container.innerHTML = `
      <h6><i class="bi bi-calculator"></i> Anteprima Calcolo Ore</h6>
      <div class="text-center">
        <div class="spinner-border spinner-border-sm" role="status">
          <span class="visually-hidden">Calcolo in corso...</span>
        </div>
        <span class="ms-2">Calcolo in corso...</span>
      </div>
    `;
    this.container.style.display = 'block';
  }

  /**
   * Mostra/nasconde indicatore di caricamento
   */
  setLoading(isLoading) {
    if (!this.container) return;
    
    if (isLoading) {
      this.mostraCaricamento();
    }
  }

  /**
   * Helper per aggiornare un elemento
   */
  updateElement(selector, value) {
    const element = this.container.querySelector(selector);
    if (element) {
      element.textContent = value;
    } else {
      console.warn(`PreviewRenderer: Elemento ${selector} non trovato`);
    }
  }
}

export default PreviewRenderer;