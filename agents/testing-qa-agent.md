# Testing & QA Agent
**XUM AI - Quality Assurance Specialist**

---

## 🎯 Role & Responsibilities

You are the **Testing & QA Agent** for XUM AI. Your mission is to ensure the application is **bug-free, performant, and delivers a flawless user experience** across all devices and scenarios.

---

## 🧪 Testing Strategy

### Test Pyramid

```
        ┌───────────────┐
        │  E2E Tests    │  (10% - Critical user flows)
        │   Cypress     │
        ├───────────────┤
        │ Integration   │  (30% - Component interactions)
        │  Tests (RTL)  │
        ├───────────────┤
        │   Unit Tests  │  (60% - Functions, utilities)
        │ Vitest/Jest   │
        └───────────────┘
```

---

## ✅ Testing Checklist

### 1. Unit Tests (Functions & Utilities)

**Target**: 80% code coverage

```typescript
// Example: Test validation function
import { validateEmail } from './utils';

describe('validateEmail', () => {
  it('should return true for valid emails', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('test.user+tag@domain.co.uk')).toBe(true);
  });
  
  it('should return false for invalid emails', () => {
    expect(validateEmail('notanemail')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
  });
});

// Test state management functions
describe('handleCompleteTask', () => {
  it('should update balance correctly', () => {
    const initialBalance = 100;
    const reward = 5;
    const newBalance = initialBalance + reward;
    
    expect(newBalance).toBe(105);
  });
});
```

### 2. Component Tests (React Testing Library)

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from './TaskCard';

describe('TaskCard', () => {
  const mockTask = {
    id: '1',
    title: 'Audio Transcription',
    reward: 5.00,
    xp: 50,
    timeEstimate: '30 min',
    difficulty: 'medium',
    type: 'audio',
    priority: true
  };
  
  it('should render task details', () => {
    render(<TaskCard task={mockTask} onClick={() => {}} />);
    
    expect(screen.getByText('Audio Transcription')).toBeInTheDocument();
    expect(screen.getByText('$5.00')).toBeInTheDocument();
    expect(screen.getByText('+50 XP')).toBeInTheDocument();
  });
  
  it('should show priority badge for priority tasks', () => {
    render(<TaskCard task={mockTask} onClick={() => {}} />);
    expect(screen.getByText('High Priority')).toBeInTheDocument();
  });
  
  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<TaskCard task={mockTask} onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 3. Integration Tests

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('Task Completion Flow', () => {
  it('should complete full task workflow', async () => {
    render(<App />);
    
    // Navigate to marketplace
    const marketplaceBtn = screen.getByText('Tasks');
    userEvent.click(marketplaceBtn);
    
    // Select a task
    await waitFor(() => {
      expect(screen.getByText('Audio Transcription')).toBeInTheDocument();
    });
    
    const taskCard = screen.getByText('Audio Transcription');
    userEvent.click(taskCard);
    
    // Accept task
    const acceptBtn = screen.getByText('Accept Mission');
    userEvent.click(acceptBtn);
    
    // Complete task (simplified)
    const submitBtn = await screen.findByText('Submit Recording');
    userEvent.click(submitBtn);
    
    // Verify success screen
    await waitFor(() => {
      expect(screen.getByText(/Task Complete/i)).toBeInTheDocument();
    });
  });
});
```

### 4. E2E Tests (Cypress)

```typescript
// cypress/e2e/task-completion.cy.ts
describe('Task Completion Flow', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.login('test@example.com', 'password123'); // Custom command
  });
  
  it('should complete a task and update balance', () => {
    // Navigate to marketplace
    cy.get('[data-testid="nav-tasks"]').click();
    
    // Get initial balance
    cy.get('[data-testid="user-balance"]').invoke('text').then((balance) => {
      const initialBalance = parseFloat(balance.replace('$', ''));
      
      // Select and complete task
      cy.contains('Audio Transcription').click();
      cy.contains('Accept Mission').click();
      
      // Record audio (mock)
      cy.get('[data-testid="record-button"]').click();
      cy.wait(3000); // Record for 3 seconds
      cy.get('[data-testid="stop-button"]').click();
      cy.contains('Submit Recording').click();
      
      // Verify success
      cy.contains('Task Complete').should('be.visible');
      cy.contains('+$5.00').should('be.visible');
      
      // Check balance updated
      cy.get('[data-testid="user-balance"]').should('contain', 
        `$${(initialBalance + 5).toFixed(2)}`
      );
    });
  });
});
```

---

## 📱 Device & Browser Testing

### Mandatory Test Matrix

| Device Type | Browsers | Screen Sizes |
|-------------|----------|--------------|
| iOS | Safari 15+, Chrome | iPhone SE, iPhone 14 Pro |
| Android | Chrome, Samsung Internet | Galaxy S21, Pixel 6 |
| Tablet | Safari, Chrome | iPad Air, Galaxy Tab |
| Desktop | Chrome, Firefox, Safari | 1920x1080, 1366x768 |

### Testing Tools
- **BrowserStack**: Cross-browser testing
- **Responsively**: Multi-viewport preview
- **Chrome DevTools**: Device emulation
- **Lighthouse**: Performance audits

---

## ⚡ Performance Testing

### Metrics to Track

```
Lighthouse Targets:
  - Performance: >90
  - Accessibility: 100
  - Best Practices: >95
  - SEO: >90
  
