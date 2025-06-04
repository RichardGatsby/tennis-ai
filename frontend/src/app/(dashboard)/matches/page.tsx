"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Calendar,
  Trophy,
  Users,
  Clock,
  Play,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import type { Match, Tournament } from "@/types";

export default function MatchesPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [tournamentFilter, setTournamentFilter] = useState<string>("");
  const [viewFilter, setViewFilter] = useState<string>("all"); // all, my, live, upcoming

  useEffect(() => {
    const loadData = async () => {
      try {
        const [matchesData, tournamentsData] = await Promise.all([
          loadMatches(),
          apiClient.getTournaments({ limit: 100 }),
        ]);
        setTournaments(tournamentsData);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const loadMatches = async () => {
    try {
      let matchesData: Match[] = [];

      if (viewFilter === "my") {
        matchesData = await apiClient.getMyMatches(0, 100);
      } else if (viewFilter === "live") {
        matchesData = await apiClient.getLiveMatches(0, 100);
      } else if (viewFilter === "upcoming") {
        matchesData = await apiClient.getUpcomingMatches(undefined, 0, 100);
      } else {
        matchesData = await apiClient.getMatches({
          status: statusFilter,
          tournament_id: tournamentFilter,
        });
      }

      setMatches(matchesData);
      return matchesData;
    } catch (error) {
      console.error("Failed to load matches:", error);
      return [];
    }
  };

  useEffect(() => {
    loadMatches();
  }, [statusFilter, tournamentFilter, viewFilter]);

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      SCHEDULED: "bg-yellow-100 text-yellow-800",
      IN_PROGRESS: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-green-100 text-green-800",
      FORFEIT: "bg-red-100 text-red-800",
      CANCELLED: "bg-gray-100 text-gray-800",
    };

    const statusIcons = {
      SCHEDULED: <Clock className="h-3 w-3" />,
      IN_PROGRESS: <Play className="h-3 w-3" />,
      COMPLETED: <Check className="h-3 w-3" />,
      FORFEIT: <X className="h-3 w-3" />,
      CANCELLED: <X className="h-3 w-3" />,
    };

    return (
      <span
        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
          statusClasses[status as keyof typeof statusClasses] ||
          "bg-gray-100 text-gray-800"
        }`}
      >
        {statusIcons[status as keyof typeof statusIcons]}
        <span>{status.replace("_", " ")}</span>
      </span>
    );
  };

  const getRoundBadge = (round: string) => {
    const roundColors = {
      FINAL: "bg-championship-gold text-championship-gold-dark",
      SEMI_FINAL: "bg-clay-orange text-white",
      QUARTER_FINAL: "bg-tennis-green text-white",
      ROUND_16: "bg-blue-100 text-blue-800",
      ROUND_32: "bg-purple-100 text-purple-800",
      ROUND_ROBIN: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
          roundColors[round as keyof typeof roundColors] ||
          "bg-gray-100 text-gray-800"
        }`}
      >
        {round.replace("_", " ")}
      </span>
    );
  };

  const isUserMatch = (match: Match) => {
    return match.player1_id === user?.id || match.player2_id === user?.id;
  };

  const getMatchTitle = (match: Match) => {
    const tournament = tournaments.find((t) => t.id === match.tournament_id);
    return tournament ? tournament.name : "Tournament Match";
  };

  const filteredMatches = matches.filter((match) => {
    const matchTitle = getMatchTitle(match).toLowerCase();
    const searchMatch =
      searchTerm === "" ||
      matchTitle.includes(searchTerm.toLowerCase()) ||
      match.round.toLowerCase().includes(searchTerm.toLowerCase());

    return searchMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-tennis-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-tennis-green">Matches</h1>
          <p className="text-gray-600 mt-1">
            View and track tournament matches
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search matches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tennis-green focus:border-tennis-green"
              />
            </div>
          </div>

          {/* View Filter */}
          <div className="sm:w-40">
            <select
              value={viewFilter}
              onChange={(e) => setViewFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tennis-green focus:border-tennis-green"
            >
              <option value="all">All Matches</option>
              <option value="my">My Matches</option>
              <option value="live">Live Matches</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:w-40">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tennis-green focus:border-tennis-green"
              disabled={viewFilter !== "all"}
            >
              <option value="">All Status</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="FORFEIT">Forfeit</option>
            </select>
          </div>

          {/* Tournament Filter */}
          <div className="sm:w-48">
            <select
              value={tournamentFilter}
              onChange={(e) => setTournamentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tennis-green focus:border-tennis-green"
              disabled={viewFilter !== "all"}
            >
              <option value="">All Tournaments</option>
              {tournaments.map((tournament) => (
                <option key={tournament.id} value={tournament.id}>
                  {tournament.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Play className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Live Matches</p>
              <p className="text-xl font-bold text-blue-600">
                {matches.filter((m) => m.status === "IN_PROGRESS").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-xl font-bold text-yellow-600">
                {matches.filter((m) => m.status === "SCHEDULED").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-xl font-bold text-green-600">
                {matches.filter((m) => m.status === "COMPLETED").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-tennis-green rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">My Matches</p>
              <p className="text-xl font-bold text-tennis-green">
                {matches.filter((m) => isUserMatch(m)).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Matches List */}
      <div className="bg-white rounded-lg shadow-sm">
        {filteredMatches.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No matches found
            </h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter || tournamentFilter
                ? "Try adjusting your search criteria"
                : "No matches are currently scheduled"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredMatches.map((match) => {
              const tournament = tournaments.find(
                (t) => t.id === match.tournament_id
              );
              const isMyMatch = isUserMatch(match);

              return (
                <div
                  key={match.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    isMyMatch
                      ? "bg-tennis-green bg-opacity-5 border-l-4 border-tennis-green"
                      : ""
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    {/* Match Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {getMatchTitle(match)}
                        </h3>
                        {getRoundBadge(match.round)}
                        {getStatusBadge(match.status)}
                        {isMyMatch && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-tennis-green text-white">
                            Your Match
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        {/* Players */}
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>
                            {match.player1_id === user?.id ? "You" : "Player 1"}{" "}
                            vs{" "}
                            {match.player2_id === user?.id
                              ? "You"
                              : match.player2_id
                              ? "Player 2"
                              : "TBD"}
                          </span>
                        </div>

                        {/* Schedule */}
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {match.scheduled_at
                              ? new Date(match.scheduled_at).toLocaleString()
                              : "TBD"}
                          </span>
                        </div>

                        {/* Court */}
                        {match.court_number && (
                          <div className="flex items-center space-x-2">
                            <Trophy className="h-4 w-4" />
                            <span>Court {match.court_number}</span>
                          </div>
                        )}
                      </div>

                      {/* Match Progress */}
                      {match.status === "IN_PROGRESS" && (
                        <div className="mt-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-blue-600 font-medium">
                              Match in progress...
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Winner */}
                      {match.status === "COMPLETED" && match.winner_id && (
                        <div className="mt-3">
                          <div className="flex items-center space-x-2">
                            <Trophy className="h-4 w-4 text-championship-gold" />
                            <span className="text-sm font-medium">
                              Winner:{" "}
                              {match.winner_id === user?.id
                                ? "You"
                                : match.winner_id === match.player1_id
                                ? "Player 1"
                                : "Player 2"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-3">
                      {/* Tournament Link */}
                      {tournament && (
                        <Link href={`/tournaments/${tournament.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center"
                          >
                            <Trophy className="h-4 w-4 mr-1" />
                            View Tournament
                          </Button>
                        </Link>
                      )}

                      {/* Match Actions */}
                      {isMyMatch && match.status === "SCHEDULED" && (
                        <Button size="sm" className="flex items-center">
                          <Play className="h-4 w-4 mr-1" />
                          Start Match
                        </Button>
                      )}

                      {isMyMatch && match.status === "IN_PROGRESS" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="flex items-center"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Complete Match
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Load More */}
      {filteredMatches.length >= 50 && (
        <div className="text-center">
          <Button variant="outline">Load More Matches</Button>
        </div>
      )}
    </div>
  );
}
