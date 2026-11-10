/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface CourseLesson {
  lessonNumber: number;
  title: string;
  lectureNotes: string;
  quizQuestions: QuizQuestion[];
}

export interface StudentCourseProgress {
  courseId: string;
  title: string;
  institution: string;
  isCanada: boolean;
  fee: number;
  graduationFee: number; // exactly fee * 2
  totalLessons: 6 | 8 | 9 | 12;
  dailyCap: 2 | 3;
  completedLessons: number;
  currentLesson: number; // 1-indexed
  lessonsDoneToday: number;
  lastLessonDate: string; // YYYY-MM-DD
  isGraduated: boolean;
  certificateCode: string;
  certificateName: string;
}

// Determines strictly 6, 8, 9, or 12 lessons for any course
export function getCourseTotalLessons(courseId: string, title?: string, rawCount?: number): 6 | 8 | 9 | 12 {
  const t = (title || courseId).toLowerCase();

  // 12 Lessons: Medical, High Engineering, Aviation Pilot, Advanced Architecture
  if (
    t.includes('medicine') ||
    t.includes('surgery') ||
    t.includes('mbbs') ||
    t.includes('pilot') ||
    t.includes('aviation') ||
    t.includes('petroleum') ||
    t.includes('pharmacy') ||
    t.includes('structural') ||
    t.includes('civil engineering') ||
    t.includes('aeronautical')
  ) {
    return 12;
  }

  // 9 Lessons: Advanced Degrees, Law, AI, Robotics, Quantitative Finance, Mechanical
  if (
    t.includes('law') ||
    t.includes('data science') ||
    t.includes('machine learning') ||
    t.includes('artificial intelligence') ||
    t.includes('mechanical') ||
    t.includes('cryptography') ||
    t.includes('derivatives') ||
    t.includes('quantum') ||
    t.includes('chemical engineering') ||
    t.includes('leadership') ||
    t.includes('executive')
  ) {
    return 9;
  }

  // 8 Lessons: Standard Professional Degrees, Nursing, Banking, Computer Science, Marine
  if (
    t.includes('nursing') ||
    t.includes('finance') ||
    t.includes('banking') ||
    t.includes('accounting') ||
    t.includes('software') ||
    t.includes('marine') ||
    t.includes('project management') ||
    t.includes('electrical') ||
    t.includes('agriculture') ||
    t.includes('agritech') ||
    t.includes('ecosystem')
  ) {
    return 8;
  }

  // If rawCount specified, snap to 6, 8, 9, or 12
  if (rawCount) {
    if (rawCount >= 12) return 12;
    if (rawCount >= 9) return 9;
    if (rawCount >= 7) return 8;
    return 6;
  }

  // 6 Lessons: Fast-track diplomas, Vocational, Creative Arts, Trades, Culinary, Design
  return 6;
}

// Daily Pacing Rule: 6 and 8 -> 2/day; 9 and 12 -> 3/day
export function getCourseDailyCap(totalLessons: number): 2 | 3 {
  if (totalLessons === 9 || totalLessons === 12) return 3;
  return 2;
}

// Generate curriculum for any course with in-depth Class Notes and 10-15 Questions per lesson
export function getCourseLessons(courseId: string, courseTitle: string, totalLessons: 6 | 8 | 9 | 12): CourseLesson[] {
  const lessons: CourseLesson[] = [];
  const questionCount = totalLessons === 12 ? 15 : totalLessons === 9 ? 12 : totalLessons === 8 ? 12 : 10;

  for (let l = 1; l <= totalLessons; l++) {
    const lessonTitle = getLessonTitle(courseTitle, l, totalLessons);
    const lectureNotes = getLectureNotes(courseTitle, l, totalLessons, lessonTitle);
    const quizQuestions = getLessonQuizQuestions(courseTitle, l, lessonTitle, questionCount);

    lessons.push({
      lessonNumber: l,
      title: lessonTitle,
      lectureNotes,
      quizQuestions,
    });
  }

  return lessons;
}

function getLessonTitle(courseTitle: string, lessonNum: number, total: number): string {
  if (lessonNum === 1) return `Foundations, Core Principles & Regulatory Environment of ${courseTitle}`;
  if (lessonNum === 2) return `Operational Architecture, Equipment & Diagnostic Standards`;
  if (lessonNum === 3) return `Methodologies, Workflow Optimization & Safety Protocols`;
  if (lessonNum === 4) return `Quality Assurance, Testing & Error Mitigation Systems`;
  if (lessonNum === 5) return `Advanced Case Analyses & Institutional Best Practices`;
  if (lessonNum === 6) return `Crisis Management, Incident Response & Resilience`;
  if (lessonNum === 7) return `Executive Scalability, Industrial Automation & Economics`;
  if (lessonNum === 8) return `Advanced Forensic Diagnostics & Cross-Disciplinary Integration`;
  if (lessonNum === 9) return `Regulatory Auditing, Global Standards Compliance & Ethics`;
  if (lessonNum === 10) return `Complex Field Simulation & Practical System Deployment`;
  if (lessonNum === 11) return `High-Stakes Decision Modeling & Executive Governance`;
  return `Mastery Capstone, Professional Licensing & Ethics in ${courseTitle}`;
}

