/**
 * preview-renderer.js - Modulo per il rendering dell'anteprima
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
    this.container = document.getElementById(this.containerId);
    
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = this.containerId;
      this.container.className = 'alert alert-light';
      
      const submitBtnContainer = parentElement.querySelector('.d-flex.justify-content-center.mt-4');
      
      if (submitBtnContainer) {
        parentElement.insertBefore(this.container, submitBtnContainer);
      } else {
        parentElement.appendChild(this.container);
      }
    }
    
    this.mostraVuoto();
  }

  /**
   * Mostra l'anteprima vuota
   */
  mostraVuoto() {
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
    this.container.className = 'alert alert-light';
    this.container.style.display = 'block';
  }

  /**
   * Mostra il risultato del calcolo
   */
  mostraRisultato(risultatoFormattato) {
    if (!this.container) return;
    
    this.container.className = 'alert alert-info';
    
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
      if (risultatoFormattato.infoFestivi.inizioFestivo || risultatoFormattato.infoFestivi.fineFestivo) {
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
    if (!this.container) return;
    
    this.container.className = 'alert alert-danger';
    
    const warningContainer = this.container.querySelector('.warning-container');
    if (warningContainer) {
      warningContainer.innerHTML = `<div class="text-danger"><i class="bi bi-exclamation-circle"></i> ${messaggio}</div>`;
    }
  }

  /**
   * Mostra/nasconde indicatore di caricamento
   */
  setLoading(isLoading) {
    if (!this.container) return;
    
    if (isLoading) {
      this.container.classList.add('loading');
    } else {
      this.container.classList.remove('loading');
    }
  }

  /**
   * Helper per aggiornare un elemento
   */
  updateElement(selector, value) {
    const element = this.container.querySelector(selector);
    if (element) {
      element.textContent = value;
    }
  }
}

export default PreviewRenderer;