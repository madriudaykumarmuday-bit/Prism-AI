import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Loader from './Loader';
import { analyzeMindset, groundedSearch, generateBranchGuide } from '../services/geminiService';
import { MindsetAnalysis, GroundingSource, BranchGuide } from '../types';
import { Icon } from './Icon';

// Declare jspdf which is loaded from a script tag in index.html
declare var jspdf: any;

interface MindsetAnalyzerProps {
  isOpen: boolean;
  onClose: () => void;
}

type ViewState = 'domain_selection' | 'branch_selection' | 'taking_quiz' | 'analyzing' | 'results' | 'web_search';

const quizData = {
  "CSE": [
    { question: "When optimizing code, what do you prioritize?", options: ["Readability and maintainability", "Raw execution speed", "Minimizing memory usage", "Algorithmic elegance and simplicity"] },
    { question: "You need to implement a new feature. What's your first step?", options: ["Write the user story and define acceptance criteria", "Design the API endpoints and data schema", "Build the UI components first", "Spike a proof-of-concept to validate the approach"] },
    { question: "How do you approach learning a new programming language?", options: ["Read the official documentation thoroughly", "Build a small, complete project from scratch", "Follow a guided tutorial series", "Contribute to an open-source project using it"] },
    { question: "What aspect of a large software system interests you most?", options: ["The user interface and experience", "The database architecture and data flow", "The deployment and scaling infrastructure (CI/CD, Kubernetes)", "The core business logic and algorithms"] },
    { question: "A critical bug is reported in production. What's your immediate priority?", options: ["Writing a failing test case to replicate it", "Patching it live as quickly as possible", "Informing stakeholders about the potential impact", "Performing a root cause analysis before touching code"] },
  ],
  "AI": [
    { question: "When starting a new ML project, what is the most critical first step?", options: ["Choosing the most advanced model architecture", "Extensive exploratory data analysis (EDA)", "Setting up a robust data pipeline", "Defining the business problem and success metrics"] },
    { question: "Your model's performance is plateauing. What's your next move?", options: ["Spend more time on feature engineering", "Try a completely different type of model", "Collect more (or better) data", "Fine-tune hyperparameters for another 12 hours"] },
    { question: "How do you view the importance of model explainability (XAI)?", options: ["It's a top priority for building trust and debugging", "It's a 'nice-to-have' but performance is more important", "It depends entirely on the use case (e.g., medical vs. recommendation)", "It's mainly for academic purposes"] },
    { question: "What is your primary tool for debugging a neural network?", options: ["Visualizing activations and gradients", "Printing tensor shapes and values", "Using a formal debugger (e.g., pdb)", "Analyzing the loss curve and metrics over time"] },
    { question: "You have a small, high-quality dataset. Which approach do you favor?", options: ["Transfer learning from a large pre-trained model", "Complex data augmentation techniques", "Using a simpler, less data-hungry model", "Trying to gather more data, even if lower quality"] },
  ],
  "DS": [
    { question: "You're given a new dataset. What's your immediate action?", options: ["Generate summary statistics (mean, median, std dev)", "Create visualizations to spot trends and outliers", "Check for missing values and data quality issues", "Formulate a hypothesis to test with the data"] },
    { question: "How do you communicate your findings to non-technical stakeholders?", options: ["A detailed Jupyter notebook with all the code", "An interactive dashboard (e.g., Tableau, Power BI)", "A concise slide deck with key charts and insights", "A formal written report with statistical proofs"] },
    { question: "What's more important for a business-facing data science project?", options: ["A model with 99% accuracy that's hard to interpret", "A model with 95% accuracy that's easily explainable", "A beautifully designed and compelling data visualization", "A robust data pipeline that ensures data freshness"] },
    { question: "Which statement best describes your approach to data?", options: ["'The data will speak for itself'", "'All models are wrong, but some are useful'", "'Without data, you're just another person with an opinion'", "'The goal is to turn data into information, and information into insight'"] },
    { question: "The business wants a predictive model, but the data quality is poor. You...", options: ["Build the best model possible and highlight the data caveats", "Refuse to build a model until the data collection process is fixed", "Focus on descriptive analytics to provide value first", "Create a data cleaning pipeline as the main project"] },
  ],
   "Cybersecurity": [
    { question: "What does the 'CIA' triad stand for in information security?", options: ["Confidentiality, Integrity, Availability", "Communication, Integration, Authorization", "Control, Investigate, Audit", "Cyber, Intelligence, Agency"] },
    { question: "A phishing attack is an attempt to...", options: ["Overload a server with traffic", "Steal sensitive information like passwords and credit card numbers", "Encrypt a user's files and demand a ransom", "Physically break into a facility"] },
    { question: "Which of the following is the best way to protect against malware?", options: ["Using a strong, unique password", "Disabling your firewall", "Regularly updating your antivirus software and operating system", "Only visiting websites you know"] },
    { question: "What is a 'Zero-Day' vulnerability?", options: ["A vulnerability that has been known for less than 24 hours", "A flaw in software that is unknown to the vendor and has no patch", "A vulnerability that only affects systems on their first day of use", "A security flaw that is easy to exploit"] },
    { question: "Multi-Factor Authentication (MFA) adds a layer of security by requiring...", options: ["A longer, more complex password", "The user to solve a puzzle", "Something you know, something you have, or something you are", "Answering a security question"] },
  ],
  "Cloud Computing": [
    { question: "Which cloud service model provides virtualized computing resources over the internet (e.g., VMs, storage, networks)?", options: ["SaaS (Software as a Service)", "PaaS (Platform as a Service)", "IaaS (Infrastructure as a Service)", "FaaS (Function as a Service)"] },
    { question: "Amazon Web Services (AWS), Microsoft Azure, and Google Cloud Platform (GCP) are examples of...", options: ["Private Clouds", "Hybrid Clouds", "Public Clouds", "Community Clouds"] },
    { question: "What is the primary advantage of 'auto-scaling' in the cloud?", options: ["It reduces the initial cost of setup", "It automatically adjusts capacity to maintain performance and minimize cost", "It encrypts all data automatically", "It provides a user-friendly dashboard"] },
    { question: "'Serverless computing' means...", options: ["You don't need servers to run a website", "The cloud provider manages the servers, and you only pay for execution time", "Your code runs directly on the client's browser", "There is no physical hardware involved"] },
    { question: "What is a 'Virtual Private Cloud' (VPC)?", options: ["A cloud that is open to the public", "A logically isolated section of a public cloud where you can launch resources", "A physical data center owned by your company", "A type of cloud storage"] },
  ],
  "UI/UX Design": [
    { question: "What is the primary goal of User Experience (UX) design?", options: ["To make the product look visually appealing", "To enhance user satisfaction by improving usability, accessibility, and pleasure in the interaction", "To write clean and efficient code for the user interface", "To create a detailed style guide"] },
    { question: "'A/B Testing' is a method used to...", options: ["Compare two versions of a web page or app to see which one performs better", "Test the backend and frontend of an application", "Check for accessibility compliance", "Ensure the design looks good on both Android and iOS"] },
    { question: "In design, what does the term 'heuristic evaluation' refer to?", options: ["A usability inspection method where experts judge an interface against recognized usability principles", "User testing with a large group of people", "Creating a customer journey map", "A final check of the visual design before launch"] },
    { question: "What is the purpose of creating user personas?", options: ["To have fictional characters for a story", "To replace the need for real user testing", "To create reliable and realistic representations of your key audience segments", "To decide on the color palette for the application"] },
    { question: "The 'F-Shaped Pattern' in user reading behavior on the web suggests that...", options: ["Users read every word on the page", "Users' eyes scan in a pattern that resembles the letter F", "Users prefer designs with a lot of text", "Users find content in the footer first"] },
  ],
  "ECE": [
    { question: "When designing a circuit, what is your main concern?", options: ["Minimizing power consumption", "Maximizing processing speed", "Ensuring signal integrity", "Reducing the physical footprint (size)"] },
    { question: "You're debugging a hardware/software interface. Where do you start?", options: ["With an oscilloscope on the physical pins", "In the driver-level software", "By reviewing the component's datasheet again", "By simulating the interaction in a tool like ModelSim"] },
    { question: "Which programming language are you most comfortable with for embedded systems?", options: ["Bare-metal C", "C++ with object-oriented principles", "MicroPython/CircuitPython for rapid prototyping", "VHDL/Verilog for FPGA development"] },
    { question: "What's your favorite part of an electronics project?", options: ["The initial schematic design and simulation", "The PCB layout and routing puzzle", "Soldering the components and initial power-on", "Writing the firmware that brings it to life"] },
    { question: "You need to choose a microcontroller. What's the deciding factor?", options: ["The richness of its peripheral set (ADC, PWM, I2C)", "Ultra-low power consumption", "Availability of a good SDK and dev tools", "Raw processing power (clock speed, core type)"] },
  ],
  "EEE": [
    { question: "What aspect of power systems fascinates you the most?", options: ["Renewable energy integration and grid stability", "High-voltage transmission and protection schemes", "Power electronics and motor drives", "Smart grid technologies and demand-side management"] },
    { question: "You're designing a control system. What is your primary goal?", options: ["Fastest possible response time", "Maximum stability and robustness to disturbances", "Zero steady-state error", "Minimizing energy usage"] },
    { question: "When working with electrical machinery, what is most important?", options: ["Efficiency and performance calculations", "Safety protocols and procedures", "The underlying electromagnetic principles", "The control and automation aspects"] },
    { question: "Which software tool is most indispensable to your work?", options: ["MATLAB/Simulink for simulation", "A SPICE-based circuit simulator (e.g., LTspice)", "An IDE for programming microcontrollers", "Power system analysis software (e.g., ETAP)"] },
    { question: "When analyzing a power grid, what problem is most compelling?", options: ["Solving load flow equations", "Transient stability analysis after a fault", "Economic dispatch and unit commitment", "Harmonic analysis and power quality"] },
  ],
  "CIVIL": [
    { question: "What is the most critical factor in the design of a large structure?", options: ["The properties of the materials used", "The accuracy of the load calculations", "The geotechnical survey of the site", "Compliance with all building codes and standards"] },
    { question: "A construction project is behind schedule. What's your first action?", options: ["Authorize overtime for the crews", "Re-evaluate the critical path and re-allocate resources", "Negotiate a new deadline with the client", "Look for opportunities to use pre-fabricated components"] },
    { question: "Which technology has the most potential to transform civil engineering?", options: ["Building Information Modeling (BIM)", "Drones for surveying and inspection", "New, sustainable building materials", "AI for generative design and optimization"] },
    { question: "What do you consider the biggest challenge in your field?", options: ["Ensuring public safety above all else", "Balancing project costs with quality and longevity", "Minimizing environmental impact", "Adapting infrastructure for climate change"] },
    { question: "When choosing a material, what's more important: sustainability or initial cost?", options: ["Lifecycle cost, including maintenance and sustainability, is key", "Initial cost is almost always the deciding factor", "Sustainability, even if it costs more upfront", "It depends entirely on the client's priorities"] },
  ],
  "MECH": [
    { question: "When designing a mechanical part, what is your starting point?", options: ["A series of hand-drawn sketches", "A 3D CAD model", "A set of mathematical equations governing the physics", "Researching existing designs and patents"] },
    { question: "Which type of analysis is most crucial for your work?", options: ["Finite Element Analysis (FEA) for stress and strain", "Computational Fluid Dynamics (CFD) for fluid flow", "Thermodynamic analysis for heat transfer", "Kinematic analysis for motion and linkages"] },
    { question: "You need to select a material. What's the deciding factor?", options: ["Strength-to-weight ratio", "Cost and manufacturability", "Resistance to corrosion or fatigue", "Thermal properties"] },
    { question: "What is the most satisfying part of the engineering process for you?", options: ["The creativity of the initial design phase", "The precision of the simulation and analysis", "The hands-on process of prototyping and manufacturing", "Seeing the final product perform as designed"] },
    { question: "How do you approach 'Design for Manufacturability' (DFM)?", options: ["It's a primary constraint from the very beginning", "It's something to optimize after the core design is proven", "I consult with manufacturing engineers throughout the process", "I rely on my experience of what's possible to make"] },
  ],
  "B.Pharm": [
    { question: "What aspect of pharmacy practice is most appealing to you?", options: ["Direct patient counseling and interaction", "The science of drug formulation and development", "Managing the business and operations of a pharmacy", "Working in a hospital setting with a clinical team"] },
    { question: "A patient questions the side effects of a new medication. You...", options: ["Provide a detailed, technical explanation", "Use simple analogies to explain the risk vs. benefit", "Give them the printed patient information leaflet", "Reassure them and suggest they speak with their doctor"] },
    { question: "How do you stay updated with new drugs and treatment guidelines?", options: ["Attending seminars and continuing education programs", "Reading medical and pharmaceutical journals regularly", "Relying on information from pharmaceutical representatives", "Learning from senior colleagues and peers"] },
    { question: "What is the most critical skill for a pharmacist?", options: ["Meticulous attention to detail", "Empathetic communication skills", "Strong business acumen", "In-depth pharmacological knowledge"] },
    { question: "You notice a potential prescription error from a doctor. What's your first step?", options: ["Dispense the medication as written", "Refuse to fill the prescription", "Contact the doctor directly to clarify", "Ask the patient for more information about their condition"] },
  ],
  "D.Pharm": [
    { question: "What do you enjoy most about working in a pharmacy?", options: ["Organizing and managing inventory", "Assisting the pharmacist with dispensing", "Interacting with customers and helping them find products", "The structured and process-oriented nature of the work"] },
    { question: "A customer asks for advice on a minor ailment. You...", options: ["Give them your best personal advice", "Immediately refer them to the pharmacist", "Show them the relevant section of over-the-counter products", "Tell them they must see a doctor"] },
    { question: "When handling prescriptions, what is your top priority?", options: ["Speed and efficiency", "Accuracy in reading and entering data", "Verifying patient information", "Following all steps of the procedure exactly"] },
    { question: "How do you handle a situation where you are unsure about a task?", options: ["Guess the best course of action", "Wait until someone notices you need help", "Ask the pharmacist for clear instructions", "Look up the procedure in a manual"] },
    { question: "What quality is most important for a pharmacy technician?", options: ["Friendliness", "Reliability", "Speed", "Technical knowledge"] },
  ],
  "Medical Coding": [
    { question: "What is the most critical aspect of medical coding?", options: ["Speed of code entry", "Memorizing all the codes", "Accuracy and attention to detail", "Using the latest software"] },
    { question: "When you encounter a physician's note that is ambiguous or incomplete, what is your first step?", options: ["Make your best guess based on the available information", "Use a generic, unspecified code", "Query the physician for clarification", "Ask a fellow coder for their opinion"] },
    { question: "Which code set is used for reporting diagnoses?", options: ["CPT (Current Procedural Terminology)", "HCPCS Level II", "ICD-10-CM (International Classification of Diseases)", "NDC (National Drug Code)"] },
    { question: "How do you approach learning new coding guidelines or updates (like the yearly ICD-10 updates)?", options: ["I wait until I encounter a case that requires the new code", "I read the official updates from CMS and AMA thoroughly", "I rely on my coding software to handle the updates automatically", "I attend a summary webinar or workshop"] },
    { question: "You are coding a complex surgical procedure. What is your primary reference?", options: ["A quick Google search", "The physician's brief description", "The detailed operative report", "The hospital's billing department"] },
  ],
  "Nursing": [
    { question: "What are the 'Five Rights' of medication administration?", options: ["Right Patient, Right Drug, Right Dose, Right Route, Right Time", "Right Doctor, Right Nurse, Right Room, Right Bed, Right Chart", "Right Diagnosis, Right Treatment, Right Outcome, Right Cost, Right Follow-up", "Right Pharmacy, Right Manufacturer, Right Package, Right Color, Right Shape"] },
    { question: "When assessing a patient's pain, which method is considered the most reliable?", options: ["The nurse's observation of the patient's behavior", "The patient's self-report of pain", "The vital signs (heart rate, blood pressure)", "The type of injury or surgery"] },
    { question: "A patient's blood pressure is 150/95 mmHg. This is considered...", options: ["Hypotension (low blood pressure)", "Normal blood pressure", "Hypertension (high blood pressure)", "A medical emergency requiring immediate CPR"] },
    { question: "What is the primary purpose of using the SBAR technique (Situation, Background, Assessment, Recommendation)?", options: ["To document patient history", "For standardized and effective communication between healthcare professionals", "To calculate medication dosages", "To plan daily patient care"] },
    { question: "A patient develops a red, itchy rash after receiving a new antibiotic. This is likely a sign of...", options: ["A therapeutic effect", "An allergic reaction", "A common, expected side effect", "An infection at the IV site"] },
  ],
  "Pharmacology": [
    { question: "Pharmacokinetics is the study of...", options: ["How a drug affects the body", "How the body absorbs, distributes, metabolizes, and excretes a drug", "The chemical structure of a drug", "The toxic effects of a drug"] },
    { question: "The 'first-pass effect' primarily occurs in which organ, significantly reducing the bioavailability of oral drugs?", options: ["Kidneys", "Lungs", "Liver", "Brain"] },
    { question: "A drug that binds to a receptor and activates it, producing a response, is called an...", options: ["Antagonist", "Agonist", "Inhibitor", "Inducer"] },
    { question: "Warfarin is an anticoagulant that works by inhibiting the synthesis of Vitamin K-dependent clotting factors. What is its main therapeutic use?", options: ["To treat bacterial infections", "To prevent blood clots", "To lower cholesterol", "To relieve pain"] },
    { question: "Which class of drugs is commonly used to treat hypertension by blocking the conversion of angiotensin I to angiotensin II?", options: ["Beta-blockers", "Calcium channel blockers", "Diuretics", "ACE inhibitors"] },
  ],
  "Senior Officer (Group A)": [
    { question: "What is the primary role of a top-level civil servant?", options: ["Strict enforcement of existing laws", "Effective implementation of government policies", "Formulation of new, innovative public policies", "Maintaining strong relationships with political leaders"] },
    { question: "You face a complex public issue with conflicting stakeholder interests. You prioritize...", options: ["The solution that benefits the most people", "The solution that aligns with long-term strategic goals", "A compromise that all parties can agree to", "The solution that is most legally and procedurally correct"] },
    { question: "How do you view public criticism of your department's work?", options: ["As a valuable source of feedback for improvement", "As an unavoidable part of public service", "As a political attack that must be defended against", "As a sign that communication needs to be improved"] },
    { question: "When making a critical decision, you rely most on...", options: ["Data analysis and expert reports", "Your own experience and intuition", "Precedent and established procedures", "Consultation with your team and superiors"] },
    { question: "What leadership style is most effective in a bureaucratic setting?", options: ["Authoritative and decisive", "Collaborative and consensus-building", "Transformational and inspiring", "Delegative and hands-off"] },
  ],
  "Mid-level Officer (Group B)": [
    { question: "What is the most important aspect of an administrative role?", options: ["Meticulous record-keeping and documentation", "Efficient management of office workflow", "Clear communication with the public", "Effective supervision of subordinate staff"] },
    { question: "A new government scheme needs to be implemented. Your first step is to...", options: ["Understand the policy's objectives and target beneficiaries", "Create a detailed, step-by-step action plan", "Train the staff on the new procedures", "Launch a public awareness campaign"] },
    { question: "How do you handle a public grievance?", options: ["By following the standard procedure for complaints", "By listening empathetically and promising to investigate", "By providing a quick, practical solution if possible", "By explaining the rules and why their request cannot be met"] },
    { question: "What is the key to effective inter-departmental coordination?", options: ["Formal meetings and written communication", "Building good personal relationships", "Having clearly defined roles and responsibilities", "Escalating issues to higher authorities when needed"] },
    { question: "When managing a team, you focus on...", options: ["Ensuring everyone follows the rules", "Meeting performance targets and deadlines", "Maintaining high team morale", "The professional development of your staff"] },
  ],
  "Clerical Staff (Group C)": [
    { question: "What do you find most satisfying in a junior administrative role?", options: ["Completing a task accurately and on time", "Helping a citizen resolve their issue", "Keeping files and records perfectly organized", "Learning new office procedures"] },
    { question: "When given a complex task, you prefer...", options: ["A detailed, step-by-step list of instructions", "The freedom to figure out the best method yourself", "To collaborate with a colleague", "To break it down into smaller, manageable parts"] },
    { question: "The most important skill for this level is...", options: ["Typing speed and computer literacy", "Attention to detail", "Good communication skills", "Time management"] },
    { question: "How do you handle a heavy workload with tight deadlines?", options: ["Work longer hours to get everything done", "Prioritize tasks and focus on the most urgent ones first", "Ask a supervisor for help in prioritizing", "Stay calm and work steadily through the list"] },
    { question: "When dealing with the public, it's most important to be...", options: ["Polite and patient", "Efficient and quick", "Knowledgeable about the rules", "Strict and firm"] },
  ],
  "Support Staff (Group D)": [
    { question: "What is the most important part of your job?", options: ["Following instructions from my superiors precisely", "Completing my assigned tasks diligently every day", "Being punctual and presentable", "Maintaining the security and cleanliness of my workspace"] },
    { question: "When a member of the public approaches you for help, you...", options: ["Direct them to the correct person or counter", "Try to answer their question if you know the answer", "Listen patiently even if you can't help", "Politely tell them you are busy with your work"] },
    { question: "How do you feel about performing routine tasks every day?", options: ["I find comfort and stability in a predictable routine", "I get bored easily and need variety", "It's a job, and I do what is required", "I take pride in doing my routine tasks perfectly"] },
    { question: "The most important personal quality for this role is...", options: ["Honesty", "Punctuality", "Hard work", "Respectfulness"] },
    { question: "You are asked to carry a file from one office to another. You ensure...", options: ["You do it as fast as possible", "The file is delivered directly to the correct person", "You don't look at the contents of the file", "All of the above"] },
  ],
};

