import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-editorial-border bg-editorial-ivory text-editorial-charcoal">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          {/* Brand Colophon */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-2.5">
                <Image
                  src="/logo.png"
                  alt="FolioCraft"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain rounded-sm"
                />
                <span className="font-serif text-xl tracking-tight font-semibold">FolioCraft</span>
              </div>
              <p className="max-w-sm font-serif text-lg leading-relaxed text-editorial-charcoal/80 italic">
                “Your story deserves its own website. Designed with restraint, built with endurance.”
              </p>
              <p className="text-xs text-editorial-muted">
                A multi-tenant publishing platform engineered for creatives, architects, engineers, and independent practitioners.
              </p>
            </div>

            <div className="pt-8 text-xs font-mono uppercase tracking-widest text-editorial-muted">
              © {new Date().getFullYear()} FolioCraft Studio. All rights reserved.
            </div>
          </div>

          {/* Themes Directory */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-widest text-editorial-mocha font-semibold">
              The 6 Archetypes
            </h4>
            <ul className="space-y-2.5 text-sm text-editorial-charcoal/80">
              <li>
                <Link href="/#themes" className="hover:text-editorial-charcoal transition-colors">
                  Minimal & Editorial
                </Link>
              </li>
              <li>
                <Link href="/#themes" className="hover:text-editorial-charcoal transition-colors">
                  Creative & Experimental
                </Link>
              </li>
              <li>
                <Link href="/#themes" className="hover:text-editorial-charcoal transition-colors">
                  Modern Developer
                </Link>
              </li>
              <li>
                <Link href="/#themes" className="hover:text-editorial-charcoal transition-colors">
                  Elegant & Luxury
                </Link>
              </li>
              <li>
                <Link href="/#themes" className="hover:text-editorial-charcoal transition-colors">
                  Playful & Colorful
                </Link>
              </li>
              <li>
                <Link href="/#themes" className="hover:text-editorial-charcoal transition-colors">
                  Corporate & Professional
                </Link>
              </li>
            </ul>
          </div>

          {/* Product & Architecture */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-widest text-editorial-mocha font-semibold">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-editorial-charcoal/80">
              <li>
                <Link href="/#how-it-works" className="hover:text-editorial-charcoal transition-colors">
                  How it Works
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-editorial-charcoal transition-colors">
                  Editor Engine
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-editorial-charcoal transition-colors">
                  Start Portfolio
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-editorial-charcoal transition-colors">
                  User Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Colophon & Standards */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-widest text-editorial-mocha font-semibold">
              Architecture
            </h4>
            <div className="space-y-2 text-xs text-editorial-muted">
              <p>Next.js 15 App Router</p>
              <p>Edge Middleware Subdomains</p>
              <p>Firebase Auth & Firestore</p>
              <p>Tailwind CSS & Framer</p>
            </div>
            <div className="pt-2">
              <a
                href="#top"
                className="inline-flex items-center space-x-1 text-xs font-mono uppercase tracking-wider text-editorial-charcoal hover:underline"
              >
                <span>Back to top</span>
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* At the very last of the footer */}
        <div className="mt-12 pt-8 border-t border-editorial-border/60 text-center text-xs font-mono text-editorial-charcoal">
          {"Made by Saumya<3"}
        </div>
      </div>
    </footer>
  );
}
