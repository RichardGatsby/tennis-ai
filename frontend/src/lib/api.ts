import axios, { AxiosInstance, AxiosResponse } from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Player,
  Tournament,
  TournamentCreateRequest,
  Registration,
  RegistrationCreateRequest,
  Match,
  MatchCreateRequest,
  MatchStatusUpdateRequest,
} from '@/types';

class APIClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearToken();
          // Redirect to login if needed
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  loadToken() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        this.token = token;
      }
    }
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/api/v1/auth/login', credentials);
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<Player> {
    const response = await this.client.post<Player>('/api/v1/auth/register', userData);
    return response.data;
  }

  // Player endpoints
  async getCurrentPlayer(): Promise<Player> {
    const response = await this.client.get<Player>('/api/v1/players/me');
    return response.data;
  }

  async updateCurrentPlayer(playerData: Partial<Player>): Promise<Player> {
    const response = await this.client.put<Player>('/api/v1/players/me', playerData);
    return response.data;
  }

  async getPlayers(skip = 0, limit = 100): Promise<Player[]> {
    const response = await this.client.get<Player[]>(`/api/v1/players/?skip=${skip}&limit=${limit}`);
    return response.data;
  }

  async getPlayer(playerId: string): Promise<Player> {
    const response = await this.client.get<Player>(`/api/v1/players/${playerId}`);
    return response.data;
  }

  // Tournament endpoints
  async getTournaments(params: {
    skip?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}): Promise<Tournament[]> {
    const { skip = 0, limit = 100, status, search } = params;
    let url = `/api/v1/tournaments/?skip=${skip}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    
    const response = await this.client.get<Tournament[]>(url);
    return response.data;
  }

  async getTournament(tournamentId: string): Promise<Tournament> {
    const response = await this.client.get<Tournament>(`/api/v1/tournaments/${tournamentId}`);
    return response.data;
  }

  async createTournament(tournamentData: TournamentCreateRequest): Promise<Tournament> {
    const response = await this.client.post<Tournament>('/api/v1/tournaments/', tournamentData);
    return response.data;
  }

  async updateTournament(tournamentId: string, tournamentData: Partial<TournamentCreateRequest>): Promise<Tournament> {
    const response = await this.client.put<Tournament>(`/api/v1/tournaments/${tournamentId}`, tournamentData);
    return response.data;
  }

  async deleteTournament(tournamentId: string): Promise<void> {
    await this.client.delete(`/api/v1/tournaments/${tournamentId}`);
  }

  async getMyTournaments(skip = 0, limit = 100): Promise<Tournament[]> {
    const response = await this.client.get<Tournament[]>(`/api/v1/tournaments/my/organized?skip=${skip}&limit=${limit}`);
    return response.data;
  }

  // Registration endpoints
  async registerForTournament(registrationData: RegistrationCreateRequest): Promise<Registration> {
    const response = await this.client.post<Registration>(
      `/api/v1/tournaments/${registrationData.tournament_id}/register`,
      registrationData
    );
    return response.data;
  }

  async getTournamentRegistrations(tournamentId: string, skip = 0, limit = 100): Promise<Registration[]> {
    const response = await this.client.get<Registration[]>(
      `/api/v1/tournaments/${tournamentId}/registrations?skip=${skip}&limit=${limit}`
    );
    return response.data;
  }

  async getMyRegistrations(skip = 0, limit = 100): Promise<Registration[]> {
    const response = await this.client.get<Registration[]>(`/api/v1/tournaments/registrations/my?skip=${skip}&limit=${limit}`);
    return response.data;
  }

  // Match endpoints
  async getMatches(params: {
    skip?: number;
    limit?: number;
    tournament_id?: string;
    player_id?: string;
    status?: string;
    round?: string;
  } = {}): Promise<Match[]> {
    const { skip = 0, limit = 100, tournament_id, player_id, status, round } = params;
    let url = `/api/v1/matches/?skip=${skip}&limit=${limit}`;
    if (tournament_id) url += `&tournament_id=${tournament_id}`;
    if (player_id) url += `&player_id=${player_id}`;
    if (status) url += `&status=${status}`;
    if (round) url += `&round=${round}`;
    
    const response = await this.client.get<Match[]>(url);
    return response.data;
  }

  async getMatch(matchId: string): Promise<Match> {
    const response = await this.client.get<Match>(`/api/v1/matches/${matchId}`);
    return response.data;
  }

  async createMatch(matchData: MatchCreateRequest): Promise<Match> {
    const response = await this.client.post<Match>('/api/v1/matches/', matchData);
    return response.data;
  }

  async updateMatch(matchId: string, matchData: Partial<MatchCreateRequest>): Promise<Match> {
    const response = await this.client.put<Match>(`/api/v1/matches/${matchId}`, matchData);
    return response.data;
  }

  async updateMatchStatus(matchId: string, statusData: MatchStatusUpdateRequest): Promise<Match> {
    const response = await this.client.post<Match>(`/api/v1/matches/${matchId}/status`, statusData);
    return response.data;
  }

  async getLiveMatches(skip = 0, limit = 100): Promise<Match[]> {
    const response = await this.client.get<Match[]>(`/api/v1/matches/live?skip=${skip}&limit=${limit}`);
    return response.data;
  }

  async getUpcomingMatches(playerId?: string, skip = 0, limit = 100): Promise<Match[]> {
    let url = `/api/v1/matches/upcoming?skip=${skip}&limit=${limit}`;
    if (playerId) url += `&player_id=${playerId}`;
    
    const response = await this.client.get<Match[]>(url);
    return response.data;
  }

  async getMyMatches(skip = 0, limit = 100): Promise<Match[]> {
    const response = await this.client.get<Match[]>(`/api/v1/matches/my?skip=${skip}&limit=${limit}`);
    return response.data;
  }

  async getTournamentMatches(tournamentId: string, skip = 0, limit = 100): Promise<Match[]> {
    const response = await this.client.get<Match[]>(`/api/v1/matches/tournaments/${tournamentId}?skip=${skip}&limit=${limit}`);
    return response.data;
  }
}

// Create singleton instance
export const apiClient = new APIClient();

// Load token on initialization
if (typeof window !== 'undefined') {
  apiClient.loadToken();
} 