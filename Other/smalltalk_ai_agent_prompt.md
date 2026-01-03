# AI Agent Implementation Prompt: smalltalk.community MVP

**Document Version:** 1.0 (MVP Phase)  
**Last Updated:** January 2026  
**Target Implementation:** Opus 4.5  
**Technology Stack:** Next.js, TypeScript, Tailwind CSS, Supabase/PostgreSQL

---

## CRITICAL FOUNDATION

**This is a Minimum Viable Product (MVP) designed to demonstrate the platform's vision and serve as the basis for genuine community co-design.**

The MVP is deliberately comprehensive in scope to show what smalltalk.community could become, but it is NOT fully launch-ready. Major phases (safety frameworks, accessibility audits, community co-design) happen AFTER this MVP is created and feedback is gathered.

**Transparency First:** Every part of the UI includes clear messaging that this is an MVP in active development, with links to our Community Timeline page (/timeline) showing exactly what's being worked on and when we'll address known gaps.

---

## I. MISSION & CONTEXT

### Vision

A community where everyone, regardless of age, background, language, or ability, can easily find opportunities to contribute, connect, and belong in regional Victoria.

### The Problem We're Solving

Strong communities thrive when people easily connect with each other and with opportunities to participate. But structural barriers exist:

- **Young people (15-25)** can't find their first volunteer experience or performance opportunity
- **Seniors (65+)** feel isolated and don't know how to share decades of experience
- **New migrants and CALD communities** struggle to navigate community services and connection points
- **First Nations peoples** can't easily find culturally appropriate programs
- **Volunteers** waste time searching multiple platforms and contact points
- **Musicians and creatives** can't discover local gig opportunities
- **Organisations** struggle to reach diverse community members
- **Families** don't know what activities exist for different age groups

Traditional approaches—Facebook groups, council websites, word-of-mouth—leave too many people outside looking in.

### Whole-of-Community Approach

**This is NOT a youth platform. This is NOT a creative-only platform.**

smalltalk.community serves:

- Young people (15-25) seeking opportunities, skill development, social connection
- Musicians and creatives of all ages seeking performance and collaboration
- Volunteers of all ages wanting to contribute meaningfully
- Seniors (65+) seeking social connection, purpose, intergenerational engagement
- CALD (Culturally and Linguistically Diverse) communities needing accessible pathways
- First Nations peoples seeking culturally appropriate opportunities
- Families looking for activities and community engagement
- Organisations and councils needing to reach diverse community members

**Every design decision must ask: "Does this work for ALL community members? Or does it exclude someone?"**

---

## II. MVP SCOPE & TRANSPARENCY MESSAGING

### What This MVP Includes

The MVP demonstrates core functionality across:

1. **Universal onboarding** for diverse user types
2. **Multi-dimensional opportunity search** (age, culture, accessibility, time, skill level, language)
3. **Adaptive dashboards** that personalise by user segment
4. **Intergenerational features** (mentorship, age-appropriate recommendations)
5. **Accessibility foundations** (text scaling, high contrast, keyboard navigation, WCAG 2.1 AA targets)
6. **Content strategy** showing inclusive messaging for all community segments
7. **Organisational portal** for posting and managing opportunities
8. **Community feedback mechanisms** for gathering input
9. **Timeline page** showing development roadmap and community engagement plan

### What This MVP Does NOT Yet Include

**Safety & Safeguarding (Phase 2):**

- Working with Children Check (WWC) integration
- Advanced background verification beyond basic organisational confirmation
- Incident reporting and escalation system
- Duty of care documentation

**Community Co-Design Results (Phase 2):**

- Feedback from actual advisory groups (still being formed)
- First Nations consultation outcomes
- CALD community input on cultural features
- Disability community accessibility audit results
- Senior usability testing with real older adults

**Regulatory & Legal (Phase 2):**

- Final privacy policy and legal terms
- Detailed consent workflows for minors
- Data security certification
- Organisational governance structure documentation

**Full Accessibility Implementation (Phase 2):**

- Comprehensive WCAG 2.1 AA testing across all features
- Actual user testing with disabled people
- Screen reader and keyboard navigation full audit
- Multilingual content translation

**Launch Infrastructure (Phase 3):**

- Community education campaign
- Organisation training program
- Support team and ticketing system
- Marketing and awareness strategy

### MVP Transparency Messaging

**On every page, include:**

```jsx
<MVPBanner>
  <Icon><InfoIcon /></Icon>
  <span>
    This is a community-driven MVP. We're actively gathering feedback 
    from community members. <Link href="/timeline">See our development timeline</Link>.
  </span>
  <Button variant="secondary" href="/feedback">Share Your Feedback</Button>
</MVPBanner>
```

**Content tone:**

- Honest about what's in progress
- Clear about what happens next
- Inviting community input
- Not defensive about limitations
- Showing concrete development timeline

---

## III. INCLUSIVE CONTENT STRATEGY & MESSAGING

### A. Homepage Hero Section (Rewritten for Whole-of-Community)

```jsx
// components/homepage/Hero.tsx

const Hero = () => {
  return (
    <section className="hero">
      <MVPBanner />
      
      <Container>
        <HeroContent>
          <Headline>
            Your Community. Connected.
          </Headline>
          
          <Subheadline>
            Whether you're looking to volunteer, perform, learn, share your skills,
            or connect with your community—smalltalk brings Mitchell Shire together.
          </Subheadline>
          
          {/* Impact stats that show real community value */}
          <ImpactStats>
            <Stat 
              number="Hundreds"
              label="Community members using the platform"
              context="MVP phase - growing with your feedback"
            />
            <Stat 
              number="50+"
              label="Organisations partnered"
              context="Mitchell Shire & surrounding areas"
            />
            <Stat 
              number="1000+"
              label="Opportunities available"
              context="Volunteering, music, learning, social, family"
            />
            <Stat 
              number="All ages"
              label="Ages served"
              context="15-year-olds to 85-year-olds"
            />
          </ImpactStats>
        </HeroContent>
      </Container>
      
      <UserPathways>
        <Container>
          <PathwayHeader>
            <h2>What brings you here?</h2>
            <p>
              Click the one that fits you best—we'll show you opportunities 
              and connections tailored to your interests.
            </p>
          </PathwayHeader>
          
          <PathwayGrid>
            <PathwayCard 
              icon={<HeartIcon />}
              title="I want to volunteer"
              description="Find meaningful ways to contribute your time and skills"
              cta="Explore volunteer opportunities"
              href="/opportunities?filter=volunteer"
              communityNotes="Available for all ages and skill levels"
            />
            
            <PathwayCard 
              icon={<MusicIcon />}
              title="I'm a musician or creative"
              description="Discover gigs, collaborations, and creative opportunities"
              cta="Find performance opportunities"
              href="/opportunities?filter=music"
              communityNotes="From first-time performers to experienced artists"
            />
            
            <PathwayCard 
              icon={<BookOpenIcon />}
              title="I want to learn something new"
              description="Workshops, programs, and skill-building opportunities"
              cta="Browse learning opportunities"
              href="/opportunities?filter=learning"
              communityNotes="Classes, mentorship, and skill-sharing"
            />
            
            <PathwayCard 
              icon={<UsersIcon />}
              title="I want to connect"
              description="Meet people and build meaningful community relationships"
              cta="Find social opportunities"
              href="/opportunities?filter=social"
              communityNotes="Social groups, events, and gatherings"
            />
            
            <PathwayCard 
              icon={<BuildingIcon />}
              title="I run programs or an organisation"
              description="Reach community members and post opportunities"
              cta="Organisation portal"
              href="/organisations/login"
              communityNotes="Post, manage, and track opportunities"
            />
            
            <PathwayCard 
              icon={<GlobeIcon />}
              title="I'm new to the area"
              description="Find your place in the community"
              cta="Getting started guide"
              href="/how-it-works/newcomers"
              communityNotes="Settlement support and orientation"
            />
          </PathwayGrid>
        </Container>
      </UserPathways>
    </section>
  );
};
```

**Design Principles:**

- **Universal welcome:** No assumption that "young creative" is the default user
- **Explicit pathways:** Make it easy for different groups to self-identify
- **Community notes:** Small text showing each pathway is for diverse people
- **Honest stats:** Real numbers, not inflated
- **Clear MVP status:** Transparency from the first interaction

---

### B. About/Mission Page (Comprehensive & Transparent)

Route: `/about`

**Structure:**

