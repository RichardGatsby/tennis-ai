// Player types
export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type PreferredHand = 'RIGHT' | 'LEFT' | 'AMBIDEXTROUS';

export interface Player {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name?: string;
  phone?: string;
  date_of_birth?: string;
  skill_level: SkillLevel;
  preferred_hand: PreferredHand;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Tournament types
export type TournamentFormat = 'ROUND_ROBIN' | 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION';
export type TournamentStatus = 
  | 'DRAFT' 
  | 'REGISTRATION_OPEN' 
  | 'REGISTRATION_CLOSED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'CANCELLED';

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  format: TournamentFormat;
  max_participants: number;
  entry_fee: number;
  prize_pool: number;
  registration_deadline?: string;
  start_date?: string;
  end_date?: string;
  venue_name?: string;
  venue_address?: string;
  best_of_sets: number;
  tiebreak_games: number;
  match_duration_limit?: number;
  status: TournamentStatus;
  is_public: boolean;
  allow_registration: boolean;
  organizer_id: string;
  created_at: string;
  updated_at: string;
}

// Registration types
export type RegistrationStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'WAITLISTED' 
  | 'CANCELLED' 
  | 'REJECTED';

export interface Registration {
  id: string;
  player_id: string;
  tournament_id: string;
  status: RegistrationStatus;
  registration_date: string;
  confirmation_date?: string;
  payment_status: string;
  payment_reference?: string;
  notes?: string;
}

// Match types
export type MatchStatus = 
  | 'SCHEDULED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'FORFEIT' 
  | 'CANCELLED';

export type MatchRound = 
  | 'ROUND_ROBIN'
  | 'ROUND_32'
  | 'ROUND_16' 
  | 'QUARTER_FINAL'
  | 'SEMI_FINAL'
  | 'FINAL'
  | 'WINNERS_BRACKET'
  | 'LOSERS_BRACKET'
  | 'GRAND_FINAL';

export interface Match {
  id: string;
  tournament_id: string;
  round: MatchRound;
  match_number?: number;
  player1_id: string;
  player2_id?: string;
  status: MatchStatus;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  winner_id?: string;
  forfeit_by?: string;
  best_of_sets: number;
  court_number?: string;
  created_at: string;
  updated_at: string;
}

// API Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  display_name?: string;
  phone?: string;
  date_of_birth?: string;
  skill_level: SkillLevel;
  preferred_hand: PreferredHand;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface TournamentCreateRequest {
  name: string;
  description?: string;
  format: TournamentFormat;
  max_participants: number;
  entry_fee?: number;
  prize_pool?: number;
  registration_deadline?: string;
  start_date?: string;
  end_date?: string;
  venue_name?: string;
  venue_address?: string;
  best_of_sets?: number;
  tiebreak_games?: number;
  match_duration_limit?: number;
  is_public?: boolean;
  allow_registration?: boolean;
}

export interface RegistrationCreateRequest {
  tournament_id: string;
  notes?: string;
}

export interface MatchCreateRequest {
  tournament_id: string;
  round: MatchRound;
  match_number?: number;
  player1_id: string;
  player2_id?: string;
  scheduled_at?: string;
  best_of_sets?: number;
  court_number?: string;
}

export interface MatchStatusUpdateRequest {
  action: 'start' | 'complete' | 'forfeit';
  winner_id?: string;
  forfeit_player_id?: string;
}

// UI state types
export interface AuthState {
  user: Player | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
} 