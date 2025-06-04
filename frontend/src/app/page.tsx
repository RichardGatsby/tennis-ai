import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Trophy, Users, Calendar, Target } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-tennis-green to-tennis-green-dark">
      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-championship-gold" />
            <span className="text-2xl font-bold text-white">
              AI Tennis Tournament
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-tennis-green"
              >
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-championship-gold text-tennis-green-dark hover:bg-championship-gold-dark">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Professional Tennis
            <span className="block text-championship-gold">
              Tournament Management
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-tennis-green-light mb-12 max-w-3xl mx-auto">
            Organize, manage, and participate in tennis tournaments with our
            comprehensive platform. From registration to match scoring, we've
            got you covered.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button
                size="xl"
                className="bg-championship-gold text-tennis-green-dark hover:bg-championship-gold-dark"
              >
                Start Tournament
              </Button>
            </Link>
            <Link href="/tournaments">
              <Button
                size="xl"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-tennis-green"
              >
                Browse Tournaments
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-tennis-green mb-16">
            Everything You Need for Tennis Tournaments
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-tennis-green rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-tennis-green mb-2">
                Tournament Creation
              </h3>
              <p className="text-gray-600">
                Create and customize tournaments with various formats including
                single elimination, double elimination, and round robin.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-clay-orange rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-tennis-green mb-2">
                Player Management
              </h3>
              <p className="text-gray-600">
                Easy registration system with skill level matching and automated
                bracket generation for fair competition.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-championship-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-tennis-green-dark" />
              </div>
              <h3 className="text-xl font-semibold text-tennis-green mb-2">
                Match Scheduling
              </h3>
              <p className="text-gray-600">
                Intelligent scheduling system that considers court availability,
                player preferences, and tournament timeline.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-match-win rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-tennis-green mb-2">
                Live Scoring
              </h3>
              <p className="text-gray-600">
                Real-time score entry and tracking with automatic bracket
                updates and live tournament progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20 tennis-court-bg">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Serve Up Your Next Tournament?
          </h2>
          <p className="text-xl text-tennis-green-light mb-8">
            Join thousands of tennis enthusiasts who trust our platform for
            their tournament needs.
          </p>
          <Link href="/register">
            <Button
              size="xl"
              className="bg-championship-gold text-tennis-green-dark hover:bg-championship-gold-dark"
            >
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 bg-tennis-green-dark">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Trophy className="h-6 w-6 text-championship-gold" />
            <span className="text-lg font-semibold text-white">
              AI Tennis Tournament
            </span>
          </div>
          <p className="text-tennis-green-light">
            © 2024 AI Tennis Tournament. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
