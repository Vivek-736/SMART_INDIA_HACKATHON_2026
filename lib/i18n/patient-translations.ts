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
  
  // Dashboard & Statuses
  welcomeBack: string;
  uhid: string;
  tokenNumber: string;
  activeVisit: string;
  noActiveVisit: string;
  startNewIntake: string;
  resumeIntake: string;
  startNewVisit: string;
  visitTimeline: string;
  waitingForDoctor: string;
  inConsultation: string;
  intakeComplete: string;
  prescriptionReady: string;
  doctorPrescriptionAndAdvice: string;
  digitalPrescription: string;
  issuedBy: string;
  signedPrescription: string;
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
  patient: string;
  registeredFor: string;
  registeredOn: string;
  token: string;
  clinicalIntakePending: string;
  completeIntakeDesc: string;
  continueIntake: string;
  intakeVerified: string;
  intakeVerifiedDesc: string;
  pastClinicalHistories: string;
  recordsFound: string;
  consultationRecord: string;
  noDetailedSummary: string;
  noPastHistories: string;
  files: string;
  digitizedRecordsDesc: string;
  noDocumentsUploaded: string;
  uploadViewDocuments: string;
  preconsultNoticeTitle: string;
  preconsultNoticeDesc: string;

  statusWaiting: string;
  statusIntakeInProgress: string;
  statusReadyForDoctor: string;
  statusInConsultation: string;
  statusCompleted: string;
  
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
  chooseFiles: string;
  uploadAnother: string;
  preparingUploader: string;
  tapToSelect: string;
  tapToAddMore: string;
  allowedFilesHint: string;
  doctorRx: string;
  doctorRxDesc: string;
  labTests: string;
  labTestsDesc: string;
  dischargeSummary: string;
  dischargeSummaryDesc: string;
  scansXrays: string;
  scansXraysDesc: string;

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
  somethingLooksWrong: string;
  looksCorrectProceed: string;
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
    startNewVisit: "Start New Visit",
    visitTimeline: "Consultation Journey",
    waitingForDoctor: "Waiting in OPD Queue",
    inConsultation: "In Consultation with Doctor",
    intakeComplete: "Pre-Consultation Intake Completed",
    prescriptionReady: "Prescription & Advice Ready",
    doctorPrescriptionAndAdvice: "Doctor's Prescription & Advice",
    digitalPrescription: "Digital Prescription & Treatment Plan",
    issuedBy: "Authorized by",
    signedPrescription: "Signed Prescription",
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
    patient: "Patient",
    registeredFor: "Registered for",
    registeredOn: "Registered on",
    token: "Token",
    clinicalIntakePending: "Clinical Intake Incomplete",
    completeIntakeDesc: "Complete your guided pre-consultation intake before meeting the doctor.",
    continueIntake: "Continue Intake",
    intakeVerified: "Intake Verified & Queue Registered",
    intakeVerifiedDesc: "Your structured clinical history is ready for the attending doctor.",
    pastClinicalHistories: "Past Clinical Consultations",
    recordsFound: "Records Found",
    consultationRecord: "Consultation Record",
    noDetailedSummary: "No detailed summary recorded for this visit.",
    noPastHistories: "No past consultation histories recorded yet.",
    files: "Files",
    digitizedRecordsDesc: "Digitized reports and documents for your physician's clinical timeline.",
    noDocumentsUploaded: "No medical documents uploaded yet.",
    uploadViewDocuments: "Upload & View Documents",
    preconsultNoticeTitle: "Clinical Documentation Assistance",
    preconsultNoticeDesc: "PreConsult digitizes your symptoms and medical records. Final diagnosis, prescription, and treatment are determined by your attending doctor.",

    statusWaiting: "Waiting in Queue",
    statusIntakeInProgress: "Intake In Progress",
    statusReadyForDoctor: "Ready for Doctor",
    statusInConsultation: "In Consultation",
    statusCompleted: "Consultation Completed",

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
    skipForNow: "I have no more records / Skip this step",
    chooseFiles: "Choose 1 to 4 Files",
    uploadAnother: "+ Upload Another Document",
    preparingUploader: "Preparing Uploader...",
    tapToSelect: "Tap to select 1 to 4 photos / PDFs or drag & drop here",
    tapToAddMore: "Tap to add another file (or select multiple files together)",
    allowedFilesHint: "Supports multiple files · Images up to 16MB · PDFs up to 32MB",
    doctorRx: "Doctor Rx",
    doctorRxDesc: "Past prescriptions",
    labTests: "Lab Tests",
    labTestsDesc: "Blood, urine, panels",
    dischargeSummary: "Discharge Summary",
    dischargeSummaryDesc: "Hospital records",
    scansXrays: "Scans & X-Rays",
    scansXraysDesc: "Photos or PDFs",

    reviewTitle: "Review Your Clinical History",
    reviewSubtitle: "Please read through the summary below. If everything looks correct, confirm to proceed.",
    chiefComplaint: "Chief Complaint",
    symptomsDetails: "Symptoms & History of Present Illness",
    pastHistory: "Past Medical History",
    currentMedications: "Current Medications & Allergies",
    ayurvedicProfile: "Ayurvedic Health Profile",
    confirmAndSubmit: "Confirm & Submit to Doctor",
    editAnswers: "Edit Answers",
    somethingLooksWrong: "Something looks wrong",
    looksCorrectProceed: "Looks Correct — Proceed",
    patientConfirmationNote: "By confirming, you acknowledge that the above information represents your reported history.",

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
    startNewVisit: "नया परामर्श शुरू करें",
    visitTimeline: "परामर्श प्रक्रिया",
    waitingForDoctor: "ओपीडी कतार में प्रतीक्षा कर रहे हैं",
    inConsultation: "डॉक्टर के साथ परामर्श जारी है",
    intakeComplete: "स्वास्थ्य विवरण सफलतापूर्वक दर्ज",
    prescriptionReady: "दवा पर्ची और सलाह तैयार है",
    doctorPrescriptionAndAdvice: "डॉक्टर की दवा पर्ची और सलाह",
    digitalPrescription: "डिजिटल दवा पर्ची एवं उपचार योजना",
    issuedBy: "प्रमाणित द्वारा",
    signedPrescription: "हस्ताक्षरित दवा पर्ची",
    signedBy: "हस्ताक्षरित द्वारा",
    confirmedDiagnosis: "पुष्ट निदान (बीमारी)",
    prescribedMedications: "निर्धारित दवाइयां (Rx)",
    doctorAdviceNotes: "डॉक्टर की सलाह और जीवनशैली निर्देश",
    followUpVisit: "अगली परामर्श तिथि",
    listenInNativeLanguage: "अपनी भाषा में सुनें",
    medicalRecords: "चिकित्सा रिकॉर्ड और रिपोर्ट",
    uploadNewRecord: "रिपोर्ट / पर्ची अपलोड करें",
    noRecordsYet: "अभी तक कोई दस्तावेज अपलोड नहीं किया गया।",
    pastConsultations: "पुराने परामर्श",
    patient: "मरीज़",
    registeredFor: "पंजीकृत विभाग:",
    registeredOn: "पंजीकरण तिथि:",
    token: "टोकन",
    clinicalIntakePending: "स्वास्थ्य जानकारी अधूरी है",
    completeIntakeDesc: "डॉक्टर से मिलने से पहले कृपया अपनी स्वास्थ्य जानकारी पूरी करें।",
    continueIntake: "जानकारी जारी रखें",
    intakeVerified: "जानकारी सत्यापित एवं टोकन तैयार",
    intakeVerifiedDesc: "आपका स्वास्थ्य विवरण डॉक्टर के पास भेज दिया गया है।",
    pastClinicalHistories: "पूर्व परामर्श विवरण",
    recordsFound: "रिकॉर्ड उपलब्ध",
    consultationRecord: "परामर्श रिकॉर्ड",
    noDetailedSummary: "इस विज़िट का कोई विस्तृत विवरण उपलब्ध नहीं है।",
    noPastHistories: "कोई पूर्व परामर्श रिकॉर्ड नहीं मिला।",
    files: "फाइलें",
    digitizedRecordsDesc: "डॉक्टर की सुविधा के लिए डिजिटाइज़ किए गए दस्तावेज।",
    noDocumentsUploaded: "कोई दस्तावेज अपलोड नहीं है।",
    uploadViewDocuments: "दस्तावेज अपलोड और देखें",
    preconsultNoticeTitle: "चिकित्सीय प्रलेखन सहायता",
    preconsultNoticeDesc: "PreConsult आपके लक्षणों को व्यवस्थित करता है। अंतिम निदान और उपचार डॉक्टर द्वारा तय किया जाता है।",

    statusWaiting: "कतार में प्रतीक्षा",
    statusIntakeInProgress: "जानकारी दर्ज हो रही है",
    statusReadyForDoctor: "डॉक्टर के लिए तैयार",
    statusInConsultation: "परामर्श जारी है",
    statusCompleted: "परामर्श पूर्ण हुआ",

    uploadTitle: "दस्तावेज़ और पुरानी पर्चियां अपलोड करें",
    uploadSubtitle: "डॉक्टर के परामर्श के लिए अपनी पिछली पर्चियां, लैब रिपोर्ट या डिस्चार्ज समरी अपलोड करें।",
    dropzoneTitle: "फाइलें चुनने के लिए टैप करें या यहां खींचें",
    dropzoneSubtitle: "PDF, JPG, PNG फाइलें (16MB तक) समर्थित हैं",
    uploadingText: "दस्तावेज अपलोड और AI OCR द्वारा जांच जारी है...",
    supportedFormats: "दवा पर्ची, खून की जांच, एक्स-रे, डिस्चार्ज समरी",
    uploadedDocuments: "अपलोड किए गए दस्तावेज़",
    extractingAiInfo: "AI द्वारा जानकारी निकाली जा रही है...",
    extractionComplete: "OCR जांच पूर्ण हुई",
    proceedToReview: "विवरण की समीक्षा करें",
    skipForNow: "मेरे पास कोई दस्तावेज नहीं है / आगे बढ़ें",
    chooseFiles: "1 से 4 फाइलें चुनें",
    uploadAnother: "+ एक और दस्तावेज़ अपलोड करें",
    preparingUploader: "अपलोडर तैयार हो रहा है...",
    tapToSelect: "1 से 4 फोटो / PDF चुनने के लिए टैप करें",
    tapToAddMore: "एक और फाइल जोड़ने के लिए टैप करें",
    allowedFilesHint: "तस्वीरें 16MB तक · PDF 32MB तक समर्थित हैं",
    doctorRx: "डॉक्टर पर्ची",
    doctorRxDesc: "पुरानी दवा पर्चियां",
    labTests: "लैब टेस्ट",
    labTestsDesc: "खून, पेशाब रिपोर्ट",
    dischargeSummary: "डिस्चार्ज समरी",
    dischargeSummaryDesc: "अस्पताल भर्ती रिकॉर्ड",
    scansXrays: "स्कैन / एक्स-रे",
    scansXraysDesc: "फोटो या PDF",

    reviewTitle: "अपनी स्वास्थ्य जानकारी की समीक्षा करें",
    reviewSubtitle: "कृपया नीचे दी गई जानकारी पढ़ें। यदि सब सही है, तो पुष्टि करें।",
    chiefComplaint: "मुख्य समस्या",
    symptomsDetails: "लक्षणों का विवरण और इतिहास",
    pastHistory: "पिछली बीमारियां व इतिहास",
    currentMedications: "वर्तमान दवाइयां और एलर्जी",
    ayurvedicProfile: "आयुर्वेदिक स्वास्थ्य विवरण",
    confirmAndSubmit: "पुष्टि करें और डॉक्टर को भेजें",
    editAnswers: "उत्तर बदलें",
    somethingLooksWrong: "कुछ गलत लग रहा है",
    looksCorrectProceed: "सब सही है — आगे बढ़ें",
    patientConfirmationNote: "पुष्टि करके, आप स्वीकार करते हैं कि ऊपर दी गई जानकारी आपके द्वारा बताई गई सही जानकारी है।",

    intakeSubmittedTitle: "स्वास्थ्य विवरण सफलतापूर्वक जमा हुआ!",
    intakeSubmittedSubtitle: "आपकी जानकारी डॉक्टर की स्क्रीन पर भेज दी गई है।",
    yourTokenIs: "आपका ओपीडी टोकन नंबर",
    estimatedWait: "अनुमानित प्रतीक्षा समय: 5 - 10 मिनट",
    waitingInstructions: "कृपया ओपीडी लाउंज में प्रतीक्षा करें जब तक आपका टोकन नंबर न बुलाया जाए।",
    viewDashboard: "डैशबोर्ड पर जाएं",

    consentTitle: "सहमति और भाषा चयन",
    consentSubtitle: "PreConsult डॉक्टर से मिलने से पहले आपकी स्वास्थ्य जानकारी तैयार करने में मदद करता है।",
    consentPoint1: "आपकी जानकारी और दस्तावेज AI द्वारा डॉक्टर के लिए संक्षेप में तैयार किए जाएंगे।",
    consentPoint2: "आप अपनी भाषा में बोलकर या चुनकर उत्तर दे सकते हैं।",
    consentPoint3: "अंतिम जांच, निदान और उपचार केवल आपके डॉक्टर द्वारा किया जाएगा।",
    iAgreeAndProceed: "मैं सहमत हूँ और शुरू करें",

    emailHeaderSubtitle: "आधिकारिक डिजिटल दवा पर्ची एवं परामर्श सारांश",
    emailPatientName: "मरीज़ का नाम",
    emailConsultedOn: "परामर्श तिथि",
    emailAttendingPhysician: "उपचारक चिकित्सक",
    emailConfirmedDiagnosis: "पुष्ट चिकित्सीय निदान",
    emailPrescriptionsTitle: "निर्धारित दवाइयां (Rx)",
    emailMedicine: "दवा का नाम",
    emailFrequency: "खुराक / समय",
    emailDuration: "अवधि",
    emailInstructions: "सेवन निर्देश",
    emailDoctorAdvice: "डॉक्टर की सलाह एवं जीवनशैली निर्देश",
    emailFollowUp: "अगली अनुवर्ती परामर्श तिथि",
    emailCtaButton: "मरीज़ डैशबोर्ड खोलें और अपनी भाषा में सुनें",
    emailCtaHelper: "अपनी पसंदीदा भाषा में दवा के निर्देश सुनने के लिए ऊपर क्लिक करें।",
    emailFooterNote: "यह डिजिटल दवा पर्ची PreConsult क्लिनिकल इंटेक प्लेटफॉर्म द्वारा प्रमाणित है।",
  },

  te: {
    preconsult: "PreConsult",
    patientPortal: "రోగి పోర్టల్",
    myHealthDashboard: "నా ఆరోగ్య సమాచార బోర్డు",
    language: "భాష",
    back: "వెనుకకు",
    continue: "కొనసాగించండి",
    submit: "సమర్పించండి",
    cancel: "రద్దు చేయండి",
    loading: "లోడ్ అవుతోంది...",
    downloadFhir: "ABDM / FHIR రికార్డ్ డౌన్‌లోడ్ చేయండి",
    
    welcomeBack: "స్వాగతం",
    uhid: "UHID సంఖ్య",
    tokenNumber: "టోకెన్ సంఖ్య",
    activeVisit: "ప్రస్తుత వైద్య సంప్రదింపు",
    noActiveVisit: "ఈరోజు ఎలాంటి వైద్య సంప్రదింపులు లేవు",
    startNewIntake: "ఆరోగ్య వివరాలు నమోదు చేయండి",
    resumeIntake: "వివరాల నమోదు కొనసాగించండి",
    startNewVisit: "కొత్త విజిట్ ప్రారంభించండి",
    visitTimeline: "సంప్రదింపు ప్రయాణం",
    waitingForDoctor: "OPD క్యూలో వేచి ఉన్నారు",
    inConsultation: "డాక్టర్‌తో సంప్రదింపులు జరుగుతున్నాయి",
    intakeComplete: "ఆరోగ్య వివరాల నమోదు పూర్తయింది",
    prescriptionReady: "మందుల చీటి మరియు సలహా సిద్ధంగా ఉన్నాయి",
    doctorPrescriptionAndAdvice: "డాక్టర్ ప్రిస్క్రిప్షన్ & సలహా",
    digitalPrescription: "డిజిటల్ ప్రిస్క్రిప్షన్ & చికిత్స ప్రణాళిక",
    issuedBy: "ధృవీకరించిన డాక్టర్",
    signedPrescription: "సంతకం చేసిన మందుల చీటి",
    signedBy: "సంతకం చేసిన వారు",
    confirmedDiagnosis: "నిర్ధారించిన వ్యాధి నిర్ధారణ",
    prescribedMedications: "సూచించిన మందులు (Rx)",
    doctorAdviceNotes: "డాక్టర్ సలహాలు మరియు సూచనలు",
    followUpVisit: "తదుపరి సంప్రదింపు తేదీ",
    listenInNativeLanguage: "మీ భాషలో వినండి",
    medicalRecords: "వైద్య రికార్డులు మరియు రిపోర్టులు",
    uploadNewRecord: "రిపోర్టులు అప్‌లోడ్ చేయండి",
    noRecordsYet: "ఇంకా ఎలాంటి పత్రాలు అప్‌లోడ్ చేయలేదు.",
    pastConsultations: "గత సంప్రదింపులు",
    patient: "రోగి",
    registeredFor: "నమోదైన విభాగం:",
    registeredOn: "నమోదైన తేదీ:",
    token: "టోకెన్",
    clinicalIntakePending: "ఆరోగ్య సమాచారం అసంపూర్ణంగా ఉంది",
    completeIntakeDesc: "డాక్టర్‌ను కలిసే ముందు మీ ఆరోగ్య సమాచారాన్ని పూర్తి చేయండి.",
    continueIntake: "నమోదును కొనసాగించండి",
    intakeVerified: "సమాచారం ధృవీకరించబడింది",
    intakeVerifiedDesc: "మీ వివరాలు డాక్టర్‌కు పంపబడ్డాయి.",
    pastClinicalHistories: "గత వైద్య చరిత్ర",
    recordsFound: "రికార్డులు అందుబాటులో ఉన్నాయి",
    consultationRecord: "సంప్రదింపు రికార్డ్",
    noDetailedSummary: "ఈ విజిట్ వివరాలు నమోదు కాలేదు.",
    noPastHistories: "గత సంప్రదింపు రికార్డులు లేవు.",
    files: "ఫైళ్ళు",
    digitizedRecordsDesc: "డాక్టర్ కోసం డిజిటైజ్ చేయబడిన పత్రాలు.",
    noDocumentsUploaded: "పత్రాలు అప్‌లోడ్ కాలేదు.",
    uploadViewDocuments: "పత్రాలు అప్‌లోడ్ చేసి చూడండి",
    preconsultNoticeTitle: "క్లినికల్ డాక్యుమెంటేషన్ సహాయం",
    preconsultNoticeDesc: "PreConsult మీ లక్షణాలను సిద్ధం చేస్తుంది. తుది చికిత్స డాక్టర్ నిర్ణయిస్తారు.",

    statusWaiting: "క్యూలో వేచి ఉన్నారు",
    statusIntakeInProgress: "నమోదు జరుగుతోంది",
    statusReadyForDoctor: "డాక్టర్ కోసం సిద్ధంగా ఉన్నారు",
    statusInConsultation: "సంప్రదింపు జరుగుతోంది",
    statusCompleted: "సంప్రదింపు పూర్తయింది",

    uploadTitle: "పాత వైద్య పత్రాలు అప్‌లోడ్ చేయండి",
    uploadSubtitle: "డాక్టర్ పరిశీలన కోసం పాత ప్రిస్క్రిప్షన్లు, ల్యాబ్ రిపోర్టులు లేదా డిశ్చార్జ్ సారాంశాన్ని అప్‌లోడ్ చేయండి.",
    dropzoneTitle: "ఫైల్‌లను ఎంచుకోవడానికి నొక్కండి లేదా ఇక్కడ వేయండి",
    dropzoneSubtitle: "PDF, JPG, PNG ఫైల్స్ (16MB వరకు) అనుమతించబడతాయి",
    uploadingText: "AI OCR ద్వారా పత్రాలను విశ్లేషిస్తున్నారు...",
    supportedFormats: "ప్రిస్క్రిప్షన్, రక్త పరీక్షలు, ఎక్స్-రే, డిశ్చార్జ్ సారాంశం",
    uploadedDocuments: "అప్‌లోడ్ చేసిన పత్రాలు",
    extractingAiInfo: "AI సమాచారాన్ని సేకరిస్తోంది...",
    extractionComplete: "OCR విశ్లేషణ పూర్తయింది",
    proceedToReview: "సమీక్షకు వెళ్లండి",
    skipForNow: "నా దగ్గర పత్రాలు లేవు / ముందుకు వెళ్ళండి",
    chooseFiles: "1 నుండి 4 ఫైళ్లను ఎంచుకోండి",
    uploadAnother: "+ మరొక పత్రాన్ని అప్‌లోడ్ చేయండి",
    preparingUploader: "అప్‌లోడర్ సిద్ధమవుతోంది...",
    tapToSelect: "1 నుండి 4 ఫోటోలు / PDFలు ఎంచుకోవడానికి నొక్కండి",
    tapToAddMore: "మరొక ఫైల్ జోడించడానికి నొక్కండి",
    allowedFilesHint: "ఫోటోలు 16MB వరకు · PDFలు 32MB వరకు",
    doctorRx: "డాక్టర్ ప్రిస్క్రిప్షన్",
    doctorRxDesc: "గత మందుల చీటీలు",
    labTests: "ల్యాబ్ పరీక్షలు",
    labTestsDesc: "రక్తం, మూత్రం రిపోర్టులు",
    dischargeSummary: "డిశ్చార్జ్ సారాంశం",
    dischargeSummaryDesc: "ఆసుపత్రి రికార్డులు",
    scansXrays: "స్కాన్లు & ఎక్స్-రేలు",
    scansXraysDesc: "ఫోటోలు లేదా PDFలు",

    reviewTitle: "మీ ఆరోగ్య సమాచారాన్ని సమీక్షించండి",
    reviewSubtitle: "దయచేసి క్రింది సారాంశాన్ని చదవండి. అన్నీ సరైనవైతే, ముందుకు సాగడానికి ధృవీకరించండి.",
    chiefComplaint: "ప్రధాన సమస్య",
    symptomsDetails: "లక్షణాల వివరాలు & చరిత్ర",
    pastHistory: "గత వైద్య చరిత్ర",
    currentMedications: "ప్రస్తుత మందులు & అలర్జీలు",
    ayurvedicProfile: "ఆయుర్వేద ఆరోగ్య ప్రొఫైల్",
    confirmAndSubmit: "ధృవీకరించి డాక్టర్‌కు పంపండి",
    editAnswers: "సమాధానాలను మార్చండి",
    somethingLooksWrong: "ఏదైనా తప్పుగా ఉందా?",
    looksCorrectProceed: "అంతా సరిగ్గా ఉంది — కొనసాగించండి",
    patientConfirmationNote: "ధృవీకరించడం ద్వారా, పై సమాచారం మీ ద్వారా ఇవ్వబడిన సరైన సమాచారమని మీరు అంగీకరిస్తున్నారు.",

    intakeSubmittedTitle: "ఆరోగ్య సమాచారం విజయవంతంగా సమర్పించబడింది!",
    intakeSubmittedSubtitle: "మీ వివరాలు నేరుగా హాజరయ్యే డాక్టర్ స్క్రీన్‌కు పంపబడ్డాయి.",
    yourTokenIs: "మీ OPD టోకెన్ సంఖ్య",
    estimatedWait: "అంచనా వేచి ఉండే సమయం: 5 - 10 నిమిషాలు",
    waitingInstructions: "దయచేసి మీ టోకెన్ నంబర్ పిలిచే వరకు OPD లాంజ్‌లో వేచి ఉండండి.",
    viewDashboard: "డ్యాష్‌బోర్డ్‌కు వెళ్లండి",

    consentTitle: "రోగి సమ్మతి & భాష ఎంపిక",
    consentSubtitle: "డాక్టర్‌ను కలిసే ముందు మీ ఆరోగ్య సమాచారాన్ని సిద్ధం చేసుకోవడానికి PreConsult సహాయపడుతుంది.",
    consentPoint1: "మీ సమాధానాలు మరియు పత్రాలు AI సహాయంతో డాక్టర్ కోసం క్రోడీకరించబడతాయి.",
    consentPoint2: "మీరు మీ మాతృభాషలో మాట్లాడి లేదా ఎంచుకుని సమాధానం ఇవ్వవచ్చు.",
    consentPoint3: "తుది పరీక్ష, నిర్ధారణ మరియు చికిత్స మీ డాక్టర్ ద్వారా మాత్రమే నిర్ణయించబడుతుంది.",
    iAgreeAndProceed: "నేను అంగీకరిస్తున్నాను & ప్రారంభించండి",

    emailHeaderSubtitle: "అధికారిక డిజిటల్ ప్రిస్క్రిప్షన్ & సంప్రదింపు సారాంశం",
    emailPatientName: "రోగి పేరు",
    emailConsultedOn: "సంప్రదించిన తేదీ",
    emailAttendingPhysician: "హాజరైన డాక్టర్",
    emailConfirmedDiagnosis: "నిర్ధారించిన వ్యాధి నిర్ధారణ",
    emailPrescriptionsTitle: "సూచించిన మందులు (Rx)",
    emailMedicine: "మందు పేరు",
    emailFrequency: "మోతాదు / సమయం",
    emailDuration: "వ్యవధి",
    emailInstructions: "సూచనలు",
    emailDoctorAdvice: "డాక్టర్ సలహా & జీవనశైలి సూచనలు",
    emailFollowUp: "తదుపరి సంప్రదింపు తేదీ",
    emailCtaButton: "రోగి డ్యాష్‌బోర్డ్ తెరచి మీ భాషలో వినండి",
    emailCtaHelper: "మీ ప్రిస్క్రిప్షన్ ఆడియోను వినడానికి పైన క్లిక్ చేయండి.",
    emailFooterNote: "ఈ డిజిటల్ ప్రిస్క్రిప్షన్ PreConsult క్లినికల్ ఇన్‌టేక్ ప్లాట్‌ఫారమ్ ద్వారా జారీ చేయబడింది.",
  },

  ta: {
    preconsult: "PreConsult",
    patientPortal: "நோயாளி போர்டல்",
    myHealthDashboard: "எனது சுகாதார தகவல் பலகை",
    language: "மொழி",
    back: "பின்செல்க",
    continue: "தொடரவும்",
    submit: "சமர்ப்பிக்கவும்",
    cancel: "ரத்துசெய்",
    loading: "ஏற்றுகிறது...",
    downloadFhir: "ABDM / FHIR பதிவிறக்கவும்",
    
    welcomeBack: "வணக்கம்",
    uhid: "UHID எண்",
    tokenNumber: "டோக்கன் எண்",
    activeVisit: "தற்போதைய மருத்துவ சந்திப்பு",
    noActiveVisit: "இன்று செயலில் உள்ள சந்திப்பு எதுவும் இல்லை",
    startNewIntake: "சுகாதார விவரங்களை பதிவு செய்க",
    resumeIntake: "விவரங்களை தொடரவும்",
    startNewVisit: "புதிய சந்திப்பைத் தொடங்குங்கள்",
    visitTimeline: "சந்திப்பு பயணம்",
    waitingForDoctor: "OPD வரிசையில் காத்திருக்கிறீர்கள்",
    inConsultation: "மருத்துவருடன் ஆலோசனை நடக்கிறது",
    intakeComplete: "விவரங்கள் பதிவு செய்யப்பட்டது",
    prescriptionReady: "மருந்து சீட்டு தயார்",
    doctorPrescriptionAndAdvice: "மருத்துவரின் மருந்து சீட்டு மற்றும் அறிவுரை",
    digitalPrescription: "டிஜிட்டல் மருந்து சீட்டு & சிகிச்சை திட்டம்",
    issuedBy: "வழங்கிய மருத்துவர்",
    signedPrescription: "கையொப்பமிட்ட மருந்து சீட்டு",
    signedBy: "கையொப்பமிட்டவர்",
    confirmedDiagnosis: "உறுதிப்படுத்தப்பட்ட நோயறிதல்",
    prescribedMedications: "பரிந்துரைக்கப்பட்ட மருந்துகள் (Rx)",
    doctorAdviceNotes: "மருத்துவரின் ஆலோசனை மற்றும் குறிப்புகள்",
    followUpVisit: "அடுத்த சந்திப்பு தேதி",
    listenInNativeLanguage: "உங்கள் தாய்மொழியில் கேட்கவும்",
    medicalRecords: "மருத்துவ ஆவணங்கள் & அறிக்கைகள்",
    uploadNewRecord: "அறிக்கைகளை பதிவேற்றவும்",
    noRecordsYet: "இதுவரை எந்த ஆவணங்களும் பதிவேற்றப்படவில்லை.",
    pastConsultations: "முந்தைய சந்திப்புகள்",
    patient: "நோயாளி",
    registeredFor: "பதிவு செய்யப்பட்ட பிரிவு:",
    registeredOn: "பதிவு செய்யப்பட்ட தேதி:",
    token: "டோக்கன்",
    clinicalIntakePending: "சுகாதார தகவல் முழுமையடையவில்லை",
    completeIntakeDesc: "மருத்துவரை சந்திப்பதற்கு முன் உங்கள் தகவல்களை பூர்த்தி செய்யவும்.",
    continueIntake: "பதிவை தொடரவும்",
    intakeVerified: "தகவல்கள் சரிபார்க்கப்பட்டது",
    intakeVerifiedDesc: "உங்கள் விவரங்கள் மருத்துவருக்கு அனுப்பப்பட்டுள்ளது.",
    pastClinicalHistories: "முந்தைய மருத்துவ விவரங்கள்",
    recordsFound: "ஆவணங்கள் உள்ளன",
    consultationRecord: "மருத்துவ பதிவு",
    noDetailedSummary: "இந்த சந்திப்பின் விவரங்கள் இல்லை.",
    noPastHistories: "முந்தைய பதிவுகள் எதுவும் இல்லை.",
    files: "கோப்புகள்",
    digitizedRecordsDesc: "மருத்துவருக்காக டிஜிட்டல் செய்யப்பட்ட ஆவணங்கள்.",
    noDocumentsUploaded: "ஆவணங்கள் பதிவேற்றப்படவில்லை.",
    uploadViewDocuments: "ஆவணங்களை பதிவேற்றி பார்க்கவும்",
    preconsultNoticeTitle: "மருத்துவ ஆவண உதவி",
    preconsultNoticeDesc: "PreConsult உங்கள் விவரங்களை தொகுக்கிறது. இறுதி சிகிச்சை மருத்துவரால் தீர்மானிக்கப்படுகிறது.",

    statusWaiting: "வரிசையில் காத்திருக்கிறார்",
    statusIntakeInProgress: "பதிவு நடக்கிறது",
    statusReadyForDoctor: "மருத்துவருக்கு தயார்",
    statusInConsultation: "ஆலோசனை நடக்கிறது",
    statusCompleted: "ஆலோசனை முடிந்தது",

    uploadTitle: "மருத்துவ ஆவணங்களை பதிவேற்றவும்",
    uploadSubtitle: "மருத்துவரின் பார்வைக்கு முந்தைய மருந்து சீட்டுகள் அல்லது ஆய்வக அறிக்கைகளை பதிவேற்றவும்.",
    dropzoneTitle: "கோப்புகளைத் தேர்ந்தெடுக்க தட்டவும் அல்லது இழுத்துப் போடவும்",
    dropzoneSubtitle: "PDF, JPG, PNG கோப்புகள் (16MB வரை) ஆதரிக்கப்படும்",
    uploadingText: "AI OCR மூலம் ஆவணங்கள் ஆய்வு செய்யப்படுகிறது...",
    supportedFormats: "மருந்து சீட்டு, இரத்த பரிசோதனை, எக்ஸ்ரே",
    uploadedDocuments: "பதிவேற்றப்பட்ட ஆவணங்கள்",
    extractingAiInfo: "AI தகவல்களை பிரித்தெடுக்கிறது...",
    extractionComplete: "OCR ஆய்வு முடிந்தது",
    proceedToReview: "விவரங்களை மதிப்பாய்வு செய்யவும்",
    skipForNow: "என்னிடம் ஆவணங்கள் இல்லை / தவிர்",
    chooseFiles: "1 முதல் 4 கோப்புகளைத் தேர்ந்தெடுக்கவும்",
    uploadAnother: "+ மற்றொரு ஆவணத்தை பதிவேற்றவும்",
    preparingUploader: "பதிவேற்றி தயாராகிறது...",
    tapToSelect: "1 முதல் 4 கோப்புகளைத் தேர்ந்தெடுக்க தட்டவும்",
    tapToAddMore: "மற்றொரு கோப்பைச் சேர்க்க தட்டவும்",
    allowedFilesHint: "படங்கள் 16MB வரை · PDF 32MB வரை",
    doctorRx: "மருத்துவர் சீட்டு",
    doctorRxDesc: "முந்தைய மருந்து சீட்டுகள்",
    labTests: "ஆய்வக சோதனை",
    labTestsDesc: "இரத்தம், சிறுநீர் பரிசோதனை",
    dischargeSummary: "டிஸ்சார்ஜ் சுருக்கம்",
    dischargeSummaryDesc: "மருத்துவமனை ஆவணங்கள்",
    scansXrays: "ஸ்கேன் & எக்ஸ்ரே",
    scansXraysDesc: "புகைப்படங்கள் அல்லது PDF",

    reviewTitle: "உங்கள் மருத்துவ விவரங்களை மதிப்பாய்வு செய்யவும்",
    reviewSubtitle: "கீழே உள்ள சுருக்கத்தைப் படித்து, அனைத்தும் சரியாக இருந்தால் உறுதிப்படுத்தவும்.",
    chiefComplaint: "முக்கிய பிரச்சனை",
    symptomsDetails: "அறிகுறிகளின் விவரங்கள் & வரலாறு",
    pastHistory: "முந்தைய மருத்துவ வரலாறு",
    currentMedications: "தற்போதைய மருந்துகள் & ஒவ்வாமைகள்",
    ayurvedicProfile: "ஆயுர்வேத சுகாதார விவரம்",
    confirmAndSubmit: "உறுதிசெய்து மருத்துவருக்கு அனுப்பவும்",
    editAnswers: "பதில்களை மாற்றவும்",
    somethingLooksWrong: "ஏதேனும் தவறாக உள்ளதா?",
    looksCorrectProceed: "அனைத்தும் சரி — தொடரவும்",
    patientConfirmationNote: "உறுதிப்படுத்துவதன் மூலம், மேலே உள்ள தகவல் உங்களால் தெரிவிக்கப்பட்ட சரியான தகவல் என்பதை ஒப்புக்கொள்கிறீர்கள்.",

    intakeSubmittedTitle: "விவரங்கள் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!",
    intakeSubmittedSubtitle: "உங்கள் தகவல்கள் நேரடியாக மருத்துவரின் திரைக்கு அனுப்பப்பட்டுள்ளது.",
    yourTokenIs: "உங்கள் OPD டோக்கன் எண்",
    estimatedWait: "தோராயமாக காத்திருக்கும் நேரம்: 5 - 10 நிமிடங்கள்",
    waitingInstructions: "டோக்கன் எண் அழைக்கப்படும் வரை காத்திருக்கவும்.",
    viewDashboard: "முகப்பு பலகைக்கு செல்லவும்",

    consentTitle: "நோயாளி சம்மதம் & மொழித் தேர்வு",
    consentSubtitle: "மருத்துவரை சந்திப்பதற்கு முன் உங்கள் தகவல்களை தயார் செய்ய PreConsult உதவுகிறது.",
    consentPoint1: "உங்கள் பதில்கள் AI உதவியுடன் மருத்துவருக்கு தொகுத்து வழங்கப்படும்.",
    consentPoint2: "உங்கள் தாய்மொழியில் பேசி அல்லது தட்டி பதிலளிக்கலாம்.",
    consentPoint3: "இறுதி பரிசோதனை மற்றும் சிகிச்சை மருத்துவரால் மட்டுமே தீர்மானிக்கப்படும்.",
    iAgreeAndProceed: "நான் ஒப்புக்கொள்கிறேன் & தொடங்கவும்",

    emailHeaderSubtitle: "அதிகாரப்பூர்வ டிஜிட்டல் மருந்து சீட்டு & ஆலோசனை சுருக்கம்",
    emailPatientName: "நோயாளி பெயர்",
    emailConsultedOn: "சந்தித்த தேதி",
    emailAttendingPhysician: "பரிசோதித்த மருத்துவர்",
    emailConfirmedDiagnosis: "உறுதிப்படுத்தப்பட்ட நோயறிதல்",
    emailPrescriptionsTitle: "பரிந்துரைக்கப்பட்ட மருந்துகள் (Rx)",
    emailMedicine: "மருந்து",
    emailFrequency: "அளவு / நேரம்",
    emailDuration: "கால அளவு",
    emailInstructions: "அறிவுரைகள்",
    emailDoctorAdvice: "மருத்துவரின் ஆலோசனை & குறிப்புகள்",
    emailFollowUp: "அடுத்த சந்திப்பு தேதி",
    emailCtaButton: "நோயாளி போர்டல் திறந்து தாய்மொழியில் கேட்கவும்",
    emailCtaHelper: "மருந்து சீட்டை ஆடியோவாக கேட்க மேலே கிளிக் செய்யவும்.",
    emailFooterNote: "இந்த டிஜிட்டல் மருந்து சீட்டு PreConsult தளம் மூலம் வழங்கப்பட்டது.",
  },

  kn: {
    preconsult: "PreConsult",
    patientPortal: "ರೋಗಿ ಪೋರ್ಟಲ್",
    myHealthDashboard: "ನನ್ನ ಆರೋಗ್ಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    language: "ಭಾಷೆ",
    back: "ಹಿಂದಕ್ಕೆ",
    continue: "ಮುಂದುವರಿಸಿ",
    submit: "ಸಲ್ಲಿಸಿ",
    cancel: "ರದ್ದುಮಾಡಿ",
    loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    downloadFhir: "ABDM / FHIR ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ",
    
    welcomeBack: "ಸ್ವಾಗತ",
    uhid: "UHID ಸಂಖ್ಯೆ",
    tokenNumber: "ಟೋಕನ್ ಸಂಖ್ಯೆ",
    activeVisit: "ಪ್ರಸ್ತುತ ಸಮಾಲೋಚನೆ ಭೇಟಿ",
    noActiveVisit: "ಇಂದು ಯಾವುದೇ ಸಕ್ರಿಯ ಭೇಟಿ ಇಲ್ಲ",
    startNewIntake: "ಆರೋಗ್ಯ ವಿವರ ದಾಖಲಿಸಿ",
    resumeIntake: "ವಿವರ ದಾಖಲಿಸುವುದನ್ನು ಮುಂದುವರಿಸಿ",
    startNewVisit: "ಹೊಸ ಭೇಟಿಯನ್ನು ಪ್ರಾರಂಭಿಸಿ",
    visitTimeline: "ಸಮಾಲೋಚನೆ ಪ್ರಕ್ರಿಯೆ",
    waitingForDoctor: "OPD ಸರದಿಯಲ್ಲಿ ಕಾಯುತ್ತಿದ್ದೀರಿ",
    inConsultation: "ವೈದ್ಯರೊಂದಿಗೆ ಸಮಾಲೋಚನೆ ನಡೆಯುತ್ತಿದೆ",
    intakeComplete: "ವಿವರ ದಾಖಲಾತಿ ಪೂರ್ಣಗೊಂಡಿದೆ",
    prescriptionReady: "ಔಷಧಿ ಚೀಟಿ ಮತ್ತು ಸಲಹೆ ಸಿದ್ಧವಾಗಿದೆ",
    doctorPrescriptionAndAdvice: "ವೈದ್ಯರ ಔಷಧಿ ಚೀಟಿ ಮತ್ತು ಸಲಹೆ",
    digitalPrescription: "ಡಿಜಿಟಲ್ ಔಷಧಿ ಚೀಟಿ ಮತ್ತು ಚಿಕಿತ್ಸಾ ಯೋಜನೆ",
    issuedBy: "ದೃಢೀಕರಿಸಿದ ವೈದ್ಯರು",
    signedPrescription: "ಸಹಿ ಮಾಡಿದ ಔಷಧಿ ಚೀಟಿ",
    signedBy: "ಸಹಿ ಮಾಡಿದವರು",
    confirmedDiagnosis: "ದೃಢಪಡಿಸಿದ ರೋಗನಿರ್ಣಯ",
    prescribedMedications: "ಸೂಚಿಸಿದ ಔಷಧಿಗಳು (Rx)",
    doctorAdviceNotes: "ವೈದ್ಯರ ಸಲಹೆ ಮತ್ತು ಜೀವನಶೈಲಿ ಟಿಪ್ಪಣಿಗಳು",
    followUpVisit: "ಮುಂದಿನ ಭೇಟಿಯ ಶಿಫಾರಸು ದಿನಾಂಕ",
    listenInNativeLanguage: "ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಆಲಿಸಿ",
    medicalRecords: "ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳು ಮತ್ತು ವರದಿಗಳು",
    uploadNewRecord: "ವರದಿಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    noRecordsYet: "ಯಾವುದೇ ದಾಖಲೆಗಳನ್ನು ಇನ್ನೂ ಅಪ್‌ಲೋಡ್ ಮಾಡಿಲ್ಲ.",
    pastConsultations: "ಹಿಂದಿನ ಸಮಾಲೋಚನೆಗಳು",
    patient: "ರೋಗಿ",
    registeredFor: "ನೋಂದಾಯಿತ ವಿಭಾಗ:",
    registeredOn: "ನೋಂದಾಯಿತ ದಿನಾಂಕ:",
    token: "ಟೋಕನ್",
    clinicalIntakePending: "ಆರೋಗ್ಯ ಮಾಹಿತಿ ಅಪೂರ್ಣವಾಗಿದೆ",
    completeIntakeDesc: "ವೈದ್ಯರನ್ನು ಭೇಟಿ ಮಾಡುವ ಮೊದಲು ನಿಮ್ಮ ಆರೋಗ್ಯ ಮಾಹಿತಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ.",
    continueIntake: "ದಾಖಲಾತಿಯನ್ನು ಮುಂದುವರಿಸಿ",
    intakeVerified: "ಮಾಹಿತಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ",
    intakeVerifiedDesc: "ನಿಮ್ಮ ವಿವರಗಳನ್ನು ವೈದ್ಯರಿಗೆ ಕಳುಹಿಸಲಾಗಿದೆ.",
    pastClinicalHistories: "ಹಿಂದಿನ ವೈದ್ಯಕೀಯ ಇತಿಹಾಸ",
    recordsFound: "ದಾಖಲೆಗಳು ಲಭ್ಯವಿದೆ",
    consultationRecord: "ಸಮಾಲೋಚನೆ ದಾಖಲೆ",
    noDetailedSummary: "ಈ ಭೇಟಿಯ ವಿವರಗಳು ದಾಖಲಾಗಿಲ್ಲ.",
    noPastHistories: "ಹಿಂದಿನ ಸಮಾಲೋಚನೆಗಳ ದಾಖಲೆಗಳಿಲ್ಲ.",
    files: "ಫೈಲ್‌ಗಳು",
    digitizedRecordsDesc: "ವೈದ್ಯರಿಗಾಗಿ ಡಿಜಿಟೈಸ್ ಮಾಡಿದ ದಾಖಲೆಗಳು.",
    noDocumentsUploaded: "ದಾಖಲೆಗಳು ಅಪ್‌ಲೋಡ್ ಆಗಿಲ್ಲ.",
    uploadViewDocuments: "ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ನೋಡಿ",
    preconsultNoticeTitle: "ವೈದ್ಯಕೀಯ ದಾಖಲೀಕರಣ ಸಹಾಯ",
    preconsultNoticeDesc: "PreConsult ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳನ್ನು ಸಿದ್ಧಪಡಿಸುತ್ತದೆ. ಅಂತಿಮ ಚಿಕಿತ್ಸೆಯನ್ನು ವೈದ್ಯರು ನಿರ್ಧರಿಸುತ್ತಾರೆ.",

    statusWaiting: "ಸರದಿಯಲ್ಲಿ ಕಾಯುತ್ತಿದ್ದಾರೆ",
    statusIntakeInProgress: "ದಾಖಲಾತಿ ಪ್ರಗತಿಯಲ್ಲಿದೆ",
    statusReadyForDoctor: "ವೈದ್ಯರಿಗೆ ಸಿದ್ಧವಾಗಿದೆ",
    statusInConsultation: "ಸಮಾಲೋಚನೆ ನಡೆಯುತ್ತಿದೆ",
    statusCompleted: "ಸಮಾಲೋಚನೆ ಪೂರ್ಣಗೊಂಡಿದೆ",

    uploadTitle: "ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    uploadSubtitle: "ವೈದ್ಯರ ಪರಿಶೀಲನೆಗಾಗಿ ಹಿಂದಿನ ಔಷಧಿ ಚೀಟಿಗಳು, ಲ್ಯಾಬ್ ವರದಿಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
    dropzoneTitle: "ಫೈಲ್‌ಗಳನ್ನು ಆಯ್ಕೆ ಮಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ ಅಥವಾ ಎಳೆಯಿರಿ",
    dropzoneSubtitle: "PDF, JPG, PNG ಫೈಲ್‌ಗಳು (16MB ವರೆಗೆ) ಬೆಂಬಲಿತವಾಗಿದೆ",
    uploadingText: "AI OCR ಮೂಲಕ ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
    supportedFormats: "ಔಷಧಿ ಚೀಟಿ, ರಕ್ತ ಪರೀಕ್ಷೆಗಳು, ಎಕ್ಸ್-ರೇ",
    uploadedDocuments: "ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ದಾಖಲೆಗಳು",
    extractingAiInfo: "AI ಮಾಹಿತಿಯನ್ನು ಸಂಗ್ರಹಿಸುತ್ತಿದೆ...",
    extractionComplete: "OCR ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ",
    proceedToReview: "ಪರಿಶೀಲನೆಗೆ ಮುಂದುವರಿಯಿರಿ",
    skipForNow: "ನನ್ನ ಬಳಿ ದಾಖಲೆಗಳಿಲ್ಲ / ಮುಂದುವರಿಯಿರಿ",
    chooseFiles: "1 ರಿಂದ 4 ಫೈಲ್‌ಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    uploadAnother: "+ ಇನ್ನೊಂದು ದಾಖಲೆಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    preparingUploader: "ಅಪ್‌ಲೋಡರ್ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...",
    tapToSelect: "1 ರಿಂದ 4 ಫೋಟೋಗಳು / PDF ಗಳನ್ನು ಆಯ್ಕೆ ಮಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ",
    tapToAddMore: "ಇನ್ನೊಂದು ಫೈಲ್ ಸೇರಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ",
    allowedFilesHint: "ಚಿತ್ರಗಳು 16MB ವರೆಗೆ · PDF 32MB ವರೆಗೆ",
    doctorRx: "ವೈದ್ಯರ ಚೀಟಿ",
    doctorRxDesc: "ಹಿಂದಿನ ಔಷಧಿ ಚೀಟಿಗಳು",
    labTests: "ಲ್ಯಾಬ್ ಪರೀಕ್ಷೆಗಳು",
    labTestsDesc: "ರಕ್ತ, ಮೂತ್ರ ಪರೀಕ್ಷಾ ವರದಿಗಳು",
    dischargeSummary: "ಡಿಸ್ಚಾರ್ಜ್ ಸಾರಾಂಶ",
    dischargeSummaryDesc: "ಆಸ್ಪತ್ರೆ ದಾಖಲೆಗಳು",
    scansXrays: "ಸ್ಕ್ಯಾನ್ ಮತ್ತು ಎಕ್ಸ್-ರೇಗಳು",
    scansXraysDesc: "ಫೋಟೋಗಳು ಅಥವಾ PDFಗಳು",

    reviewTitle: "ನಿಮ್ಮ ಆರೋಗ್ಯ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ",
    reviewSubtitle: "ದಯವಿಟ್ಟು ಕೆಳಗಿನ ಸಾರಾಂಶವನ್ನು ಓದಿ. ಎಲ್ಲವೂ ಸರಿಯಾಗಿದ್ದರೆ, ದೃಢೀಕರಿಸಿ.",
    chiefComplaint: "ಮುಖ್ಯ ಸಮಸ್ಯೆ",
    symptomsDetails: "ರೋಗಲಕ್ಷಣಗಳ ವಿವರಗಳು ಮತ್ತು ಇತಿಹಾಸ",
    pastHistory: "ಹಿಂದಿನ ವೈದ್ಯಕೀಯ ಇತಿಹಾಸ",
    currentMedications: "ಪ್ರಸ್ತುತ ಔಷಧಿಗಳು ಮತ್ತು ಅಲರ್ಜಿಗಳು",
    ayurvedicProfile: "ಆಯುರ್ವೇದ ಆರೋಗ್ಯ ಪ್ರೊಫೈಲ್",
    confirmAndSubmit: "ದೃಢೀಕರಿಸಿ ಮತ್ತು ವೈದ್ಯರಿಗೆ ಸಲ್ಲಿಸಿ",
    editAnswers: "ಉತ್ತರಗಳನ್ನು ಬದಲಾಯಿಸಿ",
    somethingLooksWrong: "ಏನಾದರೂ ತಪ್ಪಾಗಿದೆಯೇ?",
    looksCorrectProceed: "ಎಲ್ಲವೂ ಸರಿಯಾಗಿದೆ — ಮುಂದುವರಿಯಿರಿ",
    patientConfirmationNote: "ದೃಢೀಕರಿಸುವ ಮೂಲಕ, ಮೇಲಿನ ಮಾಹಿತಿಯು ನಿಮ್ಮಿಂದ ನೀಡಲಾದ ಸರಿಯಾದ ಮಾಹಿತಿಯಾಗಿದೆ ಎಂದು ನೀವು ಒಪ್ಪಿಕೊಳ್ಳುತ್ತೀರಿ.",

    intakeSubmittedTitle: "ಆರೋಗ್ಯ ವಿವರಗಳು ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಕೆಯಾಗಿವೆ!",
    intakeSubmittedSubtitle: "ನಿಮ್ಮ ಮಾಹಿತಿಯನ್ನು ನೇರವಾಗಿ ಹಾಜರಾಗುವ ವೈದ್ಯರ ಪರದೆಗೆ ಕಳುಹಿಸಲಾಗಿದೆ.",
    yourTokenIs: "ನಿಮ್ಮ OPD ಟೋಕನ್ ಸಂಖ್ಯೆ",
    estimatedWait: "ಅಂದಾಜು ಕಾಯುವ ಸಮಯ: 5 - 10 ನಿಮಿಷಗಳು",
    waitingInstructions: "ನಿಮ್ಮ ಟೋಕನ್ ಸಂಖ್ಯೆಯನ್ನು ಕರೆಯುವವರೆಗೆ ದಯವಿಟ್ಟು ಕಾಯಿರಿ.",
    viewDashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹೋಗಿ",

    consentTitle: "ರೋಗಿಯ ಸಮ್ಮತಿ ಮತ್ತು ಭಾಷೆ ಆಯ್ಕೆ",
    consentSubtitle: "ವೈದ್ಯರನ್ನು ಭೇಟಿ ಮಾಡುವ ಮೊದಲು ನಿಮ್ಮ ಆರೋಗ್ಯ ಮಾಹಿತಿಯನ್ನು ಸಿದ್ಧಪಡಿಸಲು PreConsult ಸಹಾಯ ಮಾಡುತ್ತದೆ.",
    consentPoint1: "ನಿಮ್ಮ ಉತ್ತರಗಳು ಮತ್ತು ದಾಖಲೆಗಳನ್ನು AI ಸಹಾಯದಿಂದ ವೈದ್ಯರಿಗೆ ಸಾರಾಂಶ ಮಾಡಲಾಗುತ್ತದೆ.",
    consentPoint2: "ನಿಮ್ಮ ಮಾತೃಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡಿ ಅಥವಾ ಆಯ್ಕೆಮಾಡಿ ಉತ್ತರಿಸಬಹುದು.",
    consentPoint3: "ಅಂತಿಮ ತಪಾಸಣೆ ಮತ್ತು ಚಿಕಿತ್ಸೆಯನ್ನು ನಿಮ್ಮ ವೈದ್ಯರೇ ನಿರ್ಧರಿಸುತ್ತಾರೆ.",
    iAgreeAndProceed: "ನಾನು ಒಪ್ಪುತ್ತೇನೆ & ಪ್ರಾರಂಭಿಸಿ",

    emailHeaderSubtitle: "ಅಧಿಕೃತ ಡಿಜಿಟಲ್ ಔಷಧಿ ಚೀಟಿ ಮತ್ತು ಸಮಾಲೋಚನೆ ಸಾರಾಂಶ",
    emailPatientName: "ರೋಗಿಯ ಹೆಸರು",
    emailConsultedOn: "ಸಮಾಲೋಚಿಸಿದ ದಿನಾಂಕ",
    emailAttendingPhysician: "ಹಾಜರಾದ ವೈದ್ಯರು",
    emailConfirmedDiagnosis: "ದೃಢಪಡಿಸಿದ ರೋಗನಿರ್ಣಯ",
    emailPrescriptionsTitle: "ಸೂಚಿಸಿದ ಔಷಧಿಗಳು (Rx)",
    emailMedicine: "ಔಷಧ",
    emailFrequency: "ಪ್ರಮಾಣ / ಸಮಯ",
    emailDuration: "ಅವಧಿ",
    emailInstructions: "ಸೂಚನೆಗಳು",
    emailDoctorAdvice: "ವೈದ್ಯರ ಸಲಹೆ ಮತ್ತು ಜೀವನಶೈಲಿ ಟಿಪ್ಪಣಿಗಳು",
    emailFollowUp: "ಮುಂದಿನ ಭೇಟಿಯ ದಿನಾಂಕ",
    emailCtaButton: "ರೋಗಿಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆದು ಮಾತೃಭಾಷೆಯಲ್ಲಿ ಆಲಿಸಿ",
    emailCtaHelper: "ಔಷಧಿ ಸೂಚನೆಗಳನ್ನು ಆಡಿಯೊದಲ್ಲಿ ಕೇಳಲು ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ.",
    emailFooterNote: "ಈ ಡಿಜಿಟಲ್ ಔಷಧಿ ಚೀಟಿಯನ್ನು PreConsult ಕ್ಲಿನಿಕಲ್ ಇನ್‌ಟೇಕ್ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಮೂಲಕ ಅಧಿಕೃತಗೊಳಿಸಲಾಗಿದೆ.",
  },
};

export function getPatientTranslations(lang?: string | null): TranslationDictionary {
  const normalized = (lang || "en").toLowerCase() as SupportedLanguage;
  return PATIENT_TRANSLATIONS[normalized] || PATIENT_TRANSLATIONS.en;
}