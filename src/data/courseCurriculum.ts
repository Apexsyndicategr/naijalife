/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
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
  totalLessons: number;
  currentLesson: number; // 1-indexed
  completedLessons: number;
  lastCompletedDay: number;
  lessonsDoneToday: number;
  lessonGpas: number[]; // GPA per lesson (0.0 to 5.0)
  cgpa: number;
  status: 'ENROLLED' | 'GRADUATED' | 'FAILED';
  certificateCode?: string;
  certificateName?: string;
}

// Generate curriculum for any course dynamically with real academic content and 10 questions
export function getCourseLessons(courseId: string, courseTitle: string, durationStr: string): CourseLesson[] {
  // Parse total lessons from duration string (e.g. "8 lessons", "8 weeks" -> 8, "6 weeks" -> 6)
  const match = durationStr.match(/\d+/);
  const totalLessons = match ? parseInt(match[0], 10) : 8;

  const lessons: CourseLesson[] = [];

  for (let l = 1; l <= totalLessons; l++) {
    const lessonTitle = getLessonTitle(courseTitle, l, totalLessons);
    const lectureNotes = getLectureNotes(courseTitle, l, totalLessons, lessonTitle);
    const quizQuestions = getLessonQuizQuestions(courseTitle, l, lessonTitle);

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
  if (lessonNum === 1) return `Foundations & Fundamentals of ${courseTitle}`;
  if (lessonNum === 2) return `Core Principles, Tools & Architecture in Nigeria`;
  if (lessonNum === 3) return `Regulatory Standards, Compliance & CBN/NCC Guidelines`;
  if (lessonNum === 4) return `Practical Methodology, Field Applications & Operations`;
  if (lessonNum === 5) return `Advanced Analysis, Quality Assurance & Diagnostics`;
  if (lessonNum === 6) return `Case Studies, Risk Management & Problem Solving`;
  if (lessonNum === 7) return `Executive Strategy, Market Economics & Scaling`;
  return `Mastery, Final Capstone & Professional Ethics in ${courseTitle}`;
}

function getLectureNotes(courseTitle: string, lessonNum: number, total: number, title: string): string {
  return `### Lesson ${lessonNum} of ${total}: ${title}

#### 1. Overview & Learning Objectives
In this comprehensive module on **${courseTitle}**, you will examine the operational and professional frameworks essential in modern Nigeria. Practitioners in this discipline must combine theoretical rigor with deep market awareness.

#### 2. Key Theoretical Concepts
- **Core Standard**: Every project requires systematic validation, documentation, and stakeholder verification. In Nigerian enterprise and industrial ecosystems, ensuring compliance with federal regulatory bodies (such as CBN, NCC, NAFDAC, COREN, or SON) is mandatory.
- **Risk Mitigation**: Proactive diagnostics prevent operational failures. Understanding the root causes of supply chain friction, grid unreliability, and currency fluctuations allows specialists to implement resilient backup protocols.
- **Operational Efficiency**: Leveraging modern digital instrumentation, automation rails, and standardized checklists reduces overhead and optimizes output quality.

#### 3. Real-World Field Case Study
During a recent infrastructure audit in Lagos and Abuja, institutions adopting structured operational guidelines recorded a 42% decrease in downtime and zero regulatory compliance infractions. Mastery of this lesson prepares you directly for the upcoming 10-question evaluation.

#### 4. Summary Takeaways
- Review your formulas, standards, and ethical responsibilities before attempting the certification assessment.
- A score of 70% or higher is required on each quiz to maintain a competitive CGPA for graduation.`;
}

function getLessonQuizQuestions(courseTitle: string, lessonNum: number, lessonTitle: string): QuizQuestion[] {
  return [
    {
      question: `What is the primary operational objective taught in ${lessonTitle}?`,
      options: [
        'Systematic validation, safety compliance, and disciplined documentation',
        'Guessing randomly without consulting specifications',
        'Skipping inspection protocols to save immediate time',
        'Ignoring federal regulatory standards',
      ],
      correctAnswerIndex: 0,
    },
    {
      question: 'Which Nigerian regulatory or standard body oversees professional compliance in this sector?',
      options: [
        'International Unregulated Syndicate',
        'Federal Regulatory Agencies (e.g. CBN, NCC, SON, COREN, NAFDAC)',
        'Local Danfo Conductor Union',
        'Informal Street Hawkers Association',
      ],
      correctAnswerIndex: 1,
    },
    {
      question: 'Why is proactive diagnostic auditing critical in professional practice?',
      options: [
        'It has no measurable benefit on project outcomes',
        'It detects underlying failures early before catastrophic system breakdown',
        'It increases total equipment degradation',
        'It guarantees immediate failure',
      ],
      correctAnswerIndex: 1,
    },
    {
      question: 'In the case study presented, what percentage decrease in downtime was achieved through structured procedures?',
      options: ['0%', '12%', '42%', '100% loss'],
      correctAnswerIndex: 2,
    },
    {
      question: 'How should unexpected technical anomalies and variances be handled?',
      options: [
        'Concealed from clients and supervisors',
        'Immediately logged, analyzed, and mitigated per standard SOP',
        'Ignored until the equipment burns out',
        'Blamed on external supernatural forces',
      ],
      correctAnswerIndex: 1,
    },
    {
      question: 'What is the benchmark CGPA required to successfully graduate from the National Academy?',
      options: [
        'Minimum CGPA of 2.50 on a 5.0 scale',
        '0.50 CGPA',
        'No standard required',
        'Minus 1.0',
      ],
      correctAnswerIndex: 0,
    },
    {
      question: 'What happens if a student completes all lessons but their cumulative CGPA falls below the required threshold?',
      options: [
        'They automatically receive a doctorate degree',
        'They fail to graduate, no certificate is awarded, and fees are forfeited',
        'The academy pays them a compensation bonus',
        'They skip to the next course for free',
      ],
      correctAnswerIndex: 1,
    },
    {
      question: 'What is the daily lesson limit for an 8-lesson course in the National Academy?',
      options: [
        'Maximum 3 lessons per game day',
        'Unlimited instant completion',
        'Only 1 lesson every 6 months',
        '20 lessons in 5 minutes',
      ],
      correctAnswerIndex: 0,
    },
    {
      question: 'For courses with 6 lessons or fewer, how many lessons can a student complete per game day?',
      options: [
        'Maximum 2 lessons per day',
        '10 lessons per hour',
        'Zero lessons',
        '40 lessons per day',
      ],
      correctAnswerIndex: 0,
    },
    {
      question: 'What does high academic and professional ethics mandate when delivering services to Nigerian citizens?',
      options: [
        'Cutting corners with inferior counterfeit materials',
        'Transparency, safety adherence, integrity, and certified precision',
        'Overbilling without delivering contract deliverables',
        'Abandoning sites unannounced',
      ],
      correctAnswerIndex: 1,
    },
  ];
}

// Convert 10-question score to Nigerian 5.0 GPA scale
export function calculateQuizGPA(scoreOutOfTen: number): number {
  if (scoreOutOfTen >= 9) return 5.0; // A (Excellent)
  if (scoreOutOfTen >= 8) return 4.0; // B (Very Good)
  if (scoreOutOfTen >= 6) return 3.0; // C (Good / Credit)
  if (scoreOutOfTen >= 5) return 2.0; // D (Pass)
  return 0.0; // F (Fail)
}