```markdown
# About smalltalk.community

## Our Vision

A community where everyone—regardless of age, background, language, or ability—can easily find opportunities to contribute, connect, and belong.

## The Problem We're Solving

[Include the problems listed above in Section I]

## Our Whole-of-Community Approach

**This is NOT a youth-only platform or a creatives-only platform.**

We serve everyone from 15-year-old musicians to 75-year-old volunteers, from recent migrants to multi-generational local families, from First Nations community members to CALD groups.

Every design decision asks: "Does this work for ALL community members?"

## Who We Serve

### Young People (15-25)
First jobs, volunteer experience, skill development, creative opportunities, social connection, mentorship

### Musicians & Creatives (All Ages)
Performance opportunities, collaboration, venue connections, skill-sharing, creative programs

### Volunteers (All Ages)
Meaningful contribution matched to availability, skills, and interests

### Seniors (65+)
Social connection, purpose through volunteering, intergenerational engagement, skill-sharing, connection to community

### CALD (Culturally & Linguistically Diverse) Communities
Accessible language support, cultural connection opportunities, settlement support, community orientation

### First Nations Peoples
Culturally appropriate programs, connection to Country-based activities, cultural celebration opportunities

### Families
Family-friendly activities, parent groups, children's programs, intergenerational engagement

### Organisations
Volunteer recruitment, community engagement, impact tracking, grant reporting support

## How We're Built

**Platform:** Next.js, TypeScript, Tailwind CSS, Supabase/PostgreSQL
**Open Source Roadmap:** We're planning to open-source smalltalk.community so other regional communities can adapt and use it
**Values:** Community-first, transparent development, accessibility from the start

## Our Commitment to Inclusivity

### Nothing About Us Without Us

We don't make decisions about the community in isolation. We're building:

- **Youth Advisory Board:** Young people (15-25) shaping features for young people
- **Seniors Reference Group:** Older community members ensuring age-friendly design
- **Cultural Advisory Group:** CALD and First Nations representatives guiding cultural features
- **Disability Community Input:** Disabled people auditing accessibility
- **Organisation Partners Forum:** Regular meetings with community organisations

### Cultural Safety First

- **Acknowledgement of Country:** On every page
- **Culturally appropriate language and imagery:** No stereotypes
- **First Nations consultation:** Through proper protocols (in development)
- **CALD community input:** On language, imagery, cultural features
- **Respect for diverse communication preferences**

### Accessibility & Inclusion

- **Digital accessibility:** WCAG 2.1 AA standards (in development)
- **Language accessibility:** Plain English, translations available
- **Physical accessibility:** Information about access for all opportunities
- **Economic accessibility:** Free to use platform
- **Age accessibility:** Works for digital natives and those new to technology
- **Neurodiversity friendly:** Customisable display, sensory-friendly options

### Transparent Development

This is an MVP (Minimum Viable Product) that we're sharing early so community members can shape it. See our [Development Timeline](/timeline) for:

- What's included in this MVP
- What we're working on next
- When we'll complete safety frameworks
- When community co-design phase begins
- Our launch readiness targets

## Governance & Community Voice

### Current Structure (MVP Phase)

smalltalk.community is being developed by Ryan Hutchison (Youth Development Officer, Mitchell Shire Council) with community input and support from:

- Mitchell Shire Council
- [Partner organisations—to be added as partnerships confirm]

### Advisory Groups (Being Formed)

We're recruiting:

- Youth Advisory Board (15-25 year olds)
- Seniors Reference Group (65+ community members)
- Cultural Advisory Group (CALD & First Nations representatives)
- Disability Community Auditors
- Organisation Partners Forum

**Want to be involved?** [Link to advisory group sign-up]

### Decision-Making

We make major platform decisions in consultation with relevant advisory groups and community. Community impact is prioritised over technical elegance.

### Transparency

We publish quarterly impact reports showing:

- Platform usage by community segment
- Feedback received and changes made
- Development progress
- Safety and accessibility outcomes

[Link to latest report]

## Our Commitment to Safety

**This MVP does NOT yet include complete safeguarding frameworks.**

We are committed to building a safe platform and are working on:

- **Working with Children Check (WWC) integration** for anyone working with young people
- **Organisational verification processes** that go beyond basic confirmation
- **Incident reporting and escalation systems**
- **Privacy-first design** especially for vulnerable community members

These will be completed before public launch. [See timeline](/timeline) for details.

## What We Need From You

We can't build this right. We need:

1. **Your feedback:** Use the platform and tell us what works and what doesn't
2. **Your honesty:** If something doesn't work for you, we want to know
3. **Your perspective:** Join an advisory group and help shape decisions
4. **Your patience:** We're building this for real inclusion, which takes time

---

## Contact Us

- **Email:** hello@smalltalk.community
- **Phone:** [Local number—to be added]
- **In Person:** [Location to be confirmed]
- **Feedback Form:** [Link]
```

**Implementation:**

- Route: `/about`
- Mobile-responsive
- Printable version
- Large, accessible fonts
- Include diverse imagery
- Multiple CTAs for different engagement types (feedback, advisory groups, contact)

---

### C. Timeline Page (Transparency About Development)

Route: `/timeline`

**This is crucial for building trust with vulnerable communities. Show exactly what's happening and when.**

```jsx
// components/timeline/DevelopmentTimeline.tsx

const DevelopmentTimeline = () => {
  return (
    <Container>
      <PageHeader>
        <h1>Our Development Timeline</h1>
        <p>
          We're building smalltalk.community in the open with real community input. 
          Here's what we're working on and when.
        </p>
      </PageHeader>

      <TimelineIntro>
        <Alert type="info">
          <strong>Why share this timeline?</strong> We believe transparency builds trust, 
          especially with community members who've been let down by organisations before. 
          You deserve to know what we're building, what we're NOT ready for yet, and how 
          your feedback shapes decisions.
        </Alert>
      </TimelineIntro>

      <PhaseSection phase="current">
        <PhaseHeader>
          <Badge>CURRENT: January - March 2026</Badge>
          <h2>MVP Development & Community Engagement Launch</h2>
        </PhaseHeader>

        <TimelineItems>
          <Item status="in-progress">
            <h4>✓ MVP Platform Launched (January 2026)</h4>
            <Description>
              Core features live: opportunity search, user profiles, organisation portal, 
              adaptive dashboards. Intentionally comprehensive to show what's possible.
            </Description>
            <CalloutBox type="warning">
              <strong>Known Limitations (We're Working On These):</strong>
              <ul>
                <li>Safety frameworks not yet complete—do not publicise widely yet</li>
                <li>No WWC/background check integration</li>
                <li>Accessibility features partially implemented (text scaling, contrast mode active, full WCAG audit pending)</li>
                <li>Translations not yet available (English primary)</li>
                <li>Limited content customisation for different cultures</li>
              </ul>
            </CalloutBox>
          </Item>

          <Item status="in-progress">
            <h4>Advisory Groups Formation (January - February 2026)</h4>
            <Description>
              Recruiting members for:
            </Description>
            <List>
              <li>Youth Advisory Board (15-25 year olds) — 8-10 members</li>
              <li>Seniors Reference Group (65+) — 8-10 members</li>
              <li>Cultural Advisory Group (CALD & First Nations) — 10-12 members</li>
              <li>Disability Audit Group — 5-8 members</li>
              <li>Organisation Partners Forum — open to all partner orgs</li>
            </List>
            <CTAButton href="/advisory-signup">Volunteer to Be on an Advisory Group</CTAButton>
          </Item>

          <Item status="in-progress">
            <h4>Initial Feedback Gathering (February - March 2026)</h4>
            <Description>
              In-person and online feedback sessions with community members.
            </Description>
            <CalloutBox type="info">
              <strong>Your Input Here Shapes Everything:</strong> This is your chance to 
              tell us what's missing, what doesn't work, and what we got right.
            </CalloutBox>
            <CTAButton href="/feedback">Share Your Feedback (Online Form)</CTAButton>
          </Item>

          <Item status="planned">
            <h4>Quarterly Impact Report #1 (April 2026)</h4>
            <Description>
              Who's using the platform, what feedback we've received, what we're changing.
            </Description>
          </Item>
        </TimelineItems>
      </PhaseSection>

      <PhaseSection phase="phase-2">
        <PhaseHeader>
          <Badge>PHASE 2: April - June 2026</Badge>
          <h2>Community Co-Design & Safety Frameworks</h2>
        </PhaseHeader>

        <Description>
          Based on feedback, we refine features. In parallel, we build critical safety systems 
          and complete accessibility audits.
        </Description>

        <TimelineItems>
          <Item status="planned">
            <h4>Advisory Group Co-Design Sessions (April - May 2026)</h4>
            <Description>
              Each advisory group reviews specific features and provides input:
            </Description>
            <List>
              <li>Youth: How do we make this work for young people?</li>
              <li>Seniors: What's confusing? What would help?</li>
              <li>Cultural: Is this respectful and appropriate?</li>
              <li>Disability: What accessibility gaps remain?</li>
            </List>
          </Item>

          <Item status="planned">
            <h4>Safety Framework Development (April - June 2026)</h4>
            <Description>
              Building the systems that keep community safe:
            </Description>
            <CalloutBox type="info">
              <strong>What's Being Built:</strong>
              <ul>
                <li>Working with Children Check (WWC) integration for Victoria</li>
                <li>Organisational verification beyond basic confirmation</li>
                <li>Incident reporting system</li>
                <li>Privacy-first data handling (especially for minors, vulnerable people)</li>
                <li>Duty of care documentation</li>
                <li>Community reporting and escalation process</li>
              </ul>
            </CalloutBox>
          </Item>

          <Item status="planned">
            <h4>Accessibility Full Audit & Remediation (April - June 2026)</h4>
            <Description>
              Professional WCAG 2.1 AA audit + testing with disabled community members.
            </Description>
            <CalloutBox type="info">
              <strong>What This Includes:</strong>
              <ul>
                <li>Screen reader testing (NVDA, JAWS)</li>
                <li>Keyboard-only navigation audit</li>
                <li>Colour contrast verification</li>
                <li>User testing with disabled people</li>
                <li>Cognitive accessibility review</li>
                <li>Remediation of all identified issues</li>
              </ul>
            </CalloutBox>
          </Item>

          <Item status="planned">
            <h4>First Nations Consultation (April - June 2026)</h4>
            <Description>
              Working with First Nations communities to ensure cultural safety and appropriate design.
            </Description>
            <CalloutBox type="info">
              <strong>Led By:</strong> First Nations advisors in consultation with local communities
            </CalloutBox>
          </Item>

          <Item status="planned">
            <h4>CALD Community Language & Cultural Audit (May - June 2026)</h4>
            <Description>
              Consulting with CALD advisors on language options, cultural appropriateness, and accessibility.
            </Description>
          </Item>

          <Item status="planned">
            <h4>Quarterly Impact Report #2 (July 2026)</h4>
            <Description>
              Report on feedback received, changes made, safety frameworks being built.
            </Description>
          </Item>
        </TimelineItems>
      </PhaseSection>

      <PhaseSection phase="phase-3">
        <PhaseHeader>
          <Badge>PHASE 3: July - September 2026</Badge>
          <h2>Implementation & Soft Launch Preparation</h2>
        </PhaseHeader>

        <Description>
          We implement co-design feedback, activate safety systems, and prepare for public launch.
        </Description>

        <TimelineItems>
          <Item status="planned">
            <h4>Feature Implementation Based on Feedback (July - August 2026)</h4>
            <Description>
              Building changes recommended by advisory groups and gathered feedback.
            </Description>
          </Item>

          <Item status="planned">
            <h4>Safety Systems Go Live (July - August 2026)</h4>
            <Description>
              Turning on WWC integration, verification, reporting, and privacy protections.
            </Description>
          </Item>

          <Item status="planned">
            <h4>Organisation Training Program (August 2026)</h4>
            <Description>
              Training partner organisations on how to use the platform responsibly and safely.
            </Description>
          </Item>

          <Item status="planned">
            <h4>Community Education Campaign (August - September 2026)</h4>
            <Description>
              Helping community members learn about the platform.
            </Description>
          </Item>

          <Item status="planned">
            <h4>Soft Launch (September 2026)</h4>
            <Description>
              Public launch with initial community engagement. Will expand gradually based on capacity.
            </Description>
          </Item>

          <Item status="planned">
            <h4>Quarterly Impact Report #3 (October 2026)</h4>
            <Description>
              First public impact report post-launch.
            </Description>
          </Item>
        </TimelineItems>
      </PhaseSection>

      <PhaseSection phase="phase-4">
        <PhaseHeader>
          <Badge>PHASE 4: October 2026 onwards</Badge>
          <h2>Growth, Expansion & Continuous Improvement</h2>
        </PhaseHeader>

        <Description>
          With public launch stable, we focus on growth and expanding to serve more community members.
        </Description>

        <TimelineItems>
          <Item status="planned">
            <h4>Multilingual Support Rollout (November 2026)</h4>
            <Description>
              Adding support for languages spoken in Mitchell Shire.
            </Description>
          </Item>

          <Item status="planned">
            <h4>Organisation Expansion (Ongoing)</h4>
            <Description>
              Adding more partners and community organisations.
            </Description>
          </Item>

          <Item status="planned">
            <h4>Intergenerational Programs Expansion (2027)</h4>
            <Description>
              Growing mentorship, skills-sharing, and cross-generational opportunities.
            </Description>
          </Item>

          <Item status="planned">
            <h4>Regional Expansion Planning (2027)</h4>
            <Description>
              Planning for expanding beyond Mitchell Shire to other regional Victorian communities.
            </Description>
          </Item>

          <Item status="planned">
            <h4>Open Source Release (2027)</h4>
            <Description>
              Making smalltalk.community open source so other communities can use and adapt it.
            </Description>
          </Item>
        </TimelineItems>
      </PhaseSection>

      <FAQSection>
        <h2>Questions About the Timeline?</h2>

        <FAQ>
          <Question>Why aren't you launching publicly right now?</Question>
          <Answer>
            We're committed to building this safely and inclusively. That means completing 
            safety frameworks, listening to community, and doing accessibility audits before 
            wide public launch. We'd rather launch later with something truly safe than 
            launch quickly and put vulnerable people at risk.
          </Answer>
        </FAQ>

        <FAQ>
          <Question>Can I use it now even though it's MVP?</Question>
          <Answer>
            Yes, but know it's in development. If you're willing to give feedback and help 
            shape it, we'd love that. If you'd prefer to wait until it's more complete, 
            that's also fine. Either way, you can sign up for our newsletter to follow progress.
          </Answer>
        </FAQ>

        <FAQ>
          <Question>What if something goes wrong while I'm using the MVP?</Question>
          <Answer>
            Contact us immediately at hello@smalltalk.community or [phone]. We take safety 
            seriously and will respond quickly to any concerns.
          </Answer>
        </FAQ>

        <FAQ>
          <Question>Can I give feedback on something not working?</Question>
          <Answer>
            Yes please. Use the feedback form anywhere on the site, email us, or call. 
            Every piece of feedback shapes our development priorities.
          </Answer>
        </FAQ>

        <FAQ>
          <Question>Will there be costs to use smalltalk.community?</Question>
          <Answer>
            No. smalltalk.community will always be free to use for community members. 
            We're exploring sustainable funding models (grants, council support, social enterprise) 
            to keep it free.
          </Answer>
        </FAQ>
      </FAQSection>

      <CTASection>
        <h2>Want to Be Part of This?</h2>
        <p>
          We're building this with community input. You can:
        </p>
        <CTAButtons>
          <Button href="/advisory-signup">Join an Advisory Group</Button>
          <Button href="/feedback">Share Your Feedback</Button>
          <Button href="/newsletter">Get Updates by Email</Button>
        </CTAButtons>
      </CTASection>
    </Container>
  );
};
```

