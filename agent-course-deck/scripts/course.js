    // Configuration
    const CONFIG = {
      sceneAnimationDuration: 1100,
      wheelLockDuration: 700,
      controlHintDuration: 3000
    };

    // Data Manager
    class DataManager {
      constructor() {
        this.data = null;
        this.manifest = null;
        this.allScenes = [];
        this.sessions = [];
      }

      async load() {
        try {
          const manifestPath = document.body.dataset.manifest || 'data/course-manifest.json';
          const manifestDirectory = manifestPath.slice(0, manifestPath.lastIndexOf('/') + 1);
          const manifestFile = manifestPath.slice(manifestPath.lastIndexOf('/') + 1);

          // When opened directly from disk (file://), fetch() is blocked by the
          // browser's CORS policy. Fall back to data pre-loaded as window globals
          // by data/*.js companion files (see index.html script tags).
          const inlineManifest = window.__AGENT_COURSE_MANIFEST__;
          const inlineSessions = window.__AGENT_COURSE_SESSION_DATA__;
          const useInlineData = window.location.protocol === 'file:' && inlineManifest;

          this.manifest = useInlineData ? inlineManifest : await (await fetch(manifestPath)).json();
          const params = new URLSearchParams(window.location.search);
          const requestedSession = params.get('session');
          const availableSessions = this.manifest.sessions.filter((session) => session.enabled);
          const selectedSessions = requestedSession
            ? availableSessions.filter((session) => String(session.number) === requestedSession || session.id === requestedSession)
            : availableSessions;
          const sessionsToLoad = selectedSessions.length ? selectedSessions : availableSessions.slice(0, 1);
          const sessionData = await Promise.all(sessionsToLoad.map(async (session) => {
            if (useInlineData && inlineSessions?.[session.file]) return inlineSessions[session.file];
            const sessionResponse = await fetch(`${manifestDirectory}${session.file}`, { cache: 'no-store' });
            if (!sessionResponse.ok) throw new Error(`Unable to load ${session.file}`);
            return sessionResponse.json();
          }));
          this.data = { ...this.manifest, sessions: sessionData };
          this.sessions = sessionData;
          this.buildSceneIndex();
          console.log('✓ Course loaded:', this.manifest.series.title);
          return true;
        } catch (error) {
          console.error('✗ Error loading course:', error);
          return false;
        }
      }

      buildSceneIndex() {
        this.allScenes = [];
        this.sessions.forEach((session, sessionIdx) => {
          const sectionsBySceneId = new Map(
            (session.sections || []).flatMap((section) => section.sceneIds.map((sceneId) => [sceneId, section]))
          );
          session.scenes.filter((scene) => !scene.hidden).forEach((scene, sceneIdx) => {
            this.allScenes.push({
              ...scene,
              commentary: session.commentary?.[scene.id] || scene.commentary,
              section: sectionsBySceneId.get(scene.id) || null,
              sessionIndex: sessionIdx,
              sceneIndex: sceneIdx,
              globalIndex: this.allScenes.length
            });
          });
        });
      }

      getTotalScenes() {
        return this.allScenes.length;
      }

      getScene(index) {
        if (index < 0 || index >= this.allScenes.length) return null;
        return this.allScenes[index];
      }
    }

    // Scene Renderer
    class SceneRenderer {
      formatTitle(title) {
        const words = title.trim().split(/\s+/);
        if (words.length < 2) return title;
        const accentStart = words.length > 4 ? words.length - 2 : words.length - 1;
        return `${words.slice(0, accentStart).join(' ')} <span class="accent">${words.slice(accentStart).join(' ')}</span>`;
      }

      node(className, title, detail) {
        const el = document.createElement('div');
        el.className = className;
        if (title) {
          const strong = document.createElement('strong');
          strong.textContent = title;
          el.appendChild(strong);
        }
        if (detail) {
          const span = document.createElement('span');
          span.textContent = detail;
          el.appendChild(span);
        }
        return el;
      }

      renderStage(visual, sceneId) {
        if (!visual) return null;
        const builder = this.stageBuilders[visual.type];
        if (!builder) return null;

        const stage = document.createElement('section');
        stage.className = `scene-stage scene-stage-${visual.type}`;
        if (sceneId) stage.dataset.sceneId = sceneId;
        stage.setAttribute('aria-label', visual.label || 'Slide visual');
        if (visual.items) stage.style.setProperty('--visual-count', String(visual.items.length));
        builder(stage, visual);
        return stage;
      }

      get stageBuilders() {
        return {
          console: (stage, v) => {
            stage.innerHTML = `<div class="console-bar"><span></span><span></span><span></span></div>`;
            stage.appendChild(this.node('console-line weak', 'you:', v.promptBefore));
            const improvedLine = this.node('console-line strong', 'you:');
            if (v.promptAfterRuns) {
              v.promptAfterRuns.forEach((run) => {
                const span = document.createElement('span');
                span.textContent = run.text;
                if (run.color) span.style.color = run.color;
                improvedLine.appendChild(span);
              });
            } else {
              improvedLine.appendChild(this.node('', undefined, v.promptAfter));
            }
            stage.appendChild(improvedLine);
            if (v.note) { const note = document.createElement('p'); note.className = 'console-note'; note.textContent = v.note; stage.appendChild(note); }
          },
          duel: (stage, v) => {
            stage.appendChild(this.node('duel-side muted', v.left.label, v.left.detail));
            const vs = document.createElement('div'); vs.className = 'duel-vs'; vs.textContent = 'VS'; stage.appendChild(vs);
            stage.appendChild(this.node('duel-side accent', v.right.label, v.right.detail));
          },
          'failure-modes': (stage, v) => {
            const grid = document.createElement('div');
            grid.className = 'failure-modes-grid';
            (v.items || []).forEach((item) => {
              const card = document.createElement('article');
              card.className = 'failure-mode-card';
              const number = document.createElement('span');
              number.className = 'failure-mode-number';
              number.textContent = item.number;
              const title = document.createElement('h3');
              title.textContent = item.label;
              const detail = document.createElement('p');
              detail.textContent = item.detail;
              card.append(number, title, detail);
              grid.appendChild(card);
            });
            stage.appendChild(grid);
          },
          'prompt-anatomy': (stage, v) => {
            const grid = document.createElement('div');
            grid.className = 'failure-modes-grid prompt-anatomy-grid';
            const flyout = document.createElement('div');
            flyout.className = 'prompt-anatomy-flyout';
            flyout.hidden = true;
            flyout.setAttribute('role', 'dialog');
            flyout.setAttribute('aria-modal', 'true');
            const flyoutPanel = document.createElement('div');
            flyoutPanel.className = 'prompt-anatomy-flyout-panel';
            const flyoutClose = document.createElement('button');
            flyoutClose.className = 'prompt-anatomy-flyout-close';
            flyoutClose.type = 'button';
            flyoutClose.textContent = '\u00d7';
            flyoutClose.setAttribute('aria-label', 'Close prompt anatomy details');
            const flyoutContent = document.createElement('div');
            flyoutContent.className = 'prompt-anatomy-flyout-content';
            flyoutPanel.append(flyoutClose, flyoutContent);
            flyout.appendChild(flyoutPanel);
            let activeCard = null;

            const closeFlyout = (restoreFocus = true) => {
              if (!activeCard) return;
              const cardToFocus = activeCard;
              activeCard.classList.remove('is-flipped');
              activeCard.setAttribute('aria-expanded', 'false');
              activeCard.setAttribute('aria-label', `Show details for ${activeCard.dataset.cardLabel}`);
              activeCard = null;
              grid.classList.remove('has-flyout');
              flyout.classList.remove('is-open');
              flyout.hidden = true;
              if (restoreFocus) cardToFocus.focus();
            };

            (v.items || []).forEach((item) => {
              const card = document.createElement('article');
              card.className = 'failure-mode-card prompt-anatomy-card';
              card.style.setProperty('--card-accent', item.color);
              card.dataset.cardLabel = item.label;
              card.tabIndex = 0;
              card.setAttribute('role', 'button');
              card.setAttribute('aria-expanded', 'false');
              card.setAttribute('aria-label', `Show details for ${item.label}`);

              const inner = document.createElement('div');
              inner.className = 'prompt-anatomy-inner';
              const front = document.createElement('div');
              front.className = 'prompt-anatomy-face prompt-anatomy-front';
              const character = document.createElement('span');
              character.className = 'failure-mode-number';
              character.textContent = item.character;
              const title = document.createElement('h3');
              title.textContent = item.label;
              const detail = document.createElement('p');
              detail.textContent = item.detail;
              const hint = document.createElement('span');
              hint.className = 'prompt-anatomy-hint';
              hint.setAttribute('aria-hidden', 'true');
              const hintText = document.createElement('span');
              hintText.textContent = 'Click / tap to reveal';
              const hintIcon = document.createElement('strong');
              hintIcon.textContent = '+';
              hint.append(hintText, hintIcon);
              front.append(character, title, detail, hint);

              const back = document.createElement('div');
              back.className = 'prompt-anatomy-face prompt-anatomy-back';
              const backHeading = document.createElement('div');
              backHeading.className = 'prompt-anatomy-back-heading';
              const backCharacter = character.cloneNode(true);
              const backTitle = document.createElement('h3');
              backTitle.textContent = item.label;
              backHeading.append(backCharacter, backTitle);
              const tagline = document.createElement('p');
              tagline.className = 'prompt-anatomy-tagline';
              tagline.textContent = item.tagline;
              const points = document.createElement('ul');
              (item.points || []).forEach((point) => {
                const listItem = document.createElement('li');
                listItem.textContent = point;
                points.appendChild(listItem);
              });
              const example = document.createElement('p');
              example.className = 'prompt-anatomy-example';
              example.textContent = item.example;
              back.append(backHeading, tagline, points, example);
              inner.append(front, back);
              card.appendChild(inner);

              const toggleCard = () => {
                if (activeCard === card) {
                  closeFlyout();
                  return;
                }
                closeFlyout(false);
                activeCard = card;
                card.classList.add('is-flipped');
                card.setAttribute('aria-expanded', 'true');
                card.setAttribute('aria-label', `Hide details for ${item.label}`);
                grid.classList.add('has-flyout');
                flyout.style.setProperty('--card-accent', item.color);
                flyout.setAttribute('aria-label', `${item.label} prompt details`);
                flyoutContent.replaceChildren(...Array.from(back.children, (child) => child.cloneNode(true)));
                flyout.hidden = false;
                requestAnimationFrame(() => flyout.classList.add('is-open'));
                flyoutClose.focus();
              };
              card.addEventListener('click', (event) => {
                event.stopPropagation();
                toggleCard();
              });
              card.addEventListener('keydown', (event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                event.stopPropagation();
                toggleCard();
              });
              grid.appendChild(card);
            });
            flyoutClose.addEventListener('click', (event) => {
              event.stopPropagation();
              closeFlyout();
            });
            flyout.addEventListener('click', (event) => {
              event.stopPropagation();
              if (event.target === flyout) closeFlyout();
            });
            flyout.addEventListener('keydown', (event) => {
              if (event.key !== 'Escape') return;
              event.stopPropagation();
              closeFlyout();
            });
            stage.append(grid, flyout);
          },
          'annotated-prompt': (stage, v) => {
            const wrap = document.createElement('div');
            wrap.className = 'annotated-prompt';

            const calloutLayer = document.createElement('div');
            calloutLayer.className = 'annotated-prompt-callouts';

            const promptText = document.createElement('p');
            promptText.className = 'annotated-prompt-text';

            const svgNs = 'http://www.w3.org/2000/svg';
            const svg = document.createElementNS(svgNs, 'svg');
            svg.setAttribute('class', 'annotated-prompt-arrows');
            const defs = document.createElementNS(svgNs, 'defs');
            const marker = document.createElementNS(svgNs, 'marker');
            marker.setAttribute('id', 'annotated-prompt-arrowhead');
            marker.setAttribute('markerWidth', '8');
            marker.setAttribute('markerHeight', '8');
            marker.setAttribute('refX', '6');
            marker.setAttribute('refY', '4');
            marker.setAttribute('orient', 'auto-start-reverse');
            const markerPath = document.createElementNS(svgNs, 'path');
            markerPath.setAttribute('d', 'M0,0 L8,4 L0,8 Z');
            markerPath.setAttribute('fill', 'context-stroke');
            marker.appendChild(markerPath);
            defs.appendChild(marker);
            const arrowPath = document.createElementNS(svgNs, 'path');
            arrowPath.setAttribute('class', 'annotated-prompt-arrow-path');
            arrowPath.setAttribute('marker-end', 'url(#annotated-prompt-arrowhead)');
            svg.append(defs, arrowPath);

            const partsById = new Map((v.parts || []).map((part) => [part.id, part]));
            const spansByPart = new Map();

            (v.segments || []).forEach((segment) => {
              const part = partsById.get(segment.part);
              const span = document.createElement('span');
              span.className = 'annotated-prompt-part';
              span.textContent = segment.text;
              span.tabIndex = 0;
              span.setAttribute('role', 'button');
              span.setAttribute('aria-pressed', 'false');
              span.setAttribute('aria-label', `${part?.label || segment.part} ingredient`);
              span.style.setProperty('--part-color', part?.color || 'var(--cp-accent)');
              span.dataset.part = segment.part;
              promptText.appendChild(span);
              if (!spansByPart.has(segment.part)) spansByPart.set(segment.part, []);
              spansByPart.get(segment.part).push(span);
            });

            const quadrants = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
            const callouts = new Map();
            (v.parts || []).forEach((part, index) => {
              const quadrant = quadrants[index % 4] || 'top-left';
              const callout = document.createElement('div');
              callout.className = 'annotated-prompt-callout';
              callout.dataset.quadrant = quadrant;
              callout.style.setProperty('--part-color', part.color);
              callout.hidden = true;

              const label = document.createElement('span');
              label.className = 'annotated-prompt-callout-label';
              label.textContent = part.label;

              const question = document.createElement('p');
              question.className = 'annotated-prompt-callout-question';
              const words = (part.question || '').split(' ');
              const firstWord = document.createElement('strong');
              firstWord.textContent = words.shift() || '';
              question.append(firstWord, document.createTextNode(words.length ? ` ${words.join(' ')}` : ''));

              // Pill stays the anchor closest to the prompt; question sits on the outer side.
              callout.append(...(quadrant.startsWith('top') ? [question, label] : [label, question]));
              calloutLayer.appendChild(callout);
              callouts.set(part.id, { element: callout, quadrant, color: part.color });
            });

            wrap.append(promptText, calloutLayer, svg);
            stage.appendChild(wrap);

            let activePart = null;

            const drawArrow = (partId) => {
              const entry = callouts.get(partId);
              const span = spansByPart.get(partId)?.[0];
              if (!entry || !span) return;
              const wrapRect = wrap.getBoundingClientRect();
              svg.setAttribute('width', String(wrapRect.width));
              svg.setAttribute('height', String(wrapRect.height));
              const labelRect = entry.element.querySelector('.annotated-prompt-callout-label').getBoundingClientRect();
              const spanRect = span.getBoundingClientRect();
              const isTop = entry.quadrant.startsWith('top');
              const startX = labelRect.left + labelRect.width / 2 - wrapRect.left;
              const startY = (isTop ? labelRect.bottom : labelRect.top) - wrapRect.top;
              const endX = spanRect.left + spanRect.width / 2 - wrapRect.left;
              const endY = (isTop ? spanRect.top : spanRect.bottom) - wrapRect.top;
              const midY = (startY + endY) / 2;
              arrowPath.setAttribute('d', `M${startX},${startY} C${startX},${midY} ${endX},${midY} ${endX},${endY}`);
              arrowPath.setAttribute('stroke', entry.color);
            };

            const clearActive = () => {
              if (!activePart) return;
              spansByPart.get(activePart)?.forEach((span) => {
                span.classList.remove('is-active');
                span.setAttribute('aria-pressed', 'false');
              });
              callouts.get(activePart).element.hidden = true;
              svg.classList.remove('is-visible');
              activePart = null;
            };

            const activatePart = (partId) => {
              if (activePart === partId) return;
              clearActive();
              activePart = partId;
              spansByPart.get(partId)?.forEach((span) => {
                span.classList.add('is-active');
                span.setAttribute('aria-pressed', 'true');
              });
              callouts.get(partId).element.hidden = false;
              requestAnimationFrame(() => {
                drawArrow(partId);
                svg.classList.add('is-visible');
              });
            };

            const togglePart = (partId) => {
              if (activePart === partId) {
                clearActive();
              } else {
                activatePart(partId);
              }
            };

            // On hover-capable devices, mouseenter already opens the callout before any click
            // fires, so a click on the same segment must not immediately toggle it closed.
            const supportsHover = window.matchMedia('(hover: hover)').matches;

            promptText.querySelectorAll('.annotated-prompt-part').forEach((span) => {
              span.addEventListener('mouseenter', () => activatePart(span.dataset.part));
              span.addEventListener('focus', () => activatePart(span.dataset.part));
              span.addEventListener('click', (event) => {
                event.stopPropagation();
                if (supportsHover) {
                  activatePart(span.dataset.part);
                } else {
                  togglePart(span.dataset.part);
                }
              });
              span.addEventListener('keydown', (event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                event.stopPropagation();
                togglePart(span.dataset.part);
              });
            });

            wrap.addEventListener('mouseleave', clearActive);
            wrap.addEventListener('click', (event) => {
              // Wrapped segments can leave gaps that land on the paragraph, not a span; never let those reach the deck's advance handler.
              event.stopPropagation();
              if (event.target === wrap || event.target === promptText) clearActive();
            });
            window.addEventListener('resize', () => {
              if (activePart) drawArrow(activePart);
            });
          },
          'brief-comparison': (stage, v) => {
            const grid = document.createElement('div');
            grid.className = 'brief-comparison-grid';
            ['before', 'after'].forEach((key) => {
              const data = v[key];
              const panel = document.createElement('article');
              panel.className = `brief-panel brief-panel-${key}`;

              const label = document.createElement('span');
              label.className = 'brief-panel-label';
              label.textContent = data.label;
              const prompt = document.createElement('blockquote');
              prompt.textContent = data.prompt;
              const outcomeLabel = document.createElement('p');
              outcomeLabel.className = 'brief-outcome-label';
              outcomeLabel.textContent = 'What you get back';
              const outcomes = document.createElement('ul');
              data.outcomes.forEach((outcome) => {
                const item = document.createElement('li');
                item.textContent = outcome;
                outcomes.appendChild(item);
              });
              panel.append(label, prompt, outcomeLabel, outcomes);
              grid.appendChild(panel);
            });

            const insight = document.createElement('p');
            insight.className = 'brief-comparison-insight';
            if (v.insightRuns) {
              insight.dataset.typewriter = JSON.stringify(v.insightRuns);
              insight.dataset.typewriterDelay = '1100';
              insight.setAttribute('aria-label', v.insightRuns.map((run) => run.text).join(''));
              v.insightRuns.forEach((run) => {
                const text = document.createElement('span');
                text.textContent = run.text;
                if (run.accent) text.className = 'brief-insight-emphasis';
                insight.appendChild(text);
              });
            } else {
              insight.textContent = v.insight;
            }
            stage.append(grid, insight);
          },
          'expectation-gap': (stage, v) => {
            stage.appendChild(this.node('expectation-side expected', 'EXPECTED', v.expected));
            const fault = document.createElement('div');
            fault.className = 'expectation-fault';
            fault.innerHTML = `<span>${v.cause}</span>`;
            stage.appendChild(fault);
            stage.appendChild(this.node('expectation-side received', 'RECEIVED', v.output));
          },
          'section-morph': (stage, v) => {
            const heading = document.createElement('p');
            heading.className = 'section-morph-title';
            const primary = document.createElement('span');
            primary.textContent = v.primary;
            const secondary = document.createElement('span');
            secondary.className = 'accent';
            secondary.textContent = v.secondary;
            heading.append(primary, document.createTextNode(' '), secondary);
            stage.appendChild(heading);
          },
          ascent: (stage, v) => {
            v.steps.forEach((step) => {
              const wrap = document.createElement('div'); wrap.className = 'ascent-step';
              const bar = document.createElement('div'); bar.className = 'ascent-bar'; wrap.appendChild(bar);
              wrap.appendChild(this.node('', step.label, step.detail));
              stage.appendChild(wrap);
            });
          },
          cycle: (stage, v) => {
            const ring = document.createElement('div'); ring.className = 'cycle-ring'; stage.appendChild(ring);
            v.nodes.forEach((n) => stage.appendChild(this.node('cycle-node stage-node', n.label, n.detail)));
          },
          orbit: (stage, v) => {
            const ring = document.createElement('div'); ring.className = 'orbit-ring'; stage.appendChild(ring);
            const core = document.createElement('div'); core.className = 'orbit-core'; core.textContent = v.core; stage.appendChild(core);
            v.nodes.forEach((n) => stage.appendChild(this.node('orbit-node stage-node', n.label, n.detail)));
          },
          portrait: (stage, v) => {
            const frame = document.createElement('figure'); frame.className = 'portrait-frame';
            const img = document.createElement('img'); img.src = v.image; img.alt = v.alt || ''; frame.appendChild(img);
            stage.appendChild(frame);
            const notes = document.createElement('div'); notes.className = 'portrait-notes';
            v.annotations.forEach((n) => notes.appendChild(this.node('portrait-note', n.label, n.detail)));
            stage.appendChild(notes);
          },
          transform: (stage, v) => {
            stage.appendChild(this.node('transform-block from', undefined, v.from));
            const arrow = document.createElement('div'); arrow.className = 'transform-arrow'; arrow.textContent = '\u2192'; stage.appendChild(arrow);
            stage.appendChild(this.node('transform-block to', undefined, v.to));
          },
          ledger: (stage, v) => {
            v.rows.forEach((row, index) => {
              const wrap = document.createElement('div'); wrap.className = 'ledger-row';
              const idx = document.createElement('span'); idx.className = 'ledger-index'; idx.textContent = String(index + 1).padStart(2, '0'); wrap.appendChild(idx);
              wrap.appendChild(this.node('', row.label, row.detail));
              stage.appendChild(wrap);
            });
          },
          frame: (stage, v) => {
            v.cards.forEach((card) => stage.appendChild(this.node('frame-card stage-node', card.label, card.detail)));
          },
          spotlight: (stage, v) => {
            stage.appendChild(this.node('spotlight-muted', v.muted.label, v.muted.detail));
            stage.appendChild(this.node('spotlight-glow', v.highlighted.label, v.highlighted.detail));
          },
          spiral: (stage, v) => {
            v.stages.forEach((s) => stage.appendChild(this.node('spiral-node stage-node', s.label, s.detail)));
          },
          deck: (stage, v) => {
            v.cards.forEach((card) => stage.appendChild(this.node('deck-card', card.label, card.detail)));
          },
          chain: (stage, v) => {
            v.links.forEach((link, index) => {
              if (index > 0) { const connector = document.createElement('div'); connector.className = 'chain-connector'; stage.appendChild(connector); }
              stage.appendChild(this.node('chain-link stage-node', link.label, link.detail));
            });
          },
          blueprint: (stage, v) => {
            v.parts.forEach((part) => stage.appendChild(this.node('blueprint-part stage-node', part.label, part.detail)));
            const core = document.createElement('div'); core.className = 'blueprint-core'; core.textContent = v.core; stage.appendChild(core);
          },
          'foundation-consolidation': (stage, v) => {
            const journey = document.createElement('section');
            journey.className = 'foundation-consolidation-panel foundation-consolidation-journey scene-stage-agent-journey';
            journey.setAttribute('aria-label', v.journey?.label || 'Purpose, context, and action');
            this.stageBuilders['agent-journey'](journey, v.journey || {});

            const blueprint = document.createElement('section');
            blueprint.className = 'foundation-consolidation-panel foundation-consolidation-blueprint scene-stage-blueprint';
            blueprint.setAttribute('aria-label', v.blueprint?.label || 'Agent anatomy');
            this.stageBuilders.blueprint(blueprint, v.blueprint || {});

            stage.append(journey, blueprint);
          },
          'agent-library': (stage, v) => {
            const library = document.createElement('div');
            library.className = 'agent-library-list';
            (v.agents || []).forEach((agent, index) => {
              const card = document.createElement('article');
              card.className = 'agent-library-card';
              const number = document.createElement('span');
              number.className = 'agent-library-number';
              number.textContent = String(index + 1).padStart(2, '0');
              const copy = document.createElement('div');
              const title = document.createElement('strong');
              title.textContent = agent.label;
              const detail = document.createElement('span');
              detail.textContent = agent.detail;
              copy.append(title, detail);
              card.append(number, copy);
              library.appendChild(card);
            });
            const invitation = document.createElement('aside');
            invitation.className = 'agent-library-invitation';
            const eyebrow = document.createElement('span');
            eyebrow.textContent = v.invitationLabel || 'Start here';
            const title = document.createElement('strong');
            title.textContent = v.invitationTitle || 'Borrow a role before you build one.';
            const detail = document.createElement('p');
            detail.textContent = v.invitationDetail || '';
            invitation.append(eyebrow, title, detail);
            if (v.invitationLink) {
              const link = document.createElement('a');
              link.className = 'agent-library-link';
              link.href = v.invitationLink.url;
              link.target = '_blank';
              link.rel = 'noreferrer';
              link.textContent = v.invitationLink.label;
              invitation.appendChild(link);
            }
            const footer = document.createElement('aside');
            footer.className = 'agent-library-footer';
            const footerTitle = document.createElement('strong');
            footerTitle.textContent = v.footerTitle || 'Not finding what you want?';
            const footerDetail = document.createElement('span');
            footerDetail.textContent = v.footerDetail || '';
            footer.append(footerTitle, footerDetail);
            stage.append(library);
            if (v.invitationLabel || v.invitationTitle || v.invitationDetail || v.invitationLink) stage.append(invitation);
            if (v.footerTitle || v.footerDetail) stage.append(footer);
          },
          workbench: (stage, v) => {
            const frame = document.createElement('figure'); frame.className = 'workbench-image';
            const img = document.createElement('img'); img.src = v.image; img.alt = v.alt || ''; frame.appendChild(img);
            stage.appendChild(frame);
            const checklist = document.createElement('div'); checklist.className = 'workbench-checklist';
            v.checklist.forEach((item) => checklist.appendChild(this.node('workbench-item', item.label, item.detail)));
            stage.appendChild(checklist);
            if (v.libraryLink?.url) {
              const link = document.createElement('a');
              link.className = 'agent-library-link';
              const libraryUrl = new URL(v.libraryLink.url, window.location.href);
              const returnUrl = new URL(window.location.href);
              returnUrl.searchParams.set('scene', stage.dataset.sceneId || 'agent-first-build');
              returnUrl.hash = '';
              libraryUrl.searchParams.set('return', returnUrl.href);
              link.href = libraryUrl.href;
              link.textContent = v.libraryLink.label || 'Explore the Agent Use Case Library ->';
              stage.appendChild(link);
            }
          },
          poll: (stage, v) => {
            [v.optionA, v.optionB].forEach((option) => {
              const wrap = document.createElement('div'); wrap.className = 'poll-option stage-node';
              const head = document.createElement('div'); head.className = 'poll-option-head';
              head.innerHTML = `<strong>${option.label}</strong><span>${option.percent}%</span>`;
              wrap.appendChild(head);
              const detail = document.createElement('p'); detail.style.margin = '0 0 .6rem'; detail.style.color = 'var(--cp-text-muted)'; detail.style.fontSize = '.85rem'; detail.textContent = option.detail;
              wrap.appendChild(detail);
              const meter = document.createElement('div'); meter.className = 'poll-meter';
              const fill = document.createElement('span'); fill.style.width = `${option.percent}%`; meter.appendChild(fill);
              wrap.appendChild(meter);
              stage.appendChild(wrap);
            });
          },
          gauge: (stage, v) => {
            const track = document.createElement('div'); track.className = 'gauge-track';
            const marker = document.createElement('div'); marker.className = 'gauge-marker'; marker.style.left = `${v.marker}%`; track.appendChild(marker);
            stage.appendChild(track);
            const labels = document.createElement('div'); labels.className = 'gauge-labels';
            labels.innerHTML = `<span>${v.leftLabel}</span><span>${v.rightLabel}</span>`;
            stage.appendChild(labels);
            stage.appendChild(this.node('', undefined, v.leftDetail));
            stage.appendChild(this.node('', undefined, v.rightDetail));
          },
          'arrow-path': (stage, v) => {
            v.stages.forEach((s) => stage.appendChild(this.node('arrow-stage', s.label, s.detail)));
          },
          'agent-journey': (stage, v) => {
            const rail = document.createElement('div');
            rail.className = 'agent-journey-rail';
            const connectors = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            connectors.classList.add('agent-journey-connectors');
            connectors.setAttribute('viewBox', '0 0 100 100');
            connectors.setAttribute('preserveAspectRatio', 'none');
            connectors.setAttribute('aria-hidden', 'true');
            [16.66, 50, 83.34].forEach((targetX, index) => {
              const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
              path.classList.add('agent-journey-connector');
              path.style.setProperty('--connector-delay', `${index * 180 + 250}ms`);
              path.setAttribute('d', `M 50 18 C 50 31, ${targetX} 31, ${targetX} 50`);
              connectors.appendChild(path);
            });
            const core = document.createElement('div');
            core.className = 'agent-journey-core';
            core.textContent = v.core || 'AGENCY';
            rail.append(connectors, core);

            (v.stages || []).forEach((item, index) => {
              const card = document.createElement('article');
              card.className = 'agent-journey-card';
              card.dataset.index = String(index + 1);
              const number = document.createElement('span');
              number.className = 'agent-journey-number';
              number.textContent = String(index + 1).padStart(2, '0');
              const heading = document.createElement('strong');
              heading.textContent = item.label;
              const detail = document.createElement('span');
              detail.textContent = item.detail;
              card.append(number, heading, detail);
              rail.appendChild(card);
            });

            const outcome = document.createElement('p');
            outcome.className = 'agent-journey-outcome';
            outcome.textContent = v.outcome || 'A role becomes useful when intelligence can understand, decide, and act.';
            stage.append(rail, outcome);
          },
          'type-hero': (stage, v) => {
            const quote = document.createElement('p');
            quote.className = 'prompt-hero-quote';
            (v.runs || [
              { text: v.before },
              { text: ` ${v.accent}`, color: 'var(--cp-accent)' },
              { text: ` ${v.after}` }
            ]).forEach((run) => {
              const span = document.createElement('span');
              span.textContent = run.text;
              if (run.color) span.style.color = run.color;
              if (run.accent) span.className = 'accent';
              quote.appendChild(span);
            });
            stage.appendChild(quote);
          },
          'tedtalk-question': (stage, v) => {
            const icons = document.createElement('div');
            icons.className = 'tedtalk-reveals';
            (v.reveals || []).forEach((item) => {
              const wrap = document.createElement('article');
              wrap.className = 'tedtalk-reveal';
              const button = document.createElement('button');
              button.type = 'button';
              button.className = `tedtalk-reveal-button ${item.kind || ''}`;
              button.setAttribute('aria-expanded', 'false');
              button.setAttribute('aria-label', `Reveal ${item.label}`);
              button.textContent = item.icon;
              const content = document.createElement('div');
              content.className = 'tedtalk-reveal-content';
              const label = document.createElement('strong');
              label.textContent = item.label;
              const detail = document.createElement('span');
              detail.textContent = item.detail;
              content.append(label, detail);
              const setOpen = (open) => {
                wrap.dataset.open = String(open);
                button.setAttribute('aria-expanded', String(open));
              };
              button.addEventListener('mouseenter', () => setOpen(true));
              button.addEventListener('mouseleave', () => setOpen(false));
              button.addEventListener('focus', () => setOpen(true));
              button.addEventListener('blur', () => setOpen(false));
              button.addEventListener('click', () => setOpen(wrap.dataset.open !== 'true'));
              wrap.append(button, content);
              icons.appendChild(wrap);
            });
            stage.appendChild(icons);
          },
          'agent-trio': (stage, v) => {
            const row = document.createElement('div');
            row.className = 'agent-trio-row';
            (v.agents || []).forEach((agent, index) => {
              const card = document.createElement('a');
              card.className = 'agent-trio-card';
              card.href = agent.url || v.url || '#';
              card.target = '_blank';
              card.rel = 'noreferrer';
              card.setAttribute('aria-label', `Open ${agent.label} in Copilot Agent Store`);
              const number = document.createElement('span');
              number.className = 'agent-trio-number';
              number.textContent = String(index + 1).padStart(2, '0');
              const title = document.createElement('strong');
              title.textContent = agent.label;
              const detail = document.createElement('span');
              detail.textContent = agent.detail;
              const linkLabel = document.createElement('em');
              linkLabel.textContent = 'Copilot Agent ->';
              card.append(number, title, detail, linkLabel);
              row.appendChild(card);
            });
            stage.appendChild(row);
          },
          'platform-path': (stage, v) => {
            const path = document.createElement('div');
            path.className = 'platform-path-row';
            (v.platforms || []).forEach((platform, index) => {
              const card = document.createElement('article');
              card.className = `platform-path-card path-${index + 1}`;
              if (platform.state) card.dataset.state = platform.state;
              const mark = document.createElement('div');
              mark.className = 'platform-path-mark';
              (platform.logos || []).forEach((logo) => {
                const image = document.createElement('img');
                image.src = logo;
                image.alt = '';
                mark.appendChild(image);
              });
              const eyebrow = document.createElement('span');
              eyebrow.className = 'platform-path-eyebrow';
              eyebrow.textContent = platform.eyebrow;
              const title = document.createElement('strong');
              title.textContent = platform.label;
              const detail = document.createElement('p');
              detail.textContent = platform.detail;
              const fit = document.createElement('span');
              fit.className = 'platform-path-fit';
              fit.textContent = platform.fit;
              card.append(mark, eyebrow, title, detail, fit);
              path.appendChild(card);
            });
            stage.appendChild(path);
          },
          'prompt-image': (stage, v) => {
            const imageFrame = document.createElement('figure');
            imageFrame.className = 'prompt-image-frame';
            const image = document.createElement('img');
            image.src = v.image;
            image.alt = v.alt || '';
            imageFrame.appendChild(image);
            stage.appendChild(imageFrame);
            const prompt = document.createElement('p');
            prompt.className = 'prompt-composition';
            const prefix = document.createElement('span');
            prefix.className = 'prompt-prefix';
            prefix.textContent = 'PROMPT:';
            const typedText = document.createElement('span');
            typedText.className = 'typed-prompt';
            const promptRuns = v.promptRuns || [{ text: v.prompt }];
            const promptLength = promptRuns.reduce((length, run) => length + run.text.length, 0);
            stage.dataset.promptLength = promptLength > 180 ? 'long' : promptLength > 100 ? 'medium' : 'short';
            typedText.dataset.typewriter = JSON.stringify(promptRuns);
            typedText.setAttribute('aria-label', promptRuns.map((run) => run.text).join(''));
            prompt.append(prefix, typedText);
            stage.appendChild(prompt);
            const lesson = document.createElement('p');
            lesson.className = 'prompt-lesson';
            lesson.hidden = true;
            lesson.innerHTML = `<strong>WHAT CHANGES</strong>${v.lesson}`;
            stage.appendChild(lesson);
          },
          'prompt-gallery': (stage, v) => {
            const gallery = document.createElement('div');
            gallery.className = 'prompt-gallery-grid';
            v.images.forEach((imageData) => {
              const image = document.createElement('img');
              image.src = imageData.src;
              image.alt = imageData.alt || '';
              gallery.appendChild(image);
            });
            stage.appendChild(gallery);
            const closing = document.createElement('p');
            closing.className = 'prompt-gallery-line';
            (v.lineRuns || [{ text: v.line }]).forEach((run) => {
              const span = document.createElement('span');
              span.textContent = run.text;
              if (run.color) span.style.color = run.color;
              if (run.accent) span.className = 'accent';
              closing.appendChild(span);
            });
            stage.appendChild(closing);
          }
        };
      }

      render(scene) {
        if (!scene) return null;

        const sceneEl = document.createElement('div');
        sceneEl.className = 'scene';
        sceneEl.dataset.sceneId = scene.id;
        sceneEl.dataset.layout = scene.type === 'title-scene' ? 'cover' : 'stage';
        if (scene.tags?.length) sceneEl.dataset.sceneTags = scene.tags.join(' ');
        if (scene.id.startsWith('s1-prompt-story-')) sceneEl.dataset.promptStory = 'true';

        if (scene.faded_backdrop) {
          const backdrop = document.createElement('img');
          backdrop.className = 'scene-backdrop';
          backdrop.src = scene.faded_backdrop;
          backdrop.alt = '';
          sceneEl.appendChild(backdrop);
        }

        const content = document.createElement('div');
        content.className = 'scene-content';
        const titleTag = scene.type === 'title-scene' ? '1' : '2';

        if (!scene.hideHeader) {
          const header = document.createElement('div');
          header.className = 'scene-header';
          header.innerHTML = `
            ${scene.kicker ? `<div class="scene-kicker">${scene.kicker}</div>` : ''}
            <h${titleTag}>${this.formatTitle(scene.title)}</h${titleTag}>
            ${scene.subtitle ? `<p class="scene-subtitle">${scene.subtitle}</p>` : ''}
            ${scene.type === 'title-scene' && scene.content ? `<p class="scene-subtitle scene-detail">${scene.content}</p>` : ''}
          `;
          content.appendChild(header);
        }

        const stage = this.renderStage(scene.visual, scene.id);
        if (stage) content.appendChild(stage);
        sceneEl.appendChild(content);

        return sceneEl;
      }
    }

    // Navigation Controller
    class NavigationController {
      constructor(dataManager, renderer) {
        this.dataManager = dataManager;
        this.renderer = renderer;
        this.currentSceneIndex = 0;
        this.wheelLocked = false;
        this.commentaryOpen = false;
        this.navOpen = false;
        this.controlHintTimeout = null;
        this.paginationHidden = false;
        this.navigationPath = null;
      }

      initialize() {
        this.navigationPath = this.resolveNavigationPath();
        this.currentSceneIndex = this.resolveInitialSceneIndex();
        this.renderAllScenes();
        this.buildNavigation();
        this.setupEventListeners();
        this.showControlHint();
      }

      resolveNavigationPath() {
        const path = new URLSearchParams(window.location.search).get('path');
        if (!path) return null;

        const totalScenes = this.dataManager.getTotalScenes();
        const sceneIndices = [];
        const addScene = (sceneNumber) => {
          const sceneIndex = sceneNumber - 1;
          if (sceneIndex >= 0 && sceneIndex < totalScenes && !sceneIndices.includes(sceneIndex)) {
            sceneIndices.push(sceneIndex);
          }
        };

        path.split(',').forEach((part) => {
          const token = part.trim();
          const range = token.match(/^(\d+)\s*-\s*(\d+)$/);
          if (range) {
            const start = Number(range[1]);
            const end = Number(range[2]);
            const step = start <= end ? 1 : -1;
            for (let sceneNumber = start; sceneNumber !== end + step; sceneNumber += step) addScene(sceneNumber);
          } else if (/^\d+$/.test(token)) {
            addScene(Number(token));
          }
        });

        return sceneIndices.length ? sceneIndices : null;
      }

      resolveInitialSceneIndex() {
        const params = new URLSearchParams(window.location.search);
        const requestedScene = params.get('scene');
        if (requestedScene) {
          const sceneIndex = this.dataManager.allScenes.findIndex((scene) => (
            scene.id === requestedScene || String(scene.number) === requestedScene
          ));
          if (sceneIndex >= 0) return sceneIndex;
        }

        const requestedSection = params.get('section')?.trim().toLowerCase();
        if (requestedSection) {
          const section = this.dataManager.sessions
            .flatMap((session) => session.sections || [])
            .find((item) => item.id.toLowerCase() === requestedSection || item.title.toLowerCase() === requestedSection);
          const sceneIndex = section ? this.dataManager.allScenes.findIndex((scene) => scene.section?.id === section.id) : -1;
          if (sceneIndex >= 0) return sceneIndex;
        }

        return this.navigationPath?.[0] ?? 0;
      }

      renderAllScenes() {
        const stage = document.querySelector('.cinema-stage');
        stage.innerHTML = '';
        this.dataManager.allScenes.forEach((scene, index) => {
          const sceneEl = this.renderer.render(scene);
          sceneEl.dataset.state = index === this.currentSceneIndex ? 'active' : 'future';
          sceneEl.setAttribute('aria-hidden', String(index !== this.currentSceneIndex));
          stage.appendChild(sceneEl);
        });
        this.renderScene();
      }

      renderScene() {
        const scene = this.dataManager.getScene(this.currentSceneIndex);
        if (!scene) return;
        document.querySelectorAll('.scene').forEach((sceneEl, index) => {
          sceneEl.dataset.state = index < this.currentSceneIndex ? 'past' : index === this.currentSceneIndex ? 'active' : 'future';
          sceneEl.setAttribute('aria-hidden', String(index !== this.currentSceneIndex));
        });
        this.startTypewriters();
        this.updateCommentary(scene);
        this.updateProgress();
        this.updateNavigation();
      }

      startTypewriters() {
        window.clearTimeout(this.typewriterTimer);
        const activeScene = document.querySelector('.scene[data-state="active"]');
        activeScene?.querySelectorAll('[data-typewriter]').forEach((element) => {
          const runs = JSON.parse(element.dataset.typewriter || '[]');
          const text = runs.map((run) => run.text).join('');
          const lesson = element.closest('.scene-stage')?.querySelector('.prompt-lesson');
          const typingDelay = text.length > 180 ? 12 : 18;
          const initialDelay = Number(element.dataset.typewriterDelay || 0);
          const charactersPerTick = 1;
          let cursor = 0;
          let runIndex = 0;
          let runCursor = 0;
          element.replaceChildren();
          const runElements = runs.map((run) => {
            const span = document.createElement('span');
            if (run.color) span.style.color = run.color;
            if (run.accent) span.className = 'accent';
            element.appendChild(span);
            return span;
          });
          if (lesson) lesson.hidden = true;
          const typeNextCharacter = () => {
            for (let characterIndex = 0; characterIndex < charactersPerTick && cursor < text.length; characterIndex += 1) {
              runElements[runIndex].append(runs[runIndex].text[runCursor]);
              cursor += 1;
              runCursor += 1;
              if (runCursor === runs[runIndex].text.length && runIndex < runs.length - 1) {
                runIndex += 1;
                runCursor = 0;
              }
            }
            if (cursor < text.length) {
              this.typewriterTimer = window.setTimeout(typeNextCharacter, typingDelay);
            } else if (lesson) {
              lesson.hidden = false;
              requestAnimationFrame(() => lesson.classList.add('is-visible'));
            }
          };
          this.typewriterTimer = window.setTimeout(typeNextCharacter, initialDelay);
        });
      }

      updateCommentary(scene) {
        document.querySelector('#commentaryLabel').textContent = scene.kicker || `Scene ${scene.number}`;
        document.querySelector('#commentaryTitle').textContent = scene.title;
        document.querySelector('#commentaryAuthor').textContent = scene.speaker_name || 'Presenter';
        document.querySelector('#presenterName').textContent = scene.speaker_name || 'Presenter';

        const bodyEl = document.querySelector('#commentaryBody');
        const paragraphs = scene.commentary?.paragraphs || (scene.speaker_notes ? [scene.speaker_notes] : ['Click to continue.']);
        bodyEl.replaceChildren(...paragraphs.map((text) => {
          const paragraph = document.createElement('p');
          paragraph.textContent = text;
          return paragraph;
        }));

        const takeawayEl = document.querySelector('#commentaryTakeaway');
        takeawayEl.textContent = scene.commentary?.takeaway || scene.speaker_title || 'Thought Leader';

        const sourceEl = document.querySelector('#commentarySource');
        if (scene.source?.url) {
          sourceEl.href = scene.source.url;
          sourceEl.textContent = scene.source.label || 'View visual source';
          sourceEl.hidden = false;
        } else {
          sourceEl.hidden = true;
        }

        // Update avatar
        const avatar = scene.speaker_avatar || 'assets/images/portraits/you.jpg';
        document.querySelectorAll('.commentary-avatar img').forEach(img => {
          img.src = avatar;
          img.alt = scene.speaker_name || 'Speaker';
        });
      }

      updateProgress() {
        const totalScenes = this.dataManager.getTotalScenes();
        document.querySelector('#sceneNum').textContent = this.currentSceneIndex + 1;
        document.querySelector('#sceneTotal').textContent = totalScenes;

        const pathPosition = this.navigationPath?.indexOf(this.currentSceneIndex) ?? -1;
        const percentage = pathPosition >= 0
          ? ((pathPosition + 1) / this.navigationPath.length) * 100
          : ((this.currentSceneIndex + 1) / totalScenes) * 100;
        document.querySelector('.progress-bar').style.width = percentage + '%';

        const isFinalScene = pathPosition >= 0
          ? pathPosition === this.navigationPath.length - 1
          : this.currentSceneIndex === totalScenes - 1;
        document.querySelector('.scroll-cue').dataset.hidden = isFinalScene;
      }

      updateNavigation() {
        document.querySelectorAll('.nav-item').forEach((item) => {
          const itemIndex = parseInt(item.dataset.index, 10);
          item.dataset.active = itemIndex === this.currentSceneIndex ? 'true' : 'false';
        });
      }

      buildNavigation() {
        const navSessions = document.querySelector('.nav-sessions');
        navSessions.innerHTML = '';

        this.dataManager.sessions.forEach((session, sessionIdx) => {
          const section = document.createElement('div');
          section.className = 'nav-section';

          const title = document.createElement('h3');
          title.className = 'nav-section-title';
          title.textContent = `Session ${session.number}: ${session.title}`;
          section.appendChild(title);

          const appendSceneButton = (scene) => {
            const globalIdx = this.dataManager.allScenes.findIndex(
              item => item.sessionIndex === sessionIdx && item.sceneIndex === session.scenes.indexOf(scene)
            );
            const button = document.createElement('button');
            button.className = 'nav-item';
            button.dataset.index = globalIdx;
            button.textContent = scene.title;
            button.addEventListener('click', () => {
              this.currentSceneIndex = globalIdx;
              this.renderScene();
              this.closeNav();
            });
            section.appendChild(button);
          };

          const renderedSectionIds = new Set();
          const appendSectionTitle = (sectionData) => {
            if (renderedSectionIds.has(sectionData.id)) return;
            const sectionTitle = document.createElement('h4');
            sectionTitle.className = 'nav-subsection-title';
            sectionTitle.textContent = sectionData.title;
            section.appendChild(sectionTitle);
            renderedSectionIds.add(sectionData.id);
          };
          session.scenes.forEach((scene) => {
            const sectionIndex = session.sections?.findIndex((item) => item.sceneIds.includes(scene.id)) ?? -1;
            if (sectionIndex >= 0) {
              session.sections.slice(0, sectionIndex + 1).forEach(appendSectionTitle);
            }
            appendSceneButton(scene);
          });

          navSessions.appendChild(section);
        });
      }

      nextScene() {
        if (this.navigationPath) {
          const pathPosition = this.navigationPath.indexOf(this.currentSceneIndex);
          const nextIndex = pathPosition >= 0
            ? this.navigationPath[pathPosition + 1]
            : this.navigationPath.find((sceneIndex) => sceneIndex > this.currentSceneIndex);
          if (nextIndex !== undefined) {
            this.currentSceneIndex = nextIndex;
            this.renderScene();
          }
          return;
        }
        if (this.currentSceneIndex < this.dataManager.getTotalScenes() - 1) {
          this.currentSceneIndex++;
          this.renderScene();
        }
      }

      previousScene() {
        if (this.navigationPath) {
          const pathPosition = this.navigationPath.indexOf(this.currentSceneIndex);
          const previousIndex = pathPosition >= 0
            ? this.navigationPath[pathPosition - 1]
            : this.navigationPath.findLast((sceneIndex) => sceneIndex < this.currentSceneIndex);
          if (previousIndex !== undefined) {
            this.currentSceneIndex = previousIndex;
            this.renderScene();
          }
          return;
        }
        if (this.currentSceneIndex > 0) {
          this.currentSceneIndex--;
          this.renderScene();
        }
      }

      toggleCommentary() {
        this.commentaryOpen = !this.commentaryOpen;
        const shell = document.querySelector('.commentary-shell');
        shell.dataset.open = this.commentaryOpen ? 'true' : 'false';
      }

      closeCommentary() {
        this.commentaryOpen = false;
        document.querySelector('.commentary-shell').dataset.open = 'false';
      }

      toggleNav() {
        this.navOpen = !this.navOpen;
        document.querySelector('.nav-panel').dataset.open = this.navOpen ? 'true' : 'false';
      }

      closeNav() {
        this.navOpen = false;
        document.querySelector('.nav-panel').dataset.open = 'false';
      }

      showControlHint() {
        const hint = document.querySelector('.control-hint');
        hint.dataset.hidden = 'false';
        if (this.controlHintTimeout) clearTimeout(this.controlHintTimeout);
        this.controlHintTimeout = setTimeout(() => {
          hint.dataset.hidden = 'true';
        }, CONFIG.controlHintDuration);
      }

      toggleControlHint() {
        if (this.controlHintTimeout) clearTimeout(this.controlHintTimeout);
        const hint = document.querySelector('.control-hint');
        hint.dataset.hidden = hint.dataset.hidden === 'true' ? 'false' : 'true';
      }

      togglePagination() {
        this.paginationHidden = !this.paginationHidden;
        document.querySelector('.progress-bar').dataset.hidden = String(this.paginationHidden);
        document.querySelector('.scene-counter').dataset.hidden = String(this.paginationHidden);
      }

      openUseCaseLibrary() {
        const scene = this.dataManager.getScene(this.currentSceneIndex);
        const returnUrl = new URL(window.location.href);
        if (scene) returnUrl.searchParams.set('scene', scene.id);

        const libraryUrl = new URL('agent-usecase-library.html', window.location.href);
        libraryUrl.searchParams.set('return', returnUrl.href);
        libraryUrl.searchParams.set('theme', document.documentElement.getAttribute('data-theme') || 'dark');
        window.location.href = libraryUrl.href;
      }

      setupEventListeners() {
        // Scroll wheel navigation
        document.addEventListener('wheel', (event) => {
          if (event.target.closest('.commentary-blade') || Math.abs(event.deltaY) < 20 || this.wheelLocked) return;
          event.preventDefault();
          this.wheelLocked = true;
          (event.deltaY > 0 ? () => this.nextScene() : () => this.previousScene())();
          window.setTimeout(() => { this.wheelLocked = false; }, CONFIG.wheelLockDuration);
        }, { passive: false });

        // Keyboard navigation
        document.addEventListener('keydown', (event) => {
          const key = event.key.toLowerCase();
          
          // Navigation
          if (["arrowright", "arrowdown", "pagedown", " "].includes(key)) {
            event.preventDefault();
            this.nextScene();
          }
          if (["arrowleft", "arrowup", "pageup"].includes(key)) {
            event.preventDefault();
            this.previousScene();
          }
          
          // First/Last
          if (event.key === "Home") {
            this.currentSceneIndex = this.navigationPath?.[0] ?? 0;
            this.renderScene();
          }
          if (event.key === "End") {
            this.currentSceneIndex = this.navigationPath?.at(-1) ?? this.dataManager.getTotalScenes() - 1;
            this.renderScene();
          }
          
          // Commentary toggle (C key)
          if (key === 'c') {
            event.preventDefault();
            this.toggleCommentary();
          }
          
          // Navigation toggle (N key)
          if (key === 'n') {
            event.preventDefault();
            this.toggleNav();
          }

          if (key === 'f') {
            event.preventDefault();
            if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
            else document.exitFullscreen?.();
          }

          if (key === 'l') {
            event.preventDefault();
            this.openUseCaseLibrary();
          }

          // Toggle scene counter + progress bar (D key)
          if (key === 'd') {
            event.preventDefault();
            this.togglePagination();
          }

          // Toggle light/dark theme (T key)
          if (key === 't') {
            event.preventDefault();
            const html = document.documentElement;
            html.setAttribute('data-theme', html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
          }

          // Toggle the on-screen shortcuts hint (? key)
          if (event.key === '?') {
            event.preventDefault();
            this.toggleControlHint();
          }

          // Close panels (ESC)
          if (event.key === "Escape") {
            this.closeCommentary();
            this.closeNav();
          }
        });

        // Button listeners
        document.querySelector('.commentary-launcher').addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleCommentary();
        });
        document.querySelector('.commentary-close').addEventListener('click', () => this.closeCommentary());
        document.querySelector('.commentary-backdrop').addEventListener('click', () => this.closeCommentary());

        document.querySelector('.nav-toggle').addEventListener('click', () => this.toggleNav());
        document.querySelector('.nav-close').addEventListener('click', () => this.closeNav());

        document.querySelector('.scroll-cue').addEventListener('click', () => this.nextScene());

        // Click on scene to advance
        document.querySelector('.cinema-stage').addEventListener('click', (event) => {
          if (!event.target.closest('button, a, input, [role="button"]')) {
            this.nextScene();
          }
        });
      }
    }

    // Initialize
    (async () => {
      const dataManager = new DataManager();
      const renderer = new SceneRenderer();
      const controller = new NavigationController(dataManager, renderer);

      const loaded = await dataManager.load();
      if (!loaded) {
        alert('Error loading presentation. Please check data/course-manifest.json and session files.');
        return;
      }

      controller.initialize();
      window.controller = controller;

      const canvas = document.querySelector('.cinema-canvas');
      const context = canvas.getContext('2d');
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let particles = [];

      function resizeCanvas() {
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = window.innerWidth * ratio;
        canvas.height = window.innerHeight * ratio;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        particles = Array.from({ length: Math.min(90, Math.floor(window.innerWidth / 18)) }, () => ({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          radius: Math.random() * 2.8 + 1.15,
          speed: Math.random() * .48 + .18,
          drift: Math.random() * .28 - .14,
          phase: Math.random() * Math.PI * 2
        }));
      }

      function drawField() {
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--cp-text-muted').trim();
        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--cp-accent').trim();
        particles.forEach((particle, index) => {
          const neighbor = particles[index + 1];
          if (!neighbor) return;
          const distance = Math.hypot(particle.x - neighbor.x, particle.y - neighbor.y);
          if (distance < 155) {
            context.beginPath();
            context.strokeStyle = index % 9 === 0 ? accentColor : textColor;
            context.globalAlpha = (1 - distance / 155) * .24;
            context.moveTo(particle.x, particle.y);
            context.lineTo(neighbor.x, neighbor.y);
            context.stroke();
          }
        });
        particles.forEach((particle, index) => {
          particle.y -= reducedMotion ? 0 : particle.speed;
          particle.phase += reducedMotion ? 0 : .008;
          particle.x += reducedMotion ? 0 : particle.drift + Math.sin(particle.phase) * .12;
          if (particle.y < -5) particle.y = window.innerHeight + 5;
          if (particle.x < -5) particle.x = window.innerWidth + 5;
          if (particle.x > window.innerWidth + 5) particle.x = -5;
          context.beginPath();
          context.fillStyle = index % 13 === 0 ? accentColor : textColor;
          context.globalAlpha = index % 9 === 0 ? .9 : .52;
          context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          context.fill();
        });
        context.globalAlpha = 1;
        if (!reducedMotion) requestAnimationFrame(drawField);
      }

      resizeCanvas();
      drawField();
      window.addEventListener('resize', resizeCanvas);
    })();
