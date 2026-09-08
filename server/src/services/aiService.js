import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

/**
 * Multi-Tier AI Service for LuminaMarket
 * Supports Google Gemini API, OpenAI API, and an Intelligent Live-Catalog Fallback Engine.
 */

// Helper to call Google Gemini REST API
async function callGemini(apiKey, systemInstruction, userPrompt, history = []) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  const contents = [];
  if (history && history.length > 0) {
    for (const h of history) {
      const text = h.content || h.text || '';
      if (!text) continue;
      contents.push({
        role: h.role === 'model' || h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text }]
      });
    }
  }

  contents.push({
    role: 'user',
    parts: [{ text: userPrompt }]
  });

  const payload = {
    system_instruction: {
      parts: [{ text: systemInstruction }]
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1000
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!candidate) throw new Error('No candidate content returned from Gemini');
  return candidate;
}

// Helper to call OpenAI Chat Completion REST API
async function callOpenAI(apiKey, systemInstruction, userPrompt, history = []) {
  const url = 'https://api.openai.com/v1/chat/completions';
  const messages = [
    { role: 'system', content: systemInstruction },
    ...history.map(h => ({
      role: h.role === 'model' || h.role === 'assistant' ? 'assistant' : 'user',
      content: h.content || h.text || ''
    })),
    { role: 'user', content: userPrompt }
  ];

  const payload = {
    model: 'gpt-4o-mini',
    messages,
    temperature: 0.7,
    max_tokens: 1000
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content;
}

/**
 * Universal text generation with provider fallback:
 * 1. Google Gemini (if GEMINI_API_KEY is present)
 * 2. OpenAI (if OPENAI_API_KEY is present)
 * 3. Throws error to trigger smart heuristic engine
 */
async function generateWithLLM(systemInstruction, userPrompt, history = []) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openAIKey = process.env.OPENAI_API_KEY;

  if (geminiKey && geminiKey !== 'your_gemini_api_key_here' && geminiKey.trim() !== '') {
    try {
      return await callGemini(geminiKey, systemInstruction, userPrompt, history);
    } catch (err) {
      console.warn('[AI Service] Gemini API call failed, attempting secondary provider...', err.message);
    }
  }

  if (openAIKey && openAIKey !== 'your_openai_api_key_here' && openAIKey.trim() !== '') {
    try {
      return await callOpenAI(openAIKey, systemInstruction, userPrompt, history);
    } catch (err) {
      console.warn('[AI Service] OpenAI API call failed...', err.message);
    }
  }

  return null; // Signals to use the built-in intelligent engine
}

