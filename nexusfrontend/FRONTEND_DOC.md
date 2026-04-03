# NexusNode AI Frontend Documentation

## 1. Overview

This document covers the current frontend implementation in `nexusfrontend`, including:

- Route pages
- Shared UI components
- Zustand stores
- Packages in use
- The active functions that power the frontend

The frontend now uses Zustand for state management instead of React context for the main app state.

## 2. Packages

### 2.1 Runtime Packages

| Package | Version | Purpose |
| --- | --- | --- |
| `@react-three/drei` | `^10.7.7` | Helper utilities for React Three Fiber scenes. |
| `@react-three/fiber` | `^9.5.0` | React renderer for Three.js, used by the Antigravity background. |
| `@types/three` | `^0.183.1` | Type definitions for Three.js. |
| `framer-motion` | `^12.34.3` | Page and component animations. |
| `lucide-react` | `^0.575.0` | Icon library used across the UI. |
| `next` | `16.2.2` | App Router framework and routing layer. |
| `react` | `19.2.4` | UI runtime. |
| `react-dom` | `19.2.4` | React DOM renderer. |
| `react-hot-toast` | `^2.6.0` | Toast notifications for uploads and chat actions. |
| `recharts` | `^3.7.0` | Radar chart and analytics visuals in the dashboard. |
| `three` | `^0.183.1` | Three.js core for the animated particle background. |
| `zustand` | `^5.0.12` | Client state management for auth and dashboard state. |

### 2.2 Dev Packages

| Package | Version | Purpose |
| --- | --- | --- |
| `@tailwindcss/postcss` | `^4` | Tailwind CSS PostCSS integration. |
| `babel-plugin-react-compiler` | `1.0.0` | React Compiler support. |
| `eslint` | `^9` | Linting. |
| `eslint-config-next` | `16.2.2` | Next.js lint rules. |
| `tailwindcss` | `^4` | Utility CSS framework. |

## 3. State Stores

### 3.1 `src/store/authStore.js`

The auth store owns the login/signup flow state.

| Function | Purpose |
| --- | --- |
| `useAuth` | Zustand store hook for authentication state. |
| `switchView(view)` | Switches between login and signup views and stores the direction value. |
| `login(data)` | Sets a user object for login flow state. |
| `signup(data)` | Sets a user object for signup flow state. |
| `logout()` | Clears the current user. |

### 3.2 `src/store/globalStore.js`

The global store owns dashboard state, document vault state, and chat state.

| Function | Purpose |
| --- | --- |
| `useGlobal` | Zustand store hook for shared dashboard state. |
| `setActiveSection(activeSection)` | Changes the dashboard section. |
| `setSidebarOpen(sidebarOpen)` | Opens or closes the sidebar. |
| `setIsUploading(isUploading)` | Toggles the upload overlay. |
| `setDocuments(documents)` | Replaces the document list. |
| `setSelectedDocument(selectedDocument)` | Updates the active document in chat. |
| `setMessages(messages)` | Replaces the chat message list. |
| `setIsProcessing(isProcessing)` | Toggles the AI typing state. |
| `setOverviewData(updater)` | Updates overview metrics. |
| `handleFileUpload(e)` | Simulates file ingestion and adds a new document. |
| `handleDeleteDoc(id)` | Removes a document and clears the selected document if needed. |
| `sendMessage(text)` | Adds a user message and simulates an assistant response with sources. |

## 4. Shared State Management

### 4.1 Zustand Migration

- [🟢] **Zustand Migration (Completed):** Decoupled UI state logic from the component tree by establishing atomic stores for auth and dashboard state. Both `authStore.js` and `globalStore.js` are fully operational and used across the frontend.
  - Auth state (login/signup view switching, user session) managed by `useAuth()` hook.
  - Dashboard state (section routing, sidebar, documents, chat, uploads) managed by `useGlobal()` hook.
  - All components (Dashboard, Chat, Documents, Overview, Settings) now consume Zustand stores instead of React Context.
  - Previous context files (`authContext.js`, `globalContext.js`) have been removed.

---

## 5. Route Pages

### 5.1 `src/app/layout.js`

| Function | Purpose |
| --- | --- |
| `RootLayout({ children })` | Defines the HTML shell, fonts, metadata, and wraps the app in the shared layout wrapper. |

### 5.2 `src/component/LayoutWrapper.js`

| Function | Purpose |
| --- | --- |
| `LayoutWrapper({ children })` | Shows the public header and footer on public routes and hides them on dashboard/auth routes. |

### 5.3 `src/app/page.js`

| Function | Purpose |
| --- | --- |
| `Home()` | Landing page with hero content, product preview, and CTA buttons. |
| `FeatureCard({ feature, index })` | Animated feature tile used in the landing page feature section. |
| `handleMouseMove({ currentTarget, clientX, clientY })` | Tracks pointer position inside a feature card for the glow effect. |

