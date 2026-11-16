/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface EmeraldAtmosphereProps {
  showSkyline?: boolean;
}

export const EmeraldAtmosphere: React.FC<EmeraldAtmosphereProps> = ({
  showSkyline = true,
}) => {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden bg-[#040b07]">
      {/* Base forest-to-emerald tonal depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 85% at 50% 0%, rgba(12, 68, 42, 0.45) 0%, rgba(6, 28, 18, 0.32) 48%, rgba(3, 10, 6, 0.98) 100%)',
        }}
      />

      {/* Slow animated atmospheric emerald light fields */}
      <div
        className="nl-emerald-sweep absolute -top-44 -left-32 h-[540px] w-[540px] rounded-full blur-[120px]"
        style={{
          background:
            'radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, rgba(5, 150, 105, 0.08) 55%, transparent 75%)',
        }}
      />
      <div
        className="nl-emerald-sweep absolute -bottom-48 -right-24 h-[520px] w-[520px] rounded-full blur-[130px]"
        style={{
          animationDelay: '-6.5s',
          background:
            'radial-gradient(circle, rgba(5, 150, 105, 0.2) 0%, rgba(6, 95, 70, 0.09) 55%, transparent 75%)',
        }}
      />

      {/* Subtle architectural perspective floor fade */}
      <div
        className="absolute inset-x-0 bottom-0 h-56 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(to top, rgba(16, 185, 129, 0.08), transparent)',
        }}
      />

      {/* Nigerian urban city skyline silhouette with animated tower lights */}
      {showSkyline && (
        <div className="absolute inset-x-0 bottom-0 h-44 sm:h-56 overflow-hidden">
          <div className="nl-horizon-pulse absolute inset-x-10 bottom-16 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />
          <svg
            viewBox="0 0 1440 220"
            preserveAspectRatio="none"
            className="w-full h-full opacity-75"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="nlSkylineBack" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0b2e1e" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#040b07" stopOpacity="0.98" />
              </linearGradient>
              <linearGradient id="nlSkylineFront" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#071d13" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#030906" stopOpacity="1" />
              </linearGradient>
            </defs>

            {/* Distant towers */}
            <path
              d="M0 220 V146 H48 V110 H94 V146 H130 V92 H178 V138 H228 V82 H268 V142 H330 V120 H374 V64 H418 V124 H485 V96 H538 V148 H602 V108 H648 V72 H692 V138 H754 V118 H812 V88 H860 V142 H925 V62 H970 V126 H1036 V100 H1092 V140 H1160 V76 H1206 V132 H1274 V95 H1322 V144 H1378 V106 H1440 V220 Z"
              fill="url(#nlSkylineBack)"
            />

            {/* Foreground Lagos-inspired skyline & cable-stayed bridge cables */}
            <path
              d="M0 220 V168 H64 V134 H114 V168 H164 V116 H204 V164 H270 V142 H316 V96 H356 V154 H422 V170 H490 V118 H532 V160 H604 V136 H666 V90 H710 V158 H790 V132 H840 V168 H900 V106 H946 V160 H1014 V142 H1072 V112 H1116 V166 H1188 V124 H1232 V164 H1304 V134 H1364 V170 H1440 V220 Z"
              fill="url(#nlSkylineFront)"
            />

            {/* Lekki-Ikoyi style cable pylon */}
            <path
              d="M780 185 L816 96 L852 185"
              fill="none"
              stroke="#10b981"
              strokeOpacity="0.22"
              strokeWidth="2"
            />
            <line x1="816" y1="98" x2="735" y2="176" stroke="#10b981" strokeOpacity="0.14" strokeWidth="1" />
            <line x1="816" y1="98" x2="758" y2="176" stroke="#10b981" strokeOpacity="0.14" strokeWidth="1" />
            <line x1="816" y1="98" x2="874" y2="176" stroke="#10b981" strokeOpacity="0.14" strokeWidth="1" />
            <line x1="816" y1="98" x2="896" y2="176" stroke="#10b981" strokeOpacity="0.14" strokeWidth="1" />

            {/* Subtle illuminated windows */}
            <g fill="#34d399" className="nl-tower-light">
              <rect x="330" y="110" width="4" height="6" rx="1" />
              <rect x="340" y="110" width="4" height="6" rx="1" />
              <rect x="330" y="124" width="4" height="6" rx="1" />
              <rect x="680" y="104" width="5" height="6" rx="1" />
              <rect x="692" y="104" width="5" height="6" rx="1" />
              <rect x="680" y="118" width="5" height="6" rx="1" />
              <rect x="916" y="120" width="4" height="6" rx="1" />
              <rect x="926" y="120" width="4" height="6" rx="1" />
              <rect x="1202" y="138" width="4" height="6" rx="1" />
              <rect x="1212" y="138" width="4" height="6" rx="1" />
            </g>
            <g
              fill="#6ee7b7"
              className="nl-tower-light"
              style={{ animationDelay: '2.2s' }}
            >
              <rect x="176" y="130" width="4" height="5" rx="1" />
              <rect x="186" y="130" width="4" height="5" rx="1" />
              <rect x="504" y="132" width="4" height="5" rx="1" />
              <rect x="514" y="132" width="4" height="5" rx="1" />
              <rect x="1086" y="126" width="4" height="5" rx="1" />
              <rect x="1096" y="126" width="4" height="5" rx="1" />
            </g>
          </svg>
        </div>
      )}
    </div>
  );
};
