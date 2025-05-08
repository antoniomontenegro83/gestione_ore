/**
 * Script per la gestione dei turni
 */

// Visualizza il ruolo dell'utente
const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
document.getElementById('userRoleDisplay').textContent = currentUser.ruolo || 'user';

// Gestione logout
document.getElementById("logoutBtn").addEventListener("click", function() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
});

// Funzione per mostrare un alert
function showAlert(message, type) {
  // Crea un elemento di alert se non esiste già
  let alertContainer = document.getElementById('alert-container');
  if (!alertContainer) {
    alertContainer = document.createElement('div');
    alertContainer.id = 'alert-container';
    alertContainer.className = 'position-fixed top-0 start-50 translate-middle-x p-3';
    alertContainer.style.zIndex = '1050';
    document.body.appendChild(alertContainer);
  }
  
  const alertEl = document.createElement('div');
  alertEl.className = `alert alert-${type} alert-dismissible fade show`;
  alertEl.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  alertContainer.appendChild(alertEl);
  
  // Rimuovi l'alert dopo 3 secondi
  setTimeout(() => {
    alertEl.classList.remove('show');
    setTimeout(() => {
      alertEl.remove();
    }, 300);
  }, 3000);
}

// Funzione per pulire la risposta da eventuali commenti
function cleanResponse(responseText) {
  // Se la risposta inizia con un commento, troviamo l'inizio del JSON ('{' o '[')
  const jsonStart = responseText.indexOf('[');
  if (jsonStart > 0) {
    return responseText.substring(jsonStart);
  }
  return responseText;
}

let turniTotali = [];
const isAdmin = currentUser.ruolo === 'admin';

/**
 * Carica l'elenco dei turni dal server
 */
async function caricaTurni() {
  try {
    // Effettua la richiesta al server
    const res = await fetch("../backend_gestione_ore/turni/list.php");
    
    // Ottieni la risposta come testo
    const responseText = await res.text();
    
    // Pulisci la risposta
    const cleanedResponse = cleanResponse(responseText);
    
    try {
      // Parsa il JSON
      turniTotali = JSON.parse(cleanedResponse);
      console.log("Turni caricati:", turniTotali.length);
      
      popolaDipendenti(turniTotali);
      filtraTurni();
    } catch (jsonError) {
      console.error("Errore nel parsing JSON:", jsonError);
      showAlert("Errore nel caricamento dei turni: " + jsonError.message, "danger");
    }
  } catch (err) {
    console.error("Errore nel caricamento turni:", err);
    showAlert("Errore di connessione: " + err.message, "danger");
  }
}

/**
 * Popola il menu a discesa dei dipendenti
 * @param {Array} data - Elenco dei turni
 * @param {string} filtro - Filtro di ricerca opzionale
 */
function popolaDipendenti(data, filtro = "") {
  const select = document.getElementById("dipendenteSelect");
  select.innerHTML = '<option value="">-- Seleziona dipendente --</option>';
  const visti = new Set();

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
    if (descrizione.toLowerCase().includes(filtro.toLowerCase())) {
      const opt = document.createElement("option");
      opt.value = dip.nomeCompleto;
      opt.textContent = descrizione;
      select.appendChild(opt);
    }
  });
}

/**
 * Filtra i turni in base ai criteri selezionati
 */
