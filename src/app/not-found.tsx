import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-editorial-ivory flex flex-col items-center justify-center p-6 text-center">
      <div className="border border-editorial-border bg-white p-10 max-w-md shadow-editorial space-y-6">
        <Image
          src="/logo.png"
          alt="FolioCraft"
          width={48}
          height={48}
          className="h-12 w-12 object-contain mx-auto rounded-sm"
        />
        <div className="space-y-2">
          <span className="font-mono text-xs text-editorial-mocha uppercase tracking-widest font-semibold">Error 404</span>
          <h1 className="font-serif text-2xl text-editorial-charcoal">
            Page Not Found
          </h1>
          <p className="text-xs text-editorial-muted font-sans leading-relaxed">
            The page or portfolio you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 border border-editorial-charcoal bg-editorial-charcoal px-5 py-2.5 text-xs font-mono uppercase tracking-wider text-editorial-ivory hover:bg-editorial-softdark transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
