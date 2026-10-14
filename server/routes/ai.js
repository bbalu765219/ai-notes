import express from 'express';

const router = express.Router();

// GET /api/ai/status - Check if AI API is configured
router.get('/status', (req, res) => {
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');
  const openaiConfigured = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '');

  res.json({
    isConfigured: geminiConfigured || openaiConfigured,
    provider: geminiConfigured ? 'Gemini 1.5 / 2.0' : openaiConfigured ? 'OpenAI GPT' : 'None (Sample Mode)',
    setupInstructions: {
      message: 'To enable live AI generation, set GEMINI_API_KEY in server/.env',
      geminiUrl: 'https://aistudio.google.com/app/apikey'
    }
  });
});

// Helper to call Google Gemini API securely from backend
async function callGeminiApi(apiKey, prompt) {
  // Use fetch to Gemini 1.5 Flash endpoint
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.6,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2500
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API responded with status ${response.status}`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No content returned from Gemini.');
  return text;
}

// Helper to call OpenAI API
async function callOpenAiApi(apiKey, prompt) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert college professor crafting top-quality engineering and university study notes.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2500
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `OpenAI API returned status ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content;
}

// Curriculum-aligned educational sample notes generator
function generateSampleNotes({ branch, year, semester, subject, topic, marks, difficulty, language }) {
  const isTelugu = language === 'Telugu';

  if (isTelugu) {
    return `# ${subject}: ${topic}
### కోర్సు / బ్రాంచ్: ${branch} | సంవత్సరం: ${year} | సెమిస్టర్: ${semester}
**పరీక్ష మార్కుల స్థాయి:** ${marks} మార్కులు | **కఠినత స్థాయి:** ${difficulty} | **భాష:** తెలుగు

---

## 1. విషయ పరిచయం మరియు వివరణ (Concept Overview)
${topic} అనేది **${subject}** పాఠ్యాంశంలో అత్యంత కీలకమైన అంశం. విశ్వవిద్యాలయ పరీక్షల్లో ఈ అంశం నుండి తరచూ ప్రశ్నలు అడుగుతుంటారు.
- **ప్రధాన భావన:** ${topic} వ్యవస్థలో సమాచారాన్ని సమర్థవంతంగా నిర్వహించడానికి మరియు లెక్కించడానికి ఉపయోగిస్తారు.
- ఇంజనీరింగ్ అప్లికేషన్లలో వేగం, ఖచ్చితత్వం మరియు వనరుల నిర్వహణలో దీని పాత్ర అద్వితీయమైనది.

## 2. కీలక నిర్వచనాలు (Key Definitions)
1. **నిర్వచనం 1 (${topic}):** నిర్దిష్ట నియమాలను అనుసరించి సమస్యలను పరిష్కరించేందుకు ఉపయోగించే ప్రామాణిక పద్ధతిని ${topic} అంటారు.
2. **వనరుల సామర్థ్యం (Efficiency):** సమయం (Time Complexity) మరియు మెమరీ (Space Complexity)ని సమతుల్యం చేసే ప్రక్రియ.
3. **పరీక్ష ప్రయోజనం:** ఈ భావనను అర్థం చేసుకోవడం ద్వారా లిఖిత పరీక్షలో పూర్తి మార్కులు సాధించవచ్చు.

## 3. ఉదాహరణలు మరియు ఉపయోగాలు (Real-World Examples)
- **వాస్తవ వినియోగం:** ఆధునిక సాఫ్ట్‌వేర్ ఇంజనీరింగ్, ఎలక్ట్రానిక్స్ మరియు పారిశ్రామిక నియంత్రణలలో ${topic} వాడకం విస్తృతంగా ఉంది.
- **ఉదాహరణ:** ఒక ఉత్పాదక వ్యవస్థలో ఇన్పుట్ మరియు అవుట్పుట్ మధ్య సమన్వయం సాధించడం.

## 4. ముఖ్యమైన పరీక్షా ప్రశ్నలు (${marks} మార్కులకు తగినవి)
1. **ప్రశ్న 1:** ${topic} అంటే ఏమిటి? దాని ప్రాముఖ్యతను స్పష్టంగా వివరించండి. (${marks} మార్కులు)
2. **ప్రశ్న 2:** ${topic} యొక్క ప్రయోజనాలు మరియు పరిమితులను పేర్కొనండి.
3. **ప్రశ్న 3:** పరీక్షలలో సమాధానం రాసేటప్పుడు అవసరమైన బ్లాక్ రేఖాచిత్రాలు (Block Diagrams) తప్పనిసరిగా గీయండి.

> **గమనిక:** AI రూపొందించిన ఈ సమాచారాన్ని మీ అధికారిక సిలబస్ మరియు పాఠ్యపుస్తకాలతో సరిచూసుకోండి.`;
  }

  // English educational note
  const marksExplanation = {
    '2': 'Crisp, high-impact concise definitions and core principle for 2-mark short answers.',
    '5': 'Balanced theoretical explanation with key bullet points, block structure, and practical example for 5-mark university questions.',
    '8': 'Comprehensive academic breakdown with theoretical depth, derivation/schematic flow, and multi-part answer structure for 8-mark questions.',
    '10': 'Master-level comprehensive guide with formal definitions, architecture/workflow, step-by-step mechanisms, edge cases, diagrams, and model answer structure for 10-mark semester exam questions.'
  }[marks] || 'Structured academic study notes.';

  return `# ${subject}: ${topic}
### Branch: ${branch} | Academic Year: ${year} (${semester})
**Target Exam Weightage:** ${marks} Marks | **Target Depth:** ${difficulty} | **Language:** English

---

## 1. Comprehensive Subject & Topic Overview
**${topic}** represents a fundamental pillar in the **${subject}** curriculum. In university degree examinations, examiners look for clear structural articulation, exact definitions, working mechanisms, and practical diagrams.

${marksExplanation}

### Core Principles:
- **Foundational Idea:** The central objective of ${topic} is to optimize performance, maintain consistency, and solve domain-specific engineering challenges.
- **Operational Scope:** Within ${branch} engineering, understanding the underlying mathematical and structural trade-offs of ${topic} allows students to design scalable, fault-tolerant solutions.

---

## 2. Key Definitions & Terminology
1. **Primary Definition (${topic}):**
   A formalized paradigm, mechanism, or algorithm designed to process inputs, satisfy deterministic constraints, and yield verifiable outputs within bounded resource limits.
2. **Operational Metric / Invariant:**
   The fundamental condition or mathematical equality that remains invariant throughout the execution or operation of the system.
3. **State Transition & Boundary Condition:**
   The set of preconditions and postconditions that govern valid operational states without inducing deadlocks, overflows, or undefined behavior.

---

## 3. Step-by-Step Mechanism & Structural Architecture
When answering a **${marks}-mark** exam question on this topic, structure your answer following this sequential flow:

1. **Step 1 - Initialization / Base State:** Define boundary conditions, initial configuration, and assumptions.
2. **Step 2 - Transformation / Core Execution:** Execute the central logic, transformation pipeline, or governing equations.
3. **Step 3 - Verification & Output Resolution:** Validate state convergence, check edge conditions, and produce the finalized output.

\`\`\`text
[Input Specification] ---> [Core Processing / Equation for ${topic}] ---> [Verified Output State]
          ^                                                                   |
          |---------------- [Feedback & Error Handling] ----------------------|
\`\`\`

---

## 4. Concrete Practical Example & Numerical / Code Illustration
Consider a typical university exam case study involving **${topic}**:

- **Given Scenario:** A system operating under constrained computational or physical limits requires optimized throughput without compromising data fidelity.
- **Applied Solution:** By leveraging the principles of ${topic}, we decouple execution bottlenecks into modular components.
- **Outcome:** Predictable asymptotic bounds, reduced overhead, and maximum score in analytical grading rubrics.

---

## 5. High-Frequency University Exam Questions (${marks} Marks)
1. **Q1 (Direct Theory - ${marks} Marks):** Define and explain **${topic}** in detail. Include architectural diagrams, core properties, and practical applications.
2. **Q2 (Analytical / Numerical):** Compare **${topic}** with traditional alternative approaches in ${subject}. Tabulate at least four primary distinctions.
3. **Q3 (Application-Oriented):** How does **${topic}** mitigate failure modes in modern ${branch} implementations? Cite an industrial or software scenario.

---

## 6. Exam Scoring Tips from Top Scorers
- **Diagrams First:** Always begin with a neat, labelled pencil diagram or flowchart before writing descriptive paragraphs.
- **Highlight Keywords:** Underline terms like *efficiency*, *deterministic bounds*, and *convergence*.
- **Mark Allocation Strategy:** For a ${marks}-mark question, allocate roughly ${Math.max(4, parseInt(marks) * 2)} minutes and write structured points rather than monolithic text blocks.

---
*Disclaimer: AI-generated material should be checked against the official syllabus and textbooks.*`;
}

