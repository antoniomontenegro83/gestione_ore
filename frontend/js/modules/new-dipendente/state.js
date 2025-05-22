/**
 * modules/new-dipendente/state.js - Gestione dello stato
 */

class NewDipendenteState {
  constructor() {
    this.qualifiche = [];
    this.sedi = [];
    this.isLoading = false;
    this.lastSubmission = null;
  }

  setQualifiche(qualifiche) {
    this.qualifiche = qualifiche;
  }

  getQualifiche() {
    return this.qualifiche;
  }

  setSedi(sedi) {
    this.sedi = sedi;
  }

  getSedi() {
    return this.sedi;
  }

  setLoading(isLoading) {
    this.isLoading = isLoading;
  }

  isLoadingData() {
    return this.isLoading;
  }

  setLastSubmission(data) {
    this.lastSubmission = data;
  }

  getLastSubmission() {
    return this.lastSubmission;
  }

  clearState() {
    this.lastSubmission = null;
  }
}

// Singleton
const newDipendenteState = new NewDipendenteState();
export default newDipendenteState;