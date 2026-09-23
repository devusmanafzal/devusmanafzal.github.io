# The Digital Agency

## Current Presentation Plan

> **Current runtime note:** The source contains 64 scenes: the existing 20-scene enabled keynote, 29 disabled alternatives and personal-story scenes, and a final staged chapter of 15 disabled agent scenes. The agent chapter is fully renderable but remains outside the live sequence pending editorial integration.

This document describes the enabled runtime in `keynote.html`. The presentation data in `data/masterstory.json` and runtime in `scripts/keynote.js` are authoritative when this document and the implementation disagree.

The experience is a cinematic, full-screen HTML keynote about the shift from AI tools to governed participants in work. Its current opening thesis is:

> The future of work is not about removing people. It is about removing the work that keeps people from being fully human.

## Audience Outcome

Senior leaders should leave discussing:

- How intelligence is becoming part of the workforce.
- How human oversight changes as agents gain autonomy.
- How humans and role-based digital colleagues fit into one organization.
- Why enterprises will manage portfolios of models rather than choose one winner.
- Why orchestration, governance, trust, and consumption become operating capabilities.

## Enabled Runtime

With the current configuration, the deck contains 20 enabled scenes. Scene numbers below are dynamic: changing a scene's `enabled` value changes the numbering used by `?scene=N`, the counter, and progress.

| Scene | Purpose | Treatment |
| ---: | --- | --- |
| 1 | The Digital Agency | Human-centered opening thesis with the future organizational-chart backdrop |
| 2 | Scout introduction | Configured full-screen `scout-intro.mp4` video |
| 3 | The Prompting Was Only the Beginning | Presenter image and the shift from task prompting to operating-model change |
| 4 | Speaker introduction | Usman Afzal portrait and role |
| 5 | Intelligence Is Moving Closer to Actions | Two-build evolution from 1950-2020 technology to chatbots, copilots, agents, and digital colleagues |
| 6 | Shift 1: Digital Labor | Mountain progression from conversation through collaboration and delegation to autonomous work |
| 7 | Shift 2: Human Off the Loop | Human-in, human-on, and bounded human-off-the-loop progression |
| 8 | Shift 3: Role-Based Autonomy | Interactive agent to autonomous agent to digital employee |
| 9 | The New Organizational Chart | Humans and specialized AI roles, with a link to Agency |
| 10 | Recorded agency demonstration | Configured full-screen `agency-demo-web.mp4` video |
| 11 | Microsoft AI Approach | Two-build Intelligence + Trust architecture |
| 12 | Microsoft AI Approach with Copilot | Two-build Assistants, Delegates, and Autopilots framework |
| 13 | Microsoft AI Approach with Copilot | Multi-Model, Multi-Harness, platform, and secure-work strategy |
| 14 | There Will Not Be One Model | Governed portfolio of model providers and experiences |
| 15 | From Model Selection to Orchestration | Human choice to platform routing to model collaboration |
| 16 | Multimodal Intelligence | Text, images, voice, video, screens, and data connected to a reasoning core |
| 17 | Configured video interlude | Configured full-screen `open-the-door-web.mp4` video |
| 18 | Governance as Capability | Data, actions, decisions, and intelligence within an Agent 365 control ring |
| 19 | Five Questions for the Agentic Era | Leadership discussion prompts |
| 20 | Thank You | Presenter portrait and LinkedIn QR code |

## Narrative Content

### The Digital Agency

**On-screen idea:** What happens when intelligence becomes part of the workforce?

**Speaker intent:** Establish a human-centered definition of digital labor and reveal the future organization.

### Prompting to Agency

**On-screen idea:** A prompt changes a task. Agency changes the operating model.

**Speaker intent:** Treat prompt adoption as the starting point, not the destination.

### Intelligence Closer to Action

**Evolution:** Mainframes -> personal computers -> internet -> mobile -> cloud -> digital workplace -> chatbots -> copilots -> agents -> digital colleagues.

**Speaker intent:** Show intelligence moving closer to action, identity, responsibility, and collaboration.

### Three Organizational Shifts

1. Conversation -> collaboration -> delegation to agents -> digital labor.
2. Human in the loop -> human on the loop -> human off the loop.
3. Interactive agents -> autonomous agents -> role-based digital employees.

**Speaker intent:** Connect increasing capability to changing oversight, durable identity, access, and accountability.

### The New Organizational Chart

**Hybrid workforce:** A founder, AI chief of staff, four AI specialists, and two human collaborators.

**Speaker intent:** Ask leaders to consider role design, management, escalation, and accountability. Agency demonstrates the operating surface behind the chart.

### Microsoft AI Approach

**Architecture:** Copilot experiences, Copilot Studio, GitHub Copilot, Fabric, Foundry, Azure, Microsoft IQ, Agent 365, and Security.

**Experience progression:** Assistants -> Delegates -> Autopilots, expressed through Chat, Cowork, Code, and Autopilots.

**Platform strategy:** Multi-Model, Multi-Harness, World's Best Platform, and cloud-native enterprise-grade secure AI for work.

**Speaker intent:** Present a governed path from organizational intelligence to experiences and sustained execution, rather than a disconnected product catalogue.

### Model Portfolio and Orchestration

**Portfolio:** Copilot, OpenAI, Anthropic, Google, Mistral, Meta, Microsoft Phi, DeepSeek, Hugging Face, and IBM Granite.

**Evolution:** Human chooses model -> platform routes -> models collaborate.

**Speaker intent:** Competitive advantage moves toward routing, orchestration, evaluation, policy, and cost control.

### Multimodal Intelligence

**Modalities:** Text, images, voice, video, screens, and enterprise data.

