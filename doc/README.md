# XUM AI - Documentation Index
**Complete Project Documentation Hub**

---

## 📘 Welcome to XUM AI

XUM AI is a **cross-platform mobile-first AI training marketplace** that empowers individuals worldwide to earn money by completing micro-tasks (RLHF, image labeling, audio transcription, etc.) while helping enterprises manage global workforces for data annotation.

---

## 🗂️ Documentation Structure

### 📋 Product Documentation

#### 1. Product Requirements Document (PRD)
**File**: `xum PRD.md`  
**Status**: In Progress  
**Contents**:
- Product vision and mission
- Target users and personas
- Feature specifications
- Success metrics
- Launch timeline

**Read this if**: You need to understand the product vision and requirements

---

#### 2. Design System
**File**: `design.md`  
**Contents**:
- Visual design philosophy
- Color palettes (6 themes)
- Typography system
- Component specifications
- Animation guidelines
- Accessibility requirements

**Read this if**: You're implementing UI components or need design guidelines

---

#### 3. User Experience Flow
**File**: `ux-flow.md`  
**Contents**:
- First-time user journey (onboarding → task → payout)
- Daily active user flows
- Company user journey
- Admin moderation workflow
- Edge cases and error handling

**Read this if**: You need to understand user interactions and navigation patterns

---

#### 4. Application Structure
**File**: `app-structure.md`  
**Contents**:
- Project directory structure
- Component hierarchy
- State management
- Data models and types
- Navigation patterns
- API integration points

**Read this if**: You need to understand the technical architecture

---

#### 5. Backend Architecture
**File**: `backend-architecture.md`  
**Contents**:
- Database schema (7 core tables)
- API endpoints (REST)
- Business logic (stored procedures)
- Authentication & authorization (RLS)
- Security best practices
- Scaling strategies

**Read this if**: You're working on backend features or database design

---

### 🤖 Agent Prompts

**Directory**: `agents/`

#### 6. Frontend Development Agent
**File**: `agents/frontend-agent.md`  
**Use for**: Building React components, implementing UI/UX

#### 7. Backend Development Agent
**File**: `agents/backend-agent.md`  
**Use for**: Database design, API development

#### 8. Design & UX Agent
**File**: `agents/design-ux-agent.md`  
**Use for**: Visual design, user experience planning

#### 9. Testing & QA Agent
**File**: `agents/testing-qa-agent.md`  
**Use for**: Writing tests, quality assurance

#### 10. DevOps & Infrastructure Agent
**File**: `agents/devops-infrastructure-agent.md`  
**Use for**: Deployment, monitoring, scaling

#### 11. Product Management Agent
**File**: `agents/product-management-agent.md`  
**Use for**: Feature prioritization, roadmap planning

**See**: `agents/README.md` for full agent directory and usage guide

---

## 🚀 Quick Start Guide

### For New Developers

1. **Read the Overview**:
   - Start with this file (README.md)
   - Review `app-structure.md` for architecture

2. **Set Up Environment**:
   ```bash
   npm install
   npm run dev
   ```

3. **Understand the Design**:
   - Read `design.md` for visual guidelines
   - Review `ux-flow.md` for user journeys

4. **Pick an Agent**:
   - Frontend work? → `agents/frontend-agent.md`
   - Backend work? → `agents/backend-agent.md`

5. **Start Building**:
   - Follow agent guidelines
   - Reference documentation as needed

---

### For Product Managers

1. **Product Vision**: `xum PRD.md`
2. **User Flows**: `ux-flow.md`
3. **Roadmap**: `agents/product-management-agent.md`
4. **Analytics**: Setup in `devops-infrastructure-agent.md`

---

### For Designers

1. **Design System**: `design.md`
2. **UX Flows**: `ux-flow.md`
3. **Design Agent**: `agents/design-ux-agent.md`
4. **Accessibility**: Section in `design.md`

---

## 📊 Project Status

### Completed ✅
- Core authentication flow (login, signup, password recovery)
- Task marketplace with filtering
- Multiple task execution interfaces (audio, image, text, etc.)
- Wallet and withdrawal system
- Gamification (XP, levels, trust scores)
- Admin panel (user management, task moderation)
- Theme system (6 themes)
- Mobile-responsive design

### In Progress 🚧
- Automated task validation (AI quality checks)
- Real-time notifications
- Backend API integration (currently using mock data)
- Database schema implementation
- Edge Functions deployment

### Planned 📅
- Mobile native apps (React Native)
- Advanced task types (video, 3D)
- Referral program
- Achievement badges
- Live leaderboards

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────┐
│       Frontend (React + TypeScript)     │
│       Vite Build, Tailwind CSS          │
└───────────────┬─────────────────────────┘
                │
                ↓ HTTPS/REST API
┌─────────────────────────────────────────┐
│       Supabase Backend Services         │
│  Auth | PostgreSQL | Storage | Edge Fns │
└───────────────┬─────────────────────────┘
                │
                ↓ SQL Queries
