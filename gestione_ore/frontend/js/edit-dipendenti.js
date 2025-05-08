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

let allEmployees = [];
let qualifiche = [];
let sedi = [];

async function loadQualifiche() {
  try {
    const res = await fetch('../backend_gestione_ore/qualifiche/list.php');
    if (!res.ok) {
      throw new Error(`Errore HTTP: ${res.status}`);
    }
    qualifiche = await res.json();
  } catch (error) {
    console.error("Errore nel caricamento delle qualifiche:", error);
    // Non bloccare l'applicazione se le qualifiche non sono disponibili
  }
}

async function loadSedi() {
  try {
    const res = await fetch('../backend_gestione_ore/sedi/list.php');
    if (!res.ok) {
      throw new Error(`Errore HTTP: ${res.status}`);
    }
    sedi = await res.json();
  } catch (error) {
    console.error("Errore nel caricamento delle sedi:", error);
    // Non bloccare l'applicazione se le sedi non sono disponibili
  }
}

async function loadEmployees() {
  try {
    // Modifica: Cambiato percorso da employees a dipendenti
    const res = await fetch('../backend_gestione_ore/dipendenti/list.php');
    if (!res.ok) {
      throw new Error(`Errore HTTP: ${res.status}`);
    }
    
    // Per debug, leggiamo prima come testo
    const responseText = await res.text();
    try {
      allEmployees = JSON.parse(responseText);
      renderTable('');
    } catch (jsonError) {
      console.error("Errore nel parsing JSON:", jsonError);
      console.error("Risposta server:", responseText);
      throw new Error(`Errore nel parsing JSON: ${jsonError.message}`);
    }
  } catch (error) {
    console.error("Errore nel caricamento dei dipendenti:", error);
    showAlert("Errore nel caricamento dei dipendenti: " + error.message, "danger");
  }
}

function createSelectOptions(items, currentValue) {
  let options = '';
  
  items.forEach(item => {
    const value = item.nome || item.qualifica || item.sede || item;
    const selected = value === currentValue ? 'selected' : '';
    options += `<option value="${value}" ${selected}>${value}</option>`;
  });
  
  return options;
}

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

async function salva(id) {
  const fields = ['cognome', 'nome', 'qualifica', 'sede'];
  const payload = { id };
  
  fields.forEach(f => {
    const element = document.querySelector(`[data-id='${id}'][data-field='${f}']`);
    payload[f] = element.value;
  });

  try {
    // Modifica: Cambiato percorso da employees a dipendenti
    const res = await fetch('../backend_gestione_ore/dipendenti/update-full.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      throw new Error(`Errore HTTP: ${res.status}`);
    }
    
    const result = await res.json();
    
    if (result.success) {
      showAlert("Dipendente aggiornato con successo!", "success");
      // Aggiorna l'elenco dei dipendenti
      loadEmployees();
    } else {
      showAlert("Errore nell'aggiornamento: " + (result.error || "Errore sconosciuto"), "danger");
    }
  } catch (error) {
    showAlert("Errore di connessione: " + error.message, "danger");
  }
}

async function elimina(id) {
  if (!confirm("Sei sicuro di voler eliminare questo dipendente?")) return;

  try {
    // Modifica: Cambiato percorso da employees a dipendenti
    const res = await fetch('../backend_gestione_ore/dipendenti/delete.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    
    if (!res.ok) {
      throw new Error(`Errore HTTP: ${res.status}`);
    }
    
    const result = await res.json();
    
    if (result.success) {
      showAlert("Dipendente eliminato con successo!", "success");
      loadEmployees();
    } else {
      showAlert("Errore nell'eliminazione: " + (result.error || "Errore sconosciuto"), "danger");
    }
  } catch (error) {
    showAlert("Errore di connessione: " + error.message, "danger");
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([loadQualifiche(), loadSedi()]);
  await loadEmployees();
  
  document.getElementById('employee-search').addEventListener('input', e => {
    renderTable(e.target.value);
  });
});

// Esporta le funzioni per l'utilizzo in HTML
window.salva = salva;
window.elimina = elimina;