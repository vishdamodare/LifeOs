# LifeOS - Expense Splitting & Instant Reimbursement Platform

## Project Overview

LifeOS is a web application that allows users to pay for a shared expense and instantly request reimbursements from friends, family, roommates, or groups.

The core philosophy is:

**Pay once. Split instantly. Get paid back effortlessly.**

The application should remove the friction of:

* Calculating who owes what.
* Sending payment requests manually.
* Reminding friends repeatedly.
* Tracking pending payments.

The product should be simple, fast, and focused.

---

# Problem Statement

Current solutions require multiple steps:

1. User pays for something.
2. Calculates everyone's share manually.
3. Sends messages asking for money.
4. Tracks who has paid.
5. Sends reminders.

LifeOS combines all of this into one workflow.

---

# Primary Use Cases

### Dining with Friends

You pay ₹5,000 for dinner.

Split:

* Rahul: ₹1,500
* Priya: ₹1,500
* Karan: ₹2,000

Friends receive payment requests and can reimburse you immediately.

---

### Group Trip

You pay for hotel, food, and transportation.

Each expense is split among group members and payment statuses are tracked.

---

### Roommates

One person pays rent, electricity, or groceries and requests contributions from everyone else.

---

# Target Users

* College students
* Friends
* Roommates
* Families
* Small travel groups

---

# Platform

* Responsive Web Application (WebApp)
* Mobile-first design
* PWA ready for future support

---

# Design Principles

### Simplicity

The app should feel extremely easy to use.

### Minimal Steps

A user should create an expense within 30 seconds.

### Clean Interface

Avoid unnecessary features and clutter.

### Trust

Since money is involved, the interface should feel secure and reliable.

---

# Core Features (MVP)

## 1. Authentication

### Login Methods

* Phone Number + OTP
* Sign Up
* Logout

### User Profile

* Name
* Profile Picture
* Phone Number
* UPI ID

---

# 2. Dashboard

Sections:

### Money You Owe

Display all pending payments.

### Money You Will Receive

Display all reimbursements pending from others.

### Recent Expenses

### Quick Actions

* New Expense
* New Group

---

# 3. Friends Management

### Add Friend

By:

* Phone Number
* Username (future)

### Friend Profile

* Name
* Total Pending Amount
* Shared Expenses

---

# 4. Group Management

### Create Group

Examples:

* Goa Trip
* Flatmates
* College Friends

### Group Details

* Group Name
* Group Icon
* Members List
* Shared Expenses

---

# 5. Create Expense

Fields:

* Title
* Description
* Amount
* Paid By
* Participants
* Group (optional)

---

# Split Methods

### Equal Split

Example:
₹4,000 / 4 = ₹1,000 each.

---

### Percentage Split

Example:
20%
30%
50%

---

### Custom Amount Split

Example:
Rahul: ₹500
Priya: ₹1,000
Karan: ₹2,500

Validation:
Total split amount must equal expense amount.

---

# 6. Expense Details Page

Show:

Expense Name
Total Amount
Paid By
Participants
Individual Shares
Status

Payment status:

* Paid
* Pending
* Overdue

---

# 7. Payment Collection

Every participant receives:

Notification:
"You owe ₹500 for Dinner."

CTA Button:

Pay ₹500

Payment should open UPI payment flow.

---

# 8. Notifications

### New Expense Request

### Payment Received

### Reminder Notifications

Reminder Schedule:

* After 1 day
* After 3 days
* After 7 days

---

# 9. Activity Timeline

Examples:

Rahul paid ₹500.

Priya was added to Goa Trip.

Hotel expense created.

---

# Pages Required

## Authentication

* Login
* Signup
* OTP Verification

## Main Application

* Dashboard
* Friends
* Groups
* Create Expense
* Expense Details
* Notifications
* Profile
* Settings

---

# Dashboard Widgets

## Pending to Pay

## Pending to Receive

## Total Expenses

## Recent Activity

---

# Navigation

Bottom Navigation:

Home
Groups
Friends
Notifications
Profile

Desktop:
Left Sidebar Navigation.

---

# User Flow

## Create Expense Flow

Dashboard
→ Create Expense
→ Enter Details
→ Add Participants
→ Select Split Method
→ Review
→ Send Requests

---

## Payment Flow

Notification
→ Expense Details
→ Pay Now
→ Open UPI
→ Payment Success
→ Status Updated

---

# Empty States

No Friends Added

No Groups Created

No Expenses Yet

No Notifications

---

# Error Handling

Invalid Amount

Split Total Mismatch

Network Failure

Payment Failure

Friend Not Registered

---

# Design System

Style:
Modern Fintech

Color Palette:

* Primary: Deep Blue
* Success: Green
* Warning: Orange
* Error: Red
* Background: Light Gray / White

Typography:
Clean and highly readable.

Border Radius:
12px–16px.

Cards:
Soft shadows.

Animations:
Subtle and smooth.

---

# Security Considerations

OTP Authentication

Input Validation

Secure APIs

Rate Limiting

Encrypted Sensitive Data

---

# Non-Functional Requirements

Fast loading.

Responsive.

Accessible.

Scalable architecture.

Minimal clicks.

Simple onboarding.

---

# Features Explicitly Excluded from MVP

No wallet.

No chat.

No social feed.

No rewards.

No budgeting.

No investments.

No AI features.

No subscriptions.

No expense analytics.

No multi-currency support.

No lending system.

---

# Success Metrics

* Time to create expense < 30 seconds.
* Payment request success rate > 95%.
* User can understand the app without onboarding tutorials.
* User can see who paid and who hasn't within one screen.

---

# Product Vision

LifeOS should become the easiest way to split expenses and collect money from friends without awkward reminders or manual tracking.
