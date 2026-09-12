# Parakh 

A lightweight HTML/CSS/Vanilla JavaScript implementation for a packaged-commodity compliance inspection workflow.

## Run locally

No build step is required.

1. Keep the folder structure intact.
2. Open `index.html` in a modern browser.
3. For best results, serve the folder with a small local server (for example VS Code Live Server).

## Structure

- `index.html` — cover, application views and regulatory framework section
- `css/style.css` — visual system and responsive styling
- `js/script.js` — navigation, upload UI, demo screening, history and report export
- `assets/varanasi-ghats.jpeg` — user-provided cover photograph

## n8n integration

The frontend currently uses no inspection data until a connected inspection service returns a result so the interface can be demonstrated without a backend. When the webhook contract is provided, set `CONFIG.N8N_WEBHOOK_URL` in `js/script.js` and replace `normalizeN8nResponse()` with the exact response mapping.

Do not put secrets/API keys in frontend code.

## Regulatory source

The site links to the official Government of India / India Code PDF for the Legal Metrology (Packaged Commodities) Rules, 2011:

https://wbconsumers.gov.in/writereaddata/ACT%20%26%20RULES/Act%20%26%20Rules/9%20The%20Legal%20Metrology%20(Package%20Commodities)%20Rules%2C%202011.pdf

India Code act/rules page:

https://www.indiacode.nic.in/handle/123456789/2102

The Department of Consumer Affairs also publishes amendments and related Legal Metrology material. Always use the current applicable legal text when implementing actual compliance logic.
