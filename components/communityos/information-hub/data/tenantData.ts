/**
 * Tenant Data for smalltalk.community Inc
 * Extracted from the original CommunityOS Dashboard HTML reference
 */

export interface TenantOrganisation {
    name: string;
    type: string;
    status: string;
    planPeriod: string;
    vision: string;
    mission: string;
    values: Array<{ title: string; icon: string; description: string }>;
    founder: {
        name: string;
        role: string;
        email: string;
        bio: string;
        why: string;
    };
    cofounder: {
        name: string;
        role: string;
        bio: string;
        protections: string;
    };
}

export interface ConstitutionClause {
    title: string;
    content: string;
    plain: string;
}

export interface ConstitutionPart {
    id: string;
    title: string;
    clauses: number[];
}

export interface StrategicPillar {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    icon: string;
    status: "in-progress" | "planned" | "initial" | "complete";
    priorities: Array<{ name: string; desc: string; phase: string }>;
}

export interface TimelinePhase {
    phase: number;
    name: string;
    period: string;
    icon: string;
    status: "current" | "next" | "planned" | "complete";
    description: string;
    focus: string;
    milestones: Array<{ category: string; item: string; status: string }>;
}

export interface BoardRole {
    id: string;
    title: string;
    icon: string;
    timeCommitment: string;
    purpose: string;
    responsibilities: string[];
    idealBackground: string;
    isNot: string;
}

export interface Risk {
    id: number;
    cat: string;
    name: string;
    risk: string;
    impact: number;
    likelihood: number;
    mitigation: string;
}

export interface GetInvolvedOpportunity {
    title: string;
    role: string;
    shortDesc: string;
    fullDesc: string;
    requirements: string[];
    benefits: string[];
    cta: string;
    emailSubject: string;
}

export interface TenantData {
    organisation: TenantOrganisation;
    constitution: {
        parts: ConstitutionPart[];
        clauses: Record<number, ConstitutionClause>;
    };
    strategicPlan: {
        pillars: StrategicPillar[];
        timeline: TimelinePhase[];
        boardRoles: BoardRole[];
        risks: Risk[];
    };
    operationalFramework: {
        governanceCalendar: Array<{ month: string; events: string[] }>;
        geographicalFirewall: {
            primaryFocus: string;
            majorTowns: string[];
            context: string;
        };
        founderCapacity: {
            rule: string;
            description: string;
            trafficLights: Array<{ color: string; range: string; status: string }>;
        };
    };
    safeguarding: {
        headline: string;
        status: string;
        statusNote: string;
        commitments: Array<{ title: string; desc: string }>;
        policies: Array<{ title: string; content: string }>;
        realityCheck: string;
    };
    getInvolved: GetInvolvedOpportunity[];
}