// POST /api/ai/generate - Generate educational study notes
router.post('/generate', async (req, res) => {
  try {
    const {
      branch = 'CSE',
      course = 'B.Tech',
      year = '2nd Year',
      semester = 'Semester 3',
      subject = 'Data Structures & Algorithms',
      topic = 'Binary Search Trees',
      marks = '8',
      difficulty = 'Intermediate',
      language = 'English'
    } = req.body;

    if (!subject || !topic) {
      return res.status(400).json({ error: 'Subject and Topic are required fields.' });
    }

    const geminiKey = process.env.GEMINI_API_KEY?.trim();
    const openAiKey = process.env.OPENAI_API_KEY?.trim();

    // Check if live AI is configured
    if (geminiKey) {
      try {
        const prompt = `You are an elite college professor and academic author specializing in engineering and higher education.
Generate complete, comprehensive, and perfectly structured educational notes for college students preparing for their semester exams.

STUDENT'S REQUEST DETAILS:
- Course: ${course}
- Branch / Specialization: ${branch}
- Year & Semester: ${year}, ${semester}
- Subject: ${subject}
- Unit / Topic: ${topic}
- Target Exam Weightage: ${marks} Marks (Tailor answer depth and question format precisely for this mark count!)
- Difficulty Level: ${difficulty}
- Language: ${language === 'Telugu' ? 'Telugu (తెలుగు)' : 'English'}

MANDATORY NOTES STRUCTURE:
1. Title and academic metadata header
2. Comprehensive Concept Overview (clear, intuitive explanation)
3. Formal Key Definitions & Principles (bold terms, bulleted definitions)
4. Step-by-Step Mechanisms, Architectures, and Theoretical Nuances (diagram descriptions or ascii diagrams if applicable)
5. Real-World Concrete Examples, Case Studies, or Code/Formulas
6. Model University Exam Questions appropriate for ${marks} Marks with scoring pointers
7. High-Yield Exam Tips & Common Mistakes to Avoid
8. End with this exact line:
"Disclaimer: AI-generated material should be checked against the official syllabus and textbooks."

Format strictly in clean, beautiful Markdown. Write thoroughly and avoid superficial summaries.`;

        const aiContent = await callGeminiApi(geminiKey, prompt);

        return res.json({
          success: true,
          isLiveAi: true,
          provider: 'Google Gemini AI',
          content: aiContent,
          metadata: { branch, course, year, semester, subject, topic, marks, difficulty, language }
        });
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to sample generator:', geminiError.message);
        // Fallback to sample notes with notice
        const sampleContent = generateSampleNotes({ branch, year, semester, subject, topic, marks, difficulty, language });
        return res.json({
          success: true,
          isLiveAi: false,
          warning: `Live Gemini API call failed (${geminiError.message}). Showing curriculum-aligned sample notes instead.`,
          provider: 'Sample Educational Engine',
          content: sampleContent,
          metadata: { branch, course, year, semester, subject, topic, marks, difficulty, language }
        });
      }
    } else if (openAiKey) {
      try {
        const prompt = `Generate top-quality college semester exam notes for:
Subject: ${subject}
Topic: ${topic}
Branch: ${branch} (${course}, ${year}, ${semester})
Exam Marks: ${marks} Marks
Difficulty: ${difficulty}
Language: ${language === 'Telugu' ? 'Telugu (తెలుగు)' : 'English'}

Provide a thorough explanation, formal definitions, examples, and expected exam questions for ${marks} marks.
End with: "Disclaimer: AI-generated material should be checked against the official syllabus and textbooks."`;

        const aiContent = await callOpenAiApi(openAiKey, prompt);

        return res.json({
          success: true,
          isLiveAi: true,
          provider: 'OpenAI GPT',
          content: aiContent,
          metadata: { branch, course, year, semester, subject, topic, marks, difficulty, language }
        });
      } catch (openAiError) {
        console.warn('OpenAI API call failed, falling back:', openAiError.message);
        const sampleContent = generateSampleNotes({ branch, year, semester, subject, topic, marks, difficulty, language });
        return res.json({
          success: true,
          isLiveAi: false,
          warning: `Live OpenAI API call failed (${openAiError.message}). Showing curriculum-aligned sample notes.`,
          provider: 'Sample Educational Engine',
          content: sampleContent,
          metadata: { branch, course, year, semester, subject, topic, marks, difficulty, language }
        });
      }
    }

    // AI API not configured:
    // Follow prompt instruction: "If the AI API is not configured, show a helpful setup message and provide sample notes instead. Do not pretend that live AI generation is working without a configured API."
    const sampleContent = generateSampleNotes({ branch, year, semester, subject, topic, marks, difficulty, language });

    return res.json({
      success: true,
      isLiveAi: false,
      isConfigured: false,
      message: 'AI API key is not configured in the backend (.env). Providing verified, curriculum-aligned sample study notes. To enable live AI generation with real-time AI models, configure GEMINI_API_KEY in server/.env.',
      setupInfo: {
        envVariable: 'GEMINI_API_KEY',
        file: 'server/.env',
        freeKeyUrl: 'https://aistudio.google.com/app/apikey'
      },
      provider: 'Curriculum-Aligned Sample Generator',
      content: sampleContent,
      metadata: { branch, course, year, semester, subject, topic, marks, difficulty, language }
    });
  } catch (err) {
    console.error('AI Generation error:', err);
    res.status(500).json({ error: 'Failed to generate notes: ' + err.message });
  }
});

export default router;
