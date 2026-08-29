export type SupportedLanguage = "en" | "hi" | "te" | "ta" | "kn";

export interface TranslationDictionary {
  // Navigation & Common
  preconsult: string;
  patientPortal: string;
  myHealthDashboard: string;
  language: string;
  back: string;
  continue: string;
  submit: string;
  cancel: string;
  loading: string;
  downloadFhir: string;
  
  // Dashboard
  welcomeBack: string;
  uhid: string;
  tokenNumber: string;
  activeVisit: string;
  noActiveVisit: string;
  startNewIntake: string;
  resumeIntake: string;
  visitTimeline: string;
  waitingForDoctor: string;
  inConsultation: string;
  intakeComplete: string;
  prescriptionReady: string;
  doctorPrescriptionAndAdvice: string;
  signedBy: string;
  confirmedDiagnosis: string;
  prescribedMedications: string;
  doctorAdviceNotes: string;
  followUpVisit: string;
  listenInNativeLanguage: string;
  medicalRecords: string;
  uploadNewRecord: string;
  noRecordsYet: string;
  pastConsultations: string;
  
  // Document Upload
  uploadTitle: string;
  uploadSubtitle: string;
  dropzoneTitle: string;
  dropzoneSubtitle: string;
  uploadingText: string;
  supportedFormats: string;
  uploadedDocuments: string;
  extractingAiInfo: string;
  extractionComplete: string;
  proceedToReview: string;
  skipForNow: string;

  // Review & Confirm History
  reviewTitle: string;
  reviewSubtitle: string;
  chiefComplaint: string;
  symptomsDetails: string;
  pastHistory: string;
  currentMedications: string;
  ayurvedicProfile: string;
  confirmAndSubmit: string;
  editAnswers: string;
  patientConfirmationNote: string;

  // Intake Complete
  intakeSubmittedTitle: string;
  intakeSubmittedSubtitle: string;
  yourTokenIs: string;
  estimatedWait: string;
  waitingInstructions: string;
  viewDashboard: string;

  // Consent
  consentTitle: string;
  consentSubtitle: string;
  consentPoint1: string;
  consentPoint2: string;
  consentPoint3: string;
  iAgreeAndProceed: string;

  // Email Notification
  emailHeaderSubtitle: string;
  emailPatientName: string;
  emailConsultedOn: string;
  emailAttendingPhysician: string;
  emailConfirmedDiagnosis: string;
  emailPrescriptionsTitle: string;
  emailMedicine: string;
  emailFrequency: string;
  emailDuration: string;
  emailInstructions: string;
  emailDoctorAdvice: string;
  emailFollowUp: string;
  emailCtaButton: string;
  emailCtaHelper: string;
  emailFooterNote: string;
}

