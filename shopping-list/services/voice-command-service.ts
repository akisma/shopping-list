export interface VoiceCommandResponse {
  success: boolean;
  action: string;
  ttsText: string;
  sessionId: string;
  data?: Record<string, any>;
  error?: string;
}

export interface CreateSessionResponse {
  sessionId: string;
  expiresAt: string;
}

export interface VoiceSession {
  id: string;
  userId?: string;
  currentListId?: string | null;
  context: any[];
  createdAt: string;
  lastActivityAt: string;
}

export class VoiceCommandService {
  private baseUrl: string;
  private maxRetries: number = 2;
  private retryDelay: number = 1000;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async sendVoiceCommand(
    audioBlob: string,
    sessionId?: string
  ): Promise<VoiceCommandResponse> {
    const url = `${this.baseUrl}/command`;
    const body: any = { audioBlob };
    
    if (sessionId) {
      body.sessionId = sessionId;
    }

    return await this.fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }

  async createSession(userId?: string): Promise<CreateSessionResponse> {
    const url = `${this.baseUrl}/session`;
    const body: any = {};
    
    if (userId) {
      body.userId = userId;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Session creation failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getSession(sessionId: string): Promise<VoiceSession> {
    const url = `${this.baseUrl}/session/${sessionId}`;
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Get session failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async deleteSession(sessionId: string): Promise<void> {
    const url = `${this.baseUrl}/session/${sessionId}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Delete session failed: ${response.status} ${response.statusText}`);
    }
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    retryCount: number = 0
  ): Promise<any> {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`Voice command failed: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (retryCount < this.maxRetries) {
        await this.delay(this.retryDelay * (retryCount + 1));
        return this.fetchWithRetry(url, options, retryCount + 1);
      }
      
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
