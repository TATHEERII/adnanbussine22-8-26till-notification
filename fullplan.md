Final Rules
1 Admin only
Multiple normal Users
User khud account/register create karega? No — here "ledger/register" create.
New Ledger/Register ko doosra authorized User approve karega.
Register banane wala user khud approve nahi kar sakta.
Purchase, Sales, Expenses, Payments bhi doosre authorized User se approve honge.
Admin approval authority nahi hoga; Admin system manage karega.
Approved register ke andar hi transactions enter hongi.
Sirf approved transactions final calculation mein aayengi.
Income page nahi hoga.
Profit/Loss:

Sales − Purchases − Expenses = Profit/Loss
12. Payments ko Profit/Loss mein dobara count nahi karna.
13. Pehle frontend + complete workflow Kilo Code se banega.
14. Database, real authentication aur Cloudflare baad mein connect honge.

🏗️ COMPLETE PROJECT PLAN
Final Pages
1. Login
2. Dashboard
3. Registers / Ledgers
4. Purchase
5. Sales
6. Expenses
7. Payments
8. Account Ledger
9. Approvals
10. Reports
11. Audit Log
12. Admin / Users
13. Settings
🔄 Complete App Workflow
                         LOGIN
                           │
             ┌─────────────┴─────────────┐
             │                           │
           ADMIN                        USER
             │                           │
             │                    Create Register
             │                           │
             │                    Pending Approval
             │                           │
             │                    Other User Reviews
             │                           │
             │                 ┌─────────┴─────────┐
             │                 │                   │
             │              APPROVE             REJECT
             │                 │                   │
             │                 ↓                   ↓
             │            Register Active       Correction
             │                                     │
             │                                  Resubmit
             │
             │
             └──────────── System Management

Active Register ke andar:

Active Register
      │
      ├── Purchase
      ├── Sales
      ├── Expenses
      └── Payments
             │
             ↓
       Pending Approval
             │
       Other User Reviews
             │
       ┌─────┴─────┐
       ↓           ↓
    APPROVE      REJECT
       ↓           ↓
   Final Data   Correction
       │
       ↓
 Account Ledger
       │
       ↓
 Reports
       │
       ↓
 Profit / Loss
👥 ROLE SYSTEM
1. Admin — Only ONE

Admin system ka owner/manager hoga.

Admin can:
Users dekhna
Users activate/deactivate
User permissions manage karna
Users ke registers dekhna
All registers dekhna
All transactions dekhna
Reports dekhna
Audit Log dekhna
Settings manage karna
System monitor karna
Admin cannot:
User ka Register approve nahi karega
User ki Purchase approve nahi karega
User ki Sale approve nahi karega
User ki Expense approve nahi karega
User ki Payment approve nahi karega

Approval users ke darmiyan hoga.

2. Multiple Users

Users:

Registers create karenge
Purchases create karenge
Sales create karenge
Expenses create karenge
Payments create karenge
Doosre users ki requests approve kar sakenge agar unke paas approval permission ho
Golden Rule

Maker ≠ Approver

Example:

Ali → Purchase banata hai
 ↓
Pending Approval
 ↓
Ahmed → Approve

Ali apni purchase approve nahi kar sakta.

⭐ APPROVAL SYSTEM

Har important object ke liye approval system:

Register
Draft
 ↓
Pending Approval
 ↓
Approved / Rejected
Purchase
Draft
 ↓
Pending Approval
 ↓
Approved / Rejected
Sales
Draft
 ↓
Pending Approval
 ↓
Approved / Rejected
Expenses
Draft
 ↓
Pending Approval
 ↓
Approved / Rejected
Payments
Draft
 ↓
Pending Approval
 ↓
Approved / Rejected
STEP 0 — Kilo Code ko MASTER INSTRUCTION

Sabse pehle sirf ye command Kilo Code ko dena.

I want to build a simple web application for an import business.
After that I will give you one page-specific instruction at a time.


When I give a page-specific instruction:


- Work only on that requested page and its required components.
- Do not unnecessarily modify completed pages.
- Preserve the existing design system.
- Preserve existing functionality.


==================================================
FUTURE TECHNOLOGY
==================================================


For now focus on frontend and application workflow.


Do NOT connect a real database yet.
Do NOT connect real authentication yet.
Do NOT deploy yet.


