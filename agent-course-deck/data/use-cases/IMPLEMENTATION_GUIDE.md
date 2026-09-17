# Implementation Guide: Using Enriched Schema in agent-usecase-library.html

## Overview
With the enriched schema in place, the agent-usecase-library page can now support:
- Persona-based filtering and navigation
- Tier-based complexity indicators
- Capability-based tool discovery
- Cross-industry reusability

## Practical Updates for the Page

### 1. Enhanced Card Display

**Current:**
```
[emoji] Title
Persona
Brief
"By session 3: " outcome
```

**Enhanced:**
```
[emoji] Title                          [light|medium|heavy badge]
Persona name                           [# of capabilities]
Brief
Scenario: "Agent does X when Y happens"
Tools: [Word, Teams, Forms, Scheduling]
Value: "Clear outcome or benefit"
[existing detail view below]
```

### 2. Persona-Based Navigation

Instead of hardcoded text, the page can now load personas dynamically:

```javascript
// Load personas registry
fetch('./data/use-cases/personas.json')
  .then(r => r.json())
  .then(data => {
    // Create pill buttons from personas.personas array
    // Show count of use cases per persona
    // Filter use cases by selected persona
  });
```

### 3. Tier-Based Filtering

Add filter buttons alongside search:

```
[All tiers] [Light] [Medium] [Heavy]
  Light:   4 use cases (quick briefings & digests)
  Medium:  2 use cases (document/analysis work)  
  Heavy:   2 use cases (deep research & complex workflows)
```

### 4. Capability-Based Discovery

Show which tools/features each use case needs:

```
Filter by Microsoft 365 Tool:
[Enterprise Search] [Word] [Excel] [Teams] [SharePoint] [Script-based] ...

Campaign Concept Partner uses: Enterprise Search, Word, PowerPoint, Deep Research
```

### 5. Card Sorting/Grouping

Organize cards by:
- **By Persona** (current implicit, now explicit)
- **By Tier** (light → medium → heavy)
- **By Cadence** (scheduled, on-demand, event-triggered)

## Rendering Enhancement Example

```javascript
// Existing use case data now includes:
{
  id: "campaign",
  tier: "medium",
  scenario: "A scheduled or event-triggered agent reads seasonal briefs...",
  capabilities: ["Enterprise Search", "Word", "PowerPoint", "Deep Research"],
  value: "Replaces half a day of manual concepting with three developed directions...",
  // + all existing fields (implementation, deliverables, etc.)
}

// Enhanced card HTML:
function cardHTML(u) {
  const personaName = lookupPersona(u.persona).name; // Look up from personas.json
  
  return `
    <div class="card">
      <div class="card-top">
        <div>
          <span class="emoji">${u.emoji}</span>
          <h3>${u.title}</h3>
        </div>
        <span class="tier-badge ${u.tier}">${u.tier}</span>
      </div>
      
      <div class="persona">${personaName}</div>
      <p class="brief">${u.summary}</p>
      
      <div class="scenario">
        <strong>Scenario:</strong> ${u.scenario}
      </div>
      
      <div class="capabilities">
        <strong>Capabilities:</strong> ${u.capabilities.join(', ')}
      </div>
      
      <div class="value">
        <strong>Value:</strong> ${u.value}
      </div>
      
      <div class="action">Open use case →</div>
    </div>
  `;
}
```

## Data Loading Updates

Replace inline data with dynamic loading:

```javascript
// Instead of embedded USE_CASES array
let USE_CASES = [];
let PERSONAS = {};

Promise.all([
  fetch('./data/use-cases/catalog.json').then(r => r.json()),
  fetch('./data/use-cases/personas.json').then(r => r.json())
])
.then(([catalog, personasData]) => {
  USE_CASES = catalog.useCases;
  PERSONAS = personasData.personas.reduce((map, p) => {
    map[p.id] = p;
    return map;
  }, {});
  render();
});
```

## Industry/Customer Layering Ready

The enriched schema is now structured for:

### Industry Profile (e.g., fashion-retail.json)
```json
{
  "industry": "fashion-retail",
  "personas": ["brand-creative", "retail", "ecommerce", "merchandising"],
  "useCase": {
    "campaign": { "enabled": true, "order": 1 },
    "store": { "enabled": true, "order": 2 },
    "copy": { "enabled": true, "order": 3 },
    "review": { "enabled": true, "order": 4 },
    "signals": { "enabled": false }
  }
}
```

### Customer Profile (e.g., arket.json)
```json
{
  "customer": "arket",
  "industry": "fashion-retail",
  "personas": {
    "brand-creative": { "enabled": true },
    "retail": { "enabled": true },
    "ecommerce": { "enabled": false }
  },
  "useCases": {
    "campaign": { "enabled": true },
    "signals": { "enabled": true, "overrideScenario": "..." }
  }
}
```

Then filter at load time:
```javascript
// Load only use cases enabled for this customer
const enabledUseCases = USE_CASES.filter(uc => {
  const profile = customerProfile.useCases[uc.id];
  return profile && profile.enabled !== false;
});
```

## CSS/Styling for New Elements

```css
/* Tier badge */
.tier-badge {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  padding: 3px 8px; border-radius: 4px; white-space: nowrap;
}
.tier-badge.light { background: #e8f5e9; color: #2e7d32; }
.tier-badge.medium { background: #fff3e0; color: #e65100; }
.tier-badge.heavy { background: #fce4ec; color: #c2185b; }

/* Scenario and value sections */
.scenario, .value {
  font-size: 13px; color: var(--cp-text-muted);
  padding: 10px 0;
  border-top: 1px dashed var(--cp-border);
}
.scenario strong, .value strong {
  color: var(--cp-text);
  font-weight: 600;
}

/* Capabilities tags */
.capabilities {
  display: flex; gap: 6px; flex-wrap: wrap;
  font-size: 12px; margin: 8px 0;
}
.cap-tag {
  background: var(--cp-surface-soft); 
  border: 1px solid var(--cp-border);
  border-radius: 4px; padding: 2px 8px;
  color: var(--cp-text-soft);
}
```

## Migration Path

1. **Phase 1:** Add enriched fields to catalog (✓ Done)
2. **Phase 2:** Create personas registry (✓ Done)
3. **Phase 3:** Update card rendering to use enriched fields
4. **Phase 4:** Add persona/tier/capability filtering
5. **Phase 5:** Implement industry and customer profile layers
6. **Phase 6:** Add dynamic scenario/capability overrides per customer

## Files Ready to Use

```
agent-course-deck/data/use-cases/
├── catalog.json (enriched: tier, scenario, capabilities, value)
├── personas.json (new: persona registry)
├── schema/
│   ├── use-case-enriched.schema.json (new: defines enriched structure)
│   └── personas.schema.json (new: defines personas structure)
└── ENRICHMENT.md (this document)
```

## Next Steps

When ready, you can:
1. Load personas dynamically in the page
2. Display tier badges on cards
3. Add tier and capability filters
4. Create first industry profile (fashion-retail)
5. Create first customer profile (arket or test customer)
6. Build profile selector UI
