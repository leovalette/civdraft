// User identification utilities

const ADJECTIVES = [
  "Swift",
  "Brave",
  "Clever",
  "Mighty",
  "Noble",
  "Wise",
  "Bold",
  "Silent",
  "Ancient",
  "Golden",
  "Silver",
  "Crimson",
  "Azure",
  "Emerald",
  "Mystic",
  "Thunder",
  "Storm",
  "Iron",
  "Stone",
  "Shadow",
  "Lunar",
  "Solar",
  "Cosmic",
];

const NOUNS = [
  "Warrior",
  "Leader",
  "Scout",
  "Builder",
  "Explorer",
  "Guardian",
  "Strategist",
  "Commander",
  "Diplomat",
  "Settler",
  "Conqueror",
  "Merchant",
  "Sage",
  "Knight",
  "Emperor",
  "General",
  "Admiral",
  "Champion",
  "Hero",
  "Legend",
  "Titan",
  "Phoenix",
];

/**
 * Generates a random pseudo like "Swift Warrior" or "Brave Explorer"
 */
export function generateRandomPseudo(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const number = Math.floor(Math.random() * 1000);
  return `${adjective} ${noun} ${number}`;
}

/**
 * Gets the user's pseudo from localStorage, or generates and saves a new one
 */
export function getUserPseudo(): string {
  if (typeof window === "undefined") return "";

  const stored = localStorage.getItem("userPseudo");
  if (stored) {
    return stored;
  }

  const newPseudo = generateRandomPseudo();
  localStorage.setItem("userPseudo", newPseudo);
  return newPseudo;
}

/**
 * Sets a custom pseudo for the user
 */
export function setUserPseudo(pseudo: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("userPseudo", pseudo);
}

/**
 * Gets or generates a unique user ID for this browser
 */
export function getUserId(): string {
  if (typeof window === "undefined") return "";

  const stored = localStorage.getItem("userId");
  if (stored) {
    return stored;
  }

  const newId = crypto.randomUUID();
  localStorage.setItem("userId", newId);
  return newId;
}
