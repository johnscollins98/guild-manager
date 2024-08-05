## Description

Uses Discord and GW2 API to help manage a Guild and Discord server, keep them in sync.

## Environment Variables

To run this you do need to set up the following env variables:

| value                           | description                                                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **PORT**                        | Port to run Express server on                                                                                             |
| **DATABASE_URI**                | Postgres Database URI                                                                                                     |
| **SESSION_SECRET**              | Secret for Express Session                                                                                                |
| **ACCESS_TOKEN_ENCRYPTION_KEY** | Key for encrypting access token                                                                                           |
| BOT_TOKEN                       | (Optional, mock services used if ommitted) Discord bot access token from the Guild's discord server                       |
| GW2_GUILD_ID                    | (Optional, mock services used if ommitted) ID of Guild Wars 2 guild                                                       |
| GW2_API_TOKEN                   | (Optional, mock services used if ommitted) Guild Wars 2 API Token                                                         |
| DISCORD_GUILD_ID                | (Optional, mock services used if ommitted) ID of Guild's discord server                                                   |
| DISCORD_CLIENT_ID               | (Optional if skipping auth) Client ID for Discord OAuth                                                                   |
| DISCORD_CLIENT_SECRET           | (Optional if skipping auth) Client Secret for Discord OAuth                                                               |
| DISCORD_AUTH_REDIRECT           | (Optional if skipping auth) OAuth Redirect URL                                                                            |
| ADMIN_ROLES                     | (Optional if skipping auth) Comma Seperated List of Admin Discord Roles                                                   |
| EVENT_ROLES                     | (Optional if skipping auth) Comma Seperated List of Event Leaders (all Admins will also be included so no need to repeat) |
| **_SKIP_AUTH_**                 | (Optional) Enable to skip auth during dev (required if using mock services)                                               |
| FRONT_END_BASE_URL              | (Optional) Frontend URL for backend to point to (useful with React dev server)                                            |
| EVENT_UPDATE_INTERVAL_HOURS     | (Optional) Interval for updating event posts, defaults to 6 hours                                                         |
| VITE_APP_BACKEND_BASE_URL       | (Optional) Backend URL for React to point to (useful with React dev server)                                               |
| VITE_DISCORD_REINVITE_LINK      | (Optional) Invite link to send to kicked users                                                                            |

## Available Scripts

In the project directory, you can run:

### `bun run start`

Starts the Express server with node.

### `bun run dev-server`

Run express server with nodemon.

### `bun run dev-client`

Run front end in local development server

### `bun run dev`

Run both back-end and front-end concurrently

### `bun run build`

Builds the front end for production/deployment.
