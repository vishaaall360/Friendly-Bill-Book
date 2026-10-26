# Third-Party Notice

This document provides information about third-party software, libraries, and services used by the JB YOUR SAFE TECHNOLOGY CRM.

## Overview

The JB YOUR SAFE TECHNOLOGY CRM uses open-source and third-party software components to provide functionality. This application respects all applicable licenses and terms of service for these components.

## Backend Dependencies

| Package | Version | License | Purpose | Source |
|---------|---------|---------|---------|--------|
| express | ^5.1.0 | MIT | Web application framework | https://expressjs.com |
| bcrypt | ^6.0.0 | MIT | Password hashing and verification | https://github.com/dcodeIO/bcrypt.js |
| jsonwebtoken | ^9.0.2 | MIT | JWT signing and verification | https://github.com/auth0/node-jsonwebtoken |
| cors | ^2.8.5 | MIT | CORS middleware for Express | https://github.com/expressjs/cors |
| helmet | ^8.1.0 | MIT | Security HTTP headers middleware | https://helmetjs.github.io |
| multer | ^2.0.2 | MIT | File upload handling middleware | https://github.com/expressjs/multer |
| dotenv | ^17.2.2 | BSD-2-Clause | Environment variable loading | https://github.com/motdotla/dotenv |
| pdfkit | ^0.17.2 | MIT | PDF document generation | http://pdfkit.org |
| zod | ^4.1.5 | MIT | TypeScript-first schema validation | https://zod.dev |
| express-rate-limit | ^8.1.0 | MIT | Rate limiting middleware | https://github.com/nfriedly/express-rate-limit |
| googleapis | ^latest | Apache 2.0 | Google APIs client library | https://github.com/googleapis/google-api-nodejs-client |

## Frontend Dependencies

| Package | Version | License | Purpose | Source |
|---------|---------|---------|---------|--------|
| react | ^19.2.8 | MIT | UI library and framework | https://react.dev |
| react-dom | ^19.2.8 | MIT | React rendering for web | https://react.dev |
| vite | ^8.2.2 | MIT | Frontend build tool | https://vitejs.dev |
| react-router-dom | ^7.8.2 | MIT | Client-side routing | https://reactrouter.com |
| axios | ^1.11.0 | MIT | HTTP client for API requests | https://axios-http.com |
| lucide-react | ^0.542.0 | ISC | Icon library for React | https://lucide.dev |
| react-hook-form | ^7.62.0 | MIT | Form state management | https://react-hook-form.com |
| zod | ^4.1.5 | MIT | Schema validation | https://zod.dev |
| recharts | ^3.1.2 | MIT | Charting library | https://recharts.org |
| react-toastify | ^11.0.5 | MIT | Toast notifications | https://fkhadra.github.io/react-toastify |
| @tailwindcss/vite | ^4.1.12 | MIT | Tailwind CSS Vite integration | https://tailwindcss.com |
| @hookform/resolvers | ^5.2.1 | MIT | Validation resolvers for react-hook-form | https://github.com/react-hook-form/resolvers |

## Development Dependencies

| Package | Version | License | Purpose | Source |
|---------|---------|---------|---------|--------|
| typescript | ^7.0.2 | Apache 2.0 | TypeScript language support | https://www.typescriptlang.org |
| @vitejs/plugin-react | ^6.1.0 | MIT | Vite plugin for React | https://github.com/vitejs/vite-plugin-react |
| concurrently | ^9.2.1 | MIT | Run multiple commands concurrently | https://github.com/open-cli-tools/concurrently |
| oxlint | ^1.79.0 | MIT | JavaScript linter | https://oxc.rs |
| @types/node | ^26.3.0 | MIT | TypeScript definitions for Node.js | https://github.com/DefinitelyTyped/DefinitelyTyped |
| @types/react | ^19.2.18 | MIT | TypeScript definitions for React | https://github.com/DefinitelyTyped/DefinitelyTyped |
| @types/react-dom | ^19.2.5 | MIT | TypeScript definitions for React DOM | https://github.com/DefinitelyTyped/DefinitelyTyped |

## Third-Party Services & APIs

| Service | License/Terms | Purpose |
|---------|--------------|---------|
| Google Sheets API | Google Terms of Service | Lead synchronization and data export |
| Google Cloud Services | Google Terms of Service | Cloud infrastructure (optional) |
| WhatsApp Business API | Meta Terms of Service | Document sharing via WhatsApp |
| Gmail / Google Mail | Google Terms of Service | Email communication |

## Key License Information

### MIT License
Most packages in this project are licensed under the MIT License, which is permissive and allows use in proprietary applications with proper attribution.

### Apache 2.0 License
- TypeScript (Apache 2.0)
- Google APIs (Apache 2.0)

### ISC License
- Lucide Icons (ISC)

### BSD License
- dotenv (BSD-2-Clause)

## Important Notes

1. **Third-Party Ownership**: All third-party packages listed above remain owned and maintained by their respective authors and organizations.

2. **No Ownership Claims**: The owner of this CRM software (Santhosh Kumar) does not claim ownership over any third-party components, libraries, APIs, services, icons, or fonts listed herein.

3. **License Compliance**: Users and developers of this software are responsible for ensuring compliance with all applicable third-party licenses.

4. **Modifications**: If you modify or redistribute this software, you must include proper attribution and comply with all third-party license requirements.

5. **Attribution**: Proper attribution has been made to all third-party components used in this application.

6. **No Warranty**: Third-party components are used "as-is" and remain subject to their respective license terms.

## Viewing Full License Text

To view the full license text for any third-party package:

```bash
# View license for a specific package
cat node_modules/[package-name]/LICENSE

# Or visit the package's official repository
# (URLs listed in the tables above)
```

## Contact & Questions

For questions about third-party usage or licensing compliance:

**Project Owner:** Santhosh Kumar
**Product:** Friendly Bill Book
**Copyright Year:** 2026

For questions about specific third-party components, please refer to their official websites and documentation.

---

**Last Updated:** September 1, 2026
**Compliance Note:** This application complies with all open-source licenses used by its third-party dependencies.