**Speaker intent:** Multimodality expands the range of work AI can understand and perform.

### Governance

**Domains:** Govern data, actions, decisions, and intelligence.

**Speaker intent:** Governance enables confident scale. Agent 365 represents management and control across the agent estate.

### Five Questions for the Agentic Era

1. Which work should be delegated to agents?
2. Which decisions must remain human?
3. How should model choice be governed?
4. How will AI consumption be funded and managed?
5. What does your future organizational chart look like?

## Disabled Alternatives

The following scenes remain in `data/masterstory.json` with `enabled: false` and are excluded from runtime numbering:

- WorkScape Circle event landing.
- Original From Copilots to Digital Colleagues title.
- Live audience guide.
- Audience challenge.
- WorkScape event-backdrop thank-you scene.

Keep these alternatives through the event. Archive them afterward if they are no longer useful rather than carrying them indefinitely in the live file.

## Staged Agent Chapter

Fifteen scenes are appended to `data/masterstory.json` under the `agent` section with `enabled: false`. They cover the journey from agent foundations through Agent Builder, Copilot Studio, platform boundaries, and a closing call to action.

The scene markup and commentary are maintained directly in `data/masterstory.json`. `styles/agentstory.css` provides a scoped visual layer, and `scripts/keynote.js` binds the TED-talk reveal controls as part of the shared keynote runtime.

This staging step does not decide final narrative placement, remove overlapping keynote scenes, or enable the chapter. Those are editorial decisions for the next phase.

## Motion and Visual System

- True or near-black full-screen stage.
- Large Segoe UI/Aptos editorial typography with no negative letter spacing.
- Palette-driven accent color with restrained ambient particles.
- Projector-safe composition around a responsive 16:9 design area.
- Zoom and traversal communicate changes of scale or operating model.
- Routing lines communicate orchestration and delegation.
- Layer separation communicates architecture and governance.
- Stillness supports thesis statements and leadership questions.
- Reduced-motion states must preserve each scene's completed meaning.

Motion should clarify meaning and never delay the presenter. The two Microsoft approach scenes use a shared-title FLIP handoff.

## Configuration

The current `meta.defaultPalette` in `data/masterstory.json` is the original keynote palette:

```json
{
  "meta": {
    "defaultPalette": "keynote"
  }
}
```

- `keynote`: original rose accent.
- `workscape`: organizer sage, forest, and lime accents.
- URL override: `?palette=workscape` or `?palette=keynote`.
- Live preview: press `T` without changing scenes.

### Configured Videos

All three videos are currently enabled and use `fit: "contain"`:

| Configuration key | Source | Initial audio |
| --- | --- | --- |
| `scoutIntroAfterScene2` | `assets/videos/scout-intro.mp4` | Unmuted |
| `agencyDemoAfterScene11` | `assets/videos/agency-demo-web.mp4` | Muted |
| `videoBeforeScene13` | `assets/videos/open-the-door-web.mp4` | Unmuted |

The legacy key names describe historical insertion points; the scene table above describes the current positions. Setting any video's `enabled` property to `false` removes it and recalculates navigation, numbering, and progress.

Videos start on entry, pause and reset on exit, and show a centered play control if autoplay is blocked. Clicking the video toggles playback; `M` toggles mute.

## Controls

- `ArrowRight`, `ArrowDown`, `PageDown`, `Space`, click, wheel down, or the continue cue: next build or scene.
- `ArrowLeft`, `ArrowUp`, `PageUp`, wheel up, or horizontal swipe: previous build or scene.
- `Home` / `End`: first / final enabled scene.
- `F`: enter or exit fullscreen.
- `M`: mute or unmute the active video.
- `T`: toggle palette.
- `C`: hide or restore commentary for the browser session.
- `D`: toggle the developer scene counter.
- `Esc`: close commentary.

Direct review links use `?scene=N` against the current enabled sequence. Presenter mode is future scope; there is no `P` control in the runtime.

## Connectivity

The presentation and local media run from a local HTTP server. The Lovable reaction overlay is loaded from `https://usman-live.lovable.app/api/public/embed.js` and therefore requires internet access. Without connectivity, the core deck still runs but live reactions do not.

## Media and Attribution

- High-resolution local media lives under `assets/`.
- Presenter-supplied media and third-party licenses are recorded in `assets/credits.json` and summarized in `assets/README.md`.
- The Agency round trip preserves theme and palette through query parameters and session storage.

## Validation Checklist

- [x] Current enabled sequence is documented as 20 scenes with all three videos enabled.
- [x] Keyboard, click, wheel, swipe, fullscreen, palette, commentary, and video controls are implemented.
- [x] Configured videos recalculate runtime navigation when disabled.
- [ ] Confirm the second Digital Agency opening reads as a reveal rather than repetition.
- [ ] Time a complete rehearsal using actual video durations and build delays against the 20-minute target.
- [ ] Verify text and diagrams at 1920x1080, 3840x2160, 4:3, and mobile widths.
- [ ] Verify video autoplay fallback, reset behavior, and failure handling in the delivery browser.
- [ ] Verify reduced-motion completed states.
- [ ] Verify the Agency round trip and online reaction overlay in the event environment.

## Historical Notes

- The presentation began as From Copilots to Digital Colleagues for WorkScape Circle 2026.
- Earlier iterations included an event landing, live audience guide, original title, audience challenge, and event-branded ending; these remain disabled alternatives.
- The evolution scene was consolidated into one title build and one integrated 1950-2026 timeline build.
- The narrative later shifted to The Digital Agency and added human oversight, role-based autonomy, a recorded agency demonstration, and a three-part Microsoft AI approach.
- This plan was reconciled with the enabled runtime on 2026-08-29.
