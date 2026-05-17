"use client";
import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="text-center">
                {/* Pulsing Green Spinner */}
                <div className="relative">
                    {/* Outer glow rings */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full bg-green-500/20 animate-ping" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-green-500/30 animate-pulse" />
                    </div>

                    {/* Main spinner */}
                    <div className="relative flex items-center justify-center">
                        <Loader2 className="w-16 h-16 text-matrix-200 animate-spin" strokeWidth={2.5} />
                    </div>
                </div>

                {/* Loading text */}
                <p className="mt-8 font-mono text-matrix-200 animate-pulse">
                    Loading<span className="animate-pulse">...</span>
                </p>

                {/* Optional: Terminal-style loading indicator */}
                <div className="mt-4 font-mono text-xs text-zinc-500">
                    <span className="text-matrix-200">$</span> Initializing system
                    <span className="inline-block w-2 h-4 bg-matrix-200 ml-1 animate-pulse" />
                </div>
            </div>
        </div>
    );
}