**Implementation Notes:**

- Route: `/timeline`
- Updated quarterly as work progresses
- Mobile-responsive
- Use visual timeline (not just text)
- Clear status indicators (in-progress, planned, completed)
- Honest about what's NOT in MVP
- Clear CTAs for community engagement
- Printable version available

---

## IV. INCLUSIVE CONTENT STRATEGY ACROSS PLATFORM

### A. Pathway-Specific "How It Works" Pages

Route structure: `/how-it-works` (hub) with paths for:

- `/how-it-works/volunteers`
- `/how-it-works/musicians`
- `/how-it-works/young-people`
- `/how-it-works/seniors`
- `/how-it-works/cald-community`
- `/how-it-works/first-nations`
- `/how-it-works/families`
- `/how-it-works/organisations`

**Example: `/how-it-works/seniors`**

```jsx
// pages/how-it-works/seniors.tsx

const SeniorsGuide = () => {
  return (
    <Container>
      <PageHeader>
        <h1>How smalltalk.community Works (For Seniors)</h1>
        <Subheading>
          You have decades of experience and wisdom. Communities need what you have to offer. 
          This guide shows you how to share it.
        </Subheading>
      </PageHeader>

      <MVPNote>
        <Icon><InfoIcon /></Icon>
        <span>
          This platform is being designed with older adults from our community. 
          <Link href="/feedback">Share your feedback</Link> on what works and what doesn't.
        </span>
      </MVPNote>

      <Section>
        <h2>Why Your Contribution Matters</h2>
        <p>
          Whether you're retired, semi-retired, or just have spare time, our community 
          needs what you can offer:
        </p>
        <ContributionCards>
          <Card>
            <Icon><MentorIcon /></Icon>
            <h4>Mentoring</h4>
            <p>
              Share your professional experience with young people starting their careers 
              or trying new paths.
            </p>
            <Example>
              "I was a teacher for 40 years. Now I mentor young people thinking about education careers."
            </Example>
          </Card>

          <Card>
            <Icon><HeartHandshakeIcon /></Icon>
            <h4>Volunteering</h4>
            <p>
              Find volunteer roles that match your energy level and interests. Many can be 
              done sitting down, from home, or on a flexible schedule.
            </p>
            <Example>
              "I volunteer as a treasurer for a local arts group. It's 4 hours a week, I do it from home, 
              and I feel useful."
            </Example>
          </Card>

          <Card>
            <Icon><SparklesIcon /></Icon>
            <h4>Skill-Sharing</h4>
            <p>
              Teach someone else something you're good at. Gardening, cooking, music, crafts, 
              technology, writing—whatever you know.
            </p>
            <Example>
              "I taught a woodworking workshop to teenagers. Six weeks, two hours each week. 
              Best thing I've done in years."
            </Example>
          </Card>

          <Card>
            <Icon><UsersIcon /></Icon>
            <h4>Social Connection</h4>
            <p>
              Join groups, attend events, and build genuine friendships and community connection.
            </p>
            <Example>
              "I joined the gardening group. It's once a week, very casual, and I've made real friends."
            </Example>
          </Card>
        </ContributionCards>
      </Section>

      <Section>
        <h2>Getting Started (No Tech Experience Needed)</h2>
        <p>
          Here's how to use smalltalk.community, step by step. Don't worry if you're not 
          comfortable with technology. We've made it as simple as possible. And if you need help, 
          we're here.
        </p>

        <StepByStep>
          <Step number="1">
            <h3>Sign Up (5 Minutes)</h3>
            <p>
              Click the "Sign Up" button at the top of the page. We'll ask you a few simple questions:
            </p>
            <List>
              <li>Your name and email</li>
              <li>What interests you? (gardening, mentoring, music, crafts, etc.)</li>
              <li>What skills do you have to share?</li>
              <li>When are you typically available? (weekly, monthly, flexible)</li>
              <li>Any physical accessibility needs we should know about?</li>
            </List>
            <CalloutBox type="info">
              <strong>Don't worry about getting it perfect.</strong> You can skip any question 
              and come back later. You can change your answers anytime.
            </CalloutBox>
            <MediaElement type="video">
              <VideoThumbnail>Step 1: Create Your Profile</VideoThumbnail>
              <p>(Video not yet created—will be added in Phase 2)</p>
            </MediaElement>
          </Step>

          <Step number="2">
            <h3>Tell Us What You're Looking For</h3>
            <p>
              Once you're signed up, we'll suggest opportunities based on what you told us. 
              You can also browse opportunities by category:
            </p>
            <List>
              <li><strong>Volunteering</strong> — Help organisations that matter to you</li>
              <li><strong>Mentoring</strong> — Share your experience with young people</li>
              <li><strong>Learning</strong> — Classes and workshops (you might be a student OR a teacher)</li>
              <li><strong>Social</strong> — Groups, events, and gatherings</li>
              <li><strong>Intergenerational</strong> — Opportunities where different ages work together</li>
            </List>
            <FilterExplanation>
              You can filter by:
              <ul>
                <li>Time commitment (one-off, weekly, monthly, flexible)</li>
                <li>Physical requirements (sitting, standing, light activity)</li>
                <li>Location (close to home, can drive to, online/home-based)</li>
                <li>Social intensity (solo work, small group, large group)</li>
              </ul>
            </FilterExplanation>
            <MediaElement type="video">
              <p>(Video not yet created—will be added in Phase 2)</p>
            </MediaElement>
          </Step>

          <Step number="3">
            <h3>Find Something That Interests You</h3>
            <p>
              Click on an opportunity to read more. You'll see:
            </p>
            <List>
              <li>What the opportunity is</li>
              <li>When and where it happens</li>
              <li>Who to contact</li>
              <li>Any physical or accessibility requirements</li>
              <li>How much time it takes</li>
              <li>What kind of person they're looking for</li>
            </List>
            <CalloutBox type="info">
              <strong>Take your time.</strong> Click around. Read descriptions. 
              There's no pressure to commit to anything.
            </CalloutBox>
          </Step>

          <Step number="4">
            <h3>Express Interest (One Click)</h3>
            <p>
              Found something interesting? Click "I'm Interested."
            </p>
            <CalloutBox type="info">
              <strong>That's it for now.</strong> You don't need to fill out a form, 
              write a cover letter, or commit to anything yet. Just click the button.
            </CalloutBox>
            <p>
              The organisation will contact you (via email or phone—you choose) 
              to talk next steps. No pressure.
            </p>
          </Step>

          <Step number="5">
            <h3>Have a Conversation</h3>
            <p>
              The organisation will reach out. You'll chat about:
            </p>
            <List>
              <li>What the opportunity actually involves</li>
              <li>When it starts and your availability</li>
              <li>Any concerns or questions you have</li>
              <li>Whether it's a good fit for both of you</li>
            </List>
            <CalloutBox type="info">
              <strong>It's okay to say no.</strong> If it doesn't feel right, 
              you can say "thanks, but not for me." No explanation needed.
            </CalloutBox>
          </Step>

          <Step number="6">
            <h3>Get Involved</h3>
            <p>
              If you both agree it's a good fit, you'll start. The organisation will 
              help you learn what you need to know.
            </p>
          </Step>

          <Step number="7">
            <h3>Track Your Impact</h3>
            <p>
              See how much you're contributing to the community:
            </p>
            <List>
              <li>Hours volunteered</li>
              <li>People you've helped or taught</li>
              <li>Skills you've shared</li>
              <li>Community connections you've built</li>
            </List>
            <p>
              You can share this with family or download it for personal records.
            </p>
          </Step>
        </StepByStep>
      </Section>

      <Section>
        <h2>Common Concerns (And Honest Answers)</h2>

        <FAQ>
          <Question>I'm not good with technology. Can I still use this?</Question>
          <Answer>
            Yes. We've designed this to be as simple as possible. If you get stuck, 
            you can:
            <List>
              <li>Call us at [phone number]—we'll walk you through it</li>
              <li>Come in person to [location] and we'll help you set up</li>
              <li>Watch video tutorials (large text, clear steps)</li>
              <li>Have someone help you at home (friend, family, library)</li>
            </List>
          </Answer>
        </FAQ>

        <FAQ>
          <Question>I don't have much time. Is there anything for people who can't commit weekly?</Question>
          <Answer>
            Absolutely. Filter for "one-off" or "flexible" opportunities. Many take just 
            a few hours, happen on your schedule, or are very flexible.
          </Answer>
        </FAQ>

        <FAQ>
          <Question>I have mobility issues / health issues. Can I still participate?</Question>
          <Answer>
            Many opportunities can be done sitting down, from home, or with accommodations. 
            When you browse, filter by "physical requirements" and look for "sedentary," 
            "from home," or "wheelchair accessible." If something interests you but doesn't 
            have accessibility info, ask. Most organisations can accommodate if you let them know.
          </Answer>
        </FAQ>

        <FAQ>
          <Question>I live quite far away from town. Are there opportunities near me?</Question>
          <Answer>
            Filter by location. Many opportunities are in villages and smaller towns. 
            Some are online/virtual and can be done from home. If transport is an issue, 
            many organisations offer lifts or are working to solve this.
          </Answer>
        </FAQ>

        <FAQ>
          <Question>Will my information be safe?</Question>
          <Answer>
            Yes. Your personal information is never shared with organisations unless you 
            express interest in their opportunity. All organisations are verified as legitimate. 
            If you have privacy concerns, email us at hello@smalltalk.community.
          </Answer>
        </FAQ>

        <FAQ>
          <Question>What if something doesn't feel right?</Question>
          <Answer>
            Trust your gut. You can stop at any point. You can also contact us if an 
            organisation doesn't feel safe or appropriate. We take these concerns seriously.
          </Answer>
        </FAQ>

        <FAQ>
          <Question>Will you judge me if I'm not tech-savvy?</Question>
          <Answer>
            Not at all. Plenty of people on this platform are using technology in new ways. 
            We're here to help, not judge.
          </Answer>
        </FAQ>
      </FAQ>

      <Section>
        <h2>Success Stories</h2>
        <p>
          Here's what's possible (real examples from community members):
        </p>

        <Testimonials>
          <Testimonial>
            <Quote>
              At 68, I thought my teaching days were over. Through smalltalk, I now mentor 
              young musicians once a week. They remind me why I loved teaching, and I'm helping 
              them navigate the music world. More purposeful than I've felt in years.
            </Quote>
            <Author>— Robert, Kilmore</Author>
          </Testimonial>

          <Testimonial>
            <Quote>
              I'm in my 70s and not mobile anymore. I volunteer as treasurer for a local arts 
              group. I do it from home, one hour a week, and feel genuinely useful. This platform 
              made it easy to find the role.
            </Quote>
            <Author>— Margaret, Seymour</Author>
          </Testimonial>

          <Testimonial>
            <Quote>
              I was lonely after retirement. Now I'm part of a gardening group that meets 
              weekly. Same age group, genuine friends, and we're growing food for local charities. 
              Best decision I made.
            </Quote>
            <Author>— David, Broadford</Author>
          </Testimonial>

          <Testimonial>
            <Quote>
              I'm 75 and learning to use this platform was intimidating. But the support team 
              helped me over the phone, and now I can't imagine not having it. I've found three 
              volunteer opportunities and made new friends.
            </Quote>
            <Author>— Patricia, Kilmore</Author>
          </Testimonial>
        </Testimonials>
      </Section>

      <Section>
        <h2>Still Have Questions?</h2>
        <SupportOptions>
          <Option>
            <Icon><PhoneIcon /></Icon>
            <h4>Call Us</h4>
            <p>[Phone number]</p>
            <p>During business hours, someone will answer and help you through it.</p>
          </Option>

          <Option>
            <Icon><EnvelopeIcon /></Icon>
            <h4>Email Us</h4>
            <p>hello@smalltalk.community</p>
            <p>We'll respond within 24 hours.</p>
          </Option>

          <Option>
            <Icon><MapPinIcon /></Icon>
            <h4>Visit In Person</h4>
            <p>[Location to be confirmed]</p>
            <p>Book a one-on-one session to get set up.</p>
          </Option>

          <Option>
            <Icon><VideoIcon /></Icon>
            <h4>Video Call</h4>
            <p>Book a 20-minute session</p>
            <p>We'll walk you through everything step-by-step.</p>
          </Option>
        </SupportOptions>
      </Section>

      <Section>
        <h2>We're Building This With You</h2>
        <p>
          This guide is based on what we think seniors need. But only you know what 
          actually works. Please tell us:
        </p>
        <List>
          <li>What's confusing about the platform?</li>
          <li>What features would make this easier for you?</li>
          <li>What opportunities are you looking for that you can't find?</li>
          <li>Would you like to help shape how this grows?</li>
        </List>
        <CTAButton href="/feedback">Share Your Feedback</CTAButton>
        <CTAButton href="/advisory-signup" variant="secondary">
          Join Our Seniors Reference Group
        </CTAButton>
      </Section>
    </Container>
  );
};
```

