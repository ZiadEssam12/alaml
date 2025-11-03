/**
 * Generic function to call Gemini API with custom prompt and config
 *
 * @param {string} prompt The prompt to send to Gemini API
 * @param {object} options Optional configuration options
 * @param {number} options.temperature Temperature for response generation (default: 0.2)
 * @param {number} options.topK Top K for sampling (default: 1)
 * @param {number} options.topP Top P for sampling (default: 1)
 * @param {number} options.maxOutputTokens Maximum output tokens (default: 200)
 * @param {boolean} options.parseJson Whether to parse response as JSON (default: true)
 * @returns {Promise<object | string | null>} Parsed JSON object, string, or null if error
 */
export async function callGeminiAPI(prompt, options = {}) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const GEMINI_API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

  if (!GEMINI_API_KEY) {
    console.error(
      "GEMINI_API_KEY is not set. Please set it as an environment variable."
    );
    return null;
  }

  const {
    temperature = 0.2,
    topK = 1,
    topP = 1,
    maxOutputTokens = 200,
    parseJson = true,
  } = options;

  const payload = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature,
      topK,
      topP,
      maxOutputTokens,
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ],
  };

  try {
    const response = await fetch(GEMINI_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API request failed with status ${response.status}: ${errorText}`
      );
    }

    const responseData = await response.json();

    // Extract the text content from the response
    const generatedText =
      responseData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      console.error(
        "No generated text found in Gemini response:",
        responseData
      );
      return null;
    }

    // Process response based on parseJson option
    if (parseJson) {
      let jsonString = generatedText.trim();
      // Remove markdown code block if present
      if (jsonString.startsWith("```json") && jsonString.endsWith("```")) {
        jsonString = jsonString
          .replace(/^```json/, "")
          .replace(/```$/, "")
          .trim();
      }

      try {
        return JSON.parse(jsonString);
      } catch (err) {
        console.error(
          "Failed to parse Gemini response as JSON:",
          jsonString,
          err
        );
        return null;
      }
    } else {
      return generatedText.trim();
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return null;
  }
}
