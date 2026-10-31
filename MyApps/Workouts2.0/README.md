# Workouts2.0

Workouts2.0 is a mobile-first fitness app designed to help people stay consistent with their training and make smarter progress over time. The idea behind the project is to combine workout planning, daily execution, performance tracking, and adaptive recommendations into a single experience that feels simple on a phone but powerful under the hood.

## What the app is for

This app is built for people who want more than a basic workout checklist. It is meant to help users:

- create a personalized workout plan around their goals
- see what they should do each day based on their active schedule
- log sets, reps, and weights as they train
- track workout history over time
- review individual exercise progress
- get recommendations for future training based on performance
- keep plan changes flexible without losing data

The app is designed to balance ease of use during a workout with enough structure to support long-term tracking and planning.

## Core features

- User sign up and sign in
- Private, user-specific workout data
- Active workout plan management
- Daily workout resolution based on the plan schedule
- Custom workout days and exercise tracking
- Set, rep, and weight logging
- Workout completion tracking
- Progress and exercise history
- Progressive overload recommendations
- Completed plan archival and historical review
- Goal-based recommendations for future training

## How the app works

A typical user flow is straightforward:

1. Create an account and log in.
2. Build or select a workout plan.
3. Set goals and choose whether progressive overload is enabled.
4. Add workout days and exercises with target sets, reps, and weights.
5. Mark the plan as active.
6. Use the app each day to see the assigned workout.
7. Log completion and exercise performance.
8. Review performance trends and recommendations over time.

The design is intentionally centered around two things: a clean mobile experience and a strong backend system that manages scheduling, recommendations, history, and authorization.

## Why I built it this way

I wanted the app to feel practical, not just theoretical. A workout app should minimize friction during actual training, while still storing enough information to make the experience useful over weeks and months.

That’s why the project separates responsibilities:

- the frontend focuses on quick interaction and clear workout flows
- the backend owns user data, plan logic, historical tracking, and recommendation systems
- data models are structured to support progression and long-term insight

## Tech stack

The project is built as a modern full-stack application with a mobile-first frontend and a backend designed for real data handling.

- Frontend: React Native + Expo
- UI state: Redux Toolkit
- Server state: React Query
- Navigation: React Navigation
- Backend: NestJS with TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Authentication: JWT-based auth with refresh tokens
- API style: REST JSON

This stack allows the app to scale from a focused prototype into a more complete product without sacrificing maintainability.

## Project structure

```text
MyApps/Workouts2.0/
├── AgentFiles/
│   ├── architecture.md
│   ├── requirements.md
│   ├── build_status_report.txt
│   ├── test-report.md
│   └── ...
├── backend/
│   ├── prisma/
│   ├── src/
│   └── package.json
├── frontend/
│   ├── src/
│   ├── App.tsx
│   └── package.json
├── README.md
└── __placeholder.txt
```

The project includes design and QA artifacts in the AgentFiles folder that define the intended requirements, technical architecture, and validation notes for the app.

## How this project was created

This project was created using a structured AI-assisted workflow with CrewAI. I set up a multi-agent process where different agents handled different parts of the build, rather than trying to do the whole project in one pass.

The team of agents included:

- Product Requirements agent
- Architecture agent
- Frontend agent
- Backend agent
- Testing agent
- Code Review agent

Each agent had a clearly defined role and tool access, which helped break the work into phases: requirements, architecture, implementation, validation, and review. That approach made it easier to think through the app as a real product instead of just a quick prototype.

This workflow was useful because it helped keep the project organized and goal-driven. I wasn’t just generating code; I was defining what the app should do, how it should be structured, and how it should be validated before moving on.

## Design goals

I wanted Workouts2.0 to feel like a real training companion, not just a static planner. Some of the main design goals were:

- keep the daily workout flow fast and easy to use
- reduce friction for logging progress during training
- make history useful rather than just stored
- support personalization through goals and plan structure
- enable smarter future recommendations with progressive overload
- keep user data private and respect ownership boundaries

## Current status

The project has a solid foundation in requirements, architecture, and structure. It is designed thoughtfully and has clear product goals, but it still needs a proper environment for full runtime validation and deployment.

At this stage, the app is best viewed as a strong foundation for a real workout platform rather than a fully tested production app.

## Next steps

The next logical steps for the project would be:

1. install and verify dependencies for the frontend and backend
2. configure the database and Prisma schema
3. implement the authentication flow
4. build plan creation and exercise editing
5. add daily workout resolution and completion flows
6. implement history and recommendation logic
7. run real end-to-end validation in a proper local environment
8. prepare for deployment and production hardening

## Summary

Workouts2.0 is a fitness app built around the idea that training should be structured, measurable, and sustainable. It brings together planning, execution, progression, and history in one product so users can follow a plan, stay consistent, and improve over time.

The project reflects a thoughtful approach to building a real application: clear product goals, solid architectural planning, a specialized AI agent workflow, and a mobile-first design that keeps the user experience focused on what matters most during a workout.
