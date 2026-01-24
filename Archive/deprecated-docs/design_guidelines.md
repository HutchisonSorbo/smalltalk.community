# Vicband Design Guidelines
### Musician Classifieds Platform for Victoria, Australia

## Design Approach
**Reference-Based:** Inspired by Craigslist's functional classifieds layout combined with modern platforms like BandMix, with additional influence from Airbnb's card aesthetics for listings and profiles.

**Key Principles:**
- Information-first hierarchy prioritizing musician details and listings
- Clear visual separation between musicians, marketplace, and user actions
- Accessible, high-contrast design that works in both light and dark modes
- Local community focus with Victoria-specific context

## Typography
**Font Family:** Inter (Google Fonts)
- Headings: 600-700 weight
- Body: 400 weight  
- Small text/labels: 500 weight
- Base size: 16px

**Hierarchy:**
- Page titles: 2.5rem (40px)
- Section headings: 1.75rem (28px)
- Card titles: 1.25rem (20px)
- Body text: 1rem (16px)
- Small text: 0.875rem (14px)

## Layout System
**Spacing Units:** Tailwind primitives of 2, 4, 6, 8, 12, 16 (e.g., p-4, m-8, gap-6)

**Grid Structure:**
- Main content: max-w-7xl container
- Listings grid: 1 column mobile, 2 columns tablet (md:), 3 columns desktop (lg:)
- Profile cards: Full-width mobile, 2-column md:, 3-column lg:
- Marketplace items: Same as profile cards
- Forms: Single column, max-w-md centered

**Responsive Breakpoints:**
- Mobile-first approach
- Tablet: md: (768px)
- Desktop: lg: (1024px)

## Component Library

**Navigation:**
- Fixed top navbar with logo, main navigation, and mode toggle
- Hamburger menu on mobile expanding to full-screen overlay
- User avatar/sign-in button on right
- Search bar integrated into header on desktop, separate on mobile

**Cards (Musician Profiles & Marketplace):**
- 8px border radius
- Shadow on light mode, subtle border on dark mode
- Image/avatar at top (16:9 ratio for marketplace, square for profiles)
- Title, key details, and CTA button
- Hover state: subtle lift effect (2px translateY)

**Filters Panel:**
- Sidebar on desktop (sticky), collapsible on mobile
- Checkboxes for multi-select (instruments, genres, item types)
- Location dropdown specific to Victoria regions
- Price range slider for marketplace
- Clear/apply buttons at bottom

**Authentication Forms:**
- Centered modal overlay with backdrop blur
- Social login buttons (Google, GitHub) with icons
- Email/password fields with show/hide toggle
- Clear error states with inline validation

**Profile Dashboard:**
- Split layout: sidebar navigation + main content area
- Quick stats cards at top (views, messages, active listings)
- Tabbed interface for "My Profile", "My Listings", "Messages"

**Marketplace Listings:**
- Large primary image with thumbnail gallery
- Pricing prominent (2rem, bold)
- Seller info card with avatar and contact button
- Description in markdown-style formatting
- Related items carousel at bottom

**Mode Toggle:**
- Sun/moon icon toggle in header
- Smooth 200ms transition on all background/text colors
- Detects system preference on first visit
- Persists user choice in localStorage

## Images
**Hero Section:**
- Large, engaging hero image (60vh height) showing Victoria musicians/venues
- Overlaid search bar with blurred background button
- Text: "Connect with Victoria's Music Community"

**Profile/Listing Images:**
- Musician profiles: Professional headshots or performance photos
- Marketplace: Product photos with white/neutral backgrounds
- Placeholder pattern for missing images (musical note icon)

**Placement:**
- Hero: Full-width at top of homepage
- Cards: Top of each card, consistent aspect ratios
- Profile detail: Larger featured image, gallery below

## Animations
Use sparingly:
- Card hover: Subtle lift (transform: translateY(-2px))
- Mode transition: 200ms ease on background/text
- Page transitions: None (instant navigation)
- Form validation: Shake on error (150ms)

## Accessibility
- Minimum contrast ratio 4.5:1 (WCAG AA)
- Focus indicators on all interactive elements (2px outline in accent color)
- Semantic HTML throughout
- Alt text for all images
- ARIA labels for icon-only buttons
- Keyboard navigation support