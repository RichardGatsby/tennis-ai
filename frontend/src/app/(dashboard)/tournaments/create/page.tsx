"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { apiClient } from "@/lib/api";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Trophy,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import type { TournamentFormat } from "@/types";

const tournamentSchema = z.object({
  name: z.string().min(1, "Tournament name is required"),
  description: z.string().optional(),
  format: z.enum(["ROUND_ROBIN", "SINGLE_ELIMINATION", "DOUBLE_ELIMINATION"]),
  max_participants: z
    .number()
    .min(2, "At least 2 participants required")
    .max(128, "Maximum 128 participants"),
  entry_fee: z.number().min(0, "Entry fee must be 0 or positive").optional(),
  prize_pool: z.number().min(0, "Prize pool must be 0 or positive").optional(),
  registration_deadline: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  venue_name: z.string().optional(),
  venue_address: z.string().optional(),
  best_of_sets: z
    .number()
    .min(1, "Must be at least 1 set")
    .max(5, "Maximum 5 sets")
    .optional(),
  tiebreak_games: z
    .number()
    .min(6, "Minimum 6 games for tiebreak")
    .max(10, "Maximum 10 games for tiebreak")
    .optional(),
  match_duration_limit: z
    .number()
    .min(30, "Minimum 30 minutes")
    .max(300, "Maximum 5 hours")
    .optional(),
  is_public: z.boolean().optional(),
  allow_registration: z.boolean().optional(),
});

type TournamentFormData = z.infer<typeof tournamentSchema>;

