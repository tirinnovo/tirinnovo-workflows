# Workflows Proxy

Kestra Community Edition allows for REST api execution but only though basic authentication using the same admin account we use for login.

As atm we can't afford their Pro plan, this middleware will allow us to guard the service with a bearer token.

## Install and run

```sh
bun install
cp ../.env.example ../.env
# (fix the env vars)
( set -a; source ../.env; set +a; bun run src/index.ts )
```

## Tunnelling

In two different shells

```sh
cloudflared tunnel run tirinnovo-workflows
```

```sh
cloudflared tunnel run tirinnovo-proxy
```

## Call

```sh
curl -i \
  -H "Authorization: Bearer $WORKFLOWS_PROXY_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/api/v1/main/executions/tirinnovo.ai/test__count_events",
    "method": "POST",
    "payload": {
      "custom_message": "Summarize all events"
    }
  }' \
  http://localhost:9092/forward
```
