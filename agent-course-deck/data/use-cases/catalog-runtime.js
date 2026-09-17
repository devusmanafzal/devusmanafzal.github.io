window.USE_CASES = [
  {
    "id": "campaign",
    "emoji": "📷",
    "title": "Campaign Concept Partner",
    "persona": "Brand, Content & Creative Studio",
    "shape": "Create",
    "brief": "Turns a seasonal brief into three campaign concepts, a recommendation, and a full starter kit of messages, channel copy and a shot outline.",
    "becomes": "A new brief lands in the library and the starter kit drafts itself, ready for the creative lead to review.",
    "lead": "This is the use case Session 1 ended on. The prompt already works — the question these sessions answer is what happens when you stop being the only person who can run it.",
    "everyday": "A seasonal brief arrives. Someone spends half a day turning it into concepts, then rewrites the same message five times for the home page, the newsletter, paid social, organic social and a sign in the window.",
    "megaPrompt": "You are helping a cross-functional ARKET campaign team turn a seasonal brief into a practical creative starting point. Use the brand context pack and the campaign brief as your sources, together with the official ARKET website. 1. State three facts from the sources that will guide your work, naming the source after each one. 2. Create three genuinely different campaign concepts. For each, give a name, a one-sentence idea, the customer moment it addresses, and why it fits the brand. 3. Compare them on brand fit, customer usefulness, distinctiveness and cross-channel potential using High, Medium or Low, with one sentence of reasoning each. 4. Recommend one concept. Explain the choice, the main risk, and what the team should validate before committing. 5. Develop it into a campaign name, a core message, an 80 to 120 word story and three message pillars. 6. Write channel starters for the home page, email, paid social, organic social and an in-store sign. 7. Create a six-shot visual outline with the moment, product category, setting and purpose of each shot. 8. End with assumptions, missing information and the decisions that need a human owner. Separate verified facts from creative suggestions. Do not invent products, prices, performance, research, targets or environmental claims. Use plain language.",
    "skill": {
      "name": "campaign-starter-kit",
      "why": "Package the campaign method and templates into a reusable skill for creative concepting.",
      "tree": "<b>campaign-starter-kit/</b>\n├─ <b>SKILL.md</b> the method\n├─ references/\n│  ├─ brand-context.md source pack\n│  └─ claim-rules.md operating guidance\n└─ templates/\n   ├─ concept-comparison.md\n   ├─ channel-starters.md\n   └─ shot-outline.md",
      "instructions": "---\nname: campaign-starter-kit\ndescription: Turns an ARKET seasonal campaign brief into three concepts, a recommendation and a complete starter kit of messaging, channel copy and a shot outline. Use when someone asks for campaign ideas, a creative direction, or a starter kit from a brief.\n---\n\n# Campaign starter kit\n\n## Before you write anything\nRead the brief and the brand references. Pull out the season, the product categories, the audience and the business question. If the brief does not say, say so rather than assuming.\n\n## Produce, in this order\n1. Three grounding facts, each with its source named.\n2. Three concepts that are genuinely different, not three versions of one idea.\n3. A comparison using the concept template.\n4. One recommendation, with its main risk and what needs validating.\n5. The developed concept: name, core message, 80 to 120 word story, three pillars.\n6. Channel starters.\n7. A six-shot outline.\n8. Assumptions, gaps and the decisions a person must own.\n\n## Always\nKeep facts and creative suggestions visibly separate. Follow the claim rules. Treat everything as working material, never approved copy.",
      "scriptNote": ""
    },
    "agent": {
      "name": "ARKET Campaign Concept Partner",
      "description": "Helps brand, studio and media teams turn a seasonal brief into campaign concepts, a recommendation and a full starter kit, grounded in ARKET brand context.",
      "instructions": "You help ARKET brand, studio, media and e-commerce teams develop campaign thinking from a brief. Use the campaign-starter-kit skill whenever someone asks for campaign concepts, a creative direction, channel copy or a starter kit. Ground your answers in the campaign briefs library and the brand context pack. Name the file you used. If something is missing, say what is missing rather than filling the gap. Be direct and useful on the first answer. Ask at most one question, and only when the answer would genuinely change the work. Never invent products, prices, results, customer research, targets or environmental claims. Never present your output as approved.",
      "knowledge": [
        "The Campaign Briefs document library on the enablement site",
        "ARKET Demo Brand Context Pack.docx"
      ],
      "starters": [
        "Give me three concepts for the Everyday Layers brief",
        "Turn the recommended concept into a full starter kit",
        "Write the channel starters for this campaign",
        "What is missing from this brief before we can start?"
      ]
    },
    "wall": [
      {
        "t": "It cannot act, only answer.",
        "d": "The agent produces content but cannot directly execute business actions."
      },
      {
        "t": "It cannot start by itself.",
        "d": "The agent is reactive unless a trigger or user action begins the flow."
      },
      {
        "t": "It cannot write anywhere automatically.",
        "d": "The agent needs a connected system or a user to write the output back."
      },
      {
        "t": "It cannot bring another person into a decision.",
        "d": "Human approval and accountability still need to be formalized."
      },
      {
        "t": "It cannot remember what happened last time.",
        "d": "History must be stored in an external system to be reused."
      }
    ],
    "studio": {
      "trigger": "When a file is created in the Campaign Briefs document library",
      "steps": [
        {
          "t": "A brief is added to the library",
          "d": "The agent starts by itself. Nobody opens Copilot, nobody pastes a prompt.",
          "conns": [
            "SharePoint"
          ]
        },
        {
          "t": "It reads the brief and drafts the starter kit",
          "d": "The same skill works without a person asking it to.",
          "conns": []
        },
        {
          "t": "It posts the draft to the creative channel",
          "d": "The concepts and recommendation land where the team already works.",
          "conns": [
            "Microsoft Teams"
          ]
        },
        {
          "t": "It asks the creative lead to approve a direction",
          "d": "A real approval, with the choice of concept, is sent to a named person.",
          "conns": [
            "Approvals"
          ]
        },
        {
          "t": "On approval, it creates the follow-on tasks",
          "d": "Studio shoot, media brief and copy tasks are assigned to owners and due dates.",
          "conns": [
            "Planner"
          ]
        },
        {
          "t": "It writes the outcome back",
          "d": "The chosen concept and approver are stored in a campaign log list.",
          "conns": [
            "SharePoint"
          ]
        }
      ],
      "note": "Every step here uses a standard connector. The interesting part is not the technology — it is that steps one, four and six were simply impossible one rung down."
    },
    "files": [
      {
        "i": "📄",
        "n": "ARKET Demo Brand Context Pack.docx",
        "d": "Brand facts from public sources plus the writing guide."
      },
      {
        "i": "📄",
        "n": "ARKET Demo Campaign Brief - Everyday Layers.docx",
        "d": "Fictional pre-fall brief used as the source material."
      },
      {
        "i": "📦",
        "n": "campaign-starter-kit.zip",
        "d": "The skill package ready to upload in Agent Builder."
      }
    ]
  },
  {
    "id": "store",
    "emoji": "🏬",
    "title": "Store Readiness Coach",
    "persona": "Retail Operations & Store Experience",
    "shape": "Distribute & collect",
    "brief": "Turns a campaign into a shop-floor checklist for each store format, then makes sure every store has actually done it.",
    "becomes": "On drop day every store gets its own checklist in Teams, confirms when it is done, and the retail lead sees who has not.",
    "lead": "The shape here is one thing going out to many places, and evidence coming back. It is the shape almost every operational rollout takes.",
    "everyday": "A campaign drops on Thursday. The visual merchandising guidance goes out as one attachment to fifty stores, each with a different footprint. Some read it, some improvise, and the area manager finds out what actually happened by walking in.",
    "megaPrompt": "You are preparing shop-floor guidance for ARKET store teams for a new campaign drop. Use the campaign brief and the visual merchandising guidelines as your sources. 1. Summarise the campaign in three sentences a store colleague can repeat to a customer. 2. Create a readiness checklist covering the window, the entry table, key styling on the floor, signage placement and stockroom preparation. 3. Write each checklist item as a single action a person can complete and tick, not as a principle. 4. Give three talking points for staff, in plain spoken language, including one honest answer to what makes these pieces worth the price. 5. Note anything that differs by store format, and say clearly when an item does not apply to a smaller store. 6. End with what a store should do if they do not have the full product assortment. Keep it short enough to be read before a shift. Do not invent product names, prices, stock levels or delivery dates.",
    "skill": {
      "name": "store-readiness",
      "why": "Generate three store-format variants of readiness guidance and staff talking points.",
      "tree": "<b>store-readiness/</b>\n├─ <b>SKILL.md</b> the method\n├─ references/\n│  ├─ brand-context.md source pack\n│  └─ claim-rules.md operating guidance\n└─ templates/\n   ├─ concept-comparison.md\n   ├─ channel-starters.md\n   └─ shot-outline.md",
      "instructions": "---\nname: store-readiness\ndescription: Turns an ARKET campaign brief into a shop-floor readiness checklist and staff talking points, adapted to store format. Use when someone asks what a store should do for a campaign, drop or seasonal change.\n---\n\n# Store readiness\n\n## Establish the format first\nAsk which store format applies if it is not stated: flagship, standard, or a store with a café. Use the format guide. Never give flagship guidance to a small store.\n\n## Produce\n1. A three-sentence campaign summary a colleague can say out loud to a customer.\n2. A checklist covering window, entry table, floor styling, signage and stockroom.\n3. Three staff talking points.\n4. A short note on what to do with a partial assortment.\n\n## Rules for checklist items\nEvery item is one action, completable in a single shift, and observable when done. If an item does not apply to the format, leave it out rather than marking it optional.\n\nDo not invent product names, prices, stock or delivery dates.",
      "scriptNote": ""
    },
    "agent": {
      "name": "ARKET Store Readiness Coach",
      "description": "Gives store teams a clear, format-appropriate checklist and staff talking points for any campaign or seasonal drop.",
      "instructions": "You help ARKET store colleagues and area managers prepare the shop floor for a campaign or seasonal drop. Use the store-readiness skill whenever someone asks what their store should do, how to set up for a drop, or what to tell customers. Ask which store format they are in if it is not clear, then adapt fully. Ground everything in the visual merchandising guidelines and the current campaign brief. Write for someone reading on their phone before a shift. Short sentences, concrete actions, no jargon. Never invent product names, prices, stock levels or delivery dates. If the brief does not cover something, say so.",
      "knowledge": [
        "ARKET Demo VM Guidelines.docx",
        "The Campaign Briefs document library",
        "ARKET Demo Store List.csv"
      ],
      "starters": [
        "What does my store need to do for the Everyday Layers drop?",
        "Give me the checklist for a store with a café",
        "What should staff say about this campaign?",
        "We only received half the assortment — what now?"
      ]
    },
    "wall": [
      {
        "t": "It cannot act, only answer.",
        "d": "The agent produces content but cannot directly execute business actions."
      },
      {
        "t": "It cannot start by itself.",
        "d": "The agent is reactive unless a trigger or user action begins the flow."
      },
      {
        "t": "It cannot write anywhere automatically.",
        "d": "The agent needs a connected system or a user to write the output back."
      },
      {
        "t": "It cannot bring another person into a decision.",
        "d": "Human approval and accountability still need to be formalized."
      },
      {
        "t": "It cannot remember what happened last time.",
        "d": "History must be stored in an external system to be reused."
      }
    ],
    "studio": {
      "trigger": "When a campaign drop date is reached, from a recurrence check against the campaign calendar list",
      "steps": [
        {
          "t": "Drop day arrives",
          "d": "The agent checks the campaign calendar list and sees today is a drop date. It starts itself.",
          "conns": [
            "SharePoint",
            "Recurrence"
          ]
        },
        {
          "t": "It builds a checklist per store format",
          "d": "Not one generic checklist — the flagship, standard and café variants, each from the same skill.",
          "conns": []
        },
        {
          "t": "It sends each store its own checklist",
          "d": "Posted to that store's Teams channel, addressed to that store, with only the items that apply to it.",
          "conns": [
            "Microsoft Teams"
          ]
        },
        {
          "t": "Stores confirm completion",
          "d": "A short form captures who completed it, when, and a photo of the window.",
          "conns": [
            "Microsoft Forms"
          ]
        },
        {
          "t": "It chases what is missing",
          "d": "Stores with nothing recorded get a reminder only if needed.",
          "conns": [
            "Microsoft Teams"
          ]
        },
        {
          "t": "The retail lead gets a Friday rollup",
          "d": "Completion by store, outstanding items, and the photos in one email.",
          "conns": [
            "Outlook"
          ]
        }
      ],
      "note": "There is a second reason this use case needs Copilot Studio. Agents built in Microsoft 365 Copilot cannot currently be used in Teams chat — and store colleagues live in Teams. That limitation alone decides the tool."
    },
    "files": [
      {
        "i": "📄",
        "n": "ARKET Demo VM Guidelines.docx",
        "d": "Fictional visual merchandising principles: window, entry table, floor, signage, and how formats differ."
      },
      {
        "i": "📊",
        "n": "ARKET Demo Store List.csv",
        "d": "About twenty fictional stores with format, market, café flag and channel name."
      },
      {
        "i": "📦",
        "n": "store-readiness.zip",
        "d": "The skill package including the store format reference."
      }
    ]
  },
  {
    "id": "copy",
    "emoji": "🔎",
    "title": "Product Copy & Claim Check",
    "persona": "E-commerce & Digital Trading",
    "shape": "Batch & approve",
    "brief": "Writes product page copy from a fact sheet, then checks every material and sustainability claim against an approved list.",
    "becomes": "A whole batch drafted overnight, with anything unevidenced held back and routed to brand for approval before it can ship.",
    "lead": "This is the strongest case for a script inside a skill. A model asked to check claims will usually be right. A script asked to check claims is right every time, and can prove it.",
    "everyday": "Two hundred products need copy before the season goes live. A copywriter works from fact sheets, and somewhere in the middle of the batch writes that something is sustainably made because the fact sheet mentioned recycled content.",
    "megaPrompt": "You are writing product page copy for an ARKET product from its fact sheet. Use the fact sheet, the material library and the writing guide as your sources. 1. Write a product title of no more than sixty characters. 2. Write a short description of forty to sixty words that says what the piece is, what it is made of and when someone would wear or use it. 3. Write three to five bullet points covering fit, material, construction and care. 4. List every claim you have made about material, origin, environment, durability or performance. 5. For each claim, quote the exact line in the fact sheet or material library that supports it. 6. Flag any claim you cannot evidence, and rewrite it as a version you can. Use calm, specific language. Do not describe anything as sustainable, eco-friendly, ethical or responsible unless the source says so in those words. Do not invent fibre percentages, certifications, origins, prices or availability.",
    "skill": {
      "name": "copy-and-claim-check",
      "why": "Draft product copy and verify each claim against a trusted evidence list.",
      "tree": "<b>copy-and-claim-check/</b>\n├─ <b>SKILL.md</b> the method\n├─ references/\n│  ├─ brand-context.md source pack\n│  └─ claim-rules.md operating guidance\n└─ templates/\n   ├─ concept-comparison.md\n   ├─ channel-starters.md\n   └─ shot-outline.md",
      "instructions": "---\nname: copy-and-claim-check\ndescription: Writes ARKET product page copy from a fact sheet and verifies every material, origin and environmental claim against the approved claims list. Use when someone asks for product copy, a product description, or a claim check.\n---\n\n# Product copy and claim check\n\n## Write first\nUse the copy template and the writing guide. Work only from the fact sheet plus the material library. If the fact sheet does not state something, do not write it.\n\n## Then check, with the script\nRun scripts/check_claims.py. It compares each claim to the approved claims list and returns approved, needs evidence, or not permitted.\n\n## Report\nGive the copy, then the claim table with the verdict and evidence for each claim. Rewrite anything marked not permitted into a version that passes, and show both.\n\nNever soften a not permitted verdict. If nothing supports a claim, the honest output is that the claim cannot be made.",
      "scriptNote": "Scripts included: scripts/check_claims.py"
    },
    "agent": {
      "name": "ARKET Product Copy Assistant",
      "description": "Writes product page copy from a fact sheet and checks every claim against the approved claims list before it goes anywhere.",
      "instructions": "You help ARKET e-commerce and copywriting teams produce product page copy that is accurate and on brand. Use the copy-and-claim-check skill whenever someone gives you a fact sheet or asks for product copy, a description or a claim check. Always run the claim check. Never present copy without its claim table. Ground everything in the material library and the writing guide. Work only from what the fact sheet states. If a claim cannot be evidenced, say so plainly and offer wording that can be. Do not negotiate with a failed claim. Never invent fibre percentages, certifications, origins, prices, availability or performance.",
      "knowledge": [
        "ARKET Demo Material and Claims Reference.docx",
        "The Product Fact Sheets document library"
      ],
      "starters": [
        "Write the copy for this fact sheet",
        "Check the claims in this description",
        "Rewrite this so every claim is evidenced",
        "Which claims here cannot be supported?"
      ]
    },
    "wall": [
      {
        "t": "It cannot act, only answer.",
        "d": "The agent produces content but cannot directly execute business actions."
      },
      {
        "t": "It cannot start by itself.",
        "d": "The agent is reactive unless a trigger or user action begins the flow."
      },
      {
        "t": "It cannot write anywhere automatically.",
        "d": "The agent needs a connected system or a user to write the output back."
      },
      {
        "t": "It cannot bring another person into a decision.",
        "d": "Human approval and accountability still need to be formalized."
      },
      {
        "t": "It cannot remember what happened last time.",
        "d": "History must be stored in an external system to be reused."
      }
    ],
    "studio": {
      "trigger": "When items are added to the Copy Queue list, or on a scheduled overnight run",
      "steps": [
        {
          "t": "It picks up the batch",
          "d": "Reads every product marked ready for copy from the queue list, rather than waiting to be handed one.",
          "conns": [
            "SharePoint"
          ]
        },
        {
          "t": "It drafts and checks each one",
          "d": "The same skill and the same script run across the whole batch unattended.",
          "conns": []
        },
        {
          "t": "Clean copy is written straight back",
          "d": "Products where every claim passed get their copy written into the list, marked ready for review.",
          "conns": [
            "SharePoint"
          ]
        },
        {
          "t": "Flagged claims go to brand for approval",
          "d": "Only exceptions are sent; each one carries the claim, the evidence found, and the suggested safe rewrite.",
          "conns": [
            "Approvals"
          ]
        },
        {
          "t": "Decisions are applied",
          "d": "Approved wording is written back. Rejected wording is replaced with the safe version automatically.",
          "conns": [
            "SharePoint"
          ]
        },
        {
          "t": "Everything is logged",
          "d": "Which claims were checked, the verdict, who approved what and when is stored for the season.",
          "conns": [
            "SharePoint"
          ]
        }
      ],
      "note": "The audit trail is the real deliverable here. A brand cannot be casual about material and environmental claims, and this is the rung where a decision becomes evidence rather than a memory."
    },
    "files": [
      {
        "i": "📄",
        "n": "ARKET Demo Material and Claims Reference.docx",
        "d": "Fictional material library with an approved claims table and the wording rules that go with it."
      },
      {
        "i": "📊",
        "n": "ARKET Demo Product Fact Sheets.csv",
        "d": "Fictional product fact sheets including one deliberately designed to trigger a failed claim."
      },
      {
        "i": "📦",
        "n": "copy-and-claim-check.zip",
        "d": "The skill package including the claim-checking script and approved claims file."
      }
    ]
  },
  {
    "id": "review",
    "emoji": "📋",
    "title": "Assortment Review Prep",
    "persona": "Buying, Merchandising & Range Planning",
    "shape": "Around a meeting",
    "brief": "Prepares you properly for a recurring review, then turns whatever was decided into tasks with owners.",
    "becomes": "The prep arrives the morning of the meeting without being asked, and the decisions become tracked work the same afternoon.",
    "lead": "This is the cleanest autonomy story of the five, because the trigger is time itself. It also touches almost everyone — every function in the business has a recurring meeting that is under-prepared and under-followed-up.",
    "everyday": "The assortment review is at ten. At nine forty someone opens last month's notes and tries to remember what was left unresolved. The meeting produces eight good decisions. Three of them are still remembered a fortnight later.",
    "megaPrompt": "You are preparing me for a recurring ARKET assortment review meeting. Use the planning guide and the notes from the previous review as your sources. 1. Remind me what was decided last time, in no more than five lines. 2. List what was left open, and who it was left with. 3. Identify the three to five questions this meeting actually needs to answer, phrased as decisions rather than topics. 4. For each question, note what we would need to know to decide it, and whether we appear to have that. 5. Flag the risks worth naming out loud, including anything that has now been carried across two reviews. 6. Suggest what does not need discussing, so we can protect the time. Be concise enough to read in five minutes. Separate what the notes actually say from what you are inferring. Do not invent figures, dates, sell-through or decisions that are not in the sources.",
    "skill": {
      "name": "review-prep",
      "why": "Prepare recurring reviews and convert decisions into tracked follow-up tasks.",
      "tree": "<b>review-prep/</b>\n├─ <b>SKILL.md</b> the method\n├─ references/\n│  ├─ brand-context.md source pack\n│  └─ claim-rules.md operating guidance\n└─ templates/\n   ├─ concept-comparison.md\n   ├─ channel-starters.md\n   └─ shot-outline.md",
      "instructions": "---\nname: review-prep\ndescription: Prepares an ARKET assortment or planning review from previous notes, and afterwards turns the meeting into a decision log with owners. Use when someone asks to be prepped for a review, or to write up what a meeting decided.\n---\n\n# Review preparation and follow-up\n\n## Which job is this\nBefore the meeting, produce a prep note. After the meeting, produce a decision log. If it is unclear which is wanted, prepare.\n\n## Prep note\nUse the prep template. Lead with what was decided last time and what is still open. Then the three to five decisions this meeting must reach, each with what is needed to decide it. Use the risk framing guide. Mark anything carried across two or more reviews.\n\n## Decision log\nUse the decision log template. Every decision gets an owner and a date. A decision without an owner is not a decision, so say so rather than inventing one.\n\n## Always\nSeparate what the notes state from what you are inferring. Never invent figures, sell-through, dates or decisions.",
      "scriptNote": ""
    },
    "agent": {
      "name": "ARKET Review Partner",
      "description": "Prepares planning and assortment reviews from previous notes, and turns decisions into a clear log with owners.",
      "instructions": "You help ARKET planning, merchandising and controlling teams get more out of recurring reviews. Use the review-prep skill when someone asks to be prepared for a review, or asks you to write up what was decided. Ground everything in the meeting notes library and the planning guide. Be explicit about what the notes say versus what you are inferring. Keep prep to something readable in five minutes. Be willing to say a topic does not need discussing. Never invent figures, sell-through, dates, owners or decisions. A decision with no owner should be flagged, not filled in.",
      "knowledge": [
        "The Review Notes document library",
        "ARKET Demo Planning Guide.docx"
      ],
      "starters": [
        "Prep me for the next assortment review",
        "What was left open last time?",
        "Turn these meeting notes into a decision log",
        "Which risks have carried across two reviews?"
      ]
    },
    "wall": [
      {
        "t": "It cannot act, only answer.",
        "d": "The agent produces content but cannot directly execute business actions."
      },
      {
        "t": "It cannot start by itself.",
        "d": "The agent is reactive unless a trigger or user action begins the flow."
      },
      {
        "t": "It cannot write anywhere automatically.",
        "d": "The agent needs a connected system or a user to write the output back."
      },
      {
        "t": "It cannot bring another person into a decision.",
        "d": "Human approval and accountability still need to be formalized."
      },
      {
        "t": "It cannot remember what happened last time.",
        "d": "History must be stored in an external system to be reused."
      }
    ],
    "studio": {
      "trigger": "A recurrence trigger the morning of each review, plus a follow-up run after it ends",
      "steps": [
        {
          "t": "The morning of the review",
          "d": "The agent wakes on schedule, checks the calendar for today's review and who is attending.",
          "conns": [
            "Recurrence",
            "Outlook"
          ]
        },
        {
          "t": "It prepares the prep note",
          "d": "Last cycle's decisions, what is still open, the decisions needed today, and carried-over risks.",
          "conns": [
            "SharePoint"
          ]
        },
        {
          "t": "It sends it before the meeting",
          "d": "In your inbox before the meeting begins, rather than at nine-forty.",
          "conns": [
            "Outlook"
          ]
        },
        {
          "t": "After the meeting, it drafts the decision log",
          "d": "From the notes or transcript, structured as decisions with owners rather than a wall of discussion.",
          "conns": []
        },
        {
          "t": "It creates the tasks",
          "d": "Every decision with an owner becomes a real task with a due date assigned to that person.",
          "conns": [
            "Planner"
          ]
        },
        {
          "t": "It emails the recap and stores the note",
          "d": "Attendees get the recap, and the note is filed where next month's prep will read it.",
          "conns": [
            "Outlook",
            "SharePoint"
          ]
        }
      ],
      "note": "Step six is what makes this compound. Because the agent files its own output, next cycle it reads its own previous note — and a risk carried across three reviews finally becomes visible."
    },
    "files": [
      {
        "i": "📄",
        "n": "ARKET Demo Planning Guide.docx",
        "d": "Fictional guide to how the review cycle works and how risks are framed."
      },
      {
        "i": "📄",
        "n": "ARKET Demo Previous Review Note.docx",
        "d": "A fictional prior review with decisions, open items and carried-over risks."
      },
      {
        "i": "📦",
        "n": "review-prep.zip",
        "d": "The skill package with prep and decision log templates."
      }
    ]
  },
  {
    "id": "signals",
    "emoji": "💬",
    "title": "Customer Signal Digest",
    "persona": "E-commerce, Service & Product",
    "shape": "Listen & route",
    "brief": "Turns raw customer feedback into themes with real counts and evidence, then sends each theme to the team that owns it.",
    "becomes": "A weekly digest that routes itself, and tracks whether a theme is growing rather than just reporting it again.",
    "lead": "The second script use case, and the most visibly convincing. Ask a model how many customers mentioned fit and it will estimate. Ask a script and it will count.",
    "everyday": "Feedback arrives from reviews, service tickets and returns reasons. It is read broadly by people who form an impression. Someone says customers keep mentioning sizing. Nobody can say whether that is nine people or ninety, or whether it is worse than last month.",
    "megaPrompt": "You are analysing customer feedback for ARKET. Use the feedback export as your source. 1. Group the feedback into themes. Use the customer's own language for theme names, not internal category names. 2. For each theme, give the number of items in it and the share of the total. 3. Quote two or three real examples per theme, unedited. 4. Say which product categories each theme appears in, and whether it is concentrated or spread. 5. Separate what customers said from what you infer it means. 6. Name the team best placed to act on each theme, and the one question they should look into. 7. Flag anything that reads as a safety, quality or legal concern separately and first. Do not estimate counts, and do not smooth over a theme that only has a few items. A small theme that is growing matters more than a large one that is flat. Do not invent feedback, customers or products.",
    "skill": {
      "name": "feedback-themes",
      "why": "Count themes exactly from feedback data and route them to the right business owner.",
      "tree": "<b>feedback-themes/</b>\n├─ <b>SKILL.md</b> the method\n├─ references/\n│  ├─ brand-context.md source pack\n│  └─ claim-rules.md operating guidance\n└─ templates/\n   ├─ concept-comparison.md\n   ├─ channel-starters.md\n   └─ shot-outline.md",
      "instructions": "---\nname: feedback-themes\ndescription: Turns an ARKET customer feedback export into counted themes with evidence, and routes each theme to the team that owns it. Use when someone asks what customers are saying, for a feedback digest, or to analyse reviews or service data.\n---\n\n# Customer feedback themes\n\n## Count with the script, read with judgement\nRun scripts/count_themes.py over the export first. It returns the item count, share of total and category spread for each theme in the taxonomy.\n\nNever state a count you did not get from the script. Never write vague quantity words where exact numbers are needed.\n\n## Then interpret\nFor each theme, quote two or three real examples unedited. Say what customers actually said, then separately what you think it means. Look at unmatched items too: a genuinely new theme usually appears there first.\n\n## Route it\nUse the routing map to name the owning team and give them one specific question to investigate.\n\n## Escalate first\nAnything suggesting a safety, quality or legal issue goes at the top, before any theme table.",
      "scriptNote": "Scripts included: scripts/count_themes.py"
    },
    "agent": {
      "name": "ARKET Customer Signal Digest",
      "description": "Turns customer feedback into counted themes with real evidence, and points each theme at the team that can act on it.",
      "instructions": "You help ARKET e-commerce, service, product and brand teams understand what customers are actually saying. Use the feedback-themes skill whenever someone asks about customer feedback, reviews, complaints, returns reasons or what customers think. Always run the counting script. Never estimate a number or use vague quantity words. Quote real feedback rather than paraphrasing it. Keep what customers said separate from what you think it means. Put anything that reads as a safety, quality or legal concern first, regardless of how few items it involves. Never invent feedback, customers, products or counts.",
      "knowledge": [
        "ARKET Demo Customer Feedback.csv",
        "The Customer Feedback document library"
      ],
      "starters": [
        "What are customers saying this week?",
        "Show me the themes with counts and examples",
        "Which team should act on each theme?",
        "Is the sizing theme growing or shrinking?"
      ]
    },
    "wall": [
      {
        "t": "It cannot act, only answer.",
        "d": "The agent produces content but cannot directly execute business actions."
      },
      {
        "t": "It cannot start by itself.",
        "d": "The agent is reactive unless a trigger or user action begins the flow."
      },
      {
        "t": "It cannot write anywhere automatically.",
        "d": "The agent needs a connected system or a user to write the output back."
      },
      {
        "t": "It cannot bring another person into a decision.",
        "d": "Human approval and accountability still need to be formalized."
      },
      {
        "t": "It cannot remember what happened last time.",
        "d": "History must be stored in an external system to be reused."
      }
    ],
    "studio": {
      "trigger": "A weekly recurrence, plus an immediate check when new feedback arrives in the list",
      "steps": [
        {
          "t": "It runs every Monday",
          "d": "It also wakes when new feedback lands, so an urgent signal does not wait for the weekly cycle.",
          "conns": [
            "Recurrence",
            "SharePoint"
          ]
        },
        {
          "t": "It reads only what is new",
          "d": "Feedback since the last run, so counts are about this week rather than everything ever recorded.",
          "conns": [
            "SharePoint"
          ]
        },
        {
          "t": "It counts, themes and compares",
          "d": "The same script, plus last week's stored counts, which turns a number into a trend.",
          "conns": []
        },
        {
          "t": "Each theme goes to its owning team",
          "d": "Sizing to product, delivery to operations, quality to sourcing.",
          "conns": [
            "Microsoft Teams"
          ]
        },
        {
          "t": "Anything serious escalates immediately",
          "d": "Safety, quality and legal signals are emailed the moment they appear.",
          "conns": [
            "Outlook"
          ]
        },
        {
          "t": "It stores this week's counts",
          "d": "Written to a themes list, so next week can say growing, shrinking or steady with a number behind it.",
          "conns": [
            "SharePoint"
          ]
        }
      ],
      "note": "Step six is the quiet one that changes everything. Once the agent keeps its own history, the digest stops describing the present and starts showing direction."
    },
    "files": [
      {
        "i": "📊",
        "n": "ARKET Demo Customer Feedback.csv",
        "d": "Around forty fictional feedback rows across categories, with a plausible theme mix and one safety-flavoured item."
      },
      {
        "i": "📄",
        "n": "ARKET Demo Feedback Taxonomy.docx",
        "d": "The standing themes, their keywords, and which team owns each one."
      },
      {
        "i": "📦",
        "n": "feedback-themes.zip",
        "d": "The skill package including the counting script and taxonomy."
      }
    ]
  }
];