// smalltalk.community Inc specific data
export const stcTenantData: TenantData = {
    organisation: {
        name: "smalltalk.community Inc",
        type: "Incorporated Association (Victoria)",
        status: "Establishment (2025-2026)",
        planPeriod: "2025-2027",
        vision: "Where every generation finds belonging.",
        mission: "Building intergenerational connections and inclusive digital infrastructure for regional communities.",
        values: [
            { title: "Universal Inclusion", icon: "🌍", description: "Serving all ages, backgrounds, and identities without exception." },
            { title: "Genuine Participation", icon: "🤝", description: "Moving beyond tokenism to real agency and co-design." },
            { title: "Transparency", icon: "💎", description: "Plain English governance and open financial reporting." },
            { title: "Safety & Dignity", icon: "🛡️", description: "Non-negotiable safeguarding for children, young people, and seniors." },
        ],
        founder: {
            name: "Ryan",
            role: "Founder & Strategic Lead",
            email: "ryanhutchison@outlook.com.au",
            bio: "With a background in community development and a passion for technology, Ryan is bridging the gap between traditional services for young people and the digital world.",
            why: "I believe technology should bring us together, not drive us apart. Regional communities deserve the same high-quality digital tools as major cities.",
        },
        cofounder: {
            name: "Cass",
            role: "Co-founder & Chair",
            bio: "Cass brings essential governance leadership as Chair, responsible for governing (not managing) the organisation. Her role includes chairing meetings, ensuring constitutional adherence, stakeholder relations, and acting as primary signatory.",
            protections: "The Association's rules include an indemnity clause for office holders acting in good faith, minimising liability while maximising governance effectiveness.",
        },
    },
    constitution: {
        parts: [
            { id: "part1", title: "Identity & Purpose", clauses: [1, 2, 3] },
            { id: "part2", title: "Members & Participation", clauses: [4, 5, 6, 7, 8] },
            { id: "part3", title: "Leadership Team", clauses: [9, 10, 11, 12, 13, 14, 15, 16, 17] },
            { id: "part4", title: "Meetings & Say", clauses: [18, 19, 20, 21] },
            { id: "part5", title: "Money & Resources", clauses: [22, 23, 24, 25] },
            { id: "part6", title: "Working Together", clauses: [26, 27, 28, 29] },
            { id: "part7", title: "Making Changes", clauses: [30] },
            { id: "part8", title: "Winding Up", clauses: [31] },
            { id: "part9", title: "Charity Standards", clauses: [32, 33, 34] },
            { id: "part10", title: "Final Notes", clauses: [35, 36, 37] },
        ],
        clauses: {
            1: { title: "Our Name", content: "We are called **smalltalk.community Inc**. We are an incorporated association registered in Victoria, Australia.", plain: "We are a legal group called smalltalk.community Inc." },
            2: { title: "What We Do", content: "smalltalk.community Inc exists to strengthen regional communities across Victoria by bringing people together across all ages, backgrounds, and identities. We work with regional towns and shires to build connection, reduce isolation, and create intergenerational opportunities.", plain: "We bring folks of all ages together in regional areas to help them feel less lonely and more connected." },
            3: { title: "Not-for-Profit", content: "Everything we do is for community benefit, not private profit. Money goes into programs, costs, and fair staff pay. If we close, money goes to another charity.", plain: "We don't make personal money. All money goes to helping people." },
            4: { title: "Types of Members", content: "Full Members (voting, 18+), Community Participants (all ages, no fee), Organisational Partners, and Sustaining Supporters.", plain: "Anyone can join in. Some folks like 18+ members can vote on big things." },
            5: { title: "How to Join", content: "Write to us. No fee for membership or participation. Committee considers voting membership applications.", plain: "Just tell us you want to be part of it! It's free." },
            6: { title: "Accessibility", content: "Standards meet WCAG 2.1 AA. Support for First Nations, LGBTIQA+, CALD, and people with disabilities.", plain: "We make sure everyone can use our tools and join our meetings, no matter their background or ability." },
            7: { title: "Member Rights", content: "Full members can attend meetings, vote, and join the Committee. Participants have voice through advisory forums.", plain: "Members help make big decisions. Everyone is listened to." },
            8: { title: "Ending Participation", content: "Ends if you resign, or if the Committee asks you to leave for serious harm to others (with appeal rights).", plain: "You can leave anytime. We only ask people to leave if they are hurting others." },
            9: { title: "Leadership Team", content: "Chair, Co-Chair, Secretary, Treasurer, and up to 5 members. Focus on diverse representation.", plain: "A group of up to 9 volunteers helps lead the way." },
            10: { title: "Choosing Leaders", content: "Elections every two years at the AGM. Committee can fill empty spots in between.", plain: "Members vote for leaders every two years." },
            11: { title: "Founder Protections", content: "Ryan has rights to remain on Committee (if re-elected) and protect founding vision. Removal requires 2/3 vote for cause.", plain: "The person who started this has a special role to make sure we stick to the original plan." },
            12: { title: "Committee Duties", content: "Manage money, achievement of purpose, hire staff, set policies, consult community, keep records.", plain: "The leaders look after our money and make sure we are doing what we said we would." },
            13: { title: "Legal Duties", content: "Duties of care, honesty, acting in best interest, disclosing conflicts, following ACNC standards.", plain: "Leaders must be honest and careful with the organisation." },
            14: { title: "Who Cannot Lead", content: "Disqualified persons, serious criminal convictions (past 10 years), banned directors.", plain: "We check leaders to make sure they are suitable to run a charity." },
            15: { title: "Removing Leaders", content: "Resignation, disqualification, or 2/3 majority vote by members.", plain: "Leaders can step down or be voted out if they aren't doing the job right." },
            16: { title: "Conflicts of Interest", content: "Must be disclosed. Cannot vote on matters where a personal financial benefit exists.", plain: "If a decision affects a leader's own pocket, they shouldn't vote on it." },
            17: { title: "Making Decisions", content: "Quarterly meetings, 50% quorum, majority vote. Open to digital participation.", plain: "The team meets often and decides by voting. They can join from home on video." },
            18: { title: "Annual General Meeting", content: "Report on year, financial statements, elections. Must be accessible and publicized 3 weeks ahead.", plain: "Once a year, everyone gets together to hear how we are going and pick leaders." },
            19: { title: "Special Meetings", content: "Can be called for urgent matters by Committee or 25% of members.", plain: "If something big happens, we can have a meeting quickly." },
            20: { title: "How Voting Works", content: "One vote per member. Big changes need 2/3 majority.", plain: "Every member gets a say. We use a show of hands or secret boxes." },
            21: { title: "Quorum", content: "10 Full Members minimum for a meeting.", plain: "We need at least 10 folks there to make it official." },
            22: { title: "Financial Year", content: "1 July to 30 June.", plain: "Our money year starts in July." },
            23: { title: "Managing Money", content: "Dual approval for withdrawals, monthly checks, non-profit focused spending.", plain: "We are very careful with our dollars. Two people check every payment." },
            24: { title: "Financial Report", content: "Presented at AGM. Shows income, spending, and assets.", plain: "We show everyone a list of every dollar we spent each year." },
            25: { title: "Audits", content: "External audits performed as required by turnover or member request.", plain: "An outside expert checks our books to make sure everything is right." },
            26: { title: "Advisory Forums", content: "Young People, Children, Seniors, and Community Advisory forums established for voice.", plain: "We have special groups for kids, young people, and seniors to tell us what they need." },
            27: { title: "Core Policies", content: "Safeguarding, Risk, Inclusion, Privacy, Whistleblower, Digital Safety.", plain: "We have written rules for keeping people safe and protecting privacy." },
            28: { title: "Records", content: "Registers of members, leaders, minutes, and finances. Accessible to members.", plain: "We keep good lists of everything we do. Members can ask to see them." },
            29: { title: "Partnership", content: "Commitment to collaboration with schools, health services, and government.", plain: "We work with other groups to do more together." },
            30: { title: "Changing Constitution", content: "Requires special resolution (2/3 majority) at a general meeting.", plain: "Changing these rules needs most people to agree." },
            31: { title: "Winding Up", content: "Remaining assets go to another charity with similar purposes.", plain: "If we ever close, the money goes to another group helping people." },
            32: { title: "ACNC Standards", content: "Commitment to all 6 national charity governance standards.", plain: "We follow the national rules for good charities." },
            33: { title: "Ethics (YACVic)", content: "Adhere to the Code of Ethical Practice for the Victorian Youth Sector.", plain: "We follow strict ethical rules for working with young people." },
            34: { title: "Regular Review", content: "Governance review every 3 years for effectiveness and inclusion.", plain: "Every three years, we check if our rules are still working/fair." },
            35: { title: "Definitions", content: "Clear meanings for 'Associate', 'Ordinary Resolution', 'Quorum', etc.", plain: "Explaining the tricky words we use in this document." },
            36: { title: "Severability", content: "If one part is illegal, the rest remains valid.", plain: "If one rule is found to be wrong by a court, the others stay." },
            37: { title: "Legal Precedence", content: "Victorian/Australian law takes precedence over this document.", plain: "The law of the land is always the most important rule." },
        },
    },
    strategicPlan: {
        pillars: [
            {
                id: 1,
                title: "Safe Digital Infrastructure",
                subtitle: "The Foundation",
                description: "Building community-owned platforms that are moderated, secure, and accessible.",
                icon: "🛡️",
                status: "in-progress",
                priorities: [
                    { name: "Moderation Hub", desc: "Professional oversight of all digital interactions.", phase: "MVP" },
                    { name: "Accessibility First", desc: "WCAG 2.1 AA compliant interfaces.", phase: "MVP" },
                    { name: "Privacy by Design", desc: "Zero-party data ownership for users.", phase: "Year 2" },
                ],
            },
            {
                id: 2,
                title: "Intergenerational Programs",
                subtitle: "The Connection",
                description: "Creating pathways for young people and seniors to share skills, stories, and belonging.",
                icon: "🔄",
                status: "planned",
                priorities: [
                    { name: "Digital Mentors", desc: "Young people teaching tech to seniors.", phase: "Phase 1" },
                    { name: "Story Circles", desc: "Curated intergenerational storytelling events.", phase: "Year 2" },
                ],
            },
            {
                id: 3,
                title: "Institutional Autonomy",
                subtitle: "The Sustainability",
                description: "Establishing a self-governing model independent of volatile political funding cycles.",
                icon: "🏛️",
                status: "planned",
                priorities: [
                    { name: "Endowment Fund", desc: "Diverse revenue streams including consulting.", phase: "Year 3" },
                    { name: "Young Person's Board Seat", desc: "Direct governance power for young people.", phase: "Phase 1" },
                ],
            },
            {
                id: 4,
                title: "Regional Innovation",
                subtitle: "The Expansion",
                description: "Standardising regional community tech so every town can have its own hub.",
                icon: "📍",
                status: "initial",
                priorities: [
                    { name: "Town Kits", desc: "Open-source governance and tech templates.", phase: "Year 3" },
                ],
            },
        ],
        timeline: [
            {
                phase: 1,
                name: "Foundation",
                period: "Jun - Aug 2026",
                icon: "🏗️",
                status: "current",
                description: "Legal incorporation, board formation, and core policy development.",
                focus: "Governance & Ethics",
                milestones: [
                    { category: "LEGAL", item: "Incorporation as Association", status: "done" },
                    { category: "BOARD", item: "Founding Directors Recruited", status: "todo" },
                    { category: "FINANCE", item: "ACNC Registration", status: "todo" },
                ],
            },
            {
                phase: 2,
                name: "Build",
                period: "Sep - Nov 2026",
                icon: "💻",
                status: "next",
                description: "MVP development of the digital hub and safeguarding systems.",
                focus: "Platform Development",
                milestones: [
                    { category: "TECH", item: "Moderation Hub MVP", status: "todo" },
                    { category: "SAFEGUARDING", item: "Audit Systems Built", status: "todo" },
                ],
            },
            {
                phase: 3,
                name: "Pilot",
                period: "Dec 2026 - Feb 2027",
                icon: "🚀",
                status: "planned",
                description: "First intergenerational cohort launched in Murrindindi Shire.",
                focus: "Community Impact",
                milestones: [
                    { category: "IMPACT", item: "First 50 Young People/Seniors Joined", status: "todo" },
                ],
            },
            {
                phase: 4,
                name: "Scale",
                period: "Mar - May 2027",
                icon: "📈",
                status: "planned",
                description: "Regional expansion framework and sustainability modeling.",
                focus: "Sustainability",
                milestones: [
                    { category: "GROWTH", item: "Extended Shire Partnerships", status: "todo" },
                ],
            },
        ],
        boardRoles: [
            {
                id: "chair",
                title: "Board Chair",
                icon: "👑",
                timeCommitment: "4-6 hrs/month",
                purpose: "Lead the board, oversee strategic direction, and manage the Executive Director relationship.",
                responsibilities: ["Chair board meetings", "Stakeholder relations", "Succession planning"],
                idealBackground: "Experienced in governance and regional community leadership.",
                isNot: "A micro-managing operational role.",
            },
            {
                id: "secretary",
                title: "Board Secretary",
                icon: "📝",
                timeCommitment: "3-5 hrs/month",
                purpose: "Ensure compliance, maintain records, and manage constitutional obligations.",
                responsibilities: ["Minute taking", "ACNC reporting", "Member register"],
                idealBackground: "Organised, detail-oriented, understanding of Victorian assoc law.",
                isNot: "A basic admin role without governance input.",
            },
            {
                id: "treasurer",
                title: "Board Treasurer",
                icon: "💰",
                timeCommitment: "3-5 hrs/month",
                purpose: "Maintain financial oversight, ensure sustainability, and report on organisational health.",
                responsibilities: ["Financial reporting", "Audit oversight", "Budgeting"],
                idealBackground: "CPA/CA or significant financial management experience.",
                isNot: "A book-keeping service.",
            },
            {
                id: "youth",
                title: "Youth Advisor",
                icon: "🌱",
                timeCommitment: "2-4 hrs/month",
                purpose: "Ensure young people's voice is at the center of all board decision-making.",
                responsibilities: ["Young people's forum advocacy", "Safety oversight", "Peer engagement"],
                idealBackground: "Aged 18-24 with passion for regional community.",
                isNot: "A tokenistic role.",
            },
        ],
        risks: [
            { id: 1, cat: "GOVERNANCE", name: "Board Vacancy", risk: "Inability to find founding directors leads to poor compliance.", impact: 4, likelihood: 3, mitigation: "Active head-hunting and transparent prospectus." },
            { id: 2, cat: "SAFEGUARDING", name: "Digital Breach", risk: "Compromise of young people's user data or unsafe interaction.", impact: 5, likelihood: 2, mitigation: "Professional moderation and security-first tech stack." },
            { id: 3, cat: "FINANCIAL", name: "Grant Shortfall", risk: "Insufficient funds to launch Year 1 pilot.", impact: 4, likelihood: 3, mitigation: "Diverse revenue plan (Consulting/Donations) and lean MVP." },
            { id: 4, cat: "OPERATIONAL", name: "Founder Burnout", risk: "Ryan's 10-hour structural cap exceeded, leading to project delay.", impact: 4, likelihood: 4, mitigation: "Strict traffic light system and delegation to board/volunteers." },
        ],
    },
    operationalFramework: {
        governanceCalendar: [
            { month: "Jun 2026", events: ["Incorporation Lodgement", "Founding Board Recruitment Start", "Website Launch"] },
            { month: "Jul 2026", events: ["First Board Meeting", "ACNC Application", "Public Prospectus Event"] },
            { month: "Aug 2026", events: ["Constitution Finalisation", "Policy Development Workshop", "Bank Account Open"] },
            { month: "Sep 2026", events: ["Safeguarding Audit", "Grant Writing Round 1", "Tech Stack Build Start"] },
            { month: "Oct 2026", events: ["Partner MOU Signing", "MVP Alpha Testing", "Community Forum #1"] },
            { month: "Nov 2026", events: ["Impact Metrics Baseline", "Financial Year Close", "MVP Beta Release"] },
        ],
        geographicalFirewall: {
            primaryFocus: "Murrindindi Shire",
            majorTowns: ["Alexandra", "Eildon", "Kinglake", "Marysville", "Yea"],
            context: "The Murrindindi Shire community carries the legacy of the 2009 Black Saturday bushfires, cultivating fierce independence combined with healthy skepticism of outside initiatives. Trust is the most valuable currency in the region.",
        },
        founderCapacity: {
            rule: "The 10-Hour Cap",
            description: "Structural burnout prevention for Ryan.",
            trafficLights: [
                { color: "Green", range: "0-6 hrs", status: "Sustainable. Focus on vision and build." },
                { color: "Yellow", range: "7-9 hrs", status: "Warning. Delegate non-critical tasks immediately." },
                { color: "Red", range: "10+ hrs", status: "Stop. Critical risk to founder health. Delay non-essential milestones." },
            ],
        },
    },
    safeguarding: {
        headline: "Safety is our Structural Foundation",
        status: "Developing Protocols",
        statusNote: "We are currently moving from concept to documented policy compliance with Victorian Child Safe Standards.",
        commitments: [
            { title: "Empowerment", desc: "People know their rights and how to speak up." },
            { title: "Informed Families", desc: "Parents and guardians are our active partners." },
            { title: "Equity Focused", desc: "Special attention to First Nations and diverse groups." },
            { title: "Continuous Improvement", desc: "Every incident leads to a system redesign." },
        ],
        policies: [
            { title: "Multi-Age Framework", content: "Specific protocols for 5-11, 12-24, and 65+ interactions." },
            { title: "Professional Boundaries", content: "Strict code of conduct for all staff and volunteers." },
            { title: "Prevention Response", content: "Immediate-action workflows for all safety concerns." },
            { title: "Accountability", content: "Transparent reporting to board and community." },
        ],
        realityCheck: "We acknowledge that zero risk is impossible in any community setting. Our goal is to create the most robust mitigation system possible through professional moderation and clear intergenerational boundaries.",
    },
    getInvolved: [
        {
            title: "Join the Board",
            role: "Director",
            shortDesc: "Shape our founding governance and long-term vision.",
            fullDesc: "As a founding director, you'll help establish the governance structure that will guide smalltalk.community for years to come. You'll work alongside Ryan and Cass to set strategic direction, ensure compliance with ACNC standards, and build a sustainable organisation.",
            requirements: ["Commitment to regional community development", "Governance or board experience preferred", "4-6 hours per month availability", "Passion for intergenerational connection"],
            benefits: ["Shape a new community organisation from the ground up", "Directors & Officers insurance coverage", "Professional development in NFP governance", "Network with regional community leaders"],
            cta: "Learn More",
            emailSubject: "Expression of Interest - Board Director Position",
        },
        {
            title: "Founding Partner",
            role: "Organisation",
            shortDesc: "Integrate your services with our intergenerational hub.",
            fullDesc: "Partner organisations help us extend our reach and impact. We're seeking health services, schools, neighbourhood houses, and community groups who want to collaborate on intergenerational programming in Murrindindi Shire.",
            requirements: ["Alignment with our values of inclusion and safety", "Capacity to participate in joint programming", "Willingness to sign a collaborative MOU", "Based in or serving Murrindindi Shire"],
            benefits: ["Access to our digital platform for your community", "Co-branded intergenerational programs", "Shared data insights (anonymised)", "Joint grant application opportunities"],
            cta: "Learn More",
            emailSubject: "Partnership Inquiry - [Organisation Name]",
        },
        {
            title: "Strategic Advisor",
            role: "Expert",
            shortDesc: "Provide specific domain advice (Legal, Tech, Health).",
            fullDesc: "We're seeking pro-bono advisors who can provide expert guidance in specific areas. This is a flexible, as-needed arrangement where your expertise helps us make better decisions without requiring ongoing time commitment.",
            requirements: ["Professional expertise in Law, Technology, Health, or Finance", "Availability for occasional consultations (1-2 hours/quarter)", "Willingness to provide pro-bono advice", "Understanding of regional/rural context preferred"],
            benefits: ["Contribute expertise to meaningful community work", "Flexible time commitment", "Recognition in our annual report", "Network with passionate community builders"],
            cta: "Learn More",
            emailSubject: "Strategic Advisor Offer - [Your Expertise Area]",
        },
        {
            title: "Volunteer",
            role: "Community",
            shortDesc: "Help us test the platform and run initial workshops.",
            fullDesc: "Community volunteers are the heart of our operations. From testing our digital platforms to helping run intergenerational events in your local area, there are many ways to contribute based on your skills and availability.",
            requirements: ["Live in or near Murrindindi Shire", "Willingness to complete a Working With Children Check", "Enthusiasm for connecting generations", "Any level of tech skills welcome"],
            benefits: ["Training in digital facilitation", "Meaningful community impact", "Flexible volunteer hours", "References and skill development"],
            cta: "Learn More",
            emailSubject: "Volunteer Registration - [Your Name]",
        },
    ],
};