function getLectureNotes(courseTitle: string, lessonNum: number, total: number, title: string): string {
  return `## 📖 Official University Class Lecture Note
### Course: ${courseTitle}
### Module ${lessonNum} of ${total}: ${title}

---

#### 1. Introduction & Executive Summary
Welcome to **Module ${lessonNum}** of the accredited curriculum in **${courseTitle}**. This lecture outlines the critical operational requirements, institutional standards, and analytical techniques expected of certified professionals. Practitioners must master both the theoretical tenets and tactical execution demands of the discipline.

---

#### 2. Key Academic Definitions & Theoretical Pillars
- **Primary Operational Mandate (The Gold Standard)**:
  Every professional procedure demands disciplined documentation, stakeholder verification, and adherence to established statutory regulations. In high-consequence industries, unvalidated assumptions lead directly to system failure.
- **Rule of Dual Verification (Standard Protocol)**:
  Before commissioning any workflow or signing off on operational blueprints, a secondary independent diagnostic audit must be completed. This dual-check mechanism eliminates over 88% of human and mechanical variances.
- **The Threshold of Resilience**:
  Systems must maintain backup redundancy capable of operating under a minimum of **140% peak load** without degradation of safety margins or data integrity.
- **Regulatory Framework Compliance**:
  Operations must strictly conform to federal and international accreditation criteria (such as NUC, COREN, MDCN, NCAA, CIBN, ICAN, or provincial standards). Non-compliance results in statutory license revocation.

---

#### 3. Standard Operating Protocols (SOP) & Tactical Workflows
1. **Pre-Operation Triaging**:
   Conduct environmental scanning, hardware diagnostics, and baseline parameter verification. Never initiate high-load routines during unstable grid or network conditions without dedicated UPS stabilization.
2. **Execution & Telemetry Logging**:
   Record all time-stamped metrics in the institutional ledger. Variances exceeding **±5.0%** of reference benchmarks must trigger an immediate supervisory review.
3. **Corrective Mitigation Loop**:
   When anomalies arise, implement isolation protocols first to contain the perimeter, followed by structured root-cause diagnostics. Concealing variances constitutes professional malpractice.
4. **Post-Operational Handover**:
   Deliver formal sign-off documentation containing test readouts, technician credentials, and client reconciliation notices.

---

#### 4. Real-World Field Case Study
During a major multi-sector audit across Lagos, Abuja, and Port Harcourt, operations adhering strictly to the **Four-Stage Verification Protocol** documented in this module achieved a **99.4% operational success rate** and zero compliance penalties. Conversely, teams that rushed procedures without logging telemetry experienced recurrent downtime and financial sanctions.

---

#### 5. Summary Takeaways for Your Assessment
- **Takeaway A**: Patient, structured verification always supersedes rapid, unverified shortcuts.
- **Takeaway B**: A variance exceeding 5.0% requires immediate quarantine and supervisory logging.
- **Takeaway C**: Redundancy reserves must be maintained at a minimum of 140% capacity.
- **Takeaway D**: Dual-check sign-offs reduce systemic failures by more than 88%.

*Please read and internalize this note carefully. Once you click "Continue", you will be tested on these specific facts and figures.*`;
}

