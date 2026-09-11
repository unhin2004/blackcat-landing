
## Analytics

Vercel Web Analytics is enabled on the project. Every public page carries
`<script defer src="/_vercel/insights/script.js">`; the script is served only
by deployments made after Web Analytics was switched on, so re-deploy after
toggling it. Google Analytics runs under Consent Mode and counts only visitors
who accept.
