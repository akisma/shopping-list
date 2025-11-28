/**
 * Wake Word Service (TDD - GREEN Phase)
 * Service for detecting "Hey Shoppy" wake word to start voice command listening
 */

export type WakeWordStatus = 'idle' | 'listening' | 'detected';

export interface WakeWordServiceOptions {
  onWakeWordDetected: (remainingTranscript: string) => void;
  onStatusChange: (status: WakeWordStatus) => void;
}

export class WakeWordService {
  private static readonly WAKE_PHRASE = 'hey shoppy';
  
  private status: WakeWordStatus = 'idle';
  private enabled: boolean = true;
  private readonly onWakeWordDetected: (remainingTranscript: string) => void;
  private readonly onStatusChange: (status: WakeWordStatus) => void;

  constructor(options: WakeWordServiceOptions) {
    this.onWakeWordDetected = options.onWakeWordDetected;
    this.onStatusChange = options.onStatusChange;
  }

  /**
   * Get the current wake phrase
   */
  getWakePhrase(): string {
    return WakeWordService.WAKE_PHRASE;
  }

  /**
   * Get the current status of the wake word service
   */
  getStatus(): WakeWordStatus {
    return this.status;
  }

  /**
   * Check if the service is currently listening
   */
  isListening(): boolean {
    return this.status === 'listening';
  }

  /**
   * Check if the service is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Enable or disable the wake word service
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Start listening for the wake word
   */
  start(): void {
    if (!this.enabled) {
      return;
    }
    this.setStatus('listening');
  }

  /**
   * Stop listening for the wake word
   */
  stop(): void {
    this.setStatus('idle');
  }

  /**
   * Process a transcript to check for the wake word
   * @param transcript The transcript to check
   * @returns true if the wake word was detected
   */
  processTranscript(transcript: string): boolean {
    if (!this.enabled || this.status !== 'listening') {
      return false;
    }

    const normalizedTranscript = transcript.toLowerCase().trim();
    
    if (!normalizedTranscript) {
      return false;
    }

    // Check if transcript starts with or equals the wake phrase
    if (normalizedTranscript.startsWith(WakeWordService.WAKE_PHRASE)) {
      const remainingTranscript = normalizedTranscript
        .slice(WakeWordService.WAKE_PHRASE.length)
        .trim();

      this.setStatus('detected');
      
      try {
        this.onWakeWordDetected(remainingTranscript);
      } catch {
        // Gracefully handle callback errors
      }
      
      return true;
    }

    return false;
  }

  /**
   * Reset the service to listening status after wake word was detected
   */
  resetAfterDetection(): void {
    if (this.status === 'detected') {
      this.setStatus('listening');
    }
  }

  /**
   * Set the status and notify listeners
   */
  private setStatus(newStatus: WakeWordStatus): void {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.onStatusChange(newStatus);
    }
  }
}
