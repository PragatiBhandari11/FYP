const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const router = express.Router();

// Simple in-memory cache
let cachedData = null;
let lastFetchTime = 0;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

const NEP_TO_ENG = {
  "गोलभेडा ठूलो(भारतीय)": "Tomato Big (Indian)",
  "गोलभेडा ठूलो(नेपाली)": "Tomato Big (Nepali)",
  "गोलभेडा सानो(लोकल)": "Tomato Small (Local)",
  "आलु रातो": "Potato Red",
  "प्याज सुकेको (भारतीय)": "Onion Dry (Indian)",
  "गाजर(लोकल)": "Carrot (Local)",
  "बन्दा(लोकल)": "Cabbage (Local)",
  "काउली स्थानीय": "Cauliflower (Local)",
  "मूला सेतो(लोकल)": "Radish White (Local)",
  "भन्टा लाम्चो": "Brinjal Long",
  "सिमी(लोकल)": "Beans (Local)",
  "बोडी(तने)": "Bodi (Long)",
  "घिरौला": "Sponge Gourd",
  "काँक्रो(लोकल)": "Cucumber (Local)",
  "करेला": "Bitter Gourd",
  "फर्सी पाकेको": "Pumpkin",
  "अदुवा": "Ginger",
  "लसुन सुकेको": "Garlic Dry",
  "खुर्सानी हरियो": "Chili Green",
  "स्याउ(फुजी)": "Apple (Fuji)",
  "केरा": "Banana",
  "सुन्तला(भारतीय)": "Orange (Indian)",
  "स्याउ(झोले)": "Apple (Local)",
  "अङ्गुर(कालो)": "Grapes (Black)",
  "मेवा(नेपाली)": "Papaya (Nepali)",
  "अनार": "Pomegranate",
  "नासपाती(स्थानीय)": "Pear (Local)",
  "लिम्बु": "Lemon",
  "पिंडालु": "Taro",
  "सकरखण्ड": "Sweet Potato",
  "स्कुस": "Chayote",
  "सिस्नु": "Nettle",
  "ब्रोकाउली": "Broccoli",
  "च्याउ(कन्य)": "Mushroom (Oyster)",
  "पालुङ्गो साग": "Spinach",
  "धनियाँ हरियो": "Coriander Green"
};

/**
 * Scrape Kalimati Market Prices
 */
async function scrapeKalimati() {
  try {
    // Using ?lang=en ensures we get standard digits and English names
    const response = await axios.get('https://kalimatimarket.gov.np/price?lang=en', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 30000
    });

    const $ = cheerio.load(response.data);
    const prices = [];

    // Helper to extract numeric value only (handles "Rs. 50", "रू ७५", etc.)
    const cleanNumeric = (val) => {
      if (!val) return 0;
      
      // Map Nepali numerals to English
      const nepMap = {
        '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
        '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
      };
      
      // Convert Nepali numerals first
      let converted = val.replace(/[०-९]/g, (d) => nepMap[d]);
      
      // Then strip everything but digits and dots
      const cleaned = converted.replace(/[^\d.]/g, '');
      return parseFloat(cleaned) || 0;
    };

    $('table tbody tr').each((i, el) => {
      const tds = $(el).find('td');
      if (tds.length >= 5) {
        const nepName = $(tds[0]).text().trim();
        const unit = $(tds[1]).text().trim();
        const minRaw = $(tds[2]).text().trim();
        const maxRaw = $(tds[3]).text().trim();
        const avgRaw = $(tds[4]).text().trim();

        const avg = cleanNumeric(avgRaw);

        prices.push({
          name: NEP_TO_ENG[nepName] || nepName,
          nepaliName: nepName,
          unit: unit.toLowerCase().includes('kg') || unit === 'केजी' ? 'kg' : unit,
          price: avg,
          min: cleanNumeric(minRaw),
          max: cleanNumeric(maxRaw),
          avg: avg,
          trend: 'stable',
          updatedAt: new Date().toISOString()
        });
      }
    });

    return prices;
  } catch (error) {
    console.error("Scraping Error:", error.message);
    return null;
  }
}

/**
 * GET /api/market-prices
 */
router.get("/", async (req, res) => {
  console.log("Market Prices Request Received");
  const now = Date.now();
  
  if (cachedData && (now - lastFetchTime < CACHE_TTL)) {
    console.log("Returning cached market prices");
    return res.status(200).json(cachedData);
  }

  console.log("Fetching live market prices...");
  const liveData = await scrapeKalimati();
  
  if (liveData && liveData.length > 0) {
    console.log(`Successfully scraped ${liveData.length} items`);
    cachedData = liveData;
    lastFetchTime = now;
    return res.status(200).json(liveData);
  }

  console.error("Scraping failed or returned empty data");
  // Fallback to cached or empty if everything fails
  res.status(200).json(cachedData || []);
});

module.exports = router;
