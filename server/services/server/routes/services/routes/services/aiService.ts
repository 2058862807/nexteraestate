// aiService.ts — QuantumAegis Local API Integration

class AIProcessor {
  async generateSummary(vaultContents: any): Promise<string> {
    const content = JSON.stringify(vaultContents).substring(0, 5000);

    const prompt = `
Generate a compassionate, human-centered summary of these estate vault contents.
Focus on clarity, emotional sensitivity, and practical guidance.

Vault contents:
${content}
    `.trim();

    try {
      const response = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer DJ10111983"
        },
        body: JSON.stringify({
          model: "QuantumAegis-v1",
          messages: [
            { role: "system", content: "You are a compassionate estate-planning assistant." },
            { role: "user", content: prompt }
          ]
        })
      });

      const data = await response.json();

      // Your API returns { response: "..." }
      return data.response || "No response from QuantumAegis.";
    } catch (err) {
      console.error("QuantumAegis API error:", err);
      throw new Error("Failed to generate summary.");
    }
  }
}

export default new AIProcessor();
