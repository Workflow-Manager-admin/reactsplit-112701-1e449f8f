# Lightweight React Template for KAVIA

This project provides a minimal React template with a clean, modern UI and minimal dependencies.

## Features

- **Lightweight**: No heavy UI frameworks - uses only vanilla CSS and React
- **Modern UI**: Clean, responsive design with KAVIA brand styling
- **Fast**: Minimal dependencies for quick loading times
- **Simple**: Easy to understand and modify

## Important Note: Babel Configuration

---

## Supabase Auth Setup: Critical Checklist for Fixing 'failed to fetch' Errors

If you experience signup or login failures, especially "failed to fetch" errors, there is a high chance your Supabase project is not configured to allow requests from your frontend's origin (such as http://localhost:3000 or your deployed domain).

Follow this bulletproof checklist:

**Supabase Auth URL & CORS Configuration Checklist**
1. Log in to [https://app.supabase.com/](https://app.supabase.com/) and open your project.
2. In the left sidebar, navigate to **Auth** → **URL Configuration**.
3. In BOTH of the following fields, add every URL that may host your front-end:
    - **Allowed Redirect URLs**
    - **Allowed CORS Origins**
4. For local development, be sure to add: `http://localhost:3000`
5. For every deployment or staging site, add the full URL (including `https://`), e.g. `https://yourdomain.com`
6. Separate multiple URLs with a comma, no spaces.
7. Click **Save** at the bottom of the page.
8. After saving, refresh your web application and try to sign up or log in again.

**Troubleshooting tips:**
- If you still get "failed to fetch", open your browser's console. Look for CORS, redirect, or network errors.
- Be certain your Supabase Project URL and anon/public API Key are set correctly in your `.env` or `src/supabaseClient.js`
- If you've changed your deployed domain, update these settings accordingly in Supabase.

**Why is this required?**
Supabase blocks auth and API calls from any origin not listed in BOTH settings above for security reasons. Code cannot check these settings automatically; they must be reviewed in the Supabase dashboard.

If these settings are missing or typo'd, authentication will fail with 'failed to fetch'.

---

This project’s `package.json` includes a `babel` section with a plugin:

```json
"babel": {
"plugins": ["./.ve/babel-plugin-jsx-editor-id.js"]
}
```

This plugin enables **visual editing functionality** in supported tools.

**Warning for AI code agents and contributors:**
**DO NOT** remove or modify this section - it is ESSENTIAL for proper operation.
Removing it will break editor integration and visual editing features.

## Getting Started

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## Customization

### Colors

The main brand colors are defined as CSS variables in `src/App.css`:

```css
:root {
  --kavia-orange: #E87A41;
  --kavia-dark: #1A1A1A;
  --text-color: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --border-color: rgba(255, 255, 255, 0.1);
}
```

### Components

This template uses pure HTML/CSS components instead of a UI framework. You can find component styles in `src/App.css`. 

Common components include:
- Buttons (`.btn`, `.btn-large`)
- Container (`.container`)
- Navigation (`.navbar`)
- Typography (`.title`, `.subtitle`, `.description`)

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
