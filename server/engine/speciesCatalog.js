"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GEM_PRESETS = exports.SPECIES_CATALOG = void 0;
exports.SPECIES_CATALOG = {
    // --- CORUNDUM FAMILY (Sri Lanka Staples) ---
    'blue_sapphire': {
        id: 'blue_sapphire', name: 'Blue Sapphire', family: 'Corundum',
        basePricePerCarat: 500, rarityExponent: 1.0, clarityType: 'II',
        treatmentCategory: 'corundum', originCategory: 'corundum',
        defaultColor: { hue: 215, tone: 70, sat: 80, name: 'Royal / Cornflower Blue' }, specificGravity: 4.0
    },
    'padparadscha': {
        id: 'padparadscha', name: 'Padparadscha Sapphire', family: 'Corundum',
        basePricePerCarat: 3000, rarityExponent: 1.0, clarityType: 'II',
        treatmentCategory: 'corundum', originCategory: 'corundum',
        defaultColor: { hue: 15, tone: 60, sat: 75, name: 'Sunset Orange-Pink' }, specificGravity: 4.0
    },
    'pink_sapphire': {
        id: 'pink_sapphire', name: 'Pink Sapphire', family: 'Corundum',
        basePricePerCarat: 700, rarityExponent: 1.0, clarityType: 'II',
        treatmentCategory: 'corundum', originCategory: 'corundum',
        defaultColor: { hue: 335, tone: 60, sat: 70, name: 'Vivid Hot Pink' }, specificGravity: 4.0
    },
    'yellow_sapphire': {
        id: 'yellow_sapphire', name: 'Yellow Sapphire', family: 'Corundum',
        basePricePerCarat: 480, rarityExponent: 0.6, clarityType: 'II',
        treatmentCategory: 'corundum', originCategory: 'corundum',
        defaultColor: { hue: 48, tone: 55, sat: 85, name: 'Golden Canary Yellow' }, specificGravity: 4.0
    },
    'white_sapphire': {
        id: 'white_sapphire', name: 'White Sapphire (Geuda)', family: 'Corundum',
        basePricePerCarat: 150, rarityExponent: 0.4, clarityType: 'II',
        treatmentCategory: 'corundum', originCategory: 'corundum',
        defaultColor: { hue: 0, tone: 10, sat: 5, name: 'Colorless' }, specificGravity: 4.0
    },
    'ruby': {
        id: 'ruby', name: 'Ruby', family: 'Corundum',
        basePricePerCarat: 2200, rarityExponent: 1.0, clarityType: 'II',
        treatmentCategory: 'ruby', originCategory: 'ruby',
        defaultColor: { hue: 355, tone: 70, sat: 90, name: "Pigeon's Blood Red" }, specificGravity: 4.0
    },
    // --- BERYL FAMILY ---
    'emerald': {
        id: 'emerald', name: 'Emerald', family: 'Beryl',
        basePricePerCarat: 1500, rarityExponent: 1.0, clarityType: 'III',
        treatmentCategory: 'emerald', originCategory: 'emerald',
        defaultColor: { hue: 145, tone: 65, sat: 85, name: 'Vivid Colombian Green' }, specificGravity: 2.72
    },
    'aquamarine': {
        id: 'aquamarine', name: 'Aquamarine', family: 'Beryl',
        basePricePerCarat: 250, rarityExponent: 0.6, clarityType: 'I',
        treatmentCategory: 'routine_heat', originCategory: 'generic',
        defaultColor: { hue: 195, tone: 45, sat: 65, name: 'Santa Maria Blue' }, specificGravity: 2.72
    },
    'morganite': {
        id: 'morganite', name: 'Morganite', family: 'Beryl',
        basePricePerCarat: 120, rarityExponent: 0.5, clarityType: 'I',
        treatmentCategory: 'routine_heat', originCategory: 'generic',
        defaultColor: { hue: 20, tone: 50, sat: 50, name: 'Peach-Pink' }, specificGravity: 2.72
    },
    'heliodor': {
        id: 'heliodor', name: 'Heliodor (Golden Beryl)', family: 'Beryl',
        basePricePerCarat: 100, rarityExponent: 0.5, clarityType: 'I',
        treatmentCategory: 'untreated', originCategory: 'generic',
        defaultColor: { hue: 50, tone: 60, sat: 80, name: 'Golden Yellow' }, specificGravity: 2.72
    },
    'goshenite': {
        id: 'goshenite', name: 'Goshenite (White Beryl)', family: 'Beryl',
        basePricePerCarat: 80, rarityExponent: 0.4, clarityType: 'I',
        treatmentCategory: 'untreated', originCategory: 'generic',
        defaultColor: { hue: 0, tone: 10, sat: 5, name: 'Colorless' }, specificGravity: 2.72
    },
    // --- TOURMALINE FAMILY ---
    'paraiba': {
        id: 'paraiba', name: 'Paraíba Tourmaline', family: 'Tourmaline',
        basePricePerCarat: 6000, rarityExponent: 1.0, clarityType: 'II',
        treatmentCategory: 'tourmaline', originCategory: 'paraiba',
        defaultColor: { hue: 178, tone: 60, sat: 95, name: 'Electric Neon Turquoise' }, specificGravity: 3.06
    },
    'rubellite': {
        id: 'rubellite', name: 'Rubellite Tourmaline', family: 'Tourmaline',
        basePricePerCarat: 350, rarityExponent: 0.6, clarityType: 'III',
        treatmentCategory: 'tourmaline', originCategory: 'generic',
        defaultColor: { hue: 345, tone: 68, sat: 80, name: 'Deep Crimson Red' }, specificGravity: 3.06
    },
    'indicolite': {
        id: 'indicolite', name: 'Indicolite (Blue Tourmaline)', family: 'Tourmaline',
        basePricePerCarat: 400, rarityExponent: 0.6, clarityType: 'II',
        treatmentCategory: 'tourmaline', originCategory: 'generic',
        defaultColor: { hue: 200, tone: 72, sat: 70, name: 'Deep Lagoon Teal' }, specificGravity: 3.06
    },
    'green_tourmaline': {
        id: 'green_tourmaline', name: 'Green Tourmaline (Verdelite)', family: 'Tourmaline',
        basePricePerCarat: 200, rarityExponent: 0.5, clarityType: 'I',
        treatmentCategory: 'tourmaline', originCategory: 'generic',
        defaultColor: { hue: 135, tone: 60, sat: 70, name: 'Forest Green' }, specificGravity: 3.06
    },
    'bicolor_tourmaline': {
        id: 'bicolor_tourmaline', name: 'Bi-Color / Watermelon Tourmaline', family: 'Tourmaline',
        basePricePerCarat: 450, rarityExponent: 0.7, clarityType: 'III',
        treatmentCategory: 'tourmaline', originCategory: 'generic',
        defaultColor: { hue: 340, tone: 60, sat: 80, name: 'Pink & Green Bi-Color' }, specificGravity: 3.06
    },
    // --- SPINEL FAMILY (Sri Lanka / Burma Staples) ---
    'spinel_pink': {
        id: 'spinel_pink', name: 'Pink / Red Spinel', family: 'Spinel',
        basePricePerCarat: 620, rarityExponent: 0.7, clarityType: 'II',
        treatmentCategory: 'untreated', originCategory: 'spinel',
        defaultColor: { hue: 340, tone: 60, sat: 85, name: 'Neon Flame Pink' }, specificGravity: 3.60
    },
    'spinel_cobalt': {
        id: 'spinel_cobalt', name: 'Cobalt Blue Spinel', family: 'Spinel',
        basePricePerCarat: 2400, rarityExponent: 0.9, clarityType: 'II',
        treatmentCategory: 'untreated', originCategory: 'spinel',
        defaultColor: { hue: 220, tone: 65, sat: 90, name: 'Electric Cobalt Blue' }, specificGravity: 3.60
    },
    'spinel_grey': {
        id: 'spinel_grey', name: 'Grey / Silver Spinel', family: 'Spinel',
        basePricePerCarat: 280, rarityExponent: 0.6, clarityType: 'II',
        treatmentCategory: 'untreated', originCategory: 'spinel',
        defaultColor: { hue: 210, tone: 55, sat: 30, name: 'Metallic Silver Blue' }, specificGravity: 3.60
    },
    'spinel_purple': {
        id: 'spinel_purple', name: 'Purple Spinel', family: 'Spinel',
        basePricePerCarat: 300, rarityExponent: 0.6, clarityType: 'II',
        treatmentCategory: 'untreated', originCategory: 'spinel',
        defaultColor: { hue: 280, tone: 60, sat: 60, name: 'Deep Royal Purple' }, specificGravity: 3.60
    },
    // --- CHRYSOBERYL FAMILY (Sri Lanka Staples) ---
    'alexandrite': {
        id: 'alexandrite', name: 'Alexandrite', family: 'Chrysoberyl',
        basePricePerCarat: 4000, rarityExponent: 1.0, clarityType: 'II',
        treatmentCategory: 'untreated', originCategory: 'alexandrite',
        defaultColor: { hue: 160, tone: 65, sat: 80, name: 'Color-Change (Green to Red)' }, specificGravity: 3.73
    },
    'chrysoberyl_cats_eye': {
        id: 'chrysoberyl_cats_eye', name: 'Cat\'s Eye Chrysoberyl', family: 'Chrysoberyl',
        basePricePerCarat: 1500, rarityExponent: 1.0, clarityType: 'II',
        treatmentCategory: 'untreated', originCategory: 'generic',
        defaultColor: { hue: 55, tone: 60, sat: 70, name: 'Milk & Honey Yellow-Green' }, specificGravity: 3.73
    },
    'chrysoberyl_yellow': {
        id: 'chrysoberyl_yellow', name: 'Faceted Yellow-Green Chrysoberyl', family: 'Chrysoberyl',
        basePricePerCarat: 350, rarityExponent: 0.7, clarityType: 'I',
        treatmentCategory: 'untreated', originCategory: 'generic',
        defaultColor: { hue: 70, tone: 65, sat: 85, name: 'Vivid Chartreuse' }, specificGravity: 3.73
    },
    // --- GARNET FAMILY (Sri Lanka Staples) ---
    'tsavorite': {
        id: 'tsavorite', name: 'Tsavorite Garnet', family: 'Garnet',
        basePricePerCarat: 900, rarityExponent: 1.0, clarityType: 'II',
        treatmentCategory: 'untreated', originCategory: 'generic',
        defaultColor: { hue: 135, tone: 65, sat: 88, name: 'Emerald-Green Tsavorite' }, specificGravity: 3.61
    },
    'demantoid': {
        id: 'demantoid', name: 'Demantoid Garnet', family: 'Garnet',
        basePricePerCarat: 1200, rarityExponent: 1.0, clarityType: 'II',
        treatmentCategory: 'untreated', originCategory: 'demantoid',
        defaultColor: { hue: 120, tone: 60, sat: 85, name: 'Golden Horsetail Green' }, specificGravity: 3.84
    },
    'hessonite': {
        id: 'hessonite', name: 'Hessonite Garnet (Gomed)', family: 'Garnet',
        basePricePerCarat: 150, rarityExponent: 0.5, clarityType: 'II',
        treatmentCategory: 'untreated', originCategory: 'generic',
        defaultColor: { hue: 25, tone: 60, sat: 90, name: 'Cinnamon Orange-Brown' }, specificGravity: 3.61
    },
    'spessartite': {
        id: 'spessartite', name: 'Spessartite Garnet (Mandarin)', family: 'Garnet',
        basePricePerCarat: 350, rarityExponent: 0.6, clarityType: 'II',
        treatmentCategory: 'untreated', originCategory: 'generic',
        defaultColor: { hue: 30, tone: 60, sat: 90, name: 'Mandarin Orange' }, specificGravity: 4.15
    },
    'rhodolite': {
        id: 'rhodolite', name: 'Rhodolite Garnet', family: 'Garnet',
        basePricePerCarat: 100, rarityExponent: 0.5, clarityType: 'II',
        treatmentCategory: 'untreated', originCategory: 'generic',
        defaultColor: { hue: 340, tone: 50, sat: 70, name: 'Purplish-Red' }, specificGravity: 3.84
    },
    'almandine': {
        id: 'almandine', name: 'Almandine Garnet', family: 'Garnet',
        basePricePerCarat: 40, rarityExponent: 0.3, clarityType: 'II',
        treatmentCategory: 'untreated', originCategory: 'generic',
        defaultColor: { hue: 355, tone: 30, sat: 80, name: 'Dark Red / Burgundy' }, specificGravity: 4.05
    },
    // --- ZIRCON FAMILY (Sri Lanka Staples) ---
    'zircon_blue': {
        id: 'zircon_blue', name: 'Blue Zircon (Heated)', family: 'Zircon',
        basePricePerCarat: 200, rarityExponent: 0.6, clarityType: 'I',
        treatmentCategory: 'routine_heat', originCategory: 'generic',
        defaultColor: { hue: 190, tone: 50, sat: 80, name: 'Vivid Pastel Blue' }, specificGravity: 4.70
    },
    'zircon_white': {
        id: 'zircon_white', name: 'White Zircon', family: 'Zircon',
        basePricePerCarat: 100, rarityExponent: 0.5, clarityType: 'I',
        treatmentCategory: 'routine_heat', originCategory: 'generic',
        defaultColor: { hue: 0, tone: 10, sat: 5, name: 'Colorless' }, specificGravity: 4.70
    },
    'zircon_brown': {
        id: 'zircon_brown', name: 'Brown / Earth-Tone Zircon', family: 'Zircon',
        basePricePerCarat: 80, rarityExponent: 0.4, clarityType: 'I',
        treatmentCategory: 'untreated', originCategory: 'generic',
        defaultColor: { hue: 25, tone: 40, sat: 60, name: 'Autumn Brown' }, specificGravity: 4.70
    },
    // --- TOPAZ FAMILY ---
    'topaz_imperial': {
        id: 'topaz_imperial', name: 'Imperial Topaz', family: 'Topaz',
        basePricePerCarat: 800, rarityExponent: 0.8, clarityType: 'I',
        treatmentCategory: 'untreated', originCategory: 'generic',
        defaultColor: { hue: 25, tone: 60, sat: 85, name: 'Golden-Peach / Pinkish-Orange' }, specificGravity: 3.53
    },
    'topaz_swiss': {
        id: 'topaz_swiss', name: 'Swiss Blue Topaz', family: 'Topaz',
        basePricePerCarat: 30, rarityExponent: 0.2, clarityType: 'I',
        treatmentCategory: 'irradiated', originCategory: 'generic',
        defaultColor: { hue: 195, tone: 50, sat: 85, name: 'Electric Blue' }, specificGravity: 3.53
    },
    'topaz_london': {
        id: 'topaz_london', name: 'London Blue Topaz', family: 'Topaz',
        basePricePerCarat: 40, rarityExponent: 0.2, clarityType: 'I',
        treatmentCategory: 'irradiated', originCategory: 'generic',
        defaultColor: { hue: 210, tone: 35, sat: 70, name: 'Steely Inky Blue' }, specificGravity: 3.53
    },
    // --- QUARTZ FAMILY ---
    'amethyst': {
        id: 'amethyst', name: 'Amethyst', family: 'Quartz',
        basePricePerCarat: 20, rarityExponent: 0.2, clarityType: 'I',
        treatmentCategory: 'routine_heat', originCategory: 'generic',
        defaultColor: { hue: 275, tone: 55, sat: 80, name: 'Royal Purple' }, specificGravity: 2.65
    },
    'citrine': {
        id: 'citrine', name: 'Citrine', family: 'Quartz',
        basePricePerCarat: 20, rarityExponent: 0.2, clarityType: 'I',
        treatmentCategory: 'routine_heat', originCategory: 'generic',
        defaultColor: { hue: 45, tone: 60, sat: 85, name: 'Golden Yellow' }, specificGravity: 2.65
    },
    'ametrine': {
        id: 'ametrine', name: 'Ametrine', family: 'Quartz',
        basePricePerCarat: 30, rarityExponent: 0.3, clarityType: 'I',
        treatmentCategory: 'untreated', originCategory: 'generic',
        defaultColor: { hue: 290, tone: 50, sat: 70, name: 'Purple/Yellow Bi-Color' }, specificGravity: 2.65
    },
    'rose_quartz': {
        id: 'rose_quartz', name: 'Rose Quartz (Faceted)', family: 'Quartz',
        basePricePerCarat: 15, rarityExponent: 0.2, clarityType: 'II',
        treatmentCategory: 'untreated', originCategory: 'generic',
        defaultColor: { hue: 345, tone: 80, sat: 40, name: 'Pastel Pink' }, specificGravity: 2.65
    },
    // --- ZOISITE & SPODUMENE ---
    'tanzanite': {
        id: 'tanzanite', name: 'Tanzanite (Blue Zoisite)', family: 'Zoisite',
        basePricePerCarat: 450, rarityExponent: 0.8, clarityType: 'I',
        treatmentCategory: 'routine_heat', originCategory: 'generic',
        defaultColor: { hue: 250, tone: 65, sat: 85, name: 'Violet-Blue' }, specificGravity: 3.35
    },
    'kunzite': {
        id: 'kunzite', name: 'Kunzite (Spodumene)', family: 'Spodumene',
        basePricePerCarat: 50, rarityExponent: 0.4, clarityType: 'I',
        treatmentCategory: 'irradiated', originCategory: 'generic',
        defaultColor: { hue: 320, tone: 70, sat: 50, name: 'Lilac Pink' }, specificGravity: 3.18
    },
    'hiddenite': {
        id: 'hiddenite', name: 'Hiddenite (Spodumene)', family: 'Spodumene',
        basePricePerCarat: 60, rarityExponent: 0.4, clarityType: 'I',
        treatmentCategory: 'irradiated', originCategory: 'generic',
        defaultColor: { hue: 120, tone: 75, sat: 60, name: 'Pastel Green' }, specificGravity: 3.18
    },
    // --- OTHER CLASSICS ---
    'peridot': {
        id: 'peridot', name: 'Peridot', family: 'Olivine',
        basePricePerCarat: 80, rarityExponent: 0.6, clarityType: 'II',
        treatmentCategory: 'untreated', originCategory: 'generic',
        defaultColor: { hue: 90, tone: 60, sat: 85, name: 'Yellowish-Green' }, specificGravity: 3.34
    },
    'sphene': {
        id: 'sphene', name: 'Sphene (Titanite)', family: 'Titanite',
        basePricePerCarat: 150, rarityExponent: 0.6, clarityType: 'II',
        treatmentCategory: 'untreated', originCategory: 'generic',
        defaultColor: { hue: 65, tone: 60, sat: 85, name: 'Intense Yellow-Green Fire' }, specificGravity: 3.53
    },
    'moonstone': {
        id: 'moonstone', name: 'Blue Sheen Moonstone', family: 'Feldspar',
        basePricePerCarat: 50, rarityExponent: 0.4, clarityType: 'II',
        treatmentCategory: 'untreated', originCategory: 'generic',
        defaultColor: { hue: 210, tone: 90, sat: 30, name: 'White with Blue Adularescence' }, specificGravity: 2.58
    },
    // --- SRI LANKAN ULTRA-RARES (Collector's Stones) ---
    'taaffeite': {
        id: 'taaffeite', name: 'Taaffeite', family: 'Taaffeite',
        basePricePerCarat: 2500, rarityExponent: 1.0, clarityType: 'II',
        treatmentCategory: 'untreated', originCategory: 'generic',
        defaultColor: { hue: 300, tone: 75, sat: 40, name: 'Pale Mauve / Purple-Pink' }, specificGravity: 3.61
    },
    'sinhalite': {
        id: 'sinhalite', name: 'Sinhalite', family: 'Sinhalite',
        basePricePerCarat: 300, rarityExponent: 0.7, clarityType: 'I',
        treatmentCategory: 'untreated', originCategory: 'generic',
        defaultColor: { hue: 35, tone: 50, sat: 70, name: 'Golden-Brown' }, specificGravity: 3.48
    },
    'kornerupine': {
        id: 'kornerupine', name: 'Kornerupine', family: 'Kornerupine',
        basePricePerCarat: 400, rarityExponent: 0.8, clarityType: 'II',
        treatmentCategory: 'untreated', originCategory: 'generic',
        defaultColor: { hue: 130, tone: 60, sat: 60, name: 'Brownish-Green to Teal' }, specificGravity: 3.30
    },
    'sillimanite': {
        id: 'sillimanite', name: 'Sillimanite (Fibrolite)', family: 'Sillimanite',
        basePricePerCarat: 200, rarityExponent: 0.7, clarityType: 'II',
        treatmentCategory: 'untreated', originCategory: 'generic',
        defaultColor: { hue: 200, tone: 60, sat: 40, name: 'Greyish-Blue' }, specificGravity: 3.24
    }
};
exports.GEM_PRESETS = [
    { id: 'blue_sapphire', label: 'Blue Sapphire' },
    { id: 'ruby', label: 'Ruby' },
    { id: 'emerald', label: 'Emerald' },
    { id: 'padparadscha', label: 'Padparadscha' },
    { id: 'spinel_pink', label: 'Spinel (Pink/Red)' },
    { id: 'tsavorite', label: 'Tsavorite Garnet' },
    { id: 'hessonite', label: 'Hessonite Garnet' },
    { id: 'zircon_blue', label: 'Blue Zircon' },
    { id: 'alexandrite', label: 'Alexandrite' },
    { id: 'taaffeite', label: 'Taaffeite (Rare)' }
];
