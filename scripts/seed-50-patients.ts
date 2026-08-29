import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";
import {
  users,
  patients,
  visits,
  interviewSessions,
  interviewMessages,
  clinicalHistories,
  redFlags,
  doctorReviews,
  prescriptions,
  doctors,
} from "../db/schema";
import { eq, sql } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL environment variable is required.");
  process.exit(1);
}

const sqlClient = neon(connectionString);
const db = drizzle(sqlClient, { schema });

interface SeedPatientProfile {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  gender: "male" | "female";
  uhid: string;
  language: "en" | "hi" | "te" | "ta" | "kn";
  department: "General Medicine" | "AYUSH (Ayurveda)";
  priority: "ROUTINE" | "URGENT" | "EMERGENCY";
  status: "WAITING" | "INTAKE_IN_PROGRESS" | "READY_FOR_DOCTOR" | "IN_CONSULTATION" | "COMPLETED";
  chiefComplaint: string;
  hpi: string;
  pastHistory: string;
  medications: string[];
  allergies: string[];
  redFlagReason?: string;
  redFlagSeverity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  ayushData?: {
    agniAssessment: string;
    aharaPrakriti: string;
    prakritiAssessment: {
      vataScore: number;
      pittaScore: number;
      kaphaScore: number;
      dominantDosha: "VATA" | "PITTA" | "KAPHA" | "TRIDOSHA";
    };
  };
  qaTurns: { q: string; a: string }[];
  diagnosis?: string;
  doctorNotes?: string;
  prescribedMeds?: {
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
}

// 50 Medically Diverse Patient Cases across All Age Groups & Departments
const MOCK_50_PATIENTS: SeedPatientProfile[] = [
  // --- PEDIATRIC / INFANTS (Age 1 - 12) ---
  {
    firstName: "Aarav",
    lastName: "Sharma",
    email: "aarav.sharma@example.com",
    age: 2,
    gender: "male",
    uhid: "PED-2026-001",
    language: "hi",
    department: "General Medicine",
    priority: "URGENT",
    status: "READY_FOR_DOCTOR",
    chiefComplaint: "Acute dry cough with nocturnal wheeze and mild intercostal retractions for 3 days",
    hpi: "Toddler presented with progressive night cough, wheezing after cold milk, low fever 100.4°F. Active and drinking fluids.",
    pastHistory: "Normal term delivery, full immunization, history of viral croup at 8 months.",
    medications: ["Paracetamol drops 100mg SOS"],
    allergies: ["No known allergies"],
    redFlagReason: "Nocturnal pediatric wheeze and mild respiratory distress",
    redFlagSeverity: "HIGH",
    qaTurns: [
      { q: "बच्चे को क्या तकलीफ है?", a: "रात को बहुत तेज खांसी और सांस लेते वक्त सीटी जैसी आवाज आती है।" },
      { q: "क्या बुखार भी है?", a: "कल से 100 डिग्री बुखार है।" }
    ]
  },
  {
    firstName: "Advait",
    lastName: "Kulkarni",
    email: "advait.k@example.com",
    age: 1,
    gender: "male",
    uhid: "PED-2026-002",
    language: "en",
    department: "General Medicine",
    priority: "URGENT",
    status: "WAITING",
    chiefComplaint: "Watery diarrhea (6-7 episodes) and vomiting for 24 hours",
    hpi: "1-year-old infant with acute onset loose stools, mild periorbital sunken appearance, passing urine every 4 hours.",
    pastHistory: "Exclusively breastfed until 6 months, no previous hospitalizations.",
    medications: ["ORS solution", "Zinc syrup 20mg"],
    allergies: ["Cow's milk protein sensitivity"],
    redFlagReason: "Acute pediatric dehydration risk with high purge rate",
    redFlagSeverity: "HIGH",
    qaTurns: [
      { q: "How many episodes of loose stools?", a: "About 6 to 7 times since yesterday morning with vomiting." },
      { q: "Is the baby taking fluids?", a: "Taking breast milk and ORS slowly." }
    ]
  },
  {
    firstName: "Diya",
    lastName: "Murthy",
    email: "diya.m@example.com",
    age: 4,
    gender: "female",
    uhid: "AYU-2026-003",
    language: "kn",
    department: "AYUSH (Ayurveda)",
    priority: "ROUTINE",
    status: "COMPLETED",
    chiefComplaint: "Poor appetite, abdominal colic, and pinworm itching (Krimi Roga)",
    hpi: "4-year-old girl with recurrent perianal itching at night, teeth grinding during sleep, and picky eating habits for 3 weeks.",
    pastHistory: "History of frequent sweet consumption and playing in outdoor soil.",
    medications: ["Vidangarista 5ml with water"],
    allergies: ["No known allergies"],
    ayushData: {
      agniAssessment: "Mandagni with Purisha Vaha Srotas Krimi",
      aharaPrakriti: "Excess Madhura Rasa (sweets) and cold dairy",
      prakritiAssessment: { vataScore: 30, pittaScore: 30, kaphaScore: 40, dominantDosha: "KAPHA" }
    },
    qaTurns: [
      { q: "ಮಗುವಿಗೆ ಏನು ತೊಂದರೆ ಇದೆ?", a: "ರಾತ್ರಿ ಹೊಟ್ಟೆ ನೋವು, ಗುದದ್ವಾರದಲ್ಲಿ ತುರಿಕೆ ಮತ್ತು ಹಲ್ಲು ಕಡಿಯುವುದು ಇದೆ." },
      { q: "ಊಟ ಸರಿಯಾಗಿ ಮಾಡುತ್ತಿದ್ದಾರಾ?", a: "ಹಸಿವು ಕಡಿಮೆ ಇದೆ, ಸಿಹಿ ತಿಂಡಿಗಳನ್ನು ಮಾತ್ರ ಕೇಳುತ್ತಾರೆ." }
    ],
    diagnosis: "Krimi Roga (Intestinal Helminthiasis)",
    doctorNotes: "Krimighna Chikitsa advised along with hygiene guidance and sweet restrictions.",
    prescribedMeds: [
      { medicationName: "Krimikuthor Ras", dosage: "1 Tablet (125mg)", frequency: "0-0-1", duration: "7 Days", instructions: "Take with warm water at bedtime" },
      { medicationName: "Vidangadi Churna", dosage: "1.5g", frequency: "1-0-1", duration: "14 Days", instructions: "Take with honey before meals" }
    ]
  },
  {
    firstName: "Ananya",
    lastName: "Reddy",
    email: "ananya.reddy@example.com",
    age: 9,
    gender: "female",
    uhid: "AYU-2026-004",
    language: "te",
    department: "AYUSH (Ayurveda)",
    priority: "ROUTINE",
    status: "COMPLETED",
    chiefComplaint: "Recurrent morning sneezing and watery rhinitis (Kaphaja Pratishyaya)",
    hpi: "Child has 15-20 morning sneezing bouts on waking, clear rhinorrhea, triggered by cold air conditioning and ice cream.",
    pastHistory: "Seasonal allergy for 2 years. No bronchial asthma.",
    medications: ["Haridra Khanda 2g"],
    allergies: ["Dust", "Cold dairy"],
    ayushData: {
      agniAssessment: "Mandagni with Kapha aggravation in Urdhwa Jatrugata",
      aharaPrakriti: "Cold milk and frozen foods aggravate Kapha",
      prakritiAssessment: { vataScore: 25, pittaScore: 25, kaphaScore: 50, dominantDosha: "KAPHA" }
    },
    qaTurns: [
      { q: "పాపకి ఏమి సమస్య ఉంది?", a: "ఉదయం లేవగానే తుమ్ములు, ముక్కు కారడం ఉంది." },
      { q: "ఎప్పుడు ఎక్కువవుతుంది?", a: "చల్లటి గాలి మరియు ఐస్‌క్రీమ్ తిన్నప్పుడు." }
    ],
    diagnosis: "Kaphaja Pratishyaya (Allergic Rhinitis)",
    doctorNotes: "Avoid cold refrigerated foods. Regular steam with Tulsi.",
    prescribedMeds: [
      { medicationName: "Sitopaladi Churna", dosage: "2g", frequency: "1-0-1", duration: "14 Days", instructions: "Take with honey after meals" },
      { medicationName: "Haridra Khanda", dosage: "3g", frequency: "1-0-1", duration: "14 Days", instructions: "Take with warm water" }
    ]
  },
  {
    firstName: "Kabir",
    lastName: "Khan",
    email: "kabir.khan@example.com",
    age: 7,
    gender: "male",
    uhid: "GEN-2026-005",
    language: "hi",
    department: "General Medicine",
    priority: "ROUTINE",
    status: "WAITING",
    chiefComplaint: "High grade fever 102°F with throat pain and painful swallowing for 2 days",
    hpi: "Child developed sudden high fever, chills, difficulty swallowing solids. Bilateral tonsillar enlargement with follicular exudates noted.",
    pastHistory: "Recurrent tonsillitis episodes (3 times past year).",
    medications: ["Paracetamol syrup 250mg/5ml"],
    allergies: ["No known allergies"],
    qaTurns: [
      { q: "बच्चे को गले में क्या दिक्कत है?", a: "गले में तेज दर्द है, कुछ भी निगलने में रोने लगता है।" },
      { q: "कितने दिन से बुखार है?", a: "दो दिन से 102 डिग्री तक बुखार आ रहा है।" }
    ]
  },
  {
    firstName: "Tanvi",
    lastName: "Deshmukh",
    email: "tanvi.d@example.com",
    age: 11,
    gender: "female",
    uhid: "AYU-2026-006",
    language: "en",
    department: "AYUSH (Ayurveda)",
    priority: "ROUTINE",
    status: "READY_FOR_DOCTOR",
    chiefComplaint: "Dry itchy skin patches on flexural creases of elbows and knees (Vicharchika / Eczema)",
    hpi: "11-year-old girl with pruritic, scaly, lichenified patches on antecubital and popliteal fossae, worse after bathing and during dry weather.",
    pastHistory: "Atopic diathesis, maternal allergic asthma.",
    medications: ["Coconut oil application"],
    allergies: ["Synthetic fabrics", "Artificial food colors"],
    ayushData: {
      agniAssessment: "Vishamagni with Rakta and Twak Dushti",
      aharaPrakriti: "Excess sour and salty packaged snacks",
      prakritiAssessment: { vataScore: 45, pittaScore: 40, kaphaScore: 15, dominantDosha: "VATA" }
    },
    qaTurns: [
      { q: "Where does it itch the most?", a: "Inside elbow folds and behind the knees, especially at night." },
      { q: "Any bleeding or oozing?", a: "Dry scratching causes small crusts but no active pus." }
    ]
  },

  // --- ADOLESCENTS & YOUNG ADULTS (Age 15 - 28) ---
  {
    firstName: "Rohan",
    lastName: "Verma",
    email: "rohan.verma@example.com",
    age: 22,
    gender: "male",
    uhid: "GEN-2026-007",
    language: "en",
    department: "General Medicine",
    priority: "ROUTINE",
    status: "COMPLETED",
    chiefComplaint: "Retrosternal burning, acid regurgitation, and postprandial nausea for 10 days",
    hpi: "College student with epigastric burning radiating to chest, exacerbated by late night caffeine and oily street food during semester exams.",
    pastHistory: "No chronic diseases, erratic sleep schedule.",
    medications: ["Antacid liquid 10ml SOS"],
    allergies: ["No known allergies (NKDA)"],
    qaTurns: [
      { q: "What symptoms are you feeling?", a: "Severe heartburn and sour water coming up in my mouth at night." },
      { q: "How long has it been happening?", a: "For about 10 days during exam preparations." }
    ],
    diagnosis: "Gastroesophageal Reflux Disease (GERD) / Acid Peptic Disorder",
    doctorNotes: "Elevate head of bed, avoid meals 3 hours before sleep, limit coffee to 1 cup/day.",
    prescribedMeds: [
      { medicationName: "Tab Pantoprazole", dosage: "40mg", frequency: "1-0-0", duration: "14 Days", instructions: "Take on empty stomach 30 mins before breakfast" },
      { medicationName: "Tab Domperidone", dosage: "10mg", frequency: "1-0-1", duration: "7 Days", instructions: "Take 15 mins before meals" }
    ]
  },
  {
    firstName: "Meenakshi",
    lastName: "Sundaram",
    email: "meenakshi.s@example.com",
    age: 26,
    gender: "female",
    uhid: "AYU-2026-008",
    language: "ta",
    department: "AYUSH (Ayurveda)",
    priority: "ROUTINE",
    status: "IN_CONSULTATION",
    chiefComplaint: "Severe throbbing unilateral headache with photophobia and nausea (Ardhavabhedaka / Migraine)",
    hpi: "Software engineer experiencing right temporal pounding headache lasting 8-12 hours, triggered by skipped meals, bright sunlight, and mental stress.",
    pastHistory: "Episodes occur 2-3 times a month for past 2 years.",
    medications: ["Pathyadi Kadha 15ml"],
    allergies: ["No known drug allergies"],
    ayushData: {
      agniAssessment: "Tikshnagni with Pitta-Vata vitiation in Shiro Pradesh",
      aharaPrakriti: "Excessive screen time, fasting, and dry spicy diet",
      prakritiAssessment: { vataScore: 40, pittaScore: 50, kaphaScore: 10, dominantDosha: "PITTA" }
    },
    qaTurns: [
      { q: "தலைவலி எப்படி உள்ளது?", a: "தலையின் வலது பக்கத்தில் துடிக்கும் வலி, வெளிச்சத்தை பார்த்தால் வாந்தி வருகிறது." },
      { q: "எப்போது அதிகமாகிறது?", a: "நேரத்திற்கு சாப்பிடாத போது மற்றும் வெயிலில் செல்லும் போது." }
    ]
  },
  {
    firstName: "Kartik",
    lastName: "Nambiar",
    email: "kartik.n@example.com",
    age: 24,
    gender: "male",
    uhid: "GEN-2026-009",
    language: "en",
    department: "General Medicine",
    priority: "ROUTINE",
    status: "READY_FOR_DOCTOR",
    chiefComplaint: "Acute right ankle pain, swelling, and inability to bear weight after football sprain",
    hpi: "Inversion ankle injury 18 hours ago during sports. Immediate lateral malleolar swelling and ecchymosis. Able to take 2-3 assisted steps.",
    pastHistory: "No prior ankle fractures or joint instability.",
    medications: ["Ice pack application", "Tab Paracetamol 650mg"],
    allergies: ["No known allergies"],
    qaTurns: [
      { q: "How did the injury happen?", a: "Twisted my right foot inwards while landing during a football match." },
      { q: "Did you hear a pop sound?", a: "No pop sound, but severe swelling and tenderness on outer ankle bone." }
    ]
  },
  {
    firstName: "Sneha",
    lastName: "Banerjee",
    email: "sneha.b@example.com",
    age: 21,
    gender: "female",
    uhid: "AYU-2026-010",
    language: "hi",
    department: "AYUSH (Ayurveda)",
    priority: "ROUTINE",
    status: "COMPLETED",
    chiefComplaint: "Irregular painful menstruation with severe lower abdominal spasms (Kashtartava / Dysmenorrhea)",
    hpi: "College student with spasmodic pelvic pain on Day 1-2 of menses, low backache, fatigue, and mood swings. Relieved by hot water bag.",
    pastHistory: "Menarche at age 13. Ultrasound pelvis normal.",
    medications: ["Kumariasava 20ml with water"],
    allergies: ["No known allergies"],
    ayushData: {
      agniAssessment: "Vishamagni with Apana Vata Vaigunya",
      aharaPrakriti: "Vata aggravating lifestyle, late night studying, anxiety",
      prakritiAssessment: { vataScore: 55, pittaScore: 30, kaphaScore: 15, dominantDosha: "VATA" }
    },
    qaTurns: [
      { q: "दर्द कब सबसे ज्यादा होता है?", a: "पीरियड्स के पहले और दूसरे दिन असहनीय मरोड़ और कमर दर्द होता है।" },
      { q: "क्या कोई घरेलू उपाय करते हैं?", a: "गर्म पानी की सिकाई और अदरक वाली चाय से थोड़ा आराम मिलता है।" }
    ],
    diagnosis: "Kashtartava (Primary Spasmodic Dysmenorrhea due to Apana Vata Vitiation)",
    doctorNotes: "Advised Yogasana (Baddha Konasana, Marjariasana) and warm dietary regimen.",
    prescribedMeds: [
      { medicationName: "Ashokarishta", dosage: "20ml", frequency: "1-0-1", duration: "30 Days", instructions: "Mix with equal warm water after meals" },
      { medicationName: "Raja Pravartini Vati", dosage: "1 Tablet (250mg)", frequency: "1-0-1", duration: "10 Days", instructions: "Take before menstrual cycle" }
    ]
  },
  {
    firstName: "Harish",
    lastName: "Trivedi",
    email: "harish.t@example.com",
    age: 27,
    gender: "male",
    uhid: "GEN-2026-011",
    language: "hi",
    department: "General Medicine",
    priority: "URGENT",
    status: "IN_CONSULTATION",
    chiefComplaint: "High continuous fever 103°F with severe retro-orbital headache and thrombocytopenia (Dengue suspect)",
    hpi: "4-day history of sudden onset high fever with severe myalgia (breakbone ache), painful eye movements, rash on forearms. Platelet count 85,000/mcL yesterday.",
    pastHistory: "No prior chronic illness. Mosquito exposure in neighborhood.",
    medications: ["Tab Paracetamol 650mg QID"],
    allergies: ["Avoid NSAIDs (Ibuprofen/Aspirin contraindicated)"],
    redFlagReason: "Acute febrile illness with thrombocytopenia and viral bleeding warning signs",
    redFlagSeverity: "HIGH",
    qaTurns: [
      { q: "बुखार के साथ और क्या लक्षण हैं?", a: "आँखों के पीछे तेज दर्द, बदन दर्द और हाथ पर लाल चकत्ते दिख रहे हैं।" },
      { q: "क्या कोई खून बहने के लक्षण हैं?", a: "मसूड़ों या नाक से खून नहीं आया है, पर बहुत कमजोरी है।" }
    ]
  },
  {
    firstName: "Pooja",
    lastName: "Hegde",
    email: "pooja.h@example.com",
    age: 28,
    gender: "female",
    uhid: "AYU-2026-012",
    language: "kn",
    department: "AYUSH (Ayurveda)",
    priority: "ROUTINE",
    status: "WAITING",
    chiefComplaint: "Excessive hair fall, dry scaly scalp, and split ends (Khalitya / Darunak)",
    hpi: "Corporate professional losing >100 hair strands daily for 3 months. Dry dandruff with itching and thinning at crown area.",
    pastHistory: "Post-COVID telogen effluvium 1 year ago.",
    medications: ["Bhringaraj oil"],
    allergies: ["Chemical hair dyes"],
    ayushData: {
      agniAssessment: "Tikshnagni with Bhrajaka Pitta and Asthi-Dhatu Kshaya",
      aharaPrakriti: "High stress, spicy restaurant food, irregular hydration",
      prakritiAssessment: { vataScore: 40, pittaScore: 45, kaphaScore: 15, dominantDosha: "PITTA" }
    },
    qaTurns: [
      { q: "ಕೂದಲು ಉದುರುವಿಕೆ ಎಷ್ಟು ದಿನಗಳಿಂದ ಇದೆ?", a: "ಕಳೆದ ಮೂರು ತಿಂಗಳುಗಳಿಂದ ಬಾಚುವಾಗ ಗೊಂಚಲು ಗೊಂಚಲಾಗಿ ಕೂದಲು ಉದುರುತ್ತಿದೆ." },
      { q: "ತಲೆಯಲ್ಲಿ ಹೊಟ್ಟು ಅಥವಾ ತುರಿಕೆ ಇದೆಯೇ?", a: "ಹೌದು, ತಲೆಯ ಚರ್ಮ ಒಣಗಿ ಬಿಳಿ ಹೊಟ್ಟು ಉದುರುತ್ತದೆ." }
    ]
  },

  // --- WORKING PROFESSIONALS & EARLY MIDDLE AGE (Age 30 - 45) ---
  {
    firstName: "Vikram",
    lastName: "Patel",
    email: "vikram.patel@example.com",
    age: 38,
    gender: "male",
    uhid: "GEN-2026-013",
    language: "en",
    department: "General Medicine",
    priority: "ROUTINE",
    status: "WAITING",
    chiefComplaint: "Acute lumbar muscle spasm radiating to left buttock after heavy lifting",
    hpi: "Mechanical engineer with sudden catching low back ache on bending, straight leg raise 60° on left, no foot drop.",
    pastHistory: "Desk workstation job, mild occasional postural stiffness.",
    medications: ["Tab Aceclofenac + Paracetamol"],
    allergies: ["Aspirin allergy"],
    qaTurns: [
      { q: "Where does it hurt most?", a: "Lower back shoots pain to my left buttock when I try to straighten up." },
      { q: "Any numbness or weakness in toes?", a: "No numbness or bladder issues." }
    ]
  },
  {
    firstName: "Priya",
    lastName: "Nair",
    email: "priya.nair@example.com",
    age: 42,
    gender: "female",
    uhid: "GEN-2026-014",
    language: "en",
    department: "General Medicine",
    priority: "ROUTINE",
    status: "COMPLETED",
    chiefComplaint: "Bilateral feet burning sensation, tingling, and nocturnal polyuria for 1 month",
    hpi: "Patient with 4-year history of Type 2 Diabetes presenting with stocking pattern paresthesia, fasting glucose 172 mg/dL, HbA1c 8.2%.",
    pastHistory: "Gestational diabetes 14 years ago, maternal history of diabetes.",
    medications: ["Tab Metformin 500mg BD"],
    allergies: ["No known allergies"],
    qaTurns: [
      { q: "What brings you to the clinic?", a: "Burning and tingling sensation in the soles of both feet at night." },
      { q: "How are your blood sugar levels?", a: "Fasting was 172 mg/dL and postprandial 255 mg/dL last week." }
    ],
    diagnosis: "Type 2 Diabetes Mellitus with Diabetic Peripheral Neuropathy",
    doctorNotes: "Reinforce diabetic medical nutrition therapy. Monitor HbA1c every 3 months.",
    prescribedMeds: [
      { medicationName: "Tab Metformin SR", dosage: "1000mg", frequency: "1-0-1", duration: "30 Days", instructions: "Take with meals" },
      { medicationName: "Tab Pregabalin + Methylcobalamin", dosage: "75mg/1500mcg", frequency: "0-0-1", duration: "30 Days", instructions: "Take at bedtime" }
    ]
  },
  {
    firstName: "Anand",
    lastName: "Choudhary",
    email: "anand.c@example.com",
    age: 35,
    gender: "male",
    uhid: "AYU-2026-015",
    language: "hi",
    department: "AYUSH (Ayurveda)",
    priority: "ROUTINE",
    status: "COMPLETED",
    chiefComplaint: "Chronic constipation, hard pellet stools, and painful defecation (Vibandha / Arshas)",
    hpi: "Bank manager with 6-month history of straining at stool every 2-3 days, occasional fresh blood streaks on toilet paper, abdominal bloating.",
    pastHistory: "Sedentary sitting for 9 hours daily, low fiber diet.",
    medications: ["Isabgol husk 2 tsp"],
    allergies: ["No known allergies"],
    ayushData: {
      agniAssessment: "Mandagni with Apana Vata Rukshata",
      aharaPrakriti: "Refined flour (Maida), low water intake (<1.5L/day)",
      prakritiAssessment: { vataScore: 60, pittaScore: 25, kaphaScore: 15, dominantDosha: "VATA" }
    },
    qaTurns: [
      { q: "शौच में क्या परेशानी हो रही है?", a: "दो-तीन दिन में एक बार बहुत जोर लगाने पर कड़ा मल आता है और दर्द होता है।" },
      { q: "क्या कभी खून भी आता है?", a: "मल के बाद कभी-कभी लाल खून की बूंदें गिरती हैं।" }
    ],
    diagnosis: "Vibandha with Grade 1 Abhyantara Arshas (Internal Hemorrhoids)",
    doctorNotes: "Increase dietary fiber to 35g/day, drink 3L warm water. Warm water sitz bath twice daily.",
    prescribedMeds: [
      { medicationName: "Triphala Guggulu", dosage: "2 Tablets", frequency: "0-0-1", duration: "30 Days", instructions: "Take with warm water at bedtime" },
      { medicationName: "Abhayarishta", dosage: "20ml", frequency: "1-0-1", duration: "30 Days", instructions: "Take with equal warm water after meals" }
    ]
  },
  {
    firstName: "Deepa",
    lastName: "Raman",
    email: "deepa.r@example.com",
    age: 33,
    gender: "female",
    uhid: "GEN-2026-016",
    language: "ta",
    department: "General Medicine",
    priority: "ROUTINE",
    status: "READY_FOR_DOCTOR",
    chiefComplaint: "Unexplained weight gain, chronic fatigue, cold intolerance, and constipation for 3 months",
    hpi: "School teacher gained 6kg in 3 months despite reduced appetite, puffy face in morning, dry brittle hair. TSH 8.4 mIU/L on recent lab report.",
    pastHistory: "Postpartum thyroiditis 4 years ago.",
    medications: ["No regular medications"],
    allergies: ["No known allergies"],
    qaTurns: [
      { q: "எந்த அறிகுறிகள் உங்களை அதிகம் பாதிக்கின்றன?", a: "எப்போதும் சோர்வாக இருக்கிறது, குளிர் தாங்க முடியவில்லை, உடல் எடை கூடிக்கொண்டே போகிறது." },
      { q: "தைராய்டு பரிசோதனை செய்தீர்களா?", a: "ஆம், கடந்த வாரம் ரத்த பரிசோதனையில் TSH 8.4 என்று வந்தது." }
    ]
  },
  {
    firstName: "Manish",
    lastName: "Joshi",
    email: "manish.j@example.com",
    age: 44,
    gender: "male",
    uhid: "GEN-2026-017",
    language: "hi",
    department: "General Medicine",
    priority: "URGENT",
    status: "READY_FOR_DOCTOR",
    chiefComplaint: "Severe left flank colicky pain radiating to groin with microscopic hematuria (Renal Calculus)",
    hpi: "Sudden onset excruciating left loin pain radiating to anterior abdomen, nausea, 2 episodes of non-bilious vomiting, burning micturition.",
    pastHistory: "Previous right renal stone (5mm) passed spontaneously 3 years ago.",
    medications: ["Tab Drotaverine 80mg SOS"],
    allergies: ["No known drug allergies"],
    redFlagReason: "Acute renal colic with microscopic hematuria and severe unyielding pain",
    redFlagSeverity: "HIGH",
    qaTurns: [
      { q: "दर्द कहाँ से कहाँ जा रहा है?", a: "बाईं तरफ कमर से शुरू होकर पेट के निचले हिस्से और जांघ तक तेज मरोड़ उठ रही है।" },
      { q: "पेशाब में क्या कोई जलन या खून दिखा?", a: "पेशाब में तेज जलन है और रंग हल्का लाल दिख रहा था।" }
    ]
  },
  {
    firstName: "Swati",
    lastName: "Bhide",
    email: "swati.b@example.com",
    age: 39,
    gender: "female",
    uhid: "AYU-2026-018",
    language: "en",
    department: "AYUSH (Ayurveda)",
    priority: "ROUTINE",
    status: "IN_CONSULTATION",
    chiefComplaint: "Persistent neck stiffness, radiating shoulder ache, and tingling in fingers (Manyastambha / Cervical Spondylosis)",
    hpi: "IT professional working on laptop 10 hours daily. Pain in lower cervical spine radiating down lateral aspect of right arm to index finger.",
    pastHistory: "No history of cervical trauma or disc surgery.",
    medications: ["Dhanwantaram Taila for massage"],
    allergies: ["NSAID gastritis"],
    ayushData: {
      agniAssessment: "Sama Agni with localized Vata Sthanasamshraya in Greeva Sandhi",
      aharaPrakriti: "Sedentary workstation posture with neck forward flexion",
      prakritiAssessment: { vataScore: 50, pittaScore: 30, kaphaScore: 20, dominantDosha: "VATA" }
    },
    qaTurns: [
      { q: "Does the neck pain travel to your fingers?", a: "Yes, numbness and tingling shoot down to my right thumb and index finger." },
      { q: "When is it worst?", a: "After working 4-5 hours continuously on laptop." }
    ]
  },

  // --- LATE MIDDLE AGE (Age 46 - 60) ---
  {
    firstName: "Suresh",
    lastName: "Gowda",
    email: "suresh.gowda@example.com",
    age: 46,
    gender: "male",
    uhid: "AYU-2026-019",
    language: "kn",
    department: "AYUSH (Ayurveda)",
    priority: "ROUTINE",
    status: "READY_FOR_DOCTOR",
    chiefComplaint: "Stiffness and dull aching pain in lower back and cervical spine (Kati Graha / Sandhivata)",
    hpi: "Farmer and truck driver presenting with 6-month history of worsening stiffness in lumbar region, aggravated during morning hours and cold winter weather.",
    pastHistory: "Hypertension for 2 years on regular medication.",
    medications: ["Tab Telmisartan 40mg", "Yogaraja Guggulu 2 tabs"],
    allergies: ["Sulfa drugs"],
    ayushData: {
      agniAssessment: "Vishamagni with abdominal flatulence",
      aharaPrakriti: "Vata aggravating dry food, irregular timings, prolonged driving vibration",
      prakritiAssessment: { vataScore: 55, pittaScore: 25, kaphaScore: 20, dominantDosha: "VATA" }
    },
    qaTurns: [
      { q: "ನಿಮಗೆ ಯಾವ ಸಮಸ್ಯೆಯಿದೆ?", a: "ಬೆನ್ನು ನೋವು ಮತ್ತು ಸೊಂಟ ಹಿಡಿದುಕೊಂಡಂತೆ ಆಗುತ್ತದೆ." },
      { q: "ಎಷ್ಟು ದಿನಗಳಿಂದ ಈ ನೋವಿದೆ?", a: "ಕಳೆದ 6 ತಿಂಗಳುಗಳಿಂದ ಇದೆ, ಚಳಿಗಾಲದಲ್ಲಿ ಜಾಸ್ತಿಯಾಗುತ್ತದೆ." }
    ]
  },
  {
    firstName: "Rajesh",
    lastName: "Kapoor",
    email: "rajesh.kapoor@example.com",
    age: 52,
    gender: "male",
    uhid: "GEN-2026-020",
    language: "hi",
    department: "General Medicine",
    priority: "URGENT",
    status: "IN_CONSULTATION",
    chiefComplaint: "Severe pulsating occipital headache, blurred vision, and high blood pressure for 1 day",
    hpi: "Severe throbbing headache starting early morning with dizziness, home digital BP 175/105 mmHg, missed antihypertensive doses past 4 days.",
    pastHistory: "Known Essential Hypertension for 7 years, Type 2 Diabetes for 3 years.",
    medications: ["Tab Amlodipine 5mg", "Tab Metformin 500mg"],
    allergies: ["No known allergies"],
    redFlagReason: "Hypertensive urgency (BP > 175/105 mmHg) with visual blurring and severe occipital headache",
    redFlagSeverity: "CRITICAL",
    qaTurns: [
      { q: "आपको क्या समस्या हो रही है?", a: "सिर के पिछले हिस्से में बहुत तेज दर्द और चक्कर आ रहे हैं।" },
      { q: "क्या आपने बीपी चेक किया था?", a: "हाँ, सुबह घर पर चेक किया तो 175/105 आया था।" }
    ]
  },
  {
    firstName: "Lakshmi",
    lastName: "Prasad",
    email: "lakshmi.p@example.com",
    age: 54,
    gender: "female",
    uhid: "AYU-2026-021",
    language: "te",
    department: "AYUSH (Ayurveda)",
    priority: "ROUTINE",
    status: "COMPLETED",
    chiefComplaint: "Hot flashes, sleep disturbances, mood swings, and joint crepitus (Rajonivrutti Janya / Menopausal syndrome)",
    hpi: "54-year-old menopausal woman with sudden episodic flushing of face/neck, nocturnal sweating, palpitations, and generalized body aches.",
    pastHistory: "Menopause attained at age 51. Borderline osteopenia.",
    medications: ["Shatavari Ghyrita 1 tsp"],
    allergies: ["No known allergies"],
    ayushData: {
      agniAssessment: "Vishamagni with Vata-Pitta Prakopa and Dhatu Kshaya",
      aharaPrakriti: "Spicy dietary habits aggravating Pitta flush episodes",
      prakritiAssessment: { vataScore: 45, pittaScore: 45, kaphaScore: 10, dominantDosha: "VATA" }
    },
    qaTurns: [
      { q: "ఏమి ఇబ్బందిగా ఉంది?", a: "రాత్రి పూట ఒక్కసారిగా ఒళ్లంతా సెగలు వచ్చి చెమటలు పడుతున్నాయి, నిద్ర పట్టడం లేదు." },
      { q: "కీళ్ల నొప్పులు ఉన్నాయా?", a: "అవును, కాళ్ళ కీళ్ళు మరియు నడుము నొప్పి కూడా ఉంది." }
    ],
    diagnosis: "Rajonivrutti Janya Lakshana (Menopausal Syndrome with Pitta-Vata Dominance)",
    doctorNotes: "Advised Nasya with Ksheerabala Taila and regular intake of milk with Shatavari Churna.",
    prescribedMeds: [
      { medicationName: "Shatavari Tablet", dosage: "500mg", frequency: "1-0-1", duration: "30 Days", instructions: "Take with warm milk after meals" },
      { medicationName: "Brahmi Vati", dosage: "1 Tablet", frequency: "0-0-1", duration: "30 Days", instructions: "Take at bedtime with water" }
    ]
  },
  {
    firstName: "Devendra",
    lastName: "Singh",
    email: "devendra.s@example.com",
    age: 58,
    gender: "male",
    uhid: "GEN-2026-022",
    language: "hi",
    department: "General Medicine",
    priority: "ROUTINE",
    status: "COMPLETED",
    chiefComplaint: "Urinary hesitancy, weak stream, nocturia (3-4 times), and sensation of incomplete bladder emptying (BPH)",
    hpi: "Retired government official with progressive obstructive lower urinary tract symptoms for 9 months, International Prostate Symptom Score (IPSS) 19 (Moderate).",
    pastHistory: "Hypertension on Telmisartan 40mg. Normal serum PSA (2.1 ng/mL).",
    medications: ["Tab Telmisartan 40mg"],
    allergies: ["No known allergies"],
    qaTurns: [
      { q: "पेशाब करने में क्या दिक्कत आती है?", a: "पेशाब शुरू होने में देर लगती है, धार कमजोर है और रात को 4 बार उठना पड़ता है।" },
      { q: "क्या कभी पेशाब रुकावट या दर्द हुआ?", a: "दर्द नहीं है लेकिन लगता है कि मूत्राशय पूरी तरह खाली नहीं हुआ।" }
    ],
    diagnosis: "Benign Prostatic Hyperplasia (BPH) with Lower Urinary Tract Symptoms (LUTS)",
    doctorNotes: "Avoid fluids after 8 PM, limit evening tea. Annual PSA surveillance.",
    prescribedMeds: [
      { medicationName: "Tab Tamsulosin", dosage: "0.4mg", frequency: "0-0-1", duration: "30 Days", instructions: "Take 30 mins after dinner" },
      { medicationName: "Tab Finasteride", dosage: "5mg", frequency: "1-0-0", duration: "30 Days", instructions: "Take in morning" }
    ]
  },
  {
    firstName: "Sunita",
    lastName: "Agarwal",
    email: "sunita.a@example.com",
    age: 49,
    gender: "female",
    uhid: "AYU-2026-023",
    language: "hi",
    department: "AYUSH (Ayurveda)",
    priority: "ROUTINE",
    status: "WAITING",
    chiefComplaint: "Excessive body weight, breathlessness on climbing stairs, and sluggish digestion (Medoroga / Sthaulya)",
    hpi: "Homemaker presenting with BMI 31.8 kg/m2, heaviness in abdomen, lethargy, excessive sweating, and post-meal somnolence.",
    pastHistory: "Hypothyroidism on Levothyroxine 50mcg. Sedentary lifestyle.",
    medications: ["Tab Thyronorm 50mcg"],
    allergies: ["No known allergies"],
    ayushData: {
      agniAssessment: "Manda Medo Dhatwagni with Medo-Dhatu Vriddhi",
      aharaPrakriti: "High carbohydrate, fried snacks, afternoon sleeping (Diwaswapna)",
      prakritiAssessment: { vataScore: 20, pittaScore: 20, kaphaScore: 60, dominantDosha: "KAPHA" }
    },
    qaTurns: [
      { q: "वजन के अलावा क्या समस्या है?", a: "थोड़ा चलने पर सांस फूलने लगती है और पूरा दिन शरीर में भारीपन और आलस रहता है।" },
      { q: "खान-पान और दिनचर्या कैसी है?", a: "दोपहर में खाना खाकर सोने की आदत है और व्यायाम नहीं हो पाता।" }
    ]
  },
  {
    firstName: "Ramesh",
    lastName: "Babu",
    email: "ramesh.babu@example.com",
    age: 56,
    gender: "male",
    uhid: "GEN-2026-024",
    language: "te",
    department: "General Medicine",
    priority: "ROUTINE",
    status: "READY_FOR_DOCTOR",
    chiefComplaint: "Exertional retrosternal tightness relieved by rest, bilateral pedal edema (Stable Angina / CAD evaluation)",
    hpi: "Shop owner reports retrosternal heaviness after walking briskly 200 meters or climbing 1 flight of stairs, subsides in 5 minutes with rest. No radiation to jaw.",
    pastHistory: "Type 2 Diabetes for 12 years, Dyslipidemia (LDL 158 mg/dL).",
    medications: ["Tab Glimepiride 2mg", "Tab Atorvastatin 20mg"],
    allergies: ["No known allergies"],
    qaTurns: [
      { q: "నడుస్తున్నప్పుడు గుండెల్లో ఎలా ఉంటుంది?", a: "వేగంగా నడిస్తే లేదా మెట్లు ఎక్కితే గుండె మీద బరువుగా అనిపిస్తుంది, కూర్చుంటే తగ్గిపోతుంది." },
      { q: "ఎడమ చేతికి నొప్పి పాకుతోందా?", a: "చేతికి పాకడం లేదు, కానీ ఆయాసంగా ఉంటుంది." }
    ]
  },

  // --- GERIATRIC & ELDERLY (Age 61 - 85) ---
  {
    firstName: "Kausalya",
    lastName: "Devi",
    email: "kausalya.d@example.com",
    age: 68,
    gender: "female",
    uhid: "AYU-2026-025",
    language: "te",
    department: "AYUSH (Ayurveda)",
    priority: "ROUTINE",
    status: "COMPLETED",
    chiefComplaint: "Bilateral knee joint crepitus, severe pain on stair climbing (Janu Sandhigata Vata)",
    hpi: "Progressive bilateral knee joint pain for 2 years, severe on standing up from floor, morning stiffness 20 mins, crepitus sound.",
    pastHistory: "Menopause at age 48, mild osteopenia.",
    medications: ["Shallaki 500mg"],
    allergies: ["Ibuprofen gastric upset"],
    ayushData: {
      agniAssessment: "Vishamagni with Asthi-Majja Dhatu Kshaya",
      aharaPrakriti: "Vata prakopa due to Vardhakya (aging)",
      prakritiAssessment: { vataScore: 60, pittaScore: 20, kaphaScore: 20, dominantDosha: "VATA" }
    },
    qaTurns: [
      { q: "నొప్పులు ఎలా ఉన్నాయి?", a: "రెండు మోకాళ్ళలో నడిస్తే టక్ టక్ శబ్దం వస్తుంది, మెట్లు ఎక్కడం చాలా కష్టం." },
      { q: "ఏవైనా మందులు వాడుతున్నారా?", a: "ఆయుర్వేద షల్లకి మాత్రలు వాడుతున్నాను." }
    ],
    diagnosis: "Janu Sandhigata Vata (Bilateral Knee Osteoarthritis with Dhatu Kshaya)",
    doctorNotes: "Janu Basti therapy prescribed. Avoid squatting on floor.",
    prescribedMeds: [
      { medicationName: "Shallaki Tablet", dosage: "500mg", frequency: "1-0-1", duration: "30 Days", instructions: "Take with warm water after meals" },
      { medicationName: "Yogaraja Guggulu", dosage: "2 Tablets", frequency: "1-0-1", duration: "30 Days", instructions: "Take with warm water after food" },
      { medicationName: "Mahanarayana Taila", dosage: "External", frequency: "1-0-1", duration: "30 Days", instructions: "Apply gently on both knees" }
    ]
  },
  {
    firstName: "Narasimha",
    lastName: "Rao",
    email: "narasimha.rao@example.com",
    age: 74,
    gender: "male",
    uhid: "GEN-2026-026",
    language: "en",
    department: "General Medicine",
    priority: "URGENT",
    status: "READY_FOR_DOCTOR",
    chiefComplaint: "Shortness of breath on mild exertion, chronic productive cough with yellowish sputum for 5 days",
    hpi: "Known COPD patient with 30 pack-year smoking history, presenting with worsening dyspnea mMRC Grade 3, purulent sputum, SpO2 92% on room air.",
    pastHistory: "COPD diagnosed 10 years ago, Hypertension 15 years.",
    medications: ["Formoterol + Budesonide inhaler", "Tab Amlodipine 5mg"],
    allergies: ["Penicillin allergy (skin rash)"],
    redFlagReason: "COPD acute exacerbation with SpO2 92% and purulent sputum",
    redFlagSeverity: "HIGH",
    qaTurns: [
      { q: "What is your main difficulty?", a: "Heavy breathlessness even after walking 10 steps and thick yellow cough." },
      { q: "Are you using your regular inhalers?", a: "Yes, using inhalers twice daily, but breathlessness is still severe." }
    ]
  },
  {
    firstName: "Gopalakrishna",
    lastName: "Iyer",
    email: "gopal.iyer@example.com",
    age: 71,
    gender: "male",
    uhid: "AYU-2026-027",
    language: "ta",
    department: "AYUSH (Ayurveda)",
    priority: "ROUTINE",
    status: "IN_CONSULTATION",
    chiefComplaint: "Tremor in right hand at rest, slow shuffling gait, and muscular rigidity (Kampa Vata / Parkinsonism)",
    hpi: "Retired bank manager presenting with 1-year history of pill-rolling resting tremor in right fingers, micrographic handwriting, and difficulty rising from chair.",
    pastHistory: "No cerebrovascular stroke or head injury.",
    medications: ["Kapikacchu Churna 3g"],
    allergies: ["No known allergies"],
    ayushData: {
      agniAssessment: "Mandagni with Majja-Vaha Srotas Vata Prakopa",
      aharaPrakriti: "Vata aggravating light dry diet and sleep disruption",
      prakritiAssessment: { vataScore: 65, pittaScore: 20, kaphaScore: 15, dominantDosha: "VATA" }
    },
    qaTurns: [
      { q: "கை நடுக்கம் எப்போது அதிகமாக உள்ளது?", a: "அமைதியாக உட்காரும்போது வலது கையில் நடுக்கம் அதிகம், எழுதும்போது எழுத்துக்கள் சிறிதாகிறது." },
      { q: "நடை பழக்கம் எப்படி உள்ளது?", a: "கால்களை மெதுவாக இழுத்து நடக்க வேண்டியுள்ளது." }
    ]
  },
  {
    firstName: "Saraswathi",
    lastName: "Amma",
    email: "saraswathi.a@example.com",
    age: 80,
    gender: "female",
    uhid: "GEN-2026-028",
    language: "kn",
    department: "General Medicine",
    priority: "ROUTINE",
    status: "COMPLETED",
    chiefComplaint: "Generalized weakness, loss of memory for recent events, dizziness on standing (Orthostatic hypotension / Dementia workup)",
    hpi: "80-year-old female brought by son with progressive short-term memory loss (MMSE 21/30), postural dizziness on standing, mild iron deficiency anemia (Hb 9.8 g/dL).",
    pastHistory: "Hypertension, Osteoporosis on Calcium + Vit D3.",
    medications: ["Tab Telmisartan 20mg", "Tab Shelcal 500mg"],
    allergies: ["No known allergies"],
    qaTurns: [
      { q: "ತಲೆಸುತ್ತು ಯಾವಾಗ ಬರುತ್ತದೆ?", a: "ಮಲಗಿದ ಸ್ಥಳದಿಂದ ಎದ್ದು ನಿಂತಾಗ ಕಣ್ಣು ಕತ್ತಲೆ ಬರುತ್ತದೆ." },
      { q: "ನೆನಪಿನ ಶಕ್ತಿ ಹೇಗಿದೆ?", a: "ಇತ್ತೀಚಿನ ವಿಷಯಗಳು ಮರೆತುಹೋಗುತ್ತವೆ, ಹಳೆಯ ವಿಷಯಗಳು ನೆನಪಿರುತ್ತವೆ." }
    ],
    diagnosis: "Mild Cognitive Impairment with Orthostatic Hypotension and Senile Anemia",
    doctorNotes: "Hydration encouragement (>2L/day), compression stockings, cognitive memory stimulation exercises.",
    prescribedMeds: [
      { medicationName: "Tab Donepezil", dosage: "5mg", frequency: "0-0-1", duration: "30 Days", instructions: "Take at bedtime" },
      { medicationName: "Syrup Autrin (Iron)", dosage: "10ml", frequency: "1-0-0", duration: "30 Days", instructions: "Take after breakfast with citrus juice" }
    ]
  },
  {
    firstName: "Bhagwandas",
    lastName: "Gupta",
    email: "bhagwandas.g@example.com",
    age: 78,
    gender: "male",
    uhid: "GEN-2026-029",
    language: "hi",
    department: "General Medicine",
    priority: "EMERGENCY",
    status: "IN_CONSULTATION",
    chiefComplaint: "Acute crushing retrosternal chest pain radiating to left jaw with profuse sweating for 45 minutes",
    hpi: "Elderly male presented with acute onset severe retrosternal squeezing pain (10/10 severity), diaphoresis, shortness of breath. Pulse 104 bpm, BP 148/92 mmHg.",
    pastHistory: "Type 2 Diabetes for 20 years, Smoker (quit 15 years ago).",
    medications: ["Tab Metformin 1000mg", "Tab Glimepiride 2mg"],
    allergies: ["No known allergies"],
    redFlagReason: "Acute Coronary Syndrome / ST-Elevation Myocardial Infarction Suspect with Diaphoresis",
    redFlagSeverity: "CRITICAL",
    qaTurns: [
      { q: "सीने में दर्द कैसा महसूस हो रहा है?", a: "सीने पर बहुत भारी पत्थर जैसा दबाव लग रहा है और पसीना छूट रहा है।" },
      { q: "क्या दर्द कहीं और भी जा रहा है?", a: "बाएं हाथ और जबड़े की तरफ दर्द खींच रहा है।" }
    ]
  },
  {
    firstName: "Savithri",
    lastName: "Rao",
    email: "savithri.r@example.com",
    age: 65,
    gender: "female",
    uhid: "AYU-2026-030",
    language: "te",
    department: "AYUSH (Ayurveda)",
    priority: "ROUTINE",
    status: "READY_FOR_DOCTOR",
    chiefComplaint: "Recurrent swelling of bilateral feet, sluggish digestion, and generalized puffiness (Kaphaja Shopha / Edema)",
    hpi: "65-year-old female with pitting edema around both ankles, worse towards evening, heaviness in abdomen, and morning facial puffiness. Serum Creatinine 1.1 mg/dL, normal cardiac echo.",
    pastHistory: "Hypothyroidism on 75mcg Levothyroxine.",
    medications: ["Tab Thyronorm 75mcg"],
    allergies: ["No known allergies"],
    ayushData: {
      agniAssessment: "Mandagni with Rasa-Vaha and Udaka-Vaha Srotas Sanga",
      aharaPrakriti: "Excess salt intake and sedentary lifestyle",
      prakritiAssessment: { vataScore: 25, pittaScore: 25, kaphaScore: 50, dominantDosha: "KAPHA" }
    },
    qaTurns: [
      { q: "కాళ్ల వాపు ఎప్పుడు ఎక్కువగా కనిపిస్తుంది?", a: "సాయంత్రం అయ్యేసరికి రెండు పాదాలు, చీలమండల దగ్గర ఉబ్బిపోతాయి." },
      { q: "ఆకలి మరియు జీర్ణక్రియ ఎలా ఉంది?", a: "ఆకలి చాలా తక్కువ, కొద్దిగా తిన్నా కడుపు బరువుగా ఉంటుంది." }
    ]
  },

  // --- ADDITIONAL COMPREHENSIVE OPD CASES (Cases 31 to 50) ---
  {
    firstName: "Farhan",
    lastName: "Akhtar",
    email: "farhan.a@example.com",
    age: 31,
    gender: "male",
    uhid: "GEN-2026-031",
    language: "en",
    department: "General Medicine",
    priority: "ROUTINE",
    status: "WAITING",
    chiefComplaint: "Burning micturition, increased frequency, and suprapubic cramping for 2 days (Acute UTI)",
    hpi: "Young male with dysuria, urgency every 45 minutes, voiding small amounts, cloudy urine. No flank tenderness or fever.",
    pastHistory: "Low fluid intake during field marketing work.",
    medications: ["Urine alkalizer solution"],
    allergies: ["Ciprofloxacin sensitivity"],
    qaTurns: [
      { q: "Is there burning or pain during urination?", a: "Yes, severe burning at the end of urination and frequent urge." },
      { q: "Any fever or back pain?", a: "No fever or backache, only lower pelvic discomfort." }
    ]
  },
  {
    firstName: "Geeta",
    lastName: "Bhatt",
    email: "geeta.b@example.com",
    age: 47,
    gender: "female",
    uhid: "AYU-2026-032",
    language: "hi",
    department: "AYUSH (Ayurveda)",
    priority: "ROUTINE",
    status: "COMPLETED",
    chiefComplaint: "Chronic dry spasmodic cough worse at night with sticky throat phlegm (Vataja Kasa)",
    hpi: "School principal with 4-week history of dry hacking cough triggered by chalk dust and cold drinks. Paroxysmal bouts causing chest soreness.",
    pastHistory: "Post-viral cough syndrome.",
    medications: ["Vasavaleha 1 tsp"],
    allergies: ["Chalk dust"],
    ayushData: {
      agniAssessment: "Sama Agni with Prana Vaha Srotas Vata-Kapha Dusti",
      aharaPrakriti: "Excess talking and cold water consumption",
      prakritiAssessment: { vataScore: 50, pittaScore: 30, kaphaScore: 20, dominantDosha: "VATA" }
    },
    qaTurns: [
      { q: "खांसी कब सबसे ज्यादा परेशान करती है?", a: "रात को लेटते ही सूखी खांसी के लगातार दौरे पड़ते हैं।" },
      { q: "क्या बलगम भी निकलता है?", a: "बहुत कम और चिपचिपा बलगम निकलता है।" }
    ],
    diagnosis: "Vataja Kasa (Chronic Dry Bronchial Irritation)",
    doctorNotes: "Kanthya Dravya gargles with Licorice (Yashtimadhu) and warm sesame oil chest massage.",
    prescribedMeds: [
      { medicationName: "Sitopaladi Churna", dosage: "3g", frequency: "1-0-1", duration: "14 Days", instructions: "Mix with pure honey after meals" },
      { medicationName: "Kantakari Avaleha", dosage: "10g", frequency: "1-0-1", duration: "14 Days", instructions: "Take with warm water" }
    ]
  },
  {
    firstName: "Arun",
    lastName: "Subramaniam",
    email: "arun.sub@example.com",
    age: 50,
    gender: "male",
    uhid: "GEN-2026-033",
    language: "ta",
    department: "General Medicine",
    priority: "ROUTINE",
    status: "READY_FOR_DOCTOR",
    chiefComplaint: "Acute severe pain and erythema in right great toe first metatarsophalangeal joint (Acute Gout)",
    hpi: "Patient woke up at 4 AM with unbearable throbbing pain in right big toe, swollen red and warm to touch. Serum Uric Acid 8.9 mg/dL. Preceding rich non-vegetarian dinner.",
    pastHistory: "Hyperuricemia for 2 years, alcohol consumption.",
    medications: ["Tab Paracetamol 650mg"],
    allergies: ["No known allergies"],
    qaTurns: [
      { q: "பெருவிரலில் வலி எப்போது தொடங்கியது?", a: "இரவு நன்றாக தூங்கினேன், விடியற்காலை 4 மணிக்கு கடுமையான வலி மற்றும் வீக்கத்துடன் விழித்தேன்." },
      { q: "கால் விரலை தொட முடிகிறதா?", a: "தொட்டாலே மிகக் கடுமையான வலி ஏற்படுகிறது." }
    ]
  },
  {
    firstName: "Nalini",
    lastName: "Prabhu",
    email: "nalini.p@example.com",
    age: 63,
    gender: "female",
    uhid: "AYU-2026-034",
    language: "kn",
    department: "AYUSH (Ayurveda)",
    priority: "ROUTINE",
    status: "IN_CONSULTATION",
    chiefComplaint: "Burning and prickling sensation in bilateral joints and toes with hyperuricemia (Vatarakta)",
    hpi: "63-year-old female with recurrent inflammation of small joints of hands and feet, shifting arthralgia, skin discoloration over affected joints.",
    pastHistory: "Menopause 15 years ago, chronic indigestion.",
    medications: ["Kaishore Guggulu 2 tabs"],
    allergies: ["No known allergies"],
    ayushData: {
      agniAssessment: "Mandagni with Rakta and Vata Dhatu Srotorodha",
      aharaPrakriti: "Excess curd (Dadhi) and fermented foods",
      prakritiAssessment: { vataScore: 40, pittaScore: 45, kaphaScore: 15, dominantDosha: "PITTA" }
    },
    qaTurns: [
      { q: "ಕೀಲುಗಳಲ್ಲಿ ಉರಿ ಮತ್ತು ನೋವು ಹೇಗೆ ಅನಿಸುತ್ತದೆ?", a: "ಕೈ ಕಾಲುಗಳ ಬೆರಳುಗಳಲ್ಲಿ ಸೂಜಿಯಿಂದ ಚುಚ್ಚಿದಂತೆ ಉರಿ ಮತ್ತು ನೋವು ಇದೆ." },
      { q: "ಯಾವ ಆಹಾರ ತಿಂದಾಗ ಜಾಸ್ತಿಯಾಗುತ್ತದೆ?", a: "ಹುಳಿ ಮೊಸರು ಮತ್ತು ಖಾರದ ಪದಾರ್ಥ ತಿಂದಾಗ ಉರಿ ಜಾಸ್ತಿಯಾಗುತ್ತದೆ." }
    ]
  },
  {
    firstName: "Vinay",
    lastName: "Saxena",
    email: "vinay.s@example.com",
    age: 36,
    gender: "male",
    uhid: "GEN-2026-035",
    language: "en",
    department: "General Medicine",
    priority: "ROUTINE",
    status: "COMPLETED",
    chiefComplaint: "Alternating diarrhea and constipation with lower abdominal cramping relieved by defecation (IBS)",
    hpi: "Financial auditor with 8-month history of postprandial lower abdominal cramping, mucus in stool, feeling of incomplete evacuation, aggravated by workplace stress.",
    pastHistory: "Extensive normal colonoscopy and stool pathogen tests.",
    medications: ["Probiotic capsules"],
    allergies: ["Lactose intolerance"],
    qaTurns: [
      { q: "How are your bowel movements?", a: "Alternate between loose stools and hard pellets with mucus, relieved after passing motion." },
      { q: "Any weight loss or blood in stool?", a: "No weight loss or bleeding." }
    ],
    diagnosis: "Irritable Bowel Syndrome - Mixed Type (IBS-M)",
    doctorNotes: "Low FODMAP diet, stress management, gut microbiome regulation.",
    prescribedMeds: [
      { medicationName: "Tab Mebeverine", dosage: "135mg", frequency: "1-0-1", duration: "14 Days", instructions: "Take 20 mins before meals" },
      { medicationName: "Cap Probiotic Complex", dosage: "1 Capsule", frequency: "1-0-0", duration: "30 Days", instructions: "Take with breakfast" }
    ]
  },
  {
    firstName: "Ritu",
    lastName: "Singhal",
    email: "ritu.s@example.com",
    age: 29,
    gender: "female",
    uhid: "AYU-2026-036",
    language: "hi",
    department: "AYUSH (Ayurveda)",
    priority: "ROUTINE",
    status: "READY_FOR_DOCTOR",
    chiefComplaint: "Severe hair thinning, facial acne, and oligomenorrhea (PCOS / Granthi Roga)",
    hpi: "29-year-old female with menstrual cycles delayed by 45-60 days, inflammatory cystic acne on jawline, and ultrasound showing bilateral polycystic ovaries.",
    pastHistory: "BMI 27.2 kg/m2, sedentary lifestyle.",
    medications: ["Kanchnar Guggulu 2 tabs"],
    allergies: ["No known allergies"],
    ayushData: {
      agniAssessment: "Manda Medo Dhatwagni with Artava Vaha Srotorodha",
      aharaPrakriti: "Excess bakery items, refined sugar, late night snacking",
      prakritiAssessment: { vataScore: 25, pittaScore: 35, kaphaScore: 40, dominantDosha: "KAPHA" }
    },
    qaTurns: [
      { q: "मासिक धर्म में क्या अनियमितता है?", a: "पीरियड्स 2-2 महीने चढ़कर आते हैं और चेहरे पर मुहासे हो रहे हैं।" },
      { q: "क्या वजन भी बढ़ रहा है?", a: "हाँ, पिछले 1 साल में 5 किलो वजन बढ़ गया है।" }
    ]
  },
  {
    firstName: "Ashok",
    lastName: "Mehta",
    email: "ashok.m@example.com",
    age: 62,
    gender: "male",
    uhid: "GEN-2026-037",
    language: "hi",
    department: "General Medicine",
    priority: "ROUTINE",
    status: "WAITING",
    chiefComplaint: "Intermittent claudication in right calf on walking 300 meters, relieved by 3 minutes rest",
    hpi: "Retired teacher presenting with cramping ischemic pain in right calf muscle on walking, coldness in right foot, right dorsalis pedis pulse diminished.",
    pastHistory: "Smoker for 25 years, Type 2 Diabetes for 8 years, Hypertension.",
    medications: ["Tab Clopidogrel 75mg", "Tab Telmisartan 40mg"],
    allergies: ["No known allergies"],
    qaTurns: [
      { q: "चलने पर पैर में क्या तकलीफ होती है?", a: "300 मीटर चलने पर दाहिनी पिण्डली में तेज ऐंठन और दर्द होता है, रुकने पर आराम मिलता है।" },
      { q: "क्या पैर ठंडा महसूस होता है?", a: "हाँ दाहिना पैर बाएं से ज्यादा ठंडा रहता है।" }
    ]
  },
  {
    firstName: "Radha",
    lastName: "Krishnan",
    email: "radha.k@example.com",
    age: 55,
    gender: "female",
    uhid: "AYU-2026-038",
    language: "ta",
    department: "AYUSH (Ayurveda)",
    priority: "ROUTINE",
    status: "COMPLETED",
    chiefComplaint: "Stiffness and inability to raise right arm above shoulder level (Apabahuka / Frozen Shoulder)",
    hpi: "55-year-old homemaker with progressive restricted right glenohumeral joint abduction and internal rotation for 4 months, worse at night.",
    pastHistory: "Type 2 Diabetes for 6 years on Metformin.",
    medications: ["Tab Metformin 500mg", "Balarishta 20ml"],
    allergies: ["No known allergies"],
    ayushData: {
      agniAssessment: "Sama Agni with localized Shleshaka Kapha Kshaya and Vata Sthana",
      aharaPrakriti: "Vata aggravating lifestyle with repetitive right arm overhead strain",
      prakritiAssessment: { vataScore: 50, pittaScore: 25, kaphaScore: 25, dominantDosha: "VATA" }
    },
    qaTurns: [
      { q: "தோள்பட்டை வலி எப்படி உள்ளது?", a: "வலது கையை தலைக்கு மேல் தூக்க முடியவில்லை, பின்னால் மடிக்கவும் முடியவில்லை." },
      { q: "இரவில் வலி அதிகமாகிறதா?", a: "ஆம், வலது பக்கம் திரும்பி படுக்கும்போது கடுமையான வலி உள்ளது." }
    ],
    diagnosis: "Apabahuka (Adhesive Capsulitis / Frozen Shoulder)",
    doctorNotes: "Nadi Sweda (herbal steam) on shoulder joint followed by pendulum exercises.",
    prescribedMeds: [
      { medicationName: "Prasaranyadi Kashayam", dosage: "15ml", frequency: "1-0-1", duration: "30 Days", instructions: "Mix with 45ml boiled warm water before food" },
      { medicationName: "Kottamchukkadi Taila", dosage: "External", frequency: "1-0-1", duration: "30 Days", instructions: "Warm application on right shoulder" }
    ]
  },
  {
    firstName: "Prashant",
    lastName: "Desai",
    email: "prashant.d@example.com",
    age: 41,
    gender: "male",
    uhid: "GEN-2026-039",
    language: "en",
    department: "General Medicine",
    priority: "ROUTINE",
    status: "READY_FOR_DOCTOR",
    chiefComplaint: "Episodic rotational vertigo triggered by head turning to right side for 3 days (BPPV)",
    hpi: "41-year-old architect with true spinning vertigo lasting 30-45 seconds when rolling over in bed to right side, positive Dix-Hallpike test on right with torsional nystagmus.",
    pastHistory: "No hearing loss, tinnitus, or neurologic deficits.",
    medications: ["Tab Betahistine 16mg SOS"],
    allergies: ["No known allergies"],
    qaTurns: [
      { q: "When does the spinning feeling occur?", a: "When I turn my head quickly or lie down on my right side in bed, lasts about 30 seconds." },
      { q: "Any ringing in ears or hearing difficulty?", a: "No ringing or hearing changes." }
    ]
  },
  {
    firstName: "Gita",
    lastName: "Soren",
    email: "gita.s@example.com",
    age: 23,
    gender: "female",
    uhid: "AYU-2026-040",
    language: "hi",
    department: "AYUSH (Ayurveda)",
    priority: "ROUTINE",
    status: "WAITING",
    chiefComplaint: "Pale conjunctiva, severe exertional fatigue, and brittle nails (Pandu Roga / Anemia)",
    hpi: "College student with persistent lethargy, breathless on climbing 1 flight of stairs, dizziness on sudden standing. Hb 8.2 g/dL, Microcytic hypochromic picture.",
    pastHistory: "Heavy menstrual bleeding for 6 months.",
    medications: ["Punarnavadi Mandoor 2 tabs"],
    allergies: ["No known allergies"],
    ayushData: {
      agniAssessment: "Mandagni with Rasa and Rakta Dhatu Daurbalya",
      aharaPrakriti: "Irregular meals with lack of green leafy vegetables and iron sources",
      prakritiAssessment: { vataScore: 40, pittaScore: 35, kaphaScore: 25, dominantDosha: "VATA" }
    },
    qaTurns: [
      { q: "थकान और कमजोरी कब से है?", a: "पिछले 3-4 महीनों से बहुत जल्दी सांस फूलती है और कमजोरी लगती है।" },
      { q: "क्या भूख ठीक लगती है?", a: "भूख कम हो गई है और चक्कर भी आते हैं।" }
    ]
  },
  {
    firstName: "Chandra",
    lastName: "Shekhar",
    email: "chandra.s@example.com",
    age: 66,
    gender: "male",
    uhid: "GEN-2026-041",
    language: "te",
    department: "General Medicine",
    priority: "URGENT",
    status: "READY_FOR_DOCTOR",
    chiefComplaint: "Painless non-healing ulcer on plantar surface of right big toe for 3 weeks (Diabetic Foot Ulcer)",
    hpi: "66-year-old diabetic male with 2cm painless ulcer over 1st metatarsal head, surrounding erythema 1cm, serosanguinous discharge, peripheral sensory loss on 10g monofilament.",
    pastHistory: "Type 2 Diabetes for 18 years on Insulin + Metformin.",
    medications: ["Inj Human Mixtard 30/70", "Tab Metformin 1000mg"],
    allergies: ["No known allergies"],
    redFlagReason: "Diabetic neuropathic foot ulcer with potential osteomyelitis risk",
    redFlagSeverity: "HIGH",
    qaTurns: [
      { q: "పాదంలో పుండు ఎప్పుడు మొదలైంది?", a: "మూడు వారాల క్రితం కొత్త చెప్పులు వేసుకున్నప్పుడు పొక్కు వచ్చింది, నొప్పి లేదు కానీ మానడం లేదు." },
      { q: "చక్కెర వ్యాధి నియంత్రణలో ఉందా?", a: "ఇన్సులిన్ తీసుకుంటున్నాను, ఫాస్టింగ్ 180 వరకు ఉంటుంది." }
    ]
  },
  {
    firstName: "Padma",
    lastName: "Venkatesh",
    email: "padma.v@example.com",
    age: 60,
    gender: "female",
    uhid: "AYU-2026-042",
    language: "kn",
    department: "AYUSH (Ayurveda)",
    priority: "ROUTINE",
    status: "COMPLETED",
    chiefComplaint: "Severe radiating pain from lower back down to right heel and calf (Gridhrasi / Sciatica)",
    hpi: "60-year-old female with shooting pain along sciatic nerve distribution on right side, tingling in sole, exacerbated by coughing and forward bending.",
    pastHistory: "Mild L4-L5 disc bulge on MRI 2 years ago.",
    medications: ["Trayodashanga Guggulu 2 tabs"],
    allergies: ["No known allergies"],
    ayushData: {
      agniAssessment: "Vishamagni with Vata-Kapha Sthanasamshraya in Kandara",
      aharaPrakriti: "Vata aggravating sedentary lifestyle and cold weather exposure",
      prakritiAssessment: { vataScore: 60, pittaScore: 20, kaphaScore: 20, dominantDosha: "VATA" }
    },
    qaTurns: [
      { q: "ನೋವು ಸೊಂಟದಿಂದ ಎಲ್ಲಿಯವರೆಗೆ ಹರಿಯುತ್ತದೆ?", a: "ಸೊಂಟದಿಂದ ಬಲಗಾಲಿನ ಹಿಮ್ಮಡಿಯವರೆಗೆ ಮಿಂಚಿನಂತೆ ನೋವು ಎಳೆಯುತ್ತದೆ." },
      { q: "ಯಾವಾಗ ನೋವು ಜಾಸ್ತಿಯಾಗುತ್ತದೆ?", a: "ಕೆಮ್ಮಿದಾಗ ಮತ್ತು ಬಗ್ಗಿ ಕೆಲಸ ಮಾಡುವಾಗ ನೋವು ತೀವ್ರವಾಗುತ್ತದೆ." }
    ],
    diagnosis: "Gridhrasi (Sciatic Neuralgia with Lumbar Radiculopathy)",
    doctorNotes: "Advised Kati Basti and Eranda Sneha Virechana. Avoid forward spine bending.",
    prescribedMeds: [
      { medicationName: "Rasnadi Kashayam", dosage: "15ml", frequency: "1-0-1", duration: "21 Days", instructions: "Mix with 45ml warm water before food" },
      { medicationName: "Yogaraja Guggulu", dosage: "2 Tablets", frequency: "1-0-1", duration: "21 Days", instructions: "Take with warm water after meals" }
    ]
  },
  {
    firstName: "Sunil",
    lastName: "Tiwari",
    email: "sunil.t@example.com",
    age: 37,
    gender: "male",
    uhid: "GEN-2026-043",
    language: "hi",
    department: "General Medicine",
    priority: "ROUTINE",
    status: "IN_CONSULTATION",
    chiefComplaint: "Step-ladder pattern fever up to 103°F with abdominal discomfort and rose spots (Enteric / Typhoid suspect)",
    hpi: "37-year-old accountant with 7-day fever stepping up each evening, relative bradycardia (pulse 78 with temp 102.6°F), coated tongue, Widal positive 1:160.",
    pastHistory: "History of outside contaminated water intake during railway travel 10 days ago.",
    medications: ["Tab Paracetamol 650mg"],
    allergies: ["No known allergies"],
    qaTurns: [
      { q: "बुखार कैसे आ रहा है?", a: "शाम के समय बुखार तेज हो जाता है और पेट में भारीपन और कमजोरी है।" },
      { q: "क्या बाहर का खाना-पानी पिया था?", a: "हाँ, 10 दिन पहले सफर के दौरान बाहर का खाना और पानी पिया था।" }
    ]
  },
  {
    firstName: "Uma",
    lastName: "Maheshwari",
    email: "uma.m@example.com",
    age: 53,
    gender: "female",
    uhid: "AYU-2026-044",
    language: "te",
    department: "AYUSH (Ayurveda)",
    priority: "ROUTINE",
    status: "READY_FOR_DOCTOR",
    chiefComplaint: "Recurrent burning in soles, sweet taste in mouth, polyuria, and fatigue (Prameha / Diabetes)",
    hpi: "53-year-old female with Hastapada Daha (burning in hands/feet), Pipasa (polydipsia), and cloudy frequent urine. Fasting glucose 156 mg/dL.",
    pastHistory: "Strong family history of Type 2 Diabetes.",
    medications: ["Nisha Amalaki Churna 3g"],
    allergies: ["No known allergies"],
    ayushData: {
      agniAssessment: "Mandagni with Medovaha and Mutravaha Srotas Dusti",
      aharaPrakriti: "Excess sweets, rice, and lack of physical exercise (Avyayama)",
      prakritiAssessment: { vataScore: 25, pittaScore: 35, kaphaScore: 40, dominantDosha: "KAPHA" }
    },
    qaTurns: [
      { q: "కాళ్లల్లో మంటలు ఎలా ఉన్నాయి?", a: "రాత్రి పూట అరికాళ్ళలో తీవ్రమైన మంటలు, నోరంతా తీపిగా అనిపిస్తుంది." },
      { q: "దాహం మరియు మూత్ర విసర్జన ఎలా ఉంది?", a: "ఎక్కువగా దాహం వేయడం మరియు రాత్రి వేళల్లో తరచుగా మూత్రానికి వెళ్లడం జరుగుతోంది." }
    ]
  },
  {
    firstName: "Karan",
    lastName: "Malhotra",
    email: "karan.m@example.com",
    age: 19,
    gender: "male",
    uhid: "GEN-2026-045",
    language: "en",
    department: "General Medicine",
    priority: "ROUTINE",
    status: "COMPLETED",
    chiefComplaint: "Acute viral rhinitis, mild sore throat, and low-grade fever 99.8°F for 2 days",
    hpi: "College student with clear nasal discharge, nasal congestion, mild scratchy throat, no tonsillar exudates or dyspnea.",
    pastHistory: "Common cold episodes 1-2 times per year.",
    medications: ["Steam inhalation", "Warm saline gargles"],
    allergies: ["No known allergies"],
    qaTurns: [
      { q: "What are your main cold symptoms?", a: "Runny nose, sneezing, and a mild throat irritation since yesterday." },
      { q: "Any high fever or cough?", a: "Mild fever 99.5°F, no severe cough." }
    ],
    diagnosis: "Acute Viral Upper Respiratory Tract Infection (Common Cold)",
    doctorNotes: "Symptomatic treatment with hydration, rest, and warm fluids.",
    prescribedMeds: [
      { medicationName: "Tab Paracetamol + Cetirizine", dosage: "500mg/5mg", frequency: "1-0-1", duration: "5 Days", instructions: "Take after meals" },
      { medicationName: "Nasal Saline Spray", dosage: "2 Sprays", frequency: "1-1-1", duration: "5 Days", instructions: "Instill in both nostrils" }
    ]
  },
  {
    firstName: "Rukmini",
    lastName: "Bai",
    email: "rukmini.b@example.com",
    age: 72,
    gender: "female",
    uhid: "AYU-2026-046",
    language: "kn",
    department: "AYUSH (Ayurveda)",
    priority: "ROUTINE",
    status: "WAITING",
    chiefComplaint: "Severe bilateral knee pain with swelling and morning stiffness for 3 years (Sandhivata)",
    hpi: "Elderly female with inability to walk without support, severe medial joint line tenderness in both knees, Vata aggravated by cold monsoon climate.",
    pastHistory: "Hypertension for 20 years on Amlodipine 5mg.",
    medications: ["Shallaki 500mg", "Tab Amlodipine 5mg"],
    allergies: ["NSAID gastritis"],
    ayushData: {
      agniAssessment: "Mandagni with Asthi-Majja Dhatu Kshaya",
      aharaPrakriti: "Vardhakya Janya Vata Prakopa",
      prakritiAssessment: { vataScore: 65, pittaScore: 15, kaphaScore: 20, dominantDosha: "VATA" }
    },
    qaTurns: [
      { q: "ನಡೆಯಲು ಎಷ್ಟು ಕಷ್ಟವಾಗುತ್ತಿದೆ?", a: "ಕೋಲಿನ ಸಹಾಯವಿಲ್ಲದೆ ನಡೆಯಲು ಸಾಧ್ಯವಿಲ್ಲ, ಕೀಲುಗಳಲ್ಲಿ ವಿಪರೀತ ನೋವಿದೆ." },
      { q: "ಯಾವ ಕಾಲದಲ್ಲಿ ಜಾಸ್ತಿಯಾಗುತ್ತದೆ?", a: "ಮಳೆಗಾಲ ಮತ್ತು ಚಳಿಗಾಲದಲ್ಲಿ ನೋವು ತುಂಬಾ ಜಾಸ್ತಿಯಾಗುತ್ತದೆ." }
    ]
  },
  {
    firstName: "Naveen",
    lastName: "Kumar",
    email: "naveen.k@example.com",
    age: 34,
    gender: "male",
    uhid: "GEN-2026-047",
    language: "en",
    department: "General Medicine",
    priority: "ROUTINE",
    status: "READY_FOR_DOCTOR",
    chiefComplaint: "Acute diffuse tension headache with neck muscle tightness from prolonged desk screen work",
    hpi: "Software architect with band-like bilateral frontal-occipital tight headache for 4 days, no aura, nausea, or visual changes.",
    pastHistory: "Wears corrective glasses (-1.5D). No prior migraine.",
    medications: ["Tab Paracetamol 500mg"],
    allergies: ["No known allergies"],
    qaTurns: [
      { q: "How does the headache feel?", a: "Feels like a tight rubber band squeezing around my entire head after working 8 hours on monitor." },
      { q: "Does light or sound bother you?", a: "No sensitivity to light or sound." }
    ]
  },
  {
    firstName: "Hemavathi",
    lastName: "S",
    email: "hemavathi.s@example.com",
    age: 48,
    gender: "female",
    uhid: "AYU-2026-048",
    language: "ta",
    department: "AYUSH (Ayurveda)",
    priority: "ROUTINE",
    status: "IN_CONSULTATION",
    chiefComplaint: "Chronic indigestion, abdominal fullness, gas bloating, and loose unformed stools (Grahani Roga)",
    hpi: "48-year-old female with persistent post-meal abdominal borborygmi, bloating, alternating loose and constipated unformed stools with Ama for 5 months.",
    pastHistory: "Treated for amoebiasis 1 year ago.",
    medications: ["Kutajarishta 20ml"],
    allergies: ["Milk intolerance"],
    ayushData: {
      agniAssessment: "Mandagni and Vishamagni with Ama production in Pakwashaya",
      aharaPrakriti: "Irregular snacking and drinking water immediately after meals",
      prakritiAssessment: { vataScore: 40, pittaScore: 30, kaphaScore: 30, dominantDosha: "VATA" }
    },
    qaTurns: [
      { q: "செரிமானத்தில் என்ன பிரச்சனை உள்ளது?", a: "சாப்பிட்டவுடன் வயிறு உப்பி சத்தம் வருகிறது, மலம் செரிக்காமல் பிசுபிசுப்பாக போகிறது." },
      { q: "பால் குடித்தால் என்ன செய்கிறது?", a: "பால் குடித்தால் உடனடியாக வயிறு இரைந்து பேதியாகிறது." }
    ]
  },
  {
    firstName: "Girish",
    lastName: "Natarajan",
    email: "girish.n@example.com",
    age: 51,
    gender: "male",
    uhid: "GEN-2026-049",
    language: "en",
    department: "General Medicine",
    priority: "ROUTINE",
    status: "COMPLETED",
    chiefComplaint: "Routine executive annual health checkup, mild borderline hypertension (138/88 mmHg)",
    hpi: "Asymptomatic 51-year-old corporate VP seeking routine screening. Fasting glucose 102 mg/dL, Total Cholesterol 215 mg/dL, LDL 135 mg/dL. ECG normal sinus rhythm.",
    pastHistory: "Father had MI at age 62.",
    medications: ["Daily Multivitamin"],
    allergies: ["No known allergies"],
    qaTurns: [
      { q: "Any specific symptoms or complaints today?", a: "No complaints, here for annual preventive health checkup." },
      { q: "Any chest discomfort or exercise limitations?", a: "Walk 30 mins daily without any chest discomfort or shortness of breath." }
    ],
    diagnosis: "Pre-Hypertension with Borderline Dyslipidemia (Preventive OPD Check)",
    doctorNotes: "DASH diet (low sodium), 45 mins brisk walking 5 days/week, re-evaluate lipid profile in 6 months.",
    prescribedMeds: [
      { medicationName: "Cap Omega-3 Fatty Acids", dosage: "1000mg", frequency: "1-0-0", duration: "60 Days", instructions: "Take with breakfast" },
      { medicationName: "Tab CoQ10", dosage: "100mg", frequency: "1-0-0", duration: "60 Days", instructions: "Take after morning meal" }
    ]
  },
  {
    firstName: "Shakuntala",
    lastName: "Mishra",
    email: "shakuntala.m@example.com",
    age: 69,
    gender: "female",
    uhid: "AYU-2026-050",
    language: "hi",
    department: "AYUSH (Ayurveda)",
    priority: "ROUTINE",
    status: "COMPLETED",
    chiefComplaint: "Chronic morning stiffness in all finger joints and wrists with swelling (Amavata / Rheumatoid Arthritis)",
    hpi: "Elderly female with symmetrical PIP and MCP joint pain and morning stiffness lasting >1 hour, relieved by warm dry fomentation (Valuka Sweda).",
    pastHistory: "Seropositive RA for 5 years.",
    medications: ["Simhanada Guggulu 2 tabs", "Castor oil 1 tsp weekly"],
    allergies: ["No known allergies"],
    ayushData: {
      agniAssessment: "Mandagni with severe Ama formation and Srotas Avarodha in Sandhi",
      aharaPrakriti: "Heavy cold food intake and sedentary lifestyle causing Ama accumulation",
      prakritiAssessment: { vataScore: 40, pittaScore: 20, kaphaScore: 40, dominantDosha: "KAPHA" }
    },
    qaTurns: [
      { q: "हाथ की उंगलियों में जकड़न कितनी देर रहती है?", a: "सुबह उठने पर 1-2 घंटे तक उंगलियां मुड़ती नहीं हैं और दर्द रहता है।" },
      { q: "किस चीज से आराम मिलता है?", a: "गर्म रेत की पोटली से सिकाई करने पर आराम मिलता है।" }
    ],
    diagnosis: "Amavata (Rheumatoid Arthritis with Ama-Vata Srotorodha)",
    doctorNotes: "Valuka Sweda (dry sand fomentation) and Langhana (light diet) prescribed. Avoid curd and fermented foods.",
    prescribedMeds: [
      { medicationName: "Simhanada Guggulu", dosage: "2 Tablets", frequency: "1-0-1", duration: "30 Days", instructions: "Take with warm water after food" },
      { medicationName: "Rasnadi Kwatha", dosage: "20ml", frequency: "1-0-1", duration: "30 Days", instructions: "Mix with 40ml boiled warm water before meals" }
    ]
  }
];

async function seed50Patients() {
  console.log("🌱 Starting PreConsult 50-Patient Population Seed Pipeline...");

  // 1. Fetch or create a default Doctor record
  let [defaultDoctor] = await db.query.doctors.findMany({ limit: 1 });

  if (!defaultDoctor) {
    console.log("Creating default attending doctor...");
    const [docUser] = await db
      .insert(users)
      .values({
        clerkId: `clerk_doc_seed_${Date.now()}`,
        email: "doctor.opd@preconsult.health",
        firstName: "Vivek",
        lastName: "Ramcharan",
        role: "doctor",
      })
      .returning();

    const [createdDoc] = await db
      .insert(doctors)
      .values({
        userId: docUser.id,
        licenseNumber: "MCI-2024-88741",
        department: "General Medicine",
        specialization: "Internal Medicine & Clinical Diagnostics",
        roomNumber: "OPD Room 104",
      })
      .returning();

    defaultDoctor = createdDoc;
  }

  // Generate unique run tag so seed scripts can be run idempotently
  const runTag = Date.now().toString().slice(-4);
  let queueTracker = 1;

  for (const p of MOCK_50_PATIENTS) {
    const uniqueUhid = `${p.uhid}-${runTag}`;
    const uniqueEmail = p.email.replace("@", `+${runTag}@`);

    // 1. Create User
    const [userRow] = await db
      .insert(users)
      .values({
        clerkId: `clerk_seed_50_${p.uhid.toLowerCase()}_${runTag}`,
        email: uniqueEmail,
        firstName: p.firstName,
        lastName: p.lastName,
        role: "patient",
      })
      .returning();

    // 2. Create Patient Record
    const [patientRow] = await db
      .insert(patients)
      .values({
        userId: userRow.id,
        uhid: uniqueUhid,
        age: p.age,
        gender: p.gender,
        languagePreference: p.language,
        ayushModeEnabled: p.department.includes("AYUSH"),
      })
      .returning();

    // 3. Create Active Visit
    const [visitRow] = await db
      .insert(visits)
      .values({
        patientId: patientRow.id,
        doctorId: defaultDoctor.id,
        queueNumber: queueTracker++,
        status: p.status,
        department: p.department,
        priority: p.priority,
        isKiosk: p.age > 60 || p.age < 5,
      })
      .returning();

    // 4. Create Interview Session
    const [sessionRow] = await db
      .insert(interviewSessions)
      .values({
        visitId: visitRow.id,
        patientId: patientRow.id,
        status: p.status === "INTAKE_IN_PROGRESS" ? "ACTIVE" : "COMPLETED",
        currentSection: "COMPLETED",
        language: p.language,
        completedAt: new Date(),
      })
      .returning();

    // 5. Insert Transcript Messages
    for (const turn of p.qaTurns) {
      await db.insert(interviewMessages).values({
        sessionId: sessionRow.id,
        sender: "SYSTEM",
        textContent: turn.q,
      });

      await db.insert(interviewMessages).values({
        sessionId: sessionRow.id,
        sender: "PATIENT",
        textContent: turn.a,
      });
    }

    // 6. Insert Structured Clinical History
    const structuredSummary = `Patient ${p.firstName} ${p.lastName} (${p.age}y, ${p.gender}) presented to ${p.department} OPD presenting with: "${p.chiefComplaint}". HPI Evolution: ${p.hpi}. Past Medical Background: ${p.pastHistory}. Active Medications: ${p.medications.join(", ") || "None reported"}. Allergies: ${p.allergies.join(", ")}. Categorized as ${p.priority} intake.`;

    await db.insert(clinicalHistories).values({
      visitId: visitRow.id,
      patientId: patientRow.id,
      chiefComplaint: p.chiefComplaint,
      hpi: p.hpi,
      pastMedicalHistory: p.pastHistory,
      medications: p.medications,
      allergies: p.allergies,
      ayushData: p.ayushData || null,
      summaryText: structuredSummary,
      isConfirmedByPatient: true,
    });

    // 7. Insert Red Flags if present
    if (p.redFlagReason) {
      await db.insert(redFlags).values({
        visitId: visitRow.id,
        patientId: patientRow.id,
        severity: p.redFlagSeverity || "HIGH",
        category: "CLINICAL_INTAKE",
        description: p.redFlagReason,
        detectedBy: "INTAKE_AI",
      });
    }

    // 8. If status is COMPLETED, insert Doctor Review and Prescriptions
    if (p.status === "COMPLETED" && p.diagnosis) {
      await db
        .insert(doctorReviews)
        .values({
          visitId: visitRow.id,
          doctorId: defaultDoctor.id,
          finalDiagnosis: p.diagnosis,
          doctorNotes: p.doctorNotes || "Follow medication schedule and report if symptoms persist.",
          status: "SIGNED",
          signedAt: new Date(),
        });

      if (p.prescribedMeds && p.prescribedMeds.length > 0) {
        for (const med of p.prescribedMeds) {
          await db.insert(prescriptions).values({
            visitId: visitRow.id,
            doctorId: defaultDoctor.id,
            patientId: patientRow.id,
            medicationName: med.medicationName,
            dosage: med.dosage,
            frequency: med.frequency,
            duration: med.duration,
            instructions: med.instructions,
          });
        }
      }
    }

    console.log(`[${queueTracker - 1}/50] Seeded: ${p.firstName} ${p.lastName} (${p.age}y ${p.gender}, Dept: ${p.department}, UHID: ${uniqueUhid})`);
  }

  console.log("\n🎉 Successfully seeded all 50 patients into the PreConsult database!");
}

seed50Patients()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed execution failed:", err);
    process.exit(1);
  });