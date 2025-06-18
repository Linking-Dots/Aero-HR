Please refactor and reorganize this Laravel Inertia React project to follow an ISO-style file structure:
	•	Create logical folders inside js folder
	•	components/ui – for general reusable UI components
	•	components/icons – for SVG or icon components
	•	features/ – for top-level Inertia pages but not into any subfolder
	. update the jsx resolver from Pages to features, and also update the backend controllers to suppor the new update.

✅ Additionally:
	•	Split large React components into smaller, reusable ones if necessary
	•	Refactor large backend controller methods into smaller private/helper functions in the same class
	•	Adjust import paths accordingly to reflect new locations
	• You can update the GlassCard component which is now in MUI to align with hero UI but keep same ui glassy look, and
• Review UI components for visual consistency with the existing design, which is based on Hero UI and a glassy look, and ui should be common in all features, and MUI should be replaced with hero ui.
• Workarrount for common ui for all features.
	•	If a component’s style clearly does not match (e.g., flat, outdated, or misaligned), update its structure or Tailwind classes only to visually align it with the Hero UI/glassy style already present in the project

❌ Don’t:
	•	Change component or controller logic
	•	Add or remove features
	•	Rename routes or break existing structure
	•	Introduce new third-party libraries or UI systems
	•	Overhaul styles globally — only adjust specific outliers

⚠ Clean separation of concerns into src/frontend and src/backend, with visual consistency in UI, and full Laravel functionality preserved. Focus on modular structure, maintainability, and visual consistency, without breaking behavior or introducing new files unnecessarily.