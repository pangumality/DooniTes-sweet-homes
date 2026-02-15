
export async function generateHouseImage(prompt) {
  const apiKey = import.meta.env.VITE_OPEN_AI_KEY;

  if (!apiKey) {
    throw new Error("OpenAI API key is missing. Please check your .env file.");
  }

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "natural", // or "vivid"
        response_format: "b64_json"
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to generate image");
    }

    const data = await response.json();
    // Convert base64 to data URL for immediate use and persistence
    return `data:image/png;base64,${data.data[0].b64_json}`;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

export async function analyzeImageAndGeneratePrompt(imageBase64, context = "") {
  const apiKey = import.meta.env.VITE_OPEN_AI_KEY;

  if (!apiKey) {
    throw new Error("OpenAI API key is missing.");
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert architectural AI. Your task is to analyze a 2D floor plan image and generate a highly detailed, structured text prompt for DALL-E 3 to recreate it. Focus on the spatial layout, room connections, and proportions. Do NOT output markdown or conversational text, just the raw prompt string."
          },
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: `Analyze this floor plan image. Create a DALL-E 3 prompt that faithfully recreates this specific layout. 
                
                CONTEXT: ${context}
                
                Requirements for the prompt:
                1. Describe the exact relative positions of every room (e.g., 'Kitchen in top-left, Living Room in center').
                2. Specify the aspect ratio and shape based on the image.
                3. Mention the specific connection points (doors/hallways).
                4. Maintain the style: Professional architectural floor plan render, 2D top-down, realistic textures, soft shadows, clear walls.
                5. NO text labels in the image itself (the prompt should not ask for text labels).` 
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to analyze image");
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
}