Later I will add:


- Authentication
- Database
- API/backend
- Cloudflare deployment


Therefore keep the architecture modular and ready for future integration.


Use mock/local data where necessary.


==================================================
DESIGN
==================================================


Create a professional but simple business application.


The client is used to physical books, so the interface must be easy to understand.


Use:


- Sidebar
- Header
- Cards
- Tables
- Forms
- Status badges
- Search
- Filters
- Modals/dialogs
- Confirmation messages
- Empty states
- Loading states
- Error states
- Responsive design


Do not overcomplicate the application.


First understand and implement the architecture.
Do not start building detailed pages yet.
STEP 1 — PROJECT FOUNDATION

Master command ke baad ye command:

Set up the project foundation for the Import Business Accounting Web App according to the master instructions.


For this step ONLY:


1. Create the project structure.
2. Create the main application layout.
3. Create the sidebar.
4. Create the top header.
5. Create routing/navigation.
6. Create reusable UI components.
7. Create reusable:
   - Buttons
   - Cards
   - Inputs
   - Selects
   - Tables
   - Modals
   - Status badges
   - Form layouts
8. Create placeholder pages for all planned modules.
9. Make the application responsive.
10. Create a consistent professional business design system.


Create routes/placeholders for:


- Login
- Dashboard
- Registers
- Purchase
- Sales
- Expenses
- Payments
- Account Ledger
- Approvals
- Reports
- Audit Log
- Admin / Users
- Settings


IMPORTANT:


Do not implement real authentication.
Do not implement real database.
Do not implement Cloudflare.
Do not build detailed page functionality.


Only build the foundation and application shell.


Make sure the project runs successfully.
STEP 2 — LOGIN
Build the Login page.


Requirements:


- Email/Username
- Password
- Show/hide password
- Login button
- Validation
- Error state
- Loading state
- Professional simple design
- Responsive design


The application has:


- Exactly ONE Admin
- Multiple Users


For now use mock authentication only.


Do not connect a real authentication service.


After successful mock login, route to Dashboard.


Do not modify other completed pages unnecessarily.
STEP 3 — DASHBOARD
Build the Dashboard page.


Keep the dashboard simple and suitable for a business that currently uses physical books.


Show:


- Active Registers
- Total Sales
- Total Purchases
- Total Expenses
- Total Payments
- Net Profit/Loss
- Pending Approvals


Add date filters:


- Today
- This Week
- This Month
- Custom Range


Add Recent Transactions table:


- Date
- Register
- Type
- Description
- Amount
- Created By
- Status


Only APPROVED transactions should be included in final Sales, Purchases, Expenses and Profit/Loss calculations.


Add a clear Profit/Loss summary.


Use mock data.


Do not add real database or authentication.
STEP 4 — REGISTERS / LEDGERS ⭐

Ye sabse important page hai.

Build the Registers / Ledgers page.
Another authorized User sees it in Approvals.


That different User can:


- View
- Approve
- Reject


If approved:
Register becomes Active.


If rejected:
Register becomes Rejected.
The creator can edit and resubmit.


IMPORTANT:


The creator cannot approve their own Register.


Create a Register list/table with:


- Register Name
- Owner
- Type
- Opening Balance
- Created Date
- Status
- Actions


Add:


- Create Register
- View
- Edit Draft
- Submit
- Search
- Status filter


Use mock/local data.


Do not connect database yet.
STEP 5 — PURCHASE
Build the Purchase page.


- Save Draft
- Submit for Approval


Statuses:


- Draft
- Pending Approval
- Approved
- Rejected


Rules:


1. User can create Purchase only inside an Active Register.
2. Creator cannot approve their own Purchase.
3. A DIFFERENT authorized User approves/rejects the Purchase.
4. Admin is not the financial transaction approver.
5. Rejected Purchase requires rejection reason.
6. Rejected Purchase can be corrected and resubmitted.
7. Only Approved Purchase affects final calculations.


Add:


- Search
- Date filter
- Register filter
- Status filter
- Purchase history table


Use mock data.
STEP 6 — SALES
Build the Sales page.


Fields:


- Sale Number
- Date
- Register
- Customer/Party Name
- Description
- Amount
- Payment Status
- Notes
- Optional Attachment


