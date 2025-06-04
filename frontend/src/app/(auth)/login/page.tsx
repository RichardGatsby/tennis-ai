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

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    const result = await login(data);

    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Login failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-tennis-green">Welcome Back</h1>
        <p className="text-gray-600 mt-2">
          Sign in to your tennis tournament account
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          {...register("email")}
          type="email"
          label="Email Address"
          placeholder="Enter your email"
          error={errors.email?.message}
          required
        />

        <Input
          {...register("password")}
          type="password"
          label="Password"
          placeholder="Enter your password"
          error={errors.password?.message}
          required
        />

        <Button
          type="submit"
          className="w-full"
          loading={isLoading}
          disabled={isLoading}
        >
          Sign In
        </Button>
      </form>

      <div className="text-center">
        <p className="text-gray-600">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-tennis-green hover:text-tennis-green-dark font-medium"
          >
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}
