// frontend/js/modules/privilegi/state.js
/**
 * state.js - Gestione dello stato dell'applicazione privilegi/utenti
 */

class PrivilegiState {
  constructor() {
    this.allUsers = [];
    this.isLoading = false;
    this.userIdDaEliminare = null;
    this.currentFilter = '';
    this.editingUserId = null;
  }

  setUsers(users) {
    this.allUsers = users;
  }

  getUsers() {
    return this.allUsers;
  }

  setLoading(isLoading) {
    this.isLoading = isLoading;
  }

  isLoadingData() {
    return this.isLoading;
  }

  setUserToDelete(id) {
    this.userIdDaEliminare = id;
  }

  getUserToDelete() {
    return this.userIdDaEliminare;
  }

  clearUserToDelete() {
    this.userIdDaEliminare = null;
  }

  setEditingUser(id) {
    this.editingUserId = id;
  }

  getEditingUser() {
    return this.editingUserId;
  }

  clearEditingUser() {
    this.editingUserId = null;
  }

  setCurrentFilter(filter) {
    this.currentFilter = filter;
  }

  getCurrentFilter() {
    return this.currentFilter;
  }

  findUserById(id) {
    return this.allUsers.find(user => user.id === id);
  }

  findUserByUsername(username) {
    return this.allUsers.find(user => 
      user.username.toLowerCase() === username.toLowerCase()
    );
  }

  addUser(newUser) {
    this.allUsers.push(newUser);
    // Riordina per username
    this.allUsers.sort((a, b) => a.username.localeCompare(b.username));
  }

  updateUser(updatedUser) {
    const index = this.allUsers.findIndex(user => user.id === updatedUser.id);
    if (index !== -1) {
      this.allUsers[index] = { ...this.allUsers[index], ...updatedUser };
      // Riordina per username
      this.allUsers.sort((a, b) => a.username.localeCompare(b.username));
    }
  }

  removeUser(id) {
    this.allUsers = this.allUsers.filter(user => user.id !== id);
  }

  getFilteredUsers(filter = '') {
    if (!filter) return this.allUsers;
    
    const lowerFilter = filter.toLowerCase();
    return this.allUsers.filter(user => 
      user.username.toLowerCase().includes(lowerFilter) ||
      user.ruolo.toLowerCase().includes(lowerFilter)
    );
  }

  canDeleteUser(userId) {
    const user = this.findUserById(userId);
    if (!user) return false;
    
    // Non permettere l'eliminazione dell'ultimo superadmin
    if (user.ruolo === ROLES.SUPERADMIN) {
      const superadminCount = this.allUsers.filter(u => u.ruolo === ROLES.SUPERADMIN).length;
      return superadminCount > 1;
    }
    
    return true;
  }
}

// Singleton pattern
const privilegiState = new PrivilegiState();

export default privilegiState;