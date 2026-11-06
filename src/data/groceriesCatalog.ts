/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GroceryItem {
  id: string;
  name: string;
  category: 'Grains & Staples' | 'Meats & Seafood' | 'Oils & Seasoning' | 'Dairy & Breakfast' | 'Fresh Produce' | 'Packaged Foods' | 'Beverages' | 'Household';
  priceNGN: number;
  unit: string;
  hungerRestore: number;
  icon: string;
  desc: string;
}

export const GROCERIES_100_CATALOG: GroceryItem[] = [
  // 1-15: GRAINS & STAPLES
  { id: 'groc_rice_50kg_foreign', name: '50kg Bag of Foreign Parboiled Rice (Caprice/Royal Stallion)', category: 'Grains & Staples', priceNGN: 82000, unit: '50kg Bag', hungerRestore: 50, icon: '🌾', desc: 'Premium long-grain imported rice with stone-free milling.' },
  { id: 'groc_rice_50kg_local', name: '50kg Bag of Nigerian Abakaliki De-stoned Rice', category: 'Grains & Staples', priceNGN: 68000, unit: '50kg Bag', hungerRestore: 48, icon: '🌾', desc: 'Locally grown sweet nutritious long-grain parboiled rice.' },
  { id: 'groc_rice_25kg', name: '25kg Mama Gold Parboiled Rice Bag', category: 'Grains & Staples', priceNGN: 42000, unit: '25kg Bag', hungerRestore: 40, icon: '🍚', desc: 'Family-size bag of clean parboiled rice.' },
  { id: 'groc_semovita_10kg', name: 'Golden Penny Semovita 10kg Bag', category: 'Grains & Staples', priceNGN: 13500, unit: '10kg Bag', hungerRestore: 35, icon: '🥣', desc: 'Fortified wheat swallow with smooth texture.' },
  { id: 'groc_flour_50kg', name: 'Mama Gold Premium Baking Flour 50kg', category: 'Grains & Staples', priceNGN: 58000, unit: '50kg Bag', hungerRestore: 40, icon: '🍞', desc: 'High-gluten baking flour for bread, cakes and puff-puff.' },
  { id: 'groc_garri_ijebu', name: 'Paint Bucket of Crispy White Ijebu Garri', category: 'Grains & Staples', priceNGN: 5200, unit: '4-Litre Paint Bucket', hungerRestore: 25, icon: '🥣', desc: 'Sour and crunchy Ijebu garri, perfect for soaking with ice water & groundnuts.' },
  { id: 'groc_garri_yellow', name: 'Paint Bucket of Bendel Yellow Garri with Palm Oil', category: 'Grains & Staples', priceNGN: 5800, unit: '4-Litre Paint Bucket', hungerRestore: 26, icon: '🥣', desc: 'Traditional yellow garri, ideal for smooth eba swallow.' },
  { id: 'groc_yam_benue_large', name: 'Benue Big Heavyweight Yam Tuber', category: 'Grains & Staples', priceNGN: 3800, unit: '1 Large Tuber', hungerRestore: 28, icon: '🥔', desc: 'Mealy, sweet Benue yam for pounding or boiling.' },
  { id: 'groc_yam_bundle', name: 'Bundle of 5 Large Benue Tubers of Yam', category: 'Grains & Staples', priceNGN: 18000, unit: 'Bundle of 5', hungerRestore: 45, icon: '🥔', desc: 'Wholesale bundle of fresh Benue harvest yams.' },
  { id: 'groc_beans_oloyin', name: 'Paint Bucket of Honey Sweet Oloyin Beans', category: 'Grains & Staples', priceNGN: 8500, unit: '4-Litre Paint Bucket', hungerRestore: 32, icon: '🫘', desc: 'Soft-cooking naturally sweet brown honey beans.' },
  { id: 'groc_beans_50kg', name: '50kg Bag of Big Bull Brown Beans', category: 'Grains & Staples', priceNGN: 75000, unit: '50kg Bag', hungerRestore: 50, icon: '🫘', desc: 'Wholesale bag of iron-rich brown beans from Maiduguri.' },
  { id: 'groc_elubo_amala', name: 'Elubo Isu Yam Flour for Fluffy Black Amala (5kg)', category: 'Grains & Staples', priceNGN: 7500, unit: '5kg Pack', hungerRestore: 30, icon: '🥣', desc: 'Authentic sun-dried Oyo yam flour for smooth amala.' },
  { id: 'groc_tuwo_shinkafa', name: 'Polished Tuwo Rice Swallow Flour (5kg)', category: 'Grains & Staples', priceNGN: 6800, unit: '5kg Pack', hungerRestore: 28, icon: '🍚', desc: 'Northern style soft tuwo shinkafa swallow.' },
  { id: 'groc_wheat_meal_5kg', name: 'Golden Penny Whole Wheat Meal (5kg)', category: 'Grains & Staples', priceNGN: 7200, unit: '5kg Bag', hungerRestore: 28, icon: '🌾', desc: 'High-fibre nutritious whole wheat swallow.' },
  { id: 'groc_corn_flour', name: 'White Maize Corn Starch Flour (Ogi/Pap Base 5kg)', category: 'Grains & Staples', priceNGN: 4500, unit: '5kg Pack', hungerRestore: 22, icon: '🌽', desc: 'Fermented white cornmeal for traditional hot breakfast pap.' },

  // 16-30: MEATS & SEAFOOD
  { id: 'groc_chicken_lap_carton', name: 'Carton of Imported Frozen Chicken Laps (10kg)', category: 'Meats & Seafood', priceNGN: 36000, unit: '10kg Carton', hungerRestore: 45, icon: '🍗', desc: 'Tender, juicy chicken thigh quarters for stew and grilling.' },
  { id: 'groc_turkey_wings_carton', name: 'Carton of Jumbo Frozen Turkey Wings (10kg)', category: 'Meats & Seafood', priceNGN: 45000, unit: '10kg Carton', hungerRestore: 48, icon: '🍗', desc: 'Thick fleshy turkey wings, perfect for peppered turkey party chops.' },
  { id: 'groc_titus_fish_carton', name: 'Carton of Original Norwegian Titus/Mackerel Fish (20kg)', category: 'Meats & Seafood', priceNGN: 58000, unit: '20kg Carton', hungerRestore: 50, icon: '🐟', desc: 'Omega-3 rich whole mackerel fish with shiny blue skin.' },
  { id: 'groc_croaker_carton', name: 'Carton of Sea Croaker Fish (10kg)', category: 'Meats & Seafood', priceNGN: 48000, unit: '10kg Carton', hungerRestore: 46, icon: '🐟', desc: 'Prime Atlantic white-fleshed croaker fish for fisherman soup.' },
  { id: 'groc_fresh_beef_boneless', name: 'Fresh Boneless Prime Beef Cuts (3kg)', category: 'Meats & Seafood', priceNGN: 16500, unit: '3kg Pack', hungerRestore: 38, icon: '🥩', desc: 'Daily butchered fresh tender beef chunks for jollof rice stew.' },
  { id: 'groc_goat_meat_cuts', name: 'Fresh Goat Meat (Asun & Pepper Soup Cut 3kg)', category: 'Meats & Seafood', priceNGN: 21000, unit: '3kg Pack', hungerRestore: 40, icon: '🐐', desc: 'Flavourful goat cuts with tender skin for party asun.' },
  { id: 'groc_cow_leg_kpomo', name: 'Cow Leg, Shaki & Soft White Kpomo Cowskin (3kg)', category: 'Meats & Seafood', priceNGN: 13500, unit: '3kg Pack', hungerRestore: 32, icon: '🍲', desc: 'Essential traditional soup assortment of honeycomb tripe and cow leg.' },
  { id: 'groc_snails_giant', name: 'De-shelled Jumbo Giant African Land Snails (10 pcs)', category: 'Meats & Seafood', priceNGN: 18000, unit: 'Pack of 10', hungerRestore: 36, icon: '🐌', desc: 'Crunchy washed snails, ready for spicy peppered snail appetisers.' },
  { id: 'groc_smoked_catfish', name: 'Oven-Dried Smoked Catfish (Pack of 6 Large)', category: 'Meats & Seafood', priceNGN: 9500, unit: 'Pack of 6', hungerRestore: 28, icon: '🐟', desc: 'Aromatic wood-smoked catfish that melts into native egusi soup.' },
  { id: 'groc_stockfish_head', name: 'Norwegian Cod Stockfish Head (Okporoko 1kg)', category: 'Meats & Seafood', priceNGN: 16000, unit: '1kg Bag', hungerRestore: 30, icon: '🐟', desc: 'Authentic imported stockfish head with rich savory aroma.' },
  { id: 'groc_crayfish_oron', name: 'Paint Bucket of Red Sun-Dried Oron Crayfish', category: 'Meats & Seafood', priceNGN: 9500, unit: '4-Litre Paint Bucket', hungerRestore: 25, icon: '🦐', desc: 'Sand-free red coastal crayfish that gives soups unmatched umami.' },
  { id: 'groc_tiger_prawns', name: 'Frozen Jumbo Atlantic Tiger Prawns (1kg Pack)', category: 'Meats & Seafood', priceNGN: 14500, unit: '1kg Pack', hungerRestore: 32, icon: '🦐', desc: 'Sweet, meaty sea prawns for fried rice and pasta.' },
  { id: 'groc_dry_mangala', name: 'Lake Chad Dry Mangala Fish (10 pieces)', category: 'Meats & Seafood', priceNGN: 12500, unit: 'Pack of 10', hungerRestore: 28, icon: '🐟', desc: 'Northern smoked river fish with distinctive deep flavour.' },
  { id: 'groc_eggs_crate', name: 'Crate of Large Farm Fresh Brown Table Eggs (30 eggs)', category: 'Meats & Seafood', priceNGN: 4800, unit: 'Crate of 30', hungerRestore: 30, icon: '🥚', desc: 'Farm-fresh nutritious eggs for frying or baking.' },
  { id: 'groc_sardines_carton', name: 'Carton of Original Titus Sardines (50 cans)', category: 'Meats & Seafood', priceNGN: 38000, unit: '50-Can Carton', hungerRestore: 42, icon: '🥫', desc: 'Wild sardines packed in pure vegetable oil with spicy chili.' },

  // 31-45: OILS & SEASONING
  { id: 'groc_oil_kings_25l', name: '25-Litre Keg of Kings Pure Vegetable Cooking Oil', category: 'Oils & Seasoning', priceNGN: 42000, unit: '25L Keg', hungerRestore: 30, icon: '🛢️', desc: 'Cholesterol-free refined vegetable oil for all deep frying.' },
  { id: 'groc_oil_mamador_5l', name: '5-Litre Gallon of Mamador Pure Vegetable Oil', category: 'Oils & Seasoning', priceNGN: 11500, unit: '5L Gallon', hungerRestore: 20, icon: '🧴', desc: 'Fortified with Vitamin A for clear, smoke-free cooking.' },
  { id: 'groc_palm_oil_25l', name: '25-Litre Keg of Eastern First-Press Red Palm Oil', category: 'Oils & Seasoning', priceNGN: 36000, unit: '25L Keg', hungerRestore: 30, icon: '🛢️', desc: 'Unadulterated deep red palm oil with sweet natural palm scent.' },
  { id: 'groc_palm_oil_5l', name: '5-Litre Gallon of Pure Eastern Palm Oil', category: 'Oils & Seasoning', priceNGN: 8500, unit: '5L Gallon', hungerRestore: 18, icon: '🧴', desc: 'Thick, sediment-free palm oil for rich traditional soups.' },
  { id: 'groc_tomato_gino_carton', name: 'Carton of Gino Pepper & Onion Sachet Tomato Paste (50 sachets)', category: 'Oils & Seasoning', priceNGN: 12500, unit: 'Carton of 50', hungerRestore: 25, icon: '🥫', desc: 'Rich red tomato puree with built-in onions and pepper blend.' },
  { id: 'groc_knorr_chicken', name: 'Knorr Chicken Seasoning Cubes (Pack of 50 cubes)', category: 'Oils & Seasoning', priceNGN: 2200, unit: 'Pack of 50', hungerRestore: 15, icon: '🧂', desc: 'Rich chicken broth flavour booster for all Nigerian dishes.' },
  { id: 'groc_maggi_star', name: 'Maggi Star Seasoning Cubes (Pack of 100 cubes)', category: 'Oils & Seasoning', priceNGN: 2600, unit: 'Pack of 100', hungerRestore: 15, icon: '🧂', desc: 'The classic Nigerian star bouillon cube for authentic home cooking.' },
  { id: 'groc_mr_chef_salt', name: 'Mr. Chef Refined Iodized Table Salt (1kg Bag)', category: 'Oils & Seasoning', priceNGN: 800, unit: '1kg Bag', hungerRestore: 10, icon: '🧂', desc: 'Free-flowing white iodized table salt.' },
  { id: 'groc_curry_thyme_set', name: 'Ducros Curry Powder & Thyme Seasoning Jars (Set of 2)', category: 'Oils & Seasoning', priceNGN: 2800, unit: 'Set of 2 Jars', hungerRestore: 12, icon: '🌿', desc: 'The aromatic backbone of authentic Nigerian jollof rice.' },
  { id: 'groc_suya_pepper', name: 'Yaji Suya Spiced Ground Pepper Blend (500g Jar)', category: 'Oils & Seasoning', priceNGN: 3200, unit: '500g Jar', hungerRestore: 14, icon: '🌶️', desc: 'Spiced roasted peanut powder with chili, ginger, and garlic.' },
  { id: 'groc_egusi_seeds', name: 'Paint Bucket of Machine-Peeled Egusi Melon Seeds', category: 'Oils & Seasoning', priceNGN: 8500, unit: '4-Litre Paint Bucket', hungerRestore: 26, icon: '🥣', desc: 'Hand-picked white melon seeds, ready to blend for rich egusi soup.' },
  { id: 'groc_ogbono_seeds', name: 'Paint Bucket of Premium Draw Ogbono Seeds', category: 'Oils & Seasoning', priceNGN: 16500, unit: '4-Litre Paint Bucket', hungerRestore: 28, icon: '🥣', desc: 'High-viscosity wild mango seeds that draw smoothly.' },
  { id: 'groc_bama_mayo', name: 'Bama Real Mayonnaise Jumbo Jar (946ml)', category: 'Oils & Seasoning', priceNGN: 5500, unit: '946ml Glass Jar', hungerRestore: 20, icon: '🧴', desc: 'Rich, creamy American mayonnaise for Nigerian salad and bread.' },
  { id: 'groc_heinz_ketchup', name: 'Heinz Tomato Ketchup Squeeze Bottle (570g)', category: 'Oils & Seasoning', priceNGN: 3200, unit: '570g Bottle', hungerRestore: 15, icon: '🥫', desc: 'Thick sweet tomato ketchup for hot potato chips and meat pies.' },
  { id: 'groc_blue_band', name: 'Blue Band Spread Margarine (900g Tub)', category: 'Oils & Seasoning', priceNGN: 3600, unit: '900g Tub', hungerRestore: 18, icon: '🧈', desc: 'Enriched with 7 essential vitamins for soft agege bread.' },

  // 46-60: DAIRY & BREAKFAST
  { id: 'groc_peak_milk_carton', name: 'Carton of Peak Evaporated Milk (48 Tins)', category: 'Dairy & Breakfast', priceNGN: 44000, unit: 'Carton of 48', hungerRestore: 42, icon: '🥛', desc: 'Creamy full cream evaporated milk in iconic gold and blue tin.' },
  { id: 'groc_peak_powder_900g', name: 'Peak Full Cream Milk Powder (900g Refill Tin)', category: 'Dairy & Breakfast', priceNGN: 8800, unit: '900g Tin', hungerRestore: 30, icon: '🥛', desc: 'Instant dissolving whole milk powder with rich dairy taste.' },
  { id: 'groc_milo_1kg', name: 'Nestle Milo Chocolate Malt Energy Drink (1kg Refill)', category: 'Dairy & Breakfast', priceNGN: 6800, unit: '1kg Refill Pack', hungerRestore: 28, icon: '☕', desc: 'Energy-packed chocolate malt beverage fortified with Actigen-E.' },
  { id: 'groc_dano_milk_800g', name: 'Dano Full Cream Milk Powder Pouch (800g)', category: 'Dairy & Breakfast', priceNGN: 7200, unit: '800g Pouch', hungerRestore: 27, icon: '🥛', desc: 'High-calcium instant full cream milk powder from Denmark.' },
  { id: 'groc_golden_morn_1kg', name: 'Nestle Golden Morn Maize & Soya Breakfast Cereal (1kg)', category: 'Dairy & Breakfast', priceNGN: 3900, unit: '1kg Pack', hungerRestore: 25, icon: '🥣', desc: 'Nutritious whole grain cereal fortified with iron & vitamin A.' },
  { id: 'groc_kelloggs_cornflakes', name: 'Kellogg’s Crunchy Corn Flakes (750g Box)', category: 'Dairy & Breakfast', priceNGN: 4800, unit: '750g Box', hungerRestore: 24, icon: '🥣', desc: 'Golden crispy toasted corn flakes for morning breakfast.' },
  { id: 'groc_quaker_oats', name: 'Quaker Quick Cooking White Oats (1kg Tin)', category: 'Dairy & Breakfast', priceNGN: 4500, unit: '1kg Tin', hungerRestore: 26, icon: '🥣', desc: 'Heart-healthy 100% whole grain rolled oats.' },
  { id: 'groc_ovaltine_jar', name: 'Ovaltine Nutritious Malted Chocolate Drink (800g)', category: 'Dairy & Breakfast', priceNGN: 6200, unit: '800g Jar', hungerRestore: 26, icon: '☕', desc: 'Wholesome malted barley and chocolate morning drink.' },
  { id: 'groc_lipton_tea', name: 'Lipton Yellow Label Black Tea (Box of 100 Tea Bags)', category: 'Dairy & Breakfast', priceNGN: 2800, unit: '100 Tea Bags', hungerRestore: 15, icon: '🫖', desc: 'Aromatic sun-ripened black tea leaves for steaming hot breakfast.' },
  { id: 'groc_nescafe_classic', name: 'Nescafe Classic 100% Pure Instant Coffee (200g Jar)', category: 'Dairy & Breakfast', priceNGN: 5800, unit: '200g Jar', hungerRestore: 16, icon: '☕', desc: 'Rich bold coffee aroma to jumpstart productive mornings.' },
  { id: 'groc_sugar_st_louis', name: 'St. Louis Lump Sugar Cubes (Box of 500g)', category: 'Dairy & Breakfast', priceNGN: 1400, unit: '500g Box', hungerRestore: 12, icon: '🧊', desc: 'The historic French white sugar cubes loved in Nigeria.' },
  { id: 'groc_sugar_dangote_50kg', name: 'Dangote Fortified Granulated White Sugar 50kg', category: 'Dairy & Breakfast', priceNGN: 72000, unit: '50kg Bag', hungerRestore: 40, icon: '🍬', desc: 'Pure white sweet refined sugar for baking and beverages.' },
  { id: 'groc_hollandia_evap', name: 'Carton of Hollandia Evaporated Full Cream Milk (48 packs)', category: 'Dairy & Breakfast', priceNGN: 38000, unit: 'Carton of 48', hungerRestore: 38, icon: '🥛', desc: 'Smooth, creamy tetrapak milk packs with pull-ring cap.' },
  { id: 'groc_honey_natural', name: 'Pure Wild Forest Amber Honey (1-Litre Bottle)', category: 'Dairy & Breakfast', priceNGN: 5500, unit: '1 Litre Bottle', hungerRestore: 22, icon: '🍯', desc: '100% unpasteurised natural sweet honey from Kogi bee colonies.' },
  { id: 'groc_custard_powder', name: 'Checkers Custard Powder Vanilla Flavor (2kg Bucket)', category: 'Dairy & Breakfast', priceNGN: 5200, unit: '2kg Bucket', hungerRestore: 25, icon: '🥣', desc: 'Silky smooth golden custard with creamy vanilla notes.' },

  // 61-75: FRESH PRODUCE
  { id: 'groc_tomatoes_basket', name: 'Large Raffia Basket of Fresh Jos Ripe Tomatoes', category: 'Fresh Produce', priceNGN: 18500, unit: 'Large Basket', hungerRestore: 30, icon: '🍅', desc: 'Plump Northern plum tomatoes for thick Nigerian stews.' },
  { id: 'groc_onions_bag', name: '50kg Bag of Dry Red Onions (Sokoto Special)', category: 'Fresh Produce', priceNGN: 32000, unit: '50kg Bag', hungerRestore: 28, icon: '🧅', desc: 'Sharp, aromatic dry onions for building rich flavour profiles.' },
  { id: 'groc_rodo_pepper', name: 'Large Basket of Fresh Red Rodo Habanero Pepper', category: 'Fresh Produce', priceNGN: 15000, unit: 'Medium Basket', hungerRestore: 20, icon: '🌶️', desc: 'Fiery, aromatic scotch bonnet chili pepper.' },
  { id: 'groc_tatase_pepper', name: 'Basket of Sweet Red Tatase Bell Peppers', category: 'Fresh Produce', priceNGN: 14000, unit: 'Basket', hungerRestore: 20, icon: '🫑', desc: 'Deep red mild peppers that impart rich colour to jollof.' },
  { id: 'groc_plantain_ripe', name: 'Bunch of Big Yellow Ripe Dodo Plantains', category: 'Fresh Produce', priceNGN: 4500, unit: '1 Big Bunch', hungerRestore: 26, icon: '🍌', desc: 'Sweet golden plantains ready for deep-fried dodo slices.' },
  { id: 'groc_plantain_unripe', name: 'Bunch of Fresh Green Unripe Plantains', category: 'Fresh Produce', priceNGN: 4200, unit: '1 Big Bunch', hungerRestore: 25, icon: '🍌', desc: 'Iron-rich green plantains for diabetic-friendly porridge.' },
  { id: 'groc_irish_potatoes', name: 'Bag of Fresh Jos Irish White Potatoes (25kg)', category: 'Fresh Produce', priceNGN: 22000, unit: '25kg Bag', hungerRestore: 35, icon: '🥔', desc: 'Fluffy Plateau potatoes for French fries or potato salad.' },
  { id: 'groc_sweet_potatoes', name: 'Bag of Sweet Orange-Flesh Sweet Potatoes (25kg)', category: 'Fresh Produce', priceNGN: 14000, unit: '25kg Bag', hungerRestore: 32, icon: '🍠', desc: 'Naturally sweet nutrient-dense potatoes.' },
  { id: 'groc_fresh_ugu', name: 'Bundle of Fresh Fluted Pumpkin Ugu Leaves (5 Bunches)', category: 'Fresh Produce', priceNGN: 2000, unit: '5 Bunches', hungerRestore: 18, icon: '🥬', desc: 'Iron-rich green leaves for egusi, edikang ikong and vegetable stew.' },
  { id: 'groc_fresh_watermelon', name: 'Sweet Sugar-Baby Whole Watermelon (Jumbo 8kg)', category: 'Fresh Produce', priceNGN: 3500, unit: 'Whole Fruit', hungerRestore: 20, icon: '🍉', desc: 'Juicy, crisp sweet red melon for chilling and fruit bowls.' },
  { id: 'groc_fresh_pineapples', name: 'Sweet Cotonou Sugar-Loaf Pineapples (Set of 2)', category: 'Fresh Produce', priceNGN: 3600, unit: 'Set of 2', hungerRestore: 20, icon: '🍍', desc: 'Extra sweet fragrant yellow pineapples.' },
  { id: 'groc_fresh_oranges', name: 'Bag of Juicy Benue Sweet Oranges (50 pieces)', category: 'Fresh Produce', priceNGN: 6000, unit: 'Bag of 50', hungerRestore: 22, icon: '🍊', desc: 'Sweet, thirst-quenching citrus fruits loaded with Vitamin C.' },
  { id: 'groc_fresh_bananas', name: 'Large Hand of Ripe Cavendish Bananas', category: 'Fresh Produce', priceNGN: 2200, unit: '1 Hand', hungerRestore: 18, icon: '🍌', desc: 'Creamy potassium-rich ripe yellow bananas.' },
  { id: 'groc_fresh_avocado', name: 'Tray of Buttery Hass Avocado Pears (6 large)', category: 'Fresh Produce', priceNGN: 3000, unit: 'Tray of 6', hungerRestore: 20, icon: '🥑', desc: 'Buttery green avocado pears, great with bread or salad.' },
  { id: 'groc_fresh_ginger_garlic', name: 'Combo Basket of Fresh Ginger Root & White Garlic (2kg)', category: 'Fresh Produce', priceNGN: 5500, unit: '2kg Combo', hungerRestore: 15, icon: '🧄', desc: 'Immunity-boosting fresh root spices for marinades and teas.' },

  // 76-85: PACKAGED FOODS
  { id: 'groc_indomie_super_carton', name: 'Carton of Indomie Super Pack Chicken Flavour (40 packs)', category: 'Packaged Foods', priceNGN: 14500, unit: 'Carton of 40', hungerRestore: 38, icon: '🍜', desc: 'The undisputed national noodle staple with trademark chili & seasoning.' },
  { id: 'groc_indomie_hungryman', name: 'Carton of Indomie Hungryman Size (24 jumbo packs)', category: 'Packaged Foods', priceNGN: 16200, unit: 'Carton of 24', hungerRestore: 42, icon: '🍜', desc: 'Extra-large noodle bricks for voracious appetites.' },
  { id: 'groc_golden_penny_pasta', name: 'Carton of Golden Penny Long Spaghetti (20 packs of 500g)', category: 'Packaged Foods', priceNGN: 17500, unit: 'Carton of 20', hungerRestore: 38, icon: '🍝', desc: 'Firm al-dente durum wheat spaghetti for stir-fries.' },
  { id: 'groc_golden_penny_macaroni', name: 'Carton of Golden Penny Elbow Macaroni (20 packs)', category: 'Packaged Foods', priceNGN: 17500, unit: 'Carton of 20', hungerRestore: 38, icon: '🍝', desc: 'Classic pasta elbows for baked mac & cheese and salads.' },
  { id: 'groc_nasco_cornflakes', name: 'Nasco Classic Nigerian Corn Flakes (500g Box)', category: 'Packaged Foods', priceNGN: 2400, unit: '500g Box', hungerRestore: 20, icon: '🥣', desc: 'The heritage Jos-made crunchy corn flakes.' },
  { id: 'groc_minimie_chinchin', name: 'Jar of Minimie Crunchy Spiced Chin-Chin (900g)', category: 'Packaged Foods', priceNGN: 3200, unit: '900g Jar', hungerRestore: 22, icon: '🥨', desc: 'Crunchy sweet fried dough nibbles with nutmeg aroma.' },
  { id: 'groc_gala_sausage_carton', name: 'Carton of UAC Gala Beef Sausage Rolls (48 pieces)', category: 'Packaged Foods', priceNGN: 12000, unit: 'Carton of 48', hungerRestore: 30, icon: '🌭', desc: 'The iconic Lagos highway traffic emergency snack.' },
  { id: 'groc_baked_beans', name: 'Heinz English Baked Beans in Rich Tomato Sauce (Pack of 6)', category: 'Packaged Foods', priceNGN: 6800, unit: 'Pack of 6 Tins', hungerRestore: 24, icon: '🥫', desc: 'Navy beans in savory tomato sauce for British breakfasts.' },
  { id: 'groc_sweet_corn_tins', name: 'Green Giant Sweet Corn Whole Kernels (Pack of 6 Tins)', category: 'Packaged Foods', priceNGN: 6200, unit: 'Pack of 6 Tins', hungerRestore: 20, icon: '🌽', desc: 'Crisp golden sweet corn for party fried rice.' },
  { id: 'groc_corned_beef', name: 'Exeter Original Corned Beef (Pack of 3 Tins of 340g)', category: 'Packaged Foods', priceNGN: 8500, unit: 'Pack of 3 Tins', hungerRestore: 28, icon: '🥩', desc: 'Savory shredded beef for breakfast stew and sandwich spreads.' },

  // 86-93: BEVERAGES
  { id: 'groc_eva_water_pack', name: 'Pack of Eva Bottled Table Water (12 bottles of 1.5L)', category: 'Beverages', priceNGN: 3600, unit: 'Pack of 12', hungerRestore: 15, icon: '💧', desc: 'Pure refreshing bottled mineral water.' },
  { id: 'groc_nestle_water_pack', name: 'Pack of Nestle Pure Life Table Water (12 bottles of 1.5L)', category: 'Beverages', priceNGN: 3400, unit: 'Pack of 12', hungerRestore: 15, icon: '💧', desc: 'Clean, micro-filtered mineral-balanced drinking water.' },
  { id: 'groc_chivita_carton', name: 'Carton of Chivita 100% Real Orange Juice (10 packs of 1L)', category: 'Beverages', priceNGN: 13000, unit: 'Carton of 10', hungerRestore: 24, icon: '🧃', desc: 'No added sugar pure fruit juice blend.' },
  { id: 'groc_hollandia_yoghurt', name: 'Carton of Hollandia Strawberry Yoghurt Drink (10 packs of 1L)', category: 'Beverages', priceNGN: 14500, unit: 'Carton of 10', hungerRestore: 26, icon: '🥛', desc: 'Thick, creamy probiotic fruit yoghurt drink.' },
  { id: 'groc_coca_cola_carton', name: 'Pack of Coca-Cola Pet 50cl (12 bottles)', category: 'Beverages', priceNGN: 4200, unit: 'Pack of 12', hungerRestore: 16, icon: '🥤', desc: 'Original sparkling cola taste served freezing cold.' },
  { id: 'groc_maltina_cans', name: 'Carton of Maltina Classic Malt Cans (24 cans of 33cl)', category: 'Beverages', priceNGN: 11500, unit: 'Carton of 24', hungerRestore: 25, icon: '🍺', desc: 'Rich malt drink with vitamins A, B, and C.' },
  { id: 'groc_guinness_crate', name: 'Crate of Guinness Foreign Extra Stout (24 bottles)', category: 'Beverages', priceNGN: 16800, unit: 'Crate of 24', hungerRestore: 25, icon: '🍺', desc: 'Legendary roasted barley black stout with thick creamy foam.' },
  { id: 'groc_red_bull_pack', name: 'Pack of Red Bull Energy Drink (24 cans of 250ml)', category: 'Beverages', priceNGN: 24000, unit: 'Pack of 24', hungerRestore: 22, icon: '⚡', desc: 'Revitalises body and mind when working late or coding.' },

  // 94-100: HOUSEHOLD ESSENTIALS
  { id: 'groc_ariel_detergent', name: 'Ariel Multi-Action Washing Machine & Hand Powder (3kg Bag)', category: 'Household', priceNGN: 6800, unit: '3kg Bag', hungerRestore: 0, icon: '🧼', desc: 'Deep stain removal powder leaving clothes spotless and smelling fresh.' },
  { id: 'groc_sunlight_dishwash', name: 'Morning Fresh Anti-Bacterial Dishwashing Liquid (1-Litre)', category: 'Household', priceNGN: 2600, unit: '1-Litre Bottle', hungerRestore: 0, icon: '🧴', desc: 'Superior grease cutting power on oily pots and plates.' },
  { id: 'groc_dettol_antiseptic', name: 'Dettol Hospital-Grade Antiseptic Disinfectant (1-Litre)', category: 'Household', priceNGN: 5200, unit: '1-Litre Bottle', hungerRestore: 0, icon: '🧴', desc: 'Kills 99.9% of bacteria for first aid, bathing, and floor cleaning.' },
  { id: 'groc_harpic_toilet', name: 'Harpic Power Plus Disinfectant Toilet Cleaner (750ml)', category: 'Household', priceNGN: 2400, unit: '750ml Bottle', hungerRestore: 0, icon: '🚽', desc: 'Eliminates tough limescale and stains leaving fresh pine scent.' },
  { id: 'groc_baygon_spray', name: 'Baygon Multi-Insect Mosquito & Fly Spray (600ml Can)', category: 'Household', priceNGN: 3500, unit: '600ml Spray Can', hungerRestore: 0, icon: '🪰', desc: 'Knocks down mosquitoes and insects instantly for peaceful sleep.' },
  { id: 'groc_toilet_roll_pack', name: 'Rose Luxury 3-Ply Quilted Toilet Paper (Pack of 12 Rolls)', category: 'Household', priceNGN: 4500, unit: 'Pack of 12 Rolls', hungerRestore: 0, icon: '🧻', desc: 'Ultra-soft embossed toilet paper rolls.' },
  { id: 'groc_aluminium_foil', name: 'Heavy Duty Catering Aluminium Foil Wrap (30-metre Roll)', category: 'Household', priceNGN: 3200, unit: '30m Roll', hungerRestore: 0, icon: '🪙', desc: 'Thick heat-resistant foil for roasting fish, chicken and moi-moi.' },
];
