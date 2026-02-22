import { Outlet, Link, useNavigate } from '@tanstack/react-router';
import { ShoppingCart, Sparkles, Store } from 'lucide-react';
import CartIcon from './CartIcon';
import LoginButton from './LoginButton';
import { SiX, SiFacebook, SiInstagram } from 'react-icons/si';
import { Button } from '@/components/ui/button';

export default function Layout() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const appIdentifier = encodeURIComponent(window.location.hostname || 'dino-squad');

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-950 dark:to-blue-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b-4 border-pink-300 dark:border-pink-700 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 p-3 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                  Dino Squad
                </h1>
                <p className="text-xs text-muted-foreground font-medium">Squish & Slime Paradise!</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className="text-lg font-bold text-gray-700 dark:text-gray-200 hover:text-pink-500 dark:hover:text-pink-400 transition-colors"
              >
                Shop
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate({ to: '/sell' })}
                variant="outline"
                className="hidden sm:flex items-center gap-2 border-2 border-purple-400 hover:bg-purple-50 dark:border-purple-600 dark:hover:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold"
              >
                <Store className="w-4 h-4" />
                Sell
              </Button>
              <LoginButton />
              <CartIcon />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="w-full bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 dark:from-pink-800 dark:via-purple-800 dark:to-blue-800">
        <div className="container mx-auto">
          <img
            src="/assets/generated/hero-banner.dim_1200x400.png"
            alt="Colorful squishies and slime collection"
            className="w-full h-auto max-h-[300px] object-cover rounded-b-3xl shadow-2xl"
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 dark:from-pink-900 dark:via-purple-900 dark:to-blue-900 text-white mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-black mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                Dino Squad
              </h3>
              <p className="text-pink-100 dark:text-pink-200">
                Your one-stop shop for the squishiest paper squishies and the slimiest slime!
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-pink-100 hover:text-white transition-colors">
                    Shop All Products
                  </Link>
                </li>
                <li>
                  <Link to="/cart" className="text-pink-100 hover:text-white transition-colors">
                    Shopping Cart
                  </Link>
                </li>
                <li>
                  <Link to="/sell" className="text-pink-100 hover:text-white transition-colors">
                    Sell Your Products
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Follow Us</h4>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors"
                  aria-label="Facebook"
                >
                  <SiFacebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors"
                  aria-label="Instagram"
                >
                  <SiInstagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors"
                  aria-label="X (Twitter)"
                >
                  <SiX className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8 text-center text-pink-100">
            <p className="mb-2">
              © {currentYear} Dino Squad. All rights reserved.
            </p>
            <p className="flex items-center justify-center gap-2">
              Built with <span className="text-red-300">♥</span> using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold hover:text-white transition-colors underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
