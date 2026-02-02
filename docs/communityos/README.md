# CommunityOS V2: Technical Overview

CommunityOS V2 is a unified, offline-first operating system for non-profit organisations. It provides a suite of 21 applications built on a shared design system and a robust data synchronization layer.

## Architecture

CommunityOS follows a **Mobile-First PWA** architecture with a focus on high-performance operational tools.

### Key Components

- **App Launcher**: The central entry point for all 21 applications.
- **Tenant Provider**: Manages multi-tenant isolation and user roles.
- **Ditto Sync**: An offline-first data layer that synchronizes data in real-time between devices even without internet connectivity.
- **App Content Loader**: Dynamically loads specialized or generic app components based on the selected App ID.

## Application Tiers

Apps are categorised into four tiers based on their complexity:

1. **Tier 1 (Specialized)**: Bespoke implementations for complex workflows (e.g., CRM, Rostering, Workflow Automation, Impact Reporting).
2. **Tier 2 (Programs)**: Program-specific tools using the enhanced Generic App template with custom field configurations.
3. **Tier 3 (Governance)**: Compliance and governance tools.
4. **Tier 4 (Admin/Ops)**: Administrative and niche operational tools.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Vanilla CSS with a custom Design System
- **Database/Sync**: Ditto (Offline-first)
- **Persistence**: Supabase (Cloud Sync)
- **Moderation**: CommunityOS Content Moderation Pipeline
