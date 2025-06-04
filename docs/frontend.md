# AI Tennis Tournament - Frontend Documentation

## Overview

The AI Tennis Tournament frontend is built with Next.js 15 using the App Router, providing a modern, responsive, and intuitive interface for tournament management and participation. The design emphasizes usability, real-time updates, and mobile-first responsiveness for on-court score entry.

## UI/UX Design Principles

### Design Philosophy
- **Simplicity First**: Clean, uncluttered interface focusing on essential actions
- **Tennis-Themed**: Visual elements inspired by tennis courts, equipment, and scoring
- **Mobile-Optimized**: Primary focus on mobile devices for on-court usage
- **Accessibility**: WCAG 2.1 AA compliance for inclusive design
- **Real-time Feedback**: Immediate visual feedback for all user actions

### Color Scheme
- **Primary**: Tennis Green (#228B22) - for primary actions and headers
- **Secondary**: Clay Court Orange (#CD853F) - for secondary elements and accents
- **Accent**: Championship Gold (#FFD700) - for highlights and achievements
- **Neutral**: Cool Gray (#6B7280) - for text and subtle elements
- **Background**: Clean White (#FFFFFF) and Light Gray (#F9FAFB)
- **Error**: Tennis Ball Yellow-Red (#FF6B6B) - for warnings and errors
- **Success**: Match Point Green (#10B981) - for confirmations and success states

### Typography
- **Headings**: Inter Bold - clean, modern sans-serif
- **Body Text**: Inter Regular - excellent readability
- **Monospace**: Fira Code - for scores and technical data
- **Font Sizes**: Responsive scale from 14px to 48px

## Component Architecture

### Design System Components (`/src/components/ui/`)

#### Base Components
```typescript
// Button Component
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

// Card Component
interface CardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

// Form Components
interface InputProps {
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date';
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

// Table Component
interface TableProps {
  columns: TableColumn[];
  data: any[];
  sortable?: boolean;
  searchable?: boolean;
  pagination?: boolean;
}
```

### Layout Components (`/src/components/layout/`)

#### Header Component
```typescript
interface HeaderProps {
  user?: Player;
  showNavigation?: boolean;
  currentPath?: string;
}

// Features:
// - Responsive navigation menu
// - User profile dropdown
// - Tournament quick-access
// - Mobile hamburger menu
// - Real-time notifications badge
```

#### Sidebar Navigation
```typescript
interface SidebarProps {
  isCollapsed?: boolean;
  currentPath: string;
  userRole: 'player' | 'organizer';
}

// Navigation Items:
// - Dashboard
// - Tournaments (Browse/My Tournaments)
// - Matches (Upcoming/History)
// - Profile & Statistics
// - Create Tournament (organizers)
```

### Tournament Components (`/src/components/tournament/`)

#### Tournament Card
```typescript
interface TournamentCardProps {
  tournament: Tournament;
  registration?: Registration;
  showActions?: boolean;
  variant?: 'grid' | 'list';
}

// Features:
// - Tournament basic info display
// - Registration status indicator
// - Quick actions (register, view, manage)
// - Progress indicator for active tournaments
// - Entry fee and prize display
```

#### Tournament Form
```typescript
interface TournamentFormProps {
  initialData?: Partial<Tournament>;
  onSubmit: (data: TournamentCreateRequest) => void;
  loading?: boolean;
}

// Form Fields:
// - Basic Info (name, description, location)
// - Tournament Settings (format, participants, dates)
// - Registration Settings (deadline, approval required)
// - Advanced Options (entry fee, prizes, rules)
```

#### Bracket Visualization
```typescript
interface BracketViewProps {
  tournament: Tournament;
  matches: Match[];
  interactive?: boolean;
  highlightPlayer?: string;
}

// Features:
// - Single/Double elimination bracket display
// - Round robin standings table
// - Interactive match selection
// - Progress indicators
// - Responsive design for mobile viewing
```

#### Standings Table
```typescript
interface StandingsTableProps {
  tournament: Tournament;
  standings: TournamentStanding[];
  highlightPlayer?: string;
  showStats?: boolean;
}

// Columns:
// - Position/Rank
// - Player Name
// - Matches (W-L)
// - Sets (W-L)  
// - Games (W-L)
// - Win Percentage
// - Points/Status
```

### Match Components (`/src/components/match/`)

#### Match Card
```typescript
interface MatchCardProps {
  match: Match;
  tournament: Tournament;
  compact?: boolean;
  showActions?: boolean;
}

// Features:
// - Player names and seeds
// - Match status and timing
// - Score display (live or final)
// - Court assignment
// - Quick actions (enter score, view details)
```

#### Score Entry
```typescript
interface ScoreEntryProps {
  match: Match;
  onScoreUpdate: (score: ScoreUpdate) => void;
  realtime?: boolean;
}

// Features:
// - Tennis-style score display
// - Set-by-set score entry
// - Tiebreak handling
// - Validation for tennis rules
// - Real-time score broadcasting
// - Undo/correction capabilities
```

#### Match History
```typescript
interface MatchHistoryProps {
  playerId: string;
  tournamentId?: string;
  limit?: number;
  showPagination?: boolean;
}

// Features:
// - Chronological match list
// - Result indicators (W/L)
// - Opponent information
// - Score details
// - Tournament context
```

### Player Components (`/src/components/player/`)

#### Player Profile Card
```typescript
interface PlayerCardProps {
  player: Player;
  stats?: PlayerStats;
  compact?: boolean;
  showContact?: boolean;
}

// Features:
// - Player basic information
// - Skill level indicator
// - Win/loss record
// - Recent performance
// - Contact options (if permitted)
```

#### Player Statistics
```typescript
interface PlayerStatsProps {
  playerId: string;
  timeframe?: 'all' | 'year' | 'month';
  chartType?: 'performance' | 'progress' | 'comparison';
}

// Statistics Displayed:
// - Overall win/loss record
// - Performance by tournament format
// - Head-to-head records
// - Improvement trends
// - Achievement badges
```

## Page Architecture

### Route Structure (App Router)

```
/src/app/
├── layout.tsx                 # Root layout with providers
├── page.tsx                   # Landing page
├── globals.css               # Global styles
│
├── (auth)/                   # Auth route group
│   ├── login/
│   │   └── page.tsx         # Login form
│   ├── register/
│   │   └── page.tsx         # Registration form
│   └── layout.tsx           # Auth layout
│
├── (dashboard)/             # Main app route group
│   ├── layout.tsx           # Dashboard layout with sidebar
│   │
│   ├── tournaments/
│   │   ├── page.tsx         # Tournament listing
│   │   ├── create/
│   │   │   └── page.tsx     # Tournament creation
│   │   └── [id]/
│   │       ├── page.tsx     # Tournament details
│   │       ├── bracket/
│   │       │   └── page.tsx # Bracket view
│   │       ├── matches/
│   │       │   └── page.tsx # Match listing
│   │       ├── standings/
│   │       │   └── page.tsx # Standings table
│   │       └── manage/
│   │           └── page.tsx # Tournament management
│   │
│   ├── matches/
│   │   ├── page.tsx         # Match dashboard
│   │   └── [id]/
│   │       ├── page.tsx     # Match details
│   │       └── score/
│   │           └── page.tsx # Score entry
│   │
│   └── profile/
│       ├── page.tsx         # Player profile
│       ├── history/
│       │   └── page.tsx     # Match history
│       └── statistics/
│           └── page.tsx     # Detailed stats
│
└── api/                     # API routes (if needed)
    └── webhooks/
        └── route.ts         # Webhook handlers
```

## User Flows

### 1. Player Registration & Onboarding
```
Landing Page → Register Form → Email Verification → Profile Setup → Dashboard
```

**Registration Form Fields:**
- Email address (required)
- First & Last Name (required)
- Phone number (optional)
- Skill Level (required)
- Preferred playing hand (required)
- Date of birth (optional)

**Profile Setup:**
- Display name customization
- Profile picture upload
- Skill level verification
- Tournament preferences

### 2. Tournament Discovery & Registration
```
Dashboard → Browse Tournaments → Tournament Details → Register → Confirmation
```

**Tournament Browsing:**
- Filter by format, location, skill level
- Search by name or organizer
- Sort by date, entry fee, status
- View tournament cards with key info

**Registration Process:**
- Review tournament details and rules
- Check schedule conflicts
- Payment processing (if required)
- Registration confirmation
- Calendar integration

### 3. Tournament Creation (Organizers)
```
Dashboard → Create Tournament → Form Completion → Review → Publish → Management
```

**Creation Wizard:**
1. **Basic Information**
   - Tournament name and description
   - Format selection (Round Robin, Single/Double Elimination)
   - Date and location

2. **Participant Settings**
   - Maximum/minimum participants
   - Skill level restrictions
   - Registration deadline

3. **Advanced Options**
   - Entry fees and prizes
   - Custom rules
   - Approval requirements

4. **Review & Publish**
   - Settings confirmation
   - Visibility options
   - Launch tournament

### 4. Match Score Entry
```
Match Dashboard → Select Match → Score Entry Interface → Confirm → Publish
```

**Score Entry Interface:**
- Tennis-specific score display (games, sets)
- Point-by-point entry option
- Tiebreak handling
- Match completion workflow
- Real-time updates to spectators

### 5. Tournament Management (Organizers)
```
Tournament Dashboard → Management Panel → Actions (Start, Pause, Modify) → Monitor Progress
```

**Management Actions:**
- Review and approve registrations
- Generate brackets/schedule
- Start tournament rounds
- Handle disputes and corrections
- Monitor real-time progress
- Communicate with participants

## Responsive Design

### Breakpoint Strategy
```css
/* Mobile First Approach */
/* xs: 0-640px (default) */
/* sm: 640px-768px */
/* md: 768px-1024px */  
/* lg: 1024px-1280px */
/* xl: 1280px+ */
```

### Mobile Optimizations
- **Touch-First Interface**: Large touch targets (44px minimum)
- **Simplified Navigation**: Collapsible sidebar, tab-based navigation
- **Score Entry**: Large, finger-friendly score input buttons
- **Tournament Browsing**: Card-based layout with swipe gestures
- **Match Viewing**: Optimized bracket display with zoom/pan

### Tablet Adaptations
- **Two-Panel Layout**: Tournament list + details view
- **Enhanced Bracket View**: Better visualization of tournament progression
- **Multi-Select Actions**: Bulk operations for tournament management

### Desktop Features
- **Multi-Column Layouts**: Efficient use of screen real estate
- **Advanced Filtering**: Complex search and filter interfaces
- **Real-time Dashboard**: Multiple tournament monitoring
- **Keyboard Shortcuts**: Power user functionality

## State Management

### React Context Architecture

#### Authentication Context
```typescript
interface AuthContextType {
  user: Player | null;
  login: (email: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<Player>) => Promise<void>;
  loading: boolean;
}
```

#### Tournament Context
```typescript
interface TournamentContextType {
  activeTournaments: Tournament[];
  myTournaments: Tournament[];
  selectedTournament: Tournament | null;
  registrations: Registration[];
  refreshTournaments: () => Promise<void>;
  registerForTournament: (tournamentId: string) => Promise<void>;
}
```

#### Real-time Context
```typescript
interface RealtimeContextType {
  connections: Map<string, EventSource>;
  subscribeToMatch: (matchId: string, callback: (data: any) => void) => void;
  subscribeToTournament: (tournamentId: string, callback: (data: any) => void) => void;
  unsubscribe: (subscriptionId: string) => void;
}
```

## Real-time Features

### Server-Sent Events Implementation
```typescript
// Real-time match updates
const useMatchUpdates = (matchId: string) => {
  const [matchData, setMatchData] = useState<Match | null>(null);
  
  useEffect(() => {
    const eventSource = new EventSource(`/api/matches/${matchId}/stream`);
    
    eventSource.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setMatchData(update.match);
    };
    
    return () => eventSource.close();
  }, [matchId]);
  
  return matchData;
};

// Tournament bracket updates
const useTournamentUpdates = (tournamentId: string) => {
  const [brackets, setBrackets] = useState<Match[]>([]);
  
  useEffect(() => {
    const eventSource = new EventSource(`/api/tournaments/${tournamentId}/stream`);
    
    eventSource.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setBrackets(update.matches);
    };
    
    return () => eventSource.close();
  }, [tournamentId]);
  
  return brackets;
};
```

## Performance Optimizations

### Code Splitting Strategy
- **Route-based Splitting**: Automatic with Next.js App Router
- **Component-based Splitting**: Lazy loading for heavy components
- **Bundle Analysis**: Regular monitoring of bundle sizes

### Caching Implementation
```typescript
// SWR configuration for API caching
const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 60000, // 1 minute
  focusThrottleInterval: 5000, // 5 seconds
};

// Tournament data caching
const useTournaments = () => {
  return useSWR('/api/tournaments', fetcher, {
    ...swrConfig,
    refreshInterval: 30000, // 30 seconds for active data
  });
};

// Player statistics caching (longer cache)
const usePlayerStats = (playerId: string) => {
  return useSWR(`/api/players/${playerId}/stats`, fetcher, {
    ...swrConfig,
    refreshInterval: 300000, // 5 minutes
  });
};
```

### Image Optimization
- **Next.js Image Component**: Automatic optimization and lazy loading
- **Tournament Logos**: WebP format with fallbacks
- **Player Avatars**: Compressed thumbnails with placeholder generation

## Accessibility Features

### WCAG 2.1 Compliance
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: ARIA labels and descriptions
- **Color Contrast**: AAA compliance for text elements
- **Focus Management**: Clear focus indicators and logical tab order

### Tennis-Specific Accessibility
- **Score Announcements**: Screen reader friendly score updates
- **Match Status**: Clear status indicators for ongoing matches
- **Tournament Progress**: Accessible bracket navigation
- **Real-time Updates**: Non-intrusive update announcements

## Testing Strategy

### Component Testing
```typescript
// Example component test
describe('TournamentCard', () => {
  it('displays tournament information correctly', () => {
    const tournament = mockTournament();
    render(<TournamentCard tournament={tournament} />);
    
    expect(screen.getByText(tournament.name)).toBeInTheDocument();
    expect(screen.getByText(tournament.format)).toBeInTheDocument();
    expect(screen.getByText(tournament.location)).toBeInTheDocument();
  });
  
  it('handles registration action', async () => {
    const onRegister = jest.fn();
    const tournament = mockTournament();
    
    render(<TournamentCard tournament={tournament} onRegister={onRegister} />);
    
    await user.click(screen.getByRole('button', { name: /register/i }));
    expect(onRegister).toHaveBeenCalledWith(tournament.id);
  });
});
```

### E2E Testing with Playwright
```typescript
// Tournament creation flow test
test('organizer can create tournament', async ({ page }) => {
  await page.goto('/tournaments/create');
  
  await page.fill('[data-testid="tournament-name"]', 'Test Tournament');
  await page.selectOption('[data-testid="tournament-format"]', 'ROUND_ROBIN');
  await page.fill('[data-testid="max-participants"]', '8');
  
  await page.click('[data-testid="create-tournament-button"]');
  
  await expect(page).toHaveURL(/\/tournaments\/[a-z0-9]+/);
  await expect(page.locator('h1')).toContainText('Test Tournament');
});

// Score entry test
test('player can enter match score', async ({ page }) => {
  await page.goto('/matches/match-123/score');
  
  // Enter first set score: 6-4
  await page.click('[data-testid="player1-game-plus"]'); // 6 times
  await page.click('[data-testid="player2-game-plus"]'); // 4 times
  await page.click('[data-testid="complete-set"]');
  
  // Verify score display
  await expect(page.locator('[data-testid="set-1-score"]')).toContainText('6-4');
});
```

## Error Handling

### Error Boundary Implementation
```typescript
class TournamentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Tournament error:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong with the tournament.</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Toast Notifications
```typescript
// Success/Error notification system
const useNotifications = () => {
  const { addToast } = useContext(NotificationContext);
  
  const notifySuccess = (message: string) => {
    addToast({ type: 'success', message, duration: 3000 });
  };
  
  const notifyError = (message: string) => {
    addToast({ type: 'error', message, duration: 5000 });
  };
  
  return { notifySuccess, notifyError };
};
```

## Future Enhancements

### Progressive Web App Features
- **Offline Support**: Service worker for basic functionality
- **Push Notifications**: Match reminders and score updates
- **Home Screen Installation**: PWA manifest and install prompts

### Advanced UI Features
- **Dark Mode**: Theme switching with system preference detection
- **Internationalization**: Multi-language support for global tournaments
- **Advanced Analytics**: Player performance visualization and insights
- **Social Features**: Player messaging and tournament discussions

### Mobile App Considerations
- **React Native**: Shared component library for native mobile apps
- **Capacitor**: Hybrid app development for app store distribution
- **Native Features**: Camera for score verification, GPS for tournament check-in 