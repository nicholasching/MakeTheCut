"use client";

import Link from "next/link";
import { Github, Twitter, Mail } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-neutral-950 border-t border-neutral-800 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center">
              <span className="text-xl font-bold text-white">MacStats</span>
            </div>
            <p className="text-neutral-400 text-sm mt-2 max-w-md">
              Helping McMaster Engineering students make informed decisions about their academic future.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-10">
            <div>
              <h4 className="text-white font-semibold mb-2">Links</h4>
              <nav className="flex flex-col space-y-2">
                <Link href="/" className="text-neutral-400 hover:text-white transition-colors">
                  Home
                </Link>
                <Link href="/about" className="text-neutral-400 hover:text-white transition-colors">
                  About
                </Link>
                <Link href="/privacy" className="text-neutral-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </nav>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-2">Connect</h4>
              <div className="flex space-x-4">
                <a 
                  href="https://github.com/yourusername" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  <Github size={20} />
                </a>
                <a 
                  href="https://twitter.com/yourusername" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  <Twitter size={20} />
                </a>
                <a 
                  href="mailto:contact@macstats.com" 
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  <Mail size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-neutral-800 text-center md:text-left">
          <p className="text-neutral-500 text-sm">
            © {currentYear} MacStats. All rights reserved.
          </p>
          <p className="text-neutral-600 text-xs mt-1">
            Built with Next.js, Tailwind CSS, and Appwrite.
          </p>
        </div>
      </div>
    </footer>
  );
}