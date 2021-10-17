## Description

Uses Discord and GW2 API to help manage a Guild and Discord server, keep them in sync.

## Environment Variables

To run this you do need to set up the following env variables:

| value                      | description                                                                                   |
| -------------------------- | --------------------------------------------------------------------------------------------- |
| BOT_TOKEN                  | Discord bot access token from the Guild's discord server                                      |
| DISCORD_GUILD_ID           | ID of Guild's discord server                                                                  |
| GW2_GUILD_ID               | ID of Guild Wars 2 guild                                                                      |
| GW2_API_TOKEN              | Guild Wars 2 API Token                                                                        |
| PORT                       | Port to run Express server on                                                                 |
| ATLAS_URI                  | MongoDB Atlas URI                                                                             |
| DISCORD_CLIENT_ID          | Client ID for Discord OAuth                                                                   |
| DISCORD_CLIENT_SECRET      | Client Secret for Discord OAuth                                                               |
| DISCORD_AUTH_REDIRECT      | OAuth Redirect URL                                                                            |
| ADMIN_ROLES                | Comma Seperated List of Admin Discord Roles                                                   |
| EVENT_ROLES                | Comma Seperated List of Event Leaders (all Admins will also be included so no need to repeat) |
| REACT_APP_BACKEND_BASE_URL | Backend URL for React to point to                                                             |
| SESSION_SECRET             | Secret for Express Session                                                                    |

## Available Scripts

In the project directory, you can run:

### `yarn start`

Starts the Express server with node.

### `yarn dev-server`

Run express server with nodemon.

### `yarn dev-client`

Run front end in local development server

### `yarn dev`

Run both back-end and front-end concurrently

### `yarn build`

Builds the front end for production/deployment.
