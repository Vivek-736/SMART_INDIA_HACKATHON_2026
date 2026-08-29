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

const MOCK_PATIENTS: SeedPatientProfile[] = [
  // 1. INFANT / TODDLER (Age: 2) - General Medicine (Pediatric Wheeze)
  {
    firstName: "Aarav",
    lastName: "Sharma",
    email: "aarav.infant@example.com",
    age: 2,
    gender: "male",
    uhid: "PED-2026-001",
    language: "hi",
    department: "General Medicine",
    priority: "URGENT",
    status: "READY_FOR_DOCTOR",
    chiefComplaint: "Acute dry cough with nighttime wheezing for 3 days",
    hpi: "Child started coughing 3 nights ago with audible wheezing and mild intercostal retraction. Cough worsens in cold air. Mild fever 100.2°F recorded yesterday. Feeding well, no cyanosis.",
    pastHistory: "Born full-term via normal delivery. Up to date on pediatric immunization schedule. Previous episode of viral bronchiolitis at 10 months.",
    medications: ["Paracetamol drops 100mg/ml SOS"],
    allergies: ["No known drug allergies"],
    redFlagReason: "Mild nocturnal respiratory distress and pediatric wheeze reported",
    redFlagSeverity: "HIGH",
    qaTurns: [
      { q: "बच्चे को क्या तकलीफ है?", a: "तीन दिन से बहुत खांसी है, रात को छाती से सीटी जैसी आवाज आती है।" },
      { q: "क्या बुखार भी है?", a: "हाँ कल हल्का बुखार था, लगभग 100 डिग्री।" },
      { q: "क्या बच्चा खाना-पीना ठीक से ले रहा है?", a: "दूध पी रहा है लेकिन खांसी के कारण नींद पूरी नहीं हो रही।" },
      { q: "क्या कोई पुरानी दवाई चल रही है?", a: "केवल बुखार आने पर पैरासिटामोल ड्रॉप्स दी थी।" },
    ],
  },

  // 2. CHILD (Age: 9) - AYUSH (Allergic Rhinitis & Kaphaja Pratishyaya)
  {
    firstName: "Ananya",
    lastName: "Reddy",
    email: "ananya.child@example.com",
    age: 9,
    gender: "female",
    uhid: "AYU-2026-042",
    language: "te",
    department: "AYUSH (Ayurveda)",
    priority: "ROUTINE",
    status: "COMPLETED",
    chiefComplaint: "Recurrent morning sneezing, runny nose, and nasal congestion (Kaphaja Pratishyaya)",
    hpi: "Child experiences continuous 15-20 bouts of sneezing every morning upon waking up. Clear watery nasal discharge aggravated by cold milk and dust exposure. No fever or headache.",
    pastHistory: "Seasonal allergy history since age 6. No history of asthma or eczema.",
    medications: ["Haridra Khanda 2g with warm water"],
    allergies: ["Cold milk", "Dust mites"],
    ayushData: {
      agniAssessment: "Mandagni (Sluggish digestion with heaviness in head)",
      aharaPrakriti: "Excess cold water and ice cream consumption aggravates Kapha",
      prakritiAssessment: { vataScore: 25, pittaScore: 25, kaphaScore: 50, dominantDosha: "KAPHA" },
    },
    qaTurns: [
      { q: "పాపకి ఏమి సమస్య ఉంది?", a: "రోజూ ఉదయం లేవగానే 15-20 సార్లు తుమ్ములు వస్తున్నాయి, ముక్కు కారుతోంది." },
      { q: "ఎప్పటి నుండి ఈ సమస్య ఉంది?", a: "గత 2 వారాల నుండి చలిగాలికి ఎక్కువవుతోంది." },
      { q: "ఏవైనా ఆహారపు అలవాట్ల వల్ల ఎక్కువవుతోందా?", a: "చల్లని పాలు, ఐస్‌క్రీమ్ తింటే వెంటనే తుమ్ములు వస్తాయి." },
      { q: "ఇంతకుముందు ఏమైనా మందులు వాడారా?", a: "పసుపు పాలు మరియు ఆయుర్వేద చూర్ణం వాడుతున్నాము." },
    ],
    diagnosis: "Kaphaja Pratishyaya (Allergic Rhinitis with Kapha aggravation)",
    doctorNotes: "Avoid cold dairy products and direct air conditioner exposure. Daily steam inhalation with Tulsi leaves.",
    prescribedMeds: [
      { medicationName: "Sitopaladi Churna", dosage: "2g", frequency: "1-0-1", duration: "14 Days", instructions: "Take with honey after meals" },
      { medicationName: "Haridra Khanda", dosage: "3g", frequency: "1-0-1", duration: "14 Days", instructions: "Take with warm water" },
    ],
  },

  // 3. YOUNG ADULT (Age: 22) - General Medicine (Acute Acid Peptic Disorder / GERD)
  {
    firstName: "Rohan",
    lastName: "Verma",
    email: "rohan.student@example.com",
    age: 22,
    gender: "male",
    uhid: "GEN-2026-118",
    language: "en",
    department: "General Medicine",
    priority: "ROUTINE",
    status: "COMPLETED",
    chiefComplaint: "Retrosternal burning sensation, acid regurgitation, and postprandial nausea for 10 days",
    hpi: "College student presenting with burning epigastric discomfort radiating to retrosternal area, exacerbated after late-night fast food and black coffee during exam preparation. Relieved partially by cold water.",
    pastHistory: "No prior chronic illness. Irregular sleep and dietary schedule.",
    medications: ["Antacid suspension 10ml SOS"],
    allergies: ["No known drug allergies (NKDA)"],
    qaTurns: [
      { q: "What symptoms are troubling you?", a: "Severe chest burning and sour water coming up in throat especially at night." },
      { q: "Since when has this been occurring?", a: "For the last 10-12 days during my college semester exams." },
      { q: "Any specific food triggers?", a: "Drinking multiple cups of coffee and eating spicy street food late at night." },
      { q: "Any difficulty swallowing or black stools?", a: "No, swallowing is normal and no dark stools." },
    ],
    diagnosis: "Gastroesophageal Reflux Disease (GERD) / Acid Peptic Disease",
    doctorNotes: "Follow strict sleep hygiene and eat dinner 3 hours before sleeping. Avoid excessive caffeine and fried snacks.",
    prescribedMeds: [
      { medicationName: "Tab Pantoprazole", dosage: "40mg", frequency: "1-0-0", duration: "14 Days", instructions: "Take on empty stomach 30 mins before breakfast" },
      { medicationName: "Tab Domperidone", dosage: "10mg", frequency: "1-0-1", duration: "7 Days", instructions: "Take 15 mins before meals" },
    ],
  },

  // 4. YOUNG ADULT (Age: 26) - AYUSH (Pitta Prakriti Gastritis & Amlapitta)
  {
    firstName: "Meenakshi",
    lastName: "Sundaram",
    email: "meenakshi.ayush@example.com",
    age: 26,
    gender: "female",
    uhid: "AYU-2026-089",
    language: "ta",
    department: "AYUSH (Ayurveda)",
    priority: "ROUTINE",
    status: "IN_CONSULTATION",
    chiefComplaint: "Heartburn, sour belching, and headache due to Pitta aggravation (Urdhwaga Amlapitta)",
    hpi: "Software professional experiencing recurrent burning in stomach, bitter-sour taste in mouth, and temporal throbbing headache after prolonged screen time and skipped lunches.",
    pastHistory: "Frequent gastritis episodes for 1 year. High stress levels.",
    medications: ["Avipattikar Churna 3g"],
    allergies: ["No known allergies"],
    ayushData: {
      agniAssessment: "Tikshnagni (Intense sharp digestive fire prone to acid generation)",
      aharaPrakriti: "Irregular fasting and high intake of sour and fermented foods (Idli/Dosa batter)",
      prakritiAssessment: { vataScore: 30, pittaScore: 55, kaphaScore: 15, dominantDosha: "PITTA" },
    },
    qaTurns: [
      { q: "உங்களுக்கு என்ன உடல்நல பிரச்சனை உள்ளது?", a: "நெஞ்செரிச்சல், புளித்த ஏப்பம் மற்றும் கடுமையான தலைவலி உள்ளது." },
      { q: "எப்போது அதிகமாக உணர்கிறீர்கள்?", a: "மதிய உணவு தாமதமாகும் போது மற்றும் காரமான உணவு சாப்பிடும் போது." },
      { q: "செரிமானம் எப்படி உள்ளது?", a: "பசி அதிகமாக இருக்கிறது ஆனால் சாப்பிட்டவுடன் வயிறு எரிகிறது." },
    ],
  },

  // 5. WORKING ADULT (Age: 38) - General Medicine (Acute Lumbar Muscle Sprain / Sciatica)
  {
    firstName: "Vikram",
    lastName: "Patel",
    email: "vikram.patel@example.com",
    age: 38,
    gender: "male",
    uhid: "GEN-2026-205",
    language: "en",
    department: "General Medicine",
    priority: "ROUTINE",
    status: "WAITING",
    chiefComplaint: "Lower back pain radiating to left gluteal region after lifting heavy equipment",
    hpi: "Onset 2 days ago after lifting heavy mechanical tools at work. Sharp, catching lower back ache on bending forward. No bowel/bladder dysfunction or lower limb numbness.",
    pastHistory: "Sedentary workstation desk job for 8 years. Occasional postural back stiffness.",
    medications: ["Aceclofenac 100mg + Paracetamol 325mg"],
    allergies: ["Aspirin sensitivity"],
    qaTurns: [
      { q: "Where is the pain located and how did it begin?", a: "Lower back pain started suddenly while lifting a 25kg box at work." },
      { q: "Does the pain radiate down your legs?", a: "Shoots down to my left hip and thigh on standing up." },
      { q: "Any weakness in feet or urinary incontinence?", a: "No weakness or urinary issues." },
    ],
  },

  // 6. MIDDLE AGED (Age: 46) - AYUSH (Vata-Kapha Sandhivata / Lumbar Spondylosis)
  {
    firstName: "Suresh",
    lastName: "Gowda",
    email: "suresh.gowda@example.com",
    age: 46,
    gender: "male",
    uhid: "AYU-2026-154",
    language: "kn",
    department: "AYUSH (Ayurveda)",
    priority: "ROUTINE",
    status: "READY_FOR_DOCTOR",
    chiefComplaint: "Stiffness and dull aching pain in lower back and cervical spine (Kati Graha / Sandhivata)",
    hpi: "Farmer and truck driver presenting with 6-month history of worsening stiffness in lumbar region, aggravated during morning hours and cold winter weather. Relieved after warm oil massage.",
    pastHistory: "No diabetes. Hypertension diagnosed 2 years ago on regular medication.",
    medications: ["Tab Telmisartan 40mg", "Yogaraja Guggulu 2 tabs"],
    allergies: ["Sulfa drugs"],
    ayushData: {
      agniAssessment: "Vishamagni (Irregular digestion with abdominal flatulence)",
      aharaPrakriti: "Vata aggravating dry food, irregular timings, and prolonged vibration exposure while driving",
      prakritiAssessment: { vataScore: 55, pittaScore: 25, kaphaScore: 20, dominantDosha: "VATA" },
    },
    qaTurns: [
      { q: "ನಿಮಗೆ ಯಾವ ಸಮಸ್ಯೆಯಿದೆ?", a: "ಬೆನ್ನು ನೋವು ಮತ್ತು ಸೊಂಟ ಹಿಡಿದುಕೊಂಡಂತೆ ಆಗುತ್ತದೆ, ಬೆಳಿಗ್ಗೆ ಏಳುವಾಗ ಕಷ್ಟವಾಗುತ್ತದೆ." },
      { q: "ಎಷ್ಟು ದಿನಗಳಿಂದ ಈ ನೋವಿದೆ?", a: "ಕಳೆದ 6 ತಿಂಗಳುಗಳಿಂದ ಇದೆ, ಚಳಿಗಾಲದಲ್ಲಿ ನೋವು ಜಾಸ್ತಿಯಾಗುತ್ತದೆ." },
      { q: "ಯಾವುದಾದರೂ ಎಣ್ಣೆ ಹಚ್ಚುತ್ತಿದ್ದೀರಾ?", a: "ಮಹಾನಾರಾಯಣ ತೈಲ ಹಚ್ಚಿದರೆ ಸ್ವಲ್ಪ ಆರಾಮವಾಗುತ್ತದೆ." },
    ],
  },

  // 7. MIDDLE AGED (Age: 52) - General Medicine (Uncontrolled Hypertension with Occipital Headache - Urgent)
  {
    firstName: "Rajesh",
    lastName: "Kapoor",
    email: "rajesh.kapoor@example.com",
    age: 52,
    gender: "male",
    uhid: "GEN-2026-312",
    language: "hi",
    department: "General Medicine",
    priority: "URGENT",
    status: "IN_CONSULTATION",
    chiefComplaint: "Severe pulsating occipital headache, blurred vision, and high blood pressure for 1 day",
    hpi: "Patient reports severe throbbing headache starting early morning with dizziness and mild visual blurring. Home digital BP monitor recorded 175/105 mmHg. Patient had missed his antihypertensive doses for the past 4 days due to travel.",
    pastHistory: "Known Essential Hypertension for 7 years. Type 2 Diabetes for 3 years (HbA1c 7.4%).",
    medications: ["Tab Amlodipine 5mg", "Tab Metformin 500mg"],
    allergies: ["No known allergies"],
    redFlagReason: "Hypertensive urgency (BP > 175/105 mmHg) with visual blurring and severe occipital headache",
    redFlagSeverity: "CRITICAL",
    qaTurns: [
      { q: "आपको क्या समस्या हो रही है?", a: "सिर के पिछले हिस्से में बहुत तेज दर्द और चक्कर आ रहे हैं।" },
      { q: "क्या आपने बीपी चेक किया था?", a: "हाँ, सुबह घर पर चेक किया तो 175/105 आया था।" },
      { q: "क्या आप अपनी बीपी की दवा नियमित ले रहे हैं?", a: "सफर में होने के कारण पिछले 4 दिनों से दवा छूट गई थी।" },
      { q: "क्या सीने में दर्द या सांस फूल रही है?", a: "सीने में दर्द नहीं है, केवल घबराहट और भारीपन है।" },
    ],
  },

  // 8. ELDERLY (Age: 68) - AYUSH (Bilateral Knee Osteoarthritis / Janu Sandhigata Vata)
  {
    firstName: "Kausalya",
    lastName: "Devi",
    email: "kausalya.elder@example.com",
    age: 68,
    gender: "female",
    uhid: "AYU-2026-210",
    language: "te",
    department: "AYUSH (Ayurveda)",
    priority: "ROUTINE",
    status: "COMPLETED",
    chiefComplaint: "Bilateral knee joint crepitus, severe pain on stair climbing, and morning stiffness (Janu Sandhigata Vata)",
    hpi: "Elderly female presenting with progressive bilateral knee pain for 2 years, severely aggravated during winter months and while squatting or standing up from low seating. Crepitus sound heard in both knees. Joint effusion absent.",
    pastHistory: "Menopause at age 48. Mild osteopenia on DEXA scan 1 year ago.",
    medications: ["Ksheerabala 101 capsule", "Shallaki 500mg"],
    allergies: ["NSAID gastric intolerance (Ibuprofen causes severe acidity)"],
    ayushData: {
      agniAssessment: "Vishamagni (Low metabolic fire, Vata vriddhi in Dhatus)",
      aharaPrakriti: "Vata prakopa due to aging (Vardhakya) and depletion of Asthi-Majja Dhatu",
      prakritiAssessment: { vataScore: 60, pittaScore: 20, kaphaScore: 20, dominantDosha: "VATA" },
    },
    qaTurns: [
      { q: "అమ్మా, మీకు ఎలాంటి బాధ ఉంది?", a: "రెండు మోకాళ్ళలో విపరీతమైన నొప్పి, నడిస్తే టక్ టక్ మని శబ్దం వస్తుంది." },
      { q: "ఎంత కాలం నుండి ఈ సమస్య ఉంది?", a: "రెండు సంవత్సరాలుగా ఉంది, మెట్లు ఎక్కడం చాలా కష్టంగా ఉంది." },
      { q: "ఏవైనా మందులు పడవా?", a: "ఇంగ్లీష్ పెయిన్ కిల్లర్ టాబ్లెట్లు వేసుకుంటే కడుపులో మంట వస్తుంది." },
    ],
    diagnosis: "Janu Sandhigata Vata (Bilateral Knee Osteoarthritis with Dhatu Kshaya)",
    doctorNotes: "Advised Janu Basti (warm medicated oil pooling) therapy and knee isometric strengthening exercises. Avoid floor sitting.",
    prescribedMeds: [
      { medicationName: "Shallaki Tablet", dosage: "500mg", frequency: "1-0-1", duration: "30 Days", instructions: "Take with warm water after meals" },
      { medicationName: "Yogaraja Guggulu", dosage: "2 Tablets", frequency: "1-0-1", duration: "30 Days", instructions: "Take with warm water after food" },
      { medicationName: "Mahanarayana Taila", dosage: "External", frequency: "1-0-1", duration: "30 Days", instructions: "Gentle local application on both knees followed by warm compress" },
    ],
  },

  // 9. ELDERLY (Age: 74) - General Medicine (Chronic COPD with Acute Exacerbation & Productive Cough)
  {
    firstName: "Narasimha",
    lastName: "Rao",
    email: "narasimha.copd@example.com",
    age: 74,
    gender: "male",
    uhid: "GEN-2026-440",
    language: "en",
    department: "General Medicine",
    priority: "URGENT",
    status: "READY_FOR_DOCTOR",
    chiefComplaint: "Shortness of breath on mild exertion, chronic productive cough with yellowish sputum for 5 days",
    hpi: "Known COPD patient with 30 pack-year smoking history (quit 5 years ago) presenting with worsening dyspnea (mMRC Grade 3), copious purulent sputum, and bilateral expiratory rhonchi. Room air SpO2 is 92%.",
    pastHistory: "COPD diagnosed 10 years ago. Hypertension for 15 years.",
    medications: ["Formoterol + Budesonide inhaler 400mcg", "Tab Amlodipine 5mg"],
    allergies: ["Penicillin allergy (skin rash)"],
    redFlagReason: "COPD acute exacerbation with SpO2 92% and purulent sputum",
    redFlagSeverity: "HIGH",
    qaTurns: [
      { q: "What is your main difficulty?", a: "Heavy breathlessness even after walking 10 steps and thick yellow cough." },
      { q: "How long has it been worse?", a: "For the last 5 days after catching a cold." },
      { q: "Are you using your regular inhalers?", a: "Yes, using Budesonide inhaler twice daily, but breathlessness is still severe." },
      { q: "Any chest tightness or leg swelling?", a: "Mild chest tightness, no swelling in feet." },
    ],
  },

  // 10. MIDDLE AGED (Age: 42) - General Medicine (Type 2 Diabetes Mellitus with Peripheral Neuropathy)
  {
    firstName: "Priya",
    lastName: "Nair",
    email: "priya.nair@example.com",
    age: 42,
    gender: "female",
    uhid: "GEN-2026-288",
    language: "en",
    department: "General Medicine",
    priority: "ROUTINE",
    status: "COMPLETED",
    chiefComplaint: "Tingling numbness in bilateral soles (glove and stocking pattern) and polyuria for 1 month",
    hpi: "Patient with 4-year history of Type 2 Diabetes presenting with progressive burning sensation in soles of feet, worsened at night. Fasting blood sugar 168 mg/dL, Postprandial 245 mg/dL. No foot ulcers or calluses.",
    pastHistory: "Gestational Diabetes during pregnancy at age 28. Maternal history of Type 2 Diabetes.",
    medications: ["Tab Glimepiride 1mg + Metformin 500mg"],
    allergies: ["No known drug allergies"],
    qaTurns: [
      { q: "What symptoms bring you to the clinic?", a: "Burning and pins-and-needles sensation in both feet, especially while sleeping." },
      { q: "How is your blood sugar control?", a: "Fasting was 168 and after meals was 245 last week." },
      { q: "Any increased thirst or urination?", a: "Yes, waking up 3-4 times at night to urinate." },
    ],
    diagnosis: "Type 2 Diabetes Mellitus with Diabetic Peripheral Neuropathy",
    doctorNotes: "Reinforced diabetic medical nutrition therapy (low glycemic index diet), daily foot inspection, andHbA1c monitoring.",
    prescribedMeds: [
      { medicationName: "Tab Metformin SR", dosage: "1000mg", frequency: "1-0-1", duration: "30 Days", instructions: "Take with meals" },
      { medicationName: "Tab Pregabalin + Methylcobalamin", dosage: "75mg/1500mcg", frequency: "0-0-1", duration: "30 Days", instructions: "Take at bedtime" },
    ],
  },
];

