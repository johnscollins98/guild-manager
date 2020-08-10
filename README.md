## Description

Uses Discord and GW2 API to help manage a Guild and Discord server, keep them in sync.

## Environment Variables

To run this you do need to set up the following env variables:

| value            | description                                              | default                          |
| ---------------- | -------------------------------------------------------- | -------------------------------- |
| BOT_TOKEN        | Discord bot access token from the Guild's discord server | null - will fail if not defined. |
| DISCORD_GUILD_ID | ID of Guild's discord server                             | null - will fail if not defined. |
| GW2_GUILD_ID     | ID of Guild Wars 2 guild                                 | null - will fail if not defined. |
| GW2_API_TOKEN    | Guild Wars 2 API Token                                   | null - will fail if not defined  |
| PORT             | Port to run Express server on                            | 5000 if not defined              |

## Available Scripts

In the project directory, you can run:

### `npm run start`

Starts the Express server with node.

### `npm run dev-server`

Run express server with nodemon.

### `npm run dev-client`

Run front end in local development server

### `npm run build`

Builds the front end for production/deployment.
