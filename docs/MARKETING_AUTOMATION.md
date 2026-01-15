# QuickMela Marketing Automations

This document explains how the marketing automation system works, how to run it locally, and how to add or edit automations using the live backend and the Admin Marketing UI.

## Components

- **Backend (port 4010)**
  - Express server with marketing routes under `/api/marketing`.
  - Postgres (Supabase) for `automations`, `automation_executions`, `pixel_events`.
  - BullMQ + Redis for queues.
- **Workers**
  - `eventsEnrichmentWorker` – enriches raw pixel events and forwards them to the automations queue.
  - `ruleEngineWorker` – matches automations against events and inserts rows into `automation_executions`.
  - `notificationWorker` – sends SendGrid emails and updates execution `status` and `error`.
- **Frontend**
  - Vite React app with an Admin page at `/admin/marketing`.

## Running the system locally

From the project root:

1. **Backend (only once)**

   ```bash
   npm run live-backend
   ```

   Backend runs on `http://localhost:4010`.

2. **Frontend**

   ```bash
   npm run dev
   ```

   Note the printed port (e.g. `http://localhost:3047`).

3. **Workers (in three separate terminals)**

   ```bash
   npm run worker:events
   npm run worker:rules
   npm run worker:notify
   ```

## Admin Marketing page

Open:

```text
http://localhost:<vite-port>/admin/marketing
```

The page has three key areas:

1. **Automations**
   - Lists all automations from `GET /api/marketing/automations`.
   - Shows name, trigger, filters, actions, active flag, created time.
   - **Pause / Activate** button toggles `active` via `PUT /api/marketing/automations/:id`.
   - **Test** button sends a synthetic event to `/api/marketing/events` using the automation's trigger.

2. **Recent Executions**
   - Reads from `GET /api/marketing/executions`.
   - Shows the last N runs with:
     - Time
     - Automation name
     - Status (`queued`, `success`, `failed`)
     - User ID
     - Event ID
     - Error (when status is `failed`).

3. **Marketing Events analytics (optional)**
   - This is a separate Supabase table (`marketing_events`) used for campaign/UTM analytics.
   - It is optional and not required for automations to work.

## Adding a new automation via API

Automations are stored in the `automations` table and managed via the backend API.

### Create a new automation

Use `POST /api/marketing/automations`.

Example – **Bid Placed Followup**:

```bash
curl -i -X POST http://localhost:4010/api/marketing/automations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bid Placed Followup",
    "trigger": {
      "type": "event",
      "event_name": "bid_placed"
    },
    "filters": {},
    "actions": [
      {
        "type": "email",
        "params": {
          "to": "info@tekvoro.com",
          "subject": "Thanks for bidding on QuickMela!",
          "html": "<p>Thanks for placing a bid on QuickMela. We will notify you about any updates.</p>"
        },
        "delay_ms": 0
      }
    ],
    "active": true
  }'
```

Important fields:

- `name` – display name shown in the Admin UI.
- `trigger.type` – currently `"event"`.
- `trigger.event_name` – the event name produced by the system (e.g. `deposit_added`, `bid_placed`).
- `filters` – an object of conditions evaluated against the enriched event. Keys use dot-notation (e.g. `"metadata.first_time"`).
- `actions` – list of actions to perform. For email:
  - `type: "email"`
  - `params.to` – optional explicit recipient. If omitted, the system will resolve email from the `users` table via `user_id`.
  - `params.subject`, `params.html` – email content.
  - `delay_ms` – optional delay before the action runs.
- `active` – whether the automation is currently enabled.

### Update an automation

Use `PUT /api/marketing/automations/:id` with the full automation payload (same shape as create).

Example – pause an automation:

```bash
curl -i -X PUT http://localhost:4010/api/marketing/automations/<AUTOMATION_ID> \
  -H "Content-Type: application/json" \
  -d '{
    "name": "First Deposit Welcome Email",
    "trigger": { "type": "event", "event_name": "deposit_added" },
    "filters": { "metadata.first_time": true },
    "actions": [ /* existing actions */ ],
    "active": false
  }'
```

In practice, it is usually easier to pause/activate automations from the Admin UI using the toggle button.

## Firing test events

You can test automations in two ways:

1. **From the Admin UI**
   - The **Test** button in the Automations table sends a synthetic event to `/api/marketing/events` using the automation's trigger definition.

2. **Via curl**

   ```bash
   curl -i -X POST http://localhost:4010/api/marketing/events \
     -H "Content-Type: application/json" \
     -d '{
       "event": "deposit_added",
       "user_id": "<USER_UUID>",
       "metadata": { "first_time": true },
       "utm": {}
     }'
   ```

   or for `bid_placed`:

   ```bash
   curl -i -X POST http://localhost:4010/api/marketing/events \
     -H "Content-Type: application/json" \
     -d '{
       "event": "bid_placed",
       "user_id": "<USER_UUID>",
       "metadata": {},
       "utm": {}
     }'
   ```

Workers will process these events and they will appear in **Recent Executions** on the Admin page.

## Execution status and errors

The `automation_executions` table tracks runs of each automation:

- `status`:
  - `queued` – rule engine matched the automation and queued notification.
  - `success` – notification worker sent the email successfully.
  - `failed` – notification worker could not resolve the recipient or SendGrid returned an error.
- `error`:
  - `null` on success.
  - Error message on failure (e.g. "Could not resolve recipient email").

Use the **Recent Executions** section in `/admin/marketing` to quickly see which automations are firing and whether they are succeeding.
