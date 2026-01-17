# Feature: Save and display sketch preview thumbnails

## Summary
When a sketch is saved, capture a small image of the current canvas and store it with the sketch so users can see a thumbnail preview in their sketch list/dashboard.

## Current Behavior
- Saving a sketch persists files and metadata only.
- The sketch list shows name, dates, and visibility, but no visual preview.

## Desired Behavior
- On save (manual and shortcuts), the editor requests a canvas snapshot from the running preview, scales it to a reasonable size, and includes it in the save payload.
- The backend stores the preview image with the project and returns it in project list/detail responses.
- The dashboard sketch list shows a preview thumbnail (with a placeholder when none exists).

## Acceptance Criteria
- Preview image is captured at save time and sent with the project.
- Project model and APIs persist and return `previewImage`.
- Sketch list UI renders the thumbnail column with accessible alt text and fallback.
- No regressions to saving, cloning, or listing sketches.
