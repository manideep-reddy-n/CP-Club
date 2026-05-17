"use client";
import React from "react";
import Link from "next/link";
import { Github, MessageSquare, Code2 } from "lucide-react";

const Footer = () => {
    const quickLinks = [
        { href: "/leaderboard", label: "Leaderboard" },
        { href: "/contest", label: "Contests" },
        { href: "/resources", label: "Resources" },
    ];

    const socialLinks = [
        {
            href: "https://github.com/PranavSriram39/CP-club",
            label: "GitHub",
            icon: Github,
        },
        {
            href: "https://chat.whatsapp.com/ITzWAJLkazz0XIJDZ5BZpv",
            label: "Community Chat",
            icon: MessageSquare,
        },
    ];

    return (
        <footer className="border-t border-white/10 bg-black/30 backdrop-blur-sm mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Column 1: About */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Code2 className="w-6 h-6 text-matrix-200" />
                            <h3 className="text-lg font-mono font-bold text-white">
                                BigOOne
                            </h3>
                        </div>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            BigOOne is dedicated to improving problem-solving skills and algorithmic thinking.
                        </p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-mono font-bold text-matrix-200 uppercase tracking-wider">
                            Quick Links
                        </h3>
                        <ul className="space-y-2">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-zinc-400 hover:text-matrix-200 transition-colors duration-300 inline-flex items-center group"
                                    >
                                        <span className="w-0 h-px bg-matrix-200 group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Connect */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-mono font-bold text-matrix-200 uppercase tracking-wider">
                            Connect
                        </h3>
                        <div className="flex space-x-3">
                            {socialLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-lg bg-zinc-900/50 border border-white/10 text-zinc-400 hover:text-matrix-200 hover:border-matrix-200/40 hover:shadow-glow-sm transition-all duration-300"
                                        aria-label={link.label}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </a>
                                );
                            })}
                        </div>
                        <p className="text-xs text-zinc-500 mt-4">
                            Join our community and level up your coding skills together!
                        </p>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-white/10">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                        <p className="text-xs text-zinc-500 font-mono">
                            {"\u00A9"} {new Date().getFullYear()} BigOOne. All rights reserved.
                        </p>
                        <p className="text-xs text-zinc-600 font-mono">
                            SYSTEM_STATUS: <span className="text-matrix-200 animate-pulse">ONLINE</span>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;


