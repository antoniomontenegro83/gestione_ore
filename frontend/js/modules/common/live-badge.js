// frontend/js/modules/common/live-badges.js
/**
 * live-badges.js - Sistema di badge con aggiornamento in tempo reale
 */
import { Api } from '../../main.js';

export class LiveBadges {
  constructor() {
    this.updateInterval = 30000; // 30 secondi
    this.intervalId = null;
    this.endpoints = {
      dipendenti: 'dipendenti/list.php',
      turni: 'turni/list.php',
      sedi: 'sedi/list.php',
      users: 'users/list.php'
    };
  }
  
  start() {
    this.update();
    this.intervalId = setInterval(() => this.update(), this.updateInterval);
  }
  
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  async update() {
    try {
      // Aggiorna tutti i badge con animazione
      const badges = document.querySelectorAll('.badge[data-live-update]');
      badges.forEach(badge => {
        badge.classList.add('updating');
        setTimeout(() => badge.classList.remove('updating'), 600);
      });
      
      // Identifica quali endpoint chiamare
      const endpointsNeeded = this.identifyNeededEndpoints(badges);
      
      // Carica dati necessari
      const data = await this.loadData(endpointsNeeded);
      
      // Aggiorna valori
      this.updateBadgeValues(data);
      
    } catch (error) {
      console.error('Errore aggiornamento badge:', error);
    }
  }
  
  identifyNeededEndpoints(badges) {
    const needed = new Set();
    
    badges.forEach(badge => {
      const updateType = badge.getAttribute('data-live-update');
      
      if (updateType.includes('dipendent') || updateType.includes('qualifica') || updateType.includes('sede')) {
        needed.add('dipendenti');
      }
      if (updateType.includes('turni')) {
        needed.add('turni');
      }
      if (updateType.includes('user') || updateType.includes('ruolo')) {
        needed.add('users');
      }
      if (updateType === 'sedi') {
        needed.add('sedi');
      }
    });
    
    return Array.from(needed);
  }
  
  async loadData(endpointsNeeded) {
    const data = {};
    
    const promises = endpointsNeeded.map(async endpoint => {
      const result = await Api.get(this.endpoints[endpoint]);
      data[endpoint] = result;
    });
    
    await Promise.all(promises);
    return data;
  }
  
  updateBadgeValues(data) {
    const badges = document.querySelectorAll('.badge[data-live-update]');
    
    badges.forEach(badge => {
      const updateType = badge.getAttribute('data-live-update');
      let newValue = null;
      
      // Calcola il nuovo valore in base al tipo di badge
      if (updateType === 'turni-totale' && data.turni) {
        newValue = data.turni.length;
      } else if (updateType === 'turni-oggi' && data.turni) {
        const today = new Date().toISOString().split('T')[0];
        newValue = data.turni.filter(t => t.entry_date === today).length;
      } else if (updateType === 'turni-settimana' && data.turni) {
        newValue = this.countTurniSettimana(data.turni);
      } else if (updateType === 'turni-mese' && data.turni) {
        newValue = this.countTurniMese(data.turni);
      } else if (updateType === 'turni-notturni' && data.turni) {
        newValue = data.turni.filter(t => this.isTurnoNotturno(t)).length;
      } else if (updateType === 'turni-festivi' && data.turni) {
        newValue = data.turni.filter(t => this.isTurnoFestivo(t)).length;
      } else if (updateType.startsWith('sede-') && data.dipendenti) {
        const sede = updateType.replace('sede-', '');
        newValue = data.dipendenti.filter(d => d.sede === sede).length;
      } else if (updateType.startsWith('qualifica-') && data.dipendenti) {
        const qualifica = updateType.replace('qualifica-', '');
        newValue = data.dipendenti.filter(d => d.qualifica === qualifica).length;
      } else if (updateType.startsWith('ruolo-') && data.users) {
        const ruolo = updateType.replace('ruolo-', '');
        newValue = data.users.filter(u => u.ruolo === ruolo).length;
      }
      
      // Aggiorna il valore se è cambiato
      if (newValue !== null) {
        const currentText = badge.textContent;
        const match = currentText.match(/: (\d+)/);
        
        if (match) {
          const currentValue = parseInt(match[1]);
          if (currentValue !== newValue) {
            const prefix = currentText.split(':')[0];
            this.animateValue(badge, currentValue, newValue, 500);
            
            // Aggiorna il testo mantenendo il prefisso
            setTimeout(() => {
              badge.innerHTML = `${prefix}: ${newValue}`;
            }, 500);
          }
        }
      }
    });
  }
  
  animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        current = end;
        clearInterval(timer);
      }
      
      // Aggiorna solo il numero nel badge
      const text = element.textContent;
      const prefix = text.split(':')[0];
      element.textContent = `${prefix}: ${Math.round(current)}`;
    }, 16);
  }
  
  // Metodi helper per conteggi
  countTurniSettimana(turni) {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    return turni.filter(t => {
      const turnoDate = new Date(t.entry_date);
      return turnoDate >= weekStart && turnoDate <= weekEnd;
    }).length;
  }
  
  countTurniMese(turni) {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    return turni.filter(t => {
      const turnoDate = new Date(t.entry_date);
      return turnoDate >= monthStart && turnoDate <= monthEnd;
    }).length;
  }
  
  isTurnoNotturno(turno) {
    const oraIngresso = parseInt(turno.entry_time.split(':')[0]);
    const oraUscita = parseInt(turno.exit_time.split(':')[0]);
    return oraIngresso >= 22 || oraIngresso < 6 || oraUscita >= 22 || oraUscita < 6;
  }
  
  isTurnoFestivo(turno) {
    const date = new Date(turno.entry_date);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  }
}

// Singleton instance
const liveBadges = new LiveBadges();

export default liveBadges;