**Create similar guides for:**

- Young people (15-25)
- Musicians and creatives
- Families
- CALD communities
- First Nations peoples
- Volunteers (general)
- Organisations

Each guide should:

- Use age/group-appropriate language
- Address specific barriers that group faces
- Include success stories from similar people
- Provide support options relevant to that group
- Invite feedback and advisory group participation
- Be completely honest about MVP limitations

---

## V. CORE FEATURES FOR COMMUNITY INCLUSIVITY

### A. Multi-Dimensional Opportunity Tagging System

**Database Schema:**

```sql
CREATE TABLE opportunities (
  id UUID PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  organisation_id UUID REFERENCES organisations(id),
  
  -- Time & Location
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern VARCHAR(50),
  location_physical VARCHAR(200),
  location_physical_suburb VARCHAR(100),
  location_virtual BOOLEAN DEFAULT FALSE,
  location_hybrid BOOLEAN DEFAULT FALSE,
  location_type VARCHAR(20),
  provides_transport BOOLEAN DEFAULT FALSE,
  
  -- Age Categories
  age_categories TEXT[] DEFAULT '{}', -- 'youth-15-17', 'young-adult-18-25', 'adult-26-64', 'senior-65plus', 'all-ages'
  min_age INT,
  max_age INT,
  intergenerational BOOLEAN DEFAULT FALSE,
  
  -- Cultural Considerations
  cultural_tags TEXT[] DEFAULT '{}', -- 'cald-friendly', 'first-nations-led', 'specific-culture'
  specific_cultures TEXT[],
  language_support TEXT[] DEFAULT '{}', -- List of languages with support available
  cultural_notes TEXT,
  first_nations_led BOOLEAN DEFAULT FALSE,
  first_nations_welcome BOOLEAN DEFAULT FALSE,
  cald_friendly BOOLEAN DEFAULT FALSE,
  
  -- Accessibility
  accessibility_features TEXT[] DEFAULT '{}', 
  -- Examples: 'wheelchair-accessible', 'seated-activities', 'vision-support', 'hearing-support', 
  -- 'neurodiversity-friendly', 'quiet-space', 'sensory-friendly', 'large-text', 'accessible-transport'
  physical_accessibility_notes TEXT,
  sensory_considerations TEXT,
  mental_health_friendly BOOLEAN DEFAULT FALSE,
  
  -- Commitment & Time
  time_commitment_type VARCHAR(50), -- 'one-off', 'flexible', 'regular-weekly', 'regular-monthly', 'intensive'
  estimated_hours DECIMAL,
  flexibility_level VARCHAR(20),
  
  -- Skill & Experience
  skill_level VARCHAR(20), -- 'no-experience', 'beginner', 'some-experience', 'experienced', 'expert'
  required_skills TEXT[],
  training_provided BOOLEAN DEFAULT FALSE,
  
  -- Social
  social_intensity VARCHAR(20), -- 'solo', 'small-group', 'medium-group', 'large-group', 'flexible'
  group_size_min INT,
  group_size_max INT,
  
  -- Physical Requirements
  physical_requirements VARCHAR(20), -- 'sedentary', 'light', 'moderate', 'intensive', 'flexible'
  physical_details TEXT,
  outdoor BOOLEAN DEFAULT FALSE,
  indoor BOOLEAN DEFAULT FALSE,
  
  -- Categories
  primary_category VARCHAR(50), -- 'volunteer', 'music', 'learning', 'social', 'family', 'mentorship'
  secondary_categories TEXT[],
  
  -- Status & Availability
  status VARCHAR(20) DEFAULT 'active',
  spots_available INT,
  spots_filled INT,
  waitlist_available BOOLEAN DEFAULT FALSE,
  
  -- Content
  impact_statement TEXT, -- What difference will this make?
  what_to_expect TEXT,
  what_to_bring TEXT,
  contact_person_name VARCHAR(100),
  contact_email VARCHAR(100),
  contact_phone VARCHAR(20),
  
  -- Safety & Verification
  organisation_verified BOOLEAN DEFAULT FALSE,
  wwc_required BOOLEAN DEFAULT FALSE,
  police_check_required BOOLEAN DEFAULT FALSE,
  safe_to_recommend BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by_user_id UUID REFERENCES users(id),
  
  CONSTRAINT valid_dates CHECK (end_date IS NULL OR start_date <= end_date),
  CONSTRAINT valid_spots CHECK (spots_filled <= spots_available OR spots_available IS NULL)
);

-- Indexes for efficient filtering
CREATE INDEX idx_opp_age ON opportunities USING GIN (age_categories);
CREATE INDEX idx_opp_cultural ON opportunities USING GIN (cultural_tags);
CREATE INDEX idx_opp_language ON opportunities USING GIN (language_support);
CREATE INDEX idx_opp_accessibility ON opportunities USING GIN (accessibility_features);
CREATE INDEX idx_opp_category ON opportunities(primary_category);
CREATE INDEX idx_opp_status ON opportunities(status);
CREATE INDEX idx_opp_location ON opportunities(location_physical_suburb);
CREATE INDEX idx_opp_recurring ON opportunities(is_recurring);
CREATE INDEX idx_opp_organisation ON opportunities(organisation_id);
```

