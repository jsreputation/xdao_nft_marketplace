'use client';

import Link from 'next/link';
import Image from 'next/image';
import { WalletConnectButton } from '@/components/ConnectButton';
import { usePathname } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import { useAccount } from 'wagmi';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { address, isConnected } = useAccount();

  // Close mobile menu when connection state changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [isConnected, address]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = useMemo(() => {
    const base = [
      { href: '/explore', label: 'Explore' },
      { href: '/auctions', label: 'Auctions' },
    ];

    if (!isConnected || !address) {
      return base;
    }

    return [
      ...base,
      { href: '/mint', label: 'Mint' },
      { href: '/create/collection', label: 'Create' },
      { href: `/profile/${address}`, label: 'Profile' },
    ];
  }, [isConnected, address]);

  return (
    <nav className={`bg-gray-900/95 backdrop-blur-xl shadow-lg sticky top-0 z-50 border-b border-gray-800/50 transition-all duration-300 ${scrolled ? 'shadow-xl border-gray-700/50' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Row: Logo, Navigation, Actions */}
        <div className="flex justify-between items-center h-16 lg:h-18">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-6 lg:gap-8 flex-1">
            <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="relative w-9 h-9 lg:w-10 lg:h-10 group-hover:scale-110 transition-transform duration-300">
                <Image
                  src="/assets/logo_main.png"
                  alt="XDAO Logo"
                  fill
                  sizes="(max-width: 1024px) 36px, 40px"
                  className="object-contain drop-shadow-lg"
                  priority
                />
              </div>
              <span className="text-lg lg:text-xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent group-hover:from-primary-300 group-hover:to-purple-300 transition-all duration-300">
                XDAO
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link, index) => {
                const isActive = pathname === link.href || 
                  (link.href !== '/explore' && pathname?.startsWith(link.href));
                return (
                  <Link
                    key={`${link.href}-${link.label}`}
                    href={link.href}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden sm:block">
              <WalletConnectButton />
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-gray-800 ${
            mobileMenuOpen ? 'max-h-96 opacity-100 py-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="space-y-1 mb-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || 
                (link.href !== '/explore' && pathname?.startsWith(link.href));
              return (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="px-4">
            <WalletConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
