import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import axios from "axios";
import connectDB from "./db.js";
import Recommendation from "./models/Recommendation.js";

dotenv.config();
const app = express();
connectDB();

app.use(cors());
app.use(express.json());


// Enhanced validation middleware
const validateRequest = (req, res, next) => {
  const requiredFields = [
    'relationship', 'ageGroup', 'gender', 
    'occasion', 'interests', 'priceRange', 'giftType'
  ];
  
  const missing = requiredFields.filter(field => !req.body[field]);
  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      error: `Missing required fields: ${missing.join(', ')}`
    });
  }
  next();
};

app.post("/api/generate", validateRequest, async (req, res) => {
  try {
    const prompt = `...`; // Keep your existing prompt template

    const aiResponse = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "moonshotai/kimi-vl-a3b-thinking:free",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let content = aiResponse.data?.choices?.[0]?.message?.content || "";
    let recommendations = [];

    try {
      content = content
        .replace(/^```json/, "")
        .replace(/```$/, "")
        .trim();

      const parsed = JSON.parse(content);
      
      if (!Array.isArray(parsed.recommendations)) {
        throw new Error("Invalid recommendations array structure");
      }

      // Validate recommendations structure
      recommendations = parsed.recommendations.filter(rec => 
        rec.gift_name && rec.search_url && rec.platform
      );

      if (recommendations.length === 0) {
        throw new Error("No valid recommendations in response");
      }

      // Save to database
      const savedRecs = await Recommendation.insertMany(recommendations);
      console.log("✅ Saved recommendations:", savedRecs);

      res.json({
        success: true,
        recommendations: savedRecs.map(rec => ({
          gift_name: rec.gift_name,
          description: rec.description,
          price_range: rec.price_range,
          platform: rec.platform,
          product_image: rec.product_image,
          search_url: rec.search_url,
          _id: rec._id
        }))
      });

    } catch (parseError) {
      console.error("❌ Parsing failed:", parseError.message);
      console.debug("Raw AI content:", content);
      res.status(500).json({
        success: false,
        error: "Failed to process recommendations",
        details: parseError.message
      });
    }
  } catch (error) {
    console.error("🚨 Server error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));