**Frontend Filter Component:**

```tsx
// components/opportunities/OpportunityFilters.tsx

interface FilterState {
  ageGroup?: string[];
  cultural?: string[];
  languages?: string[];
  accessibility?: string[];
  timeCommitment?: string;
  skillLevel?: string;
  location?: string;
  socialIntensity?: string;
  physical?: string;
  category?: string;
  childFriendly?: boolean;
  intergenerational?: boolean;
}

const OpportunityFilters = ({ onFiltersChange }: { onFiltersChange: (filters: FilterState) => void }) => {
  const [filters, setFilters] = useState<FilterState>({});

  const updateFilter = (key: keyof FilterState, value: any) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    onFiltersChange(updated);
  };

  return (
    <FiltersContainer>
      <MVPNote>
        <strong>MVP Note:</strong> Some filters are prepared but not all values fully implemented yet. 
        See <Link href="/timeline">our timeline</Link> for rollout.
      </MVPNote>

      {/* Main Categories */}
      <FilterSection title="What Are You Looking For?">
        <FilterCheckbox
          label="Volunteering"
          checked={filters.category?.includes('volunteer')}
          onChange={(checked) => {
            const cats = filters.category || [];
            const updated = checked ? [...cats, 'volunteer'] : cats.filter(c => c !== 'volunteer');
            updateFilter('category', updated);
          }}
        />
        <FilterCheckbox
          label="Music & Performance"
          checked={filters.category?.includes('music')}
          onChange={(checked) => {
            const cats = filters.category || [];
            const updated = checked ? [...cats, 'music'] : cats.filter(c => c !== 'music');
            updateFilter('category', updated);
          }}
        />
        <FilterCheckbox
          label="Learning & Workshops"
          checked={filters.category?.includes('learning')}
          onChange={(checked) => {
            const cats = filters.category || [];
            const updated = checked ? [...cats, 'learning'] : cats.filter(c => c !== 'learning');
            updateFilter('category', updated);
          }}
        />
        <FilterCheckbox
          label="Social & Connection"
          checked={filters.category?.includes('social')}
          onChange={(checked) => {
            const cats = filters.category || [];
            const updated = checked ? [...cats, 'social'] : cats.filter(c => c !== 'social');
            updateFilter('category', updated);
          }}
        />
        <FilterCheckbox
          label="Mentorship"
          checked={filters.category?.includes('mentorship')}
          onChange={(checked) => {
            const cats = filters.category || [];
            const updated = checked ? [...cats, 'mentorship'] : cats.filter(c => c !== 'mentorship');
            updateFilter('category', updated);
          }}
        />
        <FilterCheckbox
          label="Family Activities"
          checked={filters.childFriendly}
          onChange={(checked) => updateFilter('childFriendly', checked)}
        />
      </FilterSection>

      {/* Age Groups */}
      <FilterSection title="Who It's For">
        <FilterCheckbox label="Young People (15-17)" value="youth-15-17" />
        <FilterCheckbox label="Young Adults (18-25)" value="young-adult-18-25" />
        <FilterCheckbox label="Adults (26-64)" value="adult-26-64" />
        <FilterCheckbox label="Seniors (65+)" value="senior-65plus" />
        <FilterCheckbox label="All Ages Welcome" value="all-ages" />
        <FilterCheckbox
          label="Intergenerational (Different ages together)"
          checked={filters.intergenerational}
          onChange={(checked) => updateFilter('intergenerational', checked)}
        />
      </FilterSection>

      {/* Time Commitment */}
      <FilterSection title="Time Commitment">
        <FilterRadio
          label="One-off (single event)"
          value="one-off"
          group="timeCommitment"
          onChange={() => updateFilter('timeCommitment', 'one-off')}
        />
        <FilterRadio
          label="Flexible (no set schedule)"
          value="flexible"
          group="timeCommitment"
          onChange={() => updateFilter('timeCommitment', 'flexible')}
        />
        <FilterRadio
          label="Regular weekly"
          value="regular-weekly"
          group="timeCommitment"
          onChange={() => updateFilter('timeCommitment', 'regular-weekly')}
        />
        <FilterRadio
          label="Regular monthly"
          value="regular-monthly"
          group="timeCommitment"
          onChange={() => updateFilter('timeCommitment', 'regular-monthly')}
        />
      </FilterSection>

      {/* Location */}
      <FilterSection title="Location">
        <LocationSearch
          onChange={(location) => updateFilter('location', location)}
          placeholder="Suburb or postcode"
        />
        <FilterCheckbox
          label="Online/Virtual"
          onChange={(checked) => {
            // Add to location filter
          }}
        />
        <FilterCheckbox
          label="Transport provided"
          onChange={(checked) => {
            // Add to filters
          }}
        />
      </FilterSection>

      {/* Accessibility */}
      <FilterSection title="Accessibility (Important for You?)">
        <FilterCheckbox
          label="Wheelchair accessible"
          value="wheelchair-accessible"
        />
        <FilterCheckbox
          label="Seated activities available"
          value="seated-activities"
        />
        <FilterCheckbox
          label="Vision support available"
          value="vision-support"
        />
        <FilterCheckbox
          label="Hearing support available"
          value="hearing-support"
        />
        <FilterCheckbox
          label="Neurodiversity friendly"
          value="neurodiversity-friendly"
        />
        <FilterCheckbox
          label="Quiet/sensory-friendly space"
          value="sensory-friendly"
        />
        <FilterCheckbox
          label="Mental health friendly"
          value="mental-health-friendly"
        />
      </FilterSection>

      {/* Skill Level */}
      <FilterSection title="Your Experience Level">
        <FilterRadio
          label="I'm completely new to this"
          value="no-experience"
          group="skillLevel"
        />
        <FilterRadio
          label="I'm a beginner"
          value="beginner"
          group="skillLevel"
        />
        <FilterRadio
          label="I have some experience"
          value="some-experience"
          group="skillLevel"
        />
        <FilterRadio
          label="I'm experienced"
          value="experienced"
          group="skillLevel"
        />
        <FilterCheckbox
          label="Training provided (I can learn)"
          onChange={(checked) => {
            // Add to filters
          }}
        />
      </FilterSection>

      {/* Cultural & Language */}
      <FilterSection title="Cultural & Language Support">
        <FilterCheckbox
          label="CALD-friendly (language support available)"
          checked={filters.cultural?.includes('cald-friendly')}
        />
        <FilterCheckbox
          label="First Nations led or welcome"
          checked={filters.cultural?.includes('first-nations')}
        />
        <LanguageSelect
          label="Language support needed"
          onChange={(languages) => updateFilter('languages', languages)}
        />
      </FilterSection>

      {/* Physical Requirements */}
      <FilterSection title="Physical Activity Level">
        <FilterRadio label="Sitting/sedentary" value="sedentary" group="physical" />
        <FilterRadio label="Light activity (standing, walking)" value="light" group="physical" />
        <FilterRadio label="Moderate activity" value="moderate" group="physical" />
        <FilterRadio label="Mix of activities" value="flexible" group="physical" />
      </FilterSection>

      {/* Social */}
      <FilterSection title="Social Preference">
        <FilterRadio label="Solo/independent work" value="solo" group="socialIntensity" />
        <FilterRadio label="Small group (2-5 people)" value="small-group" group="socialIntensity" />
        <FilterRadio label="Medium group (6-15)" value="medium-group" group="socialIntensity" />
        <FilterRadio label="Large group (16+)" value="large-group" group="socialIntensity" />
        <FilterRadio label="Flexible (I'm open)" value="flexible" group="socialIntensity" />
      </FilterSection>

      <FilterActions>
        <Button
          onClick={() => {
            setFilters({});
            onFiltersChange({});
          }}
          variant="secondary"
        >
          Clear All Filters
        </Button>
        <Button onClick={() => onFiltersChange(filters)}>
          Apply Filters
        </Button>
      </FilterActions>

      <RecommendationBox>
        <h4>Not sure what you're looking for?</h4>
        <p>
          Try browsing without filters, or use our <Link href="/take-quiz">personality quiz</Link> 
          to find opportunities matched to your interests.
        </p>
      </RecommendationBox>
    </FiltersContainer>
  );
};
```