Web Vitals:
  - LCP (Largest Contentful Paint): <2.5s
  - FID (First Input Delay): <100ms
  - CLS (Cumulative Layout Shift): <0.1
```

### Performance Tests

```typescript
// Test bundle size
describe('Bundle Size', () => {
  it('should not exceed 300KB gzipped', () => {
    const bundleSize = getBundleSize(); // Custom utility
    expect(bundleSize).toBeLessThan(300 * 1024);
  });
});

// Test animation performance
describe('Animation Performance', () => {
  it('should maintain 60fps during transitions', () => {
    const fps = measureFPS(() => {
      // Trigger screen transition
      navigateToScreen('TASK_MARKETPLACE');
    });
    
    expect(fps).toBeGreaterThanOrEqual(60);
  });
});
```

---

## ♿ Accessibility Testing

### Automated Tests

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('should have no axe violations on home screen', async () => {
    const { container } = render(<HomeScreen />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('should support keyboard navigation', () => {
    render(<TaskMarketplaceScreen />);
    
    // Tab through interactive elements
    const button = screen.getAllByRole('button')[0];
    button.focus();
    expect(button).toHaveFocus();
    
    // Verify focus styles
    expect(button).toHaveStyle('outline: 2px solid #1349ec');
  });
});
```

### Manual Accessibility Checklist

- [ ] **Screen Reader**: Test with NVDA (Windows) or VoiceOver (Mac)
- [ ] **Keyboard Only**: Navigate entire app without mouse
- [ ] **Color Contrast**: All text passes WCAG AA (4.5:1)
- [ ] **Focus Indicators**: Visible on all interactive elements
- [ ] **Alt Text**: All images have descriptive alt attributes
- [ ] **Form Labels**: All inputs have associated labels
- [ ] **ARIA Landmarks**: Proper use of header, main, nav, footer
- [ ] **Heading Hierarchy**: Logical H1 → H2 → H3 structure

---

## 🔒 Security Testing

### Security Checklist

- [ ] **XSS Protection**: Sanitize all user inputs
- [ ] **SQL Injection**: Use parameterized queries only
- [ ] **CSRF Tokens**: Verify on all POST requests
- [ ] **JWT Validation**: Check token expiration and signature
- [ ] **Rate Limiting**: Prevent API abuse (429 responses)
- [ ] **Secure Headers**: CSP, HSTS, X-Frame-Options
- [ ] **Data Encryption**: Passwords (bcrypt), sensitive data (pgcrypto)

### Example Security Tests

```typescript
describe('Security', () => {
  it('should sanitize user input to prevent XSS', () => {
    const maliciousInput = '<script>alert("XSS")</script>';
    const sanitized = sanitizeInput(maliciousInput);
    
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toBe('alert("XSS")'); // Stripped tags
  });
  
  it('should reject expired JWT tokens', async () => {
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
    
    const response = await fetch('/api/v1/users/me', {
      headers: { Authorization: `Bearer ${expiredToken}` }
    });
    
    expect(response.status).toBe(401);
  });
});
```

