/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WorkShiftQuestion {
  id: string;
  scenario: string;
  options: {
    letter: 'A' | 'B' | 'C' | 'D' | 'E';
    text: string;
    isOptimal: boolean;
    feedback: string;
    scoreDelta: number;
  }[];
}

export interface JobCertificateRequirement {
  courseId: string;
  courseName: string;
  institution: string;
  region: 'nigeria' | 'canada';
}

/**
 * Mapping of professional careers to required University / College degree certificates.
 * Entry-level manual & trade jobs return null (no certificate required).
 */
export function getJobCertificateRequirement(jobId: string, title: string, sector?: string): JobCertificateRequirement | null {
  const lowerTitle = title.toLowerCase();
  const lowerId = jobId.toLowerCase();

  // Entry-level jobs that require NO certificate
  if (
    lowerTitle.includes('pos') ||
    lowerTitle.includes('danfo') ||
    lowerTitle.includes('driver') ||
    lowerTitle.includes('chauffeur') ||
    lowerTitle.includes('hawker') ||
    lowerTitle.includes('cleaner') ||
    lowerTitle.includes('dispatch') ||
    lowerTitle.includes('security') ||
    lowerTitle.includes('waiter') ||
    lowerTitle.includes('labourer') ||
    lowerTitle.includes('mechanic') ||
    lowerTitle.includes('concorde chef') ||
    lowerTitle.includes('kiosk')
  ) {
    return null;
  }

  // Tech / Software Engineering
  if (lowerTitle.includes('software') || lowerTitle.includes('developer') || lowerTitle.includes('cybersecurity') || lowerTitle.includes('5g core')) {
    return {
      courseId: 'crs_fullstack_cloud',
      courseName: 'Full-Stack Software Engineering & Cloud Architecture',
      institution: 'University of Lagos (UNILAG)',
      region: 'nigeria',
    };
  }

  // UI/UX Design
  if (lowerTitle.includes('designer') || lowerTitle.includes('ui/ux')) {
    return {
      courseId: 'crs_uiux_design',
      courseName: 'UI/UX Product Design & Mobile Design Systems',
      institution: 'Lagos State University (LASU)',
      region: 'nigeria',
    };
  }

  // Banking, Finance & Economics
  if (lowerTitle.includes('bank') || lowerTitle.includes('teller') || lowerTitle.includes('cbn') || lowerTitle.includes('venture') || lowerTitle.includes('tax auditor')) {
    return {
      courseId: 'crs_banking_fintech',
      courseName: 'Corporate Banking & Financial Technology (Fintech)',
      institution: 'Ahmadu Bello University (ABU Zaria)',
      region: 'nigeria',
    };
  }

  // Healthcare / Medical
  if (lowerTitle.includes('nurse') || lowerTitle.includes('surgeon') || lowerTitle.includes('doctor') || lowerTitle.includes('health')) {
    return {
      courseId: 'crs_clinical_care',
      courseName: 'Clinical Medicine, Surgery & Intensive Patient Care',
      institution: 'University of Ibadan (UI)',
      region: 'nigeria',
    };
  }

  // Aviation / Pilot
  if (lowerTitle.includes('pilot') || lowerTitle.includes('first officer') || lowerTitle.includes('aviation')) {
    return {
      courseId: 'crs_aviation_pilot',
      courseName: 'Commercial Pilot License & Aeronautical Navigation',
      institution: 'Nigerian College of Aviation Technology (NCAT Zaria)',
      region: 'nigeria',
    };
  }

  // Oil, Gas & Offshore Drilling
  if (lowerTitle.includes('drilling') || lowerTitle.includes('oil') || lowerTitle.includes('subsea') || lowerTitle.includes('pipeline') || lowerTitle.includes('hse')) {
    return {
      courseId: 'crs_petroleum_drilling',
      courseName: 'Petroleum Engineering & Offshore Subsea Drilling',
      institution: 'Federal University of Petroleum Resources (FUPRE)',
      region: 'nigeria',
    };
  }

  // Legal & Government Counsel
  if (lowerTitle.includes('legal') || lowerTitle.includes('counsel') || lowerTitle.includes('parliamentary')) {
    return {
      courseId: 'crs_legal_clerk',
      courseName: 'Corporate Legal Secretary & Compliance',
      institution: 'Nigerian Law School Continuing Education',
      region: 'nigeria',
    };
  }

  // Canadian Careers
  if (lowerId.includes('can_') || lowerTitle.includes('canada') || lowerTitle.includes('toronto') || lowerTitle.includes('vancouver') || lowerTitle.includes('calgary')) {
    if (lowerTitle.includes('software') || lowerTitle.includes('cloud') || lowerTitle.includes('ai')) {
      return {
        courseId: 'can_cs_waterloo',
        courseName: 'Honours Bachelor of Computer Science',
        institution: 'University of Waterloo',
        region: 'canada',
      };
    }
    if (lowerTitle.includes('nurse') || lowerTitle.includes('medical') || lowerTitle.includes('hospital')) {
      return {
        courseId: 'can_nursing_mcgill',
        courseName: 'Bachelor of Science in Nursing (BScN)',
        institution: 'McGill University',
        region: 'canada',
      };
    }
    if (lowerTitle.includes('finance') || lowerTitle.includes('cfa') || lowerTitle.includes('bank')) {
      return {
        courseId: 'can_mba_rotman',
        courseName: 'Master of Finance & Corporate Banking',
        institution: 'Rotman School of Management (UofT)',
        region: 'canada',
      };
    }
    return {
      courseId: 'can_cs_waterloo',
      courseName: 'Accredited Canadian Professional Degree',
      institution: 'University of Toronto',
      region: 'canada',
    };
  }

  // Default professional requirement for unspecified corporate roles
  if (sector === 'corporate' || sector === 'tech' || sector === 'civil') {
    return {
      courseId: 'crs_business_admin',
      courseName: 'Business Administration & Enterprise Management',
      institution: 'University of Nigeria Nsukka (UNN)',
      region: 'nigeria',
    };
  }

  return null;
}

/**
 * 15 interactive workplace scenario questions with options A–E.
 * Provides authentic, high-stakes tactical decisions tailored to the role.
 */
