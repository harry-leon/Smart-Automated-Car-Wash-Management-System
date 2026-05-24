# GitHub Project Setup Guide

## Goal

Set up one GitHub Project that matches the mandatory-first scope in `Project.md`.

The project must help the team track:

- foundation demo tasks
- customer / staff / admin workstreams
- backend / frontend dependencies
- mandatory-first scope before any advanced features

## Recommended setup

Create:

1. one main GitHub Project
2. a `Backlog` table view
3. a `Sprint Board` board view
4. a `Roadmap` view
5. a `Bugs` view for later stabilization

Recommended project name:

`AutoWash Pro Delivery`

## Why this setup

The project has:

- multiple epics
- multiple workspaces
- two backend owners plus frontend/fullstack integration
- a strict mandatory-first scope

One project with multiple views is simpler than multiple disconnected projects.

## Mandatory-first project focus

The initial backlog must prioritize:

1. Auth
2. Vehicle CRUD
3. Booking create/list/detail
4. Operations queue/check-in/start/complete
5. Loyalty earn/history basics
6. Promotion basics and promotion CRUD
7. Member history
8. Admin booking oversight and point history
9. Swagger/OpenAPI

Do not let support chat, advanced realtime, advanced reports, or real gateways take priority over these items.

## Recommended fields

Create these fields:

- `Title`
- `Status`
- `Priority`
- `Owner`
- `Dependencies`
- `Assignees`
- `Epic`
- `Workspace`
- `Size`
- `Sprint`
- `Start Date`
- `Target Date`
- `Type`

## Recommended values

### Status

- `Backlog`
- `Ready`
- `In Progress`
- `Review`
- `Blocked`
- `Done`

### Priority

- `P0`
- `P1`
- `P2`
- `P3`

### Workspace

- `Customer`
- `Operations`
- `Admin`
- `Backend`
- `Shared`

### Epic

- `Epic 1 - Auth`
- `Epic 2 - User`
- `Epic 3 - Vehicle`
- `Epic 4 - Booking`
- `Epic 5 - Operations`
- `Epic 6 - Staff`
- `Epic 7 - Loyalty`
- `Epic 8 - Promotion`
- `Epic 9 - Admin`
- `Epic 10 - Notification`
- `Epic 11 - QA`

### Type

- `Feature`
- `Bug`
- `Tech`
- `Docs`

### Owner

- `Huy`
- `Thuận`
- `Hùng`
- `Hưng`
- `Khương`

### Dependencies

Use a text field. Keep the value concrete, for example:

`Khương phải xong: Setup Next.js frontend skeleton; Huy phải xong: Implement backend auth module endpoints`

## Recommended views

### Backlog

- Type: `Table`
- Sort by:
  - `Priority`
  - `Target Date`
- Optional group by:
  - `Epic`

### Sprint Board

- Type: `Board`
- Group by:
  - `Status`

### Roadmap

- Type: `Roadmap`
- Start field:
  - `Start Date`
- End field:
  - `Target Date`
- Group by:
  - `Epic`

### Bugs

- Type: `Board` or `Table`
- Filter:
  - `Type = Bug`

## Initial backlog rule

When seeding the project, follow this order:

1. Foundation auth and app setup
2. Vehicle
3. Booking
4. Operations
5. Loyalty / promotion
6. Admin history / oversight
7. Demo QA pass

## What to deprioritize initially

- support chat
- notification center
- advanced live wash tracker
- real payment gateway
- real SMS/email gateway
- export/report polish
- advanced realtime enhancements

## Suggested operating rule

Every task should have at least:

- `Status`
- `Priority`
- `Epic`
- `Workspace`
- `Sprint`
- `Type`
- `Owner`
- `Dependencies`

## Result you want

After setup, the team should be able to see:

- what is mandatory first
- who owns each core flow
- what blocks customer booking demo
- what blocks staff/admin demo
- what can wait until after the foundation review