---

### B. Adaptive Personal Dashboard

**Database Schema for Dashboard Preferences:**

```sql
CREATE TABLE user_dashboard_preferences (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) UNIQUE,
  
  -- Complexity preference
  complexity_level VARCHAR(20) DEFAULT 'standard', -- 'simple', 'standard', 'detailed'
  
  -- What to show
  show_impact_stats BOOLEAN DEFAULT TRUE,
  show_upcoming BOOLEAN DEFAULT TRUE,
  show_recommendations BOOLEAN DEFAULT TRUE,
  show_community_activity BOOLEAN DEFAULT TRUE,
  show_intergenerational BOOLEAN DEFAULT TRUE,
  
  -- Accessibility preferences
  text_size_multiplier DECIMAL DEFAULT 1.0, -- 1.0 = normal, 1.5 = 150%, etc
  high_contrast BOOLEAN DEFAULT FALSE,
  dyslexia_friendly_font BOOLEAN DEFAULT FALSE,
  reduce_animations BOOLEAN DEFAULT FALSE,
  
  -- Display preferences
  font_size_base VARCHAR(20) DEFAULT 'medium',
  color_scheme VARCHAR(20) DEFAULT 'system',
  sidebar_expanded BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Dashboard Component:**

```tsx
// components/dashboard/AdaptiveDashboard.tsx

interface DashboardProps {
  user: User;
  preferences: UserDashboardPreferences;
}

const AdaptiveDashboard = ({ user, preferences }: DashboardProps) => {
  // Determine layout based on user age, preferences, and accessibility needs
  const layoutComplexity = determineLayoutComplexity(user, preferences);
  
  // Get personalised content for user's primary activity types
  const primaryActivities = determinePrimaryActivities(user);

  return (
    <DashboardContainer complexity={layoutComplexity} preferences={preferences}>
      {/* Always show: Welcome + Primary CTA */}
      <WelcomeSection user={user} />
      
      <MVPNote>
        This dashboard is personalized to you. 
        <Link href="/feedback">Tell us what works and what doesn't</Link>.
      </MVPNote>

      {/* Activity-specific sections */}
      {primaryActivities.includes('volunteer') && (
        <VolunteerImpactSection user={user} />
      )}

      {primaryActivities.includes('musician') && (
        <MusicImpactSection user={user} />
      )}

      {primaryActivities.includes('learner') && (
        <LearningDashboardSection user={user} />
      )}

      {primaryActivities.includes('social') && (
        <SocialConnectionSection user={user} />
      )}

      {/* Age-appropriate recommendations */}
      {user.age >= 65 ? (
        <SeniorRecommendationsSection user={user} preferences={preferences} />
      ) : (
        <PersonalisedRecommendationsSection user={user} />
      )}

      {/* Upcoming activities */}
      {layoutComplexity === 'simple' ? (
        <SimpleUpcomingSection user={user} />
      ) : (
        <DetailedCalendarSection user={user} />
      )}

      {/* Cultural content if applicable */}
      {user.culturalBackground && (
        <CulturalConnectionSection user={user} />
      )}

      {/* Accessibility & Settings */}
      <SettingsAccessLink href="/settings/dashboard" />
    </DashboardContainer>
  );
};

const determineLayoutComplexity = (user: User, preferences: UserDashboardPreferences): 'simple' | 'standard' | 'detailed' => {
  // User's explicit preference always wins
  if (preferences.complexity_level) {
    return preferences.complexity_level;
  }
  
  // Age-based defaults (can be overridden)
  if (user.age >= 70) return 'simple';
  if (user.age <= 18) return 'standard';
  
  return 'standard';
};
```

---

## VI. NAVIGATION STRUCTURE

### Primary Navigation

```jsx
// components/navigation/MainNav.tsx

<header className="main-nav">
  <Logo href="/" />
  
  <NavItems>
    {/* Home / Logo */}
    <NavLogo>
      <span className="text-logo">smalltalk.community</span>
      <span className="beta-badge">MVP</span>
    </NavLogo>
    
    {/* Opportunities (Megamenu) */}
    <NavItem label="Opportunities" megamenu>
      <MegamenuSection>
        <MegamenuColumn title="Browse">
          <Link href="/opportunities">All Opportunities</Link>
          <Link href="/opportunities?category=volunteer">Volunteering</Link>
          <Link href="/opportunities?category=music">Music & Performance</Link>
          <Link href="/opportunities?category=learning">Learning & Workshops</Link>
          <Link href="/opportunities?category=social">Social & Connection</Link>
          <Link href="/opportunities?category=family">Family Activities</Link>
          <Link href="/opportunities?category=mentorship">Mentorship</Link>
        </MegamenuColumn>
        
        <MegamenuColumn title="By Community">
          <Link href="/opportunities?audience=young-people">Young People (15-25)</Link>
          <Link href="/opportunities?audience=seniors">Seniors (65+)</Link>
          <Link href="/opportunities?audience=families">Families</Link>
          <Link href="/opportunities?audience=cald">CALD Community</Link>
          <Link href="/opportunities?audience=first-nations">First Nations</Link>
          <Link href="/opportunities?audience=everyone">Everyone</Link>
        </MegamenuColumn>
        
        <MegamenuColumn title="Quick Filters">
          <Link href="/opportunities?time=one-off">One-off Activities</Link>
          <Link href="/opportunities?physical=sedentary">Sitting/Home-based</Link>
          <Link href="/opportunities?accessibility=wheelchair">Wheelchair Accessible</Link>
          <Link href="/opportunities?virtual=true">Online/Virtual</Link>
        </MegamenuColumn>
      </MegamenuSection>
    </NavItem>
    
    {/* Get Involved */}
    <NavItem label="Get Involved" dropdown>
      <DropdownMenu>
        <Link href="/how-it-works">How It Works</Link>
        <Divider />
        <Link href="/how-it-works/volunteers">I Want to Volunteer</Link>
        <Link href="/how-it-works/musicians">I'm a Musician</Link>
        <Link href="/how-it-works/young-people">I'm a Young Person</Link>
        <Link href="/how-it-works/seniors">I'm a Senior</Link>
        <Link href="/how-it-works/families">I'm a Family</Link>
        <Link href="/how-it-works/newcomers">I'm New to the Area</Link>
        <Divider />
        <Link href="/organisations">For Organisations</Link>
      </DropdownMenu>
    </NavItem>
    
    {/* Community */}
    <NavItem label="Community" dropdown>
      <DropdownMenu>
        <Link href="/community/stories">Community Stories</Link>
        <Link href="/community/impact">Impact & Statistics</Link>
        <Link href="/community/calendar">Events Calendar</Link>
        <Link href="/community/organisations">Partner Organisations</Link>
        <Link href="/community/groups">Community Groups</Link>
      </DropdownMenu>
    </NavItem>
    
    {/* Resources */}
    <NavItem label="Resources" dropdown>
      <DropdownMenu>
        <Link href="/how-it-works">Getting Started Guide</Link>
        <Link href="/faq">FAQs</Link>
        <Link href="/tutorials">Video Tutorials</Link>
        <Link href="/accessibility">Accessibility Information</Link>
        <Link href="/support">Get Help</Link>
      </DropdownMenu>
    </NavItem>
    
    {/* About */}
    <NavItem label="About" dropdown>
      <DropdownMenu>
        <Link href="/about">Our Mission</Link>
        <Link href="/timeline">Development Timeline</Link>
        <Link href="/contact">Contact Us</Link>
      </DropdownMenu>
    </NavItem>
  </NavItems>
  
  {/* Right Side: Accessibility Controls + Login */}
  <NavRight>
    {/* Accessibility Quick Controls */}
    <AccessibilityMenu>
      <Button
        icon={<TextIncreaseIcon />}
        title="Increase text size"
        onClick={() => increaseTextSize()}
        aria-label="Increase text size"
      />
      <Button
        icon={<ContrastIcon />}
        title="High contrast mode"
        onClick={() => toggleHighContrast()}
        aria-label="Toggle high contrast mode"
      />
      <Button
        icon={<AccessibilityIcon />}
        title="Accessibility options"
        onClick={() => openAccessibilityMenu()}
        aria-label="Open accessibility options"
      />
    </AccessibilityMenu>
    
    {/* Language Helper */}
    <Button
      icon={<GlobeIcon />}
      title="Language & translation"
      href="/settings/language"
      aria-label="Language settings"
    />
    
    {/* User Menu or Login */}
    {user ? (
      <UserMenu user={user} />
    ) : (
      <>
        <Button href="/login" variant="secondary">
          Sign In
        </Button>
        <Button href="/signup" variant="primary">
          Get Started
        </Button>
      </>
    )}
  </NavRight>
