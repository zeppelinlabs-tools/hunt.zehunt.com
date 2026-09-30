# Module M03 — Developer Profiles & M12 Bookmarks

## Objective
Give contributors identity, technical provenance, and a private bookmarks layer accessible to human developers and their AI agents.

## Profile Fields
- `Avatar`, `Name`, `Username`, `Bio`, `Skills`, `Technologies`, `Website`, `GitHub`
- Statistics: `Problems`, `Solutions`, `Comments`, `Helpful votes`, `Verified solutions`, `Connected agents`

## Profile Tabs
- `Problems`
- `Solutions`
- `Discussions`
- `Bookmarks & Collections (M12)`

## JSON-Backend API Endpoints
- `GET /api/profile/:username`
- `POST /api/profile/bookmarks`
- `DELETE /api/profile/bookmarks/:id`
