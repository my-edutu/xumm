# XUM AI - Agent Directory
**Specialized AI Agents for Project Execution**

---

## 📋 Overview

This directory contains **specialized agent prompts** designed to guide AI assistants in executing specific aspects of the XUM AI project. Each agent has domain expertise and follows best practices for their respective area.

---

## 🤖 Available Agents

### 1. Frontend Development Agent
**File**: `frontend-agent.md`  
**Expertise**: React, TypeScript, UI/UX implementation  
**Responsibilities**:
- Build mobile-first React components
- Implement design system (Midnight theme)
- Manage global state and navigation
- Ensure accessibility (WCAG 2.1 AA)
- Optimize performance (Lighthouse >90)

**Use When**: Building UI components, implementing screens, fixing frontend bugs

---

### 2. Backend Development Agent
**File**: `backend-agent.md`  
**Expertise**: Supabase, PostgreSQL, API development  
**Responsibilities**:
- Design database schemas
- Implement Row Level Security (RLS)
- Build Edge Functions (serverless APIs)
- Create stored procedures for business logic
- Optimize queries and database performance

**Use When**: Database design, API development, backend logic implementation

---

### 3. Design & UX Agent
**File**: `design-ux-agent.md`  
**Expertise**: Visual design, user experience, interaction patterns  
**Responsibilities**:
- Define color palettes and typography
- Design component specifications
- Create animation guidelines
- Ensure accessibility compliance
- Map user journeys

**Use When**: Designing new features, improving UX, creating mockups

---

### 4. Testing & QA Agent
**File**: `testing-qa-agent.md`  
**Expertise**: Quality assurance, test automation, bug tracking  
**Responsibilities**:
- Write unit, integration, and E2E tests
- Perform accessibility testing
- Conduct cross-browser testing
- Track and document bugs
- Ensure 80%+ code coverage

**Use When**: Writing tests, validating features, pre-release QA

---

### 5. DevOps & Infrastructure Agent
**File**: `devops-infrastructure-agent.md`  
**Expertise**: CI/CD, deployment, monitoring, scaling  
**Responsibilities**:
- Configure GitHub Actions pipelines
- Manage environment variables and secrets
- Set up monitoring (Sentry, Uptime)
- Implement database backups
- Plan scaling strategies

**Use When**: Deploying to production, infrastructure setup, debugging outages

---

### 6. Product Management Agent
**File**: `product-management-agent.md`  
**Expertise**: Product strategy, roadmap, feature prioritization  
**Responsibilities**:
- Define product vision and goals
- Create user personas and stories
- Prioritize features (RICE framework)
- Track KPIs and success metrics
- Plan go-to-market strategy

**Use When**: Planning features, prioritizing roadmap, analyzing user feedback

---

## 🎯 How to Use These Agents

### Step 1: Identify Your Task
Determine which domain your task falls under:
- UI/UX work → Frontend or Design Agent
- Database/API → Backend Agent
- Bug fixes → Testing Agent
- Deployment → DevOps Agent
- Feature planning → Product Agent

### Step 2: Read the Agent Prompt
Open the relevant `.md` file and review:
- Role & Responsibilities
- Technical Context
- Core Responsibilities
- Best Practices
- Reference Documents

### Step 3: Execute with Context
When working with an AI assistant:
```
You are the [Agent Name] for XUM AI. 
[Paste relevant sections from the agent file]

Task: [Describe your specific task]
```

### Step 4: Cross-Reference Documentation
Each agent references core documentation:
- `doc/design.md` - Design system
- `doc/ux-flow.md` - User journeys
- `doc/app-structure.md` - Architecture
- `doc/backend-architecture.md` - Database & API

---

## 🔄 Agent Collaboration

### Example: Adding a New Feature

```
1. Product Agent: Define user story and acceptance criteria
   ↓
2. Design Agent: Create UI mockups and interaction patterns
   ↓
3. Backend Agent: Design database schema and API endpoints
   ↓
4. Frontend Agent: Implement React components and API integration
   ↓
5. Testing Agent: Write tests (unit, integration, E2E)
   ↓
6. DevOps Agent: Deploy to staging, then production
   ↓
7. Product Agent: Monitor KPIs and gather user feedback
```

---

## 📊 Agent Responsibility Matrix

| Task Category | Primary Agent | Supporting Agents |
|---------------|---------------|-------------------|
| New Screen | Frontend | Design, Backend |
| Database Schema | Backend | Product, DevOps |
| Bug Fix | Testing | Frontend, Backend |
| Performance Optimization | DevOps | Frontend, Backend |
| User Research | Product | Design |
| API Endpoint | Backend | Testing |
| UI Component | Frontend | Design |
| Deployment | DevOps | Testing |

---

## 🛠️ Customization

### Adding a New Agent

1. Create `[domain]-agent.md` in this directory
2. Follow the existing template structure:
   ```markdown
   # [Agent Name]
   **XUM AI - [Specialization]**
   
   ## 🎯 Role & Responsibilities
   ## 🛠️ Technical Context
   ## 📋 Core Responsibilities
   ## 📐 [Domain-Specific Sections]
   ## ✅ Checklist
   ## 💡 Best Practices
   ```
3. Update this `README.md` with the new agent

### Updating an Existing Agent

- Keep best practices current with industry standards
- Add new tools/frameworks as they're adopted
- Incorporate lessons learned from past projects
- Maintain consistency with other agents

---

## 📚 Additional Resources

### Documentation
- **Product Requirements**: `doc/xum PRD.md`
- **Design System**: `doc/design.md`
- **UX Flows**: `doc/ux-flow.md`
- **App Structure**: `doc/app-structure.md`
- **Backend Architecture**: `doc/backend-architecture.md`

### External References
- **React Docs**: https://react.dev
- **Supabase Docs**: https://supabase.com/docs
- **Tailwind CSS**: https://tailwindcss.com
- **Material Symbols**: https://fonts.google.com/icons

---

## 🎓 Training New Team Members

### Onboarding Checklist
- [ ] Read all agent files
- [ ] Review core documentation (doc/)
- [ ] Set up local development environment
- [ ] Complete a small task with each agent's guidance
- [ ] Shadow an experienced team member

---

## ⚡ Quick Reference

**Need to...**
- Build a new screen? → `frontend-agent.md`
- Add a database table? → `backend-agent.md`
- Design a new flow? → `design-ux-agent.md`
- Write tests? → `testing-qa-agent.md`
- Deploy a feature? → `devops-infrastructure-agent.md`
- Prioritize features? → `product-management-agent.md`

---

## 📞 Support

For questions or suggestions about these agents:
- Open an issue in the project repository
- Discuss in the team channel
- Propose changes via pull request

---

**Last Updated**: December 30, 2025  
**Maintained by**: XUM AI Core Team  
**Version**: 1.0
