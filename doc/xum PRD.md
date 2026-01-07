

Xum ai
DATA COLLECTION AND LABELLING APP
 
1. Introduction
Purpose of this Document
This Product Requirements Document (PRD) defines the scope, features, architecture, timelines, and delivery phases for XUM AI, a global data collection, labeling, and human-feedback platform used to train AI systems.
This document is designed to:
•	Align expectations between stakeholders
•	Clearly define Phase 1 (MVP) vs later phases
•	Prevent scope creep and ambiguity
•	Serve as the single source of truth for product development
Once this document is approved and the initial payment is made, development will commence.
________________________________________
2. Product Overview
Product Description
XUM AI is a multi-sided data platform that enables:
•	Individuals to earn money by completing data tasks
•	Companies to collect high-quality labeled datasets
•	Admin dashboard to ensure features are regulated
Core Value Proposition
•	Distributed human intelligence at global scale
•	Strong focus on local languages, culture, and reasoning
•	Built-in quality control and incentives
•	Enterprise-ready datasets and APIs
Target Users
1.	Contributors (Mobile App Users)
o	Data creators
o	Labelers
o	Validators
o	RLHF judges
2.	Companies / Clients (Web Dashboard)
o	AI startups
o	Research institutions
o	Enterprises
3.	Platform Admins (Internal Dashboard)
o	Operations
o	Quality control
o	Fraud & safety
________________________________________
3. Platforms & Architecture
Platforms
XUM AI consists of three platforms powered by a single backend API:
1.	User Platform – Mobile App (Android first)
2.	Company Platform – Web Dashboard (SaaS-style)
3.	Admin Platform – Internal Operations Dashboard
Backend Architecture
•	Single unified backend API
•	Role-based access control (RBAC)
•	Cloud storage for data assets
•	Modular services for tasks, payments, quality, and datasets
________________________________________
4. User Flows
Flow 1: User Wants to Earn Money
1.	Open app
2.	Land on Task Feed
3.	Select task
4.	Read instructions
5.	Complete task (label / record / judge)
6.	Submit → AI + validators check
7.	Earn money
8.	Withdraw to bank / mobile money / crypto
________________________________________
Flow 2: Company Wants Data
1.	Access Company Web Portal
2.	Create project or upload raw data
3.	Define requirements (language, accuracy, pay)
4.	Launch job
5.	Platform distributes tasks globally
6.	Receive clean datasets
7.	Pay and manage subscriptions
8.	(Phase 3) Access data via API
________________________________________
5. Project Phases & Timeline
Total Duration: ~2 Months + 3 Days
Phase 1 – MVP (Working Prototype)
Duration: 1 Month
Goal: Deliver a functional end-to-end prototype demonstrating the core workflow.
Phase 1 Deliverables
•	Android mobile app (User platform)
•	Core backend services
•	Basic admin panel
•	End-to-end task → submission → earnings flow
________________________________________
6. Phase 1 – User Mobile App (Android)
Bottom Navigation (5 Tabs)
1.	Home (Tasks)
2.	Create (+)
3.	Earn (Wallet)
4.	Leaderboard (Community)
5.	Profile
________________________________________
6.1 Home – Tasks
•	Task feed (Voice, Text, Image, Validation, RLHF)
•	Task cards: reward, time, difficulty
•	XUM Judge (RLHF) – visible to qualified users only
________________________________________
6.2 Create (+) – Data Creation Hub
Create Sections
•	📸 Capture Data
•	🧠 XUM Linguasense (Local language grounding)
•	🎙 Voice & Media
XUM Linguasense Flow
•	Choose data type (Text / Voice / Both)
•	Receive structured prompt
•	Submit word, explanation, pronunciation
•	Community validation & consensus
________________________________________
6.3 Earn – Wallet
•	Balance overview
•	Earnings breakdown
•	Transaction history
•	Withdrawal requests
________________________________________
6.4 Leaderboard – Social Productivity Layer
•	Global top earners
•	Country rankings
•	Weekly challenges
•	Levels: Bronze → Elite
________________________________________
6.5 Profile – Work Identity
Displays:
•	Avatar & username
•	Country & languages
•	Accuracy score
•	Total tasks & earnings
•	Skills & badges
Settings:
•	Payment methods
•	Notifications
•	Languages
•	Two-factor authentication
________________________________________
7. Phase 2 – Backend Completion & Platform Expansion
Duration: 3 Weeks
Primary Goal
Strengthen infrastructure, scalability, and enterprise features.
Phase 2 Deliverables
Backend & Infrastructure
•	Hardened authentication
•	Scalable task management
•	Earnings & transaction ledger
•	Improved validation & scoring logic
Company Web Dashboard
Main Sections:
1.	Projects
2.	Task Design
3.	Budget & Payments
4.	Results & Downloads
5.	Analytics
________________________________________
Admin Platform (Phase 2 – Full)
Core Modules:
•	Workforce management
•	Task creation & batching
•	Submission review
•	Quality control
•	RLHF operations
•	Lexicon & language datasets
•	Fraud & safety
•	Payments & payouts
•	Audit logs & sessions
________________________________________
8. Phase 3 – Finalization & App Store Release
Duration: 1 Week + 3 Days
Phase 3 Activities
•	UI/UX polish
•	Performance tuning
•	Security checks
•	App store assets
•	Google Play & iOS deployment
•	Documentation & handover
(App store fees not included)
________________________________________
9. Payments & Commercials
Total Project Cost: ₦600,000
Payment Structure
•	50% upfront: ₦300,000
•	50% after Phase 2 completion: ₦300,000
(No development begins without upfront payment.)
________________________________________
10. Change Management
•	New features or major changes will:
o	Be reviewed
o	Re-estimated
o	Quoted separately
________________________________________
11. Communication & Workflow
•	Primary communication: WhatsApp
•	Weekly progress updates
•	Milestone-based reviews
________________________________________
12. Confirmation
By approving this PRD, all parties agree to:
•	Defined scope and phases
•	Timeline expectations
•	Payment structure
________________________________________
XUM AI
Human Intelligence Layer for AI Systems
 
