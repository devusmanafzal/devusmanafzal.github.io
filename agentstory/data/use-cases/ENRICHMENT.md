# Agent Use-Case Schema Enrichment

## Overview
The agent-usecase-library schema has been enriched with meaningful patterns from the Cowork use-cases library. All financial/cost data excluded as requested. Focus is on structural depth and cross-industry reusability.

## New Schema Files Created

### 1. **use-case-enriched.schema.json**
Extended JSON Schema draft-2020-12 for individual use cases.

**New Fields Added:**
- **tier** (light | medium | heavy)
  - Light: Quick briefing or digest (70-200 credits est.)
  - Medium: Document/analysis work (400-600 credits est.)
  - Heavy: Deep research or comprehensive (1,500+ credits est.)

- **scenario** (string)
  - Situational description: "When X happens, the agent does Y"
  - Context that explains what the use case looks like in practice

- **capabilities** (array)
  - Microsoft 365 tools used: Word, Excel, PowerPoint, Teams, SharePoint, Forms, etc.
  - Plugins referenced: Enterprise Search, Deep Research, Browser use (Edge), etc.
  - Custom: "Script-based validation", "Script-based counting"

- **value** (string)
  - Clear value proposition: what problem is solved, what becomes better
  - Complementary to `narrative.becomes` but more concise

- **relatedUseCases** (array)
  - IDs of other use cases this connects to or builds from

### 2. **personas.schema.json**
JSON Schema for the personas registry—separate from use cases.

**Structure:**
```json
{
  "personas": [
    {
      "id": "string (unique)",
      "emoji": "string",
      "name": "string (persona group title)",
      "role": "string (who is in this group and what they do)"
    }
  ]
}
```

### 3. **personas.json** (Data File)
The actual personas registry for ARKET. Includes:
- Brand, Content & Creative Studio
- Retail Operations & Store Experience
- E-commerce & Digital Trading
- Buying, Merchandising & Range Planning
- Supply, Quality & Sustainability

## Enriched Catalog

The catalog.json now includes for each use case:

| Use Case | Tier | Capabilities | Scenario Focus |
|----------|------|--------------|---|
| Campaign Concept Partner | medium | Enterprise Search, Word, PowerPoint, Deep Research | Brief → 3 concepts + starter kit |
| Store Readiness Coach | medium | Word, Teams, Forms, Scheduling | Campaign drop → store checklists → completion proof |
| Product Copy & Claim Check | heavy | Word, Excel, Script validation | Batch product descriptions with automated claim verification |
| Assortment Review Prep | light | Enterprise Search, Word, Tasks, Scheduling | Weekly prep & post-meeting task conversion |
| Customer Signal Digest | heavy | Excel, Script counting, Enterprise Search | Continuous feedback → weekly themed digest with exact counts |

## Design Rationale

### Why These Enrichments?
1. **Tier** - Helps customers understand complexity and resource needs at a glance
2. **Scenario** - Answers "when do I use this?" not just "what does it do?"
3. **Capabilities** - Shows what Microsoft 365 tools/features are required
4. **Value** - One-sentence ROI so decision makers can prioritize
5. **Personas** - Separate registry allows many-to-many relationships (one persona can run many use cases)

### Preserved Structure
All existing fields remain intact:
- Implementation rungs (prompt, skill, agent, workflow)
- Deliverables (files needed)
- Limitations (what the agent cannot do)
- Narrative (everyday context and outcomes)

### Cowork Patterns Adapted
✓ Personas as a separate, referenceable registry  
✓ Tier classification (light/medium/heavy)  
✓ Scenario descriptions (situational context)  
✓ Capabilities list (tools and features used)  
✓ Value proposition (outcome/benefit)  

✗ Financial data (excluded per request)  
✗ Cadence/frequency (can be added per industry profile if needed)

## Usage

### For Page Rendering (agent-usecase-library.html)
Display cards can now show:
```
[emoji] Title
[persona name] | [tier badge]
Scenario: ...
Capabilities: [tool list]
Value: ...
[existing detail structure]
```

### For Filtering & Navigation
- Filter by tier (light/medium/heavy)
- Filter by persona
- Filter by capability (tools used)
- Sort by complexity

### For Industry/Customer Layering
- Each industry profile can prioritize by tier
- Each customer can enable/disable by persona
- Cross-industry reuse is now structured

## Next Steps

When ready, you can:
1. **Add frequency/cadence** to scenarios ("weekly run", "on-demand", "event-triggered")
2. **Build industry profiles** that reference personas and tier distributions
3. **Create customer profiles** that select specific use cases per persona
4. **Add measurement mappings** if cost tracking becomes relevant later
5. **Extend capabilities** as new Microsoft 365 plugins become available

## Files Modified/Created

```
agent-course-deck/data/use-cases/
├── catalog.json (enriched with tier, scenario, capabilities, value)
├── personas.json (new: persona registry)
└── schema/
    ├── use-case-enriched.schema.json (new: detailed use case schema)
    └── personas.schema.json (new: personas registry schema)
```
