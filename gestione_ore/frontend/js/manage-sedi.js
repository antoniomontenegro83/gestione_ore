/**
 * Script per la gestione delle sedi
 */
import { Auth, Api, Notifications } from './main.js';
import AuthCommon from './auth-common.js';

// Variabile per tracciare lo stato di caricamento
let isLoading = false;

// Inizializzazione all'avvio
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM caricato, avvio gestione sedi...");
  
  // Inizializzazione e caricamento dati
  caricaSedi();
  
  // Setup event listener per il form
  setupEventListeners();
});

/**
 * Configura gli event listener
 */
function setupEventListeners() {
  console.log("Configurazione event listeners...");
  
  // Gestione del form per l'aggiunta di una nuova sede
  const form = document.getElementById("add-sede-form");
  if (form) {
    form.addEventListener("submit", handleAddSede);
  }
}

/**
 * Gestisce l'invio del form per aggiungere una sede
 * @param {Event} e - Evento submit
 */
async function handleAddSede(e) {
  e.preventDefault();
  
  // Evita invii multipli
  if (isLoading) return;
  isLoading = true;
  
  try {
    console.log("Invio form nuova sede...");
    
    // Ottieni il nome della sede dal form
    const nome = document.getElementById("sede-nome").value.trim();
    if (!nome) {
      Notifications.warning("Il nome della sede è obbligatorio");
      return;
    }
    
    // Usa l'API per inviare i dati
    const result = await Api.post("sedi/add.php", { nome });
    
    if (result.success) {
      Notifications.success("Sede aggiunta con successo!");
      // Resetta il campo di input
      document.getElementById("sede-nome").value = '';
      
      // Ricarica l'elenco delle sedi
      caricaSedi();
    } else {
      Notifications.error("Errore nell'aggiunta: " + (result.error || "Errore sconosciuto"));
    }
  } catch (error) {
    console.error("Errore durante l'aggiunta:", error);
    Notifications.error("Errore durante l'aggiunta: " + Api.handleError(error));
  } finally {
    isLoading = false;
  }
}

/**
 * Carica l'elenco delle sedi dal server
 */
async function caricaSedi() {
  if (isLoading) return;
  isLoading = true;
  
  try {
    console.log("Caricamento sedi in corso...");
    
    // Usa l'API per ottenere i dati
    const sedi = await Api.get("sedi/list.php");
    console.log("Sedi ottenute:", sedi.length);
    
    // Aggiorna la lista nell'interfaccia
    const lista = document.getElementById("sedi-list");
    if (!lista) {
      console.error("Elemento lista sedi non trovato!");
      return;
    }
    
    lista.innerHTML = '';
    
    if (sedi.length === 0) {
      const emptyMessage = document.createElement("li");
      emptyMessage.className = "list-group-item text-center text-muted";
      emptyMessage.textContent = "Nessuna sede presente";
      lista.appendChild(emptyMessage);
      return;
    }
    
    sedi.forEach(s => {
      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-center";
      li.textContent = s.nome || '';
      
      const btn = document.createElement("button");
      btn.className = "btn btn-sm btn-danger";
      btn.textContent = "Elimina";
      btn.onclick = () => eliminaSede(s.id);
      
      li.appendChild(btn);
      lista.appendChild(li);
    });
    
    console.log("Sedi caricate con successo");
  } catch (error) {
    console.error("Errore nel caricamento delle sedi:", error);
    Notifications.error("Errore nel caricamento delle sedi: " + Api.handleError(error));
  } finally {
    isLoading = false;
  }
}

/**
 * Elimina una sede dal database
 * @param {number} id - ID della sede da eliminare
 */
async function eliminaSede(id) {
  // Chiedi conferma prima di eliminare
  if (!confirm("Sei sicuro di voler eliminare questa sede?")) return;
  
  if (isLoading) return;
  isLoading = true;
  
  try {
    console.log("Eliminazione sede ID:", id);
    
    // Usa l'API per inviare i dati
    const result = await Api.post("sedi/delete.php", { id });
    
    if (result.success) {
      Notifications.success("Sede eliminata con successo!");
      // Ricarica l'elenco delle sedi
      caricaSedi();
    } else {
      Notifications.error("Errore nell'eliminazione: " + (result.error || "Errore sconosciuto"));
    }
  } catch (error) {
    console.error("Errore durante l'eliminazione:", error);
    Notifications.error("Errore durante l'eliminazione: " + Api.handleError(error));
  } finally {
    isLoading = false;
  }
}

// Esponi le funzioni per l'utilizzo in HTML
window.eliminaSede = eliminaSede;
window.caricaSedi = caricaSedi;
window.handleAddSede = handleAddSede;

// Esporta per uso modulare
export default {
  caricaSedi,
  eliminaSede,
  handleAddSede
};