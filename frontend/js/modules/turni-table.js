// frontend/js/modules/turni-table.js
/**
 * Modulo per la gestione della tabella dei turni
 */

export const TurniTable = {
  /**
   * Popola il menu a discesa dei dipendenti
   */
  popolaDipendenti(data, filtro = "") {
    const select = document.getElementById("dipendenteSelect");
    if (!select) return;
    
    // Salva il valore corrente
    const currentValue = select.value;
    
    select.innerHTML = '<option value="">-- Seleziona dipendente --</option>';

    // Crea una mappa per tenere traccia dei dipendenti unici con qualifica
    const dipendenteMap = new Map();

    // Popola la mappa con i dipendenti unici e le loro qualifiche
    data.forEach(s => {
      if (s.nome && s.cognome) {
        const nomeCompleto = s.cognome + " " + s.nome;
        if (!dipendenteMap.has(nomeCompleto)) {
          dipendenteMap.set(nomeCompleto, {
            nome: s.nome,
            cognome: s.cognome,
            qualifica: s.qualifica,
            sede: s.sede
          });
        }
      }
    });

    // Converti la mappa in un array e ordina per cognome e nome
    const dipendentiUnici = Array.from(dipendenteMap.entries()).map(([nome, dip]) => ({
      nomeCompleto: nome,
      ...dip
    })).sort((a, b) => a.cognome.localeCompare(b.cognome) || a.nome.localeCompare(b.nome));

    // Filtra e popola il select
    dipendentiUnici.forEach(dip => {
      const descrizione = `${dip.cognome} ${dip.nome} - ${dip.qualifica || ""}`;
      if (!filtro || descrizione.toLowerCase().includes(filtro.toLowerCase())) {
        const opt = document.createElement("option");
        opt.value = dip.nomeCompleto;
        opt.textContent = descrizione;
        select.appendChild(opt);
      }
    });
    
    // Ripristina il valore precedente se esiste ancora
    if (currentValue) {
      select.value = currentValue;
    }
  },

  /**
   * Crea l'HTML per le azioni di una riga
   */
  creaAzioni(turno, isAdmin) {
    if (!isAdmin) return '';
    
    return `
      <button class='btn btn-sm btn-warning me-1' onclick="apriModifica(${turno.id}, '${turno.entry_date}', '${turno.entry_time}', '${turno.exit_date}', '${turno.exit_time}')">Modifica</button>
      <button class='btn btn-sm btn-danger' onclick="preparaEliminazioneTurno(${turno.id})">Elimina</button>
    `;
  },

  /**
   * Crea info aggiuntive per le ore
   */
  creaInfoOre(turno) {
    if (!turno.totale_ore && turno.durata_ore === undefined) {
      return '';
    }
    
    const totaleOre = turno.totale_ore || '0.00';
    const durataTesto = turno.durata_ore !== undefined && turno.durata_minuti !== undefined 
      ? `${turno.durata_ore}h ${turno.durata_minuti}'` 
      : '';
    return `<br/><small class="text-muted">${durataTesto} (${totaleOre} ore)</small>`;
  },

  /**
   * Mostra messaggio quando non ci sono turni
   */
  mostraNessunTurno(tbody, messaggio = "Nessun turno da visualizzare") {
    const row = document.createElement("tr");
    const td = document.createElement("td");
    td.setAttribute("colspan", "6");
    td.className = "text-center text-muted";
    td.textContent = messaggio;
    row.appendChild(td);
    tbody.appendChild(row);
  },

  /**
   * Rimuovi riga dalla tabella
   */
  rimuoviRiga(turnoId) {
    const turnoRow = document.querySelector(`tr[data-turno-id="${turnoId}"]`);
    if (turnoRow) {
      turnoRow.remove();
      
      // Se non ci sono più righe nella tabella, mostra il messaggio "nessun turno"
      const tbody = document.querySelector("#shifts-table tbody");
      if (tbody && tbody.children.length === 0) {
        this.mostraNessunTurno(tbody);
      }
      return true;
    }
    return false;
  }
};

export default TurniTable;