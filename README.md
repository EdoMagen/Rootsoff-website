# Roots Off Marketing Website

This directory contains the static marketing website for Roots Off (Jira RC Analyzer).

## Directory Structure

- `index.html`: Main landing page
- `styles.css`: Custom CSS with a modern dark-mode aesthetic
- `script.js`: Frontend logic for navigation, parallax, and form submission
- `assets/`: Image and icon assets

## Local Development

You can serve the website locally using any static file server. For example:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js (npx)
npx serve .
```

Then visit `http://localhost:8000` in your browser.

## Form Submission

The contact form is configured to send data to the Roots Off Contact Service. To update the endpoint, modify the `fetch` URL in `script.js`.

## Deployment

### Static Website
The website can be hosted on GitHub Pages, Netlify, Vercel, or AWS S3 + CloudFront.

### Contact Service
The backend service in `src/contact_service` should be deployed as an AWS Lambda function with API Gateway or as a container on AWS ECS.

## Privacy & Legal
Content for Privacy Policy, Terms of Service, and Cookies Policy is included directly in `index.html`.
