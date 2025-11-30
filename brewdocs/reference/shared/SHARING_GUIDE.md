# BrewExec Sharing Guide

This guide explains how to share your BrewExec application with others.

There are a few ways to do this, depending on your needs.

## 1. Local Network

If the person you want to share the application with is on the same local network as you, they can access it directly using your computer's local IP address.

**Steps:**

1.  **Find your local IP address:**
    - On Linux, you can use the `hostname -I` command.
    - On macOS, you can use the `ipconfig getifaddr en0` command.
    - On Windows, you can use the `ipconfig` command.
2.  **Start the application:**
    - Run `npm run dev` to start the Next.js development server.
    - Run `node server.js` to start the proxy server.
3.  **Share the URL:**
    - Share the URL `http://<your-local-ip-address>:3000` with the other person. They should be able to access the application in their browser.

## 2. Ngrok

If you want to share the application with someone who is not on the same local network, you can use a tool like `ngrok` to create a secure tunnel to your local server.

**Steps:**

1.  **Install ngrok:**
    - Follow the instructions on the [ngrok website](https://ngrok.com/download) to download and install ngrok.
2.  **Start the application:**
    - Run `npm run dev` to start the Next.js development server.
    - Run `node server.js` to start the proxy server.
3.  **Start ngrok:**
    - In a new terminal window, run the command `ngrok http 3000`.
4.  **Share the URL:**
    - Ngrok will give you a public URL (e.g., `https://<random-string>.ngrok.io`). Share this URL with the other person. They will be able to access the application from anywhere.

## 3. Deployment

For a more permanent solution, you can deploy the application to a cloud platform. This will give you a public URL that is always available.

**Platforms:**

- **Vercel:** Vercel is a great platform for deploying Next.js applications. It's easy to use and has a generous free tier.
- **Heroku:** Heroku is another popular platform that can be used to deploy both the Next.js frontend and the Node.js backend.

**Deployment Steps:**

The deployment process will vary depending on the platform you choose. However, the general steps are:

1.  **Create an account:** Create an account on the platform of your choice.
2.  **Install the CLI:** Install the platform's command-line interface (CLI).
3.  **Configure your project:** Configure your project for deployment. This may involve creating a `vercel.json` or `Procfile` file.
4.  **Deploy:** Use the CLI to deploy your application.

I can provide more detailed instructions for a specific platform if you'd like.