function filtraTurni() {
  const filtroDip = document.getElementById("dipendenteSelect").value;
  const dataDa = document.getElementById("dataInizio").value;
  const dataA = document.getElementById("dataFine").value;
  const tbody = document.querySelector("#shifts-table tbody");
  tbody.innerHTML = "";
  let risultati = 0;

  if (turniTotali.length === 0) {
    const row = document.createElement("tr");
    const td = document.createElement("td");
    td.setAttribute("colspan", "6");
    td.className = "text-center text-muted";
    td.textContent = "Nessun turno disponibile nel database";
    row.appendChild(td);
    tbody.appendChild(row);
    return;
  }

  turniTotali.forEach(s => {
    if (!s.nome || !s.cognome) {
      return; // Salta turni senza nome o cognome
    }
    
    const nomeCompleto = s.cognome + " " + s.nome;
    const ingresso = formatDateTime(s.entry_date, s.entry_time);
    const uscita = formatDateTime(s.exit_date, s.exit_time);
    const dataIngresso = s.entry_date;
    const dentroIntervallo =
      (!dataDa || dataIngresso >= dataDa) &&
      (!dataA || dataIngresso <= dataA);

    if ((filtroDip === "" || nomeCompleto === filtroDip) && dentroIntervallo) {
      const azioni = isAdmin
        ? `<button class='btn btn-sm btn-warning me-1' onclick="apriModifica(${s.id}, '${s.entry_date}', '${s.entry_time}', '${s.exit_date}', '${s.exit_time}')">Modifica</button>
           <button class='btn btn-sm btn-danger' onclick="eliminaTurno(${s.id})">Elimina</button>`
        : '';

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${s.qualifica || "-"}</td>
        <td>${s.cognome}</td>
        <td>${s.nome}</td>
        <td>${ingresso}</td>
        <td>${uscita}</td>
        <td>${azioni}</td>
      `;
      tbody.appendChild(row);
      risultati++;
    }
  });

  if (risultati === 0) {
    const row = document.createElement("tr");
    const td = document.createElement("td");
    td.setAttribute("colspan", "6");
    td.className = "text-center text-muted";
    td.textContent = "Nessun turno da visualizzare";
    row.appendChild(td);
    tbody.appendChild(row);
  }
}

/**
 * Formatta una data e un'ora in formato italiano
 * @param {string} date - Data in formato ISO
 * @param {string} time - Ora in formato ISO
 * @returns {string} - Data e ora formattate in italiano
 */
function formatDateTime(date, time) {
  if (!date || !time) return "-";
  
  try {
    const d = new Date(date + 'T' + time);
    if (isNaN(d.getTime())) return date + " " + time;
    
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  } catch (e) {
    console.error("Errore nel formato data:", e);
    return date + " " + time;
  }
}

/**
 * Elimina un turno
 * @param {number} id - ID del turno da eliminare
 */
async function eliminaTurno(id) {
  if (!confirm("Sei sicuro di voler eliminare questo turno?")) return;

  try {
    const res = await fetch(`../backend_gestione_ore/turni/delete.php?id=${id}`);
    
    // Ottieni la risposta come testo
    const responseText = await res.text();
    
    // Pulisci la risposta
    const cleanedResponse = cleanResponse(responseText);
    
    try {
      // Parsa il JSON
      const result = JSON.parse(cleanedResponse);

      if (result.success) {
        showAlert("Turno eliminato con successo!", "success");
        await caricaTurni();
      } else {
        showAlert("Errore nell'eliminazione: " + (result.error || "Errore sconosciuto"), "danger");
      }
    } catch (jsonError) {
      console.error("Errore nel parsing JSON:", jsonError);
      showAlert("Errore nell'analisi della risposta dal server", "danger");
    }
  } catch (err) {
    console.error("Errore di rete eliminazione:", err);
    showAlert("Errore di connessione: " + err.message, "danger");
  }
}

/**
 * Valida le date di ingresso e uscita
 * @param {string} ingresso - Data e ora di ingresso
 * @param {string} uscita - Data e ora di uscita
 * @returns {boolean} - true se valido, false altrimenti
 */
function validaTurno(ingresso, uscita) {
  const dataIngresso = new Date(ingresso);
  const dataUscita = new Date(uscita);
  
  if (dataUscita <= dataIngresso) {
    showAlert("La data/ora di uscita deve essere successiva alla data/ora di ingresso", "danger");
    return false;
  }
  
  return true;
}

/**
 * Apre il modale per modificare un turno
 * @param {number} id - ID del turno
 * @param {string} entryDate - Data di ingresso
 * @param {string} entryTime - Ora di ingresso
 * @param {string} exitDate - Data di uscita
 * @param {string} exitTime - Ora di uscita
 */
function apriModifica(id, entryDate, entryTime, exitDate, exitTime) {
  document.getElementById("modificaId").value = id;
  document.getElementById("modificaIngresso").value = entryDate + "T" + entryTime;
  document.getElementById("modificaUscita").value = exitDate + "T" + exitTime;
  new bootstrap.Modal(document.getElementById("modaleModifica")).show();
}

/**
 * Pulisce i filtri e mostra tutti i turni
 */
function pulisciFiltri() {
  document.getElementById("dipendenteSearch").value = "";
  document.getElementById("dipendenteSelect").selectedIndex = 0;
  document.getElementById("dataInizio").value = "";
  document.getElementById("dataFine").value = "";
  popolaDipendenti(turniTotali);
  filtraTurni();
}

// Gestione del form per la modifica di un turno
document.getElementById("formModificaTurno").addEventListener("submit", async function(e) {
  e.preventDefault();
  const id = document.getElementById("modificaId").value;
  const ingresso = document.getElementById("modificaIngresso").value;
  const uscita = document.getElementById("modificaUscita").value;

  // Valida le date prima di inviare al server
  if (!validaTurno(ingresso, uscita)) {
    return; // Interrompe l'invio se la validazione fallisce
  }

  try {
    const res = await fetch("../backend_gestione_ore/turni/update.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ingresso, uscita })
    });

    // Ottieni la risposta come testo
    const responseText = await res.text();
    
    // Pulisci la risposta
    const cleanedResponse = cleanResponse(responseText);
    
    try {
      // Parsa il JSON
      const result = JSON.parse(cleanedResponse);

      if (result.success) {
        showAlert("Turno modificato con successo!", "success");
        await caricaTurni();
        bootstrap.Modal.getInstance(document.getElementById("modaleModifica")).hide();
      } else {
        showAlert("Errore nella modifica: " + (result.error || "Errore sconosciuto"), "danger");
      }
    } catch (jsonError) {
      console.error("Errore nel parsing JSON:", jsonError);
      showAlert("Errore nell'analisi della risposta dal server", "danger");
    }
  } catch (err) {
    console.error("Errore di rete modifica:", err);
    showAlert("Errore di connessione: " + err.message, "danger");
  }
});

// Eventi listener per la ricerca dipendenti
document.getElementById("dipendenteSearch").addEventListener("input", function() {
  const valore = this.value;
  if (valore.length >= 3) {
    popolaDipendenti(turniTotali, valore);
    setTimeout(() => {
      const select = document.getElementById("dipendenteSelect");
      if (select.options.length === 2) {
        select.selectedIndex = 1;
        filtraTurni();
      }
    }, 100);
  } else {
    popolaDipendenti(turniTotali);
  }
});

// Aggiungi event listener ai pulsanti di filtro e pulizia
document.addEventListener('DOMContentLoaded', function() {
  // Pulsanti di filtro
  const filtroBtn = document.querySelector('.btn-primary');
  if (filtroBtn) {
    filtroBtn.addEventListener('click', filtraTurni);
  }
  
  // Pulsante di pulizia
  const pulisciBtn = document.querySelector('.btn-outline-secondary');
  if (pulisciBtn) {
    pulisciBtn.addEventListener('click', pulisciFiltri);
  }
  
  // Altri event listener
  document.getElementById("dipendenteSelect").addEventListener("change", filtraTurni);
  
  // Imposta la data di oggi come valore predefinito per il filtro
  setOggiFilterDate();
  
  // Carica i turni all'avvio
  caricaTurni();
});

// Imposta la data di oggi come valore predefinito per il filtro
function setOggiFilterDate() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('dataInizio').value = today;
  document.getElementById('dataFine').value = today;
}