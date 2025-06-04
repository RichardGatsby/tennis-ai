"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  Trophy,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  UserPlus,
  UserCheck,
  Settings,
  Play,
  Award,
} from "lucide-react";
import type { Tournament, Registration, Match, Player } from "@/types";

interface TournamentDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function TournamentDetailsPage({
  params,
}: TournamentDetailsPageProps) {
  const { user } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [userRegistration, setUserRegistration] = useState<Registration | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tournamentId, setTournamentId] = useState<string>("");

  useEffect(() => {
    const init = async () => {
      const resolvedParams = await params;
      setTournamentId(resolvedParams.id);
    };
    init();
  }, [params]);

  useEffect(() => {
    if (!tournamentId) return;

    const loadTournamentData = async () => {
      try {
        const [tournamentData, registrationsData, matchesData] =
          await Promise.all([
            apiClient.getTournament(tournamentId),
            apiClient.getTournamentRegistrations(tournamentId).catch(() => []),
            apiClient.getTournamentMatches(tournamentId).catch(() => []),
          ]);

        setTournament(tournamentData);
        setRegistrations(registrationsData);
        setMatches(matchesData);

        // Check if current user is registered
        const userReg = registrationsData.find(
          (reg) => reg.player_id === user?.id
        );
        setUserRegistration(userReg || null);
      } catch (error: any) {
        setError(error.response?.data?.detail || "Failed to load tournament");
      } finally {
        setLoading(false);
      }
    };

    loadTournamentData();
  }, [tournamentId, user?.id]);

  const handleRegistration = async () => {
    if (!tournament || !user) return;

    setRegistering(true);
    setError(null);

    try {
      const registration = await apiClient.registerForTournament({
        tournament_id: tournament.id,
      });

      setUserRegistration(registration);
      setRegistrations((prev) => [...prev, registration]);
    } catch (error: any) {
      setError(
        error.response?.data?.detail || "Failed to register for tournament"
      );
    } finally {
      setRegistering(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      REGISTRATION_OPEN: "bg-green-100 text-green-800",
      REGISTRATION_CLOSED: "bg-yellow-100 text-yellow-800",
      IN_PROGRESS: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-gray-100 text-gray-800",
      CANCELLED: "bg-red-100 text-red-800",
      DRAFT: "bg-purple-100 text-purple-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          statusClasses[status as keyof typeof statusClasses] ||
          "bg-gray-100 text-gray-800"
        }`}
      >
        {status.replace("_", " ")}
      </span>
    );
  };

  const canRegister =
    tournament &&
    tournament.allow_registration &&
    tournament.status === "REGISTRATION_OPEN" &&
    !userRegistration &&
    user?.id !== tournament.organizer_id &&
    registrations.length < tournament.max_participants;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-tennis-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="space-y-6">
        <Link href="/tournaments">
          <Button variant="ghost" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tournaments
          </Button>
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <p className="text-red-600">{error || "Tournament not found"}</p>
        </div>
      </div>
    );
  }

  const isOrganizer = user?.id === tournament.organizer_id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/tournaments">
            <Button variant="ghost" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tournaments
            </Button>
          </Link>
        </div>
        {isOrganizer && (
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Manage Tournament
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Tournament Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <Trophy className="h-8 w-8 text-tennis-green" />
              <h1 className="text-3xl font-bold text-tennis-green">
                {tournament.name}
              </h1>
              {getStatusBadge(tournament.status)}
            </div>
            {tournament.description && (
              <p className="text-gray-600 mt-2">{tournament.description}</p>
            )}
          </div>

          <div className="mt-4 lg:mt-0 lg:ml-6">
            {canRegister && (
              <Button
                onClick={handleRegistration}
                loading={registering}
                disabled={registering}
                className="flex items-center"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Register for Tournament
              </Button>
            )}
            {userRegistration && (
              <div className="flex items-center space-x-2 text-green-600">
                <UserCheck className="h-5 w-5" />
                <span className="font-medium">Registered</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tournament Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tournament Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-tennis-green mb-4">
              Tournament Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Trophy className="h-5 w-5 text-tennis-green" />
                <div>
                  <p className="text-sm text-gray-600">Format</p>
                  <p className="font-medium">
                    {tournament.format.replace("_", " ")}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-tennis-green" />
                <div>
                  <p className="text-sm text-gray-600">Participants</p>
                  <p className="font-medium">
                    {registrations.length} / {tournament.max_participants}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <DollarSign className="h-5 w-5 text-tennis-green" />
                <div>
                  <p className="text-sm text-gray-600">Entry Fee</p>
                  <p className="font-medium">
                    {tournament.entry_fee > 0
                      ? `$${tournament.entry_fee}`
                      : "Free"}
                  </p>
                </div>
              </div>

              {tournament.prize_pool > 0 && (
                <div className="flex items-center space-x-3">
                  <Award className="h-5 w-5 text-tennis-green" />
                  <div>
                    <p className="text-sm text-gray-600">Prize Pool</p>
                    <p className="font-medium">${tournament.prize_pool}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Play className="h-5 w-5 text-tennis-green" />
                <div>
                  <p className="text-sm text-gray-600">Match Format</p>
                  <p className="font-medium">
                    Best of {tournament.best_of_sets} sets
                  </p>
                </div>
              </div>

              {tournament.match_duration_limit && (
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-tennis-green" />
                  <div>
                    <p className="text-sm text-gray-600">Time Limit</p>
                    <p className="font-medium">
                      {tournament.match_duration_limit} minutes
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Schedule & Venue */}
          {(tournament.start_date || tournament.venue_name) && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-tennis-green mb-4">
                Schedule & Venue
              </h2>
              <div className="space-y-4">
                {tournament.registration_deadline && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-tennis-green" />
                    <div>
                      <p className="text-sm text-gray-600">
                        Registration Deadline
                      </p>
                      <p className="font-medium">
                        {new Date(
                          tournament.registration_deadline
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {tournament.start_date && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-tennis-green" />
                    <div>
                      <p className="text-sm text-gray-600">Tournament Start</p>
                      <p className="font-medium">
                        {new Date(tournament.start_date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {tournament.end_date && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-tennis-green" />
                    <div>
                      <p className="text-sm text-gray-600">Tournament End</p>
                      <p className="font-medium">
                        {new Date(tournament.end_date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {tournament.venue_name && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-tennis-green mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Venue</p>
                      <p className="font-medium">{tournament.venue_name}</p>
                      {tournament.venue_address && (
                        <p className="text-sm text-gray-500">
                          {tournament.venue_address}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Matches */}
          {matches.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-tennis-green mb-4">
                Tournament Matches
              </h2>
              <div className="space-y-3">
                {matches.slice(0, 10).map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {match.round.replace("_", " ")}
                      </p>
                      <p className="text-sm text-gray-600">
                        {match.scheduled_at
                          ? new Date(match.scheduled_at).toLocaleString()
                          : "TBD"}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        match.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : match.status === "IN_PROGRESS"
                          ? "bg-blue-100 text-blue-800"
                          : match.status === "SCHEDULED"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {match.status.replace("_", " ")}
                    </span>
                  </div>
                ))}
                {matches.length > 10 && (
                  <p className="text-sm text-gray-500 text-center">
                    And {matches.length - 10} more matches...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-tennis-green mb-4">
              Registration
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium">
                  {tournament.allow_registration ? "Open" : "Closed"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Registered:</span>
                <span className="font-medium">{registrations.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Available:</span>
                <span className="font-medium">
                  {tournament.max_participants - registrations.length}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-tennis-green h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      (registrations.length / tournament.max_participants) *
                        100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Participants */}
          {(isOrganizer || registrations.length > 0) && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-tennis-green mb-4">
                Participants ({registrations.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {registrations.map((registration, index) => (
                  <div
                    key={registration.id}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-tennis-green rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="text-sm">
                        {registration.player_id === user?.id
                          ? "You"
                          : `Player ${index + 1}`}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        registration.status === "CONFIRMED"
                          ? "bg-green-100 text-green-800"
                          : registration.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {registration.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tournament Stats */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-tennis-green mb-4">
              Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Matches:</span>
                <span className="font-medium">{matches.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completed:</span>
                <span className="font-medium">
                  {matches.filter((m) => m.status === "COMPLETED").length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">In Progress:</span>
                <span className="font-medium">
                  {matches.filter((m) => m.status === "IN_PROGRESS").length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Scheduled:</span>
                <span className="font-medium">
                  {matches.filter((m) => m.status === "SCHEDULED").length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
