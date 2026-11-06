/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PetItem {
  id: string;
  name: string;
  breed: string;
  category: 'dog' | 'cat' | 'bird' | 'horse' | 'exotic';
  categoryLabel: string;
  priceNGN: number;
  traits: string[];
  desc: string;
  icon: string;
  isComingSoon: boolean;
}

export const PETS_CATALOG: PetItem[] = [
  {
    id: 'pet_boerboel',
    name: 'South African Boerboel Guardian',
    breed: 'Boerboel Mastiff',
    category: 'dog',
    categoryLabel: 'Security Dog',
    priceNGN: 450000,
    traits: ['Ferocious Estate Protector', 'Loyal to Family', 'High Courage'],
    desc: 'Top choice guard dog for Nigerian luxury compounds. Imposing 70kg muscle build that deters trespassers on sight.',
    icon: '🐕',
    isComingSoon: true,
  },
  {
    id: 'pet_caucasian',
    name: 'Caucasian Shepherd (Russian Bear Dog)',
    breed: 'Caucasian Ovcharka',
    category: 'dog',
    categoryLabel: 'Security Dog',
    priceNGN: 650000,
    traits: ['Apex Perimeter Defense', 'Massive Fur Coat', 'Fearless'],
    desc: 'Gigantic guardian breed renowned for stopping predators and intruders without hesitation.',
    icon: '🦮',
    isComingSoon: true,
  },
  {
    id: 'pet_rottweiler',
    name: 'German Rottweiler Champion Lineage',
    breed: 'Rottweiler',
    category: 'dog',
    categoryLabel: 'Security Dog',
    priceNGN: 380000,
    traits: ['Disciplined', 'Territorial Intelligence', 'Obedient'],
    desc: 'Alert, robust black-and-tan powerhouse with deep bark and military-grade guard instinct.',
    icon: '🐕‍🦺',
    isComingSoon: true,
  },
  {
    id: 'pet_german_shepherd',
    name: 'Alsatian German Shepherd Dog',
    breed: 'German Shepherd',
    category: 'dog',
    categoryLabel: 'Guard & Companion',
    priceNGN: 350000,
    traits: ['High IQ', 'Search & Rescue', 'Agile Athlete'],
    desc: 'The classic Nigerian family guardian and police-trained tracking companion.',
    icon: '🐕',
    isComingSoon: true,
  },
  {
    id: 'pet_french_bulldog',
    name: 'French Bulldog Lilac & Tan Pup',
    breed: 'French Bulldog',
    category: 'dog',
    categoryLabel: 'Toy & Companion',
    priceNGN: 950000,
    traits: ['Lekki Celebrity Pet', 'Playful & Chill', 'Apartment Friendly'],
    desc: 'Fashionable influencer pet with bat ears, velvet coat, and adorable snorting cuddles.',
    icon: '🐶',
    isComingSoon: true,
  },
  {
    id: 'pet_golden_retriever',
    name: 'Golden Retriever Purebred',
    breed: 'Golden Retriever',
    category: 'dog',
    categoryLabel: 'Family Dog',
    priceNGN: 480000,
    traits: ['Gentle Soul', 'Loves Swimming', 'Kids Best Friend'],
    desc: 'Warm golden coat and friendly demeanor that brings endless happiness to any household.',
    icon: '🐕',
    isComingSoon: true,
  },
  {
    id: 'pet_siberian_husky',
    name: 'Siberian Husky Ice-Blue Eyes',
    breed: 'Siberian Husky',
    category: 'dog',
    categoryLabel: 'Exotic Dog',
    priceNGN: 550000,
    traits: ['Vocal Howler', 'Dramatic Energy', 'AC Lover'],
    desc: 'Striking wolf-like companion that insists on sleeping under your 2HP inverter split air conditioner.',
    icon: '🐺',
    isComingSoon: true,
  },
  {
    id: 'pet_persian_cat',
    name: 'Persian White Longhair Royal Cat',
    breed: 'Persian Cat',
    category: 'cat',
    categoryLabel: 'Royal Feline',
    priceNGN: 320000,
    traits: ['Calm Aristocrat', 'Fluffy Velvet', 'Lap Lounger'],
    desc: 'Luxurious long white fur and emerald eyes, lounging gracefully on velvet sofas and marble floors.',
    icon: '🐱',
    isComingSoon: true,
  },
  {
    id: 'pet_bengal_cat',
    name: 'Bengal Leopard Print Kitten',
    breed: 'Bengal Cat',
    category: 'cat',
    categoryLabel: 'Exotic Feline',
    priceNGN: 600000,
    traits: ['Wild Rosette Markings', 'Loves Water', 'Hyperactive'],
    desc: 'Miniature domestic leopard with shimmering golden pelt and curious hunting instincts.',
    icon: '🐆',
    isComingSoon: true,
  },
  {
    id: 'pet_african_grey',
    name: 'African Grey Talking Parrot (Congo)',
    breed: 'African Grey Parrot',
    category: 'bird',
    categoryLabel: 'Avian Genius',
    priceNGN: 280000,
    traits: ['Speaks Pidgin & English', 'Mimics Whistles', 'Lives 60 Years'],
    desc: 'Super-intelligent parrot capable of holding conversations, copying phone ringtones, and greeting visitors.',
    icon: '🦜',
    isComingSoon: true,
  },
  {
    id: 'pet_arabian_horse',
    name: 'Purebred Arabian Desert Stallion',
    breed: 'Arabian Horse',
    category: 'horse',
    categoryLabel: 'Equine Royalty',
    priceNGN: 14500000,
    traits: ['Lagos Polo Club Elite', 'High Endurance', 'Graceful Stride'],
    desc: 'Prized thoroughbred stabled at Ikoyi or Kaduna Polo Grounds for weekend chukkas and ceremonial parades.',
    icon: '🐎',
    isComingSoon: true,
  },
  {
    id: 'pet_capuchin_monkey',
    name: 'Capuchin Companion Monkey',
    breed: 'Capuchin',
    category: 'exotic',
    categoryLabel: 'Exotic Pet',
    priceNGN: 1200000,
    traits: ['Opposable Thumbs', 'Mischievous Acrobat', 'High Curiosity'],
    desc: 'Social exotic pet certified with health clearance, wearing mini designer jerseys.',
    icon: '🐒',
    isComingSoon: true,
  },
];