export const PATIENT_TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    preconsult: "PreConsult",
    patientPortal: "Patient Portal",
    myHealthDashboard: "Patient Health Dashboard",
    language: "Language",
    back: "Back",
    continue: "Continue",
    submit: "Submit",
    cancel: "Cancel",
    loading: "Loading...",
    downloadFhir: "Download ABDM / FHIR Record",
    
    welcomeBack: "Welcome back",
    uhid: "UHID",
    tokenNumber: "Token Number",
    activeVisit: "Active Consultation Visit",
    noActiveVisit: "No active consultation today",
    startNewIntake: "Start Pre-Consultation Intake",
    resumeIntake: "Resume Clinical Intake",
    visitTimeline: "Consultation Journey",
    waitingForDoctor: "Waiting in OPD Queue",
    inConsultation: "In Consultation with Doctor",
    intakeComplete: "Pre-Consultation Intake Completed",
    prescriptionReady: "Prescription & Advice Ready",
    doctorPrescriptionAndAdvice: "Doctor's Prescription & Advice",
    signedBy: "Signed by",
    confirmedDiagnosis: "Confirmed Clinical Diagnosis",
    prescribedMedications: "Prescribed Medications (Rx)",
    doctorAdviceNotes: "Doctor's Advice & Lifestyle Notes",
    followUpVisit: "Recommended Follow-up Visit",
    listenInNativeLanguage: "Listen in your preferred language",
    medicalRecords: "Medical Records & Reports",
    uploadNewRecord: "Upload Reports / Rx",
    noRecordsYet: "No medical documents uploaded yet.",
    pastConsultations: "Past Consultations",

    uploadTitle: "Upload Medical Documents",
    uploadSubtitle: "Upload your previous prescriptions, lab reports, or discharge summaries for doctor review.",
    dropzoneTitle: "Tap to upload or drag files here",
    dropzoneSubtitle: "Supports PDF, JPG, PNG up to 16MB",
    uploadingText: "Uploading and analyzing documents with AI OCR...",
    supportedFormats: "Prescriptions, Blood Tests, X-Rays, Discharge Summaries",
    uploadedDocuments: "Uploaded Documents",
    extractingAiInfo: "AI Extracting Clinical Timeline...",
    extractionComplete: "OCR Analysis Complete",
    proceedToReview: "Proceed to Review History",
    skipForNow: "Skip Document Upload",

    reviewTitle: "Review Your Clinical History",
    reviewSubtitle: "Please review your answers before submitting to the doctor.",
    chiefComplaint: "Chief Complaint",
    symptomsDetails: "Symptoms & History of Present Illness",
    pastHistory: "Past Medical History",
    currentMedications: "Current Medications & Allergies",
    ayurvedicProfile: "Ayurvedic Health Profile",
    confirmAndSubmit: "Confirm & Submit to Doctor",
    editAnswers: "Edit Answers",
    patientConfirmationNote: "I confirm that the above health information provided by me is accurate.",

    intakeSubmittedTitle: "Clinical Intake Complete!",
    intakeSubmittedSubtitle: "Your structured clinical history has been submitted directly to the attending doctor's screen.",
    yourTokenIs: "Your OPD Token Number",
    estimatedWait: "Estimated wait time: 5 - 10 minutes",
    waitingInstructions: "Please wait in the OPD lounge until your token number is called.",
    viewDashboard: "Go to Patient Dashboard",

    consentTitle: "Patient Consent & Language",
    consentSubtitle: "PreConsult helps you prepare your health information before meeting the doctor.",
    consentPoint1: "Your answers and documents will be summarized using assistive AI for your doctor.",
    consentPoint2: "You can speak or tap your answers in your native language.",
    consentPoint3: "Your doctor will review, confirm, and provide final diagnosis and treatment.",
    iAgreeAndProceed: "I Agree & Start Intake",

    emailHeaderSubtitle: "Official Digital Prescription & Consultation Summary",
    emailPatientName: "Patient Name",
    emailConsultedOn: "Consulted on",
    emailAttendingPhysician: "Attending Physician",
    emailConfirmedDiagnosis: "Confirmed Clinical Diagnosis",
    emailPrescriptionsTitle: "Prescribed Medications (Rx)",
    emailMedicine: "Medicine",
    emailFrequency: "Frequency",
    emailDuration: "Duration",
    emailInstructions: "Instructions",
    emailDoctorAdvice: "Doctor's Advice & Lifestyle Notes",
    emailFollowUp: "Recommended Follow-up Visit",
    emailCtaButton: "Open Patient Dashboard & Listen in Native Language",
    emailCtaHelper: "Click above to listen to spoken audio instructions in your preferred language.",
    emailFooterNote: "This digital prescription was authorized via PreConsult Clinical Intake Platform. ABDM & Digital Health Record Guidelines compliant.",
  },

  hi: {
    preconsult: "PreConsult",
    patientPortal: "मरीज़ पोर्टल",
    myHealthDashboard: "मरीज़ स्वास्थ्य डैशबोर्ड",
    language: "भाषा",
    back: "पीछे जाएं",
    continue: "आगे बढ़ें",
    submit: "जमा करें",
    cancel: "रद्द करें",
    loading: "लोड हो रहा है...",
    downloadFhir: "ABDM / FHIR रिकॉर्ड डाउनलोड करें",
    
    welcomeBack: "नमस्ते",
    uhid: "UHID संख्या",
    tokenNumber: "टोकन नंबर",
    activeVisit: "वर्तमान परामर्श विज़िट",
    noActiveVisit: "आज कोई सक्रिय परामर्श नहीं है",
    startNewIntake: "नई स्वास्थ्य जानकारी दर्ज करें",
    resumeIntake: "अधूरी जानकारी पूरी करें",
    visitTimeline: "परामर्श प्रक्रिया",
    waitingForDoctor: "ओपीडी कतार में प्रतीक्षा कर रहे हैं",
    inConsultation: "डॉक्टर के साथ परामर्श जारी है",
    intakeComplete: "स्वास्थ्य विवरण सफलतापूर्वक दर्ज",
    prescriptionReady: "दवा पर्ची और सलाह तैयार है",
    doctorPrescriptionAndAdvice: "डॉक्टर की दवा पर्ची और सलाह",
    signedBy: "हस्ताक्षरित द्वारा",
    confirmedDiagnosis: "पुष्ट निदान (बीमारी)",
    prescribedMedications: "निर्धारित दवाइयां (Rx)",
    doctorAdviceNotes: "डॉक्टर की सलाह और सावधानियां",
    followUpVisit: "अगली विज़िट की तारीख",
    listenInNativeLanguage: "अपनी पसंदीदा भाषा में सुनें",
    medicalRecords: "मेडिकल रिकॉर्ड्स और रिपोर्ट्स",
    uploadNewRecord: "पुरानी रिपोर्ट्स अपलोड करें",
    noRecordsYet: "अभी तक कोई मेडिकल दस्तावेज़ अपलोड नहीं किया गया।",
    pastConsultations: "पिछले परामर्श",

    uploadTitle: "मेडिकल दस्तावेज़ अपलोड करें",
    uploadSubtitle: "डॉक्टर के अवलोकन के लिए अपने पुराने पर्चे, लैब टेस्ट या डिस्चार्ज समरी अपलोड करें।",
    dropzoneTitle: "अपलोड करने के लिए टैप करें या फ़ाइलें यहां खींचें",
    dropzoneSubtitle: "PDF, JPG, PNG (अधिकतम 16MB)",
    uploadingText: "दस्तावेज़ अपलोड और AI द्वारा विश्लेषण किया जा रहा है...",
    supportedFormats: "दवा पर्चे, रक्त परीक्षण, एक्स-रे, डिस्चार्ज समरी",
    uploadedDocuments: "अपलोड किए गए दस्तावेज़",
    extractingAiInfo: "AI द्वारा मेडिकल टाइमलाइन तैयार की जा रही है...",
    extractionComplete: "विश्लेषण पूरा हुआ",
    proceedToReview: "विवरण की समीक्षा करें",
    skipForNow: "अपलोड छोड़ें और आगे बढ़ें",

    reviewTitle: "अपने स्वास्थ्य विवरण की समीक्षा करें",
    reviewSubtitle: "डॉक्टर को जमा करने से पहले कृपया अपने उत्तरों की जांच कर लें।",
    chiefComplaint: "मुख्य समस्या",
    symptomsDetails: "लक्षण और बीमारी का विवरण",
    pastHistory: "पिछला मेडिकल इतिहास",
    currentMedications: "वर्तमान दवाइयां और एलर्जी",
    ayurvedicProfile: "आयुर्वेदिक स्वास्थ्य प्रोफाइल",
    confirmAndSubmit: "पुष्टि करें और डॉक्टर को भेजें",
    editAnswers: "उत्तर बदलें",
    patientConfirmationNote: "मैं पुष्टि करता/करती हूँ कि मेरे द्वारा दी गई जानकारी सही है।",

    intakeSubmittedTitle: "जानकारी सफलतापूर्वक दर्ज हुई!",
    intakeSubmittedSubtitle: "आपकी स्वास्थ्य जानकारी सीधे डॉक्टर की स्क्रीन पर भेज दी गई है।",
    yourTokenIs: "आपका ओपीडी टोकन नंबर",
    estimatedWait: "अनुमानित प्रतीक्षा समय: 5 - 10 मिनट",
    waitingInstructions: "कृपया अपना टोकन नंबर पुकारे जाने तक प्रतीक्षालय में बैठें।",
    viewDashboard: "मरीज़ डैशबोर्ड देखें",

    consentTitle: "मरीज़ सहमति और भाषा",
    consentSubtitle: "PreConsult डॉक्टर से मिलने से पहले आपकी स्वास्थ्य जानकारी तैयार करने में मदद करता है।",
    consentPoint1: "आपके उत्तर और दस्तावेज़ AI द्वारा डॉक्टर के लिए संक्षेप में तैयार किए जाएंगे।",
    consentPoint2: "आप अपनी मातृभाषा में बोलकर या टैप करके उत्तर दे सकते हैं।",
    consentPoint3: "आपके डॉक्टर विवरण की पुष्टि करेंगे और अंतिम उपचार का निर्णय लेंगे।",
    iAgreeAndProceed: "मैं सहमत हूँ और शुरू करें",

    emailHeaderSubtitle: "आधिकारिक डिजिटल दवा पर्ची और परामर्श सारांश",
    emailPatientName: "मरीज़ का नाम",
    emailConsultedOn: "परामर्श तिथि",
    emailAttendingPhysician: "उपचारक डॉक्टर",
    emailConfirmedDiagnosis: "पुष्ट निदान (बीमारी)",
    emailPrescriptionsTitle: "निर्धारित दवाइयां (Rx)",
    emailMedicine: "दवा का नाम",
    emailFrequency: "खुराक का समय",
    emailDuration: "अवधि",
    emailInstructions: "निर्देश",
    emailDoctorAdvice: "डॉक्टर की सलाह और जीवनशैली निर्देश",
    emailFollowUp: "अनुशंसित अगली विज़िट",
    emailCtaButton: "डैशबोर्ड खोलें और अपनी भाषा में सुनें",
    emailCtaHelper: "अपनी पसंदीदा भाषा में दवा के समय सुनने के लिए ऊपर क्लिक करें।",
    emailFooterNote: "यह डिजिटल पर्ची PreConsult क्लिनिकल इंटेक प्लेटफॉर्म द्वारा जारी की गई है। ABDM स्वास्थ्य मानकों के अनुरूप।",
  },

  te: {
    preconsult: "PreConsult",
    patientPortal: "రోగి పోర్టల్",
    myHealthDashboard: "రోగి ఆరోగ్య డాష్‌బోర్డ్",
    language: "భాష",
    back: "వెనుకకు",
    continue: "కొనసాగించండి",
    submit: "సమర్పించండి",
    cancel: "రద్దు చేయండి",
    loading: "లోడ్ అవుతోంది...",
    downloadFhir: "ABDM / FHIR రికార్డ్ డౌన్‌లోడ్ చేయండి",
    
    welcomeBack: "స్వాగతం",
    uhid: "UHID సంఖ్య",
    tokenNumber: "టోకెన్ నంబర్",
    activeVisit: "ప్రస్తుత కన్సల్టేషన్ విజిట్",
    noActiveVisit: "ఈరోజు ఎలాంటి యాక్టివ్ కన్సల్టేషన్ లేదు",
    startNewIntake: "కొత్త ఆరోగ్య వివరాలు నమోదు చేయండి",
    resumeIntake: "వివరాలను పూర్తి చేయండి",
    visitTimeline: "కన్సల్టేషన్ ప్రక్రియ",
    waitingForDoctor: "OPD క్యూలో వేచి ఉన్నారు",
    inConsultation: "వైద్యునితో కన్సల్టేషన్ జరుగుతోంది",
    intakeComplete: "వివరాల నమోదు పూర్తయింది",
    prescriptionReady: "మందుల చీటీ & సలహాలు సిద్ధంగా ఉన్నాయి",
    doctorPrescriptionAndAdvice: "డాక్టర్ మందుల చీటీ & సలహాలు",
    signedBy: "ధృవీకరించిన వారు",
    confirmedDiagnosis: "నిర్ధారించిన వ్యాధి లక్షణాలు",
    prescribedMedications: "సూచించిన మందులు (Rx)",
    doctorAdviceNotes: "డాక్టర్ సలహాలు & సూచనలు",
    followUpVisit: "తదుపరి సందర్శన తేదీ",
    listenInNativeLanguage: "మీ మాతృభాషలో వినండి",
    medicalRecords: "వైద్య రికార్డులు & నివేదికలు",
    uploadNewRecord: "పాత రిపోర్టులు అప్‌లోడ్ చేయండి",
    noRecordsYet: "ఇప్పటివరకు ఎలాంటి మెడికల్ డాక్యుమెంట్లు అప్‌లోడ్ చేయలేదు.",
    pastConsultations: "గత కన్సల్టేషన్లు",

    uploadTitle: "మెడికల్ డాక్యుమెంట్లు అప్‌లోడ్ చేయండి",
    uploadSubtitle: "డాక్టర్ పరిశీలన కోసం మీ పాత ప్రిస్క్రిప్షన్‌లు, ల్యాబ్ రిపోర్టులు లేదా డిశ్చార్జ్ సారాంశాలను అప్‌లోడ్ చేయండి.",
    dropzoneTitle: "అప్‌లోడ్ చేయడానికి నొక్కండి లేదా ఫైళ్లను ఇక్కడ లాగండి",
    dropzoneSubtitle: "PDF, JPG, PNG (గరిష్టంగా 16MB)",
    uploadingText: "డాక్యుమెంట్లు అప్‌లోడ్ మరియు AI ద్వారా విశ్లేషించబడుతున్నాయి...",
    supportedFormats: "ప్రిస్క్రిప్షన్లు, రక్త పరీక్షలు, ఎక్స్-రేలు, డిశ్చార్జ్ సమ్మరీలు",
    uploadedDocuments: "అప్‌లోడ్ చేసిన డాక్యుమెంట్లు",
    extractingAiInfo: "AI ద్వారా మెడికల్ టైమ్‌లైన్ రూపొందించబడుతోంది...",
    extractionComplete: "విశ్లేషణ పూర్తయింది",
    proceedToReview: "వివరాలను సమీక్షించండి",
    skipForNow: "అప్‌లోడ్ దాటవేసి ముందుకు వెళ్లండి",

    reviewTitle: "మీ ఆరోగ్య వివరాలను సమీక్షించండి",
    reviewSubtitle: "డాక్టర్‌కు సమర్పించే ముందు దయచేసి మీ సమాధానాలను ఒకసారి తనిఖీ చేయండి.",
    chiefComplaint: "ప్రధాన సమస్య",
    symptomsDetails: "లక్షణాలు & వ్యాధి చరిత్ర",
    pastHistory: "గత ఆరోగ్య చరిత్ర",
    currentMedications: "ప్రస్తుత మందులు & అలర్జీలు",
    ayurvedicProfile: "ఆయుర్వేద ఆరోగ్య ప్రొఫైల్",
    confirmAndSubmit: "ధృవీకరించి డాక్టర్‌కు పంపండి",
    editAnswers: "సమాధానాలు మార్చండి",
    patientConfirmationNote: "నేను అందించిన ఆరోగ్య సమాచారం సరైనదని ధృవీకరిస్తున్నాను.",

    intakeSubmittedTitle: "వివరాల నమోదు పూర్తయింది!",
    intakeSubmittedSubtitle: "మీ ఆరోగ్య వివరాలు నేరుగా హాజరయ్యే వైద్యుని స్క్రీన్‌కు పంపబడ్డాయి.",
    yourTokenIs: "మీ OPD టోకెన్ నంబర్",
    estimatedWait: "వేచి ఉండే సమయం: 5 - 10 నిమిషాలు",
    waitingInstructions: "మీ టోకెన్ నంబర్ పిలిచే వరకు దయచేసి వెయిటింగ్ రూమ్‌లో వేచి ఉండండి.",
    viewDashboard: "పేషెంట్ డాష్‌బోర్డ్ చూడండి",

    consentTitle: "రోగి సమ్మతి & భాష ఎంపిక",
    consentSubtitle: "డాక్టర్‌ని కలిసే ముందు మీ ఆరోగ్య సమాచారాన్ని సిద్ధం చేయడానికి PreConsult సహాయపడుతుంది.",
    consentPoint1: "మీ సమాధానాలు మరియు పత్రాలు AI ద్వారా డాక్టర్ కోసం సంక్షిప్తీకరించబడతాయి.",
    consentPoint2: "మీరు మీ మాతృభాషలో మాట్లాడటం లేదా నొక్కడం ద్వారా సమాధానాలు ఇవ్వవచ్చు.",
    consentPoint3: "మీ వైద్యులు వివరాలను సమీక్షించి, తుది చికిత్సను నిర్ణయిస్తారు.",
    iAgreeAndProceed: "నేను అంగీకరిస్తున్నాను & ప్రారంభించండి",

    emailHeaderSubtitle: "అధికారిక డిజిటల్ ప్రిస్క్రిప్షన్ & కన్సల్టేషన్ సారాంశం",
    emailPatientName: "రోగి పేరు",
    emailConsultedOn: "సందర్శించిన తేదీ",
    emailAttendingPhysician: "వైద్యులు",
    emailConfirmedDiagnosis: "నిర్ధారించిన వ్యాధి లక్షణాలు",
    emailPrescriptionsTitle: "సూచించిన మందులు (Rx)",
    emailMedicine: "మందు పేరు",
    emailFrequency: "మోతాదు & సమయం",
    emailDuration: "వ్యవధి",
    emailInstructions: "సూచనలు",
    emailDoctorAdvice: "డాక్టర్ సలహాలు & జీవనశైలి మార్గదర్శకాలు",
    emailFollowUp: "తదుపరి సందర్శన తేదీ",
    emailCtaButton: "డాష్‌బోర్డ్ తెరిచి మీ భాషలో వినండి",
    emailCtaHelper: "మీ మాతృభాషలో మందుల వేళలను వినడానికి పైన క్లిక్ చేయండి.",
    emailFooterNote: "ఈ డిజిటల్ ప్రిస్క్రిప్షన్ PreConsult క్లినికల్ ఇన్‌టేక్ ప్లాట్‌ఫారమ్ ద్వారా జారీ చేయబడింది. ABDM మార్గదర్శకాలకు అనుగుణంగా ఉంది.",
  },

  ta: {
    preconsult: "PreConsult",
    patientPortal: "நோயாளி போர்டல்",
    myHealthDashboard: "நோயாளி சுகாதார டாஷ்போர்டு",
    language: "மொழி",
    back: "பின்செல்லவும்",
    continue: "தொடரவும்",
    submit: "சமர்ப்பிக்கவும்",
    cancel: "ரத்து செய்யவும்",
    loading: "ஏற்றுகிறது...",
    downloadFhir: "ABDM / FHIR பதிவிறக்கவும்",
    
    welcomeBack: "வணக்கம்",
    uhid: "UHID எண்",
    tokenNumber: "டோக்கன் எண்",
    activeVisit: "தற்போதைய மருத்துவ வருகை",
    noActiveVisit: "இன்று செயலில் உள்ள வருகை இல்லை",
    startNewIntake: "புதிய சுகாதார விவரங்களை பதிவு செய்க",
    resumeIntake: "பதிவை தொடரவும்",
    visitTimeline: "ஆலோசனை செயல்முறை",
    waitingForDoctor: "OPD வரிசையில் காத்திருக்கிறது",
    inConsultation: "மருத்துவருடன் ஆலோசனை நடக்கிறது",
    intakeComplete: "விவரங்கள் வெற்றிகரமாக பதிவு செய்யப்பட்டன",
    prescriptionReady: "மருந்து சீட்டு மற்றும் ஆலோசனைகள் தயார்",
    doctorPrescriptionAndAdvice: "மருத்துவரின் மருந்து சீட்டு & ஆலோசனைகள்",
    signedBy: "கையொப்பமிட்டவர்",
    confirmedDiagnosis: "உறுதிப்படுத்தப்பட்ட நோய் கண்டறிதல்",
    prescribedMedications: "பரிந்துரைக்கப்பட்ட மருந்துகள் (Rx)",
    doctorAdviceNotes: "மருத்துவரின் ஆலோசனைகள் & வழிகாட்டுதல்கள்",
    followUpVisit: "அடுத்த சந்திப்பு தேதி",
    listenInNativeLanguage: "உங்கள் தாய்மொழியில் கேட்கவும்",
    medicalRecords: "மருத்துவ பதிவுகள் & அறிக்கைகள்",
    uploadNewRecord: "பழைய அறிக்கைகளை பதிவேற்றவும்",
    noRecordsYet: "இதுவரை எந்த மருத்துவ ஆவணங்களும் பதிவேற்றப்படவில்லை.",
    pastConsultations: "முந்தைய ஆலோசனைகள்",

    uploadTitle: "மருத்துவ ஆவணங்களை பதிவேற்றவும்",
    uploadSubtitle: "மருத்துவரின் பார்வைக்கு உங்கள் முந்தைய மருந்து சீட்டுகள், பரிசோதனை அறிக்கைகளை பதிவேற்றவும்.",
    dropzoneTitle: "பதிவேற்ற தட்டவும் அல்லது கோப்புகளை இழுத்து விடவும்",
    dropzoneSubtitle: "PDF, JPG, PNG (அதிகபட்சம் 16MB)",
    uploadingText: "ஆவணங்கள் பதிவேற்றப்பட்டு AI மூலம் பகுப்பாய்வு செய்யப்படுகிறது...",
    supportedFormats: "மருந்து சீட்டுகள், இரத்த பரிசோதனைகள், எக்ஸ்-ரேக்கள்",
    uploadedDocuments: "பதிவேற்றப்பட்ட ஆவணங்கள்",
    extractingAiInfo: "AI மூலம் மருத்துவ காலவரிசை தயாரிக்கப்படுகிறது...",
    extractionComplete: "பகுப்பாய்வு முடிந்தது",
    proceedToReview: "விவரங்களை மதிப்பாய்வு செய்க",
    skipForNow: "தவிர்த்துவிட்டு தொடரவும்",

    reviewTitle: "உங்கள் சுகாதார விவரங்களை சரிபார்க்கவும்",
    reviewSubtitle: "மருத்துவரிடம் சமர்ப்பிக்கும் முன் உங்கள் பதில்களை மதிப்பாய்வு செய்யவும்.",
    chiefComplaint: "முதன்மை பிரச்சனை",
    symptomsDetails: "அறிகுறிகள் & நோய் வரலாறு",
    pastHistory: "கடந்தகால மருத்துவ வரலாறு",
    currentMedications: "தற்போதைய மருந்துகள் & ஒவ்வாமை",
    ayurvedicProfile: "ஆயுர்வேத சுகாதார விவரம்",
    confirmAndSubmit: "உறுதிசெய்து மருத்துவருக்கு அனுப்பவும்",
    editAnswers: "பதில்களை மாற்றவும்",
    patientConfirmationNote: "நான் வழங்கிய சுகாதார தகவல்கள் துல்லியமானவை என்பதை உறுதிப்படுத்துகிறேன்.",

    intakeSubmittedTitle: "விவரங்கள் சமர்ப்பிக்கப்பட்டன!",
    intakeSubmittedSubtitle: "உங்கள் சுகாதார விவரங்கள் நேரடியாக மருத்துவரின் திரைக்கு அனுப்பப்பட்டுள்ளன.",
    yourTokenIs: "உங்கள் OPD டோக்கன் எண்",
    estimatedWait: "காத்திருக்கும் நேரம்: 5 - 10 நிமிடங்கள்",
    waitingInstructions: "உங்கள் டோக்கன் எண் அழைக்கப்படும் வரை காத்திருக்கவும்.",
    viewDashboard: "நோயாளி டாஷ்போர்டைப் பார்க்கவும்",

    consentTitle: "நோயாளி சம்மதம் & மொழி",
    consentSubtitle: "மருத்துவரை சந்திப்பதற்கு முன் உங்கள் சுகாதார தகவல்களை தயார் செய்ய PreConsult உதவுகிறது.",
    consentPoint1: "உங்கள் பதில்கள் AI மூலம் சுருக்கப்பட்டு மருத்துவருக்கு வழங்கப்படும்.",
    consentPoint2: "உங்கள் தாய்மொழியில் பேசி அல்லது தட்டி பதிலளிக்கலாம்.",
    consentPoint3: "உங்கள் மருத்துவர் விவரங்களை உறுதிசெய்து இறுதி சிகிச்சையை வழங்குவார்.",
    iAgreeAndProceed: "நான் ஒப்புக்கொள்கிறேன் & தொடங்கவும்",

    emailHeaderSubtitle: "அதிகாரப்பூர்வ டிஜிட்டல் மருந்து சீட்டு & சுருக்கம்",
    emailPatientName: "நோயாளி பெயர்",
    emailConsultedOn: "ஆலோசனை தேதி",
    emailAttendingPhysician: "மருத்துவர்",
    emailConfirmedDiagnosis: "உறுதிப்படுத்தப்பட்ட நோய் கண்டறிதல்",
    emailPrescriptionsTitle: "பரிந்துரைக்கப்பட்ட மருந்துகள் (Rx)",
    emailMedicine: "மருந்து",
    emailFrequency: "அளவு & நேரம்",
    emailDuration: "கால அளவு",
    emailInstructions: "வழிமுறைகள்",
    emailDoctorAdvice: "மருத்துவரின் ஆலோசனைகள் & வழிகாட்டுதல்கள்",
    emailFollowUp: "பரிந்துரைக்கப்பட்ட அடுத்த வருகை",
    emailCtaButton: "டாஷ்போர்டை திறந்து உங்கள் மொழியில் கேட்கவும்",
    emailCtaHelper: "உங்கள் தாய்மொழியில் மருந்தெடுக்கும் நேரத்தைக் கேட்க மேலே கிளிக் செய்யவும்.",
    emailFooterNote: "இந்த டிஜிட்டல் மருந்து சீட்டு PreConsult தளம் மூலம் வழங்கப்பட்டது. ABDM வழிகாட்டுதல்களுக்கு உட்பட்டது.",
  },

  kn: {
    preconsult: "PreConsult",
    patientPortal: "ರೋಗಿ ಪೋರ್ಟಲ್",
    myHealthDashboard: "ರೋಗಿ ಆರೋಗ್ಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    language: "ಭಾಷೆ",
    back: "ಹಿಂದಕ್ಕೆ",
    continue: "ಮುಂದುವರಿಯಿರಿ",
    submit: "ಸಲ್ಲಿಸಿ",
    cancel: "ರದ್ದುಮಾಡಿ",
    loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    downloadFhir: "ABDM / FHIR ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ",
    
    welcomeBack: "ಸ್ವಾಗತ",
    uhid: "UHID ಸಂಖ್ಯೆ",
    tokenNumber: "ಟೋಕನ್ ಸಂಖ್ಯೆ",
    activeVisit: "ಪ್ರಸ್ತುತ ಸಮಾಲೋಚನೆ ಭೇಟಿ",
    noActiveVisit: "ಇಂದು ಯಾವುದೇ ಸಕ್ರಿಯ ಸಮಾಲೋಚನೆ ಇಲ್ಲ",
    startNewIntake: "ಹೊಸ ಆರೋಗ್ಯ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ",
    resumeIntake: "ವಿವರಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ",
    visitTimeline: "ಸಮಾಲೋಚನೆ ಪ್ರಕ್ರಿಯೆ",
    waitingForDoctor: "OPD ಸರದಿಯಲ್ಲಿ ಕಾಯುತ್ತಿದ್ದೀರಿ",
    inConsultation: "ವೈದ್ಯರೊಂದಿಗೆ ಸಮಾಲೋಚನೆ ನಡೆಯುತ್ತಿದೆ",
    intakeComplete: "ವಿವರಗಳ ನೋಂದಣಿ ಪೂರ್ಣಗೊಂಡಿದೆ",
    prescriptionReady: "ಔಷಧಿ ಚೀಟಿ ಮತ್ತು ಸಲಹೆ ಸಿದ್ಧವಾಗಿದೆ",
    doctorPrescriptionAndAdvice: "ವೈದ್ಯರ ಔಷಧಿ ಚೀಟಿ & ಸಲಹೆಗಳು",
    signedBy: "ದೃಢೀಕರಿಸಿದವರು",
    confirmedDiagnosis: "ದೃಢೀಕರಿಸಿದ ರೋಗನಿರ್ಣಯ",
    prescribedMedications: "ಸೂಚಿಸಲಾದ ಔಷಧಿಗಳು (Rx)",
    doctorAdviceNotes: "ವೈದ್ಯರ ಸಲಹೆಗಳು & ಸೂಚನೆಗಳು",
    followUpVisit: "ಮುಂದಿನ ಭೇಟಿಯ ದಿನಾಂಕ",
    listenInNativeLanguage: "ನಿಮ್ಮ ಮಾತೃಭಾಷೆಯಲ್ಲಿ ಕೇಳಿ",
    medicalRecords: "ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳು & ವರದಿಗಳು",
    uploadNewRecord: "ಹಳೆಯ ವರದಿಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    noRecordsYet: "ಇಲ್ಲಿಯವರೆಗೆ ಯಾವುದೇ ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾಗಿಲ್ಲ.",
    pastConsultations: "ಹಿಂದಿನ ಸಮಾಲೋಚನೆಗಳು",

    uploadTitle: "ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    uploadSubtitle: "ವೈದ್ಯರ ಪರಿಶೀಲನೆಗಾಗಿ ನಿಮ್ಮ ಹಿಂದಿನ ಔಷಧಿ ಚೀಟಿಗಳು ಅಥವಾ ಲ್ಯಾಬ್ ವರದಿಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
    dropzoneTitle: "ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಸ್ಪರ್ಶಿಸಿ ಅಥವಾ ಫೈಲ್‌ಗಳನ್ನು ಇಲ್ಲಿಗೆ ಎಳೆಯಿರಿ",
    dropzoneSubtitle: "PDF, JPG, PNG (ಗರಿಷ್ಠ 16MB)",
    uploadingText: "ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ ಮತ್ತು AI ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ...",
    supportedFormats: "ಔಷಧಿ ಚೀಟಿಗಳು, ರಕ್ತ ಪರೀಕ್ಷೆಗಳು, ಎಕ್ಸ್-ರೇಗಳು",
    uploadedDocuments: "ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ದಾಖಲೆಗಳು",
    extractingAiInfo: "AI ಮೂಲಕ ಮೆಡಿಕಲ್ ಟೈಮ್‌ಲೈನ್ ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ...",
    extractionComplete: "ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ",
    proceedToReview: "ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ",
    skipForNow: "ಅಪ್‌ಲೋಡ್ ಬಿಟ್ಟು ಮುಂದುವರಿಯಿರಿ",

    reviewTitle: "ನಿಮ್ಮ ಆರೋಗ್ಯ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ",
    reviewSubtitle: "ವೈದ್ಯರಿಗೆ ಸಲ್ಲಿಸುವ ಮೊದಲು ದಯವಿಟ್ಟು ನಿಮ್ಮ ಉತ್ತರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
    chiefComplaint: "ಮುಖ್ಯ ಸಮಸ್ಯೆ",
    symptomsDetails: "ರೋಗಲಕ್ಷಣಗಳು & ಇತಿಹಾಸ",
    pastHistory: "ಹಿಂದಿನ ವೈದ್ಯಕೀಯ ಇತಿಹಾಸ",
    currentMedications: "ಪ್ರಸ್ತುತ ಔಷಧಿಗಳು & ಅಲರ್ಜಿಗಳು",
    ayurvedicProfile: "ಆಯುರ್ವೇದ ಆರೋಗ್ಯ ಪ್ರೊಫೈಲ್",
    confirmAndSubmit: "ದೃಢೀಕರಿಸಿ ವೈದ್ಯರಿಗೆ ಕಳುಹಿಸಿ",
    editAnswers: "ಉತ್ತರಗಳನ್ನು ಬದಲಾಯಿಸಿ",
    patientConfirmationNote: "ನಾನು ಒದಗಿಸಿದ ಆರೋಗ್ಯ ಮಾಹಿತಿ ನಿಖರವಾಗಿದೆ ಎಂದು ನಾನು ದೃಢೀಕರಿಸುತ್ತೇನೆ.",

    intakeSubmittedTitle: "ವಿವರಗಳ ನೋಂದಣಿ ಪೂರ್ಣಗೊಂಡಿದೆ!",
    intakeSubmittedSubtitle: "ನಿಮ್ಮ ಆರೋಗ್ಯ ವಿವರಗಳನ್ನು ನೇರವಾಗಿ ವೈದ್ಯರ ಪರದೆಗೆ ಕಳುಹಿಸಲಾಗಿದೆ.",
    yourTokenIs: "ನಿಮ್ಮ OPD ಟೋಕನ್ ಸಂಖ್ಯೆ",
    estimatedWait: "ಅಂದಾಜು ಕಾಯುವ ಸಮಯ: 5 - 10 ನಿಮಿಷಗಳು",
    waitingInstructions: "ನಿಮ್ಮ ಟೋಕನ್ ಸಂಖ್ಯೆಯನ್ನು ಕರೆಯುವವರೆಗೆ ದಯವಿಟ್ಟು ಕಾಯುವ ಕೋಣೆಯಲ್ಲಿ ಕುಳಿತುಕೊಳ್ಳಿ.",
    viewDashboard: "ರೋಗಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ವೀಕ್ಷಿಸಿ",

    consentTitle: "ರೋಗಿ ಒಪ್ಪಿಗೆ ಮತ್ತು ಭಾಷೆ",
    consentSubtitle: "ವೈದ್ಯರನ್ನು ಭೇಟಿಯಾಗುವ ಮೊದಲು ನಿಮ್ಮ ಆರೋಗ್ಯ ಮಾಹಿತಿಯನ್ನು ಸಿದ್ಧಪಡಿಸಲು PreConsult ಸಹಾಯ ಮಾಡುತ್ತದೆ.",
    consentPoint1: "ನಿಮ್ಮ ಉತ್ತರಗಳನ್ನು AI ಸಾರಾಂಶಗೊಳಿಸಿ ವೈದ್ಯರಿಗೆ ಒದಗಿಸುತ್ತದೆ.",
    consentPoint2: "ನೀವು ನಿಮ್ಮ ಮಾತೃಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡುವ ಮೂಲಕ ಅಥವಾ ಸ್ಪರ್ಶಿಸುವ ಮೂಲಕ ಉತ್ತರಿಸಬಹುದು.",
    consentPoint3: "ನಿಮ್ಮ ವೈದ್ಯರು ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಅಂತಿಮ ಚಿಕಿತ್ಸೆಯನ್ನು ನಿರ್ಧರಿಸುತ್ತಾರೆ.",
    iAgreeAndProceed: "ನಾನು ಒಪ್ಪುತ್ತೇನೆ & ಪ್ರಾರಂಭಿಸಿ",

    emailHeaderSubtitle: "ಅಧಿಕೃತ ಡಿಜಿಟಲ್ ಔಷಧಿ ಚೀಟಿ & ಸಾರಾಂಶ",
    emailPatientName: "ರೋಗಿಯ ಹೆಸರು",
    emailConsultedOn: "ಸಮಾಲೋಚನೆ ದಿನಾಂಕ",
    emailAttendingPhysician: "ವೈದ್ಯರು",
    emailConfirmedDiagnosis: "ದೃಢೀಕರಿಸಿದ ರೋಗನಿರ್ಣಯ",
    emailPrescriptionsTitle: "ಸೂಚಿಸಲಾದ ಔಷಧಿಗಳು (Rx)",
    emailMedicine: "ಔಷಧಿ ಹೆಸರು",
    emailFrequency: "ಪ್ರಮಾಣ & ಸಮಯ",
    emailDuration: "ಅವಧಿ",
    emailInstructions: "ಸೂಚನೆಗಳು",
    emailDoctorAdvice: "ವೈದ್ಯರ ಸಲಹೆಗಳು & ಮಾರ್ಗದರ್ಶನ",
    emailFollowUp: "ಶಿಫಾರಸು ಮಾಡಿದ ಮುಂದಿನ ಭೇಟಿ",
    emailCtaButton: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ ಮತ್ತು ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಕೇಳಿ",
    emailCtaHelper: "ನಿಮ್ಮ ಮಾತೃಭಾಷೆಯಲ್ಲಿ ಔಷಧಿ ಸಮಯವನ್ನು ಕೇಳಲು ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ.",
    emailFooterNote: "ಈ ಡಿಜಿಟಲ್ ಔಷಧಿ ಚೀಟಿಯನ್ನು PreConsult ವೇದಿಕೆಯ ಮೂಲಕ ನೀಡಲಾಗಿದೆ. ABDM ಮಾರ್ಗಸೂಚಿಗಳಿಗೆ ಅನುಗುಣವಾಗಿದೆ.",
  },
};

export function getPatientTranslations(lang?: string | null): TranslationDictionary {
  const code = (lang || "en").toLowerCase().trim() as SupportedLanguage;
  return PATIENT_TRANSLATIONS[code] || PATIENT_TRANSLATIONS.en;
}