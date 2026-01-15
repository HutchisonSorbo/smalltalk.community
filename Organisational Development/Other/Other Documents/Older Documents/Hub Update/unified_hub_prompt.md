# AI Agent Prompt: smalltalk.community Unified Information Hub App

## Objective

Create a comprehensive, interactive web application that combines the full Constitution, complete Strategic Plan, and both Strategic Operational Framework documents (in 'Hub Update' folder into a single, unified 'Information Hub' App. This must be an ADDITIVE process, not a reduction. Every feature from the original Strategic Plan must be preserved and enhanced.

## Critical Requirements

### 1. PRESERVE ALL STRATEGIC PLAN FEATURES

The original Strategic Plan HTML contains extensive interactive features that MUST be included in the unified hub:

**Interactive Timeline**
- 4-phase roadmap with expandable milestones
- Interactive phase selector with visual progress indicators
- Detailed milestone tracking with status indicators
- Focus areas and deliverables for each phase

**Complete Financial Module**
- Interactive financial scenarios (Conservative, Realistic, Optimistic)
- Revenue breakdown with interactive bar charts using Recharts
- Timeline projection charts showing monthly fund flow
- Year 1 budget breakdown with detailed cost categories
- Grant examples and notes for each scenario

**Comprehensive Risk Management**
- Full risk register with all risks from Strategic Plan
- Risk matrix visualization with impact and likelihood scoring
- Color-coded risk ratings (Extreme, High, Medium, Low)
- Detailed mitigation strategies for each risk
- Interactive risk cards with expandable details

**Board Recruitment Module**
- Complete board role descriptions (Chair, Secretary, Treasurer, Advisors, Communications Lead)
- Detailed role cards with time commitments, responsibilities, ideal backgrounds
- "What this role is NOT" clarifications
- Interactive modal views for full position descriptions
- Application/interest buttons with action tracking

**Safeguarding Framework**
- Comprehensive safeguarding commitments (Youth Safety, Elder Dignity, Professional Boundaries, Respect Standards)
- Prevention, Response, Intergenerational Protocols, and Accountability sections
- Reality check disclaimer about policy development status
- Multi-age safeguarding approach

**Technology Stack Section**
- Modern tech stack visualization (Next.js, Supabase, Vercel)
- App ecosystem showcase with 8+ specialized tools
- MVP scope (what's in Year 1 vs Future Roadmap)
- Platform evaluation and selection rationale

**Performance Metrics Dashboard**
- Year 1 targets organized by category (Youth, Adult, Senior, Org)
- Visual metric cards with icons
- KPI definitions and measurement methods
- UCLA Loneliness Scale integration

**Comprehensive FAQ System**
- Separate FAQ sections for Board, Funder, and Community audiences
- 8+ questions per audience with honest, detailed answers
- Addressing concerns about time commitment, sustainability, safety, privacy

**Get Involved Pathways**
- 8 distinct participation pathways (Youth Member, Adult Mentor, Senior Volunteer, Organisation Partner, Service Provider, Board Member, Community Moderator, Project Sponsor)
- Clear calls to action for each pathway
- Role descriptions and engagement levels

**Founder Profile**
- Ryan Hutchison biography and motivation
- Contact information and professional background
- "Why I'm doing this" narrative

**Strategic Pillars Section**
- 4 detailed pillars with expandable content
- Priority initiatives for each pillar
- Phase indicators for each initiative
- Design principles where applicable

**Initiative Explorer**
- Searchable database of all initiatives across pillars
- Filter by pillar, phase, or search term
- Tabular view with descriptions

### 2. FULL CONSTITUTION INTEGRATION

The Constitution section must include:

**Complete Text**
- All 37 clauses organized into 10 parts
- Plain English mode toggle
- Expandable/collapsible part structure
- Clause-by-clause navigation

**Interactive Elements**
- Click to expand each part
- Highlight active sections
- Quick navigation to specific clauses
- Search functionality for constitution text

**Membership Types Visualization**
- 4 membership types with visual cards
- Voting rights and age requirements clearly displayed
- No-fee commitment highlighted

**Committee Structure**
- Visual representation of required roles
- Committee composition guidelines
- Founder protections clearly explained
- Decision-making processes

**Governance Processes**
- Meeting requirements (AGM, Special Meetings)
- Voting thresholds
- Quorum requirements
- Financial management rules

### 3. STRATEGIC OPERATIONAL FRAMEWORKS INTEGRATION

Both .md documents contain critical operational detail that must be integrated:

**Geographical Firewall**
- Visual map or clear indication of included/excluded areas
- Murrindindi Shire townships listed
- Mitchell Shire exclusion with rationale
- Conflict of interest management explanation

**2026 Operational Roadmap**
- Month-by-month breakdown across 4 phases
- Foundation Phase (Jan-Mar): Incorporation, compliance, tech validation
- Content Phase (Apr-Jun): Website build, beta testing, soft launch
- Launch Phase (Jul-Sep): Public launch, engagement campaigns
- Consolidation Phase (Oct-Dec): AGM, review, planning

**Founder Capacity Management**
- Core Hours protocol (6 hours/week cap)
- Weekday and weekend schedule breakdown
- Blackout periods during Council work hours
- Burnout traffic light system (Green, Amber, Red)
- Monthly check-in framework

**Enterprise Risk Management**
- Extended risk register beyond the 7 main risks
- Succession and contingency planning ("Bus Factor")
- Emergency access protocols
- Comprehensive mitigation strategies

**Data Privacy and Safeguarding**
- Privacy by Design approach
- Australian Privacy Principles compliance
- 11 Victorian Child Safe Standards alignment
- Content moderation protocols
- Vicarious trauma prevention for moderators
- Crisis response procedures

**Digital Infrastructure**
- Non-Profit Industrial Complex tech stack
- Connecting Up registration process
- Google Ad Grant strategy (10k USD/month)
- WCAG 2.1 AA accessibility requirements
- Mobile optimization for low-bandwidth
- Backup strategy (3-2-1 rule)

**Stakeholder Engagement**
- Community Quarterback model
- Neighbourhood House network strategy
- Taungurung Land and Waters Council engagement protocol
- LGBTIQA+ and hidden communities approach
- Disability and inclusion networks

**Partnership Framework**
- Volunteer management framework
- MOU templates
- Data sharing protocols
- Working with Children Check requirements

**Performance Measurement**
- KPIs with definitions and targets
- UCLA 3-Item Loneliness Scale methodology
- Evaluation framework for impact reporting

### 4. NEW UNIFIED HUB FEATURES

**Navigation System**
- Fixed top navigation with sections:
  - Home/Overview
  - Constitution (37 Clauses)
  - Strategic Direction (Vision, Values, Board)
  - Operations & Risk (Roadmap, Risk Register, Capacity)
  - Financial Sustainability (Scenarios, Budget, Grants)
  - Safeguarding & Safety
  - Technology & Platform
  - Performance & Metrics
  - Get Involved
  - Resources & Downloads
- User role selector (Board Member, Community Member, Funder, Partner, General Public)
- Dark mode toggle
- Print/Export mode
- Search functionality across all documents

**Governance Calendar 2026**
- Monthly view of key milestones
- Compliance deadline tracking
- Board meeting schedule
- Grant application deadlines
- Community engagement events

**Resource Library**
- Downloadable templates (MOU, Volunteer Agreement, Privacy Policy)
- Links to external resources (ACNC, Consumer Affairs, Connecting Up)
- Policy documents as they're developed
- Training materials

**Interactive Dashboard (Home Page)**
- Organization status indicators
- Current phase in roadmap
- Active risk count by severity
- Financial health snapshot
- Upcoming key dates
- Quick links to most-used sections

**Stakeholder-Specific Views**
- Board Members: Governance focus, compliance checklist, role descriptions
- Community Members: Programs, get involved, safety information
- Funders: Impact metrics, financial sustainability, outcomes
- Partners: Collaboration opportunities, MOU templates, contact
- General Public: About us, vision, how to participate

### 5. TECHNICAL SPECIFICATIONS

**Framework & Libraries**
- React 18 with functional components and hooks
- Tailwind CSS for styling (current color scheme: Royal Navy primary #003b6f, Cinnabar accent #c2410c)
- Recharts for data visualization (financial charts, metrics)
- Responsive design (mobile-first)
- Dark mode support
- Print-friendly CSS

**Interactivity Requirements**
- Smooth scroll navigation
- Expandable/collapsible sections
- Modal overlays for detailed content
- Tab switching for multi-view content
- Filter and search functionality
- Interactive charts and graphs
- Toast notifications for actions

**Accessibility**
- WCAG 2.1 AA compliance
- Semantic HTML
- ARIA labels and roles
- Keyboard navigation
- Screen reader compatibility
- High contrast mode support
- Plain English toggle where appropriate

**Performance**
- Lazy loading for heavy sections
- Optimized images
- Minimal bundle size
- Fast initial load
- Efficient re-renders

### 6. CONTENT STRUCTURE

**Homepage/Hero Section**
- Organization name and tagline
- Geographical Firewall status badge
- Key statistics (37 Constitution Clauses, 4 Phases, 5 Risk Areas, 6 Hours/Week Cap)
- Quick links to major sections
- Current phase indicator

**Constitution Section**
- 10-part structure preserved
- All 37 clauses with summaries
- Membership types breakdown
- Committee roles and responsibilities
- Meeting and voting procedures
- Financial management rules
- Partnership and advisory frameworks
- Amendment and winding up procedures
- ACNC and ethical standards
- Definitions and legal notes

**Strategic Direction Section**
- Vision statement
- 5 core values with descriptions
- Mission and theory of change
- Context and problem statement
- Market gap and opportunity
- Strategic pillars (4 main pillars)
- Board roles (all positions from Strategic Plan)

**Operations & Risk Section**
- 2026 roadmap (4 phases, 12 months)
- Full risk register (all risks with mitigation)
- Core hours protocol
- Burnout prevention system
- Geographical firewall details
- Founder capacity management

**Financial Sustainability Section**
- Three scenarios (Conservative, Realistic, Optimistic)
- Interactive charts for each scenario
- Year 1 budget breakdown
- Grant examples and sources
- Revenue projections for Year 1 and 2
- Consulting and sponsorship strategy

**Safeguarding Section**
- Multi-age safeguarding framework
- Youth safety commitments
- Elder dignity protocols
- Professional boundaries
- Prevention and response procedures
- Intergenerational protocols
- Accountability measures
- Policy development status

**Technology Section**
- Modern tech stack (Next.js, Supabase, Vercel, etc.)
- App ecosystem (8+ specialized tools)
- MVP scope (in vs out for Year 1)
- Google Ad Grant strategy
- Accessibility features
- Mobile optimization
- Backup and security

**Performance & Metrics Section**
- KPI dashboard (Impact, Reach, Engagement, Operational, Governance)
- Year 1 targets by cohort (Youth, Adult, Senior, Org)
- Measurement methodologies
- UCLA Loneliness Scale
- Evaluation framework

**Get Involved Section**
- 8 participation pathways
- Clear role descriptions
- Time commitments
- Application/expression of interest process

**FAQ Section**
- Board-focused FAQs
- Funder-focused FAQs
- Community-focused FAQs
- Honest answers about challenges and uncertainties

**Founder Section**
- Ryan Hutchison profile
- Background and motivation
- Contact information
- LinkedIn profile

**Resources Section**
- Downloadable templates
- External links
- Policy documents
- Training materials
- Partner organization links

### 7. DESIGN PRINCIPLES

**Visual Hierarchy**
- Clear section headers with icons
- Consistent spacing and typography
- Color-coded risk levels
- Status badges (current, upcoming, planned)
- Visual progress indicators

**User Experience**
- No more than 2 clicks to any information
- Breadcrumb navigation for deep content
- Contextual help and tooltips
- Smooth transitions and animations
- Loading states for dynamic content

**Information Architecture**
- Logical grouping of related content
- Clear parent-child relationships
- Cross-references between sections
- Related content suggestions

**Transparency**
- Honest about limitations and uncertainties
- Clear decision gates and contingencies
- Realistic timelines and targets
- Open about risks and challenges

### 8. DATA STRUCTURE

Ensure all data from the original files is preserved:

```javascript
const unifiedData = {
  organisation: {
    name: "smalltalk.community Inc",
    status: "Strategic Plan 2026-2027",
    region: "Murrindindi Shire",
    vision: "...",
    mission: "...",
    values: [...],
    context: {...}
  },
  constitution: {
    parts: [...], // All 10 parts
    clauses: [...], // All 37 clauses
    membershipTypes: [...],
    committeeRoles: [...],
    advisoryForums: [...],
    policies: [...]
  },
  strategicPlan: {
    timeline: [...], // 4 phases with detailed milestones
    pillars: [...], // 4 strategic pillars with initiatives
    boardRoles: [...], // All board positions
    financials: {
      scenarios: {
        conservative: {...},
        realistic: {...},
        optimistic: {...}
      },
      year1Budget: [...],
      detailedCosts: {...}
    },
    risks: [...], // Complete risk register
    safeguarding: {...}, // Full safeguarding framework
    technology: {
      stack: [...],
      ecosystem: [...],
      mvp: {...}
    },
    metrics: {...}, // All KPIs
    faq: {
      board: [...],
      funder: [...],
      community: [...]
    },
    getInvolved: [...],
    founder: {...}
  },
  operationalFramework: {
    geographicalFirewall: {...},
    roadmap2026: [...], // Month-by-month
    coreHours: {...},
    burnoutSystem: {...},
    risks: [...], // Extended risk details
    digitalInfrastructure: {...},
    stakeholders: [...],
    partnerships: {...},
    kpis: [...]
  }
}
```

### 9. SPECIFIC FEATURES TO INCLUDE

**From Strategic Plan that MUST be in Unified Hub:**
1. Interactive timeline with 4 phases and expandable milestones ✓
2. Recharts financial visualizations (bar charts, line charts) ✓
3. Complete board role modal system with detailed descriptions ✓
4. Risk matrix with color coding and expandable details ✓
5. Three financial scenario selector with charts ✓
6. Technology stack cards with icons ✓
7. App ecosystem showcase ✓
8. MVP scope (in vs out) ✓
9. Safeguarding commitments with multi-age approach ✓
10. Performance metrics dashboard ✓
11. FAQ accordion for 3 audiences ✓
12. Get Involved pathway cards ✓
13. Founder profile with bio and contact ✓
14. Strategic pillars with expandable initiatives ✓
15. Initiative explorer with search and filters ✓

**From Constitution that MUST be enhanced:**
1. All 37 clauses with interactive navigation ✓
2. Plain English mode toggle ✓
3. Membership types visualization ✓
4. Committee structure diagram ✓
5. Voting and quorum requirements ✓
6. Financial management rules ✓
7. Advisory forums breakdown ✓
8. Partnership framework ✓

**From Operational Frameworks that MUST be added:**
1. Geographical firewall visualization with map or clear indicators ✓
2. Month-by-month 2026 roadmap ✓
3. Core hours protocol detailed breakdown ✓
4. Burnout traffic light system interactive display ✓
5. Extended risk register with all operational risks ✓
6. Digital infrastructure strategy ✓
7. Google Ad Grant details ✓
8. Stakeholder engagement framework ✓
9. Volunteer management protocols ✓
10. Privacy and safeguarding detailed procedures ✓
11. UCLA Loneliness Scale methodology ✓
12. Partnership MOU framework ✓

**New Features for Unified Hub:**
1. Governance Calendar 2026 with monthly breakdown ✓
2. User role selector for personalized views ✓
3. Dashboard with organization status ✓
4. Resource library with downloadable templates
5. Search functionality across all documents
6. Cross-references between related sections
7. Export/print mode for board packages
8. Compliance checklist for board members

### 10. OUTPUT FORMAT

Create a single HTML file with:
- React embedded (using unpkg.com CDN)
- Tailwind CSS (using CDN)
- Recharts library (using CDN)
- All data embedded in JavaScript
- Fully functional without external dependencies
- Mobile responsive
- Print-friendly
- Dark mode capable

## Success Criteria

The unified hub is successful when:

1. **Completeness**: Every piece of information from the Constitution, Strategic Plan, and both Operational Framework documents is present and accessible
2. **Interactivity**: All interactive features from the Strategic Plan are preserved and enhanced
3. **Usability**: Information is easy to find, navigate, and understand
4. **Accessibility**: WCAG 2.1 AA compliant with screen reader support
5. **Role-Based**: Content can be filtered/highlighted based on user role
6. **Professional**: Suitable for board presentations, funder pitches, and community engagement
7. **Maintainable**: Clear data structure allows for easy updates
8. **Comprehensive**: Serves as single source of truth for all organizational information

## Key Principles

- **Additive, not subtractive**: Every feature must be included, nothing removed
- **Interactive and engaging**: Charts, filters, expandable sections
- **Honest and transparent**: Reality checks, decision gates, honest limitations
- **Accessible to all**: Plain English, multiple formats, inclusive design
- **Single source of truth**: One place for all organizational information
- **Role-appropriate**: Information organized for different stakeholders
- **Professional and polished**: Ready for board meetings and funder presentations

## Example Section Structure

Here's how the Operations & Risk section should look:

```jsx
const OperationsSection = () => {
  const [activePhase, setActivePhase] = useState(0);
  const [selectedRisk, setSelectedRisk] = useState(null);

  return (
    <section id="operations">
      {/* Geographical Firewall Banner */}
      <GeographicalFirewallBanner />

      {/* 2026 Roadmap */}
      <h3>2026 Operational Roadmap</h3>
      <PhaseSelector phases={roadmap2026} active={activePhase} setActive={setActivePhase} />
      <MonthlyTimeline phase={roadmap2026[activePhase]} />

      {/* Risk Register */}
      <h3>Risk Register</h3>
      <RiskMatrix risks={allRisks} onSelectRisk={setSelectedRisk} />

      {/* Founder Capacity */}
      <div className="grid grid-cols-2 gap-6">
        <CoreHoursProtocol data={coreHours} />
        <BurnoutTrafficLight system={burnoutSystem} />
      </div>

      {/* Digital Infrastructure */}
      <DigitalInfrastructure stack={techStack} />

      {/* Stakeholder Engagement */}
      <StakeholderMap partners={stakeholders} />

      {/* Risk Modal */}
      {selectedRisk && <RiskDetailModal risk={selectedRisk} onClose={() => setSelectedRisk(null)} />}
    </section>
  );
};
```

## Final Notes

This is the comprehensive Information Hub App that serves as the central governance, strategic, and operational resource for smalltalk.community Inc. It must be complete, interactive, accessible, and professional. No shortcuts, no simplifications. Every detail matters because this organization is being built with integrity and transparency from day one.

The app should feel like a living document that board members, funders, partners, and community members can explore to understand every aspect of the organization, from its constitutional foundation to its day-to-day operational reality.
