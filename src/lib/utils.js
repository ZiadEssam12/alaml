import { clsx } from "clsx";
import { getToken } from "next-auth/jwt";
import { twMerge } from "tailwind-merge";
import { callGeminiAPI } from "./ai/geminiAPI";

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
 * @param {number} stars The star rating (1-5).
 * @returns {Promise<object | null>} A promise that resolves to the parsed JSON
 *   classification result, or null if an error occurs.
 */
export async function classifyReview(productDescription, userReview, stars) {
  const prompt = `
  Product Review Analysis

  Note:
  The product description and user review may be written in Arabic.
  Always analyze correctly regardless of the language used.
  The final output (JSON and reason) must be in English only.

  Product Description:
  ${productDescription}

  User Review:
  ${userReview}

  Star Rating:
  ${stars}

  Task:
  Analyze the user's review compared to the product description to determine whether the review is "natural" or "spam".

  Classify the review as "spam" only if one or more of the following apply:
  1. There is a clear mismatch between the product description and the written review.
  2. The review is too generic or not specific to the product (e.g., "Very good" with no product-related details).
  3. The review contains promotional or advertising content.
  4. The review is unrelated to the product or off-topic.
  5. There is a clear inconsistency between the star rating and the review content (e.g., a negative comment with 5 stars or a positive comment with 1 star).
  6. The review is unclear, incomplete, or too short to make sense.
  7. The review includes random symbols, meaningless text, or gibberish.

  If the review is classified as "spam", choose the most relevant reason from the list above, or use "Other reason" if none fully apply.

  Output:
  Return the result strictly as JSON only (no additional text), with this structure:
  {
    "classification": "natural" | "spam",
    "reason": "" | "Mismatch between description and review" | "Generic or non-specific review" | "Promotional content" | "Unrelated content" | "Inconsistency between stars and comment" | "Unclear or incomplete review" | "Other reason"
  }
  `;

  return await callGeminiAPI(prompt, {
    temperature: 0.2,
    topK: 1,
    topP: 1,
    maxOutputTokens: 200,
    parseJson: true,
  });
}

export function enReasonToArabic(reason) {
  switch (reason) {
    case "":
      return "";
    case "Mismatch between description and review":
      return "عدم تطابق بين الوصف والتقييم";
    case "Generic or non-specific review":
      return "تقييم عام أو غير محدد";
    case "Promotional content":
      return "محتوى ترويجي";
    case "Unrelated content":
      return "محتوى غير ذي صلة";
    case "Inconsistency between stars and comment":
      return "عدم اتساق بين النجوم والتعليق";
    case "Unclear or incomplete review":
      return "تقييم غير واضح أو غير مكتمل";
    case "Other reason":
      return "سبب آخر";
    default:
      return reason;
  }
}

export async function productKeywordsCreator({
  productTitle,
  productDescription,
}) {
  const prompt = `You are a **Senior SEO Consultant specializing exclusively in Egyptian E-commerce and Conversion Rate Optimization (CRO)**, with deep knowledge of search behavior, local terminology, and common pricing queries in the Arab Republic of Egypt.

    Your task is to perform an in-depth competitive analysis on the provided product content to maximize its organic visibility and sales conversions **specifically within the Egyptian market**.

    **Core Product Data:**
    **Product Title:** "${productTitle}"
    **Product Description:** "${productDescription}"

    **Analysis & Strategy (Internal Steps):**
    1. **Deep Semantic Analysis & Local Terminology:** Scrutinize the content to extract all core entities (Product Type, Brand, Attributes, Benefits). Translate these core concepts into common **Egyptian Arabic (Masri)** search terms and synonyms.
    2. **Search Intent Mapping:** Determine the likely intent, aiming for a mix of Commercial/Transactional (e.g., "اشتري", "سعر كام", "شحن مجاني", "الدفع عند الاستلام"), Informational (e.g., "مراجعة", "عيوب ومميزات"), and Geo-Specific (e.g., incorporating "في مصر" or "في القاهرة").
    3. **Keyword Generation & Prioritization:** Generate keywords that align with high commercial intent and simulated high search volume among Egyptian users.

    **Output Generation Requirements:**
    * Generate a list of **15–25 highly relevant SEO keywords/key phrases** heavily skewed toward common Egyptian Arabic (Masri) search terms.
    * **The list must include:** A minimum of 5 short-tail and a minimum of 10 long-tail keywords (incorporating Egyptian intent modifiers like 'اشتري اون لاين', 'أرخص سعر في مصر', 'تقسيط').
    * Incorporate synonyms, LSI terms, and common misspellings/variations used by Egyptian searchers.
    * **Strictly Avoid:** Competitor brand names, keywords describing other products, and duplicate phrases.
    * Do not include any preambles, explanations, or translations.
    * **Return the result strictly in valid JSON format as follows:**
    \`\`\`json
    {
      "keywords": ["keyword1", "keyword2", "keyword3", "...", "keyword25"]
    }
    \`\`\``;

  return await callGeminiAPI(prompt, {
    temperature: 0.3,
    topK: 1,
    topP: 1,
    maxOutputTokens: 400,
    parseJson: true,
  });
}
