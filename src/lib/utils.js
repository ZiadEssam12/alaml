import { clsx } from "clsx";
import { getToken } from "next-auth/jwt";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const cookieKey =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

export async function getCurrentSessionData(request) {
  return await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    salt: cookieKey,
    cookieName: cookieKey,
  });
}

/**
 * Calls the Gemini API to classify a user review as natural or spam.
 *
 * @param {string} productDescription The description of the product.
 * @param {string} userReview The user's review to be classified.
 * @returns {Promise<object | null>} A promise that resolves to the parsed JSON
 *   classification result, or null if an error occurs.
 */
export async function classifyReview(productDescription, userReview, stars) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const GEMINI_API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
  if (!GEMINI_API_KEY) {
    console.error(
      "GEMINI_API_KEY is not set. Please set it as an environment variable or define it."
    );
    return null;
  }

  const prompt = `
  وصف المنتج: ${productDescription}

  تقييم المستخدم: ${userReview}

  عدد النجوم: ${stars}
  
  حلل تقييم المستخدم بالنسبة لوصف المنتج وصنف التقييم كـ 'طبيعي' أو 'سبام'. إذا كان التصنيف 'سبام'، قدم سبب مختصر باللغة العربية (مثل: 'عدم تطابق بين الوصف والتقييم'، 'تقييم عام وغير مخصص للمنتج'، 'محتوى ترويجي'، 'محتوى غير ذي صلة'، أو 'سبب آخر').

  أرجو أن يكون الإخراج فقط ككائن JSON بدون أي شرح أو نص إضافي، وبالهيكل التالي:
  {
    "classification": "natural" | "spam",
    "reason": "" | "عدم تطابق بين الوصف والتقييم" | "تقييم عام وغير مخصص للمنتج" | "محتوى ترويجي" | "محتوى غير ذي صلة" | "سبب آخر"
  }
  `;

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
      temperature: 0.2,
      topK: 1,
      topP: 1,
      maxOutputTokens: 200,
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

    // Remove markdown code block if present
    let jsonString = generatedText.trim();
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
  } catch (error) {
    console.error("Error classifying review:", error);
    return null;
  }
}
