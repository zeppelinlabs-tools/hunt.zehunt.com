# Hunt Design System

> Hunt the solution.

Hunt is a developer knowledge network built around real problem-solving
experiences. It helps developers discover how other people investigated,
solved, verified, and discussed engineering problems.

This document defines the visual language, interaction principles,
information hierarchy, components, accessibility requirements, and UX
standards for Hunt.

---

## 1. Design Philosophy

Hunt should feel like a product built by experienced developers for
experienced developers.

It should be:

- Human
- Professional
- Calm
- Trustworthy
- Precise
- Fast
- Information-dense without feeling crowded
- Technical without feeling intimidating
- Social without feeling like a social-media platform
- AI-native without looking "AI-generated"

Hunt should NOT feel like:

- A generic AI wrapper
- A crypto/Web3 dashboard
- A gaming interface
- A futuristic cyberpunk product
- A traditional social network
- A Stack Overflow clone
- A dashboard overloaded with cards

The visual system should communicate:

> "This is where developers come to understand problems."

---

## 2. Brand Character

### Personality

Hunt's personality is:

**Curious + Technical + Human + Reliable**

---

## 3. Core Design Principle

The most important principle is:

> Content is more important than decoration.

A developer visiting Hunt should immediately understand:

1. What problem is being discussed?
2. What environment caused it?
3. What was tried?
4. What actually worked?
5. How reliable is the solution?
6. What did other developers experience?

Do not visually compete with this information.

---

## 4. Visual Direction

### Overall Style

Hunt uses a refined developer-tool aesthetic.

Characteristics:

- Neutral surfaces
- Strong typography
- Subtle borders
- Moderate corner radius
- Controlled spacing
- Minimal shadows
- Restrained accent color
- Excellent code presentation
- Clear hierarchy
- Generous whitespace around important content

Avoid excessive visual effects.

---

## 5. Color System

The color system should be neutral-first.

```css
:root {
  --background: #fafafa;
  --surface: #ffffff;
  --surface-subtle: #f5f5f5;
  --surface-hover: #f1f1f1;

  --border: #e5e5e5;
  --border-strong: #d4d4d4;

  --text-primary: #171717;
  --text-secondary: #525252;
  --text-muted: #737373;

  --accent: #2563eb;
  --accent-hover: #1d4ed8;
  --accent-subtle: #eff6ff;

  --success: #15803d;
  --success-subtle: #f0fdf4;

  --warning: #a16207;
  --warning-subtle: #fefce8;

  --danger: #b91c1c;
  --danger-subtle: #fef2f2;
}
```
