# Navigating Between User Interfaces

This project offers three distinct user interfaces to interact with the application: a Web UI, a Tauri-based desktop application, and a Text-based User Interface (TUI). This guide explains how to access and switch between them.

## 1. Web UI (Browser-based)

The Web UI is the standard interface accessible through any modern web browser. It provides a rich, graphical experience.

**How to Access:**

1.  **Start the web server:**
    ```bash
    # (Instruction to start the web server, e.g., npm run dev)
    ```
2.  **Open your browser:** Navigate to the URL provided by the server (e.g., `http://localhost:3000`).

**When to Use:**

- For standard user interactions.
- When you need a full graphical interface.
- For easy access without any local installation (besides a browser).

## 2. Tauri (Desktop Application)

The Tauri application is a native desktop app that wraps the web frontend, providing a more integrated desktop experience.

**How to Access:**

1.  **Build the Tauri application (if not already built):**
    ```bash
    # (Instruction to build the Tauri app, e.g., cargo tauri build)
    ```
2.  **Run the application:**
    ```bash
    # (Instruction to run the Tauri app, e.g., cargo tauri dev)
    ```
    Alternatively, you can run the built executable directly from the `src-tauri/target/release` directory.

**When to Use:**

- For a native desktop experience with potential access to system resources.
- When you want an offline-capable application.
- To have the application in its own window, separate from the browser.

## 3. TUI (Text-based User Interface)

The TUI provides a command-line-based interface for interacting with the application. It's lightweight and ideal for developers or for use in terminal-only environments.

**How to Access:**

1.  **Run the TUI script:**
    ```bash
    # (Instruction to run the TUI, e.g., python run_tui.py)
    ```

**When to Use:**

- For quick interactions without a graphical interface.
- For development and debugging.
- In environments where a GUI is not available (e.g., SSH sessions).

## Switching Between Interfaces

The three interfaces are generally separate applications. To "switch" between them, you simply stop one and start another. They may or may not share state, depending on the application's architecture (e.g., if they all connect to the same backend server or database).

- **From Web UI to Tauri:** Close the browser tab and run the Tauri application.
- **From Tauri to Web UI:** Close the Tauri application window and start the web server.
- **To/From TUI:** The TUI is a separate command-line application. You can run it at any time in your terminal.