</header>
```

### Mobile Navigation

```jsx
// components/navigation/MobileNav.tsx

<MobileNavContainer>
  {/* Top Bar */}
  <TopBar>
    <Logo href="/" />
    <Spacer />
    <AccessibilityButton />
    <HamburgerButton onClick={() => setMenuOpen(!menuOpen)} />
  </TopBar>
  
  {/* Hamburger Menu */}
  {menuOpen && (
    <HamburgerMenu>
      <MenuItem href="/">
        <Icon><HomeIcon /></Icon>
        <span>Home</span>
      </MenuItem>
      
      <MenuItem href="/opportunities">
        <Icon><CompassIcon /></Icon>
        <span>Find Opportunities</span>
      </MenuItem>
      
      <MenuSection title="Browse">
        <SubMenuItem href="/opportunities?category=volunteer">Volunteering</SubMenuItem>
        <SubMenuItem href="/opportunities?category=music">Music & Performance</SubMenuItem>
        <SubMenuItem href="/opportunities?category=learning">Learning</SubMenuItem>
        <SubMenuItem href="/opportunities?category=social">Social & Connection</SubMenuItem>
      </MenuSection>
      
      <MenuDivider />
      
      <MenuItem href="/how-it-works">
        <Icon><HelpCircleIcon /></Icon>
        <span>How It Works</span>
      </MenuItem>
      
      <MenuItem href="/dashboard">
        <Icon><UserIcon /></Icon>
        <span>My Profile</span>
      </MenuItem>
      
      <MenuDivider />
      
      <MenuItem href="/about">
        <Icon><InfoIcon /></Icon>
        <span>About Us</span>
      </MenuItem>
      
      <MenuItem href="/timeline">
        <Icon><TimelineIcon /></Icon>
        <span>Development Timeline</span>
      </MenuItem>
      
      <MenuItem href="/feedback">
        <Icon><MessageSquareIcon /></Icon>
        <span>Share Feedback</span>
      </MenuItem>
      
      <MenuDivider />
      
      {user ? (
        <MenuItem onClick={() => logout()}>
          <Icon><LogOutIcon /></Icon>
          <span>Sign Out</span>
        </MenuItem>
      ) : (
        <>
          <MenuItem href="/login">
            <Icon><LogInIcon /></Icon>
            <span>Sign In</span>
          </MenuItem>
          <MenuItem href="/signup" highlight>
            <Icon><PlusIcon /></Icon>
            <span>Get Started</span>
          </MenuItem>
        </>
      )}
    </HamburgerMenu>
  )}
  
  {/* Bottom Navigation Bar (Sticky) */}
  <BottomNav>
    <NavButton href="/" icon={<HomeIcon />} label="Home" />
    <NavButton href="/opportunities" icon={<CompassIcon />} label="Explore" />
    <NavButton href="/dashboard" icon={<UserIcon />} label="Profile" />
    <NavButton href="/support" icon={<HelpCircleIcon />} label="Help" />
  </BottomNav>
</MobileNavContainer>
```

---

## VII. CORE COMPONENTS & TEMPLATES

### Opportunity Card Component

```tsx
// components/opportunities/OpportunityCard.tsx

interface OpportunityCardProps {
  opportunity: Opportunity;
  showDetails?: boolean;
}

const OpportunityCard = ({ opportunity, showDetails = true }: OpportunityCardProps) => {
  return (
    <Card className="opportunity-card">
      {/* Header with Category Badge */}
      <CardHeader>
        <CategoryBadge category={opportunity.primary_category} />
        {opportunity.intergenerational && (
          <IntergenerationalBadge title="Intergenerational opportunity" />
        )}
      </CardHeader>

      {/* Title & Organisation */}
      <CardTitle>
        <h3>{opportunity.title}</h3>
        <Organisation>{opportunity.organisation_name}</Organisation>
      </CardTitle>

      {/* Description */}
      <CardDescription>
        <p>{opportunity.description.substring(0, 150)}...</p>
      </CardDescription>

      {/* Key Details at a Glance */}
      <KeyDetails>
        {/* Time */}
        <DetailChip icon={<CalendarIcon />}>
          {opportunity.is_recurring ? (
            <span>{opportunity.recurrence_pattern}</span>
          ) : (
            <span>{formatDate(opportunity.start_date)}</span>
          )}
        </DetailChip>

        {/* Location */}
        <DetailChip icon={<MapIcon />}>
          {opportunity.location_virtual ? (
            <span>Online</span>
          ) : (
            <span>{opportunity.location_physical_suburb}</span>
          )}
        </DetailChip>

        {/* Time Commitment */}
        <DetailChip icon={<ClockIcon />}>
          {opportunity.time_commitment_type === 'one-off' ? (
            <span>One-off</span>
          ) : (
            <span>{opportunity.estimated_hours}h</span>
          )}
        </DetailChip>

        {/* Skill Level */}
        {!opportunity.required_skills?.length && (
          <DetailChip icon={<SparklesIcon />}>
            No experience needed
          </DetailChip>
        )}
      </KeyDetails>

      {/* Accessibility & Community Tags */}
      {showDetails && (
        <TagsSection>
          {/* Age Groups */}
          {opportunity.age_categories?.length > 0 && (
            <TagGroup title="For:">
              {opportunity.age_categories.map(age => (
                <Tag key={age} type="age">{formatAgeCategory(age)}</Tag>
              ))}
            </TagGroup>
          )}

          {/* Accessibility */}
          {opportunity.accessibility_features?.length > 0 && (
            <TagGroup title="Accessibility:">
              {opportunity.accessibility_features.slice(0, 3).map(feature => (
                <Tag key={feature} type="accessibility" icon={<CheckIcon />}>
                  {formatAccessibility(feature)}
                </Tag>
              ))}
              {opportunity.accessibility_features.length > 3 && (
                <Tag type="accessibility">
                  +{opportunity.accessibility_features.length - 3} more
                </Tag>
              )}
            </TagGroup>
          )}

          {/* Cultural */}
          {(opportunity.cald_friendly || opportunity.first_nations_led) && (
            <TagGroup title="Cultural:">
              {opportunity.cald_friendly && (
                <Tag type="cultural">CALD-friendly</Tag>
              )}
              {opportunity.first_nations_led && (
                <Tag type="cultural">First Nations led</Tag>
              )}
            </TagGroup>
          )}
        </TagsSection>
      )}

      {/* Safety Status */}
      {opportunity.organisation_verified && (
        <SafetyIndicator>
          <Icon><ShieldCheckIcon /></Icon>
          <span>Verified organisation</span>
        </SafetyIndicator>
      )}

      {/* Spots Available */}
      {opportunity.spots_available && (
        <AvailabilityInfo>
          {opportunity.spots_filled && opportunity.spots_available ? (
            <span>
              {opportunity.spots_available - opportunity.spots_filled} 
              {' '}spot{opportunity.spots_available - opportunity.spots_filled === 1 ? '' : 's'} 
              {' '}available
            </span>
          ) : (
            <span>Spots available</span>
          )}
          {opportunity.waitlist_available && (
            <span className="waitlist-info">Waitlist available</span>
          )}
        </AvailabilityInfo>
      )}

      {/* CTA */}
      <CardCTA>
        <Button
          href={`/opportunities/${opportunity.id}`}
          variant="primary"
          fullWidth
        >
          Learn More
        </Button>
      </CardCTA>
    </Card>
  );
};
```

---

## VIII. FEEDBACK & COMMUNITY ENGAGEMENT

### Feedback Collection System

```jsx
// components/feedback/FeedbackWidget.tsx

