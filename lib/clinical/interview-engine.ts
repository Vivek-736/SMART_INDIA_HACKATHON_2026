export type InterviewSection = 
  | "CHIEF_COMPLAINT"
  | "HPI_DETAILS"
  | "PAST_HISTORY"
  | "MEDICATIONS_ALLERGIES"
  | "AYUSH_EVALUATION"
  | "COMPLETED";

export interface QuestionData {
  section: InterviewSection;
  title: string;
  stepNumber: number;
  totalSteps: number;
  question: Record<"en" | "hi" | "te" | "ta" | "kn", string>;
  suggestions: Record<"en" | "hi" | "te" | "ta" | "kn", string[]>;
}

export const GENERAL_INTERVIEW_STAGES: QuestionData[] = [
  {
    section: "CHIEF_COMPLAINT",
    title: "Chief Complaint",
    stepNumber: 1,
    totalSteps: 4,
    question: {
      en: "What primary health concern or symptom brings you to the doctor today?",
      hi: "आज आप डॉक्टर के पास किस मुख्य स्वास्थ्य समस्या या लक्षण के लिए आए हैं?",
      te: "ఈరోజు మీరు డాక్టర్‌ని సంప్రదించడానికి ప్రధాన ఆరోగ్య సమస్య లేదా లక్షణం ఏమిటి?",
      ta: "இன்று நீங்கள் மருத்துவரிடம் வரக் காரணமான முக்கிய உடல்நலப் பிரச்சனை என்ன?",
      kn: "ಇಂದು ನೀವು ವೈದ್ಯರನ್ನು ಭೇಟಿ ಮಾಡಲು ಮುಖ್ಯ ಆರೋಗ್ಯ ಸಮಸ್ಯೆ ಅಥವಾ ಲಕ್ಷಣ ಯಾವುದು?",
    },
    suggestions: {
      en: ["Severe Fever & Chills", "Chest Pain & Tightness", "Persistent Cough & Breathlessness", "Severe Stomach Pain", "Joint Pain & Swelling", "Headache & Dizziness"],
      hi: ["तेज बुखार और ठंड लगना", "छाती में दर्द और भारीपन", "लगातार खांसी और सांस फूलना", "पेट में तेज दर्द", "जोड़ों का दर्द और सूजन", "सिरदर्द और चक्कर आना"],
      te: ["తీవ్రమైన జ్వరం & చలి", "ఛాతీ నొప్పి & బిగుతు", "నిరంతర దగ్గు & ఆయాసం", "తీవ్రమైన కడుపు నొప్పి", "కీళ్ల నొప్పులు & వాపు", "తలనొప్పి & తలతిరగడం"],
      ta: ["கடும் காய்ச்சல் & நடுக்கம்", "நெஞ்சு வலி & இறுக்கம்", "தொடர் இருமல் & மூச்சுத்திணறல்", "கடுமையான வயிற்று வலி", "மூட்டு வலி & வீக்கம்", "தலைவலி & மயக்கம்"],
      kn: ["ತೀವ್ರ ಜ್ವರ & ಚಳಿ", "ಎದೆ ನೋವು & ಬಿಗಿತ", "ನಿರಂತರ ಕೆಮ್ಮು & ಉಸಿರಾಟದ ತೊಂದರೆ", "ತೀವ್ರ ಹೊಟ್ಟೆ ನೋವು", "ಕೀಲು ನೋವು & ಊತ", "ತಲೆನೋವು & ತಲೆತಿರುಗುವಿಕೆ"],
    },
  },
  {
    section: "HPI_DETAILS",
    title: "History of Symptoms",
    stepNumber: 2,
    totalSteps: 4,
    question: {
      en: "When did this symptom start, how severe is the pain (1 to 10), and does anything relieve or worsen it?",
      hi: "यह लक्षण कब शुरू हुआ, दर्द कितना तेज है (1 से 10 तक), और क्या इससे आराम या परेशानी बढ़ती है?",
      te: "ఈ లక్షణం ఎప్పుడు ప్రారంభమైంది, నొప్పి తీవ్రత ఎంత (1 నుండి 10 వరకు), మరియు దేనివల్ల తగ్గుతుంది లేదా పెరుగుతుంది?",
      ta: "இந்த அறிகுறி எப்போது தொடங்கியது, வலியின் அளவு எவ்வளவு (1 முதல் 10 வரை), எது வலியைக் குறைக்கிறது அல்லது கூட்டுகிறது?",
      kn: "ಈ ಲಕ್ಷಣ ಯಾವಾಗ ಪ್ರಾರಂಭವಾಯಿತು, ನೋವಿನ ತೀವ್ರತೆ ಎಷ್ಟು (1 ರಿಂದ 10), ಮತ್ತು ಯಾವುದರಿಂದ ನೋವು ಕಡಿಮೆಯಾಗುತ್ತದೆ ಅಥವಾ ಹೆಚ್ಚಾಗುತ್ತದೆ?",
    },
    suggestions: {
      en: ["Started today (Severity: 8/10)", "Since 2-3 days (Severity: 5/10)", "More than 1 week (Severity: 6/10)", "Worse when walking/moving", "Relieved after resting", "Continuous constant pain"],
      hi: ["आज शुरू हुआ (तीव्रता: 8/10)", "2-3 दिनों से (तीव्रता: 5/10)", "1 सप्ताह से अधिक (तीव्रता: 6/10)", "चलने/हिलने पर बढ़ता है", "आराम करने से घटता है", "लगातार दर्द"],
      te: ["ఈరోజే మొదలైంది (తీవ్రత: 8/10)", "2-3 రోజుల నుండి (తీవ్రత: 5/10)", "1 వారం కంటే ఎక్కువ (తీవ్రత: 6/10)", "నడిస్తే పెరుగుతుంది", "విశ్రాంతి తీసుకుంటే తగ్గుతుంది", "నిరంతర నొప్పి"],
      ta: ["இன்றே தொடங்கியது (தீவிரம்: 8/10)", "2-3 நாட்களாக (தீவிரம்: 5/10)", "1 வாரத்திற்கும் மேலாக (தீவிரம்: 6/10)", "நடக்கும்போது கூடுகிறது", "ஓய்வெடுத்தால் குறைகிறது", "தொடர் வலி"],
      kn: ["ಇಂದೇ ಶುರುವಾಗಿದೆ (ತೀವ್ರತೆ: 8/10)", "2-3 ದಿನಗಳಿಂದ (ತೀವ್ರತೆ: 5/10)", "1 ವಾರಕ್ಕಿಂತ ಹೆಚ್ಚು (ತೀವ್ರತೆ: 6/10)", "ನಡೆದಾಡಿದಾಗ ಹೆಚ್ಚಾಗುತ್ತದೆ", "ವಿಶ್ರಾಂತಿ ಪಡೆದಾಗ ಕಡಿಮೆಯಾಗುತ್ತದೆ", "ನಿರಂತರ ನೋವು"],
    },
  },
  {
    section: "PAST_HISTORY",
    title: "Medical & Surgical History",
    stepNumber: 3,
    totalSteps: 4,
    question: {
      en: "Do you have any ongoing health conditions like Diabetes, High Blood Pressure, Thyroid, Asthma, or prior surgeries?",
      hi: "क्या आपको शुगर (डायबिटीज), बीपी, थायराइड, दमा, या कोई पिछली सर्जरी जैसी कोई पुरानी बीमारी है?",
      te: "మీకు షుగర్ (డయాబెటిస్), బిపి, థైరాయిడ్, ఆస్తమా లేదా గతంలో శస్త్రచికిత్సలు వంటి దీర్ఘకాలిక సమస్యలు ఉన్నాయా?",
      ta: "உங்களுக்கு சர்க்கரை நோய் (நீரிழிவு), உயர் ரத்த அழுத்தம், தைராய்டு, ஆஸ்துமா அல்லது முந்தைய அறுவை சிகிச்சைகள் உள்ளதா?",
      kn: "ನಿಮಗೆ ಮಧುಮೇಹ (ಶುಗರ್), ರಕ್ತದೊತ್ತಡ (ಬಿಪಿ), ಥೈರಾಯ್ಡ್, ಆಸ್ತಮಾ ಅಥವಾ ಹಿಂದಿನ ಶಸ್ತ್ರಚಿಕಿತ್ಸೆಗಳಂತಹ ಯಾವುದೇ ಕಾಯಿಲೆಗಳಿವೆಯೇ?",
    },
    suggestions: {
      en: ["No previous medical conditions", "Type 2 Diabetes", "Hypertension (High BP)", "Thyroid Disorder", "Asthma / Respiratory issues", "Previous Surgery / Operation"],
      hi: ["कोई पुरानी बीमारी नहीं", "शुगर / डायबिटीज", "हाई ब्लड प्रेशर (BP)", "थायराइड", "दमा / सांस की बीमारी", "पिछली सर्जरी / ऑपरेशन"],
      te: ["ఎలాంటి మునుపటి సమస్యలు లేవు", "డయాబెటిస్ (షుగర్)", "హైపర్ టెన్షన్ (హై బిపి)", "థైరాయిడ్ సమస్య", "ఆస్తమా / శ్వాస సమస్య", "మునుపటి ఆపరేషన్ / సర్జరీ"],
      ta: ["எந்த முந்தைய நோயும் இல்லை", "சர்க்கரை நோய் (நீரிழிவு)", "உயர் ரத்த அழுத்தம் (BP)", "தைராய்டு", "ஆஸ்துமா", "முந்தைய அறுவை சிகிச்சை"],
      kn: ["ಯಾವುದೇ ಹಿಂದಿನ ಕಾಯಿಲೆಗಳಿಲ್ಲ", "ಮಧುಮೇಹ (ಶುಗರ್)", "ಅಧಿಕ ರಕ್ತದೊತ್ತಡ (BP)", "ಥೈರಾಯ್ಡ್", "ಆಸ್ತಮಾ", "ಹಿಂದಿನ ಶಸ್ತ್ರಚಿಕಿತ್ಸೆ"],
    },
  },
  {
    section: "MEDICATIONS_ALLERGIES",
    title: "Medications & Allergies",
    stepNumber: 4,
    totalSteps: 4,
    question: {
      en: "Are you taking any daily medicines currently, or do you have allergies to any drugs (like Penicillin) or foods?",
      hi: "क्या आप वर्तमान में कोई नियमित दवाएं ले रहे हैं, या आपको किसी दवा (जैसे पेनिसिलिन) या भोजन से एलर्जी है?",
      te: "మీరు ప్రస్తుతం ఏవైనా రోజువారీ మందులు వాడుతున్నారా, లేదా పెన్సిలిన్ వంటి మందులు లేదా ఆహార అలెర్జీలు ఏమైనా ఉన్నాయా?",
      ta: "நீங்கள் தற்போது ஏதேனும் வழக்கமான மருந்துகளை எடுத்துக்கொள்கிறீர்களா, அல்லது மருந்து அல்லது உணவு ஒவ்வாமை (Allergy) உள்ளதா?",
      kn: "ನೀವು ಪ್ರಸ್ತುತ ಯಾವುದೇ ಔಷಧಿಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳುತ್ತಿದ್ದೀರಾ, ಅಥವಾ ಔಷಧಿ ಅಥವಾ ಆಹಾರದ ಅಲರ್ಜಿಗಳು ಇವೆಯೇ?",
    },
    suggestions: {
      en: ["No current medications & No allergies", "Taking BP / Diabetes medicines daily", "Allergic to Penicillin / Antibiotics", "Allergic to Sulfa drugs", "Allergic to specific foods", "Taking Painkillers regularly"],
      hi: ["कोई दवा नहीं और कोई एलर्जी नहीं", "बीपी / शुगर की नियमित दवाएं", "पेनिसिलिन / एंटीबायोटिक से एलर्जी", "सल्फा दवाओं से एलर्जी", "विशेष भोजन से एलर्जी", "दर्द निवारक गोलियां"],
      te: ["ఎలాంటి మందులు & అలర్జీలు లేవు", "రోజువారీ బిపి / షుగర్ మందులు", "పెన్సిలిన్ / యాంటీబయాటిక్స్ అలర్జీ", "సల్ఫా డ్రగ్స్ అలర్జీ", "ఆహార అలర్జీలు", "నొప్పి నివారణ మందులు"],
      ta: ["எந்த மருந்தும் இல்லை & ஒவ்வாமை இல்லை", "வழக்கமான BP / சர்க்கரை மருந்துகள்", "பென்சிலின் ஒவ்வாமை", "சல்பா மருந்து ஒவ்வாமை", "உணவு ஒவ்வாமை", "வலி நிவாரணி மருந்துகள்"],
      kn: ["ಯಾವುದೇ ಔಷಧಿ ಇಲ್ಲ & ಅಲರ್ಜಿ ಇಲ್ಲ", "ದೈನಂದಿನ BP / ಶುಗರ್ ಔಷಧಿಗಳು", "ಪೆನಿಸಿಲಿನ್ ಅಲರ್ಜಿ", "ಸಲ್ಫಾ ಔಷಧಿ ಅಲರ್ಜಿ", "ಆಹಾರ ಅಲರ್ಜಿ", "ನೋವು ನಿವಾರಕ ಔಷಧಿಗಳು"],
    },
  },
];

