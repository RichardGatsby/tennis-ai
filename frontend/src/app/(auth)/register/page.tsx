"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import type { SkillLevel, PreferredHand } from "@/types";

const registerSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    display_name: z.string().optional(),
    phone: z.string().optional(),
    date_of_birth: z.string().optional(),
    skill_level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
    preferred_hand: z.enum(["RIGHT", "LEFT", "AMBIDEXTROUS"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const { register: registerUser, isLoading } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      skill_level: "INTERMEDIATE",
      preferred_hand: "RIGHT",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    const { confirmPassword, ...registerData } = data;
    const result = await registerUser(registerData);

    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Registration failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-tennis-green">Join the Game</h1>
        <p className="text-gray-600 mt-2">
          Create your tennis tournament account
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            {...register("first_name")}
            label="First Name"
            placeholder="John"
            error={errors.first_name?.message}
            required
          />
          <Input
            {...register("last_name")}
            label="Last Name"
            placeholder="Doe"
            error={errors.last_name?.message}
            required
          />
        </div>

        <Input
          {...register("display_name")}
          label="Display Name"
          placeholder="Optional nickname"
          error={errors.display_name?.message}
          helperText="This will be shown in tournaments"
        />

        <Input
          {...register("email")}
          type="email"
          label="Email Address"
          placeholder="john@example.com"
          error={errors.email?.message}
          required
        />

        <Input
          {...register("phone")}
          type="tel"
          label="Phone Number"
          placeholder="+1 (555) 123-4567"
          error={errors.phone?.message}
          helperText="Optional - for tournament notifications"
        />

        <Input
          {...register("date_of_birth")}
          type="date"
          label="Date of Birth"
          error={errors.date_of_birth?.message}
          helperText="Optional - helps with age group tournaments"
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Skill Level <span className="text-match-lose ml-1">*</span>
            </label>
            <select
              {...register("skill_level")}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-tennis-green focus:border-tennis-green"
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
            {errors.skill_level && (
              <p className="text-sm text-match-lose">
                {errors.skill_level.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Preferred Hand <span className="text-match-lose ml-1">*</span>
            </label>
            <select
              {...register("preferred_hand")}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-tennis-green focus:border-tennis-green"
            >
              <option value="RIGHT">Right</option>
              <option value="LEFT">Left</option>
              <option value="AMBIDEXTROUS">Ambidextrous</option>
            </select>
            {errors.preferred_hand && (
              <p className="text-sm text-match-lose">
                {errors.preferred_hand.message}
              </p>
            )}
          </div>
        </div>

        <Input
          {...register("password")}
          type="password"
          label="Password"
          placeholder="Enter your password"
          error={errors.password?.message}
          required
        />

        <Input
          {...register("confirmPassword")}
          type="password"
          label="Confirm Password"
          placeholder="Confirm your password"
          error={errors.confirmPassword?.message}
          required
        />

        <Button
          type="submit"
          className="w-full"
          loading={isLoading}
          disabled={isLoading}
        >
          Create Account
        </Button>
      </form>

      <div className="text-center">
        <p className="text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-tennis-green hover:text-tennis-green-dark font-medium"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
