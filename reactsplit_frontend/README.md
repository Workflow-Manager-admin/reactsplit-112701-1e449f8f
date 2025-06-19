# Lightweight React Template for KAVIA

This project provides a minimal React template with a clean, modern UI and minimal dependencies.

## Features

- **Lightweight**: No heavy UI frameworks - uses only vanilla CSS and React
- **Modern UI**: Clean, responsive design with KAVIA brand styling
- **Fast**: Minimal dependencies for quick loading times
- **Simple**: Easy to understand and modify

## Important Note: Babel Configuration

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

## Deployment Guide

You can deploy ReactSplit to Vercel, Netlify, or any static site host that supports React. The app is ready for one-click deploy.  
See below for deployment and build steps.

### 1. Environment Variables

Before deploying, ensure you have a `.env` file (never commit secrets!) in your project root. Use `.env.example` as a template and fill in any secrets/keys, such as for Supabase:

```
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. Build the Project

Build for production:

```sh
npm run build
```
This produces an optimized `build/` folder for deploy.

### 3. Deploy on Vercel/Netlify

**On Vercel:**
1. Import your Git repository at [vercel.com](https://vercel.com/).
2. Set your environment variables (`REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`) in the project settings.
3. The default build command (`npm run build`) and publish directory (`build`) are correct.
4. Click Deploy.  
5. After the build finishes, your app will be live!

**On Netlify:**
1. Connect your Git repo at [netlify.com](https://app.netlify.com/).
2. In Site Settings > Environment Variables, add the required variables.
3. Build command: `npm run build`
4. Publish directory: `build`
5. Click Deploy Site.

### 4. One-Click Deploy

Both Vercel and Netlify will handle build and deployment from your repo automatically on push. Make sure your `.env` config is set in their dashboards.

### 5. For Local Production Preview

```sh
npm run build
# Then use any static server, e.g.:
npx serve -s build
```

## Troubleshooting

- If your build fails due to missing environment variables, double-check `.env` setup in your platform's dashboard.
- All Supabase/API keys must use the `REACT_APP_` prefix to be accessible in React.

### Deployment (see above for in-repo instructions)

Online doc: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
