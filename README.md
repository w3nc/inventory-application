# Groove Cellar — Stock Ledger

An inventory app for an imaginary record shop, built for The Odin Project's
**Project: Inventory Application** lesson.

A **drawer** is a category (Jazz, Soul, Folk, Punk). A **card** is an item (a
record). Every drawer and card can be created, read, updated and deleted.

---

## Live preview

https://inventory-application-vldt.onrender.com/

---

## Running it

The database is already set up on this PC (PostgreSQL 16, listening on port
**5433**, database `groove_cellar`).

```powershell
cd inventory-application
npm start
```

Then open http://localhost:3000

- Fill the shop with dummy data: `npm run populate` (it asks before wiping).
- The admin password is in `.env` (`ADMIN_PASSWORD`). It is `cellar` right now.
- Reading is open to everyone. Add, edit and delete need the password.

---

## The tables

```
drawers                       records
-------                       -------
id          SERIAL PK         id           SERIAL PK
name        TEXT UNIQUE       title        TEXT NOT NULL
note        TEXT              artist       TEXT NOT NULL
position    INTEGER           release_year INTEGER
created_at  TIMESTAMPTZ       shelf        TEXT
                              qty          INTEGER >= 0
                              price_cents  INTEGER >= 0
                              drawer_id    INTEGER -> drawers(id) ON DELETE SET NULL
                              added_at     TIMESTAMPTZ
```

**Relationship:** one drawer holds many records. A record belongs to at most one
drawer — `drawer_id` may be `NULL`, which means "Unfiled".

**The delete rule the assignment asks you to decide:** deleting a drawer does
*not* delete the cards inside it. `ON DELETE SET NULL` unfiles them, so nothing
is ever lost by accident. Deleting a *card* really does remove it.

Prices are stored in centavos (whole numbers), so ₱1,850.50 never turns into
1,850.4999.

---

## Routes

| Method | Path | What it does |
| --- | --- | --- |
| GET | `/` | Pick a drawer, see its cards |
| GET | `/records` | Every card in one table |
| GET | `/records/:id` | One card's page |
| GET/POST | `/drawers/new` | Add a drawer |
| GET/POST | `/drawers/:id/edit` | Edit a drawer |
| GET/POST | `/drawers/:id/delete` | Delete a drawer (cards move to Unfiled) |
| GET/POST | `/records/new` | Add a card |
| GET/POST | `/records/:id/edit` | Edit a card |
| GET/POST | `/records/:id/delete` | Delete a card |
| GET/POST | `/unlock` | Type the admin password |
| POST | `/lock` | Lock editing again |

The `GET` delete routes only show a confirmation page; the real delete happens
on `POST`, so a link can never destroy data by accident.

---

## Where things live

```
app.js                  express setup, middleware order, startup
db/pool.js              the one database connection
db/schema.js            CREATE TABLE statements (safe to run every boot)
db/populatedb.js        dummy data script
models/drawers.js       every SQL query about drawers
models/records.js       every SQL query about records
controllers/            what happens on each route
routes/                 which URL goes to which controller
validators/forms.js     checks the form input, returns friendly errors
middleware/admin.js     the shared password lock
utils/money.js          pesos <-> centavos
views/                  EJS templates
public/styles.css       the paper-ledger look
```


