# Strategic Plan Web App Creation Prompt

You are an expert full-stack developer specialising in creating engaging, interactive web applications. I need you to build a shareable web application that transforms our organisation's strategic plan and board prospectus into an interactive experience.

## Requirements

### Technical Implementation
- Create a single-file HTML application using React (via CDN)
- Use Tailwind CSS for styling
- Make it fully responsive (mobile, tablet, desktop)
- No external dependencies beyond CDN-hosted libraries
- Store all data in-memory (no localStorage or external storage)
- Include smooth animations and transitions for professional polish

### Design Principles
- Clean, professional aesthetic suitable for board-level presentation
- Use whitespace effectively to avoid overwhelming users
- Implement intuitive navigation
- Ensure accessibility (proper contrast, semantic HTML)
- Mobile-first responsive design

### Core Features to Include
1. **Interactive Dashboard/Landing Page**
   - High-level overview of strategic priorities
   - Visual hierarchy showing most important initiatives
   - Quick navigation to detailed sections

2. **Timeline/Roadmap View**
   - Visual representation of strategic milestones
   - Expandable details for each phase or initiative
   - Progress indicators where applicable

3. **Metrics & KPIs Section**
   - Visual charts showing key performance indicators
   - Financial projections and targets
   - Use recharts library for data visualisation

4. **Filterable Content**
   - Allow filtering by: department, timeframe, priority level, status
   - Search functionality to quickly find specific content
   - Clear active filter indicators

5. **Detailed Initiative Cards**
   - Expandable cards for each strategic initiative
   - Include: objectives, key results, timeline, ownership, dependencies
   - Visual status indicators (on track, at risk, delayed)

6. **Board View Mode**
   - Executive summary optimised for board presentation
   - Printable layout option
   - Export-friendly format

### UX Enhancements
- Smooth scroll navigation between sections
- Hover effects on interactive elements
- Loading animations for content transitions
- Tooltips for additional context
- Breadcrumb navigation for deep sections
- "Back to top" button for long pages

### Data Structure
Structure the content as easily editable JavaScript objects:

```javascript
const strategicPlan = {
  organisation: {
    name: "Organisation Name",
    fiscalYear: "2024-2025",
    vision: "Vision statement",
    mission: "Mission statement"
  },
  priorities: [
    {
      id: 1,
      title: "Priority Name",
      description: "Description",
      owner: "Department/Person",
      timeline: "Q1 2024 - Q4 2024",
      status: "on-track", // on-track, at-risk, delayed, completed
      initiatives: [
        {
          id: 1,
          name: "Initiative Name",
          objectives: ["Objective 1", "Objective 2"],
          keyResults: ["KR 1", "KR 2"],
          budget: "$X",
          dependencies: ["Dep 1"]
        }
      ]
    }
  ],
  metrics: [
    {
      name: "Metric Name",
      current: 75,
      target: 100,
      unit: "%"
    }
  ]
}
```

### Colour Scheme Suggestions
- Use a professional palette: navy/blue for primary, green for success, amber for warnings, red for urgent
- Ensure WCAG AA compliance for contrast
- Implement colour-blind friendly options

### Output Format
Create the application as a complete, working HTML file that:
- Can be opened directly in any modern browser
- Contains all JavaScript and CSS inline
- Includes sample data that I can easily replace
- Has clear comments explaining where to update content
- Works offline once loaded

## My Content

[PASTE YOUR STRATEGIC PLAN CONTENT HERE]

Include:
- Vision and mission statements
- Strategic priorities and initiatives
- Key metrics and targets
- Timeline and milestones
- Department/team responsibilities
- Budget information (if applicable)
- Any specific branding colours or style preferences

## Additional Preferences

- [Add any specific features you want]
- [Mention any sections that need special emphasis]
- [Note any compliance or confidentiality considerations]

---

Please create this application with a focus on making complex strategic information accessible, engaging, and easy to navigate for board members and stakeholders.