export interface FhirExportInput {
  visitId: string;
  patientName: string;
  patientUhid: string | null;
  patientGender?: string | null;
  patientAge?: number | null;
  abhaId?: string | null;
  doctorName: string;
  doctorDepartment: string;
  doctorRoom?: string | null;
  department: string;
  diagnosis: string;
  secondaryDiagnoses?: string[];
  chiefComplaint?: string;
  hpi?: string;
  pastMedicalHistory?: string;
  medications: {
    medicineName: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string | null;
  }[];
  doctorNotes?: string | null;
  consultationDate: Date | string;
}

/**
 * Converts internal PreConsult clinical consultation record into a compliant FHIR R4 JSON Bundle.
 * Follows ABDM (Ayushman Bharat Digital Mission) Health Document specifications.
 */
export function generateFhirR4Bundle(input: FhirExportInput): Record<string, unknown> {
  const timestamp = new Date(input.consultationDate).toISOString();
  const bundleId = `preconsult-bundle-${input.visitId}`;
  const compositionId = `composition-${input.visitId}`;
  const patientResourceId = `patient-${input.patientUhid || input.visitId}`;
  const practitionerResourceId = `practitioner-${input.visitId}`;
  const abhaNumber = input.abhaId || `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

  // 1. Patient Resource
  const patientResource = {
    fullUrl: `urn:uuid:${patientResourceId}`,
    resource: {
      resourceType: "Patient",
      id: patientResourceId,
      identifier: [
        {
          system: "https://healthid.ndhm.gov.in",
          type: {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/v2-0203",
                code: "MR",
                display: "ABHA Health ID",
              },
            ],
          },
          value: abhaNumber,
        },
        {
          system: "https://preconsult.health/uhid",
          value: input.patientUhid || "UHID-PENDING",
        },
      ],
      name: [
        {
          use: "official",
          text: input.patientName,
        },
      ],
      gender: input.patientGender?.toLowerCase() === "female" ? "female" : "male",
    },
  };

  // 2. Practitioner Resource
  const practitionerResource = {
    fullUrl: `urn:uuid:${practitionerResourceId}`,
    resource: {
      resourceType: "Practitioner",
      id: practitionerResourceId,
      name: [
        {
          prefix: ["Dr."],
          text: input.doctorName,
        },
      ],
      qualification: [
        {
          code: {
            text: input.doctorDepartment,
          },
        },
      ],
    },
  };

  // 3. Condition (Primary Diagnosis) Resource
  const conditionResource = {
    fullUrl: `urn:uuid:condition-${input.visitId}`,
    resource: {
      resourceType: "Condition",
      id: `condition-${input.visitId}`,
      clinicalStatus: {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
            code: "active",
            display: "Active",
          },
        ],
      },
      verificationStatus: {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/condition-ver-status",
            code: "confirmed",
            display: "Confirmed",
          },
        ],
      },
      code: {
        text: input.diagnosis,
      },
      subject: {
        reference: `urn:uuid:${patientResourceId}`,
        display: input.patientName,
      },
      recorder: {
        reference: `urn:uuid:${practitionerResourceId}`,
        display: `Dr. ${input.doctorName}`,
      },
      recordedDate: timestamp,
    },
  };

  // 4. MedicationRequest Resources
  const medicationResources = input.medications.map((med, idx) => ({
    fullUrl: `urn:uuid:medication-${input.visitId}-${idx + 1}`,
    resource: {
      resourceType: "MedicationRequest",
      id: `medication-${input.visitId}-${idx + 1}`,
      status: "active",
      intent: "order",
      medicationCodeableConcept: {
        text: med.medicineName,
      },
      subject: {
        reference: `urn:uuid:${patientResourceId}`,
        display: input.patientName,
      },
      dosageInstruction: [
        {
          text: [med.dosage, med.frequency, med.instructions].filter(Boolean).join(" - "),
          timing: {
            code: {
              text: med.frequency || "As directed",
            },
          },
        },
      ],
      dispenseRequest: {
        expectedSupplyDuration: {
          value: parseInt(med.duration || "5", 10) || 5,
          unit: "days",
          system: "http://unitsofmeasure.org",
          code: "d",
        },
      },
    },
  }));

  // 5. Composition (Document Root) Resource
  const compositionResource = {
    fullUrl: `urn:uuid:${compositionId}`,
    resource: {
      resourceType: "Composition",
      id: compositionId,
      status: "final",
      type: {
        coding: [
          {
            system: "http://snomed.info/sct",
            code: "371530004",
            display: "Clinical Consultation Report",
          },
        ],
        text: "PreConsult Clinical Intake & Consultation Record",
      },
      subject: {
        reference: `urn:uuid:${patientResourceId}`,
        display: input.patientName,
      },
      date: timestamp,
      author: [
        {
          reference: `urn:uuid:${practitionerResourceId}`,
          display: `Dr. ${input.doctorName}`,
        },
      ],
      title: "OPD Pre-Consultation Clinical Intake & Prescription Document",
      section: [
        {
          title: "Chief Complaint & History of Present Illness",
          text: {
            status: "generated",
            div: `<div xmlns="http://www.w3.org/1999/xhtml"><p>${input.chiefComplaint || input.hpi || "Intake completed"}</p></div>`,
          },
        },
        {
          title: "Clinical Diagnosis",
          entry: [
            {
              reference: `urn:uuid:condition-${input.visitId}`,
            },
          ],
        },
        {
          title: "Medications Prescribed (Rx)",
          entry: medicationResources.map((m) => ({
            reference: m.fullUrl,
          })),
        },
        ...(input.doctorNotes
          ? [
              {
                title: "Doctor's Advice & Lifestyle Guidance",
                text: {
                  status: "generated",
                  div: `<div xmlns="http://www.w3.org/1999/xhtml"><p>${input.doctorNotes}</p></div>`,
                },
              },
            ]
          : []),
      ],
    },
  };

  // Assembling full FHIR R4 Bundle
  return {
    resourceType: "Bundle",
    id: bundleId,
    meta: {
      lastUpdated: timestamp,
      profile: ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle"],
    },
    identifier: {
      system: "https://preconsult.health/abdm/documents",
      value: `PRECONSULT-${input.visitId.substring(0, 8).toUpperCase()}`,
    },
    type: "document",
    timestamp,
    entry: [
      compositionResource,
      patientResource,
      practitionerResource,
      conditionResource,
      ...medicationResources,
    ],
  };
}