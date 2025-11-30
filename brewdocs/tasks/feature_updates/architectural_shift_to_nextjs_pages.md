# Architectural Shift: Adopting Next.js Pages

This document outlines the decision to shift the frontend architecture for the BrewAssist DevOps AI Cockpit from a static HTML file to a native Next.js page structure.

## Previous State

- **Entry Point:** The primary user interface was a static HTML file located at `chat-ui/chat.html`.
- **Server:** This file was served by a custom Express server (`server.js`) which also acted as a proxy for API calls.
- **Problem:** This created a disjointed architecture where the frontend was not fully integrated with the Next.js environment, leading to issues with routing, state management, and leveraging the full power of the Next.js framework.

## New Direction

- **Entry Point:** The application's main entry point is now `pages/index.tsx`.
- **Architecture:** We are fully embracing the Next.js pages router paradigm. The UI is composed of React components (e.g., `ChatCommandRouter.tsx`) rendered within a standard Next.js page.
- **Server:** The custom Express server (`server.js`) is no longer needed for serving the frontend. The Next.js development server (`next dev`) handles all page and API route serving.

## Rationale

1.  **Idiomatic Framework Use:** This approach is the standard, recommended way to build applications with Next.js.
2.  **Maintainability:** It creates a more cohesive and maintainable codebase by unifying the frontend and backend within the Next.js project structure.
3.  **Full Feature Set:** It allows us to properly utilize the rich features of Next.js, including server-side rendering (SSR), static site generation (SSG), optimized image loading, and a more powerful routing system.
4.  **Simplified Development:** It removes the complexity of managing a separate Express server for the frontend, simplifying the development and deployment process.

This change establishes a more robust and scalable foundation for the BrewAssist DevOps AI Cockpit.
