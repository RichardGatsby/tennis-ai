import Link from "next/link";
import { Trophy } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-tennis-green to-tennis-green-dark flex flex-col">
      {/* Header */}
      <header className="px-6 py-4">
        <Link
          href="/"
          className="flex items-center space-x-2 text-white hover:text-championship-gold transition-colors"
        >
          <Trophy className="h-8 w-8" />
          <span className="text-2xl font-bold">AI Tennis Tournament</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-xl p-8">{children}</div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center">
        <p className="text-tennis-green-light text-sm">
          © 2024 AI Tennis Tournament. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
