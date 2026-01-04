// quick-rest-test.js
const axios = require('axios');
require('dotenv').config();

async function quickTest() {
  const key = process.env.GEMINI_API_KEY;
  
  console.log("Testing Gemini REST API...\n");
  
  // List available models
  try {
    console.log("1. Listing available models...");
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    const listResponse = await axios.get(listUrl);
    
    console.log("\n✅ Available models for your key:\n");
    listResponse.data.models.forEach(model => {
      console.log(`   - ${model.name}`);
      console.log(`     Methods: ${model.supportedGenerationMethods.join(', ')}\n`);
    });
    
  } catch (error) {
    console.error("❌ List Error:", error.response?.data || error.message);
    console.log("\n🔧 Your key doesn't have access to any models.");
    console.log("   Get a new key from: https://aistudio.google.com/app/apikey\n");
    return;
  }
  
  // Test generation
  try {
    console.log("2. Testing text generation...");
    const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${key}`;
    
    const response = await axios.post(genUrl, {
      contents: [{
        parts: [{ text: "Say hello" }]
      }]
    });
    
    const text = response.data.candidates[0].content.parts[0].text;
    console.log(`\n✅ SUCCESS! Response: "${text}"\n`);
    
  } catch (error) {
    console.error("❌ Generation Error:", error.response?.data || error.message);
  }
}

quickTest();