async function seedDatabase() {
  console.log("🌱 Starting PreConsult Realistic Patient Population Seed Pipeline...");

  // 1. Fetch or create a default Doctor record for reviews
  let [defaultDoctor] = await db.query.doctors.findMany({ limit: 1 });

  if (!defaultDoctor) {
    console.log("No doctor found. Creating a default attending doctor...");
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

  let queueTracker = 1;

  for (const p of MOCK_PATIENTS) {
    console.log(`\nInserting patient: ${p.firstName} ${p.lastName} (${p.age}y, ${p.gender}, Dept: ${p.department})...`);

    // 1. Create User
    const [userRow] = await db
      .insert(users)
      .values({
        clerkId: `clerk_seed_pat_${p.uhid.toLowerCase()}`,
        email: p.email,
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
        uhid: p.uhid,
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
        status: "COMPLETED",
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
    const structuredSummary = `Patient ${p.firstName} ${p.lastName} (${p.age}y, ${p.gender}) presented to ${p.department} OPD with: "${p.chiefComplaint}". HPI Evolution: ${p.hpi}. Past Medical Background: ${p.pastHistory}. Active Medications: ${p.medications.join(", ") || "None"}. Allergies: ${p.allergies.join(", ")}. Prioritized as ${p.priority} intake.`;

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
      const [reviewRow] = await db
        .insert(doctorReviews)
        .values({
          visitId: visitRow.id,
          doctorId: defaultDoctor.id,
          finalDiagnosis: p.diagnosis,
          doctorNotes: p.doctorNotes || "Follow medication schedule and report if symptoms persist.",
          status: "SIGNED",
          signedAt: new Date(),
        })
        .returning();

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

    console.log(`✅ Successfully seeded: ${p.firstName} ${p.lastName} (Token #${visitRow.queueNumber}, UHID: ${p.uhid})`);
  }

  console.log("\n🎉 Database Seeding Successfully Completed! 10 diverse patient cases from infants to geriatric across General Medicine and AYUSH are now active in the database.");
}

seedDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed execution failed:", err);
    process.exit(1);
  });