# Complete Development Specification
## Youth Mental Health Service Navigator, Apprenticeship Hub & Peer Support Finder
### For Integration into smalltalk.community Platform

---

## TABLE OF CONTENTS

1. [Platform Integration Requirements](#platform-integration)
2. [App 1: Youth Mental Health Service Navigator](#app-1)
3. [App 2: Local Apprenticeship & Traineeship Hub](#app-2)
4. [App 3: Peer Mental Health Support Group Finder](#app-3)
5. [Shared Technical Infrastructure](#shared-infrastructure)
6. [Data Models & Database Schema](#data-models)
7. [API Specifications](#api-specifications)
8. [Security & Privacy Requirements](#security)
9. [Testing Requirements](#testing)
10. [Deployment Instructions](#deployment)

---

## 1. PLATFORM INTEGRATION REQUIREMENTS {#platform-integration}

### Design System & Visual Identity

**Colour Palette (Exact smalltalk.community Scheme)**

Primary Palette:
- Primary: `#003870` (hsl(210, 100%, 22%)) - Deep Royal Blue
- Secondary: `#E2E4E6` (hsl(210, 6%, 89%)) - Light Grey-Blue
- Accent: `#E8EAEC` (hsl(210, 12%, 92%)) - Pale Cool Grey

Base Colours:
- Background: `#FFFFFF` (White)
- Foreground (Text): `#001429` (hsl(210, 100%, 8%)) - Almost Black
- Muted/Disabled: `#E6E8EA` (hsl(210, 8%, 91%))

Status Colours:
- Destructive/Error: `#C51111` (hsl(0, 84%, 42%)) - Deep Red
- Online/Success: `rgb(34, 197, 94)` - Green
- Away/Warning: `rgb(245, 158, 11)` - Amber
- Busy: `rgb(239, 68, 68)` - Red

**CSS Variables (To Be Used Throughout)**
```css
:root {
  /* Primary Palette */
  --primary: #003870;
  --secondary: #E2E4E6;
  --accent: #E8EAEC;
  
  /* Base Colours */
  --background: #FFFFFF;
  --foreground: #001429;
  --muted: #E6E8EA;
  
  /* Status Colours */
  --destructive: #C51111;
  --success: rgb(34, 197, 94);
  --warning: rgb(245, 158, 11);
  --error: rgb(239, 68, 68);
  
  /* Elevation System */
  --elevate-1: rgba(0, 0, 0, .03);
  --elevate-2: rgba(0, 0, 0, .08);
  
  /* Interactive Elements */
  --button-outline: rgba(0, 0, 0, .10);
  
  /* Typography */
  --font-sans: Inter, sans-serif;
  --font-serif: Georgia, serif;
  --font-mono: Menlo, monospace;
  --font-size-scale: 1;
  --line-height-scale: 1.5;
  
  /* Border Radius */
  --radius-lg: 9px;
  --radius-md: 6px;
  --radius-sm: 3px;
  --radius-base: 8px;
}
```

**Typography**

Fonts:
- Sans-serif (Primary): Inter, sans-serif (var(--font-sans))
- Serif: Georgia, serif
- Monospace: Menlo, monospace

Scale:
- Base Size: 16px (scalable via --font-size-scale)
- Line Height: 1.5 (scalable via --line-height-scale)
- Tailwind scale for headings:
  - text-4xl: 2.25rem (36px)
  - text-3xl: 1.875rem (30px)
  - text-2xl: 1.5rem (24px)
  - text-xl: 1.25rem (20px)
  - text-lg: 1.125rem (18px)
  - text-base: 1rem (16px)
  - text-sm: 0.875rem (14px)

Font Weights:
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

**Spacing System**
- Base unit: 8px
- Scale: 4px (0.25rem), 8px (0.5rem), 12px (0.75rem), 16px (1rem), 24px (1.5rem), 32px (2rem), 48px (3rem), 64px (4rem)

**Component Standards**

Border Radius:
- Large (lg): 9px (.5625rem)
- Medium (md): 6px (.375rem)
- Small (sm): 3px (.1875rem)
- Base: 8px (0.5rem)

Elevation System (Use instead of static shadows):
- Hover state: var(--elevate-1) - rgba(0, 0, 0, .03)
- Active/pressed state: var(--elevate-2) - rgba(0, 0, 0, .08)
- Apply as: `box-shadow: 0 2px 8px var(--elevate-1);`

Interactive Elements:
- Buttons: Minimum 44px height (touch target requirement)
- Button border: var(--button-outline) - rgba(0, 0, 0, .10)
- Form inputs: 48px minimum height
- Focus states: 2px solid outline in var(--primary) with 2px offset
- Hover states: Apply elevation-1
- Active states: Apply elevation-2

Animations:
- Accordion: 0.2s ease-out
- Button interactions: 0.15s ease-in-out
- Page transitions: 0.2s ease-in-out

**Component Examples**

Button Primary:
```css
.btn-primary {
  background-color: var(--primary);
  color: var(--background);
  border: 1px solid var(--button-outline);
  border-radius: var(--radius-md);
  padding: 12px 24px;
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 500;
  min-height: 44px;
  transition: all 0.15s ease-in-out;
}

.btn-primary:hover {
  box-shadow: 0 2px 8px var(--elevate-1);
  transform: translateY(-1px);
}

.btn-primary:active {
  box-shadow: 0 1px 4px var(--elevate-2);
  transform: translateY(0);
}

.btn-primary:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

Button Secondary:
```css
.btn-secondary {
  background-color: var(--secondary);
  color: var(--foreground);
  border: 1px solid var(--button-outline);
  border-radius: var(--radius-md);
  padding: 12px 24px;
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 500;
  min-height: 44px;
  transition: all 0.15s ease-in-out;
}

.btn-secondary:hover {
  background-color: var(--accent);
  box-shadow: 0 2px 8px var(--elevate-1);
}
```

Card Component:
```css
.card {
  background-color: var(--background);
  border: 1px solid var(--secondary);
  border-radius: var(--radius-lg);
  padding: 24px;
  transition: all 0.15s ease-in-out;
}

.card:hover {
  box-shadow: 0 4px 12px var(--elevate-1);
  border-color: var(--primary);
}
```

Form Input:
```css
.input {
  background-color: var(--background);
  border: 1px solid var(--secondary);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  font-family: var(--font-sans);
  font-size: 1rem;
  color: var(--foreground);
  min-height: 48px;
  transition: all 0.15s ease-in-out;
}

.input:hover {
  border-color: var(--primary);
}

.input:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
  border-color: var(--primary);
}
```

### Accessibility Requirements (WCAG 2.1 AA Compliance)

**Mandatory Standards**
- All interactive elements minimum 44x44px touch targets
- Colour contrast ratio minimum 4.5:1 for normal text, 3:1 for large text
  - Primary (#003870) on white: 9.26:1 ✓
  - Foreground (#001429) on white: 16.64:1 ✓
  - Error (#C51111) on white: 5.04:1 ✓
- All form inputs must have associated labels
- All images must have alt text
- Keyboard navigation must work for all interactive elements
- Screen reader announcements for dynamic content changes
- Skip to main content link at top of each page
- Focus indicators visible on all interactive elements (2px solid primary with 2px offset)
- Error messages must not rely solely on colour

**ARIA Implementation**
- Use semantic HTML first, ARIA as enhancement
- Required ARIA labels for icon-only buttons
- Live regions (aria-live="polite") for dynamic content updates
- Role attributes for custom components
- aria-expanded for collapsible content (accordion)
- aria-describedby for input field instructions
- aria-label for context where visual label insufficient

### Mobile-First Responsive Design

**Breakpoints**
- Mobile: 320px - 767px (primary development target)
- Tablet: 768px - 1023px
- Desktop: 1024px+

**Touch Interactions**
- All buttons and links minimum 44x44px
- Swipe gestures for card navigation on mobile
- Pull to refresh on mobile list views (optional)
- Bottom-aligned primary actions on mobile
- Form inputs font-size >= 16px (prevents auto-zoom on iOS)
- Adequate spacing between touch targets (minimum 8px)

### Performance Requirements

**Load Time Targets**
- First Contentful Paint: < 1.5s on 3G
- Time to Interactive: < 3.5s on 3G
- Total page size: < 500KB initial load
- Images: WebP format with fallbacks, lazy loading below fold
- Code splitting: Route-based chunks
- Critical CSS inlined in HTML head

**Optimization Strategies**
- Minimal JavaScript on initial load
- Defer non-critical scripts
- Preload critical fonts (Inter)
- Compress images (WebP, optimized PNGs)
- Enable gzip/brotli compression
- Cache static assets aggressively

### Browser Support
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- iOS Safari 13+
- Chrome Android (last 2 versions)

### Integration Points with smalltalk.community

**Header Navigation**
- Apps accessible from main navigation under "Community Tools"
- Breadcrumb navigation: Home > Community Tools > [App Name]
- Consistent header styling matching main site
- Logo links to smalltalk.community homepage

**Footer Elements (Always Visible)**
```html
<footer style="background: var(--accent); padding: 32px 16px; border-top: 1px solid var(--secondary);">
  <div class="crisis-support" style="margin-bottom: 24px; padding: 16px; background: var(--background); border-radius: var(--radius-lg); border: 2px solid var(--error);">
    <h3 style="color: var(--foreground); margin-bottom: 12px;">Crisis Support (24/7)</h3>
    <ul style="list-style: none; padding: 0;">
      <li><strong>Lifeline:</strong> 13 11 14</li>
      <li><strong>Kids Helpline:</strong> 1800 55 1800 (5-25 years)</li>
      <li><strong>Beyond Blue:</strong> 1300 224 636</li>
      <li><strong>Suicide Call Back Service:</strong> 1300 659 467</li>
      <li><strong>Emergency:</strong> 000</li>
    </ul>
  </div>
  
  <nav style="margin-bottom: 16px;">
    <a href="/privacy">Privacy Policy</a> | 
    <a href="/terms">Terms of Service</a> | 
    <a href="/accessibility">Accessibility</a> | 
    <a href="/contact">Contact</a>
  </nav>
  
  <p style="font-size: 0.875rem; color: var(--foreground); opacity: 0.7;">
    © 2025 smalltalk.community
  </p>
</footer>
```

**Shared User Session**
- Single sign-on if user authentication exists on main platform
- Shared favourites/bookmarks system across all apps
- Unified notification preferences
- Activity history visible across platform

**Navigation Between Apps**
```html
<nav class="app-switcher" style="background: var(--accent); padding: 16px; border-bottom: 1px solid var(--secondary);">
  <span style="font-size: 0.875rem; color: var(--foreground); opacity: 0.7; margin-right: 16px;">Community Tools:</span>
  <a href="/mental-health-navigator" class="active">Mental Health Navigator</a>
  <a href="/apprenticeship-hub">Apprenticeship Hub</a>
  <a href="/peer-support-finder">Peer Support Finder</a>
</nav>
```

---

## 2. APP 1: YOUTH MENTAL HEALTH SERVICE NAVIGATOR {#app-1}

### Purpose
Help young people (12-25) find the right mental health service quickly based on their age, issue, urgency, location, and preferences. Navigate fragmented system of CAMHS, Youth services, Headspace, YPARCs, HOPE, and crisis supports.

### User Flow

**Step 1: Welcome Screen**

```html
<div class="welcome-screen" style="max-width: 600px; margin: 0 auto; padding: 48px 16px; text-align: center;">
  <div style="width: 80px; height: 80px; background: var(--primary); border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  </div>
  
  <h1 style="font-size: 2.25rem; font-weight: 700; color: var(--foreground); margin-bottom: 16px; line-height: 1.2;">
    Find Mental Health Support That's Right For You
  </h1>
  
  <p style="font-size: 1.125rem; color: var(--foreground); opacity: 0.8; margin-bottom: 32px; line-height: 1.5;">
    Answer a few quick questions and we'll show you the fastest way to get help.
  </p>
  
  <button class="btn-primary" style="width: 100%; max-width: 300px; margin-bottom: 16px;">
    Get Started
  </button>
  
  <div style="margin-top: 24px; padding: 16px; background: rgba(197, 17, 17, 0.1); border-radius: var(--radius-md); border: 1px solid var(--destructive);">
    <a href="#crisis" style="color: var(--destructive); font-weight: 600; font-size: 1rem;">
      I need urgent help right now →
    </a>
  </div>
  
  <a href="#supporter-pathway" style="display: block; margin-top: 16px; color: var(--primary); font-size: 0.875rem;">
    I'm helping someone else
  </a>
</div>
```

**Step 2: Quick Intake (Progressive Disclosure)**

Design pattern: Single question per screen on mobile, multi-step form on desktop. Progress indicator at top.

```html
<div class="intake-form" style="max-width: 700px; margin: 0 auto; padding: 32px 16px;">
  <!-- Progress Indicator -->
  <div class="progress-bar" style="margin-bottom: 32px;">
    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
      <span style="font-size: 0.875rem; color: var(--foreground); opacity: 0.7;">Step 1 of 5</span>
      <span style="font-size: 0.875rem; color: var(--primary); font-weight: 600;">20%</span>
    </div>
    <div style="width: 100%; height: 8px; background: var(--secondary); border-radius: 9999px; overflow: hidden;">
      <div style="width: 20%; height: 100%; background: var(--primary); transition: width 0.3s ease;"></div>
    </div>
  </div>
  
  <!-- Question 1: Age -->
  <div class="question-card" style="background: var(--background); border: 1px solid var(--secondary); border-radius: var(--radius-lg); padding: 32px;">
    <h2 style="font-size: 1.5rem; font-weight: 600; color: var(--foreground); margin-bottom: 8px;">
      How old are you?
    </h2>
    
    <p style="font-size: 0.875rem; color: var(--foreground); opacity: 0.7; margin-bottom: 24px;">
      Different services support different age groups.
    </p>
    
    <label for="age" style="display: block; font-size: 0.875rem; font-weight: 500; color: var(--foreground); margin-bottom: 8px;">
      Age
    </label>
    <input 
      type="number" 
      id="age" 
      class="input" 
      placeholder="Enter your age"
      min="12"
      max="25"
      style="width: 100%; margin-bottom: 16px;"
    />
    
    <p style="font-size: 0.75rem; color: var(--foreground); opacity: 0.6; font-style: italic;">
      This tool is designed for young people aged 12-25. If you're outside this range, we'll still show you relevant services.
    </p>
    
    <button class="btn-primary" style="width: 100%; margin-top: 24px;">
      Next
    </button>
  </div>
</div>
```

*Question 2: Location*

```html
<div class="question-card">
  <h2>Where are you located?</h2>
  <p style="font-size: 0.875rem; opacity: 0.7; margin-bottom: 24px;">
    We'll show you services in your area.
  </p>
  
  <label for="location">Suburb, town or postcode</label>
  <input 
    type="text" 
    id="location" 
    class="input" 
    placeholder="e.g., Geelong, 3000, Ballarat"
    autocomplete="off"
  />
  <div class="autocomplete-results" style="display: none;"></div>
  
  <button class="btn-secondary" style="width: 100%; margin-top: 16px;">
    <svg width="16" height="16" style="margin-right: 8px;">...</svg>
    Use my current location
  </button>
  
  <button class="btn-primary" style="width: 100%; margin-top: 16px;">
    Next
  </button>
</div>
```

*Question 3: Issue Type (Multi-select)*

```html
<div class="question-card">
  <h2>What are you looking for support with?</h2>
  <p style="font-size: 0.875rem; opacity: 0.7; margin-bottom: 8px;">
    Select all that apply
  </p>
  
  <div class="checkbox-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-top: 24px;">
    
    <label class="checkbox-card" style="display: flex; align-items: center; padding: 16px; background: var(--background); border: 2px solid var(--secondary); border-radius: var(--radius-md); cursor: pointer; transition: all 0.15s;">
      <input type="checkbox" value="anxiety" style="margin-right: 12px; width: 20px; height: 20px;">
      <span style="font-size: 0.875rem; color: var(--foreground);">Feeling anxious or worried</span>
    </label>
    
    <label class="checkbox-card">
      <input type="checkbox" value="depression">
      <span>Feeling depressed or really down</span>
    </label>
    
    <label class="checkbox-card">
      <input type="checkbox" value="trauma">
      <span>Dealing with trauma or difficult experiences</span>
    </label>
    
    <label class="checkbox-card">
      <input type="checkbox" value="selfharm">
      <span>Self-harm or thoughts of suicide</span>
    </label>
    
    <label class="checkbox-card">
      <input type="checkbox" value="relationships">
      <span>Relationship or family problems</span>
    </label>
    
    <label class="checkbox-card">
      <input type="checkbox" value="eating">
      <span>Eating difficulties</span>
    </label>
    
    <label class="checkbox-card">
      <input type="checkbox" value="substance">
      <span>Substance use</span>
    </label>
    
    <label class="checkbox-card">
      <input type="checkbox" value="identity">
      <span>Gender or sexuality questions</span>
    </label>
    
    <label class="checkbox-card">
      <input type="checkbox" value="stress">
      <span>School or work stress</span>
    </label>
    
    <label class="checkbox-card">
      <input type="checkbox" value="sleep">
      <span>Sleep problems</span>
    </label>
    
    <label class="checkbox-card">
      <input type="checkbox" value="grief">
      <span>Grief or loss</span>
    </label>
    
    <label class="checkbox-card">
      <input type="checkbox" value="unsure">
      <span>Not sure, just need someone to talk to</span>
    </label>
  </div>
  
  <style>
    .checkbox-card input:checked + span::before {
      content: '✓ ';
      font-weight: 700;
    }
    
    .checkbox-card:has(input:checked) {
      background: var(--accent);
      border-color: var(--primary);
    }
  </style>
  
  <p style="font-size: 0.75rem; color: var(--foreground); opacity: 0.6; margin-top: 16px; font-style: italic;">
    This helps us match you to the right type of support.
  </p>
  
  <button class="btn-primary" style="width: 100%; margin-top: 24px;">
    Next
  </button>
</div>
```

*Question 4: Urgency*

```html
<div class="question-card">
  <h2>How urgent is your situation?</h2>
  <p style="font-size: 0.875rem; opacity: 0.7; margin-bottom: 24px;">
    This determines which pathway will be fastest.
  </p>
  
  <div class="radio-group" style="display: flex; flex-direction: column; gap: 12px;">
    
    <label class="radio-card" style="display: flex; align-items: start; padding: 20px; background: var(--background); border: 2px solid var(--secondary); border-radius: var(--radius-md); cursor: pointer; transition: all 0.15s;">
      <input type="radio" name="urgency" value="crisis" style="margin-right: 16px; margin-top: 4px; width: 20px; height: 20px; flex-shrink: 0;">
      <div>
        <div style="font-weight: 600; color: var(--foreground); margin-bottom: 4px;">I need help right now or very soon</div>
        <div style="font-size: 0.875rem; color: var(--foreground); opacity: 0.7;">Crisis support services</div>
      </div>
    </label>
    
    <label class="radio-card">
      <input type="radio" name="urgency" value="urgent">
      <div>
        <div style="font-weight: 600;">Within the next few days</div>
        <div style="font-size: 0.875rem; opacity: 0.7;">Urgent support services</div>
      </div>
    </label>
    
    <label class="radio-card">
      <input type="radio" name="urgency" value="standard">
      <div>
        <div style="font-weight: 600;">Within the next few weeks</div>
        <div style="font-size: 0.875rem; opacity: 0.7;">Standard support services</div>
      </div>
    </label>
    
    <label class="radio-card">
      <input type="radio" name="urgency" value="ongoing">
      <div>
        <div style="font-weight: 600;">I'm planning ahead for ongoing support</div>
        <div style="font-size: 0.875rem; opacity: 0.7;">Long-term services and programs</div>
      </div>
    </label>
  </div>
  
  <style>
    .radio-card:has(input:checked) {
      background: var(--accent);
      border-color: var(--primary);
      box-shadow: 0 2px 8px var(--elevate-1);
    }
  </style>
  
  <button class="btn-primary" style="width: 100%; margin-top: 24px;">
    Next
  </button>
</div>
```

*Question 5: Preferences (Optional, Expandable)*

```html
<div class="question-card">
  <h2>Do you have any preferences?</h2>
  <p style="font-size: 0.875rem; opacity: 0.7; margin-bottom: 24px;">
    Optional, helps us show the best matches for you
  </p>
  
  <!-- Accordion for preferences -->
  <details class="accordion" style="border: 1px solid var(--secondary); border-radius: var(--radius-md); overflow: hidden;">
    <summary style="padding: 16px; background: var(--accent); cursor: pointer; font-weight: 600; display: flex; justify-content: space-between; align-items: center;">
      <span>Cost preferences</span>
      <span class="accordion-icon">▼</span>
    </summary>
    <div style="padding: 16px; background: var(--background);">
      <label class="checkbox-card" style="margin-bottom: 8px;">
        <input type="checkbox" value="bulkbilled">
        <span>Free/bulk-billed services only</span>
      </label>
      <label class="checkbox-card">
        <input type="checkbox" value="payingok">
        <span>Open to paying some costs</span>
      </label>
    </div>
  </details>
  
  <details class="accordion" style="border: 1px solid var(--secondary); border-radius: var(--radius-md); overflow: hidden; margin-top: 12px;">
    <summary style="padding: 16px; background: var(--accent); cursor: pointer; font-weight: 600;">
      <span>Format preferences</span>
      <span>▼</span>
    </summary>
    <div style="padding: 16px;">
      <label class="checkbox-card">
        <input type="checkbox" value="facetoface">
        <span>Face-to-face preferred</span>
      </label>
      <label class="checkbox-card">
        <input type="checkbox" value="remote">
        <span>Phone or video is fine</span>
      </label>
      <label class="checkbox-card">
        <input type="checkbox" value="online">
        <span>Online chat or text preferred</span>
      </label>
    </div>
  </details>
  
  <details class="accordion" style="border: 1px solid var(--secondary); border-radius: var(--radius-md); overflow: hidden; margin-top: 12px;">
    <summary style="padding: 16px; background: var(--accent); cursor: pointer; font-weight: 600;">
      <span>Other preferences</span>
      <span>▼</span>
    </summary>
    <div style="padding: 16px;">
      <label class="checkbox-card">
        <input type="checkbox" value="lgbtiq">
        <span>LGBTIQ+ specialised support</span>
      </label>
      <label class="checkbox-card">
        <input type="checkbox" value="cultural">
        <span>Culturally specific support</span>
      </label>
      <input type="text" class="input" placeholder="Specify culture/language" style="margin-top: 8px;">
      <label class="checkbox-card" style="margin-top: 8px;">
        <input type="checkbox" value="female">
        <span>Female practitioner preferred</span>
      </label>
      <label class="checkbox-card">
        <input type="checkbox" value="youthled">
        <span>Youth-led peer support</span>
      </label>
    </div>
  </details>
  
  <button class="btn-primary" style="width: 100%; margin-top: 24px;">
    Show me my options
  </button>
  
  <button class="btn-secondary" style="width: 100%; margin-top: 12px;">
    Skip preferences
  </button>
</div>
```

**Step 3: Results Page**

Layout structure: Crisis support always visible at top, best matches in middle, additional options at bottom.

```html
<div class="results-page" style="max-width: 1200px; margin: 0 auto; padding: 32px 16px;">
  
  <!-- Back to intake option -->
  <button class="btn-secondary" style="margin-bottom: 16px;">
    ← Change my answers
  </button>
  
  <h1 style="font-size: 2rem; font-weight: 700; color: var(--foreground); margin-bottom: 8px;">
    Mental Health Support Options
  </h1>
  <p style="font-size: 1rem; color: var(--foreground); opacity: 0.7; margin-bottom: 32px;">
    Based on your answers, here are your best options
  </p>
  
  <!-- Section 1: Crisis Support (Always Visible if crisis selected or any suicide/self-harm issues) -->
  <div class="crisis-banner" style="background: rgba(197, 17, 17, 0.05); border: 2px solid var(--destructive); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 32px;">
    <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--destructive); margin-bottom: 16px;">
      🚨 If You Need Help Right Now
    </h2>
    
    <p style="font-size: 1rem; color: var(--foreground); margin-bottom: 24px;">
      If you're in immediate danger, call <strong>000</strong>
    </p>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
      
      <div class="crisis-card" style="background: var(--background); border: 1px solid var(--destructive); border-radius: var(--radius-md); padding: 20px;">
        <h3 style="font-weight: 600; color: var(--foreground); margin-bottom: 8px;">Lifeline</h3>
        <p style="font-size: 2rem; font-weight: 700; color: var(--destructive); margin-bottom: 8px;">13 11 14</p>
        <p style="font-size: 0.875rem; color: var(--foreground); opacity: 0.7; margin-bottom: 16px;">24/7 crisis support and suicide prevention</p>
        <a href="tel:131114" class="btn-primary" style="display: block; text-align: center; text-decoration: none;">Call now</a>
        <p style="font-size: 0.75rem; color: var(--foreground); opacity: 0.6; margin-top: 8px;">Text: 0477 13 11 14</p>
      </div>
      
      <div class="crisis-card" style="background: var(--background); border: 1px solid var(--destructive); border-radius: var(--radius-md); padding: 20px;">
        <h3 style="font-weight: 600; margin-bottom: 8px;">Kids Helpline</h3>
        <p style="font-size: 2rem; font-weight: 700; color: var(--destructive); margin-bottom: 8px;">1800 55 1800</p>
        <p style="font-size: 0.875rem; opacity: 0.7; margin-bottom: 16px;">For 5-25 years, 24/7 support</p>
        <a href="tel:1800551800" class="btn-primary" style="display: block; text-align: center; text-decoration: none;">Call now</a>
        <a href="https://kidshelpline.com.au" style="font-size: 0.75rem; display: block; margin-top: 8px; text-align: center;">Online chat available</a>
      </div>
      
      <div class="crisis-card">
        <h3 style="font-weight: 600; margin-bottom: 8px;">Suicide Call Back Service</h3>
        <p style="font-size: 2rem; font-weight: 700; color: var(--destructive); margin-bottom: 8px;">1300 659 467</p>
        <p style="font-size: 0.875rem; opacity: 0.7; margin-bottom: 16px;">24/7 telephone and online counselling</p>
        <a href="tel:1300659467" class="btn-primary" style="display: block; text-align: center; text-decoration: none;">Call now</a>
      </div>
      
      <div class="crisis-card">
        <h3 style="font-weight: 600; margin-bottom: 8px;">Your Local Hospital</h3>
        <p style="font-size: 0.875rem; opacity: 0.7; margin-bottom: 16px;">Emergency department is available 24/7</p>
        <button class="btn-secondary" style="width: 100%;">Find nearest hospital</button>
      </div>
    </div>
    
    <div style="margin-top: 24px; padding: 16px; background: var(--accent); border-radius: var(--radius-md);">
      <h4 style="font-weight: 600; margin-bottom: 8px;">Online Crisis Support</h4>
      <ul style="list-style: none; padding: 0;">
        <li style="margin-bottom: 8px;">
          <a href="https://lifeline.org.au/crisis-chat" style="color: var(--primary); font-weight: 500;">Lifeline Crisis Chat</a>
        </li>
        <li style="margin-bottom: 8px;">
          <a href="https://kidshelpline.com.au" style="color: var(--primary); font-weight: 500;">Kids Helpline Web Chat</a>
        </li>
      </ul>
    </div>
  </div>
  
  <!-- Section 2: Your Best Matches -->
  <h2 style="font-size: 1.75rem; font-weight: 700; color: var(--foreground); margin-bottom: 16px;">
    Your Best Matches
  </h2>
  <p style="font-size: 0.875rem; color: var(--foreground); opacity: 0.7; margin-bottom: 24px;">
    Services ranked by suitability, wait time, and location
  </p>
  
  <div class="services-grid" style="display: grid; gap: 24px; margin-bottom: 48px;">
    
    <!-- Service Card Example -->
    <div class="service-card" style="background: var(--background); border: 2px solid var(--primary); border-radius: var(--radius-lg); padding: 24px; transition: all 0.15s;">
      
      <!-- Match Badge -->
      <div style="display: inline-block; background: var(--primary); color: var(--background); padding: 6px 12px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; margin-bottom: 16px;">
        ⭐ TOP MATCH
      </div>
      
      <div style="display: flex; gap: 16px; margin-bottom: 16px;">
        <!-- Service Logo/Icon -->
        <div style="width: 60px; height: 60px; background: var(--accent); border-radius: var(--radius-md); flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--primary);">
          HS
        </div>
        
        <div style="flex: 1;">
          <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--foreground); margin-bottom: 4px;">
            Headspace Geelong
          </h3>
          <p style="font-size: 0.875rem; color: var(--foreground); opacity: 0.7;">
            Youth Mental Health Service
          </p>
        </div>
        
        <!-- Save Button -->
        <button class="btn-secondary" style="padding: 8px 16px; height: fit-content;">
          ♡ Save
        </button>
      </div>
      
      <!-- Match Reason -->
      <div style="background: rgba(0, 56, 112, 0.05); border-left: 3px solid var(--primary); padding: 12px; margin-bottom: 16px; border-radius: var(--radius-sm);">
        <p style="font-size: 0.875rem; color: var(--foreground);">
          <strong>Why this matches:</strong> Good fit for anxiety support, ages 12-25, free services
        </p>
      </div>
      
      <!-- Key Information -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        
        <div class="info-item">
          <div style="font-size: 0.75rem; color: var(--foreground); opacity: 0.6; margin-bottom: 4px;">WAIT TIME</div>
          <div style="font-weight: 600; color: var(--foreground);">⏱ 2-3 weeks</div>
        </div>
        
        <div class="info-item">
          <div style="font-size: 0.75rem; opacity: 0.6; margin-bottom: 4px;">COST</div>
          <div style="font-weight: 600; color: rgb(34, 197, 94);">💰 Free (bulk-billed)</div>
        </div>
        
        <div class="info-item">
          <div style="font-size: 0.75rem; opacity: 0.6; margin-bottom: 4px;">LOCATION</div>
          <div style="font-weight: 600;">📍 Geelong (12km)</div>
        </div>
        
        <div class="info-item">
          <div style="font-size: 0.75rem; opacity: 0.6; margin-bottom: 4px;">FORMAT</div>
          <div style="font-weight: 600;">📱 Face-to-face, telehealth</div>
        </div>
      </div>
      
      <!-- What They Offer -->
      <div style="margin-bottom: 16px;">
        <h4 style="font-size: 0.875rem; font-weight: 600; color: var(--foreground); margin-bottom: 8px;">What they offer:</h4>
        <ul style="font-size: 0.875rem; color: var(--foreground); opacity: 0.8; padding-left: 20px; line-height: 1.6;">
          <li>Individual counselling (up to 12 sessions)</li>
          <li>Group programs for anxiety and depression</li>
          <li>Family support</li>
          <li>Vocational and education support</li>
        </ul>
      </div>
      
      <!-- Referral Required -->
      <div style="background: var(--accent); padding: 12px; border-radius: var(--radius-sm); margin-bottom: 16px;">
        <p style="font-size: 0.875rem; color: var(--foreground);">
          <strong>GP referral:</strong> Not required (you can self-refer)
        </p>
      </div>
      
      <!-- Action Buttons -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <button class="btn-primary">Get details</button>
        <button class="btn-secondary">How to access</button>
      </div>
    </div>
    
    <!-- Additional Service Cards (2-4 more) with same structure -->
    <!-- ... -->
    
  </div>
  
  <!-- Section 3: More Options (Expandable) -->
  <div class="additional-options">
    
    <details class="accordion" style="border: 1px solid var(--secondary); border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 16px;">
      <summary style="padding: 20px; background: var(--accent); cursor: pointer; font-weight: 600; font-size: 1.125rem;">
        <span>▼ Online Support Services (Always Available)</span>
      </summary>
      <div style="padding: 20px;">
        <!-- List of online services -->
      </div>
    </details>
    
    <details class="accordion" style="border: 1px solid var(--secondary); border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 16px;">
      <summary style="padding: 20px; background: var(--accent); cursor: pointer; font-weight: 600; font-size: 1.125rem;">
        <span>▼ Peer Support Groups Near You</span>
      </summary>
      <div style="padding: 20px;">
        <!-- Link to Peer Support Finder app -->
        <p>Looking for peer support groups? Check out our <a href="/peer-support-finder" style="color: var(--primary); font-weight: 600;">Peer Support Finder</a>.</p>
      </div>
    </details>
    
    <details class="accordion">
      <summary style="padding: 20px; background: var(--accent); cursor: pointer; font-weight: 600; font-size: 1.125rem;">
        <span>▼ School-Based Support</span>
      </summary>
      <div style="padding: 20px;">
        <!-- School counsellors, wellbeing coordinators -->
      </div>
    </details>
    
    <details class="accordion">
      <summary style="padding: 20px;">
        <span>▼ Self-Help Tools & Apps</span>
      </summary>
      <div style="padding: 20px;">
        <!-- Recommended apps: Smiling Mind, ReachOut Breathe, etc. -->
      </div>
    </details>
    
    <details class="accordion">
      <summary style="padding: 20px;">
        <span>▼ Services in Nearby Areas</span>
      </summary>
      <div style="padding: 20px;">
        <!-- Services in adjacent regions -->
      </div>
    </details>
    
  </div>
  
  <!-- Feedback Prompt -->
  <div style="margin-top: 48px; padding: 24px; background: var(--accent); border-radius: var(--radius-lg); text-align: center;">
    <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 8px;">Was this helpful?</h3>
    <p style="font-size: 0.875rem; opacity: 0.7; margin-bottom: 16px;">Your feedback helps us improve this tool</p>
    <div style="display: flex; gap: 12px; justify-content: center;">
      <button class="btn-secondary">👍 Yes</button>
      <button class="btn-secondary">👎 No</button>
    </div>
  </div>
  
</div>
```

**Step 4: Service Detail Page**

```html
<div class="service-detail-page" style="max-width: 900px; margin: 0 auto; padding: 32px 16px;">
  
  <!-- Back Button -->
  <button class="btn-secondary" style="margin-bottom: 24px;">
    ← Back to results
  </button>
  
  <!-- Service Header -->
  <div style="display: flex; gap: 24px; align-items: start; margin-bottom: 32px;">
    <div style="width: 100px; height: 100px; background: var(--accent); border-radius: var(--radius-lg); flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
      <span style="font-size: 2rem; font-weight: 700; color: var(--primary);">HS</span>
    </div>
    
    <div style="flex: 1;">
      <div style="display: inline-block; background: rgb(34, 197, 94); color: white; padding: 4px 12px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; margin-bottom: 8px;">
        ✓ ACCEPTING NEW CLIENTS
      </div>
      
      <h1 style="font-size: 2rem; font-weight: 700; color: var(--foreground); margin-bottom: 8px;">
        Headspace Geelong
      </h1>
      
      <p style="font-size: 1rem; color: var(--foreground); opacity: 0.7; margin-bottom: 16px;">
        Youth Mental Health Service
      </p>
      
      <button class="btn-secondary" style="padding: 8px 16px;">
        ♡ Save for later
      </button>
    </div>
  </div>
  
  <!-- Quick Contact -->
  <div style="background: var(--primary); color: var(--background); padding: 24px; border-radius: var(--radius-lg); margin-bottom: 32px;">
    <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 16px;">Contact Information</h2>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
      <div>
        <div style="font-size: 0.75rem; opacity: 0.8; margin-bottom: 4px;">PHONE</div>
        <a href="tel:0352229600" style="color: var(--background); font-weight: 600; font-size: 1.125rem;">03 5222 9600</a>
      </div>
      
      <div>
        <div style="font-size: 0.75rem; opacity: 0.8; margin-bottom: 4px;">EMAIL</div>
        <a href="mailto:geelong@headspace.org.au" style="color: var(--background); font-weight: 600;">geelong@headspace.org.au</a>
      </div>
      
      <div>
        <div style="font-size: 0.75rem; opacity: 0.8; margin-bottom: 4px;">ADDRESS</div>
        <p style="font-weight: 600;">24 Gheringhap St, Geelong VIC 3220</p>
      </div>
      
      <div>
        <div style="font-size: 0.75rem; opacity: 0.8; margin-bottom: 4px;">WEBSITE</div>
        <a href="https://headspace.org.au/headspace-centres/geelong" style="color: var(--background); font-weight: 600;">Visit website →</a>
      </div>
    </div>
    
    <div style="margin-top: 16px; display: flex; gap: 12px;">
      <button class="btn-secondary" style="flex: 1; background: var(--background); color: var(--primary);">
        📱 Call now
      </button>
      <button class="btn-secondary" style="flex: 1; background: var(--background); color: var(--primary);">
        ✉️ Send email
      </button>
    </div>
  </div>
  
  <!-- Key Information -->
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-bottom: 32px;">
    
    <div class="info-card" style="background: var(--accent); padding: 20px; border-radius: var(--radius-lg);">
      <div style="font-size: 0.75rem; font-weight: 600; color: var(--foreground); opacity: 0.6; margin-bottom: 8px;">WAIT TIME</div>
      <div style="font-size: 1.5rem; font-weight: 700; color: var(--foreground);">2-3 weeks</div>
      <div style="font-size: 0.875rem; color: var(--foreground); opacity: 0.7; margin-top: 4px;">Current estimate</div>
    </div>
    
    <div class="info-card" style="background: var(--accent); padding: 20px; border-radius: var(--radius-lg);">
      <div style="font-size: 0.75rem; font-weight: 600; opacity: 0.6; margin-bottom: 8px;">COST</div>
      <div style="font-size: 1.5rem; font-weight: 700; color: rgb(34, 197, 94);">Free</div>
      <div style="font-size: 0.875rem; opacity: 0.7; margin-top: 4px;">Bulk-billed service</div>
    </div>
    
    <div class="info-card" style="background: var(--accent); padding: 20px; border-radius: var(--radius-lg);">
      <div style="font-size: 0.75rem; font-weight: 600; opacity: 0.6; margin-bottom: 8px;">AGE RANGE</div>
      <div style="font-size: 1.5rem; font-weight: 700;">12-25 years</div>
      <div style="font-size: 0.875rem; opacity: 0.7; margin-top: 4px;">Youth focus</div>
    </div>
    
    <div class="info-card" style="background: var(--accent); padding: 20px; border-radius: var(--radius-lg);">
      <div style="font-size: 0.75rem; font-weight: 600; opacity: 0.6; margin-bottom: 8px;">LOCATION</div>
      <div style="font-size: 1.5rem; font-weight: 700;">Geelong</div>
      <div style="font-size: 0.875rem; opacity: 0.7; margin-top: 4px;">12km from you</div>
    </div>
  </div>
  
  <!-- About Section -->
  <div class="content-section" style="background: var(--background); border: 1px solid var(--secondary); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--foreground); margin-bottom: 16px;">About This Service</h2>
    <p style="font-size: 1rem; color: var(--foreground); line-height: 1.6; margin-bottom: 16px;">
      Headspace Geelong provides early intervention mental health services to young people aged 12-25 and their families. We offer a youth-friendly, accessible space where young people can get help with mental health, physical health, alcohol and other drugs, and work and study support.
    </p>
    <p style="font-size: 1rem; color: var(--foreground); line-height: 1.6;">
      Our service is free and no referral is needed. You can walk in during opening hours or make an appointment.
    </p>
  </div>
  
  <!-- Services Offered -->
  <div class="content-section" style="border: 1px solid var(--secondary); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 16px;">What We Offer</h2>
    
    <div style="display: grid; gap: 16px;">
      <div style="display: flex; gap: 12px;">
        <div style="width: 32px; height: 32px; background: var(--primary); border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">✓</div>
        <div>
          <h3 style="font-weight: 600; margin-bottom: 4px;">Individual Counselling</h3>
          <p style="font-size: 0.875rem; opacity: 0.7;">One-on-one support for mental health concerns, up to 12 sessions</p>
        </div>
      </div>
      
      <div style="display: flex; gap: 12px;">
        <div style="width: 32px; height: 32px; background: var(--primary); border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">✓</div>
        <div>
          <h3 style="font-weight: 600; margin-bottom: 4px;">Group Programs</h3>
          <p style="font-size: 0.875rem; opacity: 0.7;">Programs for anxiety, depression, and social connection</p>
        </div>
      </div>
      
      <div style="display: flex; gap: 12px;">
        <div style="width: 32px; height: 32px; background: var(--primary); border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">✓</div>
        <div>
          <h3 style="font-weight: 600; margin-bottom: 4px;">Family Support</h3>
          <p style="font-size: 0.875rem; opacity: 0.7;">Support for families and carers of young people</p>
        </div>
      </div>
      
      <div style="display: flex; gap: 12px;">
        <div style="width: 32px; height: 32px; background: var(--primary); border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">✓</div>
        <div>
          <h3 style="font-weight: 600; margin-bottom: 4px;">Vocational Support</h3>
          <p style="font-size: 0.875rem; opacity: 0.7;">Help with work and study goals</p>
        </div>
      </div>
      
      <div style="display: flex; gap: 12px;">
        <div style="width: 32px; height: 32px; background: var(--primary); border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">✓</div>
        <div>
          <h3 style="font-weight: 600; margin-bottom: 4px;">Physical Health</h3>
          <p style="font-size: 0.875rem; opacity: 0.7;">GP services for general health concerns</p>
        </div>
      </div>
      
      <div style="display: flex; gap: 12px;">
        <div style="width: 32px; height: 32px; background: var(--primary); border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">✓</div>
        <div>
          <h3 style="font-weight: 600; margin-bottom: 4px;">Alcohol & Other Drugs Support</h3>
          <p style="font-size: 0.875rem; opacity: 0.7;">Confidential support for substance use</p>
        </div>
      </div>
    </div>
  </div>
  
  <!-- How to Access -->
  <div class="content-section" style="background: rgba(0, 56, 112, 0.05); border: 2px solid var(--primary); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 16px;">How to Access</h2>
    
    <ol style="padding-left: 24px; line-height: 1.8; font-size: 1rem;">
      <li style="margin-bottom: 12px;"><strong>No referral needed</strong> - You can contact us directly</li>
      <li style="margin-bottom: 12px;"><strong>Call or email</strong> to make an appointment or ask questions</li>
      <li style="margin-bottom: 12px;"><strong>Walk-in during opening hours</strong> if you need urgent support</li>
      <li style="margin-bottom: 12px;"><strong>Initial assessment</strong> - We'll work out the best support for you</li>
      <li><strong>Start support</strong> - Begin counselling, groups, or other services</li>
    </ol>
    
    <div style="margin-top: 24px; padding: 16px; background: var(--background); border-radius: var(--radius-md);">
      <h3 style="font-weight: 600; margin-bottom: 8px;">What to bring to your first appointment:</h3>
      <ul style="padding-left: 20px; font-size: 0.875rem; line-height: 1.6;">
        <li>Medicare card (if you have one)</li>
        <li>Any referrals or medical information (optional)</li>
        <li>List of any current medications</li>
      </ul>
    </div>
  </div>
  
  <!-- Opening Hours -->
  <div class="content-section" style="border: 1px solid var(--secondary); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 16px;">Opening Hours</h2>
    
    <table style="width: 100%; border-collapse: collapse;">
      <tr style="border-bottom: 1px solid var(--secondary);">
        <td style="padding: 12px 0; font-weight: 600;">Monday</td>
        <td style="padding: 12px 0; text-align: right;">9:00am - 5:00pm</td>
      </tr>
      <tr style="border-bottom: 1px solid var(--secondary);">
        <td style="padding: 12px 0; font-weight: 600;">Tuesday</td>
        <td style="padding: 12px 0; text-align: right;">9:00am - 5:00pm</td>
      </tr>
      <tr style="border-bottom: 1px solid var(--secondary);">
        <td style="padding: 12px 0; font-weight: 600;">Wednesday</td>
        <td style="padding: 12px 0; text-align: right;">9:00am - 8:00pm</td>
      </tr>
      <tr style="border-bottom: 1px solid var(--secondary);">
        <td style="padding: 12px 0; font-weight: 600;">Thursday</td>
        <td style="padding: 12px 0; text-align: right;">9:00am - 5:00pm</td>
      </tr>
      <tr style="border-bottom: 1px solid var(--secondary);">
        <td style="padding: 12px 0; font-weight: 600;">Friday</td>
        <td style="padding: 12px 0; text-align: right;">9:00am - 5:00pm</td>
      </tr>
      <tr style="border-bottom: 1px solid var(--secondary);">
        <td style="padding: 12px 0; font-weight: 600;">Saturday</td>
        <td style="padding: 12px 0; text-align: right; opacity: 0.5;">Closed</td>
      </tr>
      <tr>
        <td style="padding: 12px 0; font-weight: 600;">Sunday</td>
        <td style="padding: 12px 0; text-align: right; opacity: 0.5;">Closed</td>
      </tr>
    </table>
  </div>
  
  <!-- Accessibility -->
  <div class="content-section" style="border: 1px solid var(--secondary); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 16px;">Accessibility</h2>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 1.5rem;">♿</span>
        <span>Wheelchair accessible</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 1.5rem;">🅿️</span>
        <span>Parking available</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 1.5rem;">🚌</span>
        <span>Public transport nearby</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 1.5rem;">🌐</span>
        <span>Interpreter services available</span>
      </div>
    </div>
  </div>
  
  <!-- Reviews/Testimonials (if available) -->
  <div class="content-section" style="border: 1px solid var(--secondary); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 16px;">What Young People Say</h2>
    
    <div class="testimonial" style="background: var(--accent); padding: 20px; border-radius: var(--radius-md); margin-bottom: 16px; border-left: 4px solid var(--primary);">
      <p style="font-size: 1rem; line-height: 1.6; margin-bottom: 12px; font-style: italic;">
        "The staff at headspace really understood what I was going through. They didn't judge me and gave me practical tools to manage my anxiety."
      </p>
      <p style="font-size: 0.875rem; opacity: 0.7;">- Young person, age 17</p>
    </div>
    
    <div class="testimonial" style="background: var(--accent); padding: 20px; border-radius: var(--radius-md); border-left: 4px solid var(--primary);">
      <p style="font-size: 1rem; line-height: 1.6; margin-bottom: 12px; font-style: italic;">
        "I was nervous at first, but the counsellor made me feel comfortable. It really helped to talk to someone who gets it."
      </p>
      <p style="font-size: 0.875rem; opacity: 0.7;">- Young person, age 21</p>
    </div>
  </div>
  
  <!-- Action Buttons -->
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
    <button class="btn-primary">📱 Call now</button>
    <button class="btn-primary">✉️ Send email</button>
    <button class="btn-secondary">🗺️ Get directions</button>
    <button class="btn-secondary">♡ Save for later</button>
  </div>
  
</div>
```

### Data Structure for Services

```javascript
const mentalHealthService = {
  id: "headspace-geelong",
  name: "Headspace Geelong",
  type: "Youth Mental Health Service",
  status: "accepting", // accepting | waitlist | closed
  
  contact: {
    phone: "03 5222 9600",
    email: "geelong@headspace.org.au",
    website: "https://headspace.org.au/headspace-centres/geelong",
    address: {
      street: "24 Gheringhap St",
      suburb: "Geelong",
      state: "VIC",
      postcode: "3220",
      coordinates: { lat: -38.1499, lng: 144.3617 }
    }
  },
  
  details: {
    ageRange: { min: 12, max: 25 },
    waitTime: "2-3 weeks",
    cost: "free", // free | partial | paid
    bulkBilled: true,
    referralRequired: false,
    formats: ["face-to-face", "telehealth"],
    
    servicesOffered: [
      "Individual counselling",
      "Group programs",
      "Family support",
      "Vocational support",
      "Physical health",
      "Alcohol & other drugs support"
    ],
    
    specialisations: [
      "anxiety",
      "depression",
      "trauma",
      "relationships",
      "substance-use",
      "work-study-stress"
    ],
    
    culturalSupport: ["interpreter-services"],
    lgbtiqFriendly: true,
    
    accessibility: {
      wheelchairAccessible: true,
      parking: true,
      publicTransport: true,
      interpreterServices: true
    },
    
    openingHours: {
      monday: { open: "09:00", close: "17:00" },
      tuesday: { open: "09:00", close: "17:00" },
      wednesday: { open: "09:00", close: "20:00" },
      thursday: { open: "09:00", close: "17:00" },
      friday: { open: "09:00", close: "17:00" },
      saturday: null,
      sunday: null
    }
  },
  
  matchingCriteria: {
    tags: ["youth", "mental-health", "free", "no-referral", "anxiety", "depression"],
    regions: ["Geelong", "Greater Geelong", "Barwon"],
    ageGroups: ["12-17", "18-25"]
  },
  
  lastUpdated: "2025-01-02"
};
```

### Matching Algorithm Logic

```javascript
function calculateServiceMatch(userAnswers, service) {
  let matchScore = 0;
  let matchReasons = [];
  
  // Age match (critical)
  if (userAnswers.age >= service.details.ageRange.min && 
      userAnswers.age <= service.details.ageRange.max) {
    matchScore += 30;
  } else if (service.details.ageRange.min === null) {
    // All ages service
    matchScore += 15;
  }
  
  // Issue type match
  const userIssues = userAnswers.issues;
  const serviceSpecialisations = service.details.specialisations;
  const issueMatches = userIssues.filter(issue => 
    serviceSpecialisations.includes(issue)
  );
  
  if (issueMatches.length > 0) {
    matchScore += (issueMatches.length / userIssues.length) * 25;
    matchReasons.push(`Good fit for ${issueMatches.join(', ')} support`);
  }
  
  // Cost preference
  if (userAnswers.preferences.bulkBilledOnly && service.details.bulkBilled) {
    matchScore += 15;
    matchReasons.push("Free service");
  }
  
  // Format preference
  const userFormats = userAnswers.preferences.formats;
  const serviceFormats = service.details.formats;
  const formatMatches = userFormats.filter(format => 
    serviceFormats.includes(format)
  );
  
  if (formatMatches.length > 0) {
    matchScore += 10;
  }
  
  // Location proximity
  const distance = calculateDistance(
    userAnswers.location.coordinates,
    service.contact.address.coordinates
  );
  
  if (distance < 10) matchScore += 10;
  else if (distance < 25) matchScore += 5;
  
  // LGBTIQ+ preference
  if (userAnswers.preferences.lgbtiq && service.details.lgbtiqFriendly) {
    matchScore += 10;
    matchReasons.push("LGBTIQ+ friendly");
  }
  
  // Urgency vs wait time
  if (userAnswers.urgency === "crisis") {
    // Don't match standard services for crisis
    if (service.type !== "crisis") matchScore = 0;
  } else if (userAnswers.urgency === "urgent") {
    // Prioritise short wait times
    const waitWeeks = parseInt(service.details.waitTime);
    if (waitWeeks <= 1) matchScore += 15;
    else if (waitWeeks <= 2) matchScore += 10;
    else if (waitWeeks <= 4) matchScore += 5;
  }
  
  // No referral required bonus
  if (!service.details.referralRequired) {
    matchScore += 5;
    matchReasons.push("No referral needed");
  }
  
  return {
    score: matchScore,
    reasons: matchReasons
  };
}
```

---

## 3. APP 2: LOCAL APPRENTICESHIP & TRAINEESHIP HUB {#app-2}

### Purpose
Connect young people (15-24) with apprenticeships, traineeships, and pre-apprenticeship programs across Victoria. Show real job openings, wage information, employer details, training pathways, and support available.

### User Flow

**Step 1: Welcome Screen**

```html
<div class="welcome-screen" style="max-width: 600px; margin: 0 auto; padding: 48px 16px; text-align: center;">
  <div style="width: 80px; height: 80px; background: var(--primary); border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <line x1="9" y1="9" x2="15" y2="9"/>
      <line x1="9" y1="15" x2="15" y2="15"/>
    </svg>
  </div>
  
  <h1 style="font-size: 2.25rem; font-weight: 700; color: var(--foreground); margin-bottom: 16px; line-height: 1.2;">
    Find Your Apprenticeship or Traineeship
  </h1>
  
  <p style="font-size: 1.125rem; color: var(--foreground); opacity: 0.8; margin-bottom: 32px; line-height: 1.5;">
    Discover real opportunities, see what you'll earn, and start your career journey.
  </p>
  
  <button class="btn-primary" style="width: 100%; max-width: 300px; margin-bottom: 16px;">
    Explore Opportunities
  </button>
  
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 32px; text-align: center;">
    <div>
      <div style="font-size: 2rem; font-weight: 700; color: var(--primary);">400+</div>
      <div style="font-size: 0.875rem; opacity: 0.7;">Live Opportunities</div>
    </div>
    <div>
      <div style="font-size: 2rem; font-weight: 700; color: var(--primary);">70+</div>
      <div style="font-size: 0.875rem; opacity: 0.7;">Free TAFE Courses</div>
    </div>
    <div>
      <div style="font-size: 2rem; font-weight: 700; color: var(--primary);">50+</div>
      <div style="font-size: 0.875rem; opacity: 0.7;">Industries</div>
    </div>
  </div>
</div>
```

**Step 2: Quick Finder (Progressive)**

```html
<div class="finder-form" style="max-width: 700px; margin: 0 auto; padding: 32px 16px;">
  
  <div class="question-card">
    <h2>What kind of work interests you?</h2>
    <p style="font-size: 0.875rem; opacity: 0.7; margin-bottom: 24px;">
      Select one or more industries
    </p>
    
    <div class="industry-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px;">
      
      <label class="industry-card" style="padding: 16px; background: var(--background); border: 2px solid var(--secondary); border-radius: var(--radius-md); cursor: pointer; text-align: center; transition: all 0.15s;">
        <input type="checkbox" value="construction" style="display: none;">
        <div style="font-size: 2rem; margin-bottom: 8px;">🔨</div>
        <div style="font-weight: 600; font-size: 0.875rem;">Construction</div>
        <div style="font-size: 0.75rem; opacity: 0.6; margin-top: 4px;">120 roles</div>
      </label>
      
      <label class="industry-card">
        <input type="checkbox" value="healthcare">
        <div style="font-size: 2rem; margin-bottom: 8px;">🏥</div>
        <div style="font-weight: 600; font-size: 0.875rem;">Healthcare</div>
        <div style="font-size: 0.75rem; opacity: 0.6; margin-top: 4px;">85 roles</div>
      </label>
      
      <label class="industry-card">
        <input type="checkbox" value="hospitality">
        <div style="font-size: 2rem; margin-bottom: 8px;">🍽️</div>
        <div style="font-weight: 600; font-size: 0.875rem;">Hospitality</div>
        <div style="font-size: 0.75rem; opacity: 0.6; margin-top: 4px;">60 roles</div>
      </label>
      
      <label class="industry-card">
        <input type="checkbox" value="automotive">
        <div style="font-size: 2rem; margin-bottom: 8px;">🚗</div>
        <div style="font-weight: 600; font-size: 0.875rem;">Automotive</div>
        <div style="font-size: 0.75rem; opacity: 0.6; margin-top: 4px;">45 roles</div>
      </label>
      
      <label class="industry-card">
        <input type="checkbox" value="it">
        <div style="font-size: 2rem; margin-bottom: 8px;">💻</div>
        <div style="font-weight: 600; font-size: 0.875rem;">IT & Tech</div>
        <div style="font-size: 0.75rem; opacity: 0.6; margin-top: 4px;">35 roles</div>
      </label>
      
      <label class="industry-card">
        <input type="checkbox" value="electrotechnology">
        <div style="font-size: 2rem; margin-bottom: 8px;">⚡</div>
        <div style="font-weight: 600; font-size: 0.875rem;">Electrical</div>
        <div style="font-size: 0.75rem; opacity: 0.6; margin-top: 4px;">55 roles</div>
      </label>
      
      <label class="industry-card">
        <input type="checkbox" value="hairdressing">
        <div style="font-size: 2rem; margin-bottom: 8px;">✂️</div>
        <div style="font-weight: 600; font-size: 0.875rem;">Hairdressing</div>
        <div style="font-size: 0.75rem; opacity: 0.6; margin-top: 4px;">25 roles</div>
      </label>
      
      <label class="industry-card">
        <input type="checkbox" value="agriculture">
        <div style="font-size: 2rem; margin-bottom: 8px;">🌾</div>
        <div style="font-weight: 600; font-size: 0.875rem;">Agriculture</div>
        <div style="font-size: 0.75rem; opacity: 0.6; margin-top: 4px;">30 roles</div>
      </label>
      
      <label class="industry-card">
        <input type="checkbox" value="childcare">
        <div style="font-size: 2rem; margin-bottom: 8px;">👶</div>
        <div style="font-weight: 600; font-size: 0.875rem;">Childcare</div>
        <div style="font-size: 0.75rem; opacity: 0.6; margin-top: 4px;">40 roles</div>
      </label>
      
      <!-- See more industries -->
      <button class="industry-card" style="border-style: dashed; color: var(--primary);">
        <div style="font-size: 2rem; margin-bottom: 8px;">+</div>
        <div style="font-weight: 600; font-size: 0.875rem;">See all industries</div>
      </button>
    </div>
    
    <style>
      .industry-card:has(input:checked) {
        background: var(--accent);
        border-color: var(--primary);
        box-shadow: 0 2px 8px var(--elevate-1);
      }
    </style>
    
    <button class="btn-primary" style="width: 100%; margin-top: 24px;">
      Next
    </button>
  </div>
  
</div>
```

*Question 2: Location*

```html
<div class="question-card">
  <h2>Where do you want to work?</h2>
  <p style="font-size: 0.875rem; opacity: 0.7; margin-bottom: 24px;">
    Find opportunities near you or in areas you're willing to relocate to
  </p>
  
  <label for="location">Location</label>
  <input 
    type="text" 
    id="location" 
    class="input" 
    placeholder="Suburb, town or postcode"
  />
  
  <button class="btn-secondary" style="width: 100%; margin-top: 16px;">
    📍 Use my location
  </button>
  
  <div style="margin-top: 16px;">
    <label style="display: flex; align-items: center; font-size: 0.875rem;">
      <input type="checkbox" style="margin-right: 8px;">
      I'm open to relocating for the right opportunity
    </label>
  </div>
  
  <button class="btn-primary" style="width: 100%; margin-top: 24px;">
    Show opportunities
  </button>
</div>
```

**Step 3: Opportunity Results**

```html
<div class="results-page" style="max-width: 1200px; margin: 0 auto; padding: 32px 16px;">
  
  <!-- Filters -->
  <div class="filters-bar" style="background: var(--accent); padding: 16px; border-radius: var(--radius-lg); margin-bottom: 24px; display: flex; flex-wrap: wrap; gap: 12px; align-items: center;">
    
    <span style="font-weight: 600; font-size: 0.875rem;">Filters:</span>
    
    <select class="input" style="flex: 1; min-width: 150px; padding: 8px 12px; height: 40px;">
      <option>All industries</option>
      <option>Construction</option>
      <option>Healthcare</option>
      <option>Hospitality</option>
    </select>
    
    <select class="input" style="flex: 1; min-width: 150px; padding: 8px 12px; height: 40px;">
      <option>All locations</option>
      <option>Within 20km</option>
      <option>Within 50km</option>
      <option>Anywhere in Victoria</option>
    </select>
    
    <select class="input" style="flex: 1; min-width: 150px; padding: 8px 12px; height: 40px;">
      <option>All opportunities</option>
      <option>Apprenticeships</option>
      <option>Traineeships</option>
      <option>Pre-apprenticeships</option>
    </select>
    
    <button class="btn-secondary" style="padding: 8px 16px; height: 40px;">
      Clear filters
    </button>
  </div>
  
  <!-- Results Header -->
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
    <div>
      <h1 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 4px;">
        Apprenticeship & Traineeship Opportunities
      </h1>
      <p style="font-size: 0.875rem; opacity: 0.7;">
        Found 87 opportunities in Construction near Geelong
      </p>
    </div>
    
    <select class="input" style="width: 200px; padding: 8px 12px; height: 40px;">
      <option>Sort: Best match</option>
      <option>Sort: Newest first</option>
      <option>Sort: Highest wage</option>
      <option>Sort: Closest</option>
    </select>
  </div>
  
  <!-- Featured Opportunity -->
  <div class="opportunity-card featured" style="background: linear-gradient(135deg, var(--primary) 0%, #004a94 100%); color: var(--background); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px; position: relative; overflow: hidden;">
    
    <div style="position: absolute; top: 16px; right: 16px; background: rgb(245, 158, 11); color: white; padding: 6px 12px; border-radius: 9999px; font-size: 0.75rem; font-weight: 700;">
      ⭐ FEATURED
    </div>
    
    <div style="display: flex; gap: 16px; align-items: start;">
      <div style="width: 60px; height: 60px; background: var(--background); border-radius: var(--radius-md); flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--primary);">
        Logo
      </div>
      
      <div style="flex: 1;">
        <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 4px;">
          Carpenter Apprenticeship
        </h3>
        <p style="font-size: 1rem; opacity: 0.9; margin-bottom: 16px;">
          ABC Building Group | Geelong
        </p>
        
        <div style="display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 16px;">
          <div>
            <div style="font-size: 0.75rem; opacity: 0.8;">WAGE (YEAR 1)</div>
            <div style="font-size: 1.25rem; font-weight: 700;">$28,000 - $32,000</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; opacity: 0.8;">DURATION</div>
            <div style="font-size: 1.25rem; font-weight: 700;">4 years</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; opacity: 0.8;">TRAINING</div>
            <div style="font-size: 1.25rem; font-weight: 700;">Cert III Carpentry</div>
          </div>
        </div>
        
        <p style="font-size: 0.875rem; opacity: 0.9; line-height: 1.6; margin-bottom: 16px;">
          Join our team and learn from experienced tradespeople. We provide tools, PPE, and ongoing support throughout your apprenticeship. Opportunities for permanent employment upon completion.
        </p>
        
        <div style="display: flex; gap: 12px;">
          <button class="btn-primary" style="background: var(--background); color: var(--primary);">
            View details
          </button>
          <button class="btn-secondary" style="background: rgba(255,255,255,0.2); color: var(--background); border-color: var(--background);">
            ♡ Save
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Regular Opportunity Cards -->
  <div class="opportunities-grid" style="display: grid; gap: 16px;">
    
    <div class="opportunity-card" style="background: var(--background); border: 1px solid var(--secondary); border-radius: var(--radius-lg); padding: 20px; transition: all 0.15s;">
      
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
        <div style="flex: 1;">
          <h3 style="font-size: 1.125rem; font-weight: 700; color: var(--foreground); margin-bottom: 4px;">
            Plumbing Apprenticeship
          </h3>
          <p style="font-size: 0.875rem; color: var(--foreground); opacity: 0.7;">
            XYZ Plumbing Services | Torquay
          </p>
        </div>
        <button class="btn-secondary" style="padding: 6px 12px; height: fit-content;">
          ♡ Save
        </button>
      </div>
      
      <div style="display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 16px;">
        <div style="flex: 1; min-width: 120px;">
          <div style="font-size: 0.75rem; color: var(--foreground); opacity: 0.6; margin-bottom: 4px;">WAGE (YEAR 1)</div>
          <div style="font-weight: 600; color: var(--foreground);">$30,000 - $35,000</div>
        </div>
        <div style="flex: 1; min-width: 120px;">
          <div style="font-size: 0.75rem; opacity: 0.6; margin-bottom: 4px;">DURATION</div>
          <div style="font-weight: 600;">4 years</div>
        </div>
        <div style="flex: 1; min-width: 120px;">
          <div style="font-size: 0.75rem; opacity: 0.6; margin-bottom: 4px;">DISTANCE</div>
          <div style="font-weight: 600;">18km from you</div>
        </div>
      </div>
      
      <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;">
        <span style="background: var(--accent); padding: 6px 12px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;">
          Full-time
        </span>
        <span style="background: var(--accent); padding: 6px 12px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;">
          Cert III Plumbing
        </span>
        <span style="background: rgba(34, 197, 94, 0.1); color: rgb(34, 197, 94); padding: 6px 12px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;">
          Accepting applications
        </span>
      </div>
      
      <p style="font-size: 0.875rem; color: var(--foreground); opacity: 0.8; line-height: 1.6; margin-bottom: 16px;">
        Hands-on training in all aspects of plumbing including residential, commercial, and industrial work. Tools and equipment provided.
      </p>
      
      <div style="display: flex; gap: 12px;">
        <button class="btn-primary" style="flex: 1;">View details</button>
        <button class="btn-secondary" style="flex: 1;">Apply now</button>
      </div>
    </div>
    
    <!-- More opportunity cards following same structure -->
    
  </div>
  
  <!-- Pagination -->
  <div style="display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 32px;">
    <button class="btn-secondary" disabled style="opacity: 0.5;">Previous</button>
    <button class="btn-primary" style="min-width: 44px;">1</button>
    <button class="btn-secondary" style="min-width: 44px;">2</button>
    <button class="btn-secondary" style="min-width: 44px;">3</button>
    <span style="padding: 0 8px;">...</span>
    <button class="btn-secondary" style="min-width: 44px;">10</button>
    <button class="btn-secondary">Next</button>
  </div>
  
</div>
```

**Opportunity Detail Page**

```html
<div class="opportunity-detail-page" style="max-width: 900px; margin: 0 auto; padding: 32px 16px;">
  
  <button class="btn-secondary" style="margin-bottom: 24px;">
    ← Back to opportunities
  </button>
  
  <!-- Employer Header -->
  <div style="display: flex; gap: 24px; align-items: start; margin-bottom: 32px;">
    <div style="width: 100px; height: 100px; background: var(--accent); border-radius: var(--radius-lg); flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
      <span style="font-size: 2rem; font-weight: 700; color: var(--primary);">ABC</span>
    </div>
    
    <div style="flex: 1;">
      <div style="display: inline-block; background: rgb(34, 197, 94); color: white; padding: 4px 12px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; margin-bottom: 8px;">
        ✓ CURRENTLY HIRING
      </div>
      
      <h1 style="font-size: 2rem; font-weight: 700; color: var(--foreground); margin-bottom: 8px;">
        Carpenter Apprenticeship
      </h1>
      
      <p style="font-size: 1.125rem; color: var(--foreground); opacity: 0.7; margin-bottom: 16px;">
        ABC Building Group | Geelong, VIC
      </p>
      
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button class="btn-primary">Apply now</button>
        <button class="btn-secondary">♡ Save</button>
        <button class="btn-secondary">📤 Share</button>
      </div>
    </div>
  </div>
  
  <!-- Key Details -->
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px;">
    
    <div class="info-card" style="background: var(--accent); padding: 20px; border-radius: var(--radius-lg);">
      <div style="font-size: 0.75rem; font-weight: 600; color: var(--foreground); opacity: 0.6; margin-bottom: 8px;">WAGE (YEAR 1)</div>
      <div style="font-size: 1.5rem; font-weight: 700; color: var(--foreground);">$28,000 - $32,000</div>
      <div style="font-size: 0.875rem; color: var(--foreground); opacity: 0.7; margin-top: 4px;">Increases each year</div>
    </div>
    
    <div class="info-card" style="background: var(--accent); padding: 20px; border-radius: var(--radius-lg);">
      <div style="font-size: 0.75rem; font-weight: 600; opacity: 0.6; margin-bottom: 8px;">DURATION</div>
      <div style="font-size: 1.5rem; font-weight: 700;">4 years</div>
      <div style="font-size: 0.875rem; opacity: 0.7; margin-top: 4px;">Full-time</div>
    </div>
    
    <div class="info-card" style="background: var(--accent); padding: 20px; border-radius: var(--radius-lg);">
      <div style="font-size: 0.75rem; font-weight: 600; opacity: 0.6; margin-bottom: 8px;">QUALIFICATION</div>
      <div style="font-size: 1.5rem; font-weight: 700;">Cert III</div>
      <div style="font-size: 0.875rem; opacity: 0.7; margin-top: 4px;">Carpentry</div>
    </div>
    
    <div class="info-card" style="background: var(--accent); padding: 20px; border-radius: var(--radius-lg);">
      <div style="font-size: 0.75rem; font-weight: 600; opacity: 0.6; margin-bottom: 8px;">LOCATION</div>
      <div style="font-size: 1.5rem; font-weight: 700;">Geelong</div>
      <div style="font-size: 0.875rem; opacity: 0.7; margin-top: 4px;">12km from you</div>
    </div>
  </div>
  
  <!-- About the Opportunity -->
  <div class="content-section" style="background: var(--background); border: 1px solid var(--secondary); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--foreground); margin-bottom: 16px;">About This Opportunity</h2>
    <p style="font-size: 1rem; color: var(--foreground); line-height: 1.6; margin-bottom: 16px;">
      ABC Building Group is a leading residential and commercial builder in Geelong with over 20 years of experience. We're looking for motivated young people to join our team as carpenter apprentices.
    </p>
    <p style="font-size: 1rem; color: var(--foreground); line-height: 1.6; margin-bottom: 16px;">
      You'll work alongside experienced tradespeople on a variety of projects, learning all aspects of carpentry from formwork and framing to finishing work. We'll support you through your training and provide a clear pathway to becoming a qualified carpenter.
    </p>
    <p style="font-size: 1rem; color: var(--foreground); line-height: 1.6;">
      Upon completion, there are opportunities for permanent employment and career progression within our company.
    </p>
  </div>
  
  <!-- What You'll Learn -->
  <div class="content-section" style="border: 1px solid var(--secondary); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 16px;">What You'll Learn</h2>
    
    <div style="display: grid; gap: 16px;">
      <div style="display: flex; gap: 12px;">
        <div style="width: 32px; height: 32px; background: var(--primary); border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">✓</div>
        <div>
          <h3 style="font-weight: 600; margin-bottom: 4px;">Reading plans and specifications</h3>
          <p style="font-size: 0.875rem; opacity: 0.7;">Interpret building plans and technical drawings</p>
        </div>
      </div>
      
      <div style="display: flex; gap: 12px;">
        <div style="width: 32px; height: 32px; background: var(--primary); border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">✓</div>
        <div>
          <h3 style="font-weight: 600; margin-bottom: 4px;">Formwork and concrete</h3>
          <p style="font-size: 0.875rem; opacity: 0.7;">Build and install formwork for concrete structures</p>
        </div>
      </div>
      
      <div style="display: flex; gap: 12px;">
        <div style="width: 32px; height: 32px; background: var(--primary); border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">✓</div>
        <div>
          <h3 style="font-weight: 600; margin-bottom: 4px;">Framing and structural work</h3>
          <p style="font-size: 0.875rem; opacity: 0.7;">Construct wall frames, roof trusses, and floors</p>
        </div>
      </div>
      
      <div style="display: flex; gap: 12px;">
        <div style="width: 32px; height: 32px; background: var(--primary); border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">✓</div>
        <div>
          <h3 style="font-weight: 600; margin-bottom: 4px;">Finishing and fit-out</h3>
          <p style="font-size: 0.875rem; opacity: 0.7;">Install fixtures, fittings, and decorative elements</p>
        </div>
      </div>
      
      <div style="display: flex; gap: 12px;">
        <div style="width: 32px; height: 32px; background: var(--primary); border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">✓</div>
        <div>
          <h3 style="font-weight: 600; margin-bottom: 4px;">Safety and compliance</h3>
          <p style="font-size: 0.875rem; opacity: 0.7;">Work safely and meet building codes</p>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Support Provided -->
  <div class="content-section" style="border: 1px solid var(--secondary); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 16px;">Support We Provide</h2>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
      <div style="padding: 16px; background: var(--accent); border-radius: var(--radius-md);">
        <div style="font-weight: 600; margin-bottom: 8px;">🛠️ Tools & Equipment</div>
        <p style="font-size: 0.875rem; opacity: 0.7;">We provide all tools, PPE, and equipment</p>
      </div>
      
      <div style="padding: 16px; background: var(--accent); border-radius: var(--radius-md);">
        <div style="font-weight: 600; margin-bottom: 8px;">👔 Uniforms</div>
        <p style="font-size: 0.875rem; opacity: 0.7;">Work clothing and safety gear provided</p>
      </div>
      
      <div style="padding: 16px; background: var(--accent); border-radius: var(--radius-md);">
        <div style="font-weight: 600; margin-bottom: 8px;">📚 Training Support</div>
        <p style="font-size: 0.875rem; opacity: 0.7;">Time off for TAFE and study support</p>
      </div>
      
      <div style="padding: 16px; background: var(--accent); border-radius: var(--radius-md);">
        <div style="font-weight: 600; margin-bottom: 8px;">👨‍🏫 Mentorship</div>
        <p style="font-size: 0.875rem; opacity: 0.7;">Work with experienced tradies</p>
      </div>
    </div>
  </div>
  
  <!-- Requirements -->
  <div class="content-section" style="border: 1px solid var(--secondary); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 16px;">Requirements</h2>
    
    <ul style="padding-left: 24px; line-height: 1.8;">
      <li style="margin-bottom: 8px;">Currently in Year 10-12 or recently completed school</li>
      <li style="margin-bottom: 8px;">Physically fit and able to work outdoors</li>
      <li style="margin-bottom: 8px;">Reliable and punctual</li>
      <li style="margin-bottom: 8px;">Driver's licence preferred but not essential</li>
      <li style="margin-bottom: 8px;">Willingness to learn and take direction</li>
      <li>Interest in construction and working with your hands</li>
    </ul>
  </div>
  
  <!-- Wage Progression -->
  <div class="content-section" style="background: rgba(0, 56, 112, 0.05); border: 2px solid var(--primary); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 16px;">Wage Progression</h2>
    
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="border-bottom: 2px solid var(--secondary);">
          <th style="padding: 12px; text-align: left; font-weight: 600;">Year</th>
          <th style="padding: 12px; text-align: right; font-weight: 600;">Annual Wage</th>
          <th style="padding: 12px; text-align: right; font-weight: 600;">Weekly (approx)</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid var(--secondary);">
          <td style="padding: 12px;">Year 1</td>
          <td style="padding: 12px; text-align: right; font-weight: 600;">$28,000 - $32,000</td>
          <td style="padding: 12px; text-align: right;">$540 - $615</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--secondary);">
          <td style="padding: 12px;">Year 2</td>
          <td style="padding: 12px; text-align: right; font-weight: 600;">$32,000 - $38,000</td>
          <td style="padding: 12px; text-align: right;">$615 - $730</td>
        </tr>
        <tr style="border-bottom: 1px solid var(--secondary);">
          <td style="padding: 12px;">Year 3</td>
          <td style="padding: 12px; text-align: right; font-weight: 600;">$38,000 - $48,000</td>
          <td style="padding: 12px; text-align: right;">$730 - $920</td>
        </tr>
        <tr>
          <td style="padding: 12px;">Year 4</td>
          <td style="padding: 12px; text-align: right; font-weight: 600;">$48,000 - $60,000</td>
          <td style="padding: 12px; text-align: right;">$920 - $1,150</td>
        </tr>
      </tbody>
    </table>
    
    <p style="font-size: 0.875rem; color: var(--foreground); opacity: 0.7; margin-top: 16px; font-style: italic;">
      Qualified carpenter wages typically range from $70,000 - $85,000+ per year
    </p>
  </div>
  
  <!-- Training Details -->
  <div class="content-section" style="border: 1px solid var(--secondary); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 16px;">Training Details</h2>
    
    <div style="display: grid; gap: 16px;">
      <div>
        <h3 style="font-weight: 600; margin-bottom: 8px;">Qualification</h3>
        <p style="font-size: 0.875rem; opacity: 0.7;">Certificate III in Carpentry (CPC30220)</p>
      </div>
      
      <div>
        <h3 style="font-weight: 600; margin-bottom: 8px;">Training Provider</h3>
        <p style="font-size: 0.875rem; opacity: 0.7;">Gordon TAFE, Geelong</p>
      </div>
      
      <div>
        <h3 style="font-weight: 600; margin-bottom: 8px;">Time Commitment</h3>
        <p style="font-size: 0.875rem; opacity: 0.7;">1 day per week at TAFE, 4 days on site</p>
      </div>
      
      <div>
        <h3 style="font-weight: 600; margin-bottom: 8px;">Cost</h3>
        <p style="font-size: 0.875rem; opacity: 0.7;">Free TAFE course (government subsidised)</p>
      </div>
    </div>
  </div>
  
  <!-- How to Apply -->
  <div class="content-section" style="background: var(--accent); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 16px;">How to Apply</h2>
    
    <ol style="padding-left: 24px; line-height: 1.8;">
      <li style="margin-bottom: 12px;">Click "Apply now" below to submit your expression of interest</li>
      <li style="margin-bottom: 12px;">Attach your resume (or we can help you create one)</li>
      <li style="margin-bottom: 12px;">We'll contact you within 5 business days</li>
      <li style="margin-bottom: 12px;">Attend an informal interview and site visit</li>
      <li>If successful, we'll help you enrol at TAFE and get started</li>
    </ol>
    
    <p style="font-size: 0.875rem; opacity: 0.7; margin-top: 16px; font-style: italic;">
      Applications close: 31 March 2025 | Start date: April 2025
    </p>
  </div>
  
  <!-- Action Buttons -->
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
    <button class="btn-primary" style="padding: 16px;">
      Apply now
    </button>
    <button class="btn-secondary" style="padding: 16px;">
      Contact employer
    </button>
  </div>
  
</div>
```

### Data Structure for Opportunities

```javascript
const apprenticeshipOpportunity = {
  id: "abc-carpenter-001",
  title: "Carpenter Apprenticeship",
  employer: {
    name: "ABC Building Group",
    logo: "/logos/abc-building.png",
    website: "https://abcbuilding.com.au",
    size: "50-100 employees",
    yearsInBusiness: 20,
    location: {
      suburb: "Geelong",
      state: "VIC",
      postcode: "3220",
      coordinates: { lat: -38.1499, lng: 144.3617 }
    }
  },
  
  type: "apprenticeship", // apprenticeship | traineeship | pre-apprenticeship
  industry: "construction",
  trade: "carpentry",
  
  details: {
    duration: "4 years",
    wageYear1: { min: 28000, max: 32000 },
    wageYear2: { min: 32000, max: 38000 },
    wageYear3: { min: 38000, max: 48000 },
    wageYear4: { min: 48000, max: 60000 },
    qualifiedWage: { min: 70000, max: 85000 },
    
    qualification: {
      name: "Certificate III in Carpentry",
      code: "CPC30220",
      provider: "Gordon TAFE",
      providerLocation: "Geelong",
      schedule: "1 day per week at TAFE, 4 days on site",
      cost: "Free (government subsidised)"
    },
    
    workSchedule: "Full-time",
    
    supportProvided: [
      "Tools and equipment",
      "PPE and uniforms",
      "Training support and time off for TAFE",
      "Mentorship from experienced tradies"
    ],
    
    requirements: [
      "Currently in Year 10-12 or recently completed",
      "Physically fit",
      "Reliable and punctual",
      "Driver's licence preferred (not essential)",
      "Willingness to learn"
    ],
    
    applicationDeadline: "2025-03-31",
    startDate: "2025-04-01",
    status: "accepting", // accepting | closing-soon | closed
    
    featured: true
  },
  
  lastUpdated: "2025-01-02"
};
```

---

## 4. APP 3: PEER MENTAL HEALTH SUPPORT GROUP FINDER {#app-3}

### Purpose
Help young people find peer support groups for mental health, substance use, grief, LGBTIQ+, CALD communities. Privacy-first design with detailed filtering and no login required.

### User Flow

**Step 1: Welcome Screen**

```html
<div class="welcome-screen" style="max-width: 600px; margin: 0 auto; padding: 48px 16px; text-align: center;">
  <div style="width: 80px; height: 80px; background: var(--primary); border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2">
      <circle cx="9" cy="7" r="4"/>
      <circle cx="17" cy="11" r="3"/>
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
      <path d="M16 18v-1a3 3 0 0 1 3-3h1"/>
    </svg>
  </div>
  
  <h1 style="font-size: 2.25rem; font-weight: 700; color: var(--foreground); margin-bottom: 16px; line-height: 1.2;">
    Find Peer Support Groups
  </h1>
  
  <p style="font-size: 1.125rem; color: var(--foreground); opacity: 0.8; margin-bottom: 32px; line-height: 1.5;">
    Connect with others who understand what you're going through. All groups are peer-led and confidential.
  </p>
  
  <button class="btn-primary" style="width: 100%; max-width: 300px; margin-bottom: 24px;">
    Find groups near me
  </button>
  
  <!-- Privacy Notice -->
  <div style="background: rgba(0, 56, 112, 0.05); padding: 16px; border-radius: var(--radius-md); border-left: 4px solid var(--primary); text-align: left;">
    <div style="font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 1.25rem;">🔒</span>
      <span>Your privacy matters</span>
    </div>
    <p style="font-size: 0.875rem; color: var(--foreground); opacity: 0.7; line-height: 1.6;">
      No account or login required. Your searches are private and not stored. Group attendance is confidential.
    </p>
  </div>
</div>
```

**Step 2: Search & Filter**

```html
<div class="search-page" style="max-width: 1200px; margin: 0 auto; padding: 32px 16px;">
  
  <!-- Search Header -->
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="font-size: 2rem; font-weight: 700; margin-bottom: 8px;">Find Your Support Group</h1>
    <p style="font-size: 1rem; opacity: 0.7;">Filter by what matters to you</p>
  </div>
  
  <!-- Filters -->
  <div class="filters-section" style="background: var(--accent); padding: 24px; border-radius: var(--radius-lg); margin-bottom: 32px;">
    
    <!-- Location Filter -->
    <div style="margin-bottom: 24px;">
      <label style="display: block; font-weight: 600; margin-bottom: 8px;">📍 Location</label>
      <div style="display: grid; grid-template-columns: 1fr auto; gap: 12px;">
        <input 
          type="text" 
          class="input" 
          placeholder="Suburb, town or postcode"
        />
        <button class="btn-secondary">Use my location</button>
      </div>
      
      <div style="margin-top: 12px;">
        <label style="display: block; font-weight: 500; font-size: 0.875rem; margin-bottom: 8px;">Distance</label>
        <select class="input">
          <option>Within 10km</option>
          <option>Within 25km</option>
          <option>Within 50km</option>
          <option>Anywhere in Victoria</option>
          <option>Online groups only</option>
        </select>
      </div>
    </div>
    
    <!-- Topic Filter -->
    <div style="margin-bottom: 24px;">
      <label style="display: block; font-weight: 600; margin-bottom: 8px;">💭 What are you looking for support with?</label>
      <p style="font-size: 0.875rem; opacity: 0.7; margin-bottom: 12px;">Select all that apply</p>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px;">
        <label class="checkbox-card" style="padding: 12px; display: flex; align-items: center;">
          <input type="checkbox" value="anxiety" style="margin-right: 8px;">
          <span style="font-size: 0.875rem;">Anxiety</span>
        </label>
        
        <label class="checkbox-card" style="padding: 12px;">
          <input type="checkbox" value="depression">
          <span style="font-size: 0.875rem;">Depression</span>
        </label>
        
        <label class="checkbox-card" style="padding: 12px;">
          <input type="checkbox" value="trauma">
          <span style="font-size: 0.875rem;">Trauma & PTSD</span>
        </label>
        
        <label class="checkbox-card" style="padding: 12px;">
          <input type="checkbox" value="grief">
          <span style="font-size: 0.875rem;">Grief & loss</span>
        </label>
        
        <label class="checkbox-card" style="padding: 12px;">
          <input type="checkbox" value="substance">
          <span style="font-size: 0.875rem;">Substance use</span>
        </label>
        
        <label class="checkbox-card" style="padding: 12px;">
          <input type="checkbox" value="eating">
          <span style="font-size: 0.875rem;">Eating difficulties</span>
        </label>
        
        <label class="checkbox-card" style="padding: 12px;">
          <input type="checkbox" value="ocd">
          <span style="font-size: 0.875rem;">OCD</span>
        </label>
        
        <label class="checkbox-card" style="padding: 12px;">
          <input type="checkbox" value="bipolar">
          <span style="font-size: 0.875rem;">Bipolar</span>
        </label>
        
        <label class="checkbox-card" style="padding: 12px;">
          <input type="checkbox" value="general">
          <span style="font-size: 0.875rem;">General mental health</span>
        </label>
      </div>
    </div>
    
    <!-- Identity/Community Filter -->
    <div style="margin-bottom: 24px;">
      <label style="display: block; font-weight: 600; margin-bottom: 8px;">🌈 Community</label>
      <p style="font-size: 0.875rem; opacity: 0.7; margin-bottom: 12px;">Optional: Find groups for specific communities</p>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px;">
        <label class="checkbox-card" style="padding: 12px;">
          <input type="checkbox" value="lgbtiq">
          <span style="font-size: 0.875rem;">LGBTIQ+</span>
        </label>
        
        <label class="checkbox-card" style="padding: 12px;">
          <input type="checkbox" value="women">
          <span style="font-size: 0.875rem;">Women only</span>
        </label>
        
        <label class="checkbox-card" style="padding: 12px;">
          <input type="checkbox" value="men">
          <span style="font-size: 0.875rem;">Men only</span>
        </label>
        
        <label class="checkbox-card" style="padding: 12px;">
          <input type="checkbox" value="young-parents">
          <span style="font-size: 0.875rem;">Young parents</span>
        </label>
        
        <label class="checkbox-card" style="padding: 12px;">
          <input type="checkbox" value="cald">
          <span style="font-size: 0.875rem;">Culturally diverse</span>
        </label>
        
        <label class="checkbox-card" style="padding: 12px;">
          <input type="checkbox" value="aboriginal">
          <span style="font-size: 0.875rem;">Aboriginal & Torres Strait Islander</span>
        </label>
      </div>
    </div>
    
    <!-- Format Filter -->
    <div style="margin-bottom: 24px;">
      <label style="display: block; font-weight: 600; margin-bottom: 8px;">📱 Format</label>
      
      <div style="display: flex; gap: 8px;">
        <label class="checkbox-card" style="padding: 12px; flex: 1;">
          <input type="checkbox" value="face-to-face">
          <span style="font-size: 0.875rem;">Face-to-face</span>
        </label>
        
        <label class="checkbox-card" style="padding: 12px; flex: 1;">
          <input type="checkbox" value="online">
          <span style="font-size: 0.875rem;">Online (video)</span>
        </label>
        
        <label class="checkbox-card" style="padding: 12px; flex: 1;">
          <input type="checkbox" value="hybrid">
          <span style="font-size: 0.875rem;">Hybrid</span>
        </label>
      </div>
    </div>
    
    <!-- Day/Time Filter -->
    <div>
      <label style="display: block; font-weight: 600; margin-bottom: 8px;">🕐 When can you attend?</label>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div>
          <label style="display: block; font-size: 0.875rem; margin-bottom: 4px;">Day</label>
          <select class="input">
            <option>Any day</option>
            <option>Weekdays</option>
            <option>Weekends</option>
            <option>Monday</option>
            <option>Tuesday</option>
            <option>Wednesday</option>
            <option>Thursday</option>
            <option>Friday</option>
            <option>Saturday</option>
            <option>Sunday</option>
          </select>
        </div>
        
        <div>
          <label style="display: block; font-size: 0.875rem; margin-bottom: 4px;">Time</label>
          <select class="input">
            <option>Any time</option>
            <option>Morning (before 12pm)</option>
            <option>Afternoon (12pm-5pm)</option>
            <option>Evening (after 5pm)</option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- Action Buttons -->
    <div style="display: grid; grid-template-columns: 1fr auto; gap: 12px; margin-top: 24px;">
      <button class="btn-primary">Find groups</button>
      <button class="btn-secondary">Clear all filters</button>
    </div>
  </div>
  
  <!-- Results -->
  <div class="results-section">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 4px;">Support Groups Near You</h2>
        <p style="font-size: 0.875rem; opacity: 0.7;">Found 12 groups matching your filters</p>
      </div>
      
      <select class="input" style="width: 200px;">
        <option>Sort: Closest first</option>
        <option>Sort: Soonest meeting</option>
        <option>Sort: Best match</option>
      </select>
    </div>
    
    <!-- Group Cards -->
    <div style="display: grid; gap: 16px;">
      
      <!-- Group Card -->
      <div class="group-card" style="background: var(--background); border: 1px solid var(--secondary); border-radius: var(--radius-lg); padding: 20px; transition: all 0.15s;">
        
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
          <div style="flex: 1;">
            <h3 style="font-size: 1.125rem; font-weight: 700; color: var(--foreground); margin-bottom: 4px;">
              Young Adults Anxiety Support Group
            </h3>
            <p style="font-size: 0.875rem; color: var(--foreground); opacity: 0.7;">
              Facilitated by Beyond Blue
            </p>
          </div>
          <button class="btn-secondary" style="padding: 6px 12px; height: fit-content;">
            ♡ Save
          </button>
        </div>
        
        <!-- Key Info -->
        <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 6px; font-size: 0.875rem;">
            <span style="opacity: 0.7;">📍</span>
            <span style="font-weight: 500;">Geelong (8km)</span>
          </div>
          
          <div style="display: flex; align-items: center; gap: 6px; font-size: 0.875rem;">
            <span style="opacity: 0.7;">🕐</span>
            <span style="font-weight: 500;">Thursdays, 6:00pm</span>
          </div>
          
          <div style="display: flex; align-items: center; gap: 6px; font-size: 0.875rem;">
            <span style="opacity: 0.7;">👥</span>
            <span style="font-weight: 500;">18-30 years</span>
          </div>
          
          <div style="display: flex; align-items: center; gap: 6px; font-size: 0.875rem;">
            <span style="opacity: 0.7;">📱</span>
            <span style="font-weight: 500;">Face-to-face</span>
          </div>
        </div>
        
        <!-- Tags -->
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;">
          <span style="background: var(--accent); padding: 6px 12px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;">
            Anxiety
          </span>
          <span style="background: var(--accent); padding: 6px 12px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;">
            Peer-led
          </span>
          <span style="background: rgba(34, 197, 94, 0.1); color: rgb(34, 197, 94); padding: 6px 12px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;">
            Free
          </span>
        </div>
        
        <!-- Description -->
        <p style="font-size: 0.875rem; color: var(--foreground); opacity: 0.8; line-height: 1.6; margin-bottom: 16px;">
          A safe, confidential space for young adults experiencing anxiety. Share experiences, learn coping strategies, and connect with others who understand. Facilitated by trained peer workers.
        </p>
        
        <!-- Next Meeting -->
        <div style="background: rgba(0, 56, 112, 0.05); padding: 12px; border-radius: var(--radius-sm); margin-bottom: 16px;">
          <div style="font-weight: 600; font-size: 0.875rem; margin-bottom: 4px;">Next meeting</div>
          <div style="font-size: 0.875rem; opacity: 0.7;">Thursday, 9 January 2025 at 6:00pm</div>
        </div>
        
        <!-- Actions -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <button class="btn-primary">View details</button>
          <button class="btn-secondary">Get contact info</button>
        </div>
      </div>
      
      <!-- More group cards following same structure -->
      
    </div>
  </div>
  
</div>
```

**Group Detail Page**

```html
<div class="group-detail-page" style="max-width: 900px; margin: 0 auto; padding: 32px 16px;">
  
  <button class="btn-secondary" style="margin-bottom: 24px;">
    ← Back to results
  </button>
  
  <!-- Group Header -->
  <div style="margin-bottom: 32px;">
    <div style="display: inline-block; background: rgb(34, 197, 94); color: white; padding: 4px 12px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; margin-bottom: 8px;">
      ✓ CURRENTLY MEETING
    </div>
    
    <h1 style="font-size: 2rem; font-weight: 700; color: var(--foreground); margin-bottom: 8px;">
      Young Adults Anxiety Support Group
    </h1>
    
    <p style="font-size: 1rem; color: var(--foreground); opacity: 0.7; margin-bottom: 16px;">
      Facilitated by Beyond Blue
    </p>
    
    <button class="btn-secondary" style="padding: 8px 16px;">
      ♡ Save this group
    </button>
  </div>
  
  <!-- Key Information -->
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px;">
    
    <div class="info-card" style="background: var(--accent); padding: 20px; border-radius: var(--radius-lg);">
      <div style="font-size: 0.75rem; font-weight: 600; opacity: 0.6; margin-bottom: 8px;">WHEN</div>
      <div style="font-size: 1.125rem; font-weight: 700;">Thursdays, 6:00pm</div>
      <div style="font-size: 0.875rem; opacity: 0.7; margin-top: 4px;">Weekly meetings</div>
    </div>
    
    <div class="info-card" style="background: var(--accent); padding: 20px; border-radius: var(--radius-lg);">
      <div style="font-size: 0.75rem; font-weight: 600; opacity: 0.6; margin-bottom: 8px;">WHERE</div>
      <div style="font-size: 1.125rem; font-weight: 700;">Geelong</div>
      <div style="font-size: 0.875rem; opacity: 0.7; margin-top: 4px;">8km from you</div>
    </div>
    
    <div class="info-card" style="background: var(--accent); padding: 20px; border-radius: var(--radius-lg);">
      <div style="font-size: 0.75rem; font-weight: 600; opacity: 0.6; margin-bottom: 8px;">AGE RANGE</div>
      <div style="font-size: 1.125rem; font-weight: 700;">18-30 years</div>
      <div style="font-size: 0.875rem; opacity: 0.7; margin-top: 4px;">Young adults</div>
    </div>
    
    <div class="info-card" style="background: var(--accent); padding: 20px; border-radius: var(--radius-lg);">
      <div style="font-size: 0.75rem; font-weight: 600; opacity: 0.6; margin-bottom: 8px;">COST</div>
      <div style="font-size: 1.125rem; font-weight: 700; color: rgb(34, 197, 94);">Free</div>
      <div style="font-size: 0.875rem; opacity: 0.7; margin-top: 4px;">No cost to attend</div>
    </div>
  </div>
  
  <!-- About This Group -->
  <div class="content-section" style="background: var(--background); border: 1px solid var(--secondary); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 16px;">About This Group</h2>
    <p style="font-size: 1rem; line-height: 1.6; margin-bottom: 16px;">
      A safe, confidential space for young adults (18-30) experiencing anxiety. This peer support group provides an opportunity to share experiences, learn coping strategies, and connect with others who truly understand what you're going through.
    </p>
    <p style="font-size: 1rem; line-height: 1.6;">
      The group is facilitated by trained peer workers with lived experience of anxiety. We follow group guidelines to ensure everyone feels safe, respected, and supported.
    </p>
  </div>
  
  <!-- What to Expect -->
  <div class="content-section" style="border: 1px solid var(--secondary); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 16px;">What to Expect</h2>
    
    <div style="display: grid; gap: 16px;">
      <div style="display: flex; gap: 12px;">
        <div style="width: 32px; height: 32px; background: var(--primary); border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">✓</div>
        <div>
          <h3 style="font-weight: 600; margin-bottom: 4px;">Confidential & safe</h3>
          <p style="font-size: 0.875rem; opacity: 0.7;">What's shared in the group stays in the group</p>
        </div>
      </div>
      
      <div style="display: flex; gap: 12px;">
        <div style="width: 32px; height: 32px; background: var(--primary); border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">✓</div>
        <div>
          <h3 style="font-weight: 600; margin-bottom: 4px;">Peer-led facilitation</h3>
          <p style="font-size: 0.875rem; opacity: 0.7;">Facilitated by people with lived experience</p>
        </div>
      </div>
      
      <div style="display: flex; gap: 12px;">
        <div style="width: 32px; height: 32px; background: var(--primary); border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">✓</div>
        <div>
          <h3 style="font-weight: 600; margin-bottom: 4px;">No pressure to share</h3>
          <p style="font-size: 0.875rem; opacity: 0.7;">You can listen or participate, whatever feels right</p>
        </div>
      </div>
      
      <div style="display: flex; gap: 12px;">
        <div style="width: 32px; height: 32px; background: var(--primary); border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">✓</div>
        <div>
          <h3 style="font-weight: 600; margin-bottom: 4px;">Practical strategies</h3>
          <p style="font-size: 0.875rem; opacity: 0.7;">Learn coping techniques that actually work</p>
        </div>
      </div>
      
      <div style="display: flex; gap: 12px;">
        <div style="width: 32px; height: 32px; background: var(--primary); border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">✓</div>
        <div>
          <h3 style="font-weight: 600; margin-bottom: 4px;">Connection & community</h3>
          <p style="font-size: 0.875rem; opacity: 0.7;">Meet others who get it and build friendships</p>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Meeting Schedule -->
  <div class="content-section" style="border: 1px solid var(--secondary); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 16px;">Meeting Schedule</h2>
    
    <div style="margin-bottom: 16px;">
      <h3 style="font-weight: 600; margin-bottom: 8px;">Regular meetings</h3>
      <p style="font-size: 0.875rem; opacity: 0.7;">Every Thursday at 6:00pm - 7:30pm</p>
    </div>
    
    <div style="background: rgba(0, 56, 112, 0.05); padding: 16px; border-radius: var(--radius-md); margin-bottom: 16px;">
      <h3 style="font-weight: 600; margin-bottom: 8px;">Upcoming meetings</h3>
      <ul style="list-style: none; padding: 0; font-size: 0.875rem;">
        <li style="padding: 8px 0; border-bottom: 1px solid var(--secondary);">Thursday, 9 January 2025 - 6:00pm</li>
        <li style="padding: 8px 0; border-bottom: 1px solid var(--secondary);">Thursday, 16 January 2025 - 6:00pm</li>
        <li style="padding: 8px 0; border-bottom: 1px solid var(--secondary);">Thursday, 23 January 2025 - 6:00pm</li>
        <li style="padding: 8px 0;">Thursday, 30 January 2025 - 6:00pm</li>
      </ul>
    </div>
    
    <p style="font-size: 0.875rem; opacity: 0.7; font-style: italic;">
      Drop in anytime, no need to attend every week. Come when it works for you.
    </p>
  </div>
  
  <!-- Location & Access -->
  <div class="content-section" style="border: 1px solid var(--secondary); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 16px;">Location & Access</h2>
    
    <div style="margin-bottom: 16px;">
      <h3 style="font-weight: 600; margin-bottom: 8px;">Where we meet</h3>
      <p style="font-size: 0.875rem; opacity: 0.7; margin-bottom: 4px;">Geelong Community Health Centre</p>
      <p style="font-size: 0.875rem; opacity: 0.7;">45 McKillop Street, Geelong VIC 3220</p>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 16px;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 1.5rem;">♿</span>
        <span>Wheelchair accessible</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 1.5rem;">🅿️</span>
        <span>Free parking</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 1.5rem;">🚌</span>
        <span>Bus stop nearby</span>
      </div>
    </div>
    
    <button class="btn-secondary" style="width: 100%;">
      🗺️ Get directions
    </button>
  </div>
  
  <!-- How to Join -->
  <div class="content-section" style="background: rgba(0, 56, 112, 0.05); border: 2px solid var(--primary); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 16px;">How to Join</h2>
    
    <ol style="padding-left: 24px; line-height: 1.8; font-size: 1rem;">
      <li style="margin-bottom: 12px;">Call or email us to express your interest (contact details below)</li>
      <li style="margin-bottom: 12px;">We'll answer any questions you have about the group</li>
      <li style="margin-bottom: 12px;">Come along to your first meeting (no booking required)</li>
      <li>Just show up, we'll make you feel welcome</li>
    </ol>
    
    <div style="margin-top: 24px; padding: 16px; background: var(--background); border-radius: var(--radius-md);">
      <h3 style="font-weight: 600; margin-bottom: 8px;">First time coming?</h3>
      <p style="font-size: 0.875rem; line-height: 1.6;">
        It's normal to feel nervous! Arrive a few minutes early and let the facilitator know it's your first time. They'll introduce you to the group and make sure you feel comfortable.
      </p>
    </div>
  </div>
  
  <!-- Contact Information -->
  <div class="content-section" style="background: var(--primary); color: var(--background); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 16px;">Contact</h2>
    
    <div style="display: grid; gap: 16px;">
      <div>
        <div style="font-size: 0.75rem; opacity: 0.8; margin-bottom: 4px;">PHONE</div>
        <a href="tel:1300224636" style="color: var(--background); font-weight: 600; font-size: 1.125rem;">1300 22 4636</a>
      </div>
      
      <div>
        <div style="font-size: 0.75rem; opacity: 0.8; margin-bottom: 4px;">EMAIL</div>
        <a href="mailto:peersupport@beyondblue.org.au" style="color: var(--background); font-weight: 600;">peersupport@beyondblue.org.au</a>
      </div>
      
      <div>
        <div style="font-size: 0.75rem; opacity: 0.8; margin-bottom: 4px;">WEBSITE</div>
        <a href="https://beyondblue.org.au" style="color: var(--background); font-weight: 600;">beyondblue.org.au</a>
      </div>
    </div>
    
    <div style="margin-top: 16px; display: flex; gap: 12px;">
      <button class="btn-secondary" style="flex: 1; background: var(--background); color: var(--primary);">
        📱 Call now
      </button>
      <button class="btn-secondary" style="flex: 1; background: var(--background); color: var(--primary);">
        ✉️ Send email
      </button>
    </div>
  </div>
  
  <!-- Action Buttons -->
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
    <button class="btn-primary">♡ Save this group</button>
    <button class="btn-secondary">📤 Share</button>
  </div>
  
</div>
```

### Data Structure for Support Groups

```javascript
const supportGroup = {
  id: "beyond-blue-anxiety-geelong",
  name: "Young Adults Anxiety Support Group",
  organiser: {
    name: "Beyond Blue",
    website: "https://beyondblue.org.au",
    phone: "1300224636",
    email: "peersupport@beyondblue.org.au"
  },
  
  type: "peer-support", // peer-support | facilitated | self-help
  topics: ["anxiety", "stress", "general-mental-health"],
  
  details: {
    ageRange: { min: 18, max: 30 },
    format: "face-to-face", // face-to-face | online | hybrid
    cost: "free", // free | gold-coin | paid
    
    schedule: {
      frequency: "weekly",
      dayOfWeek: "thursday",
      time: "18:00",
      duration: "90 minutes"
    },
    
    location: {
      venue: "Geelong Community Health Centre",
      address: "45 McKillop Street, Geelong VIC 3220",
      coordinates: { lat: -38.1499, lng: 144.3617 },
      accessibility: {
        wheelchairAccessible: true,
        parking: true,
        publicTransport: true
      }
    },
    
    facilitation: {
      type: "peer-led",
      description: "Facilitated by trained peer workers with lived experience"
    },
    
    communitySpecific: null, // can be: lgbtiq | women-only | men-only | young-parents | cald | aboriginal
    
    requiresRegistration: false,
    openToNewMembers: true,
    dropInWelcome: true
  },
  
  lastUpdated: "2025-01-02"
};
```

---

## 5. SHARED TECHNICAL INFRASTRUCTURE {#shared-infrastructure}

### Technology Stack Recommendation

**Frontend**
- Framework: React 18+ with TypeScript
- Styling: Tailwind CSS (configured with smalltalk.community colour scheme)
- State Management: React Context API + React Query for server state
- Form Handling: React Hook Form
- Routing: React Router v6
- Build Tool: Vite

**Backend**
- Runtime: Node.js 18+ with Express
- Database: PostgreSQL 14+
- ORM: Prisma
- API: RESTful with consideration for GraphQL future migration
- File Storage: AWS S3 or similar for images/documents
- Email: SendGrid or AWS SES

**Hosting & Infrastructure**
- Frontend: Vercel or Netlify (automatic deployment from Git)
- Backend: AWS EC2, Digital Ocean, or similar
- Database: AWS RDS or managed PostgreSQL
- CDN: Cloudflare

**Development Tools**
- Version Control: Git + GitHub
- CI/CD: GitHub Actions
- Testing: Jest + React Testing Library
- Linting: ESLint + Prettier
- Documentation: Storybook for component library

### Shared Components Library

Create a shared component library to ensure consistency across all three apps:

```typescript
// components/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'destructive';
  size: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant,
  size,
  children,
  onClick,
  disabled,
  fullWidth
}) => {
  const baseStyles = "font-sans font-medium rounded-md transition-all duration-150";
  
  const variantStyles = {
    primary: "bg-primary text-background border border-button-outline hover:shadow-elevate-1 active:shadow-elevate-2",
    secondary: "bg-secondary text-foreground border border-button-outline hover:bg-accent hover:shadow-elevate-1",
    destructive: "bg-destructive text-background border border-button-outline hover:shadow-elevate-1"
  };
  
  const sizeStyles = {
    sm: "px-3 py-2 text-sm min-h-[36px]",
    md: "px-6 py-3 text-base min-h-[44px]",
    lg: "px-8 py-4 text-lg min-h-[52px]"
  };
  
  return (
    <button
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
```

```typescript
// components/Card.tsx
interface CardProps {
  children: React.ReactNode;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  hover = false,
  padding = 'md'
}) => {
  const paddingStyles = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  };
  
  return (
    <div className={`
      bg-background
      border border-secondary
      rounded-lg
      ${paddingStyles[padding]}
      transition-all duration-150
      ${hover ? 'hover:border-primary hover:shadow-elevate-1' : ''}
    `}>
      {children}
    </div>
  );
};
```

```typescript
// components/Input.tsx
interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  error?: string;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  type = "text",
  placeholder,
  value,
  onChange,
  label,
  error,
  required
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`
          w-full
          bg-background
          border
          ${error ? 'border-destructive' : 'border-secondary'}
          rounded-md
          px-4 py-3
          font-sans text-base
          text-foreground
          min-h-[48px]
          transition-all duration-150
          hover:border-primary
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        `}
      />
      {error && (
        <p className="text-destructive text-sm mt-1">{error}</p>
      )}
    </div>
  );
};
```

---

## 6. DATA MODELS & DATABASE SCHEMA {#data-models}

### Mental Health Service Navigator Schema

```sql
-- Services table
CREATE TABLE mental_health_services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(100) NOT NULL, -- youth, crisis, CAMHS, etc.
  status VARCHAR(50) NOT NULL DEFAULT 'accepting', -- accepting, waitlist, closed
  
  -- Contact information
  phone VARCHAR(20),
  email VARCHAR(255),
  website TEXT,
  address_street VARCHAR(255),
  address_suburb VARCHAR(100),
  address_state VARCHAR(10),
  address_postcode VARCHAR(10),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Service details
  age_min INTEGER,
  age_max INTEGER,
  wait_time VARCHAR(100),
  cost VARCHAR(50), -- free, partial, paid
  bulk_billed BOOLEAN DEFAULT false,
  referral_required BOOLEAN DEFAULT false,
  formats JSONB, -- array of formats: face-to-face, telehealth, online
  
  -- Specialisations
  specialisations JSONB, -- array of issues supported
  cultural_support JSONB,
  lgbtiq_friendly BOOLEAN DEFAULT false,
  
  -- Accessibility
  wheelchair_accessible BOOLEAN,
  parking_available BOOLEAN,
  public_transport_nearby BOOLEAN,
  interpreter_services BOOLEAN,
  
  -- Opening hours
  opening_hours JSONB,
  
  -- Content
  description TEXT,
  services_offered JSONB,
  what_to_expect TEXT,
  how_to_access TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_verified DATE
);

