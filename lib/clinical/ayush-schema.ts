import { z } from "zod";

/**
 * Ayurvedic Dosha Types
 */
export const DoshaEnum = z.enum(["VATA", "PITTA", "KAPHA", "VATA_PITTA", "PITTA_KAPHA", "VATA_KAPHA", "TRIDOSHA", "UNKNOWN"]);

/**
 * Agni (Digestive Fire) Types:
 * - SAMA_AGNI: Normal / Balanced
 * - MANDA_AGNI: Sluggish / Heavy / Slow (Kapha)
 * - TIKSHNA_AGNI: Hyperactive / Acidity / Intense hunger (Pitta)
 * - VISHAMA_AGNI: Irregular / Bloating / Unpredictable (Vata)
 */
export const AgniEnum = z.enum(["SAMA_AGNI", "MANDA_AGNI", "TIKSHNA_AGNI", "VISHAMA_AGNI", "UNKNOWN"]);

/**
 * Koshtha (Bowel Habit) Types:
 * - KRURA: Hard / Constipated (Vata)
 * - MRIDU: Soft / Loose / Frequent (Pitta)
 * - MADHYA: Normal / Regular (Kapha)
 */
export const KoshthaEnum = z.enum(["KRURA", "MRIDU", "MADHYA", "UNKNOWN"]);

/**
 * Structured AYUSH Clinical History Schema
 */
export const AyushClinicalDataSchema = z.object({
  prakritiAssessment: z.object({
    dominantDosha: DoshaEnum.default("UNKNOWN"),
    vataScore: z.number().min(0).max(100).default(33),
    pittaScore: z.number().min(0).max(100).default(33),
    kaphaScore: z.number().min(0).max(100).default(34),
    physicalTraits: z.string().optional(),
    temperatureSensitivity: z.enum(["INTOLERANT_TO_COLD", "INTOLERANT_TO_HEAT", "MODERATE"]).optional(),
  }),
  agniAssessment: z.object({
    agniType: AgniEnum.default("UNKNOWN"),
    appetiteLevel: z.string().optional(),
    digestionSpeed: z.string().optional(),
    postMealDiscomfort: z.string().optional(),
  }),
  koshthaAssessment: z.object({
    bowelHabit: KoshthaEnum.default("UNKNOWN"),
    stoolConsistency: z.string().optional(),
  }),
  aharaVihara: z.object({
    dietaryHabits: z.string().optional(), // Spicy, Oily, Cold, Warm, Vegetarian, Non-vegetarian
    tastePreferences: z.array(z.string()).default([]), // Sweet, Sour, Salty, Pungent, Bitter, Astringent
    sleepPattern: z.string().optional(), // Sound, Disturbed, Insomnia, Excessive
    stressLevel: z.string().optional(),
    dailyRoutine: z.string().optional(),
  }),
  dhatuImbalance: z.array(z.string()).default([]), // Rasa, Rakta, Mamsa, Meda, Asthi, Majja, Shukra
  ayurvedicSummary: z.string().optional(),
});

export type AyushClinicalData = z.infer<typeof AyushClinicalDataSchema>;

/**
 * AYUSH Question Stages for Adaptive Interview Engine
 */
export const AYUSH_INTERVIEW_QUESTIONS = {
  AGNI_APPETITE: {
    en: "How is your appetite and digestion? (e.g., normal, slow/heavy after meals, burning sensation/acidity, or irregular appetite)",
    hi: "आपकी भूख और पाचन क्रिया कैसी है? (जैसे सामान्य, खाना खाने के बाद भारीपन, जलन/एसिडिटी, या अनियमित भूख)",
    te: "మీ ఆకలి మరియు జీర్ణక్రియ ఎలా ఉంది? (సాధారణంగా, భోజనం తర్వాత కడుపు బరువుగా, ఎసిడిటీ/మంటగా, లేదా అప్పుడప్పుడు మాత్రమే ఆకలిగా ఉందా?)",
    ta: "உங்கள் பசி மற்றும் செரிமானம் எப்படி உள்ளது? (சாதாரணம், சாப்பிட்ட பிறகு மந்தம், நெஞ்செரிச்சல், அல்லது ஒழுங்கற்ற பசி)",
    kn: "ನಿಮ್ಮ ಹಸಿವು ಮತ್ತು ಜೀರ್ಣಕ್ರಿಯೆ ಹೇಗಿದೆ? (ಸಾಮಾನ್ಯ, ಊಟದ ನಂತರ ಹೊಟ್ಟೆ ಭಾರ, ಆಮ್ಲೀಯತೆ/ಉರಿ, ಅಥವಾ ಅನಿಯಮಿತ ಹಸಿವು)",
  },
  AHARA_VIHARA: {
    en: "What are your usual diet preferences (spicy, oily, sweet, cold/warm food) and how is your sleep quality?",
    hi: "आपका खान-पान कैसा है (मसालेदार, तला हुआ, मीठा, ठंडा/गर्म) और आपकी नींद कैसी रहती है?",
    te: "మీ ఆహారపు అలవాట్లు (కారం, నూనె పదార్థాలు, తీపి, చల్లని/వేడి పదార్థాలు) మరియు మీ నిద్ర ఎలా ఉంది?",
    ta: "உங்கள் உணவு பழக்கம் (காரமான, எண்ணெய், இனிப்பு, குளிர்ந்த/சூடான உணவு) மற்றும் தூக்கம் எப்படி உள்ளது?",
    kn: "ನಿಮ್ಮ ಆಹಾರ ಪದ್ಧತಿ (ಖಾರ, ಎಣ್ಣೆಯುಕ್ತ, ಸಿಹಿ, ತಂಪು/ಬಿಸಿ ಆಹಾರ) ಮತ್ತು ನಿಮ್ಮ ನಿದ್ರೆ ಹೇಗಿದೆ?",
  },
  PRAKRITI_BODY: {
    en: "Do you feel more sensitive to cold weather or hot summer, and do you tend to have dry skin or sweating easily?",
    hi: "क्या आपको ठंड ज्यादा लगती है या गर्मी ज्यादा लगती है, और क्या आपकी त्वचा सूखी रहती है या पसीना ज्यादा आता है?",
    te: "మీకు చలి ఎక్కువ తట్టుకోలేరా లేదా ఎండ ఎక్కువ తట్టుకోలేరా? మీ చర్మం పొడిగా ఉంటుందా లేదా ఎక్కువగా చెమట పడుతుందా?",
    ta: "உங்களுக்கு குளிர் அதிகம் தாங்காதா அல்லது வெப்பம் அதிகம் தாங்காதா? சருமம் வறண்டு காணப்படுகிறதா?",
    kn: "ನಿಮಗೆ ಚಳಿ ಹೆಚ್ಚು ತಡೆಯಲಾಗುವುದಿಲ್ಲವೇ ಅಥವಾ ಸೆಕೆ ಹೆಚ್ಚು ತಡೆಯಲಾಗುವುದಿಲ್ಲವೇ? ಚರ್ಮ ಒಣಗಿದಂತಾಗುತ್ತದೆಯೇ?",
  },
};