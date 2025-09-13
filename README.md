# Workflows

## Why

This project loads Kestra to allow orchestration of workflows, such as deep AI analysis.

## Examples of summarizations

- "Extract from this construction site diary events our company's best parctices so new junior architects and surveyors know what to do when joining our studio."

  Output:

  ```
  Per i nuovi architetti e geometri che si uniscono al nostro studio, è fondamentale adottare un approccio metodico e orientato al cliente nella gestione dei progetti di ristrutturazione.

  Inizialmente, è essenziale raccogliere in modo dettagliato le esigenze del cliente, includendo tutte le modifiche desiderate, le aspettative di costo e le tempistiche preferite, oltre a ottenere i contatti necessari per l'accesso all'immobile.

  Successivamente, si devono condurre sopralluoghi tecnici approfonditi per identificare e documentare con precisione tutte le necessità tecniche e strutturali.

  Durante lo sviluppo progettuale, è cruciale integrare le abitudini e le esigenze a lungo termine del cliente, documentando accuratamente ogni revisione richiesta e avviando richieste di preventivi per componenti chiave come finestre e porte.

  Mantenere una comunicazione costante per la conferma regolare di ogni scelta di design, dalle specifiche tecniche alle preferenze estetiche, è una pratica fondamentale per evitare malintesi e garantire la soddisfazione.

  Infine, una volta consolidate le scelte progettuali e i materiali, è indispensabile gestire in modo strutturato i preventivi, richiedendo offerte comparative da diversi fornitori e organizzando efficientemente gli appuntamenti per le selezioni finali.

  Queste pratiche garantiscono il successo dei nostri progetti e la piena soddisfazione del cliente.
  ```

# How to run it

This docker compose setup will allow installation of Kestra.

## Create a SQL user

Example:

```sql
-- READ ONLY
CREATE USER workflow_executor WITH PASSWORD 'Qwerty 1234';
GRANT CONNECT ON DATABASE example_development TO workflow_executor;
GRANT USAGE ON SCHEMA public TO workflow_executor;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO workflow_executor;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO workflow_executor;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO workflow_executor;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO workflow_executor;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO workflow_executor;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO workflow_executor;
```

```sql
-- ALL PRIVILEGES
CREATE USER workflow_executor WITH PASSWORD 'Qwerty 1234';
GRANT CONNECT ON DATABASE example_development TO workflow_executor;
GRANT USAGE ON SCHEMA public TO workflow_executor;
GRANT CREATE ON SCHEMA public TO workflow_executor;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO workflow_executor;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO workflow_executor;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO workflow_executor;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO workflow_executor;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO workflow_executor;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO workflow_executor;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO workflow_executor;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO workflow_executor;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO workflow_executor;
```

## Install

```shell
cp .env.example .env
# (Edit variables)
```

## Run

```shell
docker-compose up
```
