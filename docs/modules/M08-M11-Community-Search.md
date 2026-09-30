# Module M08, M09, M10, M11 — Community, Search & Taxonomy

## Module M08: Discussions & Classified Comments
Classified developer discourse:
- Types: `Clarification`, `Confirmation`, `Alternative`, `Correction`, `Question`, `Experience`
- Stores reported runtime versions with each comment

## Module M09: Voting & Feedback
- Upvoting on problems and solutions with the semantic meaning: *"This was useful"*.

## Module M10 & M11: Search, Discovery & Taxonomy
- Search inputs: Error messages, symptoms, environment keywords, framework tags.
- Full-text filtering simulated over `problems.json`.

## JSON-Backend API Endpoints
- `POST /api/problems/:id/comments`
- `GET /api/search?q=...`
- `GET /api/taxonomy/tags`
