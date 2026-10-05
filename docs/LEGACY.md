# Earlier implementation references

The supported frontend entry point is frontend/index.html → frontend/src/main.jsx → frontend/src/App.jsx. Run it with the npm scripts in frontend/package.json.

The following files are retained to preserve project experiments:

| Path | Role |
| --- | --- |
| frontend/app/ | Earlier Next.js application |
| frontend/components/ | Components for that earlier Next.js application |
| frontend/next.config.js | Earlier Next.js rewrite configuration |
| frontend/src/components/*Tab.jsx and Navbar.jsx | Earlier API-connected React components |
| frontend/src/utils/web3.js | Earlier ethers wallet helper and illustrative contract configuration |
| static/index.html | CDN/Babel dashboard served by the backend root |
| esp32_bridge.py | Earlier access-point hardware polling bridge |

The current package declares Vite/React dependencies and scripts, not Next.js. The Next.js directories are not an independently installable or validated application.

The earlier references may use simulated values, fixed addresses, API assumptions, or external CDNs. Their claims should not be interpreted as evidence of real deployed integrations.

The active view entry files re-export implementations from WorkspaceViews.jsx; the main dashboard is implemented in DashboardView.jsx.