export const AYUSH_ADDITIONAL_STAGE: QuestionData = {
  section: "AYUSH_EVALUATION",
  title: "Ayurvedic Lifestyle & Prakriti",
  stepNumber: 5,
  totalSteps: 5,
  question: {
    en: "In Ayurveda: How is your digestion (Agni), appetite, sleep pattern, bowel habits, and daily energy levels?",
    hi: "आयुर्वेद के अनुसार: आपकी पाचन शक्ति (अग्नि), भूख, नींद, पेट साफ होने की स्थिति और ऊर्जा का स्तर कैसा है?",
    te: "ఆయుర్వేద విధానంలో: మీ జీర్ణశక్తి (అగ్ని), ఆకలి, నిద్ర, మల విసర్జన మరియు రోజూ శక్తి సామర్థ్యం ఎలా ఉన్నాయి?",
    ta: "ஆயுர்வேத முறையில்: உங்கள் செரிமான சக்தி (அக்னி), பசி, தூக்கம் மற்றும் அன்றாட ஆற்றல் அளவு எப்படி உள்ளது?",
    kn: "ಆಯುರ್ವೇದದಲ್ಲಿ: ನಿಮ್ಮ ಜೀರ್ಣಕ್ರಿಯೆ (ಅಗ್ನಿ), ಹಸಿವು, ನಿದ್ರೆ ಮತ್ತು ದೈನಂದಿನ ಶಕ್ತಿಯ ಮಟ್ಟ ಹೇಗಿದೆ?",
  },
  suggestions: {
    en: ["Normal digestion & good sleep", "Weak digestion / Gas & Acidity (Manda Agni)", "Irregular appetite & restless sleep", "Constipation / Hard stools", "High appetite / Burning sensation (Tikshna Agni)"],
    hi: ["सामान्य पाचन और अच्छी नींद", "कमजोर पाचन / गैस और एसिडिटी (मंदाग्नि)", "अनियमित भूख और बेचैन नींद", "कब्ज की समस्या", "अधिक भूख / पेट में जलन (तीक्ष्णाग्नि)"],
    te: ["సాధారణ జీర్ణక్రియ & మంచి నిద్ర", "బలహీన జీర్ణక్రియ / గ్యాస్ & ఎసిడిటీ (మంద అగ్ని)", "సక్రమంగా లేని ఆకలి & నిద్రలేమి", "మలబద్ధకం సమస్య", "అధిక ఆకలి / కడుపులో మంట (తీక్షణ అగ్ని)"],
    ta: ["இயல்பான செரிமானம் & நல்ல தூக்கம்", "மந்தமான செரிமானம் / வாய்வு & அமிலத்தன்மை", "முறையற்ற பசி & தூக்கமின்மை", "மலச்சிக்கல் பிரச்சனை", "அதிக பசி / நெஞ்செரிச்சல்"],
    kn: ["ಸಾಮಾನ್ಯ ಜೀರ್ಣಕ್ರಿಯೆ & ಉತ್ತಮ ನಿದ್ರೆ", "ದುರ್ಬಲ ಜೀರ್ಣಕ್ರಿಯೆ / ಗ್ಯಾಸ್ & ಅಸಿಡಿಟಿ", "ಅನಿಯಮಿತ ಹಸಿವು & ನಿದ್ರಾಹೀನತೆ", "ಮಲಬದ್ಧತೆ", "ಅತಿಯಾದ ಹಸಿವು / ಹೊಟ್ಟೆ ಉರಿ"],
  },
};

export function getInterviewStages(department: string): QuestionData[] {
  if (department.includes("AYUSH") || department.includes("Ayurveda")) {
    const updatedStages = GENERAL_INTERVIEW_STAGES.map((stage) => ({
      ...stage,
      totalSteps: 5,
    }));
    return [...updatedStages, AYUSH_ADDITIONAL_STAGE];
  }
  
  return GENERAL_INTERVIEW_STAGES;
}