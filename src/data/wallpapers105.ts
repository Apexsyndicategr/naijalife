/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PhoneWallpaper {
  id: string;
  name: string;
  category: 'Luxury' | 'African' | 'Cyberpunk' | 'Nature' | 'Minimal' | 'Cosmic' | 'Gaming' | 'Vibrant';
  bgClass: string;
  previewColor: string;
  description: string;
}

// Exactly 105 distinct, high-fidelity aesthetic wallpapers
export const EXPANDED_105_WALLPAPERS: PhoneWallpaper[] = [
  // --- LUXURY & GOLD (1-15) ---
  { id: 'wp_001', name: 'Royal Onyx & 24K Gold', category: 'Luxury', bgClass: 'bg-gradient-to-br from-zinc-950 via-neutral-900 to-amber-950', previewColor: '#78350f', description: 'Polished obsidian slate with 24-karat gold dust.' },
  { id: 'wp_002', name: 'Monaco Midnight Velvet', category: 'Luxury', bgClass: 'bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950', previewColor: '#1e1b4b', description: 'Deep French Riviera midnight blue.' },
  { id: 'wp_003', name: 'Dubai Champagne Silk', category: 'Luxury', bgClass: 'bg-gradient-to-br from-stone-900 via-amber-950/60 to-yellow-950', previewColor: '#451a03', description: 'Flowing metallic champagne silk fabric.' },
  { id: 'wp_004', name: 'Platinum Obsidian', category: 'Luxury', bgClass: 'bg-gradient-to-br from-zinc-900 via-neutral-950 to-stone-900', previewColor: '#262626', description: 'Minimalist brushed platinum texture.' },
  { id: 'wp_005', name: 'Emerald Vault Royale', category: 'Luxury', bgClass: 'bg-gradient-to-br from-emerald-950 via-teal-950 to-zinc-950', previewColor: '#022c22', description: 'Imperial emerald gemstone refractions.' },
  { id: 'wp_006', name: 'Rose Gold Bouridillon', category: 'Luxury', bgClass: 'bg-gradient-to-br from-rose-950 via-pink-950 to-neutral-950', previewColor: '#4c0519', description: 'Metallic rose gold leaf on matte black.' },
  { id: 'wp_007', name: 'Imperial Roman Marble', category: 'Luxury', bgClass: 'bg-gradient-to-br from-zinc-900 via-stone-800 to-zinc-950', previewColor: '#292524', description: 'Italian Carrara veined dark marble.' },
  { id: 'wp_008', name: 'Black Diamond Prism', category: 'Luxury', bgClass: 'bg-gradient-to-br from-black via-zinc-900 to-purple-950', previewColor: '#18181b', description: 'Faceted carbonado diamond geometric facets.' },
  { id: 'wp_009', name: 'Saudi Royal Amber', category: 'Luxury', bgClass: 'bg-gradient-to-br from-amber-950 via-yellow-950 to-stone-950', previewColor: '#713f12', description: 'Warm crystalline fossil amber resin.' },
  { id: 'wp_010', name: 'Swiss Chrono Titanium', category: 'Luxury', bgClass: 'bg-gradient-to-br from-slate-900 via-zinc-900 to-zinc-950', previewColor: '#334155', description: 'Brushed Grade 5 aerospace titanium.' },
  { id: 'wp_011', name: 'Caviar Crimson Sovereign', category: 'Luxury', bgClass: 'bg-gradient-to-br from-red-950 via-rose-950 to-black', previewColor: '#450a0a', description: 'Deep red velvet with gold bezel accents.' },
  { id: 'wp_012', name: 'Banana Island Yacht Pier', category: 'Luxury', bgClass: 'bg-gradient-to-br from-cyan-950 via-blue-950 to-neutral-950', previewColor: '#083344', description: 'Lagoon waters illuminated by underwater yacht LED.' },
  { id: 'wp_013', name: 'Mayfair Executive Leather', category: 'Luxury', bgClass: 'bg-gradient-to-br from-stone-950 via-amber-950 to-zinc-950', previewColor: '#292524', description: 'Hand-stitched dark saddle cognac leather.' },
  { id: 'wp_014', name: 'Kyoto Imperial Bronze', category: 'Luxury', bgClass: 'bg-gradient-to-br from-orange-950 via-stone-900 to-zinc-950', previewColor: '#431407', description: 'Ancient patinated Japanese ceremonial bronze.' },
  { id: 'wp_015', name: 'Grand Sovereign Crown', category: 'Luxury', bgClass: 'bg-gradient-to-br from-yellow-950 via-amber-900 to-black', previewColor: '#78350f', description: 'Gilded regal heraldry and coronation luster.' },

  // --- AFRICAN HERITAGE & PRIDE (16-30) ---
  { id: 'wp_016', name: 'Lekki Tollgate Sunset', category: 'African', bgClass: 'bg-gradient-to-br from-indigo-950 via-purple-900 to-amber-700', previewColor: '#b45309', description: 'Golden hour silhouette over the Atlantic ocean.' },
  { id: 'wp_017', name: 'Afro Kente Heritage', category: 'African', bgClass: 'bg-gradient-to-br from-amber-950 via-orange-950 to-rose-950', previewColor: '#c2410c', description: 'Ashanti geometric loom weaving.' },
  { id: 'wp_018', name: 'Zuma Rock Monolith Glow', category: 'African', bgClass: 'bg-gradient-to-br from-stone-950 via-amber-950 to-orange-950', previewColor: '#451a03', description: 'The historic gateway to Abuja at dawn.' },
  { id: 'wp_019', name: 'Ancient Benin Bronze', category: 'African', bgClass: 'bg-gradient-to-br from-amber-950 via-stone-900 to-yellow-950', previewColor: '#78350f', description: 'Cast commemorative plaque of the Oba kingdom.' },
  { id: 'wp_020', name: 'Kano Dye Pits Indigo', category: 'African', bgClass: 'bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-950', previewColor: '#1e1b4b', description: '500-year-old Kofar Mata natural indigo dye.' },
  { id: 'wp_021', name: 'Calabar Carnival Radiance', category: 'African', bgClass: 'bg-gradient-to-br from-fuchsia-950 via-rose-900 to-amber-700', previewColor: '#701a75', description: 'Vibrant festival masquerade feathers and beads.' },
  { id: 'wp_022', name: 'Aso Rock Presidential Twilight', category: 'African', bgClass: 'bg-gradient-to-br from-zinc-950 via-emerald-950 to-stone-900', previewColor: '#064e3b', description: 'Federal Capital territory granite crest at dusk.' },
  { id: 'wp_023', name: 'Yoruba Adire Royal Blue', category: 'African', bgClass: 'bg-gradient-to-br from-indigo-950 via-sky-950 to-blue-900', previewColor: '#1e1b4b', description: 'Resist-dyed indigo textile swirl.' },
  { id: 'wp_024', name: 'Igbo Ukwu Bronze Spiral', category: 'African', bgClass: 'bg-gradient-to-br from-orange-950 via-amber-900 to-stone-950', previewColor: '#7c2d12', description: '9th-century roped pot casting artistry.' },
  { id: 'wp_025', name: 'Sahel Savannah Sundown', category: 'African', bgClass: 'bg-gradient-to-br from-amber-900 via-orange-950 to-red-950', previewColor: '#9a3412', description: 'Acacia trees against northern sunset horizon.' },
  { id: 'wp_026', name: 'Third Mainland Bridge Lights', category: 'African', bgClass: 'bg-gradient-to-br from-slate-950 via-blue-950 to-teal-950', previewColor: '#0f172a', description: '11.8 km bridge transit streaming headlights.' },
  { id: 'wp_027', name: 'Niger-Benue Confluence Lokoja', category: 'African', bgClass: 'bg-gradient-to-br from-teal-950 via-cyan-950 to-emerald-950', previewColor: '#065f46', description: 'Meeting of muddy green and clear blue waters.' },
  { id: 'wp_028', name: 'Eyo Masquerade Pristine White', category: 'African', bgClass: 'bg-gradient-to-br from-stone-900 via-zinc-800 to-neutral-900', previewColor: '#262626', description: 'Opambata staff and white drapery tradition.' },
  { id: 'wp_029', name: 'Port Harcourt Oil City Flare', category: 'African', bgClass: 'bg-gradient-to-br from-red-950 via-amber-950 to-black', previewColor: '#7f1d1d', description: 'Niger Delta industrial evening silhouettes.' },
  { id: 'wp_030', name: 'Hausa Architecture Ribs', category: 'African', bgClass: 'bg-gradient-to-br from-amber-950 via-stone-800 to-yellow-950', previewColor: '#713f12', description: 'Northern ornate engraved clay earth walls.' },

  // --- CYBERPUNK & NEON (31-45) ---
  { id: 'wp_031', name: 'Abuja Cyberpunk 2077', category: 'Cyberpunk', bgClass: 'bg-gradient-to-br from-teal-950 via-cyan-900 to-sky-950', previewColor: '#0369a1', description: 'Neon grid lines tracing the National Mosque.' },
  { id: 'wp_032', name: 'Tokyo Shinjuku Matrix', category: 'Cyberpunk', bgClass: 'bg-gradient-to-br from-emerald-950 via-zinc-950 to-cyan-950', previewColor: '#022c22', description: 'Cascading kanji code streams in jade green.' },
  { id: 'wp_033', name: 'Lagos Neon Underpass', category: 'Cyberpunk', bgClass: 'bg-gradient-to-br from-fuchsia-950 via-violet-950 to-black', previewColor: '#4a044e', description: 'Ojuelegba flyover illuminated with pink laser.' },
  { id: 'wp_034', name: 'Synthesizer Horizon 1984', category: 'Cyberpunk', bgClass: 'bg-gradient-to-br from-purple-950 via-rose-950 to-amber-950', previewColor: '#581c87', description: 'Retrowave sun setting on wireframe plane.' },
  { id: 'wp_035', name: 'Cybernetic HUD Overdrive', category: 'Cyberpunk', bgClass: 'bg-gradient-to-br from-cyan-950 via-sky-950 to-blue-950', previewColor: '#0e7490', description: 'Heads-up tactical targeting interface.' },
  { id: 'wp_036', name: 'Quantum Core Reactor', category: 'Cyberpunk', bgClass: 'bg-gradient-to-br from-violet-950 via-blue-950 to-zinc-950', previewColor: '#3b0764', description: 'Pulsing fusion chamber plasma filament.' },
  { id: 'wp_037', name: 'Blade Runner Rainy Alley', category: 'Cyberpunk', bgClass: 'bg-gradient-to-br from-slate-950 via-zinc-900 to-blue-950', previewColor: '#020617', description: 'Wet asphalt reflecting neon ramen signs.' },
  { id: 'wp_038', name: 'Laser Grid Velocity', category: 'Cyberpunk', bgClass: 'bg-gradient-to-br from-rose-950 via-red-950 to-zinc-950', previewColor: '#881337', description: 'High-speed fiber optic data highway.' },
  { id: 'wp_039', name: 'Night City Overlook', category: 'Cyberpunk', bgClass: 'bg-gradient-to-br from-yellow-950 via-purple-950 to-black', previewColor: '#4c1d95', description: 'Megastructure skyline under heavy acid rain.' },
  { id: 'wp_040', name: 'Silicon Yaba Circuitry', category: 'Cyberpunk', bgClass: 'bg-gradient-to-br from-emerald-950 via-black to-teal-900', previewColor: '#064e3b', description: 'Microchip motherboard copper heat pipes.' },
  { id: 'wp_041', name: 'Holographic Voxel Mesh', category: 'Cyberpunk', bgClass: 'bg-gradient-to-br from-cyan-950 via-indigo-950 to-black', previewColor: '#164e63', description: '3D polygonal avatar rendering wireframe.' },
  { id: 'wp_042', name: 'Solarpunk Victoria Island', category: 'Cyberpunk', bgClass: 'bg-gradient-to-br from-lime-950 via-emerald-950 to-teal-950', previewColor: '#14532d', description: 'Living skyscraper gardens and clean kinetic glass.' },
  { id: 'wp_043', name: 'Neon Glitch Artifacts', category: 'Cyberpunk', bgClass: 'bg-gradient-to-br from-pink-950 via-zinc-950 to-blue-950', previewColor: '#500724', description: 'Chromatic aberration scanline distortions.' },
  { id: 'wp_044', name: 'Dark Web Data Breach', category: 'Cyberpunk', bgClass: 'bg-gradient-to-br from-emerald-950 via-black to-zinc-950', previewColor: '#052e16', description: 'Encrypted hexadecimal terminal flow.' },
  { id: 'wp_045', name: 'Vaporwave Sunset Palms', category: 'Cyberpunk', bgClass: 'bg-gradient-to-br from-fuchsia-950 via-cyan-950 to-purple-950', previewColor: '#701a75', description: 'Pastel magenta and cyan gradient dusk.' },

  // --- NATURE & CANADIAN LANDSCAPES (46-60) ---
  { id: 'wp_046', name: 'Banff Moraine Lake Turquoise', category: 'Nature', bgClass: 'bg-gradient-to-br from-cyan-950 via-teal-900 to-blue-950', previewColor: '#115e59', description: 'Glacial rock flour blue water under Canadian Rockies.' },
  { id: 'wp_047', name: 'Whistler Alpine Aurora', category: 'Nature', bgClass: 'bg-gradient-to-br from-emerald-950 via-green-950 to-slate-950', previewColor: '#052e16', description: 'Northern lights dancing over snowy fir pine peaks.' },
  { id: 'wp_048', name: 'Atlantic Marina Emerald', category: 'Nature', bgClass: 'bg-gradient-to-br from-emerald-950 via-teal-900 to-cyan-950', previewColor: '#047857', description: 'Calm ocean yacht harbor waters at morning.' },
  { id: 'wp_049', name: 'Niagara Falls Mist Rainbow', category: 'Nature', bgClass: 'bg-gradient-to-br from-blue-950 via-sky-900 to-teal-950', previewColor: '#0369a1', description: 'Massive roaring horseshoe waterfall vapor.' },
  { id: 'wp_050', name: 'Vancouver Pacific Rainforest', category: 'Nature', bgClass: 'bg-gradient-to-br from-green-950 via-emerald-950 to-stone-950', previewColor: '#064e3b', description: 'Centuries-old mossy Douglas fir forest canopy.' },
  { id: 'wp_051', name: 'Yankari Game Reserve Warm Spring', category: 'Nature', bgClass: 'bg-gradient-to-br from-teal-950 via-cyan-900 to-emerald-950', previewColor: '#0f766e', description: 'Crystal-clear 31°C Wikki spring flowing through palms.' },
  { id: 'wp_052', name: 'Obudu Mountain Cattle Plateau', category: 'Nature', bgClass: 'bg-gradient-to-br from-slate-950 via-emerald-950 to-stone-900', previewColor: '#064e3b', description: 'Misty cloud forest and rolling green highland hills.' },
  { id: 'wp_053', name: 'Ontario Autumn Maple Flame', category: 'Nature', bgClass: 'bg-gradient-to-br from-red-950 via-orange-950 to-amber-950', previewColor: '#7f1d1d', description: 'Crimson and fiery sugar maple leaf canopy.' },
  { id: 'wp_054', name: 'Gurara Waterfalls Torrent', category: 'Nature', bgClass: 'bg-gradient-to-br from-blue-950 via-teal-950 to-stone-950', previewColor: '#1e3a8a', description: 'Thunderous Niger state fresh water falls.' },
  { id: 'wp_055', name: 'Yukon Midnight Sun', category: 'Nature', bgClass: 'bg-gradient-to-br from-amber-950 via-rose-950 to-indigo-950', previewColor: '#831843', description: 'Summer sun never dipping below the Arctic horizon.' },
  { id: 'wp_056', name: 'Osun Sacred Grove Canopy', category: 'Nature', bgClass: 'bg-gradient-to-br from-emerald-950 via-stone-950 to-green-950', previewColor: '#022c22', description: 'Ancient UNESCO shrine river trees and ferns.' },
  { id: 'wp_057', name: 'Peggy Cove Granite Lighthouse', category: 'Nature', bgClass: 'bg-gradient-to-br from-slate-950 via-blue-950 to-stone-900', previewColor: '#0f172a', description: 'Crashing North Atlantic surf on Nova Scotia rocks.' },
  { id: 'wp_058', name: 'Ogbunike Caves Mystery Cavern', category: 'Nature', bgClass: 'bg-gradient-to-br from-stone-950 via-zinc-900 to-neutral-950', previewColor: '#1c1917', description: 'Subterranean tunnels carved into Anambra sandstone.' },
  { id: 'wp_059', name: 'Jasper Dark Sky Preserve', category: 'Nature', bgClass: 'bg-gradient-to-br from-black via-slate-950 to-blue-950', previewColor: '#020617', description: 'Zero light pollution Milky Way arch above glaciers.' },
  { id: 'wp_060', name: 'Bar Beach Atlantic Tide', category: 'Nature', bgClass: 'bg-gradient-to-br from-blue-950 via-cyan-950 to-slate-950', previewColor: '#172554', description: 'Rolling foam and saltwater breaking on golden sands.' },

  // --- MINIMAL & MATTE (61-75) ---
  { id: 'wp_061', name: 'Matte Obsidian Stealth', category: 'Minimal', bgClass: 'bg-gradient-to-b from-black via-zinc-950 to-black', previewColor: '#09090b', description: 'Pure stealth anti-glare OLED black.' },
  { id: 'wp_062', name: 'Gunmetal Gray Precision', category: 'Minimal', bgClass: 'bg-gradient-to-br from-zinc-900 via-neutral-900 to-stone-900', previewColor: '#27272a', description: 'Industrial sandblasted aluminum finish.' },
  { id: 'wp_063', name: 'Graphite Ceramic S24', category: 'Minimal', bgClass: 'bg-gradient-to-br from-neutral-900 via-zinc-950 to-neutral-950', previewColor: '#171717', description: 'Sleek ceramic backplate texture.' },
  { id: 'wp_064', name: 'Midnight Charcoal Weave', category: 'Minimal', bgClass: 'bg-gradient-to-br from-stone-950 via-zinc-900 to-black', previewColor: '#1c1917', description: 'Subtle woven carbon fiber diagonal pattern.' },
  { id: 'wp_065', name: 'Dark Frosted Glass', category: 'Minimal', bgClass: 'bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-950', previewColor: '#1e293b', description: 'Diffused frosted glass with soft sheen.' },
  { id: 'wp_066', name: 'Titanium Gray iPhone 16', category: 'Minimal', bgClass: 'bg-gradient-to-br from-stone-800 via-zinc-900 to-stone-950', previewColor: '#44403c', description: 'Natural desert titanium alloy tone.' },
  { id: 'wp_067', name: 'Pitch Black Monolith', category: 'Minimal', bgClass: 'bg-black', previewColor: '#000000', description: 'Zero emission deep black battery saver.' },
  { id: 'wp_068', name: 'Subtle Slate Horizon', category: 'Minimal', bgClass: 'bg-gradient-to-t from-slate-950 to-slate-900', previewColor: '#0f172a', description: 'Gentle vertical gradient of deep slate.' },
  { id: 'wp_069', name: 'Espresso Roast Leather', category: 'Minimal', bgClass: 'bg-gradient-to-br from-stone-950 via-neutral-900 to-amber-950', previewColor: '#292524', description: 'Dark roasted coffee bean warmth.' },
  { id: 'wp_070', name: 'Smoky Quartz Facet', category: 'Minimal', bgClass: 'bg-gradient-to-br from-zinc-900 via-stone-950 to-zinc-950', previewColor: '#18181b', description: 'Translucent mineral crystal layers.' },
  { id: 'wp_071', name: 'Deep Space Gray Pro', category: 'Minimal', bgClass: 'bg-gradient-to-br from-neutral-800 via-neutral-900 to-black', previewColor: '#262626', description: 'Iconic flagship executive gray tone.' },
  { id: 'wp_072', name: 'Matte Forest Night', category: 'Minimal', bgClass: 'bg-gradient-to-br from-emerald-950 via-zinc-950 to-black', previewColor: '#022c22', description: 'Extremely muted dark British racing green.' },
  { id: 'wp_073', name: 'Midnight Navy Commander', category: 'Minimal', bgClass: 'bg-gradient-to-br from-blue-950 via-zinc-950 to-black', previewColor: '#172554', description: 'Deep sovereign naval uniform blue.' },
  { id: 'wp_074', name: 'Black Sand Iceland', category: 'Minimal', bgClass: 'bg-gradient-to-b from-stone-900 to-black', previewColor: '#1c1917', description: 'Volcanic basalt beach particles.' },
  { id: 'wp_075', name: 'Brushed Tungsten Heavy', category: 'Minimal', bgClass: 'bg-gradient-to-br from-zinc-800 via-zinc-950 to-stone-900', previewColor: '#3f3f46', description: 'High density dense metal grain.' },

  // --- COSMIC & SPACE (76-90) ---
  { id: 'wp_076', name: 'Deep Space Nebula Hubble', category: 'Cosmic', bgClass: 'bg-gradient-to-br from-violet-950 via-fuchsia-950 to-slate-950', previewColor: '#6d28d9', description: 'Stellar nursery glowing in ionized gases.' },
  { id: 'wp_077', name: 'James Webb Cosmic Cliffs', category: 'Cosmic', bgClass: 'bg-gradient-to-br from-amber-950 via-orange-950 to-indigo-950', previewColor: '#7c2d12', description: 'Carina Nebula cosmic dust mountains.' },
  { id: 'wp_078', name: 'Andromeda Spiral Core', category: 'Cosmic', bgClass: 'bg-gradient-to-br from-blue-950 via-purple-950 to-black', previewColor: '#3b0764', description: 'Trillion-star galaxy galactic center.' },
  { id: 'wp_079', name: 'Black Hole Event Horizon', category: 'Cosmic', bgClass: 'bg-gradient-to-br from-amber-900 via-black to-zinc-950', previewColor: '#451a03', description: 'Gravitational lensing ring of fire.' },
  { id: 'wp_080', name: 'Supernova Remnant Veil', category: 'Cosmic', bgClass: 'bg-gradient-to-br from-cyan-950 via-rose-950 to-black', previewColor: '#164e63', description: 'Exploded star filament expanding in shockwave.' },
  { id: 'wp_081', name: 'Pillars of Creation', category: 'Cosmic', bgClass: 'bg-gradient-to-br from-stone-950 via-amber-950 to-sky-950', previewColor: '#451a03', description: 'Eagle Nebula towering interstellar columns.' },
  { id: 'wp_082', name: 'Orion Stellar Nursery', category: 'Cosmic', bgClass: 'bg-gradient-to-br from-pink-950 via-indigo-950 to-black', previewColor: '#831843', description: 'Ultraviolet ionization of newborn suns.' },
  { id: 'wp_083', name: 'Saturn Rings Edge-On', category: 'Cosmic', bgClass: 'bg-gradient-to-br from-amber-950 via-zinc-900 to-black', previewColor: '#78350f', description: 'Ice particles casting shadows across gas bands.' },
  { id: 'wp_084', name: 'Jupiter Great Red Spot', category: 'Cosmic', bgClass: 'bg-gradient-to-br from-orange-950 via-red-950 to-amber-950', previewColor: '#7c2d12', description: 'Giant anti-cyclonic planetary storm vortex.' },
  { id: 'wp_085', name: 'Lunar Eclipse Blood Moon', category: 'Cosmic', bgClass: 'bg-gradient-to-br from-red-950 via-rose-950 to-black', previewColor: '#450a0a', description: 'Earth atmosphere scattering crimson sunlight.' },
  { id: 'wp_086', name: 'Pulsar Beam Gamma Ray', category: 'Cosmic', bgClass: 'bg-gradient-to-br from-sky-950 via-blue-900 to-black', previewColor: '#0369a1', description: 'Rotating neutron star radiation lighthouse.' },
  { id: 'wp_087', name: 'Solar Corona Eclipse Flare', category: 'Cosmic', bgClass: 'bg-gradient-to-br from-yellow-950 via-amber-950 to-black', previewColor: '#713f12', description: 'Magnetic field loops arching into deep vacuum.' },
  { id: 'wp_088', name: 'Interstellar Voyager Voyage', category: 'Cosmic', bgClass: 'bg-gradient-to-br from-slate-950 via-black to-zinc-950', previewColor: '#020617', description: 'Pale blue dot fading into dark infinity.' },
  { id: 'wp_089', name: 'Milky Way Galactic Arch', category: 'Cosmic', bgClass: 'bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950', previewColor: '#312e81', description: 'Stellar band sweeping across night sky.' },
  { id: 'wp_090', name: 'Meteor Shower Zenith', category: 'Cosmic', bgClass: 'bg-gradient-to-br from-blue-950 via-cyan-950 to-black', previewColor: '#083344', description: 'Perseid shooting stars burning in ionosphere.' },

  // --- VIBRANT & ABSTRACT MODERN (91-105) ---
  { id: 'wp_091', name: 'Afrobeats Frequency Waves', category: 'Vibrant', bgClass: 'bg-gradient-to-br from-amber-500 via-rose-600 to-purple-800', previewColor: '#d97706', description: 'High-energy audio visualizer sound waves.' },
  { id: 'wp_092', name: 'Lagos Energy Electric Yellow', category: 'Vibrant', bgClass: 'bg-gradient-to-br from-yellow-500 via-amber-600 to-orange-700', previewColor: '#eab308', description: 'Iconic Danfo yellow bus speed and hustle.' },
  { id: 'wp_093', name: 'Atlantic Ocean Teal Wave', category: 'Vibrant', bgClass: 'bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-700', previewColor: '#0d9488', description: 'Refreshing coastal breakers and sea foam.' },
  { id: 'wp_094', name: 'Crimson Velvet Royale', category: 'Vibrant', bgClass: 'bg-gradient-to-br from-rose-600 via-red-700 to-rose-950', previewColor: '#e11d48', description: 'Passionate and fiery royal silk folds.' },
  { id: 'wp_095', name: 'Neon Purple Cyber Bloom', category: 'Vibrant', bgClass: 'bg-gradient-to-br from-purple-600 via-fuchsia-700 to-indigo-950', previewColor: '#9333ea', description: 'Electric violet and magenta neon blossoms.' },
  { id: 'wp_096', name: 'Super Eagles Green Pride', category: 'Vibrant', bgClass: 'bg-gradient-to-br from-emerald-600 via-green-700 to-emerald-950', previewColor: '#059669', description: 'National football team emerald victory jersey.' },
  { id: 'wp_097', name: 'Miami Vice Tropical Pink', category: 'Vibrant', bgClass: 'bg-gradient-to-br from-pink-500 via-rose-600 to-cyan-700', previewColor: '#db2777', description: 'Sun-drenched palm silhouettes and pastels.' },
  { id: 'wp_098', name: 'Golden Hour Sahara Gold', category: 'Vibrant', bgClass: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700', previewColor: '#f59e0b', description: 'Warm shimmering dunes under evening glow.' },
  { id: 'wp_099', name: 'Hyperdrive Warp Tunnel', category: 'Vibrant', bgClass: 'bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-900', previewColor: '#06b6d4', description: 'Faster-than-light starlight streaking past.' },
  { id: 'wp_100', name: 'Volcanic Magma Fissure', category: 'Vibrant', bgClass: 'bg-gradient-to-br from-red-600 via-orange-600 to-amber-900', previewColor: '#dc2626', description: 'Glowing molten earth fracturing dark rock.' },
  { id: 'wp_101', name: 'Ultraviolet Prism Spectrum', category: 'Vibrant', bgClass: 'bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600', previewColor: '#6366f1', description: 'Refracted rainbow crystal light diffraction.' },
  { id: 'wp_102', name: 'Acid Green Turbo Glitch', category: 'Vibrant', bgClass: 'bg-gradient-to-br from-lime-500 via-emerald-600 to-teal-900', previewColor: '#84cc16', description: 'High voltage kinetic energy accelerator.' },
  { id: 'wp_103', name: 'Maple Leaf Canadian Autumn', category: 'Vibrant', bgClass: 'bg-gradient-to-br from-red-600 via-rose-700 to-stone-900', previewColor: '#e11d48', description: 'Bright Canadian national emblem scarlet red.' },
  { id: 'wp_104', name: 'Cobalt Blue Racing Stripe', category: 'Vibrant', bgClass: 'bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-950', previewColor: '#2563eb', description: 'Aerodynamic twin racing stripes on carbon.' },
  { id: 'wp_105', name: 'Pure Diamond Refraction', category: 'Vibrant', bgClass: 'bg-gradient-to-br from-cyan-300 via-sky-500 to-indigo-950', previewColor: '#38bdf8', description: '58-facet brilliant cut diamond sparkle.' },
];

/**
 * Returns the default unique wallpaper for each phone model
 */
export function getDefaultWallpaperForPhoneModel(model: string = ''): string {
  const m = model.toLowerCase();
  if (m.includes('xiaomi_18') || m.includes('xiaomi') || m.includes('18')) return 'wp_031'; // Cyberpunk
  if (m.includes('iphone_16') || m.includes('iphone_17') || m.includes('iphone')) return 'wp_066'; // Titanium Gray
  if (m.includes('s24') || m.includes('s25') || m.includes('samsung') || m.includes('fold')) return 'wp_063'; // Graphite Ceramic
  if (m.includes('pixel')) return 'wp_046'; // Banff Moraine
  if (m.includes('tecno') || m.includes('phantom')) return 'wp_017'; // Afro Kente
  if (m.includes('infinix')) return 'wp_091'; // Afrobeats Frequency
  if (m.includes('oneplus')) return 'wp_011'; // Caviar Crimson
  return 'wp_001'; // Royal Onyx
}
