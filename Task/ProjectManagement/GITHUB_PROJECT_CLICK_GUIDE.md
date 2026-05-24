# GitHub Project Click Guide

## Goal

Create one GitHub Project that matches the mandatory-first execution order from `Project.md`.

## Project name

Use:

`AutoWash Pro Delivery`

## Template to choose

Choose:

- `Iterative development`

If that template is not convenient, choose:

- `Table`

Then manually add the other views. The final structure should still be the same.

## Step 1 - Create the project

1. Open `Projects`
2. Click `New project`
3. Choose `Iterative development`
4. Set name:
   - `AutoWash Pro Delivery`

## Step 2 - Create required fields

### Single select fields

- `Priority`
  - `P0`
  - `P1`
  - `P2`
  - `P3`

- `Epic`
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

- `Workspace`
  - `Customer`
  - `Operations`
  - `Admin`
  - `Backend`
  - `Shared`

- `Size`
  - `S`
  - `M`
  - `L`

- `Sprint`
  - `Sprint 1`
  - `Sprint 2`
  - `Sprint 3`
  - `Sprint 4`
  - `Sprint 5`
  - `Sprint 6`
  - `Sprint 7`

- `Type`
  - `Feature`
  - `Bug`
  - `Tech`
  - `Docs`

- `Owner`
  - `Huy`
  - `Thuận`
  - `Hùng`
  - `Hưng`
  - `Khương`

### Text fields

- `Dependencies`

Use this field to state the concrete blocker, for example:

`Khương phải xong: Setup Next.js frontend skeleton; Huy phải xong: Implement backend booking APIs`

### Date fields

- `Start Date`
- `Target Date`

## Step 3 - Standardize status

Keep or change `Status` to:

- `Backlog`
- `Ready`
- `In Progress`
- `Review`
- `Blocked`
- `Done`

## Step 4 - Create the views

Create these 4 views inside the same project.

### 1. Backlog

- Type: `Table`
- Sort:
  - `Priority` ascending
  - `Target Date` ascending
- Optional group:
  - `Epic`

### 2. Sprint Board

- Type: `Board`
- Group by:
  - `Status`

### 3. Roadmap

- Type: `Roadmap`
- Start:
  - `Start Date`
- End:
  - `Target Date`
- Group by:
  - `Epic`

### 4. Bugs

- Type: `Board` or `Table`
- Filter:
  - `Type = Bug`

## Step 5 - Import the initial seed

Seed file:

[github-project-seed.csv](/D:/CarWash/Task/ProjectManagement/github-project-seed.csv)

Use it to create or import the first backlog items.

## Backlog ordering rule

When entering tasks, keep this order:

1. Auth
2. Vehicle
3. Booking
4. Operations
5. Loyalty
6. Promotions
7. Admin history / oversight
8. Demo QA pass
9. Later production polish

## Quick mapping by workspace

- `Customer`: customer portal
- `Operations`: staff workspace
- `Admin`: admin dashboard
- `Backend`: Spring Boot APIs
- `Shared`: auth contract, middleware, query layer, Swagger, shared infra

## What not to prioritize first

Do not move these above the mandatory-first items:

- support chat
- advanced live tracking
- notification center
- real payment gateway
- real SMS/email gateway
- export/report polish

## Expected result

After setup, the project should clearly show:

- foundation demo blockers
- customer flow blockers
- operations flow blockers
- admin oversight blockers
- which tasks are mandatory before advanced features