export default function CreateTournamentPage() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TournamentFormData>({
    resolver: zodResolver(tournamentSchema),
    defaultValues: {
      format: "SINGLE_ELIMINATION",
      max_participants: 16,
      entry_fee: 0,
      prize_pool: 0,
      best_of_sets: 3,
      tiebreak_games: 7,
      match_duration_limit: 120,
      is_public: true,
      allow_registration: true,
    },
  });

  const formatValue = watch("format");
  const entryFee = watch("entry_fee");

  const onSubmit = async (data: TournamentFormData) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const tournament = await apiClient.createTournament(data);
      router.push(`/tournaments/${tournament.id}`);
    } catch (error: any) {
      setError(error.response?.data?.detail || "Failed to create tournament");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/tournaments">
          <Button variant="ghost" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tournaments
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-tennis-green">
            Create Tournament
          </h1>
          <p className="text-gray-600 mt-1">Set up a new tennis tournament</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Trophy className="h-5 w-5 text-tennis-green" />
            <h2 className="text-xl font-semibold text-tennis-green">
              Basic Information
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <Input
                {...register("name")}
                label="Tournament Name"
                placeholder="Summer Tennis Championship 2024"
                error={errors.name?.message}
                required
              />
            </div>

            <div className="lg:col-span-2">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-tennis-green focus:border-tennis-green"
                  placeholder="Describe your tournament, rules, and any special information..."
                />
                {errors.description && (
                  <p className="text-sm text-match-lose">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Tournament Format{" "}
                  <span className="text-match-lose ml-1">*</span>
                </label>
                <select
                  {...register("format")}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-tennis-green focus:border-tennis-green"
                >
                  <option value="SINGLE_ELIMINATION">Single Elimination</option>
                  <option value="DOUBLE_ELIMINATION">Double Elimination</option>
                  <option value="ROUND_ROBIN">Round Robin</option>
                </select>
                {errors.format && (
                  <p className="text-sm text-match-lose">
                    {errors.format.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Input
                {...register("max_participants", { valueAsNumber: true })}
                type="number"
                label="Maximum Participants"
                placeholder="16"
                error={errors.max_participants?.message}
                required
                min="2"
                max="128"
              />
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-6">
            <DollarSign className="h-5 w-5 text-tennis-green" />
            <h2 className="text-xl font-semibold text-tennis-green">
              Financial Details
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Input
                {...register("entry_fee", { valueAsNumber: true })}
                type="number"
                label="Entry Fee ($)"
                placeholder="0"
                error={errors.entry_fee?.message}
                min="0"
                step="0.01"
                helperText="Set to 0 for free tournaments"
              />
            </div>

            <div>
              <Input
                {...register("prize_pool", { valueAsNumber: true })}
                type="number"
                label="Prize Pool ($)"
                placeholder="0"
                error={errors.prize_pool?.message}
                min="0"
                step="0.01"
                helperText={
                  entryFee
                    ? `Suggested: $${(entryFee * 16 * 0.8).toFixed(2)}`
                    : "Optional prize pool"
                }
              />
            </div>
          </div>
        </div>

        {/* Schedule & Venue */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Calendar className="h-5 w-5 text-tennis-green" />
            <h2 className="text-xl font-semibold text-tennis-green">
              Schedule & Venue
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Input
                {...register("registration_deadline")}
                type="datetime-local"
                label="Registration Deadline"
                error={errors.registration_deadline?.message}
                helperText="When registration closes"
              />
            </div>

            <div>
              <Input
                {...register("start_date")}
                type="datetime-local"
                label="Tournament Start Date"
                error={errors.start_date?.message}
              />
            </div>

            <div>
              <Input
                {...register("end_date")}
                type="datetime-local"
                label="Tournament End Date"
                error={errors.end_date?.message}
              />
            </div>

            <div>
              <Input
                {...register("venue_name")}
                label="Venue Name"
                placeholder="Central Tennis Club"
                error={errors.venue_name?.message}
              />
            </div>

            <div className="lg:col-span-2">
              <Input
                {...register("venue_address")}
                label="Venue Address"
                placeholder="123 Tennis Court Lane, City, State 12345"
                error={errors.venue_address?.message}
              />
            </div>
          </div>
        </div>

        {/* Match Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Users className="h-5 w-5 text-tennis-green" />
            <h2 className="text-xl font-semibold text-tennis-green">
              Match Settings
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <Input
                {...register("best_of_sets", { valueAsNumber: true })}
                type="number"
                label="Best of Sets"
                placeholder="3"
                error={errors.best_of_sets?.message}
                min="1"
                max="5"
                helperText="1, 3, or 5 sets"
              />
            </div>

            <div>
              <Input
                {...register("tiebreak_games", { valueAsNumber: true })}
                type="number"
                label="Tiebreak at Games"
                placeholder="7"
                error={errors.tiebreak_games?.message}
                min="6"
                max="10"
                helperText="Games before tiebreak"
              />
            </div>

            <div>
              <Input
                {...register("match_duration_limit", { valueAsNumber: true })}
                type="number"
                label="Match Time Limit (minutes)"
                placeholder="120"
                error={errors.match_duration_limit?.message}
                min="30"
                max="300"
                helperText="Maximum match duration"
              />
            </div>
          </div>
        </div>

        {/* Tournament Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-6">
            <MapPin className="h-5 w-5 text-tennis-green" />
            <h2 className="text-xl font-semibold text-tennis-green">
              Tournament Settings
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                {...register("is_public")}
                type="checkbox"
                className="h-4 w-4 text-tennis-green focus:ring-tennis-green border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Public Tournament
              </label>
            </div>
            <p className="text-sm text-gray-500 ml-6">
              Public tournaments appear in the tournament listing for all users
            </p>

            <div className="flex items-center">
              <input
                {...register("allow_registration")}
                type="checkbox"
                className="h-4 w-4 text-tennis-green focus:ring-tennis-green border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Allow Player Registration
              </label>
            </div>
            <p className="text-sm text-gray-500 ml-6">
              Players can register themselves for this tournament
            </p>
          </div>
        </div>

        {/* Format Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">
            {formatValue === "SINGLE_ELIMINATION" &&
              "Single Elimination Format"}
            {formatValue === "DOUBLE_ELIMINATION" &&
              "Double Elimination Format"}
            {formatValue === "ROUND_ROBIN" && "Round Robin Format"}
          </h3>
          <p className="text-sm text-blue-700">
            {formatValue === "SINGLE_ELIMINATION" &&
              "Players are eliminated after losing one match. Fast and straightforward format."}
            {formatValue === "DOUBLE_ELIMINATION" &&
              "Players must lose twice to be eliminated. Includes winners and losers brackets."}
            {formatValue === "ROUND_ROBIN" &&
              "Every player plays every other player. Best for smaller groups and skill assessment."}
          </p>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <Link href="/tournaments">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
            className="flex items-center"
          >
            <Trophy className="h-4 w-4 mr-2" />
            Create Tournament
          </Button>
        </div>
      </form>
    </div>
  );
}
