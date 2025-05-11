/**
 * Script per la gestione dei turni
 */
import { Auth, Api, Notifications, Utils } from './main.js';
import AuthCommon from './auth-common.js';

// Variabili globali
let turniTotali = [];
let isAdmin = false;
let isLoading = false;

// Inizializzazione all'avvio
document.addEventListener('DOMContentLoaded', async function() {
  // Setup delle configurazioni iniziali
  setupInitialConfig();
  
  // Carica i turni
  await caricaTurni();
  
  // Configura i listener degli eventi
  setupEventListeners();
});

/**
 * Configurazione iniziale
 */
function setupInitialConfig() {
  // Ottieni le informazioni dell'utente
  const currentUser = Auth.getCurrentUser();
  if (!currentUser) {
    console.error("Utente non autenticato");
    return;
  }
  
  // Imposta il ruolo admin
  isAdmin = currentUser.ruolo === 'admin';
  
  // Imposta la data di oggi come valore predefinito per il filtro
  setOggiFilterDate();
}

/**
 * Configura gli event listener
 */
function setupEventListeners() {
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
  const dipendenteSelect = document.getElementById("dipendenteSelect");
  if (dipendenteSelect) {
    dipendenteSelect.addEventListener("change", filtraTurni);
  }
  
  // Eventi listener per la ricerca dipendenti
  const dipendenteSearch = document.getElementById("dipendenteSearch");
  if (dipendenteSearch) {
    dipendenteSearch.addEventListener("input", function() {
      const valore = this.value;
      if (valore.length >= 3) {
        popolaDipendenti(turniTotali, valore);
        setTimeout(() => {
          const select = document.getElementById("dipendenteSelect");
          if (select && select.options.length === 2) {
            select.selectedIndex = 1;
            filtraTurni();
          }
        }, 100);
      } else {
        popolaDipendenti(turniTotali);
      }
    });
  }
  
  // Gestione del form per la modifica di un turno
  const formModificaTurno = document.getElementById("formModificaTurno");
  if (formModificaTurno) {
    formModificaTurno.addEventListener("submit", handleModificaTurno);
  }
}

/**
 * Gestisce l'invio del form di modifica turno
 * @param {Event} e - Evento submit
 */
async function handleModificaTurno(e) {
  e.preventDefault();
  
  // Evita invii multipli
  if (isLoading) return;
  isLoading = true;
  
  try {
    const id = document.getElementById("modificaId").value;
    const ingresso = document.getElementById("modificaIngresso").value;
    const uscita = document.getElementById("modificaUscita").value;

    // Valida le date prima di inviare al server
    if (!validaTurno(ingresso, uscita)) {
      return; // Interrompe l'invio se la validazione fallisce
    }

    const result = await Api.post("turni/update.php", { id, ingresso, uscita });

    if (result.success) {
      Notifications.success("Turno modificato con successo!");
      await caricaTurni();
      bootstrap.Modal.getInstance(document.getElementById("modaleModifica")).hide();
    } else {
      Notifications.error("Errore nella modifica: " + (result.error || "Errore sconosciuto"));
    }
  } catch (err) {
    console.error("Errore di rete modifica:", err);
    Notifications.error("Errore di connessione: " + Api.handleError(err));
  } finally {
    isLoading = false;
  }
}

/**
 * Imposta la data di oggi come valore predefinito per il filtro
 */
function setOggiFilterDate() {
  const today = Utils.getTodayDate();
  
  const dataInizio = document.getElementById('dataInizio');
  const dataFine = document.getElementById('dataFine');
  
  if (dataInizio) dataInizio.value = today;
  if (dataFine) dataFine.value = today;
}

/**
 * Carica l'elenco dei turni dal server
 */
async function caricaTurni() {
  // Evita caricamenti multipli
  if (isLoading) return;
  isLoading = true;
  
  try {
    // Usa l'API per ottenere i turni
    turniTotali = await Api.get("turni/list.php");
    
    popolaDipendenti(turniTotali);
    filtraTurni();
  } catch (err) {
    console.error("Errore nel caricamento turni:", err);
    Notifications.error("Errore di connessione: " + Api.handleError(err));
  } finally {
    isLoading = false;
  }
}