const FALLBACK_CATALOG = [
  {
    _id: 'sample_audio_1',
    title: 'Aura Pro ANC Wireless Headphones',
    price: 189.99,
    category: 'Audio',
    brand: 'Lumina',
    stock: 25,
    rating: 4.9,
    description: 'Flagship hybrid active noise canceling wireless over-ear headphones with 40-hour battery and spatial audio.',
    images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80' }]
  },
  {
    _id: 'sample_watch_1',
    title: 'Lumina Chrono Smart Watch Ultra',
    price: 249.99,
    category: 'Gadgets',
    brand: 'Lumina',
    stock: 18,
    rating: 4.8,
    description: 'Titanium aerospace casing, sapphire crystal OLED display, ECG health tracking, and 7-day endurance.',
    images: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80' }]
  },
  {
    _id: 'sample_fashion_1',
    title: 'AeroVelocity Urban Runners',
    price: 129.99,
    category: 'Fashion',
    brand: 'Nike',
    stock: 30,
    rating: 4.7,
    description: 'High-cushion responsive foam daily runners with breathable mesh upper and slip-resistant rubber outsole.',
    images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80' }]
  },
  {
    _id: 'sample_cam_1',
    title: 'Lumina X1 4K Mirrorless Camera',
    price: 599.99,
    category: 'Electronics',
    brand: 'Sony',
    stock: 12,
    rating: 4.9,
    description: 'Professional 4K 60fps cinematic video recording with 24MP full-frame sensor and 5-axis stabilization.',
    images: [{ url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80' }]
  }
];

/**
 * 1. AI Shopping Assistant / Concierge
 */
export const chatShoppingAssistant = async ({ message, history = [] }) => {
  // Query live product catalog to feed real-time inventory if DB connected
  let products = [];
  if (mongoose.connection.readyState === 1) {
    try {
      products = await Product.find().select('title price category brand stock rating description images');
    } catch (err) {
      console.warn('[AI Service] Live catalog query note (using fallback):', err.message);
    }
  }

  if (!products || products.length === 0) {
    products = FALLBACK_CATALOG;
  }
  
  // Format catalog sample
  const catalogContext = products.map(p => ({
    id: (p._id || p.id).toString(),
    title: p.title,
    price: p.price,
    category: p.category,
    brand: p.brand || 'Lumina',
    stock: p.stock,
    rating: p.rating || 4.5,
    imageUrl: p.images?.[0]?.url || '',
    description: p.description?.substring(0, 120)
  }));

  const systemInstruction = `You are Lumina AI, the elite personal shopping concierge for LuminaMarket.
Your tone is sophisticated, helpful, modern, and enthusiastic.
You have access to the following current live store catalog:
${JSON.stringify(catalogContext)}

CRITICAL CONVERSATIONAL & PRODUCT RECOMMENDATION RULES:
1. ONLY recommend products if the user explicitly asks for product recommendations, items to buy, budget searches, gift ideas, deals, or comparisons.
2. If the user is responding with conversational pleasantries (such as "thanks", "thank you", "great", "ok", "cool", "hello", "hi", "bye") or asking general questions about shipping, delivery, returns, warranties, payments, or store information, respond warmly and conversationally WITHOUT recommending any products. Return:
\`\`\`recommended_ids
[]
\`\`\`
3. Do NOT repeat previous recommendations unless the user specifically asks for them again.
4. When you DO recommend products from the catalog, list 1 to 3 exact IDs in the structured JSON block at the very end:
\`\`\`recommended_ids
["id1", "id2"]
\`\`\`
Keep responses concise and formatted with clean markdown.`;

  let assistantText = null;
  let recommendedIds = [];

  try {
    const llmOutput = await generateWithLLM(systemInstruction, message, history);
    if (llmOutput) {
      // Extract recommended IDs JSON if present
      const jsonMatch = llmOutput.match(/```recommended_ids\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          recommendedIds = JSON.parse(jsonMatch[1]);
        } catch (e) {
          recommendedIds = [];
        }
      }
      assistantText = llmOutput.replace(/```recommended_ids[\s\S]*?```/g, '').trim();
    }
  } catch (err) {
    console.warn('[AI Service] Falling back to intelligent catalog engine:', err.message);
  }

  // If no external LLM was configured or call returned null, use our intelligent catalog engine
  if (!assistantText) {
    const lower = message.toLowerCase().trim();

    // 1. Check for conversational pleasantries & non-shopping intent
    const isThanks = /^(thanks|thank you|thx|ty|appreciate it|awesome|great|cool|perfect|good|ok|okay|nice|sounds good)[!.]*$/i.test(lower) || lower.includes('thank you') || lower.includes('thanks for');
    const isGreeting = /^(hi|hello|hey|greetings|good (morning|afternoon|evening|day))[!.]*$/i.test(lower);
    const isFarewell = /^(bye|goodbye|see ya|cya|take care|have a good one)[!.]*$/i.test(lower);
    const isShipping = lower.includes('shipping') || lower.includes('delivery') || lower.includes('courier') || lower.includes('tracking') || lower.includes('deliver');
    const isReturn = lower.includes('return') || lower.includes('refund') || lower.includes('exchange') || lower.includes('warranty') || lower.includes('guarantee');
    const isPayment = lower.includes('payment') || lower.includes('pay') || lower.includes('razorpay') || lower.includes('card') || lower.includes('upi') || lower.includes('checkout');

    if (isThanks) {
      assistantText = `You're very welcome! If you have any other questions, need more recommendations, or want to explore our catalog, I'm always right here to assist. ✨`;
      recommendedIds = [];
    } else if (isGreeting) {
      assistantText = `Hello! I'm **Lumina AI**, your personal shopping assistant. How can I help you today? You can ask me for product recommendations, current trending deals, gift ideas, or store policies!`;
      recommendedIds = [];
    } else if (isFarewell) {
      assistantText = `Have a wonderful day ahead! Thank you for visiting LuminaMarket. Reach out whenever you're ready to explore more.`;
      recommendedIds = [];
    } else if (isShipping) {
      assistantText = `⚡ **Fast & Secure Delivery at LuminaMarket**\n\nAll orders over $50 qualify for **Free Express Shipping** with tracking. Deliveries to major metropolitan zones arrive within 2-3 business days. All packages are insured and handled with utmost care.`;
      recommendedIds = [];
    } else if (isReturn) {
      assistantText = `🛡️ **Lumina Buyer Protection & 30-Day Returns**\n\nWe offer a hassle-free **30-Day Money-Back Guarantee**. If you are not 100% satisfied with your order or receive a defective unit, you can request an instant return or exchange right from your profile dashboard!`;
      recommendedIds = [];
    } else if (isPayment) {
      assistantText = `💳 **Secure Checkout with Razorpay**\n\nWe support all major payment methods including Credit/Debit cards, Net Banking, UPI, and digital wallets with 256-bit SSL encryption for 100% secure transactions.`;
      recommendedIds = [];
    } else {
      // 2. Shopping Intent & Product Search
      const priceMatch = lower.match(/under\s*\$?(\d+)/i) || lower.match(/below\s*\$?(\d+)/i) || lower.match(/less than\s*\$?(\d+)/i);
      const maxPrice = priceMatch ? Number(priceMatch[1]) : null;

      const isExplicitShopping = /(recommend|suggest|show|find|looking for|buy|purchase|best|cheap|deal|discount|offer|gift|headphones|audio|shoes|watch|camera|phone|clothes|apparel|electronics|gadgets|laptop|items|products|catalog|store)/i.test(lower);

      let matched = products.filter(p => {
        const matchText = (p.title + ' ' + p.description + ' ' + p.category + ' ' + p.brand).toLowerCase();
        const tokens = lower.replace(/[^\w\s]/g, '').split(/\s+/).filter(t => t.length > 2);
        const hasKeyword = tokens.some(t => matchText.includes(t));
        const satisfiesPrice = maxPrice ? p.price <= maxPrice : true;
        return hasKeyword && satisfiesPrice;
      });

      if (matched.length === 0 && maxPrice) {
        matched = products.filter(p => p.price <= maxPrice);
      }

      if (matched.length > 0) {
        recommendedIds = matched.slice(0, 3).map(m => (m._id || m.id).toString());
        if (maxPrice) {
          assistantText = `Here are our best premium options currently available under **$${maxPrice}** that offer exceptional quality and value:`;
        } else if (lower.includes('gift') || lower.includes('present')) {
          assistantText = `🎁 **Curated Gift Recommendations**\n\nFinding the perfect gift is all about everyday delight and sleek craft. Here are our most beloved buyer favorites:`;
        } else if (lower.includes('deal') || lower.includes('discount') || lower.includes('offer')) {
          assistantText = `🔥 **Today's Trending Highlights & Deals**\n\nTake advantage of limited-time marketplace deals with up to 25% savings and complimentary express delivery:`;
        } else {
          assistantText = `Based on your request, here are top matching items from our store catalog with verified ratings:`;
        }
      } else if (isExplicitShopping) {
        // User asked for shopping/recommendations but query didn't match keyword
        const topItems = [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 2);
        recommendedIds = topItems.map(m => (m._id || m.id).toString());
        assistantText = `I couldn't find an exact match for that specific term, but here are our top-rated trending products from the store:`;
      } else {
        // General text query that doesn't ask for products
        recommendedIds = [];
        assistantText = `I'm here to assist with your shopping experience! Feel free to ask me for product recommendations, budget finds under any price, gift ideas, or technical comparisons.`;
      }
    }
  }

  // Populate recommended products full details for the UI cards ONLY if recommendedIds is non-empty
  let recommendedProducts = [];
  if (recommendedIds && recommendedIds.length > 0) {
    if (mongoose.connection.readyState === 1) {
      try {
        recommendedProducts = await Product.find({ _id: { $in: recommendedIds } })
          .select('title price category brand stock rating images description');
      } catch (err) {
        console.warn('[AI Service] ID query note:', err.message);
      }
    }

    if (!recommendedProducts || recommendedProducts.length === 0) {
      recommendedProducts = products.filter(p => recommendedIds.includes((p._id || p.id).toString()));
    }
  }

  return {
    reply: assistantText,
    recommendedProducts
  };
};

/**
 * 2. AI Seller Copilot: Auto-generate product details from a prompt
 */
export const generateProductListing = async ({ prompt, category, brand }) => {
  const systemInstruction = `You are Lumina Marketplace Merchant AI Copilot.
You specialize in writing high-converting, professional e-commerce product listings.
Generate a structured JSON output with:
{
  "title": "Clear, compelling, SEO-friendly product title (under 90 chars)",
  "category": "One of: Electronics, Audio, Fashion, Home & Living, Gadgets, Books, Accessories",
  "brand": "Suggested or specified brand name",
  "suggestedPrice": 149.99,
  "suggestedMrp": 199.99,
  "stock": 25,
  "description": "Rich 2-3 paragraph description with key technical specs, materials, battery/dimensions, and what makes it special.",
  "features": ["Key bullet 1", "Key bullet 2", "Key bullet 3", "Key bullet 4"]
}
Return ONLY valid JSON without markdown wrapping.`;

  const userPrompt = `Product concept: "${prompt || 'Premium wireless audio gadget'}". Category hint: "${category || ''}". Brand: "${brand || 'Lumina'}".`;

  let result = null;

  try {
    const raw = await generateWithLLM(systemInstruction, userPrompt);
    if (raw) {
      const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      result = JSON.parse(clean);
    }
  } catch (err) {
    console.warn('[AI Service] LLM product generation failed, using intelligent template generator:', err.message);
  }

  if (!result) {
    // Intelligent heuristic generator
    const cleanPrompt = prompt ? prompt.trim() : 'Smart Gadget';
    const detectedCategory = category && category !== 'General' ? category : 
      cleanPrompt.toLowerCase().includes('audio') || cleanPrompt.toLowerCase().includes('headphone') || cleanPrompt.toLowerCase().includes('earbud') ? 'Audio' :
      cleanPrompt.toLowerCase().includes('shirt') || cleanPrompt.toLowerCase().includes('shoe') || cleanPrompt.toLowerCase().includes('jacket') ? 'Fashion' :
      cleanPrompt.toLowerCase().includes('watch') || cleanPrompt.toLowerCase().includes('tracker') ? 'Gadgets' : 'Electronics';

    const basePrice = Math.floor(Math.random() * 80) + 79;
    const mrp = Math.round(basePrice * 1.3);

    result = {
      title: `${brand || 'Lumina'} ${cleanPrompt.charAt(0).toUpperCase() + cleanPrompt.slice(1)} Pro Series`,
      category: detectedCategory,
      brand: brand || 'Lumina',
      suggestedPrice: basePrice,
      suggestedMrp: mrp,
      stock: 20,
      description: `Experience the next generation of performance with the ${brand || 'Lumina'} ${cleanPrompt}. Engineered with aerospace-grade precision and intuitive ergonomic ergonomics, this unit combines premium durability with effortless daily utility.\n\nFeaturing advanced ultra-low latency architecture, high-efficiency power management, and seamless universal compatibility. Designed for discerning enthusiasts who demand uncompromising quality, elegance, and reliability in every detail.`,
      features: [
        'Crafted with premium aerospace-grade composite materials',
        'Next-gen intelligent energy optimization with all-day endurance',
        'Seamless plug-and-play cross-platform connectivity',
        'Backed by Lumina 1-Year Full Replacement Warranty'
      ]
    };
  }

  return result;
};

/**
 * 3. AI Product Summary & Buyer Insights
 */
export const summarizeProduct = async (productData) => {
  const { title, description, price, category, brand } = productData;

  const systemInstruction = `You are Lumina AI Consumer Analyst.
Analyze this product and generate a quick shopper evaluation in JSON:
{
  "quickTake": "One sentence punchy summary of why this product shines.",
  "pros": ["Highlight 1", "Highlight 2", "Highlight 3"],
  "bestFor": "Who should buy this (e.g., commuters, audiophiles, professionals)",
  "verdict": "Rating sentiment, e.g. Outstanding Value (9.4/10)"
}
Return ONLY valid JSON.`;

  const userPrompt = `Product: ${title}\nBrand: ${brand}\nPrice: $${price}\nCategory: ${category}\nDescription: ${description}`;

  let summary = null;
  try {
    const raw = await generateWithLLM(systemInstruction, userPrompt);
    if (raw) {
      const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      summary = JSON.parse(clean);
    }
  } catch (err) {
    console.warn('[AI Service] Summarize LLM failed, using heuristic engine:', err.message);
  }

  if (!summary) {
    summary = {
      quickTake: `A standout ${category.toLowerCase()} offering exceptional balance of premium performance, refined aesthetics, and competitive pricing.`,
      pros: [
        'Engineered with durable high-grade finishes and ergonomic design',
        `High cost-to-performance ratio in the $${price} category`,
        'Backed by verified buyer satisfaction and official Lumina warranty'
      ],
      bestFor: `Discerning buyers and professionals looking for reliable, high-tier ${category} with zero compromises.`,
      verdict: 'Recommended Buy • 9.2/10 Value Score'
    };
  }

  return summary;
};

/**
 * 4. AI Semantic Natural Language Search
 */
export const semanticSearch = async (query) => {
  let allProducts = [];
  if (mongoose.connection.readyState === 1) {
    try {
      allProducts = await Product.find();
    } catch (err) {
      allProducts = FALLBACK_CATALOG;
    }
  }

  if (!allProducts || allProducts.length === 0) {
    allProducts = FALLBACK_CATALOG;
  }

  if (!query || query.trim() === '') {
    return allProducts.slice(0, 8);
  }

  const cleanQuery = query.toLowerCase().trim();
  const priceMatch = cleanQuery.match(/under\s*\$?(\d+)/i) || cleanQuery.match(/below\s*\$?(\d+)/i);
  const maxPrice = priceMatch ? Number(priceMatch[1]) : null;

  // Split query into terms
  const terms = cleanQuery
    .replace(/under\s*\$?\d+/ig, '')
    .replace(/for\s+/ig, '')
    .replace(/best\s+/ig, '')
    .replace(/cheap\s+/ig, '')
    .split(/\s+/)
    .filter(t => t.length > 2);

  let results = allProducts;
  if (maxPrice) {
    results = results.filter(p => p.price <= maxPrice);
  }

  // Score relevance
  if (terms.length > 0) {
    results = results.map(p => {
      let score = 0;
      const combined = `${p.title} ${p.description} ${p.category} ${p.brand}`.toLowerCase();
      terms.forEach(term => {
        if (p.title.toLowerCase().includes(term)) score += 5;
        if (p.category.toLowerCase().includes(term)) score += 4;
        if (p.brand.toLowerCase().includes(term)) score += 3;
        if (combined.includes(term)) score += 1;
      });
      return { product: p, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.product);
  }

  if (results.length === 0) {
    results = allProducts.slice(0, 6);
  }

  return results;
};