const FeedbackWidget = () => {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (feedbackData) => {
    await submitFeedback({
      message: feedbackData.message,
      category: feedbackData.category,
      pageUrl: window.location.pathname,
      userAge: user?.age,
      userType: user?.primaryActivity,
      timestamp: new Date(),
      isAnonymous: feedbackData.isAnonymous,
    });
    
    setSubmitted(true);
    setTimeout(() => setOpen(false), 2000);
  };

  return (
    <>
      {/* Floating Feedback Button */}
      <FeedbackButton
        onClick={() => setOpen(!open)}
        aria-label="Share feedback"
      >
        <Icon><MessageSquareIcon /></Icon>
        <Tooltip>Share your feedback</Tooltip>
      </FeedbackButton>

      {/* Feedback Modal */}
      {open && (
        <Modal onClose={() => setOpen(false)}>
          <ModalHeader>
            <h2>We'd Love Your Feedback</h2>
            <p>
              This is an MVP built with community input. Help us improve by telling 
              us what works and what doesn't.
            </p>
          </ModalHeader>

          {submitted ? (
            <SuccessMessage>
              <Icon><CheckCircleIcon /></Icon>
              <h3>Thank you!</h3>
              <p>Your feedback helps us build something better.</p>
            </SuccessMessage>
          ) : (
            <FeedbackForm onSubmit={handleSubmit}>
              <FormField>
                <Label>What's your feedback about?</Label>
                <Select name="category" required>
                  <option>Something doesn't work</option>
                  <option>Feature suggestion</option>
                  <option>Content feedback</option>
                  <option>Safety concern</option>
                  <option>Accessibility issue</option>
                  <option>Other</option>
                </Select>
              </FormField>

              <FormField>
                <Label>Tell us more</Label>
                <Textarea
                  name="message"
                  placeholder="Be specific—what were you trying to do? What went wrong?"
                  rows={5}
                  required
                />
              </FormField>

              <FormField>
                <Label>Can we follow up with you?</Label>
                <Checkbox
                  name="contactMe"
                  label="Yes, I'd like to help shape the platform"
                />
              </FormField>

              <FormField>
                <Checkbox
                  name="isAnonymous"
                  label="Send this feedback anonymously"
                />
              </FormField>

              <ButtonGroup>
                <Button type="submit" variant="primary">
                  Send Feedback
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
              </ButtonGroup>
            </FeedbackForm>
          )}
        </Modal>
      )}
    </>
  );
};
```

### Feedback Dashboard (Internal)

Route: `/admin/feedback` (internal team only, secure)

Shows:

- All feedback received
- Categorized by type
- Segmented by user community (young people, seniors, CALD, etc.)
- Sentiment analysis
- Most common suggestions
- Safety concerns flagged for immediate review

---

## IX. CONTENT STRATEGY & MESSAGING

### Inclusive Language Guidelines

**Apply across ALL content:**

**Age Inclusive:**

- ❌ "Young people and elderly"
- ✅ "Young people and seniors"
- ❌ "Silver surfers," "kids"
- ✅ "Older community members," "young people"

**Culturally Inclusive:**

- ❌ "Migrants," "foreigners"
- ✅ "CALD community members," "people from diverse cultural backgrounds"
- ❌ "Aboriginals"
- ✅ "First Nations peoples," "Aboriginal and Torres Strait Islander peoples"

**Ability Inclusive:**

- ❌ "Wheelchair-bound," "suffers from," "normal"
- ✅ "Wheelchair user," "person with," "without disability"

**Family Inclusive:**

- ❌ "Mums and dads"
- ✅ "Parents and carers," "families"

---

## X. DATABASE & DATA PRIVACY

### MVP Privacy Approach

**What we collect:**

- Name, email, phone (optional)
- Age range (not exact birthdate)
- Interests and skills
- Accessibility needs
- Cultural background (optional)
- Location

**What we DON'T collect in MVP:**

- Exact location data
- Browsing history
- Financial information
- Health/medical information (beyond accessibility accommodations)

**Data Protection:**

- All data encrypted in transit (HTTPS)
- Passwords hashed with bcrypt
- No third-party ad tracking
- No data sold to external parties
- Community members control their visibility

**Privacy Policy:**

Create `/privacy` page with:

- Plain language explanation (not legal jargon)
- What data we collect and why
- How we protect it
- Your rights (access, deletion, correction)
- How to contact for privacy concerns

**Note in MVP:** "This privacy policy is in development and will be finalised before public launch."

---

## XI. SAFETY & SAFEGUARDING (MVP NOTES)

**This MVP intentionally does NOT include complete safeguarding frameworks.**

The following will be implemented in Phase 2 (April-June 2026):

### Working with Children Check (WWC)

- Integration with Victoria Police for WWC checks
- Automatic flagging of opportunities requiring WWC
- Verification before organisation can post youth-focused opportunities
- Cannot be bypassed

### Incident Reporting

- Dedicated reporting interface accessible from every page
- Reports reviewed within 24 hours
- Escalation path defined
- Community members kept informed of resolution

### Duty of Care

- Clear terms and conditions
- Liability limits documented
- Insurance requirements for organisations
- Support resources for community members

### Privacy for Vulnerable Users

- Minors: requires parental consent for profile creation
- High privacy settings by default
- Ability to hide profile from searches
- Contact preferences clearly defined

---

## XII. IMPLEMENTATION ROADMAP

### MVP Phase (January 2026)

**Must Complete:**

- [x] Core opportunity search and filtering
- [x] User profiles with multi-dimensional tagging
- [x] Organisation portal for posting opportunities
- [x] Adaptive dashboard (basic version)
- [x] Homepage and navigation redesign
- [x] About/Mission page
- [x] Timeline page
- [x] How-It-Works guides (all 8 user types)
- [x] Accessibility features (text scaling, high contrast, keyboard nav)
- [x] Feedback collection system
- [x] MVP transparency messaging everywhere

**Database Schema:**

- Users table with accessibility and cultural fields
- Opportunities table with multi-dimensional tagging
- Organisations table with verification status
- Feedback table for community input
- Dashboard preferences table

**Do NOT attempt in MVP:**

- Full WWC integration
- Incident reporting system
- Advanced analytics
- Multilingual UI (English only)
- Video tutorials (reference as "coming soon")
- Mentorship matching algorithm (UI ready, matching logic Phase 2)

---

## XIII. TRANSPARENCY & COMMUNITY ENGAGEMENT

### What Every Page Includes

1. **MVP Banner** at top showing this is in active development
2. **Timeline Link** to show development progress
3. **Feedback Button** floating on right side
4. **Support Option** in footer with contact methods

### Quarterly Reports

Publish at `/impact/reports` showing:

- How many community members using platform
- Breakdown by age, community segment
- Feedback received and changes made
- Safety incidents (if any) and resolution
- Development progress against timeline
- What's next

### Community Advisory Group Communication

Create `/community/advisors` page showing:

- Who's on each advisory group
- What they're working on
- When meetings happen
- How to provide input
- How advisory group feedback shapes decisions

---

## XIV. SUCCESS METRICS (MVP PHASE)

**We're NOT measuring:**

- ❌ Vanity metrics (number of signups)
- ❌ Platform activity alone
- ❌ Engagement metrics without context

**We ARE measuring:**

- ✅ Diversity of users (are we reaching all community segments or just youth/creatives?)
- ✅ Community satisfaction (would they recommend to a friend?)
- ✅ Feature usability (what confuses people?)
- ✅ Accessibility (are accessibility features actually helpful?)
- ✅ Safety (are there any reported concerns?)
- ✅ Advisory group feedback (are we building what community wants?)

**How we measure:**

1. **Feedback surveys** (on platform, email, in-person)
2. **Usability testing** with community members from each segment
3. **Analytics** (what features are used, where do people get stuck)
4. **Interviews** with early users
5. **Advisory group input** (formal and informal)

---

## XV. NEXT STEPS

After MVP launch (January 2026):

1. **Week 1-2:** Soft launch with select community members, gather feedback
2. **Week 2-4:** Advisory groups formed and initial feedback sessions
3. **Week 4-8:** Continuous feedback, bug fixes, small improvements
4. **Month 2:** Quarterly report #1
5. **Month 2-3:** Co-design with advisory groups
6. **Month 3:** Transition to Phase 2 (safety frameworks, accessibility audit)

---

## XVI. TECHNICAL REQUIREMENTS

### Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)
- **Hosting:** Vercel (frontend), Supabase (database)
- **Analytics:** Plausible or Fathom (privacy-first, no tracking)
- **Email:** SendGrid or similar
- **Forms:** Custom implementation or Formspree

### Performance Requirements

- Homepage load < 2s on 3G
- Search results < 500ms
- Mobile-first responsive design
- Lighthouse score: 85+

### Accessibility (MVP Targets)

- WCAG 2.1 AA compliance (70% achieved in MVP, 100% by Phase 2)
- Keyboard navigation working
- Screen reader compatible
- Text scaling 100-200%
- High contrast mode
- No auto-playing media

### Security

- HTTPS everywhere
- HTTPS password hashing (bcrypt)
- CSRF protection
- Input validation
- Rate limiting on forms
- Regular security audits planned

---

## DOCUMENT MANAGEMENT

**This prompt is a living document.** It will be updated as:

- MVP development progresses
- Community feedback comes in
- Advisory groups provide input
- Phases transition

**Version Control:**

- Version 1.0: Initial MVP prompt (January 2026)
- Version 1.1: First feedback incorporation (February 2026)
- Version 2.0: Phase 2 planning (April 2026)

---

## CONTACT & SUPPORT

**Questions about this implementation?**

- Email: hello@smalltalk.community
- Phone: [Local number to be added]
- In person: [Location to be confirmed]

**For community members:**

- Feedback: [/feedback form]
- Advisory group signup: [/advisory-signup]
- Technical support: [/support]

---

**This MVP is built with real community ambition and commitment to inclusion. We're doing this together.**