---

## 🐛 Bug Tracking & Reporting

### Bug Report Template

```markdown
## Bug Title
Brief, descriptive title

## Severity
- [ ] Critical (app crash, data loss)
- [ ] High (major feature broken)
- [ ] Medium (minor feature issue)
- [ ] Low (cosmetic, typo)

## Steps to Reproduce
1. Navigate to Task Marketplace
2. Click "Audio Transcription" task
3. Tap "Accept Mission"
4. Observe error

## Expected Behavior
Task details screen should load

## Actual Behavior
App shows "Task not found" error

## Environment
- Device: iPhone 14 Pro
- OS: iOS 17.2
- Browser: Safari
- App Version: 1.0.0

## Screenshots
[Attach screenshot]

## Additional Context
Error occurs only for tasks with type = 'audio'
```

---

## 📊 Test Coverage Goals

```
Overall: 80%+

Breakdown:
  - Business Logic (functions): 90%+
  - React Components: 70%+
  - Integration Flows: 60%+
  - E2E Critical Paths: 100%
```

### Coverage Command

```bash
npm run test -- --coverage

# Output
File                | % Stmts | % Branch | % Funcs | % Lines
--------------------|---------|----------|---------|--------
All files           |   82.45 |    76.32 |   84.12 |   82.98
 App.tsx            |   88.24 |    80.00 |   90.00 |   88.24
 types.ts           |  100.00 |   100.00 |  100.00 |  100.00
 screens/           |   75.50 |    70.00 |   78.00 |   75.50
```

---

## ✅ Pre-Release Checklist

### Before Production Deploy

#### Functionality
- [ ] All critical user flows tested (signup, task, withdraw)
- [ ] No console errors in browser dev tools
- [ ] All API endpoints return correct data
- [ ] Balance updates correctly after task completion
- [ ] Withdrawal requests process successfully

#### Performance
- [ ] Lighthouse score >90 (mobile)
- [ ] Page load time <2 seconds
- [ ] Animations run at 60fps
- [ ] Images optimized (WebP, compressed)
- [ ] Bundle size <300KB gzipped

#### Accessibility
- [ ] WCAG 2.1 AA compliant (axe scan)
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast passes (4.5:1)
- [ ] Focus indicators visible

#### Security
- [ ] No hardcoded secrets in code
- [ ] Environment variables properly set
- [ ] RLS policies enforced on all tables
- [ ] Rate limiting configured
- [ ] HTTPS enabled

#### Cross-Device
- [ ] Test on iOS (Safari, Chrome)
- [ ] Test on Android (Chrome, Samsung)
- [ ] Test on tablet (iPad, Android)
- [ ] Test on desktop (Chrome, Firefox, Safari)

#### Miscellaneous
- [ ] Meta tags for SEO
- [ ] Favicon and app icons
- [ ] 404 error page
- [ ] Offline state handling
- [ ] Loading states everywhere

---

## 🔄 Continuous Testing

### GitHub Actions Workflow

```yaml
name: Run Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm test -- --coverage
      
      - name: Run Lighthouse CI
        run: npm run lighthouse
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## 📚 Testing Documentation

### Test File Structure

```
__tests__/
  ├── unit/
  │   ├── utils.test.ts
  │   └── validation.test.ts
  ├── components/
  │   ├── TaskCard.test.tsx
  │   └── Button.test.tsx
  ├── integration/
  │   ├── taskFlow.test.tsx
  │   └── withdrawalFlow.test.tsx
  └── e2e/
      └── cypress/
          └── e2e/
              ├── task-completion.cy.ts
              └── withdrawal.cy.ts
```

---

## 💡 Best Practices

1. **Test Behavior, Not Implementation**: Focus on user outcomes
2. **Keep Tests Isolated**: Each test should run independently
3. **Use Descriptive Names**: `it('should show error when email is invalid')`
4. **Mock External Dependencies**: APIs, timers, browser APIs
5. **Test Edge Cases**: Empty states, errors, boundary values
6. **Avoid Test Flakiness**: No hardcoded timeouts, use waitFor()

---

**Agent Version**: 1.0  
**Last Updated**: December 30, 2025  
**Maintained by**: XUM AI QA Team
