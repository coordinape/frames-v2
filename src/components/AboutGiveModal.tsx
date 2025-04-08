"use client";

import { useState } from "react";
import { PATHS } from "~/constants/paths";

export default function AboutGiveModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1 text-white/60 hover:text-white/80 transition-colors cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="8" />
        </svg>
        <div className="text-xs font-sans font-normal">What is GIVE?</div>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm overflow-y-auto pt-8 pb-12"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-gray-800 rounded-lg max-w-md w-full mx-4 relative my-auto overflow-hidden "
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex-1 w-full min-h-[280px] bg-no-repeat bg-[50%_30%] bg-cover"
              style={{ backgroundImage: "url('/images/base-give.jpg')" }}
            ></div>
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-white/80"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <img
                  src="/images/give-icon.png"
                  alt="Coordinape Logo"
                  className="h-10 mt-1"
                />
                <h3 className="text-4xl font-bold text-white font-sans">
                  GIVE
                </h3>
              </div>

              <div className="text-white space-y-4 font-sans font-normal text-[17px]">
                <div className="inline-block font-bold">
                  A simple and powerful onchain way to recognize people and
                  their impact
                  <div className="inline font-normal">
                    , inside and outside of the Coordinape platform.
                  </div>
                </div>
                <p>
                  GIVE skills represent areas where creators have received
                  recognition from their peers.
                </p>
                <p>
                  Click on a skill to explore other contributors recognized for
                  similar work.
                </p>
                <a
                  className="text-white/80 hover:text-white/60 transition-colors underline cursor-pointer"
                  href={PATHS.COORDINAPE}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Explore GIVE at Coordinape.com
                </a>
              </div>
              <a
                href={PATHS.COORDINAPE}
                target="_blank"
                rel="noopener noreferrer"
                className=" cursor-pointer"
              >
                <img
                  src="/images/coordinape-logo-white.png"
                  alt="Coordinape Logo"
                  className="h-8 mt-8 mb-6"
                />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
