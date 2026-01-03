const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function checkModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log("Checking available models for your key...");
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // We use the model manager to list generic models
    // (Note: internal method, but valid for checking access)
    console.log(`\nYour Key: ${process.env.GEMINI_API_KEY.slice(0,6)}...`);
    
    // Try to list models (requires simple curl usually, but we can test common ones)
    const candidates = [
      "gemini-1.5-flash",
      "gemini-1.5-flash-001",
      "gemini-1.5-flash-latest",
      "gemini-pro",
      "gemini-1.0-pro"
    ];

    for (const name of candidates) {
      try {
        const m = genAI.getGenerativeModel({ model: name });
        await m.generateContent("Test");
        console.log(`✅ ACCESS GRANTED: ${name}`);
      } catch (e) {
        if (e.message.includes("404")) {
            console.log(`❌ Not Found: ${name}`);
        } else {
            console.log(`⚠️  Other Error (${name}): ${e.message.split(' ')[0]}`);
        }
      }
    }

  } catch (error) {
    console.error("Fatal Error:", error);
  }
}

checkModels();