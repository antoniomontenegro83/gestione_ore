/**
 * modules/time-entry/preview-calculator.js - Modulo per il calcolo dell'anteprima delle ore
 */

class PreviewCalculator {
  /**
   * Formatta ore decimali in formato HH:MM
   */
  static formatOreToHHMM(oreDecimali) {
    const ore = Math.floor(oreDecimali);
    const minuti = Math.round((oreDecimali - ore) * 60);
    return `${ore.toString().padStart(2, '0')}:${minuti.toString().padStart(2, '0')}`;
  }

  /**
   * Calcola l'anteprima chiamando il server
   */
  static async calcola(datiTurno) {
    const response = await fetch('../backend_gestione_ore/turni/preview.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datiTurno)
    });
    
    const responseText = await response.text();
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (jsonError) {
      console.error('Errore parsing JSON:', jsonError);
      throw new Error('Risposta server non valida');
    }
    
    if (!result.success) {
      throw new Error(result.error || 'Errore nel calcolo');
    }
    
    return result.calcolo;
  }

  /**
   * Formatta il risultato del calcolo per la visualizzazione
   */
  static formatRisultato(calcolo) {
    return {
      ore: {
        feriali_diurne: this.formatOreToHHMM(calcolo.ore.feriali_diurne),
        feriali_notturne: this.formatOreToHHMM(calcolo.ore.feriali_notturne),
        festive_diurne: this.formatOreToHHMM(calcolo.ore.festive_diurne),
        festive_notturne: this.formatOreToHHMM(calcolo.ore.festive_notturne)
      },
      totale: this.formatOreToHHMM(calcolo.totale),
      durata: calcolo.info_aggiuntive?.ore_totali_numeric 
        ? this.formatOreToHHMM(calcolo.info_aggiuntive.ore_totali_numeric) 
        : '--:--',
      infoFestivi: {
        inizioFestivo: calcolo.info_aggiuntive?.giorno_inizio_festivo || false,
        fineFestivo: calcolo.info_aggiuntive?.giorno_fine_festivo || false
      },
      warning: calcolo.warning || null
    };
  }
}

export default PreviewCalculator;