Features Needed in this Project 

A. USER MOBILE APP (Android / iOS)
 
1.	Splash / Loading
2.	Onboarding / Welcome
3.	Signup / Login
4.	Skill & Language Selection
5.	Home – Task Feed
6.	Task Detail Page
7.	Task Execution Pages
o	Voice Recording
o	Text Input
o	Image Capture
o	Validation / RLHF
8.	Submission Success / Status
9.	Wallet Overview
10.	Withdrawal Page
11.	Profile Page
12.	Settings
13.	Leaderboard (Global / Country)
14.	Task History
15.	Earnings History
16.	Notifications
17.	Badges & Levels
18.	Accuracy Score Page
19.	Streaks & Challenges
20.	Referral Page
21.	Team / Group Tasks
22.	Offline Task Queue
23.	Appeals / Dispute Page
 

B. COMPANY WEB DASHBOARD (SaaS)
 
1.	Company Login / Signup
2.	Dashboard Overview
3.	Create Project
4.	Create Task
5.	Upload Raw Data
6.	Pricing & Budget Setup
7.	Task Monitoring Page
8.	Results Download Page
9.	Billing & Payments
10.	Analytics Dashboard
11.	Worker Filters (Country, Skill)
12.	Dataset Versions
13.	Export Formats
14.	Team Members / Roles
15.	API Management Page
16.	Webhooks
17.	SLA & Contracts
18.	Dataset Marketplace
19.	Subscription Management
 

C. ADMIN DASHBOARD (INTERNAL)
 
1.	Admin Login + 2FA
2.	Overview Dashboard
3.	Users Management
4.	Tasks Management
5.	Submissions Review
6.	Payments & Payout Queue
7.	Fraud Flags
8.	Audit Logs
9.	Validator Pool
10.	Quality Metrics
11.	RLHF Calibration
12.	Lexicon Management
13.	Dataset Builder
14.	Client Management
15.	Policy Engine
16.	Automated Bans
17.	Risk Scoring
18.	Region-Based Rules 
19.	Admin Session Control


2️⃣ FEATURES (ORDERED BY IMPORTANCE)
 
•	Authentication (users, companies, admins)
•	Role-based access control (RBAC)
•	Task creation & distribution
•	Data submission (voice/text/image/video)
•	Validation & consensus logic
•	Wallet & earnings calculation
•	Withdrawals
•	Storage & retrieval
•	Leaderboards
•	Profiles
⚡ PRODUCT DIFFERENTIATORS
•	XUM Linguasense
•	XUM Judge (RLHF)
•	Accuracy scoring
•	Badges & levels
•	Country/language targeting
•	Quality thresholds
•	Dataset packaging
•	Public API
•	Dataset marketplace
•	Subscription billing
•	Advanced analytics
•	Fraud detection
•	Enterprise SLAs
•	Compliance & audit trails
 
________________________________________

3️⃣ APIS
 
🔐 AUTH APIs
•	Register / Login
•	OAuth
•	Role assignment
•	Session management
👤 USER APIs
•	Profile
•	Skills & languages
•	Accuracy
•	History
📋 TASK APIs
•	Create task
•	Fetch tasks
•	Assign tasks
•	Update task status
📤 SUBMISSION APIs
•	Upload submission
•	Metadata storage
•	Validation results
⚖ VALIDATION & RLHF APIs
•	Consensus engine
•	Scoring
•	Gold checks
•	Rater agreement
💰 WALLET & PAYMENT APIs
•	Earnings calculation
•	Wallet balance
•	Withdrawal request
•	Payout processing
🏆 GAMIFICATION APIs
•	Leaderboards
•	Badges
•	Levels
•	Streaks
🏢 COMPANY APIs
•	Projects
•	Budget
•	Analytics
•	Downloads
🛠 ADMIN APIs
•	Moderation
•	Fraud
•	Manual overrides
•	Audit logs
🔌 EXTERNAL INTEGRATIONS
•	Payments (Stripe/Paystack)
•	Storage (S3/Supabase)
•	Notifications (FCM)
•	Analytics (GA/Mixpanel)
 
________________________________________

4️⃣ BACKEND INFRASTRUCTURE (MOST NEEDED)
 
🔥 ABSOLUTE MUST
•	Backend API (Node.js / Django / NestJS)
•	Relational DB (Postgres)
•	Object storage (audio/images/video)
•	Authentication service
•	Background workers (queues)
•	Logging & monitoring
•	Role-based permissions
•	Message queues (Redis / SQS)
•	CDN for media
•	Rate limiting
•	Backup & recovery
•	CI/CD pipeline
•	Microservices
•	Event-driven architecture
•	Feature flags
•	Fraud detection engine
•	Data warehouse
•	ML-assisted QC
 