Actions:


- Save Draft
- Submit for Approval


Statuses:


- Draft
- Pending Approval
- Approved
- Rejected


Rules:


1. Only Active Registers can receive Sales.
2. Creator cannot approve own Sale.
3. Different authorized User approves/rejects.
4. Rejection requires reason.
5. Rejected Sale can be edited and resubmitted.
6. Only Approved Sales affect Profit/Loss.


Add search and filters.


Use mock data.
STEP 7 — EXPENSES
Build the Expenses page.


Expense fields:


- Expense Number
- Date
- Register
- Expense Category
- Description
- Amount
- Paid Through
- Notes
- Optional Receipt


Categories:


- Transport
- Office
- Salary
- Electricity
- Customs
- Delivery
- Other


Actions:


- Save Draft
- Submit for Approval


Statuses:


- Draft
- Pending Approval
- Approved
- Rejected


Rules:


- Only Active Register can receive Expense.
- Creator cannot approve own Expense.
- Different authorized User approves/rejects.
- Rejection requires reason.
- Only Approved Expenses affect Profit/Loss.


Add:


- Search
- Date filter
- Category filter
- Register filter
- Status filter
STEP 8 — PAYMENTS
Build the Payments page.


Payments belong to an Active Register.


Payment fields:


- Payment Number
- Date
- Register
- Type:
  - Paid
  - Received
- Party Name
- Reference
- Amount
- Payment Method:
  - Cash
  - Bank
- Description
- Notes


Actions:


- Save Draft
- Submit for Approval


Statuses:


- Draft
- Pending Approval
- Approved
- Rejected


Rules:


1. Creator cannot approve own Payment.
2. Different authorized User approves/rejects.
3. Rejection requires reason.
4. Approved Payments appear in Payment records and Ledger.


IMPORTANT:


Do NOT include Payments again in Profit/Loss.


Payments are settlement/cash movement records.


Add:


- Search
- Date filter
- Register filter
- Paid/Received filter
- Status filter
STEP 9 — ACCOUNT LEDGER
Build the Account Ledger page.


The Account Ledger should look similar to a simple physical business book.


Show only approved/final transactions.


Columns:


- Date
- Register
- Reference Number
- Transaction Type
- Description
- Debit
- Credit
- Balance


Transaction types:


- Purchase
- Sale
- Expense
- Payment


Add:


- Register filter
- Date filter
- Transaction type filter
- Search
- Total Debit
- Total Credit
- Running Balance
- Print
- Export placeholder


IMPORTANT:


Do NOT build complex double-entry accounting.


Keep the ledger simple.


Pending and Rejected transactions must not appear as final ledger records.
STEP 10 — APPROVALS ⭐⭐⭐
Build the Approvals page.


IMPORTANT BUSINESS RULE:


There is ONE Admin and MULTIPLE Users.


The Admin is NOT the transaction/register approver.


Approvals are performed by authorized Users.


A User MUST NOT approve their own request.


Create these approval sections:


1. Register Approvals
2. Purchase Approvals
3. Sales Approvals
4. Expense Approvals
5. Payment Approvals


Each pending item should show:


- Reference Number
- Register
- Created By
- Date
- Type
- Amount
- Description
- Status


Actions:


- View Details
- Approve
- Reject
STEP 11 — REPORTS
Build the Reports page.


Reports required:


1. Sales Report
2. Purchase Report
3. Expense Report
4. Payment Report
5. Profit/Loss Report
6. Register Summary


Filters:


- Register
- Date Range
- Transaction Type
- Status


Profit/Loss formula:


Total Approved Sales
- Total Approved Purchases
- Total Approved Expenses
= Net Profit/Loss


IMPORTANT:


Payments must NOT be added to or subtracted from Profit/Loss.


Show:


Total Sales
Total Purchases
Total Expenses
Net Profit/Loss


If result is positive:
Profit


If result is negative:
Loss


Add:


- Print
- Export placeholder


Use mock data.
STEP 12 — AUDIT LOG
Build the Audit Log page.


The Audit Log should record important actions.


Record:


- User
- Action
- Module
- Reference
- Register
- Date
- Time
- Description
- Old Status
- New Status


Actions include:


- Register Created
- Register Submitted
- Register Approved
- Register Rejected
- Purchase Created
- Purchase Submitted
- Purchase Approved
- Purchase Rejected
- Sale Created
- Sale Submitted
- Sale Approved
- Sale Rejected
- Expense Created
- Expense Submitted
- Expense Approved
- Expense Rejected
- Payment Created
- Payment Submitted
- Payment Approved
- Payment Rejected
- Login
- Logout
STEP 13 — ADMIN / USERS
Build the Admin / Users page.
- Monitor all Registers
- Monitor all transactions


Admin does NOT approve Registers or financial transactions.


Approval actions belong to authorized Users.


User list:


- Name
- Username
- Email
- Status
- Number of Registers
- Created Date
- Last Activity
- Actions


Add:


- Search
- Status filter
- User details
- Activate/Deactivate
- Permission management


Do NOT create a second Admin.


Use mock data for now.
STEP 14 — SETTINGS
Build the Settings page.


Keep it simple.


Sections:


BUSINESS:


- Business Name
- Logo
- Phone
- Email
- Address


CURRENCY:


- Default Currency


REGISTER:


- Register numbering format


TRANSACTIONS:


Purchase:
PUR-00001


Sales:
SAL-00001


Expense:
EXP-00001


Payment:
PAY-00001


APPROVAL SETTINGS:


Register approval:
Authorized User


Purchase approval:
Authorized User


Sales approval:
Authorized User


Expense approval:
Authorized User


Payment approval:
Authorized User


IMPORTANT:


Admin can configure system settings.
STEP 15 — COMPLETE TESTING

Sab pages complete hone ke baad ye last command dena:

Perform a complete end-to-end test of the Import Business Accounting Web App.


Test the following:


USER / REGISTER:


1. Multiple Users can exist.
2. User can create a Register.
3. Register starts as Draft.
4. User submits Register.
5. Register becomes Pending Approval.
6. A DIFFERENT authorized User can see it.
7. The creator cannot approve it.
8. Different authorized User can approve it.
9. Approved Register becomes Active.
10. Rejected Register requires rejection reason.
11. Rejected Register can be corrected and resubmitted.


PURCHASE:


12. User can create Purchase only in Active Register.
13. Purchase can be submitted.
14. Different User can approve it.
15. Creator cannot approve it.
16. Rejected Purchase does not affect final calculations.


SALES:


17. User can create Sale.
18. Different User approves Sale.
19. Creator cannot approve Sale.
20. Approved Sale affects Profit/Loss.


EXPENSES:


21. User can create Expense.
22. Different User approves Expense.
23. Creator cannot approve Expense.
24. Approved Expense affects Profit/Loss.


PAYMENTS:


25. User can create Payment.
26. Different User approves Payment.
27. Creator cannot approve Payment.
28. Approved Payment appears in Ledger.
29. Payment is NOT counted again in Profit/Loss.


LEDGER:


30. Only approved/final transactions appear in final Ledger.
31. Running balance works correctly.
32. Register filter works.


REPORTS:


33. Sales report works.
34. Purchase report works.
35. Expense report works.
🗂️ Final Kilo Code Development Order

Isi exact order mein commands dena:

#	Kilo Code ko kya dena hai
0	Master Project Instruction
1	Project Foundation
2	Login
3	Dashboard
4	Registers / Ledgers
5	Purchase
6	Sales
7	Expenses
8	Payments
9	Account Ledger
10	Approvals
11	Reports
12	Audit Log
13	Admin / Users
14	Settings
15	Complete Testing
⚠️ Ek bohat important baat

Kilo Code ko ek saath 15 commands mat dena.

Har step ke baad:

Command → Kilo Code ka result → VS Code mein run/check → agar theek hai → next command.

Aur abhi database/authentication/Cloudflare mat lagana. Pehle frontend aur workflow complete karna hai. Uske baad next phase mein hum isi structure ke liye database tables, authentication, user permissions, approval logic aur Cloudflare deployment ka separate plan bana sakte hain.

Final business logic ek line mein:

Multiple Users → apne Registers banayen → doosra authorized User approve kare → Register Active ho → Users transactions enter karein → doosra User approve kare → approved data Ledger mein aaye → Sales − Purchases − Expenses se final Profit/Loss nikle → Audit Log sab record kare → ONE Admin poori application manage kare.