### 5.4 `src/app/auth/login/page.js`

| Function | Purpose |
| --- | --- |
| `AuthPage()` | Full auth experience with login, signup, and verification states. |
| `handleCodeChange(index, value)` | Handles one-digit verification code input and auto-advances focus. |
| `handleKeyDown(index, e)` | Moves focus backward on backspace in the verification code flow. |
| `AnimatedBackground()` | Renders the animated glowing background used on the auth split view. |
| `ContentCarousel({ mode })` | Rotating side-panel content that changes between login and signup themes. |
| `FormInput({ icon, label, placeholder, type, isPassword, showPass, setShowPass })` | Shared input component for login and signup forms. |

### 5.5 `src/app/dashboard/page.js`

| Function | Purpose |
| --- | --- |
| `Dashboard()` | Main dashboard shell with sidebar, top bar, and section routing. |
| `handleNavClick(key)` | Updates the active dashboard section and closes the sidebar on mobile. |
| `handleClickOutside(event)` | Closes the user menu when clicking outside it. |

## 6. Dashboard Components

### 6.1 `src/component/dashboard/overView.js`

| Function | Purpose |
| --- | --- |
| `OverviewView()` | Dashboard overview screen refactored to an intelligence-only layout with compact metrics, semantic search focus, and analytics visuals. |

### 6.2 `src/component/dashboard/document.js`

| Function | Purpose |
| --- | --- |
| `DocumentsView()` | Document vault screen with search, upload, delete, and chat launch actions. |

### 6.3 `src/component/dashboard/NexusChat.js`

| Function | Purpose |
| --- | --- |
| `NexusChatInterface()` | Main chat workspace for selecting documents and chatting against them. |
| `selectDoc(doc)` | Selects a document and opens the chat view. |
| `closeDoc()` | Clears the current document selection and returns to the document list. |
| `handleSend()` | Sends the current input text to the store and clears the input. |

### 6.4 `src/component/dashboard/Setting.js`

| Function | Purpose |
| --- | --- |
| `SettingsView()` | Settings panel for model/provider selection and vault actions. |

## 7. Shared UI Components

### 7.1 `src/component/Button.js`

| Function | Purpose |
| --- | --- |
| `GlassButton({ children, variant, className, onClick })` | Reusable glass-style button with animated hover and press states. |

### 6.2 `src/component/Antigravity.js`

| Function | Purpose |
| --- | --- |
| `AntigravityInner(props)` | Renders and animates the particle field inside the canvas. |
| `handleMouseMove(event)` | Tracks pointer motion across the window and feeds it into the particle animation. |
| `Antigravity(props)` | Wraps the Three.js canvas and mounts the animated background. |

### 6.3 `src/app/header-footer/header.js`

| Function | Purpose |
| --- | --- |
| `Header()` | Public site header with responsive navigation and auth button. |
| `handleScroll()` | Tracks scroll position to switch the header style. |
| `AuthButton({ mobile })` | Shared login/launch call-to-action for desktop and mobile header layouts. |

### 6.4 `src/app/header-footer/footer.js`

| Function | Purpose |
| --- | --- |
| `FloatingFooter()` | Public footer with social links, resource links, and project branding. |

## 7. Removed Legacy Context Files

The frontend no longer uses React context for auth or dashboard state. Zustand stores are the active source of truth.

| File | Status | Notes |
| --- | --- | --- |
| `src/context/authContext.js` | Removed | Replaced by `src/store/authStore.js`. |
| `src/context/globalContext.js` | Removed | Replaced by `src/store/globalStore.js`. |

## 8. Current Frontend Flow

### 8.1 Public Surface

- Landing page presents the product pitch and routes users into the app.
- Auth page handles login, signup, and verification states.
- Public header and footer are shown on non-dashboard routes.

### 8.2 App Surface

- Dashboard shell drives the active section state from the global store.
- Overview, documents, chat, and settings views are switched from the same store.
- Uploads, deletions, and chat replies are managed through Zustand actions.
- The desktop sidebar now supports a compact rail state instead of disappearing when collapsed.
- The overview screen is tuned for the 1240x464 constraint and centers the semantic search workflow.

### 8.3 Animation and Interaction Layer

- Framer Motion handles page transitions and component entrance effects.
- The Antigravity background provides the animated hero/auth backdrop.
- GlassButton provides a consistent CTA style across the app.

## 9. Notes

- The frontend is currently using mock document data and simulated chat responses.
- The auth flow is visual/UI-only and does not yet connect to a backend session API.
- The dashboard stores are now the single source of truth for the current frontend state.