export function getWorkShiftQuestions(jobTitle: string, sector: string = 'corporate'): WorkShiftQuestion[] {
  const t = jobTitle.toLowerCase();

  // 1. Software / Tech Sector
  if (t.includes('software') || t.includes('tech') || t.includes('designer') || sector === 'tech') {
    return [
      {
        id: 'q1',
        scenario: 'The senior engineering director barges into your desk: "Our payment checkout database is hitting 99% CPU during Black Friday rush! Shut down the server right now!" How do you respond?',
        options: [
          { letter: 'A', text: 'Comply immediately and power off the primary database instance.', isOptimal: false, feedback: 'Total outage! Tens of thousands of active shopping checkouts crashed.', scoreDelta: -10 },
          { letter: 'B', text: '"No sir, shutting it down kills active transactions. Let me enable read-replica shedding and activate Redis caching instead."', isOptimal: true, feedback: 'Brilliant! CPU drops to 34% within 45 seconds while checkouts continue smoothly.', scoreDelta: 20 },
          { letter: 'C', text: 'Argue loudly with him in front of the open office.', isOptimal: false, feedback: 'Creates panic and escalates executive tension.', scoreDelta: -5 },
          { letter: 'D', text: 'Send an email asking DevOps who holds the master credentials.', isOptimal: false, feedback: 'Too slow! Response took 40 minutes while the system stalled.', scoreDelta: 0 },
          { letter: 'E', text: 'Quietly go to the breakroom and wait for the incident to blow over.', isOptimal: false, feedback: 'Negligence of critical duty during peak traffic!', scoreDelta: -15 },
        ],
      },
      {
        id: 'q2',
        scenario: 'A junior developer pushes unreviewed code directly to the production main branch, triggering 500 error alerts.',
        options: [
          { letter: 'A', text: 'Instantly revert the commit using Git, redeploy the previous stable build, and lock main branch protection rules.', isOptimal: true, feedback: 'Production recovered in under 2 minutes. Incident resolved cleanly.', scoreDelta: 20 },
          { letter: 'B', text: 'Publicly humiliate the junior developer in the general Slack channel.', isOptimal: false, feedback: 'Damages engineering culture and violates HR safety codes.', scoreDelta: -10 },
          { letter: 'C', text: 'Start rewriting the broken code directly on the live server.', isOptimal: false, feedback: 'Risky! Created multiple syntax discrepancies in production.', scoreDelta: -5 },
          { letter: 'D', text: 'Ignore the alerts because it was not your personal pull request.', isOptimal: false, feedback: 'Severe dereliction of duty.', scoreDelta: -15 },
          { letter: 'E', text: 'Delete the entire GitHub repository and reclone from backup.', isOptimal: false, feedback: 'Destructive nuclear option that destroyed ongoing team branches.', scoreDelta: -20 },
        ],
      },
      {
        id: 'q3',
        scenario: 'Product manager demands an unvetted third-party analytics SDK be installed that transmits unencrypted citizen passwords.',
        options: [
          { letter: 'A', text: 'Refuse firmly citing NDPR & GDPR statutory regulations, and propose an audited zero-knowledge tokenized alternative.', isOptimal: true, feedback: 'Protected the company from a ₦500M data protection regulatory fine.', scoreDelta: 20 },
          { letter: 'B', text: 'Install the SDK without testing to satisfy the product deadline.', isOptimal: false, feedback: 'Severe data leak detected by CBN cybersecurity audit!', scoreDelta: -20 },
          { letter: 'C', text: 'Forward the request to an external whistleblower anonymously.', isOptimal: false, feedback: 'Premature escalation before exhausting internal security review.', scoreDelta: 0 },
          { letter: 'D', text: 'Ask the product manager to sign an informal indemnity napkin.', isOptimal: false, feedback: 'Legally worthless and unprofessional.', scoreDelta: -10 },
          { letter: 'E', text: 'Pretend to install it but comment out the script tag.', isOptimal: false, feedback: 'Misleads product metrics and conceals technical reality.', scoreDelta: -5 },
        ],
      },
      {
        id: 'q4',
        scenario: 'A high-severity zero-day vulnerability (CVE) is disclosed in your authentication library at 11:30 PM on a Friday.',
        options: [
          { letter: 'A', text: 'Assemble the security response team, apply the verified upstream security patch, run regression tests, and deploy.', isOptimal: true, feedback: 'Zero compromise. Systems secured before exploit scripts circulated.', scoreDelta: 20 },
          { letter: 'B', text: 'Log off and wait until Monday 9:00 AM standup meeting.', isOptimal: false, feedback: 'Malicious actors breached 1,200 accounts over the weekend!', scoreDelta: -25 },
          { letter: 'C', text: 'Tweet about the zero-day to gain developer clout.', isOptimal: false, feedback: 'Exposed company vulnerabilities publicly. Immediate HR suspension!', scoreDelta: -20 },
          { letter: 'D', text: 'Disable all user logins indefinitely without informing customers.', isOptimal: false, feedback: 'Caused customer panic and social media outrage.', scoreDelta: -10 },
          { letter: 'E', text: 'Change the root SSH port and assume hackers will give up.', isOptimal: false, feedback: 'Security through obscurity fails against automated botnets.', scoreDelta: -5 },
        ],
      },
      {
        id: 'q5',
        scenario: 'The marketing team claims your UI is too slow, but performance metrics show 99th percentile load times under 200ms.',
        options: [
          { letter: 'A', text: 'Conduct a screen-share session with marketing, inspect their real client devices, and identify an oversized uncompressed banner.', isOptimal: true, feedback: 'Identified a 48MB raw TIFF banner uploaded by marketing. Resolved instantly.', scoreDelta: 20 },
          { letter: 'B', text: 'Dismiss their feedback rudely and tell them to learn basic networking.', isOptimal: false, feedback: 'Inter-department friction escalated to C-suite.', scoreDelta: -10 },
          { letter: 'C', text: 'Delete half the CSS styles without checking visual regression.', isOptimal: false, feedback: 'Broke layout across mobile devices.', scoreDelta: -15 },
          { letter: 'D', text: 'Send them a 40-page textbook on TCP handshake latency.', isOptimal: false, feedback: 'Passive-aggressive and unhelpful.', scoreDelta: -5 },
          { letter: 'E', text: 'Spend two weeks rewriting the whole frontend in assembly language.', isOptimal: false, feedback: 'Wasteful premature optimization.', scoreDelta: -10 },
        ],
      },
      {
        id: 'q6',
        scenario: 'An offshore cloud server region in North America experiences a complete fiber cable submarine cut.',
        options: [
          { letter: 'A', text: 'Activate DNS geo-routing failover to European and African backup clusters automatically.', isOptimal: true, feedback: 'Zero downtime achieved. 99.999% SLA maintained.', scoreDelta: 20 },
          { letter: 'B', text: 'Wait for submarine divers to repair the Atlantic fiber optic cables.', isOptimal: false, feedback: 'Took 14 days; customers abandoned the platform.', scoreDelta: -15 },
          { letter: 'C', text: 'Manually copy files over FTP through your mobile hotspot.', isOptimal: false, feedback: 'Bandwidth choked; corrupted backup data.', scoreDelta: -10 },
          { letter: 'D', text: 'Blame the telecommunications minister on social media.', isOptimal: false, feedback: 'Unprofessional conduct.', scoreDelta: -5 },
          { letter: 'E', text: 'Power down all servers worldwide in solidarity.', isOptimal: false, feedback: 'Total platform failure!', scoreDelta: -20 },
        ],
      },
      {
        id: 'q7',
        scenario: 'Your team lead asks you to estimate a complex microservices migration project.',
        options: [
          { letter: 'A', text: 'Break down milestones into user stories, identify external API dependencies, and provide a range with 20% risk buffer.', isOptimal: true, feedback: 'Delivered on time and within budget. Management commended your rigor.', scoreDelta: 20 },
          { letter: 'B', text: 'Promise it will be done tomorrow morning without looking at the codebase.', isOptimal: false, feedback: 'Missed deadline catastrophically.', scoreDelta: -15 },
          { letter: 'C', text: 'Refuse to give any estimate stating "code is unpredictable art".', isOptimal: false, feedback: 'Seen as uncooperative and immature.', scoreDelta: -10 },
          { letter: 'D', text: 'Quote 4 years for a 2-week task to give yourself free vacation time.', isOptimal: false, feedback: 'Client canceled contract due to absurd timeline.', scoreDelta: -15 },
          { letter: 'E', text: 'Flip a coin in front of executive stakeholders.', isOptimal: false, feedback: 'Inappropriate workplace behavior.', scoreDelta: -10 },
        ],
      },
      {
        id: 'q8',
        scenario: 'An automated security bot flags that someone committed an AWS secret key to a public GitHub repo 5 minutes ago.',
        options: [
          { letter: 'A', text: 'Immediately revoke the AWS key in IAM console, inspect CloudTrail audit logs for unauthorized API calls, and rotate keys.', isOptimal: true, feedback: 'Threat neutralized within 3 minutes before crypto-miners spun up rogue nodes.', scoreDelta: 20 },
          { letter: 'B', text: 'Delete the Git commit and hope nobody cloned the repo.', isOptimal: false, feedback: 'Scraping bots had already captured the key; ₦14M compute bill incurred!', scoreDelta: -25 },
          { letter: 'C', text: 'Email the developer asking if they meant to do that.', isOptimal: false, feedback: 'Crucial response minutes lost.', scoreDelta: -10 },
          { letter: 'D', text: 'Change your personal password and do nothing about the key.', isOptimal: false, feedback: 'Total failure to contain the breach.', scoreDelta: -20 },
          { letter: 'E', text: 'Unplug your laptop from Wi-Fi.', isOptimal: false, feedback: 'Does not affect public repository exposure!', scoreDelta: -10 },
        ],
      },
      {
        id: 'q9',
        scenario: 'A fintech partner API starts returning corrupt JSON payloads with duplicate transactions.',
        options: [
          { letter: 'A', text: 'Enable idempotent transaction locking on our gateway, reject duplicates at validation layer, and alert their engineering lead.', isOptimal: true, feedback: 'Prevented double-debiting 40,000 customers. CBN compliance verified.', scoreDelta: 20 },
          { letter: 'B', text: 'Process all duplicate charges and pocket the processing surcharge.', isOptimal: false, feedback: 'Severe regulatory fraud investigation triggered!', scoreDelta: -30 },
          { letter: 'C', text: 'Turn off the database write-ahead log to suppress errors.', isOptimal: false, feedback: 'Database corruptions across all accounts.', scoreDelta: -20 },
          { letter: 'D', text: 'Post a meme about bad APIs on LinkedIn.', isOptimal: false, feedback: 'Breached partner non-disclosure agreement.', scoreDelta: -10 },
          { letter: 'E', text: 'Blame the internet service provider.', isOptimal: false, feedback: 'False diagnosis that delayed remediation.', scoreDelta: -5 },
        ],
      },
      {
        id: 'q10',
        scenario: 'Management considers skipping end-to-end testing to launch an e-commerce feature 3 days ahead of a rival.',
        options: [
          { letter: 'A', text: 'Present a risk matrix showing checkout failure probabilities and propose an automated sanity smoke-test run of core flows.', isOptimal: true, feedback: 'Balanced executive speed with mission-critical transaction safety.', scoreDelta: 20 },
          { letter: 'B', text: 'Agree enthusiastically: "Testing is for cowards!"', isOptimal: false, feedback: 'Launched with a broken checkout flow; 100% bounce rate on day one.', scoreDelta: -20 },
          { letter: 'C', text: 'Call in sick on launch day to avoid blame.', isOptimal: false, feedback: 'Desertion of team during critical launch.', scoreDelta: -15 },
          { letter: 'D', text: 'Secretly introduce bugs so the launch fails on purpose.', isOptimal: false, feedback: 'Gross corporate sabotage. Grounds for termination.', scoreDelta: -30 },
          { letter: 'E', text: 'Write 10,000 unit tests for a button color and ignore checkout logic.', isOptimal: false, feedback: 'Misaligned test priorities.', scoreDelta: -10 },
        ],
      },
      {
        id: 'q11',
        scenario: 'A customer support ticket reports that special Nigerian accented characters like "Ọ" and "Ụ" are rendering as garbled "?" marks.',
        options: [
          { letter: 'A', text: 'Audit database collation and ensure end-to-end UTF-8 encoding across API headers, database charset, and font fallbacks.', isOptimal: true, feedback: 'Indigenous Nigerian names now render with perfect typographical elegance.', scoreDelta: 20 },
          { letter: 'B', text: 'Tell customers to change their ethnic names to English equivalents.', isOptimal: false, feedback: 'Insulting and culturally insensitive. Major public relations backlash!', scoreDelta: -25 },
          { letter: 'C', text: 'Replace all vowels in the database with the letter "X".', isOptimal: false, feedback: 'Corrupted thousands of customer identity records.', scoreDelta: -20 },
          { letter: 'D', text: 'Delete customer support records containing special characters.', isOptimal: false, feedback: 'Unethical suppression of customer feedback.', scoreDelta: -15 },
          { letter: 'E', text: 'Ignore because it only affects domestic citizens.', isOptimal: false, feedback: 'Alienates the core user base of Naija Life.', scoreDelta: -15 },
        ],
      },
      {
        id: 'q12',
        scenario: 'Your code review partner writes a 1,500-line pull request with zero comments, mixed refactorings, and broken unit tests.',
        options: [
          { letter: 'A', text: 'Politely request breaking the PR into atomic thematic chunks with unit test fixes, offering to pair on the review.', isOptimal: true, feedback: 'Fostered high engineering standards and helped colleague deliver clean code.', scoreDelta: 20 },
          { letter: 'B', text: 'Approve without reading because you want to leave office early.', isOptimal: false, feedback: 'Broke staging environment for 4 days.', scoreDelta: -15 },
          { letter: 'C', text: 'Reject with the single comment: "Trash code, resign now."', isOptimal: false, feedback: 'Toxic communication reported to HR.', scoreDelta: -15 },
          { letter: 'D', text: 'Merge it directly into production without QA.', isOptimal: false, feedback: 'Severe system breakdown.', scoreDelta: -25 },
          { letter: 'E', text: 'Block the coworker on GitHub.', isOptimal: false, feedback: 'Childish behavior that paralyzed team workflow.', scoreDelta: -10 },
        ],
      },
      {
        id: 'q13',
        scenario: 'The company CEO asks you during a live board presentation whether AI will replace all software developers this quarter.',
        options: [
          { letter: 'A', text: '"AI dramatically amplifies engineering productivity for code scaffolding, but human domain architecture, security, and edge-case judgment remain irreplaceable."', isOptimal: true, feedback: 'The board was impressed by your balanced technical foresight.', scoreDelta: 20 },
          { letter: 'B', text: '"Yes sir, fire the whole department today and just talk to a bot."', isOptimal: false, feedback: 'Showed profound ignorance of real-world production engineering.', scoreDelta: -15 },
          { letter: 'C', text: '"AI is a complete scam with zero real utility."', isOptimal: false, feedback: 'Dismissive of transformative productivity tooling.', scoreDelta: -10 },
          { letter: 'D', text: 'Faint dramatically on the boardroom carpet.', isOptimal: false, feedback: 'Unprofessional stunt.', scoreDelta: -10 },
          { letter: 'E', text: 'Refuse to answer unless given equity.', isOptimal: false, feedback: 'Inappropriate during executive technical briefing.', scoreDelta: -15 },
        ],
      },
      {
        id: 'q14',
        scenario: 'An expired SSL/TLS certificate is causing mobile app users to receive "Untrusted Connection" warnings.',
        options: [
          { letter: 'A', text: 'Trigger automated ACME/Let\'s Encrypt certificate renewal, verify DNS challenges, reload Nginx/ALB, and configure auto-renewal alerts.', isOptimal: true, feedback: 'Certificates renewed and green locks restored in 4 minutes.', scoreDelta: 20 },
          { letter: 'B', text: 'Instruct all mobile users to bypass HTTPS and send card data over unencrypted HTTP.', isOptimal: false, feedback: 'Catastrophic security violation. Immediate audit.', scoreDelta: -30 },
          { letter: 'C', text: 'Wait 365 days for the certificate to cycle itself.', isOptimal: false, feedback: 'Nonsensical understanding of cryptographic certificates.', scoreDelta: -20 },
          { letter: 'D', text: 'Ask users to change their phone clocks back to 2019.', isOptimal: false, feedback: 'Laughable advice that broke other apps on user phones.', scoreDelta: -15 },
          { letter: 'E', text: 'Self-sign an invalid certificate without installing the root CA.', isOptimal: false, feedback: 'Warnings persisted for all mobile clients.', scoreDelta: -10 },
        ],
      },
      {
        id: 'q15',
        scenario: 'You finish all sprint tasks 2 days ahead of schedule. What is the most professional action to take?',
        options: [
          { letter: 'A', text: 'Tackle high-priority tech debt, improve test coverage, document API endpoints, and assist junior team members.', isOptimal: true, feedback: 'Exemplary leadership! Promoted your professional rank and earned bonus.', scoreDelta: 20 },
          { letter: 'B', text: 'Quietly play video games at your desk while pretending to look intense.', isOptimal: false, feedback: 'Wasted opportunity for team elevation.', scoreDelta: 0 },
          { letter: 'C', text: 'Brag to everyone how superior your typing speed is.', isOptimal: false, feedback: 'Alienated team colleagues.', scoreDelta: -5 },
          { letter: 'D', text: 'Delete other people\'s working code so you have something to fix.', isOptimal: false, feedback: 'Malicious corporate sabotage.', scoreDelta: -30 },
          { letter: 'E', text: 'Go home without clocking out or informing your engineering manager.', isOptimal: false, feedback: 'Unauthorized absence during official shift hours.', scoreDelta: -10 },
        ],
      },
    ];
  }

  // 2. Banking, Finance & Corporate Sector
  if (t.includes('bank') || t.includes('analyst') || t.includes('teller') || sector === 'corporate') {
    return [
      {
        id: 'bq1',
        scenario: 'A wealthy customer enters the banking hall demanding to deposit ₦85,000,000 in raw cash with zero KYC or source of funds documentation.',
        options: [
          { letter: 'A', text: 'Politely inform them of CBN anti-money laundering (AML) thresholds, request mandatory statutory documentation, and alert Compliance.', isOptimal: true, feedback: 'Protected bank from CBN sanctions and AML regulatory fines.', scoreDelta: 20 },
          { letter: 'B', text: 'Accept the cash immediately and split it into 50 smaller accounts under fake names.', isOptimal: false, feedback: 'Criminal money laundering offense! EFCC arrests triggered.', scoreDelta: -35 },
          { letter: 'C', text: 'Ask for a personal 10% commission in cash to look the other way.', isOptimal: false, feedback: 'Bribery and gross corruption. Immediate prosecution.', scoreDelta: -35 },
          { letter: 'D', text: 'Scream "Thief!" across the entire banking hall.', isOptimal: false, feedback: 'Defamation and unprofessional customer treatment.', scoreDelta: -15 },
          { letter: 'E', text: 'Lock the customer inside the teller booth and flee.', isOptimal: false, feedback: 'Illegal confinement and severe operational crisis.', scoreDelta: -25 },
        ],
      },
      {
        id: 'bq2',
        scenario: 'At the end of your shift, your physical cash drawer is short by ₦45,000 compared to the electronic core banking ledger.',
        options: [
          { letter: 'A', text: 'Immediately notify the head of operations, recount cash bundles with dual-custody verification, and pull audit transaction slips.', isOptimal: true, feedback: 'Found a misfiled ₦45k payout slip. Ledger balanced perfectly.', scoreDelta: 20 },
          { letter: 'B', text: 'Take ₦45,000 from the customer next in line when they aren\'t looking.', isOptimal: false, feedback: 'Theft on CCTV! Terminated and arrested.', scoreDelta: -35 },
          { letter: 'C', text: 'Forge an electronic adjustment entry with fake manager initials.', isOptimal: false, feedback: 'Bank fraud and forgery charges.', scoreDelta: -30 },
          { letter: 'D', text: 'Sneak out of the bank through the fire escape before close of business.', isOptimal: false, feedback: 'Absconded with unsettled ledger.', scoreDelta: -25 },
          { letter: 'E', text: 'Blame the shortage on an imaginary ghost in the banking hall.', isOptimal: false, feedback: 'Mockery of professional auditing.', scoreDelta: -15 },
        ],
      },
      {
        id: 'bq3',
        scenario: 'An elderly pensioner is being guided by a nervous stranger attempting to liquidate her entire retirement savings into an untraceable crypto wallet.',
        options: [
          { letter: 'A', text: 'Separate the pensioner gently for private consultation, verify her comprehension, and flag suspected elder financial exploitation.', isOptimal: true, feedback: 'Saved the pensioner\'s life savings from an active syndicate scam.', scoreDelta: 20 },
          { letter: 'B', text: 'Process the liquidation quickly so you can take your lunch break.', isOptimal: false, feedback: 'Vulnerable citizen ruined by fraud under your supervision.', scoreDelta: -20 },
          { letter: 'C', text: 'Tell the stranger to give you a cut of the proceeds.', isOptimal: false, feedback: 'Criminal conspiracy with scammers.', scoreDelta: -35 },
          { letter: 'D', text: 'Shout at the elderly lady for being foolish.', isOptimal: false, feedback: 'Cruel customer mistreatment.', scoreDelta: -15 },
          { letter: 'E', text: 'Call police without speaking to the pensioner first.', isOptimal: false, feedback: 'Disorderly escalation without establishing basic facts.', scoreDelta: -5 },
        ],
      },
      {
        id: 'bq4',
        scenario: 'The core banking software freezes during a nationwide network outage with 40 customers waiting in line.',
        options: [
          { letter: 'A', text: 'Address customers calmly, switch to manual contingency ticketing, offer seats and water, and update them on IT restoration ETA.', isOptimal: true, feedback: 'Maintained order and de-escalated customer frustration.', scoreDelta: 20 },
          { letter: 'B', text: 'Shout at everyone that the bank is closed and order security to push them out.', isOptimal: false, feedback: 'Viral social media PR disaster for the bank branch.', scoreDelta: -20 },
          { letter: 'C', text: 'Smash your keyboard in anger.', isOptimal: false, feedback: 'Destruction of corporate equipment.', scoreDelta: -15 },
          { letter: 'D', text: 'Hand out arbitrary cash bundles without receipts.', isOptimal: false, feedback: 'Severe untracked cash leak.', scoreDelta: -30 },
          { letter: 'E', text: 'Hide under the teller counter.', isOptimal: false, feedback: 'Bizarre and unprofessional.', scoreDelta: -15 },
        ],
      },
      {
        id: 'bq5',
        scenario: 'A branch manager pressures you to authorize an unsecured loan to his brother-in-law\'s shell business.',
        options: [
          { letter: 'A', text: 'Firmly decline citing the credit underwriting policy and report the conflict of interest through internal whistleblower channels.', isOptimal: true, feedback: 'Upheld fiduciary duty. Credit committee praised your integrity.', scoreDelta: 20 },
          { letter: 'B', text: 'Approve the loan immediately to please your boss.', isOptimal: false, feedback: 'Loan defaulted; both you and the manager faced investigation.', scoreDelta: -25 },
          { letter: 'C', text: 'Demand that the brother-in-law hire you as a consultant.', isOptimal: false, feedback: 'Corrupt self-dealing.', scoreDelta: -25 },
          { letter: 'D', text: 'Leak the manager\'s personal bank details online.', isOptimal: false, feedback: 'Violation of data privacy regulations.', scoreDelta: -20 },
          { letter: 'E', text: 'Approve double the requested amount for fun.', isOptimal: false, feedback: 'Gross financial recklessness.', scoreDelta: -30 },
        ],
      },
      {
        id: 'bq6',
        scenario: 'A counterfeit ₦1,000 banknote is detected in a deposit bundle using ultraviolet scanner.',
        options: [
          { letter: 'A', text: 'Politely inform the depositor, confiscate and stamp the counterfeit note as invalid per CBN guidelines, and file an incident form.', isOptimal: true, feedback: 'Strict adherence to CBN counterfeit currency protocols.', scoreDelta: 20 },
          { letter: 'B', text: 'Slip the fake note back into customer change for the next person.', isOptimal: false, feedback: 'Circulated counterfeit currency intentionally; arrestable offense!', scoreDelta: -30 },
          { letter: 'C', text: 'Tear up the note and eat it.', isOptimal: false, feedback: 'Destroyed evidence and showed erratic behavior.', scoreDelta: -20 },
          { letter: 'D', text: 'Accuse the customer of being an international counterfeiter publicly.', isOptimal: false, feedback: 'Unsubstantiated public defamation.', scoreDelta: -15 },
          { letter: 'E', text: 'Pretend you didn\'t notice to avoid paperwork.', isOptimal: false, feedback: 'Failed audit check.', scoreDelta: -10 },
        ],
      },
      {
        id: 'bq7',
        scenario: 'A high-profile VIP customer wants their bank statement stamped but forgot their valid identity document at home.',
        options: [
          { letter: 'A', text: 'Verify identity through biometric fingerprint reader and BVN validation on file before issuing statutory stamped documents.', isOptimal: true, feedback: 'Rigorous compliance while providing seamless customer experience.', scoreDelta: 20 },
          { letter: 'B', text: 'Print out statements for anyone who claims to be wealthy.', isOptimal: false, feedback: 'Massive breach of customer financial privacy.', scoreDelta: -25 },
          { letter: 'C', text: 'Make them wait 8 hours as punishment.', isOptimal: false, feedback: 'Lost a ₦500M corporate account.', scoreDelta: -15 },
          { letter: 'D', text: 'Sell their statement to a tabloid journalist.', isOptimal: false, feedback: 'Criminal breach of bank secrecy laws.', scoreDelta: -35 },
          { letter: 'E', text: 'Stamp an empty sheet of paper.', isOptimal: false, feedback: 'Senseless negligence.', scoreDelta: -15 },
        ],
      },
      {
        id: 'bq8',
        scenario: 'A foreign exchange arbitrage opportunity appears between official CBN rate and bureau de change market.',
        options: [
          { letter: 'A', text: 'Strictly execute customer transactions at authorized CBN rates and log statutory Form A / Form Q documentation.', isOptimal: true, feedback: 'Ensured 100% regulatory compliance and clean central bank inspection.', scoreDelta: 20 },
          { letter: 'B', text: 'Divert allocated customer forex into your personal black-market desk.', isOptimal: false, feedback: 'Forex round-tripping fraud! License revoked and imprisoned.', scoreDelta: -35 },
          { letter: 'C', text: 'Tell customers foreign currency no longer exists in Nigeria.', isOptimal: false, feedback: 'Misrepresented financial reality.', scoreDelta: -15 },
          { letter: 'D', text: 'Accept payments only in ancient cowrie shells.', isOptimal: false, feedback: 'Unacceptable absurdity.', scoreDelta: -20 },
          { letter: 'E', text: 'Burn foreign banknotes to protest inflation.', isOptimal: false, feedback: 'Destruction of legal tender.', scoreDelta: -30 },
        ],
      },
      {
        id: 'bq9',
        scenario: 'An audit team arrives unannounced from the Central Bank of Nigeria for an on-site vault inspection.',
        options: [
          { letter: 'A', text: 'Provide full access, present real-time physical vault registers, and assist inspectors with dual-control vault opening.', isOptimal: true, feedback: 'Branch scored 98% in compliance audit.', scoreDelta: 20 },
          { letter: 'B', text: 'Lock the doors and tell them everyone is on holiday.', isOptimal: false, feedback: 'Immediate suspension of banking branch license!', scoreDelta: -30 },
          { letter: 'C', text: 'Offer inspectors brown envelopes of cash.', isOptimal: false, feedback: 'Arrested on the spot for bribing federal regulators.', scoreDelta: -35 },
          { letter: 'D', text: 'Set off the emergency fire alarm to distract them.', isOptimal: false, feedback: 'False alarm felony and disruption of emergency services.', scoreDelta: -25 },
          { letter: 'E', text: 'Scramble to rewrite three months of balance sheets.', isOptimal: false, feedback: 'Caught red-handed falsifying books.', scoreDelta: -30 },
        ],
      },
      {
        id: 'bq10',
        scenario: 'A merchant customer reports that their POS terminal is taking 48 hours to settle customer payments.',
        options: [
          { letter: 'A', text: 'Check the merchant switch routing ID, initiate terminal batch reconciliation, and open a priority ticket with NIBSS.', isOptimal: true, feedback: 'Resolved within 2 hours; merchant praised prompt intervention.', scoreDelta: 20 },
          { letter: 'B', text: 'Advise the merchant to stop accepting digital payments entirely.', isOptimal: false, feedback: 'Harmful to retail commerce and bank turnover.', scoreDelta: -15 },
          { letter: 'C', text: 'Tell the merchant to buy a sledgehammer and break the terminal.', isOptimal: false, feedback: 'Unprofessional advice.', scoreDelta: -20 },
          { letter: 'D', text: 'Ignore the merchant for three weeks.', isOptimal: false, feedback: 'Merchant closed all accounts with bank.', scoreDelta: -15 },
          { letter: 'E', text: 'Blame the merchant for having too many customers.', isOptimal: false, feedback: 'Rude and anti-business.', scoreDelta: -10 },
        ],
      },
      {
        id: 'bq11',
        scenario: 'A colleague at the next counter leaves their computer terminal unlocked with customer account numbers visible.',
        options: [
          { letter: 'A', text: 'Immediately press Win+L to lock the screen, and gently remind them about data security and clean desk policy.', isOptimal: true, feedback: 'Secured customer financial privacy without causing unnecessary conflict.', scoreDelta: 20 },
          { letter: 'B', text: 'Take photos of customers\' balances and post them on Twitter.', isOptimal: false, feedback: 'Major NDPR privacy lawsuit against the bank.', scoreDelta: -30 },
          { letter: 'C', text: 'Transfer money from the open screen into your brother\'s account.', isOptimal: false, feedback: 'Electronic wire fraud; tracked by IP and arrested.', scoreDelta: -35 },
          { letter: 'D', text: 'Spill hot coffee all over their computer monitor.', isOptimal: false, feedback: 'Damaged bank property.', scoreDelta: -15 },
          { letter: 'E', text: 'Ignore it and let passersby read the data.', isOptimal: false, feedback: 'Negligence of physical security standards.', scoreDelta: -10 },
        ],
      },
      {
        id: 'bq12',
        scenario: 'You notice a recurring daily debit error of ₦2.50 across 500,000 retail accounts due to a system rounding bug.',
        options: [
          { letter: 'A', text: 'Document the mathematical rounding discrepancy, report to IT and internal audit, and ensure automated reversal to customers.', isOptimal: true, feedback: 'Fixed systemic leak of ₦1.25M daily; customer trust preserved.', scoreDelta: 20 },
          { letter: 'B', text: 'Keep quiet because "2 naira is too small for anyone to care".', isOptimal: false, feedback: 'CBN audit found the unauthorized charges; heavy punitive fines.', scoreDelta: -15 },
          { letter: 'C', text: 'Reroute the ₦2.50 rounding errors into your personal offshore account.', isOptimal: false, feedback: 'Salami-slicing financial cybercrime! Imprisoned.', scoreDelta: -35 },
          { letter: 'D', text: 'Round up to ₦25,000 per customer instead.', isOptimal: false, feedback: 'Mass customer panic and immediate protests outside bank.', scoreDelta: -30 },
          { letter: 'E', text: 'Delete all customer accounts to hide the bug.', isOptimal: false, feedback: 'Total corporate suicide.', scoreDelta: -35 },
        ],
      },
      {
        id: 'bq13',
        scenario: 'A desperate customer whose ATM card was swallowed by the machine on a Saturday evening begs you for emergency cash.',
        options: [
          { letter: 'A', text: 'Verify their identity, assist them in generating a secure cardless withdrawal code via mobile app, and reassure them.', isOptimal: true, feedback: 'Demonstrated modern banking agility and compassionate service.', scoreDelta: 20 },
          { letter: 'B', text: 'Break open the ATM with an iron rod.', isOptimal: false, feedback: 'Damaged multi-million naira ATM infrastructure.', scoreDelta: -25 },
          { letter: 'C', text: 'Tell them to sleep on the pavement until Monday.', isOptimal: false, feedback: 'Callous customer care.', scoreDelta: -10 },
          { letter: 'D', text: 'Give them the bank\'s petty cash without any receipt.', isOptimal: false, feedback: 'Unaccounted cash disbursement.', scoreDelta: -20 },
          { letter: 'E', text: 'Mock the customer for using an ATM.', isOptimal: false, feedback: 'Severe customer complaints filed.', scoreDelta: -10 },
        ],
      },
      {
        id: 'bq14',
        scenario: 'A suspicious phishing email pretending to be from the CBN Governor asks you to click a link to update banking credentials.',
        options: [
          { letter: 'A', text: 'Do not click, mark as malicious phishing, report to bank InfoSec team, and alert colleagues to remain vigilant.', isOptimal: true, feedback: 'Prevented sophisticated ransomware intrusion into bank network.', scoreDelta: 20 },
          { letter: 'B', text: 'Click the link and input your master admin password.', isOptimal: false, feedback: 'Handed network keys to cyber criminals! Complete system lockdown.', scoreDelta: -30 },
          { letter: 'C', text: 'Forward the phishing link to all bank customers.', isOptimal: false, feedback: 'Spread the attack vector across external clients.', scoreDelta: -30 },
          { letter: 'D', text: 'Reply with your bank card PIN and date of birth.', isOptimal: false, feedback: 'Compromised personal accounts.', scoreDelta: -20 },
          { letter: 'E', text: 'Print out the email and frame it on the wall.', isOptimal: false, feedback: 'Clueless response to critical cyber threat.', scoreDelta: -10 },
        ],
      },
      {
        id: 'bq15',
        scenario: 'It is Friday 5:00 PM and the bank vault door time-lock is about to engage for the weekend.',
        options: [
          { letter: 'A', text: 'Verify dual-custody cash counts, complete the vault register sign-off with the joint custodian, and seal the vault.', isOptimal: true, feedback: 'Perfect end-of-week compliance. All physical assets secured.', scoreDelta: 20 },
          { letter: 'B', text: 'Leave the vault door ajar with a broom so you don\'t have to reopen it Monday.', isOptimal: false, feedback: 'Unbelievable security failure! Armed robbers robbed vault over weekend.', scoreDelta: -35 },
          { letter: 'C', text: 'Take home two duffel bags of cash for weekend safekeeping.', isOptimal: false, feedback: 'Grand larceny! Tracked by police and jailed.', scoreDelta: -35 },
          { letter: 'D', text: 'Forget the lock combination and guess randomly.', isOptimal: false, feedback: 'Vault locked in permanent failsafe mode; expensive drill repair needed.', scoreDelta: -20 },
          { letter: 'E', text: 'Leave all tellers\' cash on top of the counter.', isOptimal: false, feedback: 'Complete violation of minimum banking security.', scoreDelta: -30 },
        ],
      },
    ];
  }

  // 3. Default Professional Questions (Aviation, Healthcare, Oil & Gas, Civil Service)
  return [
    {
      id: 'gq1',
      scenario: 'An urgent emergency protocol is triggered during your duty shift. What is your immediate course of action?',
      options: [
        { letter: 'A', text: 'Execute established emergency standard operating procedures (SOP), notify senior command, and secure human safety.', isOptimal: true, feedback: 'Handled crisis with textbook precision. Commended by safety board.', scoreDelta: 20 },
        { letter: 'B', text: 'Run out screaming into the street without alerting anyone.', isOptimal: false, feedback: 'Created mass panic and abandoned post.', scoreDelta: -20 },
        { letter: 'C', text: 'Film a TikTok video in front of the emergency.', isOptimal: false, feedback: 'Disgraceful conduct during serious hazard.', scoreDelta: -20 },
        { letter: 'D', text: 'Ignore the sirens and continue drinking tea.', isOptimal: false, feedback: 'Gross negligence of life safety.', scoreDelta: -25 },
        { letter: 'E', text: 'Mute the alarm buzzer so you can concentrate on your nap.', isOptimal: false, feedback: 'Sabotage of emergency warning systems.', scoreDelta: -30 },
      ],
    },
    {
      id: 'gq2',
      scenario: 'You observe a safety hazard that violates regulatory standards in your operational environment.',
      options: [
        { letter: 'A', text: 'Log a formal hazard report, cord off the dangerous zone, and follow up until remediation is certified.', isOptimal: true, feedback: 'Prevented potential workplace injury or catastrophe.', scoreDelta: 20 },
        { letter: 'B', text: 'Step over the hazard and assume someone else will deal with it.', isOptimal: false, feedback: 'Colleague was injured later in the day due to negligence.', scoreDelta: -15 },
        { letter: 'C', text: 'Cover the hazard with a cardboard box to hide it from inspectors.', isOptimal: false, feedback: 'Willful concealment of statutory hazard.', scoreDelta: -20 },
        { letter: 'D', text: 'Dare junior interns to walk across the hazard.', isOptimal: false, feedback: 'Reckless endangerment of colleagues.', scoreDelta: -25 },
        { letter: 'E', text: 'Paint the hazard yellow without fixing it.', isOptimal: false, feedback: 'Cosmetic fix that failed safety audit.', scoreDelta: -10 },
      ],
    },
    {
      id: 'gq3',
      scenario: 'A vital piece of diagnostic machinery begins vibrating abnormally with elevated temperature readings.',
      options: [
        { letter: 'A', text: 'Perform safe controlled shutdown, switch to auxiliary redundant unit, and dispatch licensed technician.', isOptimal: true, feedback: 'Saved ₦40M machine from catastrophic engine seizure.', scoreDelta: 20 },
        { letter: 'B', text: 'Pour a bucket of tap water onto the electrical motor.', isOptimal: false, feedback: 'Electrical fire and total destruction of equipment.', scoreDelta: -25 },
        { letter: 'C', text: 'Turn up the speed dial to see if it fixes itself.', isOptimal: false, feedback: 'Machine exploded and caused massive downtime.', scoreDelta: -30 },
        { letter: 'D', text: 'Hit the machine with a heavy steel pipe.', isOptimal: false, feedback: 'Cracked the casing and voided manufacturer warranty.', scoreDelta: -20 },
        { letter: 'E', text: 'Put on noise-cancelling headphones so you can\'t hear it.', isOptimal: false, feedback: 'Irresponsible avoidance of clear warning signs.', scoreDelta: -15 },
      ],
    },
    {
      id: 'gq4',
      scenario: 'An important client or stakeholder is furious about an unavoidable operational delay caused by bad weather.',
      options: [
        { letter: 'A', text: 'Empathize, explain the safety-first physics of the weather constraint clearly, and provide proactive rebooking/compensation options.', isOptimal: true, feedback: 'Turned a furious client into a loyal brand advocate.', scoreDelta: 20 },
        { letter: 'B', text: 'Challenge the client to a fist fight outside.', isOptimal: false, feedback: 'Physical assault and police involvement.', scoreDelta: -35 },
        { letter: 'C', text: 'Tell the client you control the weather and did it on purpose.', isOptimal: false, feedback: 'Bizarre and antagonizing behavior.', scoreDelta: -20 },
        { letter: 'D', text: 'Roll your eyes and walk away mid-sentence.', isOptimal: false, feedback: 'Gross customer disrespect.', scoreDelta: -15 },
        { letter: 'E', text: 'Give them access to a restricted danger zone to appease them.', isOptimal: false, feedback: 'Catastrophic breach of perimeter security.', scoreDelta: -30 },
      ],
    },
    {
      id: 'gq5',
      scenario: 'Your supervisor asks for a realistic progress report before an executive audit.',
      options: [
        { letter: 'A', text: 'Present transparent data, highlight completed milestones, and lay out actionable solutions for delayed items.', isOptimal: true, feedback: 'Honesty and problem-solving earned you high management praise.', scoreDelta: 20 },
        { letter: 'B', text: 'Fabricate 100% success metrics and hide all backlogs.', isOptimal: false, feedback: 'Audit caught the fabrication; severe reputational damage.', scoreDelta: -25 },
        { letter: 'C', text: 'Refuse to talk without your personal lawyer.', isOptimal: false, feedback: 'Inappropriate and adversarial.', scoreDelta: -10 },
        { letter: 'D', text: 'Burn all project documentation.', isOptimal: false, feedback: 'Destruction of corporate records.', scoreDelta: -30 },
        { letter: 'E', text: 'Blame your team members for your own unfinished tasks.', isOptimal: false, feedback: 'Toxic deflection of accountability.', scoreDelta: -20 },
      ],
    },
    {
      id: 'gq6',
      scenario: 'You are offered an unrecorded "cash gift" from a contractor seeking contract approval.',
      options: [
        { letter: 'A', text: 'Refuse firmly, document the attempted inducement, and report to the procurement ethics committee.', isOptimal: true, feedback: 'Upheld anti-corruption integrity and protected corporate procurement.', scoreDelta: 20 },
        { letter: 'B', text: 'Take the money and demand double for your friends.', isOptimal: false, feedback: 'Arrested by ICPC for extortion and bribery.', scoreDelta: -35 },
        { letter: 'C', text: 'Accept the money and buy pizza for the office.', isOptimal: false, feedback: 'Complicity in corruption.', scoreDelta: -25 },
        { letter: 'D', text: 'Put the cash in your pocket and approve a substandard bid.', isOptimal: false, feedback: 'Substandard work caused collapse of structure!', scoreDelta: -35 },
        { letter: 'E', text: 'Pretend you don\'t understand English.', isOptimal: false, feedback: 'Childish evasion.', scoreDelta: -10 },
      ],
    },
    {
      id: 'gq7',
      scenario: 'A new recruit makes an honest operational mistake during training.',
      options: [
        { letter: 'A', text: 'Correct the error together, explain the underlying rationale, and encourage them to build confidence.', isOptimal: true, feedback: 'Great mentorship! The recruit became a top performer.', scoreDelta: 20 },
        { letter: 'B', text: 'Berate the recruit until they cry.', isOptimal: false, feedback: 'Bullying reported to HR.', scoreDelta: -15 },
        { letter: 'C', text: 'Fire them on the spot without authority.', isOptimal: false, feedback: 'Overstepped legal authority.', scoreDelta: -15 },
        { letter: 'D', text: 'Ignore the mistake and let bad habits solidify.', isOptimal: false, feedback: 'Poor training discipline.', scoreDelta: -10 },
        { letter: 'E', text: 'Post their mistake on your WhatsApp status.', isOptimal: false, feedback: 'Unprofessional workplace mockery.', scoreDelta: -15 },
      ],
    },
    {
      id: 'gq8',
      scenario: 'Power supply cuts off suddenly during a critical operational process.',
      options: [
        { letter: 'A', text: 'Verify uninterrupted power supply (UPS) inverter handoff, switch to industrial backup generator, and resume operations.', isOptimal: true, feedback: 'Seamless power transition without losing any data or progress.', scoreDelta: 20 },
        { letter: 'B', text: 'Scream "NEPA UP NAIJA!" and dance.', isOptimal: false, feedback: 'Lost work progress while laughing.', scoreDelta: -10 },
        { letter: 'C', text: 'Try to connect raw electrical wires with bare hands.', isOptimal: false, feedback: 'Electrocution hazard! Hospitalized.', scoreDelta: -25 },
        { letter: 'D', text: 'Pack your bags and go home immediately.', isOptimal: false, feedback: 'Abandoned station during power transition.', scoreDelta: -15 },
        { letter: 'E', text: 'Light a wax candle next to a flammable fuel barrel.', isOptimal: false, feedback: 'Massive fire hazard! Disaster averted by colleagues.', scoreDelta: -25 },
      ],
    },
    {
      id: 'gq9',
      scenario: 'Confidential client files are left on an open table in a public hallway.',
      options: [
        { letter: 'A', text: 'Secure the files immediately, return them to the designated locked archive, and notify the compliance officer.', isOptimal: true, feedback: 'Safeguarded confidential data from unauthorized eyes.', scoreDelta: 20 },
        { letter: 'B', text: 'Read all personal secrets and gossip with colleagues.', isOptimal: false, feedback: 'Breach of confidentiality agreement.', scoreDelta: -20 },
        { letter: 'C', text: 'Throw the files out the window into the rain.', isOptimal: false, feedback: 'Destruction of client documents.', scoreDelta: -25 },
        { letter: 'D', text: 'Sell the files to competitors.', isOptimal: false, feedback: 'Industrial espionage charges.', scoreDelta: -35 },
        { letter: 'E', text: 'Use the confidential papers as origami napkins.', isOptimal: false, feedback: 'Disrespectful negligence.', scoreDelta: -15 },
      ],
    },
    {
      id: 'gq10',
      scenario: 'You are assigned a difficult task requiring knowledge of a tool you have not used before.',
      options: [
        { letter: 'A', text: 'Study the official technical documentation, seek guidance from experienced colleagues, and execute a practice run.', isOptimal: true, feedback: 'Mastered the tool rapidly and delivered successful output.', scoreDelta: 20 },
        { letter: 'B', text: 'Pretend you are an expert and press random buttons until it breaks.', isOptimal: false, feedback: 'Destroyed production project.', scoreDelta: -20 },
        { letter: 'C', text: 'Refuse to work and throw a tantrum.', isOptimal: false, feedback: 'Insubordination and poor work ethic.', scoreDelta: -15 },
        { letter: 'D', text: 'Pay an unauthorized outsider to do your job secretly.', isOptimal: false, feedback: 'Breach of security protocol.', scoreDelta: -25 },
        { letter: 'E', text: 'Claim the tool is a conspiracy.', isOptimal: false, feedback: 'Unprofessional excuses.', scoreDelta: -10 },
      ],
    },
    {
      id: 'gq11',
      scenario: 'Two colleagues are arguing loudly in a public area, disrupting workplace productivity.',
      options: [
        { letter: 'A', text: 'Intervene calmly, de-escalate the confrontation, and guide both parties to a private conference room for resolution.', isOptimal: true, feedback: 'Demonstrated exceptional emotional intelligence and team leadership.', scoreDelta: 20 },
        { letter: 'B', text: 'Take bets on who will win a boxing match.', isOptimal: false, feedback: 'Encouraging workplace violence.', scoreDelta: -20 },
        { letter: 'C', text: 'Join in and start screaming insults at both of them.', isOptimal: false, feedback: 'Worsened the confrontation.', scoreDelta: -15 },
        { letter: 'D', text: 'Throw water on both of them.', isOptimal: false, feedback: 'Escalated the physical dispute.', scoreDelta: -15 },
        { letter: 'E', text: 'Pretend nothing is happening while customers watch in shock.', isOptimal: false, feedback: 'Failure to de-escalate.', scoreDelta: -5 },
      ],
    },
    {
      id: 'gq12',
      scenario: 'You find an error in a finalized financial report that was already signed by upper management.',
      options: [
        { letter: 'A', text: 'Promptly alert the signing executive with an errata note showing the precise correction and recalculated totals.', isOptimal: true, feedback: 'Prevented misleading audited statements; executive thanked you.', scoreDelta: 20 },
        { letter: 'B', text: 'Say nothing and let the company publish incorrect data.', isOptimal: false, feedback: 'SEC audit exposed the error; company suffered stock drop.', scoreDelta: -20 },
        { letter: 'C', text: 'Blame the error on someone who resigned last month.', isOptimal: false, feedback: 'Dishonest scapegoating.', scoreDelta: -15 },
        { letter: 'D', text: 'White-out the signed document with liquid paper.', isOptimal: false, feedback: 'Defacing legal records.', scoreDelta: -20 },
        { letter: 'E', text: 'Blackmail the executive with the error.', isOptimal: false, feedback: 'Criminal extortion.', scoreDelta: -35 },
      ],
    },
    {
      id: 'gq13',
      scenario: 'A major storm causes transport delays, making several key staff members late for their shift.',
      options: [
        { letter: 'A', text: 'Reorganize on-site team priorities, cover critical stations, and keep operations running smoothly until relief arrives.', isOptimal: true, feedback: 'Resourceful shift management! Commended for adaptability.', scoreDelta: 20 },
        { letter: 'B', text: 'Shut down all operations and leave immediately.', isOptimal: false, feedback: 'Unsanctioned operational collapse.', scoreDelta: -25 },
        { letter: 'C', text: 'Write reprimand letters to late staff without checking road conditions.', isOptimal: false, feedback: 'Unfair and demoralizing management.', scoreDelta: -10 },
        { letter: 'D', text: 'Lock the doors so late staff cannot enter when they arrive.', isOptimal: false, feedback: 'Petty and counterproductive.', scoreDelta: -15 },
        { letter: 'E', text: 'Sit and complain continuously for 4 hours.', isOptimal: false, feedback: 'Unproductive negativity.', scoreDelta: -10 },
      ],
    },
    {
      id: 'gq14',
      scenario: 'You receive feedback from quality control highlighting three areas where your execution can be enhanced.',
      options: [
        { letter: 'A', text: 'Review the critique objectively, formulate an improvement checklist, and implement changes in your next batch.', isOptimal: true, feedback: 'Turned feedback into rapid professional advancement.', scoreDelta: 20 },
        { letter: 'B', text: 'Write a 20-page complaint claiming quality control has a personal vendetta.', isOptimal: false, feedback: 'Defensive and resistant to constructive growth.', scoreDelta: -15 },
        { letter: 'C', text: 'Intentionally worsen the quality of your work out of spite.', isOptimal: false, feedback: 'Deliberate sabotage.', scoreDelta: -30 },
        { letter: 'D', text: 'Block the quality inspector on WhatsApp.', isOptimal: false, feedback: 'Childish behavior.', scoreDelta: -10 },
        { letter: 'E', text: 'Claim you never received the feedback report.', isOptimal: false, feedback: 'Feigned ignorance.', scoreDelta: -10 },
      ],
    },
    {
      id: 'gq15',
      scenario: 'The end of your shift arrives with your station completely organized, all logs verified, and relief staff present.',
      options: [
        { letter: 'A', text: 'Conduct thorough verbal and written shift handover, brief relief staff on pending matters, clock out, and depart.', isOptimal: true, feedback: 'Flawless shift completion! Full shift stipend and performance bonus awarded.', scoreDelta: 20 },
        { letter: 'B', text: 'Sprint out the door without saying a word to the incoming shift.', isOptimal: false, feedback: 'Incoming shift missed vital operational status.', scoreDelta: -10 },
        { letter: 'C', text: 'Hide the logbook in the ceiling tile as a joke.', isOptimal: false, feedback: 'Disrupted subsequent shift.', scoreDelta: -15 },
        { letter: 'D', text: 'Refuse to leave and demand to live in the office.', isOptimal: false, feedback: 'Security called to escort you off premises.', scoreDelta: -15 },
        { letter: 'E', text: 'Clock out the next 5 days in advance.', isOptimal: false, feedback: 'Time-theft attempt flagged by HR.', scoreDelta: -25 },
      ],
    },
  ];
}
