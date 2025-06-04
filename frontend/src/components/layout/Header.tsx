"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trophy, Menu, X, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-tennis-green" />
            <span className="text-xl font-bold text-tennis-green">
              AI Tennis Tournament
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-tennis-green font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/tournaments"
              className="text-gray-700 hover:text-tennis-green font-medium"
            >
              Tournaments
            </Link>
            <Link
              href="/matches"
              className="text-gray-700 hover:text-tennis-green font-medium"
            >
              Matches
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-tennis-green"
              >
                <div className="w-8 h-8 bg-tennis-green rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="hidden sm:block font-medium">
                  {user.display_name || `${user.first_name} ${user.last_name}`}
                </span>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link
                    href="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-tennis-green"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-2">
              <Link
                href="/dashboard"
                className="px-3 py-2 text-gray-700 hover:text-tennis-green font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/tournaments"
                className="px-3 py-2 text-gray-700 hover:text-tennis-green font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Tournaments
              </Link>
              <Link
                href="/matches"
                className="px-3 py-2 text-gray-700 hover:text-tennis-green font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Matches
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
