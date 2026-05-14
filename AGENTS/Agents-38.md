## 1. File Name and Directory
`Frontend/src/types/auth.d.ts`

### 2. File Type
Frontend (TypeScript type definitions)

### 3. What the file does
Defines TypeScript interfaces for authentication domain objects — the `User` model and the `AuthContextType` contract used by React context throughout the frontend.

### 4. User Stories
- As a user, I can log in and have my identity (userId, username, role, permissions) available app-wide
- As the app, I can enforce RBAC by checking `allowedWorkflows` from the authenticated user object

### 5. Functions Summary
None (pure type declarations, no runtime code)

### 6. Integration
No direct API calls or database interaction. Types shape the response consumed from the backend auth endpoint (login).

### 7. Imports Summary
No imports. Both interfaces are exported for external consumption.

### 8. Additional Info
`allowedWorkflows` is a string array of `SystemCode` values (e.g. `LEC_EXT`, `PANDOC`) used by the UI to conditionally render tabs. `AuthContextType` is the contract fulfilled by the AuthProvider context wrapper.

### 9. API
Login endpoint is expected to return a JSON body matching the `User` interface (token, userId, username, firstName, lastName, role, allowedWorkflows). `AuthContextType.login` calls this endpoint and hydates context state with the response.
