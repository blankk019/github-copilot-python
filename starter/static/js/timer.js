/**
 * Timer management module
 */

export class Timer {
  constructor() {
    this.interval = null;
    this.startTime = null;
    this.elapsedTime = 0;
    this.display = document.getElementById("timer");
  }

  /**
   * Start the timer
   */
  start() {
    if (this.interval) return;

    this.startTime = Date.now() - this.elapsedTime;
    this.interval = setInterval(() => this.update(), 1000);
  }

  /**
   * Stop the timer
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  /**
   * Reset the timer
   */
  reset() {
    this.stop();
    this.elapsedTime = 0;
    this.updateDisplay(0);
  }

  /**
   * Update the timer
   * @private
   */
  update() {
    this.elapsedTime = Date.now() - this.startTime;
    this.updateDisplay(this.elapsedTime);
  }

  /**
   * Update the timer display
   * @param {number} time - Time in milliseconds
   * @private
   */
  updateDisplay(time) {
    const seconds = Math.floor(time / 1000);
    const minutes = Math.floor(seconds / 60);
    const displaySeconds = seconds % 60;

    this.display.textContent = `${String(minutes).padStart(2, "0")}:${String(
      displaySeconds
    ).padStart(2, "0")}`;
  }

  /**
   * Get formatted time string
   * @param {number} time - Time in milliseconds
   * @returns {string} Formatted time string
   */
  static formatTime(time) {
    const seconds = Math.floor(time / 1000);
    const minutes = Math.floor(seconds / 60);
    const displaySeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(displaySeconds).padStart(2, "0")}`;
  }

  /**
   * Get current elapsed time
   * @returns {number} Elapsed time in milliseconds
   */
  getElapsedTime() {
    return this.elapsedTime;
  }
}
