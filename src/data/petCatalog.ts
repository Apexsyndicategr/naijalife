/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PetItem {
  id: string;
  name: string;
  breed: string;
  species: 'Dog' | 'Cat' | 'Bird' | 'Horse' | 'Exotic';
  priceNGN: number;
  temperament: string;
  icon: string;
  status: 'COMING_SOON';
  desc: string;
}

export const PET_CATALOG: PetItem[] = [
  {
    id: 'pet_boerboel',
    name: 'South African Boerboel Mastiff',
    breed: 'Boerboel',
    species: 'Dog',
    priceNGN: 450000,
    temperament: 'Intrepid, Protective & Fiercely Loyal',
    icon: '🐕',
    status: 'COMING_SOON',
    desc: 'Heavy-muscled estate guard dog bred to safeguard compounds and deter intruders.',
  },
  {
    id: 'pet_caucasian',
    name: 'Caucasian Shepherd (Russian Bear Dog)',
    breed: 'Caucasian Ovcharka',
    species: 'Dog',
    priceNGN: 600000,
    temperament: 'Dominant, Fearless & Vigilant',
    icon: '🦮',
    status: 'COMING_SOON',
    desc: 'Immense mountain livestock guardian dog with thick fur and supreme bite force.',
  },
  {
    id: 'pet_rottweiler',
    name: 'German Pedigree Rottweiler',
    breed: 'Rottweiler',
    species: 'Dog',
    priceNGN: 350000,
    temperament: 'Alert, Obedient & Courageous',
    icon: '🐕‍🦺',
    status: 'COMING_SOON',
    desc: 'Classic Nigerian executive security dog with champion lineage and obedience training.',
  },
  {
    id: 'pet_frenchie',
    name: 'French Bulldog Lilac Fawn',
    breed: 'French Bulldog',
    species: 'Dog',
    priceNGN: 850000,
    temperament: 'Playful, Affectionate & Quiet',
    icon: '🐶',
    status: 'COMING_SOON',
    desc: 'Luxury designer lap pup popular in Ikoyi and Lekki penthouses.',
  },
  {
    id: 'pet_husky',
    name: 'Siberian Ice-Blue Eyes Husky',
    breed: 'Siberian Husky',
    species: 'Dog',
    priceNGN: 500000,
    temperament: 'Energetic, Friendly & Vocal',
    icon: '🐺',
    status: 'COMING_SOON',
    desc: 'Exotic Arctic sled dog requiring 24/7 air-conditioned bedroom luxury.',
  },
  {
    id: 'pet_persian_cat',
    name: 'Persian White Fluff Kitten',
    breed: 'Persian Longhair',
    species: 'Cat',
    priceNGN: 280000,
    temperament: 'Gentle, Calm & Sweet-Tempered',
    icon: '🐱',
    status: 'COMING_SOON',
    desc: 'Silky doll-faced indoor cat with copper eyes and docile temperament.',
  },
  {
    id: 'pet_african_grey',
    name: 'Congo African Grey Talking Parrot',
    breed: 'Psittacus erithacus',
    species: 'Bird',
    priceNGN: 420000,
    temperament: 'Genius Intelligence, Vocal & Mimic',
    icon: '🦜',
    status: 'COMING_SOON',
    desc: 'The Einstein of the bird kingdom. Capable of learning 200+ words and Pidgin phrases.',
  },
  {
    id: 'pet_arabian_stallion',
    name: 'Purebred Arabian Black Stallion',
    breed: 'Arabian Horse',
    species: 'Horse',
    priceNGN: 12000000,
    temperament: 'Majestic, Spirited & High Endurance',
    icon: '🐎',
    status: 'COMING_SOON',
    desc: 'Royal northern Durbar and Polo club competition horse with dished facial profile.',
  },
  {
    id: 'pet_capuchin',
    name: 'Tufted Capuchin Exotic Companion',
    breed: 'Cebus apella',
    species: 'Exotic',
    priceNGN: 1500000,
    temperament: 'Curious, Inquisitive & Social',
    icon: '🐒',
    status: 'COMING_SOON',
    desc: 'Agile exotic primate with prehensile tail and entertaining personality.',
  },
  {
    id: 'pet_golden_retriever',
    name: 'English Cream Golden Retriever',
    breed: 'Golden Retriever',
    species: 'Dog',
    priceNGN: 400000,
    temperament: 'Devoted, Intelligent & Gentle',
    icon: '🦮',
    status: 'COMING_SOON',
    desc: 'The quintessential loving family dog, champion swimmer, and eager companion.',
  },
];