/**
 * Popola il menu a discesa dei dipendenti
 * @param {Array} data - Elenco dei turni
 * @param {string} filtro - Filtro di ricerca opzionale
 */
function popolaDipendenti(data, filtro = "") {
  const select = document.getElementById("dipendenteSelect");
  if (!select) return;
  
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
  const dipendenteSelect = document.getElementById("dipendenteSelect");
  const dataInizio = document.getElementById("dataInizio");
  const dataFine = document.getElementById("dataFine");
  const tbody = document.querySelector("#shifts-table tbody");
  
  if (!dipendenteSelect || !dataInizio || !dataFine || !tbody) {
    console.error("Elementi non trovati per il filtro");
    return;
  }
  
  const filtroDip = dipendenteSelect.value;
  const dataDa = dataInizio.value;
  const dataA = dataFine.value;
  
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
    const ingresso = Utils.formatDateTime(s.entry_date, s.entry_time);
    const uscita = Utils.formatDateTime(s.exit_date, s.exit_time);
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
 * Elimina un turno
 * @param {number} id - ID del turno da eliminare
 */
async function eliminaTurno(id) {
  if (!confirm("Sei sicuro di voler eliminare questo turno?")) return;

  // Evita operazioni multiple
  if (isLoading) return;
  isLoading = true;
  
  try {
    const result = await Api.get(`turni/delete.php?id=${id}`);

    if (result.success) {
      Notifications.success("Turno eliminato con successo!");
      await caricaTurni();
    } else {
      Notifications.error("Errore nell'eliminazione: " + (result.error || "Errore sconosciuto"));
    }
  } catch (err) {
    console.error("Errore di rete eliminazione:", err);
    Notifications.error("Errore di connessione: " + Api.handleError(err));
  } finally {
    isLoading = false;
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
    Notifications.warning("La data/ora di uscita deve essere successiva alla data/ora di ingresso");
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
  const modificaId = document.getElementById("modificaId");
  const modificaIngresso = document.getElementById("modificaIngresso");
  const modificaUscita = document.getElementById("modificaUscita");
  
  if (!modificaId || !modificaIngresso || !modificaUscita) {
    console.error("Elementi modale non trovati");
    return;
  }
  
  modificaId.value = id;
  modificaIngresso.value = entryDate + "T" + entryTime;
  modificaUscita.value = exitDate + "T" + exitTime;
  
  const modaleModifica = document.getElementById("modaleModifica");
  if (modaleModifica) {
    new bootstrap.Modal(modaleModifica).show();
  }
}

/**
 * Pulisce i filtri e mostra tutti i turni
 */
function pulisciFiltri() {
  const dipendenteSearch = document.getElementById("dipendenteSearch");
  const dipendenteSelect = document.getElementById("dipendenteSelect");
  const dataInizio = document.getElementById("dataInizio");
  const dataFine = document.getElementById("dataFine");
  
  if (dipendenteSearch) dipendenteSearch.value = "";
  if (dipendenteSelect) dipendenteSelect.selectedIndex = 0;
  if (dataInizio) dataInizio.value = "";
  if (dataFine) dataFine.value = "";
  
  popolaDipendenti(turniTotali);
  filtraTurni();
}

// Esporta per uso modulare
export default {
  caricaTurni,
  filtraTurni,
  apriModifica,
  eliminaTurno,
  pulisciFiltri,
  setOggiFilterDate,
  validaTurno,
  popolaDipendenti
};

// Esponi le funzioni per l'utilizzo nell'HTML
window.apriModifica = apriModifica;
window.eliminaTurno = eliminaTurno;
window.filtraTurni = filtraTurni;
window.pulisciFiltri = pulisciFiltri;
window.validaTurno = validaTurno;
window.popolaDipendenti = popolaDipendenti;
window.caricaTurni = caricaTurni;
window.setOggiFilterDate = setOggiFilterDate;