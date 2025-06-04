"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Plus,
  Trophy,
  Users,
  Calendar,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiClient } from "@/lib/api";
import type { Tournament } from "@/types";

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    const loadTournaments = async () => {
      try {
        const data = await apiClient.getTournaments({
          search: searchTerm,
          status: statusFilter,
        });
        setTournaments(data);
      } catch (error) {
        console.error("Failed to load tournaments:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTournaments();
  }, [searchTerm, statusFilter]);

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
          <h1 className="text-3xl font-bold text-tennis-green">Tournaments</h1>
          <p className="text-gray-600 mt-1">
            Discover and join tennis tournaments
          </p>
        </div>
        <Link href="/tournaments/create">
          <Button className="mt-4 sm:mt-0 flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Create Tournament
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tournaments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tennis-green focus:border-tennis-green"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tennis-green focus:border-tennis-green"
            >
              <option value="">All Status</option>
              <option value="REGISTRATION_OPEN">Registration Open</option>
              <option value="REGISTRATION_CLOSED">Registration Closed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tournament Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map((tournament) => (
          <div
            key={tournament.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-tennis-green line-clamp-2">
                  {tournament.name}
                </h3>
                {getStatusBadge(tournament.status)}
              </div>

              {tournament.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {tournament.description}
                </p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Trophy className="h-4 w-4 mr-2" />
                  {tournament.format.replace("_", " ")}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  Max {tournament.max_participants} players
                </div>
                {tournament.start_date && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(tournament.start_date).toLocaleDateString()}
                  </div>
                )}
                {tournament.venue_name && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {tournament.venue_name}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  {tournament.entry_fee > 0 ? (
                    <span className="font-medium text-gray-900">
                      ${tournament.entry_fee}
                    </span>
                  ) : (
                    <span className="text-green-600 font-medium">Free</span>
                  )}
                </div>
                <Link href={`/tournaments/${tournament.id}`}>
                  <Button size="sm">View Details</Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {tournaments.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tournaments found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter
              ? "Try adjusting your search criteria"
              : "Be the first to create a tournament!"}
          </p>
          <Link href="/tournaments/create">
            <Button>Create Tournament</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
