window.__AGENT_COURSE_SESSION_DATA__ = window.__AGENT_COURSE_SESSION_DATA__ || {}; window.__AGENT_COURSE_SESSION_DATA__["agent-scenes.json"] = {
  "id": "agent-journey",
  "number": 1,
  "title": "Agents: From Curiosity to Capability",
  "subtitle": "From helpful answers to useful action",
  "bigQuestion": "How do we move from asking AI for help to giving AI meaningful work?",
  "keyMessage": "The best first agent is small, clear, and connected to a real piece of work.",
  "sessionOutcome": "Understand the anatomy of an agent, choose a starting point, and build a first useful agent.",
  "sections": [
    { "id": "welcome", "title": "Welcome", "sceneIds": ["agent-landing", "agent-spark", "agent-introduction"] },
    { "id": "foundations", "title": "Agent foundations", "sceneIds": ["agent-foundations", "agent-tedtalk"] },
    { "id": "build", "title": "Build and explore", "sceneIds": ["agent-build", "agent-store", "agent-platforms", "agent-first-build", "agent-foundation-consolidation", "agent-builder-focus"] },
    { "id": "judgment", "title": "Know the boundary", "sceneIds": ["agent-limitations", "copilot-studio-focus", "agent-tedtalk-return", "agent-close"] }
  ],
  "scenes": [
    {
      "id": "agent-landing",
      "number": 1,
      "type": "title-scene",
      "title": "Agents: From Curiosity to Capability",
      "subtitle": "The next chapter of AI is not only better answers. It is better work.",
      "kicker": "A practical field guide",
      "content": "Learn the language, find the right starting point, and build something useful before the end.",
      "speaker_name": "Usman Afzal",
      "speaker_title": "AI advisor and builder",
      "speaker_avatar": "assets/images/portraits/you.jpg",
      "faded_backdrop": "assets/images/evolution/executive-collaboration.jpg",
      "commentary": {
        "paragraphs": [
          "This is a story about crossing a threshold. For the last few years, most of our AI conversations have followed the same shape: we ask, it answers, we decide what to do with the answer. That pattern taught us how to prompt, how to phrase a request, how to iterate on wording. It did not teach us how to hand off real work.",
          "Agents change the relationship. Instead of asking for an answer each time, we give intelligence a role, the context it needs to act responsibly, and a bounded set of things it is allowed to do. Picture the difference between asking a colleague 'what should our weekly status update say?' versus asking them to actually own the weekly status update end to end: gather the inputs, draft it, flag anything unusual, and send it by Friday morning. The second version is agency. That is the shift this session is about.",
          "Three concrete examples we will return to across this session: a researcher agent that gathers and organizes evidence before a decision, a status-report agent that turns scattered updates into a clean weekly brief, and a triage agent that reads incoming requests and routes them to the right owner. None of these require a data science team. They require a clear role, good grounding, and a sensible boundary.",
          "The goal today is not to make everyone an engineer. It is to make the first step concrete enough that by the end of this session you can point at one piece of your own work and say, 'that is where an agent belongs.'"
        ],
        "takeaway": "Start with a real piece of work, not a fascination with the technology."
      }
    },
    {
      "id": "agent-spark",
      "number": 2,
      "type": "signal",
      "title": "The Prompting Was Only the Beginning",
      "subtitle": "A prompt changes a task. Agency changes the operating model.",
      "kicker": "Adoption was the spark",
      "faded_backdrop": "assets/images/usman-afzal/usman-storyals.jpg",
      "speaker_name": "Usman Afzal",
      "speaker_title": "AI advisor and builder",
      "speaker_avatar": "assets/images/portraits/you.jpg",
      "commentary": {
        "paragraphs": [
          "Every organization I have worked with over the last two years has already lived through one shift: people learned to prompt. They learned how to phrase a request, how to iterate on wording, how to get a better answer out of a chat window. That adoption wave was real, and it mattered. It built comfort and trust with the technology.",
          "But prompting a model for a better answer and handing a model a real piece of work are two different operating models. A prompt still requires a human to ask the question, read the answer, and decide what to do next, every single time. An agent is asked once, understands the boundary of the job, and carries it through to a result.",
          "That is why the adoption spark matters so much. The habit of prompting is what makes the leap to agency possible: people who are already comfortable describing what they want in plain language are the same people who will know how to give an agent clear instructions, useful context, and a sensible boundary.",
          "So the shift is not from 'no AI' to 'agents.' It is from 'a prompt changes a task' to 'agency changes the operating model:' the same comfort with language, redirected from asking questions to assigning outcomes."
        ],
        "takeaway": "The prompting habit was the spark. Agency is what it was preparing us for."
      }
    },
    {
      "id": "agent-introduction",
      "number": 3,
      "type": "signal",
      "title": "From Answers to Agency",
      "subtitle": "What an agent is, why it matters, and how it works",
      "kicker": "Introduction",
      "visual": {
        "type": "agent-journey",
        "core": "AGENCY",
        "outcome": "A role becomes useful when intelligence can understand, decide, and act.",
        "stages": [
          { "label": "Purpose", "detail": "Give intelligence a role and a goal" },
          { "label": "Context", "detail": "Ground it in knowledge and boundaries" },
          { "label": "Action", "detail": "Let it move work toward an outcome" }
        ]
      },
      "speaker_name": "Usman Afzal",
      "speaker_title": "AI advisor and builder",
      "speaker_avatar": "assets/images/portraits/you.jpg",
      "commentary": {
        "paragraphs": [
          "An agent is not simply a chatbot with a new label. A chatbot waits for a question and answers it. An agent is given a job: it interprets an outcome you want, draws on the knowledge available to it, chooses from a set of approved capabilities, and comes back with progress or a finished result. The difference shows up the moment you stop asking questions and start assigning outcomes.",
          "Consider a simple scenario. Every Monday, a regional sales lead spends 45 minutes pulling numbers from three systems into a one-page summary for their VP. A chatbot could help draft the summary if you paste in the numbers. An agent goes further: it knows where the three systems are, knows the format the VP expects, checks for anomalies worth flagging, and produces a draft ready for a two-minute review. That is Purpose (produce the Monday brief), Context (which systems, which format, what counts as an anomaly), and Action (assemble, check, draft) working together.",
          "The why is human, not technical. Most organizations are full of work that is important but draining: chasing status updates from five people, sorting a cluttered inbox into categories, reformatting the same report every week, or moving a request from one queue to the next system. None of this requires deep expertise, but all of it consumes attention that could go toward judgment calls, relationships, and creative problem-solving. Agents can absorb that friction, but only if we design their role, context, and boundary with real care rather than assuming intelligence alone is enough.",
          "A useful test when you meet a new agent, whether built by you or by someone else: can you name its purpose in one sentence, point to the context it relies on, and describe what it is and is not allowed to do? If you cannot answer all three, the agent is not yet ready to be trusted with real work."
        ],
        "takeaway": "An agent is purpose plus context plus capability, operating within a boundary."
      }
    },
    {
      "id": "agent-foundations",
      "number": 4,
      "type": "constellation",
      "title": "The Anatomy of an Agent",
      "subtitle": "Four foundations turn a model into a dependable participant",
      "kicker": "Agent foundations",
      "visual": {
        "type": "blueprint",
        "core": "AGENT",
        "parts": [
          { "label": "Instructions", "detail": "The role, tone, rules, and definition of done" },
          { "label": "Knowledge", "detail": "The sources and context it can trust" },
          { "label": "Skills + Tools", "detail": "The capabilities it can call" },
          { "label": "Actions + Triggers", "detail": "What it can do, and when the work begins" }
        ]
      },
      "speaker_name": "Usman Afzal",
      "speaker_title": "AI advisor and builder",
      "speaker_avatar": "assets/images/portraits/you.jpg",
      "commentary": {
        "paragraphs": [
          "Think of these four foundations as a working agreement between you and the agent, the same way you would onboard a new team member. Instructions define behavior: the role, the tone, the rules, and what 'done' actually looks like. Knowledge gives the agent something grounded to reason over instead of guessing. Skills and tools expand what it can actually access and do. Actions and triggers define what it is allowed to do, and when the work should start.",
          "Here is how this looks in practice for a customer-escalation summarizer agent. Instructions: 'Summarize each escalation in three sentences, always name the customer impact, never promise a resolution date.' Knowledge: the last 90 days of support tickets and the current SLA policy document. Skills and Tools: a search tool over the ticket system and a summarization skill. Actions and Triggers: it drafts a summary and posts it to a review channel every morning at 8am, but it never closes a ticket itself.",
          "Weak agents almost never fail because the underlying model is incapable. They fail because one of these four foundations is missing or vague. A vague instruction ('be helpful with escalations') produces inconsistent tone and scope. Missing knowledge produces confident, wrong answers. Missing skills means the agent describes what it would do instead of doing it. Missing or overly broad actions means either the agent can't finish the job, or it has more power than the task warrants.",
          "When an agent disappoints you, walk through the four foundations like a checklist before you blame the model: Is the instruction specific enough that two different people would interpret it the same way? Does the agent have access to the right knowledge, and only the right knowledge? Does it have the skill it actually needs, no more and no less? And is the action it is about to take proportional to how much you trust the input it received?"
        ],
        "takeaway": "When an agent disappoints you, inspect the foundation before changing the model."
      }
    },
    {
      "id": "agent-tedtalk",
      "number": 5,
      "type": "signal",
      "title": "The Best Agent Starts With a Better Question",
      "subtitle": "Before you choose a platform, choose the work worth changing",
      "kicker": "How to begin",
      "faded_backdrop": "assets/images/usman-afzal/usman-storyals-01.jpg",
      "visual": {
        "type": "tedtalk-question",
        "reveals": [
          { "icon": "×", "kind": "reject", "label": "What can AI do?", "detail": "A technology-first conversation produces impressive demos and very few habits." },
          { "icon": "?", "kind": "question", "label": "Where is human attention being wasted?", "detail": "A work-first conversation finds the moments where an agent can create leverage." }
        ]
      },
      "speaker_name": "Usman Afzal",
      "speaker_title": "AI advisor and builder",
      "speaker_avatar": "assets/images/portraits/you.jpg",
      "commentary": {
        "paragraphs": [
          "A technology-first conversation produces impressive demos and very few habits. You have seen this pattern before: someone shows a flashy AI demo in a town hall, everyone claps, and six months later almost no one has changed how they actually work. That happens because 'what can AI do?' starts from the capability, not the pain.",
          "A work-first conversation starts from the other direction. It asks: where is human attention being wasted right now? Some concrete patterns worth listening for in your own team: a recurring request that lands in someone's inbox every single week in nearly the same shape (a status report, a competitive summary, an onboarding checklist). A queue that keeps growing no matter how fast people work through it (support tickets, expense approvals, contract reviews). A report that takes hours to assemble but only minutes to read once it exists. A decision that sits idle for days simply because the information needed to make it hasn't been gathered yet.",
          "Example: a product manager notices that every sprint retro, someone spends 30 minutes manually pulling ticket data into a slide. That is a strong first-agent candidate: frequent (every two weeks), structured (the ticket system has consistent fields), and bounded (the output is a slide draft, not a decision). Compare that to 'help us decide which features to build next quarter' - important, but not bounded enough to be a safe first project.",
          "Choose work that is frequent enough to matter, structured enough to learn from, and bounded enough to test safely without real-world consequences if it gets something wrong early on. Your first agent should teach you something about scoping, grounding, and trust, not carry the organization on day one."
        ],
        "takeaway": "The right starting point is repeated work with a visible definition of done."
      }
    },
    {
      "id": "agent-build",
      "number": 6,
      "type": "signal",
      "title": "Start With Built-In Agents",
      "subtitle": "Explore a useful role before you build one",
      "kicker": "First move",
      "visual": {
        "type": "agent-trio",
        "url": "https://m365.cloud.microsoft/chat/agentstore",
        "agents": [
          { "label": "Idea Coach", "detail": "Turn a rough thought into a stronger direction", "url": "https://m365.cloud.microsoft/agents/idea-coach" },
          { "label": "Prompt Coach", "detail": "Improve the brief before you send it", "url": "https://m365.cloud.microsoft/agents/prompt-coach" },
          { "label": "Researcher", "detail": "Find and organize useful evidence", "url": "https://m365.cloud.microsoft/agents/researcher" },
          { "label": "Analyst", "detail": "Surface patterns, signals, and decisions", "url": "https://m365.cloud.microsoft/agents/analyst" },
          { "label": "Cowork", "detail": "Move from answers toward coordinated action", "url": "https://m365.cloud.microsoft/agents/cowork" },
          { "label": "Plan My Day", "detail": "Turn priorities into a realistic daily plan", "url": "https://m365.cloud.microsoft/agents/plan-my-day" },
          { "label": "Career Coach", "detail": "Reflect on options and shape your next move", "url": "https://m365.cloud.microsoft/agents/career-coach" },
          { "label": "And many more", "detail": "Explore the growing library of built-in agents", "url": "https://m365.cloud.microsoft/chat/agentstore" }
        ]
      },
      "speaker_name": "Usman Afzal",
      "speaker_title": "AI advisor and builder",
      "speaker_avatar": "assets/images/portraits/you.jpg",
      "commentary": {
        "paragraphs": [
          "Before building anything from scratch, look at what already exists. Microsoft 365 Copilot ships with a library of built-in agents designed for exactly the everyday scenarios most people start with. Idea Coach helps turn a rough thought into a stronger direction before you commit to it. Prompt Coach improves a brief before you send it to a person or another agent. Researcher finds and organizes evidence so you are not starting a decision from a blank page. Analyst surfaces patterns and signals buried in messy data. Plan My Day turns a long list of priorities into a realistic schedule. Career Coach helps someone reflect on options before a hard conversation.",
          "Try this concretely: open Idea Coach with a real, half-formed idea you have right now, such as 'I want to reduce the time our team spends on status updates.' Notice how it asks clarifying questions instead of jumping to a solution. Then try Researcher on a real open question at work, such as 'what are competitors doing with AI agents in customer support?' and see how it organizes findings instead of just listing links.",
          "The first build should feel almost too small, and using a built-in agent for a real task is the smallest possible build. It lets you see the relationship between instruction, context, output, and judgment without hiding the learning inside a large workflow you built yourself. You get to evaluate whether the pattern works before you invest any effort in constructing it.",
          "Use real material as soon as you can, not a toy example. A generic test ('summarize this paragraph') only proves an agent can respond. A real example, like your actual half-written status update or your actual competitive question, reveals whether the agent understands the language, standards, exceptions, and judgment calls that make the output genuinely useful rather than superficially plausible."
        ],
        "takeaway": "Build the smallest useful loop, then make it reliable before making it ambitious."
      }
    },
    {
      "id": "agent-store",
      "number": 7,
      "type": "deck",
      "title": "Borrow Before You Build",
      "subtitle": "Explore the Agent Store before you build your own",
      "kicker": "Find leverage",
      "visual": {
        "type": "agent-library",
        "agents": [],
        "invitationLabel": "Try before you build",
        "invitationTitle": "Borrow a role. Learn the shape of useful work.",
        "invitationDetail": "Start with a built-in agent, test it against a real task, and notice what you would change before creating your own.",
        "invitationLink": {
          "label": "Open M365 Copilot Agent Store →",
          "url": "https://m365.cloud.microsoft/chat/agentstore"
        },
        "footerTitle": "Not finding what you want? Explore third-party agents.",
        "footerDetail": "There is a wider ecosystem to discover. Look for agents with clear ownership, transparent permissions, trustworthy sources, and a review path before connecting them to sensitive work."
      },
      "speaker_name": "Usman Afzal",
      "speaker_title": "AI advisor and builder",
      "speaker_avatar": "assets/images/portraits/you.jpg",
      "commentary": {
        "paragraphs": [
          "An Agent Store is not only a catalogue of finished answers. It is a library of patterns you can study before you write a single instruction of your own. Open a well-built agent listing and look at how its description scopes the role, what data sources it says it uses, and what kind of output it promises. That framing is often more valuable than the agent's actual output, because it teaches you how to describe your own role clearly.",
          "Scenario: your team needs a meeting-notes agent. Instead of designing one cold, browse three or four note-taking or summarization agents in the store. Notice how one insists on tagging action items with an owner and a due date, while another just produces a narrative summary. That comparison tells you something concrete about what 'good' looks like for your use case before you build anything.",
          "Borrowing is often the fastest way to learn, and it is a perfectly legitimate way to get started: install an agent, run it against a real task this week, and see where it falls short for your specific context. But treat an installed agent as a starting point, not an authority. It was designed for a general case, not your team's specific data, tone, exceptions, and definition of done.",
          "Before connecting any third-party agent to real work, run through a short checklist: Who owns and maintains it? What permissions does it request, and are they proportional to its job? Where does its knowledge come from, and is that source trustworthy for your context? Is there a review step before its output reaches a customer, a leader, or a system of record? An agent that fails this checklist may still be useful for exploration, but it is not yet ready for production."
        ],
        "takeaway": "Reuse the pattern, verify the behavior, and make ownership explicit."
      }
    },
    {
      "id": "agent-platforms",
      "number": 8,
      "type": "signal",
      "title": "Choose Your Level of Agency",
      "subtitle": "There is a right starting point for every kind of work",
      "kicker": "Build paths",
      "visual": {
        "type": "platform-path",
        "platforms": [
          {
            "eyebrow": "Start here",
            "label": "Agent Builder",
            "detail": "Copilot Studio Lite makes it easy to shape a focused agent with instructions and knowledge.",
            "fit": "Fastest path to a useful first agent",
            "logos": ["assets/logos-and-icons/Copilot-icon.svg"]
          },
          {
            "eyebrow": "Go further",
            "label": "Copilot Studio",
            "detail": "Add connectors, actions, workflows, approvals, and stronger control for team processes.",
            "fit": "For connected, governed business workflows",
            "logos": ["assets/logos-and-icons/copilot-studio.svg"]
          },
          {
            "eyebrow": "Build at scale",
            "label": "Azure AI Foundry",
            "detail": "Engineer advanced agent systems with models, evaluation, orchestration, and enterprise scale.",
            "fit": "For deeply integrated, engineered capability",
            "logos": ["assets/logos-and-icons/foundry.svg"]
          }
        ]
      },
      "speaker_name": "Usman Afzal",
      "speaker_title": "AI advisor and builder",
      "speaker_avatar": "assets/images/portraits/you.jpg",
      "commentary": {
        "paragraphs": [
          "Agent Builder, sometimes called Copilot Studio Lite, is a strong first doorway. It is declarative rather than technical: you describe the role in plain language, point it at the knowledge it should trust, and test it immediately in the same interface. It is well suited to an individual or a small team that needs a focused agent quickly, such as a personal meeting-prep assistant or a team FAQ responder grounded in a shared document.",
          "As the work grows, so does what you need from the platform. Imagine that FAQ agent becomes popular, and now the team wants it to also open a ticket in the helpdesk system when it cannot answer a question, require manager approval before closing certain requests, and report usage metrics to a compliance dashboard. That is the moment to graduate to Copilot Studio: it adds connectors to external systems, multi-step workflows, approval steps, and stronger governance controls suited to a shared, team-owned business process.",
          "Azure AI Foundry is the next level up, built for when the requirement moves beyond a single workflow into a genuine engineered system: custom model selection and fine-tuning, rigorous evaluation pipelines, multi-agent orchestration, and enterprise-grade observability. A fraud-detection agent that must meet audit requirements, or a multi-agent research pipeline coordinating several specialized models, belongs here rather than in a lighter-weight builder.",
          "The decision test is simple: start with the lightest platform that can responsibly carry the work today, and treat 'we've outgrown this' as a specific, observable signal (a missing connector, a missing approval step, a missing evaluation metric) rather than a vague feeling that you should move to something more powerful."
        ],
        "takeaway": "Choose the lightest platform that can responsibly carry the work."
      }
    },
    {
      "id": "agent-first-build",
      "number": 9,
      "type": "workbench",
      "title": "Your First Agent: From Idea to Useful",
      "subtitle": "A six-minute build starts with one role and one real request",
      "kicker": "Build together",
      "visual": {
        "type": "workbench",
        "image": "assets/logos-and-icons/agent-builder.png",
        "alt": "Agent Builder interface",
        "checklist": [
          { "label": "Name the role", "detail": "Give it a memorable job, not a generic label" },
          { "label": "Write the brief", "detail": "Purpose, audience, constraints, definition of done" },
          { "label": "Add grounding", "detail": "Give it the sources it should trust" },
          { "label": "Run a real test", "detail": "Look for assumptions, omissions, and unsafe actions" },
          { "label": "Improve the loop", "detail": "Refine one foundation at a time" }
        ]
      },
      "speaker_name": "Usman Afzal",
      "speaker_title": "AI advisor and builder",
      "speaker_avatar": "assets/images/portraits/you.jpg",
      "commentary": {
        "paragraphs": [
          "Let's build something real, live, in about six minutes. Imagine we are building an agent that prepares a weekly leadership brief. Its job is not to be generally intelligent. Its job is to collect agreed sources, identify what changed since last week, highlight decisions that need attention, and return a concise brief with links back to the original evidence.",
          "Step one, name the role: not 'AI Assistant' but 'Weekly Leadership Brief Writer.' A memorable, specific name forces you to also be specific about scope. Step two, write the brief: purpose (a one-page Friday summary for the leadership team), audience (people who skim in under two minutes), constraints (no speculation, always cite the source), and definition of done (every section has at least one linked source).",
          "Step three, add grounding: point it at the three or four sources it should trust, such as the project tracker, the incident log, and last week's brief for continuity. Step four, run a real test: feed it this week's actual data and read the output looking specifically for assumptions it made without evidence, anything it omitted that mattered, and any action it took that it should not have (like sending the brief before a human reviewed it).",
          "Step five, improve the loop: refine one foundation at a time. If the tone is off, that is an instructions fix. If it missed an important update, that is a knowledge fix. If it can't format a chart, that is a skills fix. If it sent before review, that is an actions and triggers fix. Notice how quickly the five foundations become practical the moment you're troubleshooting a real, specific gap instead of a hypothetical one."
        ],
        "takeaway": "A first agent becomes useful when its role, inputs, outputs, and boundaries are visible."
      }
    },
    {
      "id": "agent-foundation-consolidation",
      "number": 10,
      "type": "signal",
      "title": "The Agent Foundation, in One View",
      "subtitle": "Purpose, context, and action come alive through instructions, knowledge, tools, and triggers",
      "kicker": "Agent foundation",
      "visual": {
        "type": "foundation-consolidation",
        "journey": {
          "label": "From answers to agency",
          "core": "AGENCY",
          "outcome": "A role becomes useful when intelligence can understand, decide, and act.",
          "stages": [
            { "label": "Purpose", "detail": "Give intelligence a role and a goal" },
            { "label": "Context", "detail": "Ground it in knowledge and boundaries" },
            { "label": "Action", "detail": "Let it move work toward an outcome" }
          ]
        },
        "blueprint": {
          "label": "The anatomy of an agent",
          "core": "AGENT",
          "parts": [
            { "label": "Instructions", "detail": "The role, tone, rules, and definition of done" },
            { "label": "Knowledge", "detail": "The sources and context it can trust" },
            { "label": "Skills + Tools", "detail": "The capabilities it can call" },
            { "label": "Actions + Triggers", "detail": "What it can do, and when the work begins" }
          ]
        }
      },
      "speaker_name": "Usman Afzal",
      "speaker_title": "AI advisor and builder",
      "speaker_avatar": "assets/images/portraits/you.jpg",
      "commentary": {
        "paragraphs": [
          "Before we move into a more capable building environment, hold these two views together. Agency describes the job: a clear purpose, trusted context, and the ability to move work toward an outcome. The anatomy describes how we make that job dependable: instructions, knowledge, skills and tools, and actions and triggers.",
          "The platform can change, but this foundation does not. When an agent falls short, return to this view and ask whether the role is unclear, the context is weak, a capability is missing, or an action needs a stronger boundary.",
          "That is the lens we will use for the next step. We are not moving tools simply to gain more features; we are moving because the work now asks for more capability and control around the same foundation."
        ],
        "takeaway": "Better tools extend the foundation; they do not replace it."
      }
    },
    {
      "id": "agent-builder-focus",
      "number": 11,
      "type": "signal",
      "title": "Start with Agent Builder",
      "subtitle": "The fastest path from a clear role to a useful first agent",
      "kicker": "Where we started",
      "visual": {
        "type": "platform-path",
        "platforms": [
          {
            "eyebrow": "Start here",
            "label": "Agent Builder",
            "detail": "Copilot Studio Lite makes it easy to shape a focused agent with instructions and knowledge.",
            "fit": "Fastest path to a useful first agent",
            "logos": ["assets/logos-and-icons/Copilot-icon.svg"]
          },
          {
            "eyebrow": "Go further",
            "label": "Copilot Studio",
            "detail": "Add connectors, actions, workflows, approvals, and stronger control for team processes.",
            "fit": "For connected, governed business workflows",
            "logos": ["assets/logos-and-icons/copilot-studio.svg"],
            "state": "muted"
          },
          {
            "eyebrow": "Build at scale",
            "label": "Azure AI Foundry",
            "detail": "Engineer advanced agent systems with models, evaluation, orchestration, and enterprise scale.",
            "fit": "For deeply integrated, engineered capability",
            "logos": ["assets/logos-and-icons/foundry.svg"],
            "state": "muted"
          }
        ]
      },
      "speaker_name": "Usman Afzal",
      "speaker_title": "AI advisor and builder",
      "speaker_avatar": "assets/images/portraits/you.jpg",
      "commentary": {
        "paragraphs": [
          "This is where we started because Agent Builder is the shortest path between understanding the foundation and putting it into practice. We could describe a focused role, ground it in knowledge, and test it immediately without first designing infrastructure.",
          "That accessibility is a strength. It lets us learn whether the instructions are clear, whether the knowledge is useful, and whether the agent produces something worth trusting before we add complexity.",
          "Now that the first agent works, the next question is not whether Agent Builder was the right choice. It is whether the work we want to add next still fits inside its designed boundary."
        ],
        "takeaway": "Agent Builder proves the role before the workflow becomes complex."
      }
    },
    {
      "id": "agent-limitations",
      "number": 12,
      "type": "signal",
      "title": "Every Shortcut Has a Boundary",
      "subtitle": "Agent Builder is great, but great tools still have a shape",
      "kicker": "Know the boundary",
      "visual": {
        "type": "failure-modes",
        "items": [
          { "number": "01", "label": "Orchestration", "detail": "Complex multi-step workflows may need a richer canvas" },
          { "number": "02", "label": "Actions", "detail": "Connected systems and approvals can outgrow simple setup" },
          { "number": "03", "label": "Governance", "detail": "Scale demands identity, policy, evaluation, and observability" },
          { "number": "04", "label": "Reuse", "detail": "A personal success is not automatically a team capability" },
          { "number": "05", "label": "Autonomy", "detail": "Some decisions need a human owner and explicit escalation" }
        ]
      },
      "speaker_name": "Usman Afzal",
      "speaker_title": "AI advisor and builder",
      "speaker_avatar": "assets/images/portraits/you.jpg",
      "commentary": {
        "paragraphs": [
          "The limitation is not a failure of Agent Builder. Every tool has a designed center of gravity, and knowing that shape is what separates a confident builder from someone who gets surprised in production. Agent Builder helps people turn intent and knowledge into a useful agent quickly. It is not meant to hide the architecture of a high-stakes, deeply integrated operating system, and it was never trying to be that.",
          "Orchestration: your weekly-brief agent works well alone, but now leadership wants it to also trigger a follow-up agent that drafts action-item emails, wait for responses, and compile those into next week's brief. That multi-step, multi-agent choreography needs a richer canvas than a single declarative builder provides.",
          "Actions and governance: if your agent needs to actually update a production database, submit an expense reimbursement, or modify customer records, the connected systems and required approvals usually outgrow simple setup, and scale starts demanding identity management, policy enforcement, evaluation pipelines, and observability you can audit after the fact.",
          "Reuse and autonomy: an agent one person built for themselves is not automatically ready to become a team-wide capability; it needs testing across more scenarios, clearer ownership, and often a redesign of its knowledge sources. And some decisions, like approving a large financial transaction or making a legal commitment, need a human owner and an explicit escalation path no matter how good the agent's judgment appears to be in testing.",
          "The mature move is knowing when to step up a level, and treating each of these five signals, orchestration, actions, governance, reuse, and autonomy, as a concrete checkpoint rather than a vague sense that 'this needs to be more sophisticated.'"
        ],
        "takeaway": "Start with the accessible tool, then graduate when the work demands more control."
      }
    },
    {
      "id": "copilot-studio-focus",
      "number": 13,
      "type": "signal",
      "title": "Go Further with Copilot Studio",
      "subtitle": "Move beyond simple setup into richer actions, orchestration, and governance",
      "kicker": "Where we go next",
      "visual": {
        "type": "platform-path",
        "platforms": [
          {
            "eyebrow": "Start here",
            "label": "Agent Builder",
            "detail": "Copilot Studio Lite makes it easy to shape a focused agent with instructions and knowledge.",
            "fit": "Fastest path to a useful first agent",
            "logos": ["assets/logos-and-icons/Copilot-icon.svg"],
            "state": "muted"
          },
          {
            "eyebrow": "Go further",
            "label": "Copilot Studio",
            "detail": "Add connectors, actions, workflows, approvals, and stronger control for team processes.",
            "fit": "For connected, governed business workflows",
            "logos": ["assets/logos-and-icons/copilot-studio.svg"]
          },
          {
            "eyebrow": "Build at scale",
            "label": "Azure AI Foundry",
            "detail": "Engineer advanced agent systems with models, evaluation, orchestration, and enterprise scale.",
            "fit": "For deeply integrated, engineered capability",
            "logos": ["assets/logos-and-icons/foundry.svg"],
            "state": "muted"
          }
        ]
      },
      "speaker_name": "Usman Afzal",
      "speaker_title": "AI advisor and builder",
      "speaker_avatar": "assets/images/portraits/you.jpg",
      "commentary": {
        "paragraphs": [
          "The limitations we just named are the reason Copilot Studio is the next tool, not a rejection of what we built. The role and knowledge remain useful; the environment expands around them.",
          "Copilot Studio gives us the richer canvas needed for connected actions, multi-step workflows, approvals, shared ownership, and governance. Those capabilities let an agent participate in a business process rather than stop at a useful response.",
          "As we build today, keep the foundation visible. We will still define the role, ground the agent, choose its tools, and set its boundaries. The difference is that we can now connect those choices into a workflow designed for a team."
        ],
        "takeaway": "Graduate platforms when the work requires more connection, control, and shared ownership."
      }
    },
    {
      "id": "agent-tedtalk-return",
      "number": 14,
      "type": "signal",
      "title": "The Best Agent Starts With a Better Question",
      "subtitle": "Before you choose a platform, choose the work worth changing",
      "kicker": "How to begin",
      "faded_backdrop": "assets/images/usman-afzal/usman-storyals-01.jpg",
      "visual": {
        "type": "tedtalk-question",
        "reveals": [
          { "icon": "×", "kind": "reject", "label": "What can AI do?", "detail": "A technology-first conversation produces impressive demos and very few habits." },
          { "icon": "?", "kind": "question", "label": "Where is human attention being wasted?", "detail": "A work-first conversation finds the moments where an agent can create leverage." }
        ]
      },
      "speaker_name": "Usman Afzal",
      "speaker_title": "AI advisor and builder",
      "speaker_avatar": "assets/images/portraits/you.jpg",
      "commentary": {
        "paragraphs": [
          "A technology-first conversation produces impressive demos and very few habits. You have seen this pattern before: someone shows a flashy AI demo in a town hall, everyone claps, and six months later almost no one has changed how they actually work. That happens because 'what can AI do?' starts from the capability, not the pain.",
          "A work-first conversation starts from the other direction. It asks: where is human attention being wasted right now? Some concrete patterns worth listening for in your own team: a recurring request that lands in someone's inbox every single week in nearly the same shape (a status report, a competitive summary, an onboarding checklist). A queue that keeps growing no matter how fast people work through it (support tickets, expense approvals, contract reviews). A report that takes hours to assemble but only minutes to read once it exists. A decision that sits idle for days simply because the information needed to make it hasn't been gathered yet.",
          "Example: a product manager notices that every sprint retro, someone spends 30 minutes manually pulling ticket data into a slide. That is a strong first-agent candidate: frequent (every two weeks), structured (the ticket system has consistent fields), and bounded (the output is a slide draft, not a decision). Compare that to 'help us decide which features to build next quarter' - important, but not bounded enough to be a safe first project.",
          "Choose work that is frequent enough to matter, structured enough to learn from, and bounded enough to test safely without real-world consequences if it gets something wrong early on. Your first agent should teach you something about scoping, grounding, and trust, not carry the organization on day one."
        ],
        "takeaway": "The right starting point is repeated work with a visible definition of done."
      }
    },
    {
      "id": "agent-close",
      "number": 15,
      "type": "title-scene",
      "title": "Design the Work, Then Design the Agent",
      "subtitle": "The future belongs to people who can turn useful work into clear, governed roles for intelligence.",
      "kicker": "The next move is yours",
      "content": "Find one repeated task. Give it a name. Build the smallest useful version.",
      "speaker_name": "Usman Afzal",
      "speaker_title": "AI advisor and builder",
      "speaker_avatar": "assets/images/portraits/you.jpg",
      "commentary": {
        "paragraphs": [
          "The point of this journey is not to leave with a list of platforms. It is to leave with a way of seeing. When work is repeated, bounded, and meaningful, it may be ready for a role that intelligence can carry, with the right context and the right controls in place.",
          "Before you leave this room, do one thing: write down a single sentence naming a real, recurring task you or your team does every week. Not 'improve productivity,' but something as specific as 'compile the Friday leadership brief' or 'triage incoming support tickets by urgency.' That sentence is the seed of your first agent.",
          "Then walk it through what you learned today: is it frequent and bounded enough to be a safe first build? Which of the four foundations, instructions, knowledge, skills, or actions, is easiest to define clearly? Is there a built-in agent in the store you could test against it this week before building anything yourself? And which platform, Agent Builder, Copilot Studio, or Azure AI Foundry, matches how much control and governance this specific task actually needs, today, not eventually?",
          "The first agent does not need to be impressive. It needs to be useful enough to teach you what the organization will need next, and specific enough that you can point to it, in six months, and say exactly what you learned by building it."
        ],
        "takeaway": "Start small enough to learn, and design carefully enough to trust."
      }
    }
  ]
};
