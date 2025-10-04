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
  تحليل تقييم منتج

  وصف المنتج:
  ${productDescription}

  تقييم المستخدم:
  ${userReview}

  عدد النجوم:
  ${stars}

  المطلوب:
  حلل تقييم المستخدم مقارنةً بوصف المنتج لتحديد ما إذا كان التقييم "طبيعي" أو "سبام".

  صنّف التقييم كـ "سبام" في الحالات التالية فقط:
  1. عدم تطابق واضح بين وصف المنتج والتقييم المكتوب.
  2. التقييم عام وغير مخصص للمنتج (مثل "جيد جداً" بدون تفاصيل تشير للمنتج).
  3. وجود محتوى ترويجي أو دعائي.
  4. محتوى لا علاقة له بالمنتج أو خارج السياق.
  5. تعارض واضح بين عدد النجوم والمحتوى المكتوب (مثل تعليق سلبي مع 5 نجوم أو تعليق إيجابي مع نجمة واحدة).
  6. التقييم غير واضح، غامض، أو غير مكتمل (مثل نص قصير جداً أو غير مفهوم).
  7. التقييم يحتوي على رموز أو كلمات عشوائية لا تشكل جملة ذات معنى.

  إذا تم تصنيف التقييم كـ "سبام"، اختر أقرب سبب من القائمة أعلاه، أو استخدم "سبب آخر" إذا لم ينطبق أي منها تماماً.

  المخرجات المطلوبة:
  أعد النتيجة فقط بصيغة JSON بدون أي نص إضافي، وبالهيكل التالي:
  {
    "classification": "natural" | "spam",
    "reason": "" | "عدم تطابق بين الوصف والتقييم" | "تقييم عام وغير مخصص للمنتج" | "محتوى ترويجي" | "محتوى غير ذي صلة" | "عدم تناسق بين عدد النجوم والتعليق" | "تقييم غير واضح أو غير مكتمل" | "سبب آخر"
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