┌─────────────────────────────────────────┐
│         PostgreSQL Database             │
│  Users | Tasks | Submissions | etc.     │
└─────────────────────────────────────────┘
```

**See**: `app-structure.md` and `backend-architecture.md` for details

---

## 📂 File Organization

```
xum-ai/
├── doc/                          # This directory
│   ├── README.md                # This file
│   ├── xum PRD.md               # Product requirements
│   ├── design.md                # Design system
│   ├── ux-flow.md               # User journeys
│   ├── app-structure.md         # Frontend architecture
│   └── backend-architecture.md  # Backend architecture
│
├── agents/                       # AI agent prompts
│   ├── README.md                # Agent directory
│   ├── frontend-agent.md
│   ├── backend-agent.md
│   ├── design-ux-agent.md
│   ├── testing-qa-agent.md
│   ├── devops-infrastructure-agent.md
│   └── product-management-agent.md
│
├── screens/                      # React components
│   ├── AuthScreens.tsx
│   ├── DashboardScreens.tsx
│   ├── TaskScreens.tsx
│   └── AdminScreens.tsx
│
├── supabase/                     # Backend
│   ├── schema.sql
│   └── task.sql
│
├── App.tsx                       # Root component
├── types.ts                      # TypeScript definitions
└── package.json                  # Dependencies
```

---

## 🎯 Key Concepts

### User Roles
1. **Contributors**: Individuals who complete tasks and earn money
2. **Companies**: Enterprises that post tasks
3. **Admins**: Platform moderators

### Core Features
- **Task Marketplace**: Browse and filter available work
- **Gamification**: XP, levels, trust scores, achievements
- **Wallet**: Balance tracking, transaction history, withdrawals
- **Quality Assurance**: Automated + manual review system

### Themes
6 pre-configured dark themes:
- Midnight (default) - Blue
- Emerald - Green
- Solar - Orange
- Amoled - Pure Black
- Night - Slate
- Crimson - Red

---

## 🔧 Development Workflow

### 1. Planning
- Product Agent defines user story
- Design Agent creates mockups
- Backend Agent designs schema

### 2. Implementation
- Frontend Agent builds UI
- Backend Agent creates API
- Testing Agent writes tests

### 3. Deployment
- DevOps Agent deploys to staging
- QA testing
- Deploy to production

### 4. Monitoring
- Product Agent tracks KPIs
- DevOps Agent monitors errors
- Iterate based on feedback

---

## 📚 Reference Links

### Internal Documentation
- [Design System](design.md)
- [UX Flows](ux-flow.md)
- [App Structure](app-structure.md)
- [Backend Architecture](backend-architecture.md)
- [Agent Directory](../agents/README.md)

### External Resources
- [React Documentation](https://react.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Material Symbols](https://fonts.google.com/icons)
- [TypeScript](https://www.typescriptlang.org/docs/)

---

## 🤝 Contributing

### Documentation Updates
1. Identify which document needs updating
2. Make changes following existing format
3. Update version and date at bottom
4. Sync changes across related documents

### Adding New Documentation
1. Choose appropriate category (doc/ or agents/)
2. Follow markdown template structure
3. Add entry to this README
4. Cross-reference in related docs

---

## 📞 Support & Contact

### Questions?
- Review relevant documentation first
- Check agent prompts for domain-specific guidance
- Consult with team in project channel

### Found an Error?
- Document location and issue
- Suggest correction
- Submit update

---

## 🎓 Learning Path

### Week 1: Understanding
- [ ] Read this README
- [ ] Review `app-structure.md`
- [ ] Explore codebase structure

### Week 2: Design & UX
- [ ] Study `design.md`
- [ ] Review `ux-flow.md`
- [ ] Examine existing screens

### Week 3: Backend
- [ ] Read `backend-architecture.md`
- [ ] Understand database schema
- [ ] Review API patterns

### Week 4: Agents
- [ ] Read all agent files
- [ ] Attempt tasks with agent guidance
- [ ] Contribute to documentation

---

## 📈 Success Metrics

### Documentation Quality
- **Completeness**: All major topics covered
- **Accuracy**: Up-to-date with codebase
- **Clarity**: Easy to understand
- **Accessibility**: Well-organized, searchable

### Developer Experience
- **Onboarding Time**: <1 week to first commit
- **Self-Service**: 80%+ questions answered by docs
- **Contribution Rate**: Regular doc updates by team

---

## 🔄 Version History

**Version 1.0** (December 30, 2025)
- Initial comprehensive documentation
- 6 specialized agent prompts
- Complete architecture documentation
- Design system and UX flows

---

## 🚀 Next Steps

1. **Complete PRD**: Finalize `xum PRD.md`
2. **Implement Backend**: Build out database schema
3. **API Integration**: Connect frontend to Supabase
4. **Testing**: Achieve 80%+ coverage
5. **Deploy**: Launch MVP to production

---

**Maintained by**: XUM AI Core Team  
**Last Updated**: December 30, 2025  
**Version**: 1.0  
**Status**: Active Development
