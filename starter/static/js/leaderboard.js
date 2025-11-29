/**
 * Leaderboard management module
 */

import { GAME_CONFIG, DIFFICULTY_BADGES } from "./config.js";
import { Timer } from "./timer.js";

export class Leaderboard {
  constructor() {
    this.tbody = document.getElementById("leaderboard-body");
  }

  /**
   * Save a score to the leaderboard
   * @param {string} name - Player name
   * @param {number} time - Time in milliseconds
   * @param {string} difficulty - Difficulty level
   * @param {number} hints - Number of hints used
   */
  saveScore(name, time, difficulty, hints) {
    let leaderboard = this.getLeaderboard();

    leaderboard.push({
      name,
      time,
      difficulty,
      hints,
      timestamp: Date.now(),
    });

    // Sort by time (ascending) and keep top 10
    leaderboard.sort((a, b) => a.time - b.time);
    leaderboard = leaderboard.slice(0, 10);

    localStorage.setItem(GAME_CONFIG.STORAGE_KEY, JSON.stringify(leaderboard));
    this.display();
  }

  /**
   * Get leaderboard data from localStorage
   * @returns {Array} Leaderboard entries
   */
  getLeaderboard() {
    return JSON.parse(localStorage.getItem(GAME_CONFIG.STORAGE_KEY) || "[]");
  }

  /**
   * Display the leaderboard
   */
  display() {
    const leaderboard = this.getLeaderboard();

    if (leaderboard.length === 0) {
      this.tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-muted py-4">
            <i class="bi bi-inbox fs-1 d-block mb-2"></i>
            No scores yet. Be the first!
          </td>
        </tr>
      `;
      return;
    }

    this.tbody.innerHTML = leaderboard
      .map((entry, index) => this.renderEntry(entry, index))
      .join("");
  }

  /**
   * Render a single leaderboard entry
   * @param {Object} entry - Leaderboard entry
   * @param {number} index - Entry index
   * @returns {string} HTML string
   * @private
   */
  renderEntry(entry, index) {
    const badgeClass = DIFFICULTY_BADGES[entry.difficulty.toLowerCase()] || "bg-secondary";
    const difficultyLabel = entry.difficulty.charAt(0).toUpperCase() + entry.difficulty.slice(1);

    return `
      <tr>
        <td class="text-center fw-bold">${index + 1}</td>
        <td class="fw-semibold">${this.escapeHtml(entry.name)}</td>
        <td><span class="badge bg-primary">${Timer.formatTime(entry.time)}</span></td>
        <td><span class="badge ${badgeClass}">${difficultyLabel}</span></td>
        <td class="text-center">${entry.hints}</td>
      </tr>
    `;
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   * @private
   */
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}
