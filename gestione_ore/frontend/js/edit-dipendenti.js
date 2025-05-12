/**
 * Script per la gestione avanzata dei dipendenti
 */
import { Api, Auth, Notifications, Utils } from './main.js';
import AuthCommon from './auth-common.js';

// Variabili globali
let allEmployees = [];
let qualifiche = [];
let sedi = [];

// Variabile per tracciare lo stato di caricamento
let isLoading = false;

// Funzione principale all'avvio
document.addEventListener('DOMContentLoaded', async () => {
  console.log("DOM caricato per edit-dipendenti");
  
  try {
    // Carica i dati iniziali
    await Promise.all([loadQualifiche(), loadSedi()]);
    await loadEmployees();
    
    // Imposta il listener per la ricerca
    document.getElementById('employee-search').addEventListener('input', e => {
      renderTable(e.target.value);
    });
  } catch (error) {
    console.error("Errore nell'inizializzazione di edit-dipendenti:", error);
  }
});

/**
 * Mostra un alert con messaggi di notifica
 * @param {string} message - Messaggio da visualizzare
 * @param {string} type - Tipo di alert (success, danger, warning, info)
 */
function showAlert(message, type) {
  Notifications.show(message, type);
}

/**
 * Carica le qualifiche dal server
 */
async function loadQualifiche() {
  try {
    console.log("Caricamento qualifiche...");
    qualifiche = await Api.get("qualifiche/list.php");
    console.log("Qualifiche caricate:", qualifiche.length);
  } catch (error) {
    console.error("Errore nel caricamento delle qualifiche:", error);
    // Non bloccare l'applicazione se le qualifiche non sono disponibili
  }
}

/**
 * Carica le sedi dal server
 */
async function loadSedi() {
  try {
    console.log("Caricamento sedi...");
    sedi = await Api.get("sedi/list.php");
    console.log("Sedi caricate:", sedi.length);
  } catch (error) {
    console.error("Errore nel caricamento delle sedi:", error);
    // Non bloccare l'applicazione se le sedi non sono disponibili
  }
}

/**
 * Carica i dipendenti dal server
 */
async function loadEmployees() {
  // Evita caricamenti multipli
  if (isLoading) return;
  isLoading = true;
  
  try {
    console.log("Caricamento dipendenti...");
    allEmployees = await Api.get("dipendenti/list.php");
    console.log("Dipendenti caricati:", allEmployees.length);
    renderTable('');
  } catch (error) {
    console.error("Errore nel caricamento dei dipendenti:", error);
    showAlert("Errore nel caricamento dei dipendenti: " + Api.handleError(error), "danger");
  } finally {
    isLoading = false;
  }
}

/**
 * Crea opzioni per select in base agli elementi forniti
 * @param {Array} items - Array di elementi per le opzioni
 * @param {string} currentValue - Valore corrente da selezionare
 * @returns {string} HTML delle opzioni
 */
function createSelectOptions(items, currentValue) {
  let options = '';
  
  items.forEach(item => {
    const value = item.nome || item.qualifica || item.sede || item;
    const selected = value === currentValue ? 'selected' : '';
    options += `<option value="${value}" ${selected}>${value}</option>`;
  });
  
  return options;
}

/**
 * Renderizza la tabella dei dipendenti in base al filtro
 * @param {string} filter - Testo di filtro
 */
function renderTable(filter) {
  const tbody = document.getElementById('employee-table');
  tbody.innerHTML = '';
  const lowerFilter = filter.toLowerCase();
  
  allEmployees.forEach(emp => {
    const rowStr = `${emp.nome || ''} ${emp.cognome || ''} ${emp.qualifica || ''} ${emp.sede || ''}`.toLowerCase();
    if (rowStr.includes(lowerFilter)) {
      const row = document.createElement('tr');
      
      // Creiamo select per qualifiche e sedi se esistono
      let qualificaField, sedeField;
      
      if (qualifiche.length > 0) {
        qualificaField = `
          <select class="form-select" data-id="${emp.id}" data-field="qualifica">
            ${createSelectOptions(qualifiche, emp.qualifica)}
          </select>`;
      } else {
        qualificaField = `<input class="form-control" value="${emp.qualifica || ''}" data-id="${emp.id}" data-field="qualifica">`;
      }
      
      if (sedi.length > 0) {
        sedeField = `
          <select class="form-select" data-id="${emp.id}" data-field="sede">
            ${createSelectOptions(sedi, emp.sede)}
          </select>`;
      } else {
        sedeField = `<input class="form-control" value="${emp.sede || ''}" data-id="${emp.id}" data-field="sede">`;
      }
      
      row.innerHTML = `
        <td>${emp.id}</td>
        <td><input class="form-control" value="${emp.cognome || ''}" data-id="${emp.id}" data-field="cognome"></td>
        <td><input class="form-control" value="${emp.nome || ''}" data-id="${emp.id}" data-field="nome"></td>
        <td>${qualificaField}</td>
        <td>${sedeField}</td>
        <td class="text-center"><button class="btn btn-sm btn-primary" onclick="salva(${emp.id})">Salva</button></td>
        <td class="text-center"><button class="btn btn-sm btn-danger" onclick="elimina(${emp.id})">Elimina</button></td>
      `;
      tbody.appendChild(row);
    }
  });
}

/**
 * Salva le modifiche a un dipendente
 * @param {number} id - ID del dipendente
 */
async function salva(id) {
  const fields = ['cognome', 'nome', 'qualifica', 'sede'];
  const payload = { id };
  
  fields.forEach(f => {
    const element = document.querySelector(`[data-id='${id}'][data-field='${f}']`);
    payload[f] = element.value;
  });

  try {
    console.log("Salvataggio dipendente ID:", id);
    const result = await Api.post("dipendenti/update-full.php", payload);
    
    if (result.success) {
      Notifications.success("Dipendente aggiornato con successo!");
      // Aggiorna l'elenco dei dipendenti
      await loadEmployees();
    } else {
      Notifications.error("Errore nell'aggiornamento: " + (result.error || "Errore sconosciuto"));
    }
  } catch (error) {
    Notifications.error("Errore di connessione: " + Api.handleError(error));
  }
}

/**
 * Elimina un dipendente
 * @param {number} id - ID del dipendente
 */
async function elimina(id) {
  if (!confirm("Sei sicuro di voler eliminare questo dipendente?")) return;

  try {
    console.log("Eliminazione dipendente ID:", id);
    const result = await Api.post("dipendenti/delete.php", { id });
    
    if (result.success) {
      Notifications.success("Dipendente eliminato con successo!");
      await loadEmployees();
    } else {
      Notifications.error("Errore nell'eliminazione: " + (result.error || "Errore sconosciuto"));
    }
  } catch (error) {
    Notifications.error("Errore di connessione: " + Api.handleError(error));
  }
}

// Esportazione per riferimento
export default {
  loadQualifiche,
  loadSedi,
  loadEmployees,
  createSelectOptions,
  renderTable,
  salva,
  elimina
};

// Esposizione globale per compatibilità con onclick nell'HTML
window.salva = salva;
window.elimina = elimina;
window.showAlert = showAlert;
window.loadQualifiche = loadQualifiche;
window.loadSedi = loadSedi;
window.loadEmployees = loadEmployees;
window.createSelectOptions = createSelectOptions;
window.renderTable = renderTable;