import Link from 'next/link'
import { Sparkles, Star, Moon, Sun, ArrowRight, Compass } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-2 h-2 bg-white rounded-full top-20 left-[10%] animate-pulse opacity-60"></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-32 left-[25%] animate-pulse opacity-40"></div>
        <div className="absolute w-2 h-2 bg-white rounded-full top-16 left-[45%] animate-pulse opacity-50"></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-40 left-[60%] animate-pulse opacity-70"></div>
        <div className="absolute w-2 h-2 bg-white rounded-full top-24 left-[80%] animate-pulse opacity-40"></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-48 left-[90%] animate-pulse opacity-60"></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-60 left-[15%] animate-pulse opacity-50"></div>
        <div className="absolute w-2 h-2 bg-white rounded-full top-72 left-[35%] animate-pulse opacity-30"></div>
        <div className="absolute w-1 h-1 bg-white rounded-full top-56 left-[70%] animate-pulse opacity-60"></div>
        <div className="absolute w-2 h-2 bg-white rounded-full top-80 left-[85%] animate-pulse opacity-40"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Celestial Journey</span>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="text-purple-200 hover:text-white transition-colors font-medium"
          >
            Sign In
          </Link>
          <Link 
            href="/signup"
            className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-purple-500/25"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 py-20 md:py-32 text-center">
        {/* Floating icons */}
        <div className="absolute top-20 left-10 text-yellow-300/30 animate-bounce">
          <Star size={40} />
        </div>
        <div className="absolute top-40 right-20 text-purple-300/30 animate-pulse">
          <Moon size={50} />
        </div>
        <div className="absolute bottom-40 left-20 text-orange-300/30 animate-bounce">
          <Sun size={45} />
        </div>
        <div className="absolute bottom-20 right-10 text-indigo-300/30 animate-pulse">
          <Compass size={35} />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-purple-200 text-sm mb-8">
          <Sparkles className="w-4 h-4" />
          Discover Your Cosmic Blueprint
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 max-w-4xl leading-tight">
          Unlock the Secrets of the{' '}
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            Stars
          </span>
        </h1>

        <p className="text-lg md:text-xl text-purple-200/80 mb-10 max-w-2xl">
          Create personalized birth charts, explore planetary alignments, and discover what the cosmos has in store for your journey through life.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/signup"
            className="group px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-xl hover:shadow-purple-500/30 flex items-center gap-2"
          >
            Start Your Journey
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/learn"
            className="px-8 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold hover:bg-white/20 transition-all"
          >
            Learn More
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl w-full">
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors text-left">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4">
              <Sun className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Natal Charts</h3>
            <p className="text-purple-200/60">
              Generate detailed birth charts with precise planetary positions and house placements.
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors text-left">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Compatibility</h3>
            <p className="text-purple-200/60">
              Compare charts and discover cosmic connections between you and your loved ones.
            </p>
          </div>

          <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors text-left">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mb-4">
              <Moon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Daily Insights</h3>
            <p className="text-purple-200/60">
              Get personalized daily horoscopes and transit predictions based on your chart.
            </p>
          </div>
        </div>

        {/* Testimonial/Trust */}
        <div className="mt-20 text-center">
          <p className="text-purple-200/40 text-sm mb-4">Trusted by cosmic explorers worldwide</p>
          <div className="flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <p className="text-purple-200/60 mt-2">4.9/5 from over 10,000 users</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-20 py-8 px-6 text-center">
        <p className="text-purple-200/40 text-sm">
          © 2024 Celestial Journey. All rights reserved. The stars guide, but you decide.
        </p>
      </footer>
    </div>
  )
}
