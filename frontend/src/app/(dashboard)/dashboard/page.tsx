"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Calendar, Users, Target, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import type { Tournament, Match, Registration } from "@/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [tournamentsData, matchesData, registrationsData] =
          await Promise.all([
            apiClient.getTournaments({ limit: 5 }),
            apiClient.getMyMatches(0, 5),
            apiClient.getMyRegistrations(0, 5),
          ]);

        setTournaments(tournamentsData);
        setMatches(matchesData);
        setRegistrations(registrationsData);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-tennis-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold text-tennis-green mb-2">
          Welcome back, {user?.display_name || user?.first_name}!
        </h1>
        <p className="text-gray-600">
          Ready to serve up some competition? Here's what's happening in your
          tennis world.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-tennis-green rounded-lg flex items-center justify-center">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Active Tournaments
              </p>
              <p className="text-2xl font-bold text-tennis-green">
                {registrations.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-clay-orange rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Upcoming Matches
              </p>
              <p className="text-2xl font-bold text-clay-orange">
                {matches.filter((m) => m.status === "SCHEDULED").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-championship-gold rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-tennis-green-dark" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Matches Won</p>
              <p className="text-2xl font-bold text-championship-gold-dark">
                {matches.filter((m) => m.winner_id === user?.id).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-match-pending rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Skill Level</p>
              <p className="text-lg font-bold text-match-pending capitalize">
                {user?.skill_level?.toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-tennis-green mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/tournaments">
            <Button className="flex items-center">
              <Trophy className="h-4 w-4 mr-2" />
              Browse Tournaments
            </Button>
          </Link>
          <Link href="/tournaments/create">
            <Button variant="secondary" className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Create Tournament
            </Button>
          </Link>
          <Link href="/matches">
            <Button variant="outline" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              View Matches
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tournaments */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-tennis-green">
              Recent Tournaments
            </h2>
            <Link
              href="/tournaments"
              className="text-tennis-green hover:text-tennis-green-dark text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {tournaments.slice(0, 3).map((tournament) => (
              <div
                key={tournament.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <h3 className="font-medium text-gray-900">
                    {tournament.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {tournament.format.replace("_", " ")} •{" "}
                    {tournament.max_participants} players
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tournament.status === "REGISTRATION_OPEN"
                        ? "bg-green-100 text-green-800"
                        : tournament.status === "IN_PROGRESS"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {tournament.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
            {tournaments.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No tournaments found
              </p>
            )}
          </div>
        </div>

        {/* Upcoming Matches */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-tennis-green">
              Upcoming Matches
            </h2>
            <Link
              href="/matches"
              className="text-tennis-green hover:text-tennis-green-dark text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {matches
              .filter((m) => m.status === "SCHEDULED")
              .slice(0, 3)
              .map((match) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {match.round.replace("_", " ")}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {match.scheduled_at
                        ? new Date(match.scheduled_at).toLocaleDateString()
                        : "TBD"}
                    </p>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {match.scheduled_at
                      ? new Date(match.scheduled_at).toLocaleTimeString()
                      : "TBD"}
                  </div>
                </div>
              ))}
            {matches.filter((m) => m.status === "SCHEDULED").length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No upcoming matches
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
