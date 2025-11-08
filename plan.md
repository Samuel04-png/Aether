## Phase 1 – Critical Performance & UX Stabilization
1. Dashboard / Tasks Query Optimization
   - Add query limits & ordering in `useDashboard`, `useTasks`, `useProjects`, `useLeads`
   - Introduce pagination helpers for long lists (tasks, leads) and ensure hooks expose paged loaders
   - Create indexes json (or update `FIRESTORE_INDEXES.md`) for new composite queries
2. Snapshot Caching Layer
   - Wrap dashboard KPI data in lightweight local cache (e.g. React Query or custom 2‑minute cache)
   - Use `onSnapshot` listeners combined with in-memory cache for real-time refresh without refetch storms
   - Add skeleton loaders and const components throughout dashboard/widgets
3. Branding & Loader Update
   - Replace all logo usages with new `Logo_lightmode_sidebar` / `Logo_darkmode_sidebar`, update loader spinner asset
4. Dummy Data Experience
   - Add first-login modal warning (probably in `App.tsx`) keyed off profile flag
   - Add “Remove Demo Data” action in Settings (calls new Firestore cleanup service)
5. Leads Quick Actions (foundation)
   - Inline lead card actions: research (stub), message (open modal), AI personalize (reuse gemini service)
   - Ensure basic edit/delete actions work

## Phase 2 – Core Feature Upgrades
1. Unified “Analytics & Insights” Page
   - Merge `SocialAnalytics` + Website audit into new tabbed layout
   - Tabs: Website, Social, Performance, Leads; each backed by Firestore data & export/share buttons
2. AI Enhancements
   - Extend AI service to accept structured commands (CRUD ops, data queries)
   - Human-tone responses with context (company profile, KPIs, tasks)
   - Add abstraction layer for AI to interact with Firestore securely
3. Team Management Overhaul
   - Implement role-based access control (Admin/Manager/Member/Viewer)
   - Team settings UI for role changes, removal, detailed member view
   - Update Firestore rules to respect roles
4. Messaging Integrations (Mocked 8x8 + Email)
   - Create integration settings cards for WhatsApp Business (mock) & Email
   - Build messaging modal that selects platform, template, schedule/send
   - Document steps for deploying real 8x8 automation (API keys, flows)

## Phase 3 – Advanced Automations & Monetization
1. Advanced Messaging Automations
   - Background job/orchestration for bulk sends, rate limiting per tier
   - Delivery tracking dashboard per platform
2. Subscription Management
   - Dedicated “Manage Subscription” modal/page with plan details, upsell, billing history
   - Hook into payment provider (mock or real) & update plan limits (messaging caps)
3. Custom Roles & Permissions
   - Allow creation of custom roles (Phase 3) with granular permissions
   - Update UI and Firestore rules to support dynamic roles
4. Additional Integrations
   - Instagram/Facebook messaging, CRM imports
   - Adaptive UI components per integration (e.g. channel-specific analytics)
5. Performance Monitoring & Telemetry
   - Collect and display key latency metrics (dashboard load, AI response time)
   - Alerting for slow queries / quota issues

## Deliverables & Docs
- Update `FIREBASE_INDEXES.md`, `FIREBASE_CONNECTION_VERIFICATION.md`, and new integration guides
- Provide 8x8 automation setup steps (tenant, flows, API user, callback URL)
- Migration scripts/documentation for new Firestore fields (roles, analytics data)