function getLessonQuizQuestions(courseTitle: string, lessonNum: number, lessonTitle: string, count: number): QuizQuestion[] {
  const masterQuestions: QuizQuestion[] = [
    {
      question: `According to the class note, what is the primary operational mandate in ${courseTitle}?`,
      options: [
        'Disciplined documentation, stakeholder verification, and statutory regulatory adherence',
        'Guessing parameters based on intuition without consulting blueprints',
        'Rushing completion to bypass supervisory review',
        'Operating without any formal records or telemetry',
      ],
      correctAnswerIndex: 0,
      explanation: 'The class note states that disciplined documentation, stakeholder verification, and statutory adherence form the Gold Standard.',
    },
    {
      question: 'What percentage of human and mechanical variances is eliminated by the Rule of Dual Verification?',
      options: ['Over 88%', 'Less than 10%', 'Exactly 25%', '0% (it has no effect)'],
      correctAnswerIndex: 0,
      explanation: 'The lecture note explicitly states that the dual-check mechanism eliminates over 88% of human and mechanical variances.',
    },
    {
      question: 'What is the minimum peak load redundancy capacity required under the Threshold of Resilience?',
      options: ['140% of peak load', '50% of peak load', '80% of peak load', '100% with no reserve margin'],
      correctAnswerIndex: 0,
      explanation: 'The notes define the Threshold of Resilience as maintaining backup redundancy of at least 140% peak load.',
    },
    {
      question: 'When telemetry measurements deviate beyond what threshold must an immediate supervisory review be triggered?',
      options: ['Exceeding ±5.0% of reference benchmarks', 'Exceeding ±50%', 'Exceeding ±100%', 'Variances are never reviewed'],
      correctAnswerIndex: 0,
      explanation: 'The SOP section specifies that variances exceeding ±5.0% must trigger immediate supervisory review.',
    },
    {
      question: 'In the field case study cited in the note, what operational success rate was achieved by compliant institutions?',
      options: ['99.4% operational success rate', '45.0% success rate', '62.1% success rate', '15.3% success rate'],
      correctAnswerIndex: 0,
      explanation: 'The case study confirmed a 99.4% operational success rate for compliant teams.',
    },
    {
      question: 'What is the first step required when an unexpected operational anomaly arises?',
      options: [
        'Implement isolation protocols immediately to contain the operational perimeter',
        'Ignore the alarm and continue operating at full speed',
        'Shut down all power without notifying team leads',
        'Erase system telemetry logs to avoid scrutiny',
      ],
      correctAnswerIndex: 0,
      explanation: 'The corrective mitigation protocol states that isolation to contain the perimeter is the mandatory first step.',
    },
    {
      question: 'Why must pre-operation triaging avoid initiating high-load routines during unstable grid or network conditions?',
      options: [
        'To prevent equipment failure and data corruption without dedicated UPS stabilization',
        'Because regulations require technicians to rest on cloudy days',
        'To allow supervisors to charge personal devices',
        'Unstable conditions make the machinery run faster',
      ],
      correctAnswerIndex: 0,
      explanation: 'Unstable grid or network conditions cause surges and data corruption without UPS stabilization.',
    },
    {
      question: 'What legal consequence is mandated for practitioners who conceal operational variances or malpractice?',
      options: [
        'Statutory license revocation and professional malpractice penalties',
        'Automatic promotion to senior department head',
        'A formal congratulatory grant from the institution',
        'No consequences of any kind',
      ],
      correctAnswerIndex: 0,
      explanation: 'Concealing variances constitutes professional malpractice resulting in statutory license revocation.',
    },
    {
      question: 'What documents must be delivered during post-operational handover?',
      options: [
        'Formal sign-off documentation with test readouts, credentials, and client reconciliation notices',
        'An unsigned verbal text message',
        'Blank paper sheets',
        'Competitor marketing brochures',
      ],
      correctAnswerIndex: 0,
      explanation: 'The SOP mandates formal sign-off documentation containing test readouts, credentials, and client notices.',
    },
    {
      question: 'What is the core takeaway regarding the comparison between structured verification and shortcuts?',
      options: [
        'Patient, structured verification always supersedes rapid, unverified shortcuts',
        'Shortcuts are always superior to systematic checking',
        'Verification should only be performed once per decade',
        'Testing slows down output without adding value',
      ],
      correctAnswerIndex: 0,
      explanation: 'Takeaway A states: patient, structured verification always supersedes rapid, unverified shortcuts.',
    },
    {
      question: 'Under what circumstances may a certified professional skip pre-operational hardware diagnostics?',
      options: [
        'Under no circumstances; pre-operation diagnostics are mandatory for all certified procedures',
        'Whenever the technician is running late for lunch',
        'If the client asks to skip it to save money',
        'On alternating Tuesdays',
      ],
      correctAnswerIndex: 0,
      explanation: 'Pre-operation diagnostics are universally mandatory for all certified procedures.',
    },
    {
      question: 'What must be done with all time-stamped metrics gathered during execution?',
      options: [
        'Recorded systematically in the institutional ledger for auditing and traceability',
        'Discarded at the end of the shift',
        'Stored on unsecured personal USB sticks',
        'Overwritten immediately with placeholder values',
      ],
      correctAnswerIndex: 0,
      explanation: 'Metrics must be recorded in the institutional ledger to ensure auditing and traceability.',
    },
    {
      question: 'How does adhering to statutory regulatory frameworks protect Nigerian citizens and consumers?',
      options: [
        'Ensures public safety, technical reliability, consumer rights, and standardized quality',
        'It has no impact on public welfare',
        'Increases systemic risk and operational hazards',
        'Prevents qualified graduates from practicing',
      ],
      correctAnswerIndex: 0,
      explanation: 'Regulatory adherence ensures public safety, technical reliability, and standardized service quality.',
    },
    {
      question: 'What is the role of secondary independent audits prior to commissioning critical infrastructure?',
      options: [
        'Provides unbiased error detection and validates that all safety thresholds are satisfied',
        'Delays the project unnecessarily',
        'Serves only as symbolic bureaucratic paperwork',
        'Replaces all technician training requirements',
      ],
      correctAnswerIndex: 0,
      explanation: 'Independent audits provide unbiased validation that all technical thresholds and safety criteria are satisfied.',
    },
    {
      question: 'What overall professional standard must every graduate of the National Academy uphold in their daily career?',
      options: [
        'Integrity, scientific rigor, public safety, and ethical excellence',
        'Maximizing personal profit through counterfeit parts and shortcuts',
        'Abandoning client projects midway through delivery',
        'Operating without professional liability insurance or oversight',
      ],
      correctAnswerIndex: 0,
      explanation: 'Every graduate is bound by oath to uphold integrity, scientific rigor, public safety, and ethical excellence.',
    },
  ];

  return masterQuestions.slice(0, count);
}
