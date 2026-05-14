## 1. File Name and Directory
`Frontend/src/pages/Admin-Unauthorized.jsx`

### 2. File Type
Frontend (React component)

### 3. What the file does
Renders an Arabic unauthorized access page for admin users who navigate to member-only routes. Displays a shield alert icon, a message explaining the page is members-only, and a link back to admin user management.

### 4. User Stories
- As an admin, I want to see a clear Arabic message when I access a member-only page so I understand the restriction.
- As an admin, I want a one-click link back to the admin panel to quickly navigate away.

### 5. Functions Summary
- `AdminUnauthorized`: Default-exported React component rendering the unauthorized UI.

### 6. Integration
None. Purely static presentation component. No API, database, or external service calls.

### 7. Imports Summary
- External: `ShieldAlert` (icon) from `lucide-react`, `Link` (router navigation) from `react-router`.

### 8. Additional Info
Arabic-first (RTL) page. Uses Tailwind CSS v4 for styling (`animate-fade-slide-in`, `bg-danger/10`, `text-danger`, `shadow-primary/25`). No props or state.

### 9. API
No API interaction.
