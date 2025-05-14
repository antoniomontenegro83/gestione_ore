/**
 * Script per la gestione dei dipendenti
 */
import { Api, Notifications } from './main.js';
import AuthCommon from './auth-common.js';

// Variabile per tracciare lo stato di caricamento
let isLoading = false;

// Esegui caricamento all'avvio
document.addEventListener('DOMContentLoaded', async () => {
  console.log("DOM caricato, avvio caricamento dipendenti...");
  await caricaDipendenti();
});

/**
 * Carica i dati dei dipendenti dal server
 */
async function caricaDipendenti() {
  // Evita caricamenti multipli
  if (isLoading) return;
  isLoading = true;
  
  try {
    console.log("Caricamento dipendenti in corso...");
    
    // Ottieni i dati tramite l'API
    const data = await Api.get("dipendenti/list.php");
    console.log("Dipendenti ottenuti:", data.length);
    
    const tbody = document.getElementById('employee-table');
    if (!tbody) {
      console.error("Elemento tbody non trovato!");
      return;
    }
    
    // Svuota la tabella prima di aggiungervi dati
    tbody.innerHTML = '';

    // Aggiunge ogni dipendente alla tabella
    data.forEach(emp => {
      const row = document.createElement('tr');
      // Usati i controlli null/undefined per evitare "undefined" nel campo
      row.innerHTML = `
        <td>${emp.id}</td>
        <td>${emp.cognome || ''}</td>
        <td>${emp.nome || ''}</td>
        <td><input type="text" value="${emp.qualifica || ''}" data-id="${emp.id}" class="form-control qualifica"></td>
        <td><input type="text" value="${emp.sede || ''}" data-id="${emp.id}" class="form-control sede"></td>
        <td><button class="btn btn-sm btn-primary" onclick="salva(${emp.id})">Salva</button></td>
      `;
      tbody.appendChild(row);
    });
    
    console.log("Dipendenti caricati con successo");
  } catch (error) {
    console.error("Errore nel caricamento dei dipendenti:", error);
    Notifications.error("Errore nel caricamento dei dipendenti: " + Api.handleError(error));
  } finally {
    isLoading = false;
  }
}

/**
 * Salva le modifiche a un dipendente
 * @param {number} id - ID del dipendente
 */
async function salva(id) {
  try {
    const qualifica = document.querySelector(`.qualifica[data-id='${id}']`).value;
    const sede = document.querySelector(`.sede[data-id='${id}']`).value;

    console.log("Salvataggio modifiche al dipendente ID:", id);
    
    // Usa l'API per inviare i dati
    const result = await Api.post("dipendenti/update.php", { id, qualifica, sede });
    
    if (result.success) {
      Notifications.success("Aggiornamento completato con successo!");
    } else {
      Notifications.error("Errore durante l'aggiornamento: " + (result.error || "Errore sconosciuto"));
    }
  } catch (error) {
    console.error("Errore durante il salvataggio:", error);
    Notifications.error("Errore durante il salvataggio: " + Api.handleError(error));
  }
}

// Esponi le funzioni per l'utilizzo nell'HTML
window.caricaDipendenti = caricaDipendenti;
window.salva = salva;

// Esporta per uso modulare
export default {
  caricaDipendenti,
  salva
};