-- Service reviews/testimonials
CREATE TABLE service_reviews (
  id SERIAL PRIMARY KEY,
  service_id INTEGER REFERENCES mental_health_services(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  approved BOOLEAN DEFAULT false
);

-- Create indexes
CREATE INDEX idx_services_location ON mental_health_services(latitude, longitude);
CREATE INDEX idx_services_specialisations ON mental_health_services USING GIN(specialisations);
CREATE INDEX idx_services_status ON mental_health_services(status);
```

### Apprenticeship Hub Schema

```sql
-- Employers table
CREATE TABLE employers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  logo_url TEXT,
  website TEXT,
  size VARCHAR(50), -- small, medium, large
  years_in_business INTEGER,
  
  address_suburb VARCHAR(100),
  address_state VARCHAR(10),
  address_postcode VARCHAR(10),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  description TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Opportunities table
CREATE TABLE opportunities (
  id SERIAL PRIMARY KEY,
  employer_id INTEGER REFERENCES employers(id),
  
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL, -- apprenticeship, traineeship, pre-apprenticeship
  industry VARCHAR(100) NOT NULL,
  trade VARCHAR(100),
  
  duration VARCHAR(50), -- 3 years, 4 years, etc.
  work_schedule VARCHAR(50), -- full-time, part-time
  
  -- Wages
  wage_year_1_min INTEGER,
  wage_year_1_max INTEGER,
  wage_year_2_min INTEGER,
  wage_year_2_max INTEGER,
  wage_year_3_min INTEGER,
  wage_year_3_max INTEGER,
  wage_year_4_min INTEGER,
  wage_year_4_max INTEGER,
  qualified_wage_min INTEGER,
  qualified_wage_max INTEGER,
  
  -- Qualification
  qualification_name VARCHAR(255),
  qualification_code VARCHAR(50),
  training_provider VARCHAR(255),
  training_location VARCHAR(255),
  training_schedule VARCHAR(255),
  training_cost VARCHAR(100),
  
  -- Support
  support_provided JSONB,
  requirements JSONB,
  
  -- Content
  description TEXT,
  what_you_learn JSONB,
  
  -- Application
  application_deadline DATE,
  start_date DATE,
  status VARCHAR(50) DEFAULT 'accepting', -- accepting, closing-soon, closed
  
  featured BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_opportunities_industry ON opportunities(industry);
CREATE INDEX idx_opportunities_type ON opportunities(type);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_employer ON opportunities(employer_id);
```

### Peer Support Finder Schema

```sql
-- Support groups table
CREATE TABLE support_groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  
  organiser_name VARCHAR(255) NOT NULL,
  organiser_website TEXT,
  organiser_phone VARCHAR(20),
  organiser_email VARCHAR(255),
  
  type VARCHAR(50) NOT NULL, -- peer-support, facilitated, self-help
  topics JSONB NOT NULL, -- array of topics
  
  age_min INTEGER,
  age_max INTEGER,
  
  format VARCHAR(50) NOT NULL, -- face-to-face, online, hybrid
  cost VARCHAR(50) DEFAULT 'free',
  
  -- Schedule
  frequency VARCHAR(50), -- weekly, fortnightly, monthly
  day_of_week VARCHAR(20),
  meeting_time TIME,
  duration_minutes INTEGER,
  
  -- Location (null if online only)
  venue_name VARCHAR(255),
  address_street VARCHAR(255),
  address_suburb VARCHAR(100),
  address_state VARCHAR(10),
  address_postcode VARCHAR(10),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Accessibility
  wheelchair_accessible BOOLEAN,
  parking_available BOOLEAN,
  public_transport_nearby BOOLEAN,
  
  -- Facilitation
  facilitation_type VARCHAR(100),
  facilitation_description TEXT,
  
  -- Community specific (optional)
  community_specific VARCHAR(100), -- lgbtiq, women-only, men-only, young-parents, cald, aboriginal
  
  requires_registration BOOLEAN DEFAULT false,
  open_to_new_members BOOLEAN DEFAULT true,
  drop_in_welcome BOOLEAN DEFAULT true,
  
  -- Content
  description TEXT,
  what_to_expect TEXT,
  how_to_join TEXT,
  
  -- Metadata
  status VARCHAR(50) DEFAULT 'active', -- active, paused, closed
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_verified DATE
);

-- Create indexes
CREATE INDEX idx_groups_location ON support_groups(latitude, longitude);
CREATE INDEX idx_groups_topics ON support_groups USING GIN(topics);
CREATE INDEX idx_groups_format ON support_groups(format);
CREATE INDEX idx_groups_status ON support_groups(status);
```

---

## 7. API SPECIFICATIONS {#api-specifications}

### Mental Health Service Navigator API

```typescript
// GET /api/mental-health/services
// Query parameters: age, location, issues, urgency, preferences
interface ServiceSearchParams {
  age?: number;
  latitude?: number;
  longitude?: number;
  issues?: string[]; // anxiety, depression, etc.
  urgency?: 'crisis' | 'urgent' | 'standard' | 'ongoing';
  bulkBilledOnly?: boolean;
  formats?: string[]; // face-to-face, telehealth, online
  lgbtiq?: boolean;
  maxDistance?: number; // in km
}

interface ServiceSearchResponse {
  services: MentalHealthService[];
  total: number;
  matchScores?: { [serviceId: string]: number };
}

// GET /api/mental-health/services/:slug
interface ServiceDetailResponse {
  service: MentalHealthService;
  similarServices?: MentalHealthService[];
}

// POST /api/mental-health/feedback
interface FeedbackPayload {
  serviceId: number;
  rating: number; // 1-5
  reviewText?: string;
  anonymous: boolean;
}
```

### Apprenticeship Hub API

```typescript
// GET /api/apprenticeships/opportunities
interface OpportunitySearchParams {
  industries?: string[];
  latitude?: number;
  longitude?: number;
  maxDistance?: number;
  type?: 'apprenticeship' | 'traineeship' | 'pre-apprenticeship';
  minWage?: number;
  sortBy?: 'best-match' | 'newest' | 'highest-wage' | 'closest';
}

interface OpportunitySearchResponse {
  opportunities: Opportunity[];
  total: number;
  filters: {
    industries: { name: string; count: number }[];
    types: { type: string; count: number }[];
  };
}

// GET /api/apprenticeships/opportunities/:slug
interface OpportunityDetailResponse {
  opportunity: Opportunity;
  employer: Employer;
  similarOpportunities?: Opportunity[];
}

// POST /api/apprenticeships/apply
interface ApplicationPayload {
  opportunityId: number;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  resumeUrl?: string;
  coverLetter?: string;
}
```

### Peer Support Finder API

```typescript
// GET /api/peer-support/groups
interface GroupSearchParams {
  latitude?: number;
  longitude?: number;
  topics?: string[];
  format?: 'face-to-face' | 'online' | 'hybrid';
  dayOfWeek?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
  communitySpecific?: string;
  maxDistance?: number;
}

interface GroupSearchResponse {
  groups: SupportGroup[];
  total: number;
}

// GET /api/peer-support/groups/:slug
interface GroupDetailResponse {
  group: SupportGroup;
  upcomingMeetings: Date[];
}
```

---

## 8. SECURITY & PRIVACY REQUIREMENTS {#security}

### Privacy-First Design Principles

**No User Accounts Required**
- All three apps must function without requiring user registration or login
- Users can search, browse, and access information anonymously
- Optional save functionality using browser localStorage (cleared on user request)

**Data Collection Minimisation**
- Collect only essential data needed for functionality
- No tracking of individual user journeys
- Analytics aggregated and anonymised

**Sensitive Information Handling**
- Mental health service searches: No logging of search terms or results viewed
- Support group lookups: No recording of which groups users view
- Contact information: Encrypted in transit, not logged

### Security Measures

**API Security**
- Rate limiting on all endpoints (100 requests per hour per IP)
- Input validation and sanitisation on all user inputs
- SQL injection prevention via parameterised queries
- XSS prevention via content security policy
- HTTPS only, no mixed content

**Data Protection**
- Database encryption at rest
- Regular backups with point-in-time recovery
- Access logs for administrative actions
- Role-based access control for admin panel

**GDPR/Privacy Compliance**
- Privacy policy clearly displayed
- Cookie consent banner
- Right to data deletion (for any saved preferences)
- Data retention policies (analytics deleted after 90 days)

---

## 9. TESTING REQUIREMENTS {#testing}

### Testing Strategy

**Unit Tests**
- All utility functions
- Component logic
- API endpoint handlers
- Data validation functions
- Target: 80% code coverage

**Integration Tests**
- API endpoint flows
- Database queries
- Third-party service integrations
- Search and filtering functionality

**End-to-End Tests**
- Complete user journeys for each app
- Form submissions
- Search and results display
- Mobile responsiveness

**Accessibility Tests**
- WCAG 2.1 AA compliance
- Screen reader compatibility
- Keyboard navigation
- Colour contrast
- Focus management

**Performance Tests**
- Page load times (target < 3s on 3G)
- API response times (target < 500ms)
- Database query optimisation
- Image loading and optimisation

### Test Cases for Each App

**Mental Health Navigator**
1. Search with basic criteria returns relevant results
2. Crisis urgency displays crisis services prominently
3. Age filtering correctly excludes services outside age range
4. Location search shows services within specified distance
5. Service detail page displays all information correctly
6. Contact information is accessible and functional
7. Accessibility features work correctly

**Apprenticeship Hub**
8. Industry filtering returns correct opportunities
9. Wage sorting displays opportunities in correct order
10. Distance calculation accurate within 5%
11. Application form validates all required fields
12. Opportunity detail shows wage progression correctly
13. Employer information links correctly

**Peer Support Finder**
14. Topic filtering returns groups matching criteria
15. Format filter (online/face-to-face) works correctly
16. Day/time filtering returns groups meeting on specified times
17. Privacy notice displayed prominently
18. Group detail shows upcoming meetings
19. Contact information secured and accessible

---

## 10. DEPLOYMENT INSTRUCTIONS {#deployment}

### Environment Setup

```bash
# Clone repository
git clone https://github.com/smalltalk-community/mental-health-apps.git
cd mental-health-apps

# Install dependencies
npm install

# Create environment variables file
cp .env.example .env

# Configure environment variables
DATABASE_URL=postgresql://user:password@localhost:5432/smalltalk_db
API_URL=https://api.smalltalk.community
FRONTEND_URL=https://smalltalk.community
SECRET_KEY=your-secret-key-here
```

### Database Setup

```bash
# Run migrations
npx prisma migrate deploy

# Seed initial data
npm run seed:mental-health-services
npm run seed:apprenticeships
npm run seed:support-groups
```

### Build & Deploy

```bash
# Build frontend
npm run build

# Test build locally
npm run preview

# Deploy to production
# (Automated via GitHub Actions on push to main branch)
```

### Monitoring & Maintenance

**Health Checks**
- Endpoint: /api/health
- Check database connectivity
- Check external service availability
- Return 200 OK if all systems operational

**Logging**
- Application logs: Structured JSON format
- Error tracking: Sentry or similar
- Performance monitoring: New Relic or similar

**Backup Strategy**
- Database backups: Daily automated backups
- Retention: 30 days of daily backups, 12 months of monthly backups
- Test restore procedure monthly

**Update Schedule**
- Service information: Weekly verification by admin
- Security patches: Applied within 48 hours
- Feature updates: Monthly release cycle
- Dependency updates: Quarterly review

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Foundation (Weeks 1-2)
- [ ] Set up development environment
- [ ] Create design system and component library
- [ ] Implement shared components (Button, Card, Input, etc.)
- [ ] Set up database schema and migrations
- [ ] Create API structure and base endpoints
- [ ] Implement authentication/authorization for admin panel

### Phase 2: Mental Health Navigator (Weeks 3-5)
- [ ] Build intake form with progressive disclosure
- [ ] Implement matching algorithm
- [ ] Create results page with filtering
- [ ] Build service detail pages
- [ ] Add crisis support always-visible section
- [ ] Implement search functionality
- [ ] Test accessibility and mobile responsiveness

### Phase 3: Apprenticeship Hub (Weeks 6-8)
- [ ] Build industry selection interface
- [ ] Create opportunity listing page
- [ ] Implement filtering and sorting
- [ ] Build opportunity detail pages
- [ ] Add wage calculator tool
- [ ] Create employer profiles
- [ ] Implement application system

### Phase 4: Peer Support Finder (Weeks 9-11)
- [ ] Build search and filter interface
- [ ] Create group listing page
- [ ] Implement location-based search
- [ ] Build group detail pages
- [ ] Add meeting schedule display
- [ ] Implement privacy-first features
- [ ] Test data protection measures

### Phase 5: Integration & Testing (Weeks 12-13)
- [ ] Integrate all apps into smalltalk.community
- [ ] Implement shared navigation
- [ ] Cross-app testing
- [ ] Performance optimisation
- [ ] Accessibility audit
- [ ] Security review
- [ ] User acceptance testing

### Phase 6: Launch & Monitoring (Week 14)
- [ ] Deploy to production
- [ ] Monitor error rates and performance
- [ ] Gather initial user feedback
- [ ] Address critical bugs
- [ ] Document for future maintenance

---

## SUCCESS METRICS

**Mental Health Service Navigator**
- Number of searches performed
- Services viewed per session
- Contact information accessed
- User feedback ratings
- Time to find appropriate service

**Apprenticeship Hub**
- Number of opportunities viewed
- Applications submitted
- Wage calculator usage
- Employer profile views
- Conversion rate (view to apply)

**Peer Support Finder**
- Number of group searches
- Groups viewed per session
- Contact information accessed
- Format preference distribution
- Geographic distribution of searches

---

## MAINTENANCE & UPDATES

**Content Updates**
- Mental health services: Verify contact details and wait times monthly
- Apprenticeships: Update opportunities weekly, remove closed listings
- Support groups: Verify meeting schedules monthly, confirm group still active

**Feature Requests**
- Collect via feedback forms in each app
- Prioritise based on user impact and technical feasibility
- Review quarterly for implementation planning

**Bug Reports**
- Critical bugs: Fix within 24 hours
- High priority: Fix within 1 week
- Medium/low priority: Batch fix monthly

---

This specification provides everything needed for an AI agent to implement the three apps with consistency, quality, and integration into the smalltalk.community platform. All design decisions are justified, implementation details are provided, and the exact colour scheme and styling from your platform is maintained throughout.