const categories = {
  "Technical": ["CSE", "AI", "DS", "Cybersecurity", "Cloud Computing", "UI/UX Design", "ECE", "EEE", "CIVIL", "MECH"],
  "Medical": ["B.Pharm", "D.Pharm", "Pharmacology", "Nursing", "Medical Coding"],
  "Government": ["Senior Officer (Group A)", "Mid-level Officer (Group B)", "Clerical Staff (Group C)", "Support Staff (Group D)"]
};

const loadingMessages = [
    "Analyzing your problem-solving approach...",
    "Mapping your learning style...",
    "Identifying your core strengths...",
    "Generating personalized skill-up plan...",
    "Finalizing your professional profile...",
];


const MindsetAnalyzer: React.FC<MindsetAnalyzerProps> = ({ isOpen, onClose }) => {
  const [viewState, setViewState] = useState<ViewState>('domain_selection');
  const [selectedDomain, setSelectedDomain] = useState<keyof typeof categories | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<keyof typeof quizData | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<MindsetAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // State for the web search feature
  const [isSearching, setIsSearching] = useState(false);
  const [searchPrompt, setSearchPrompt] = useState('');
  const [searchResult, setSearchResult] = useState<{ text: string; sources: GroundingSource[] } | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleRestart = () => {
    setViewState('domain_selection');
    setSelectedDomain(null);
    setSelectedBranch(null);
    setAnswers({});
    setResult(null);
    setError(null);
    setIsSearching(false);
    setSearchPrompt('');
    setSearchResult(null);
    setSearchError(null);
  }

  useEffect(() => {
    if (!isOpen) {
        setTimeout(handleRestart, 300);
    }
  }, [isOpen]);

  const handleDomainSelect = (domain: keyof typeof categories) => {
    setSelectedDomain(domain);
    setViewState('branch_selection');
  };
  
  const handleBranchSelect = (branch: keyof typeof quizData) => {
    setSelectedBranch(branch);
    setAnswers({});
    setResult(null);
    setError(null);
    setViewState('taking_quiz');
  };

  const handleAnswerSelect = (qIndex: number, option: string) => {
    setAnswers(prev => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmit = async () => {
    if (!selectedBranch || Object.keys(answers).length !== 5) { // All quizzes are 5 questions now
      setError("Please answer all questions before submitting.");
      return;
    }
    
    let messageInterval: ReturnType<typeof setInterval> | null = null;

    try {
        setIsLoading(true);
        setError(null);
        setViewState('analyzing');

        let messageIndex = 0;
        setLoadingMessage(loadingMessages[messageIndex]);
        messageInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            setLoadingMessage(loadingMessages[messageIndex]);
        }, 2500);

        const formattedAnswers = quizData[selectedBranch].slice(0, 5).map((q, i) => `Question: ${q.question}\nAnswer: ${answers[i]}`).join('\n\n');
        const analysisResult = await analyzeMindset(formattedAnswers, selectedBranch);
        setResult(analysisResult);
        setViewState('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      setViewState('taking_quiz');
    } finally {
      if (messageInterval) clearInterval(messageInterval);
      setIsLoading(false);
    }
  };

  const handlePerformSearch = async (promptToSearch: string) => {
    if (!promptToSearch.trim()) {
      setSearchError("Please enter a search query.");
      return;
    }
    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      const response = await groundedSearch(promptToSearch);
      setSearchResult(response);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleInitiateSearch = (branch?: string | null) => {
    const targetBranch = branch || selectedBranch;
    if (!targetBranch) return;
    const defaultPrompt = `Top online learning platforms and courses for ${targetBranch}`;
    setSearchPrompt(defaultPrompt);
    setViewState('web_search');
    handlePerformSearch(defaultPrompt);
  };

  const handleDownloadGuide = async () => {
    if (!selectedBranch) return;
    setIsGeneratingPdf(true);
    setError(null);

    try {
      const guideContent = await generateBranchGuide(selectedBranch);

      const { jsPDF } = jspdf;
      const doc = new jsPDF();
      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;
      const margin = 15;
      let y = margin + 10; // Start lower for header

      const addText = (text: string, size: number, style: string, x: number, align: 'left' | 'center' = 'left') => {
        doc.setFontSize(size);
        doc.setFont(undefined, style);
        doc.setTextColor(40); // Reset color to dark grey for content
        const lines = doc.splitTextToSize(text, pageWidth - (margin * 2) - (x > margin ? (x - margin) : 0));
        const textHeight = lines.length * (size * 0.35);

        if (y + textHeight > pageHeight - margin - 10) { // Check against footer margin
          doc.addPage();
          y = margin + 10; // Reset y position for new page
        }
        doc.text(lines, x, y, { align: align as any });
        y += textHeight + (size * 0.5);
      };

      // Main content generation
      addText(guideContent.title, 22, 'bold', pageWidth / 2, 'center');
      y += 5;
      addText(guideContent.introduction, 12, 'normal', margin);

      guideContent.sections.forEach(section => {
        y += 5;
        addText(section.title, 16, 'bold', margin);
        addText(section.content.replace(/- /g, '\u2022 '), 11, 'normal', margin + 2);
      });
      
      // Add headers and footers to all pages after content is rendered
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150);
        
        // Header
        doc.text('Prism AI Career Guide', margin, margin);
        
        // Footer
        const footerText = `Page ${i} of ${pageCount}`;
        doc.text(footerText, pageWidth - margin, pageHeight - 10, { align: 'right' });
      }

      doc.save(`PrismAI_Guide_${selectedBranch.replace(/\s/g, '_')}.pdf`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate the PDF guide.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };
  
  const renderContent = () => {
      switch (viewState) {
          case 'domain_selection':
              return (
                <div className="text-center">
                    <h3 className="text-xl font-bold text-cyan-400">Mindset Analyzer</h3>
                    <p className="mt-2 text-gray-300">Choose a domain to explore career paths and take a quiz.</p>
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.keys(categories).map(domain => (
                        <button
                            key={domain}
                            onClick={() => handleDomainSelect(domain as keyof typeof categories)}
                            className="p-6 bg-gray-700/50 rounded-lg text-center font-semibold text-white hover:bg-cyan-500/30 hover:ring-2 hover:ring-cyan-500 transition-all duration-200"
                        >
                            {domain}
                        </button>
                    ))}
                    </div>
                </div>
              );
          case 'branch_selection':
            if (!selectedDomain) return null;
            return (
                <div>
                     <button onClick={() => setViewState('domain_selection')} className="flex items-center space-x-2 text-sm text-cyan-400 hover:text-cyan-300 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        <span>Back to Domains</span>
                    </button>
                    <h3 className="text-xl font-bold text-cyan-400 text-center">Select a Branch in {selectedDomain}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 max-h-[60vh] overflow-y-auto pr-2">
                        {categories[selectedDomain].map(branch => (
                            <div key={branch} className="bg-gray-700/50 rounded-lg flex flex-col justify-between shadow-lg border border-white/10">
                                <button
                                    onClick={() => handleBranchSelect(branch as keyof typeof quizData)}
                                    className="flex-grow p-4 text-center w-full hover:bg-cyan-500/10 rounded-t-lg transition-colors duration-200"
                                >
                                    <span className="font-semibold text-white">{branch.replace(" (Group A)", "").replace(" (Group B)", "").replace(" (Group C)", "").replace(" (Group D)", "")}</span>
                                </button>
                                <div className="border-t border-gray-600/50">
                                    <button
                                        onClick={() => handleInitiateSearch(branch)}
                                        className="text-xs w-full text-cyan-400 hover:bg-cyan-500/20 p-2 rounded-b-lg transition-colors duration-200 flex items-center justify-center space-x-1.5"
                                    >
                                        <Icon as="magnifying-glass" className="w-3.5 h-3.5" />
                                        <span>Learn Online</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
          case 'taking_quiz':
            if (!selectedBranch) return null;
            const currentQuestions = quizData[selectedBranch];
            const quizLength = 5; // All quizzes are now 5 questions
            return (
              <div>
                <h3 className="text-xl font-bold text-cyan-400 mb-6 text-center">{selectedBranch} Mindset Quiz</h3>
                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                    {currentQuestions.slice(0, quizLength).map((q, qIndex) => (
                    <div key={qIndex} className="bg-gray-700/50 p-4 rounded-lg">
                        <p className="font-semibold text-white mb-3">{qIndex + 1}. {q.question}</p>
                        <div className="space-y-2">
                        {q.options.map((option, oIndex) => (
                            <label key={oIndex} className={`flex items-start space-x-3 p-3 rounded-md transition-colors cursor-pointer ${answers[qIndex] === option ? 'bg-cyan-500/30 ring-2 ring-cyan-500' : 'hover:bg-gray-600'}`}>
                            <input type="radio" name={`question-${qIndex}`} value={option} checked={answers[qIndex] === option} onChange={() => handleAnswerSelect(qIndex, option)} className="form-radio h-4 w-4 text-cyan-500 bg-gray-800 border-gray-600 focus:ring-cyan-600 mt-1 flex-shrink-0" />
                            <span className="text-gray-300 text-sm">{option}</span>
                            </label>
                        ))}
                        </div>
                    </div>
                    ))}
                </div>
                {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg mt-4">{error}</p>}
                <button onClick={handleSubmit} disabled={Object.keys(answers).length !== quizLength} className="w-full mt-6 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed">
                    Analyze My Mindset
                </button>
              </div>
            );
        case 'analyzing':
            return (
                <div className="text-center p-4">
                    <p className="text-cyan-400 font-semibold mb-2">Analyzing Your Results...</p>
                    <p className="text-sm text-gray-300 h-4">{loadingMessage}</p>
                    <div className="mt-4 flex justify-center"><Loader /></div>
                </div>
            );
        case 'results':
            return result && (
                <div>
                    <div className="text-center mb-6 p-4 bg-gray-900/50 rounded-lg border border-cyan-500/50">
                        <p className="text-sm font-semibold text-cyan-400 uppercase tracking-widest">{selectedBranch} FIELD</p>
                        <h3 className="text-2xl font-bold text-white mt-1">{result.mindsetProfile.title}</h3>
                        <p className="text-gray-300 mt-2">{result.mindsetProfile.description}</p>
                    </div>
                    <div className="bg-gray-700/50 p-4 rounded-lg max-h-[45vh] overflow-y-auto pr-2">
                        <h4 className="text-lg font-bold text-white mb-3">Your Personalized Skill-Up Plan</h4>
                        <div className="space-y-4">
                            <div>
                                <h5 className="font-semibold text-cyan-400">Focus Areas:</h5>
                                <ul className="list-disc list-inside text-sm text-gray-300 mt-1 space-y-1">
                                    {result.skillUpPlan.focusAreas.map(area => <li key={area}>{area}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h5 className="font-semibold text-cyan-400">Recommended Resources:</h5>
                                <ul className="list-disc list-inside text-sm text-gray-300 mt-1 space-y-1">
                                    {result.skillUpPlan.recommendedResources.map(res => <li key={res} className="whitespace-pre-wrap">{res}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h5 className="font-semibold text-cyan-400">Suggested Next Project:</h5>
                                <p className="text-sm text-gray-300 mt-1 whitespace-pre-wrap">{result.skillUpPlan.nextProject}</p>
                            </div>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                        <button onClick={() => setViewState('branch_selection')} className="w-full bg-gray-600 text-white py-2 rounded-md hover:bg-gray-500">
                            Try Another Branch
                        </button>
                        <button onClick={() => handleInitiateSearch()} className="w-full bg-cyan-500 text-white py-2 rounded-md hover:bg-cyan-600">
                            Find Learning Resources
                        </button>
                    </div>
                    <div className="mt-4">
                        <button
                            onClick={handleDownloadGuide}
                            disabled={isGeneratingPdf}
                            className="w-full bg-indigo-600 text-white py-2.5 rounded-md hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
                        >
                            {isGeneratingPdf ? <Loader /> : (
                                <>
                                    <Icon as="document-text" className="w-5 h-5" />
                                    <span>Download Branch Guide (PDF)</span>
                                </>
                            )}
                        </button>
                    </div>
                    {error && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg mt-4">{error}</p>}
                </div>
            );
        case 'web_search':
            return (
                <div>
                    <button onClick={() => setViewState(result ? 'results' : 'branch_selection')} className="flex items-center space-x-2 text-sm text-cyan-400 hover:text-cyan-300 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        <span>Back</span>
                    </button>
                    <h3 className="text-xl font-bold text-white mb-1">Find Learning Resources</h3>
                    <p className="text-gray-400 text-sm mb-4">Showing results for: <span className="font-semibold text-gray-200">{selectedBranch}</span></p>

                    <form onSubmit={(e) => { e.preventDefault(); handlePerformSearch(searchPrompt); }} className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={searchPrompt}
                            onChange={(e) => setSearchPrompt(e.target.value)}
                            placeholder="Search for resources..."
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white placeholder-gray-400"
                            disabled={isSearching}
                        />
                        <button type="submit" disabled={isSearching || !searchPrompt.trim()} className="bg-cyan-500 text-white rounded-md px-4 py-2 hover:bg-cyan-600 disabled:bg-gray-600">
                            {isSearching ? <Loader /> : 'Search'}
                        </button>
                    </form>

                    <div className="mt-6 space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                        {isSearching && <div className="flex justify-center pt-10"><Loader /></div>}
                        {searchError && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-lg">{searchError}</p>}
                        
                        {searchResult && (
                            <>
                                <div className="p-4 bg-gray-900/50 rounded-lg">
                                    <p className="whitespace-pre-wrap text-gray-200 text-sm">{searchResult.text}</p>
                                </div>
                                {searchResult.sources.length > 0 && (
                                    <div>
                                        <h4 className="font-bold text-md mb-2 text-cyan-400">Sources</h4>
                                        <ul className="space-y-2">
                                            {searchResult.sources.map((source, index) => (
                                                <li key={index} className="text-sm bg-gray-700/50 p-3 rounded-md">
                                                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all" title={source.uri}>
                                                        {source.title || source.uri}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            );
      }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Mindset Analyzer">
      <div className="p-6">
        {renderContent()}
      </div>
    </Modal>
  );
};

export default MindsetAnalyzer;