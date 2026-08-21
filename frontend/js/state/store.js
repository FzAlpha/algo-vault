// Reactive State Store & Pub-Sub Event Bus

class Store {
  constructor() {
    this.state = {
      currentScreen: 'dashboard',
      user: null,
      stats: null,
      problems: [],
      selectedProblem: null,
      settings: null,
      aiInsights: null,
      filters: {
        search: '',
        difficulty: 'All',
        language: 'All',
        sort: 'Newest'
      }
    };
    this.listeners = new Map();
  }

  getState() {
    return this.state;
  }

  setState(partialState) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...partialState };
    
    // Notify listeners for modified keys
    Object.keys(partialState).forEach(key => {
      if (this.listeners.has(key)) {
        this.listeners.get(key).forEach(cb => cb(this.state[key], prevState[key]));
      }
    });

    if (this.listeners.has('*')) {
      this.listeners.get('*').forEach(cb => cb(this.state, prevState));
    }
  }

  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(key).delete(callback);
    };
  }

  setScreen(screenName) {
    this.setState({ currentScreen: screenName });
  }
}

export const store = new Store();
