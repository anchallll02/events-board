# Community Events Board

A small web app where visitors browse local events, filter and search them, set reminders, pick favourite categories, and design their own event card. An admin can add events and switch them on or off.

**Stack:** Next.js (App Router), JavaScript, MongoDB with Mongoose, Tailwind CSS. Passwords are hashed with bcryptjs and logins use JWT (jose).

## Setup (about 5 minutes)

You need Node.js 20 or newer and a MongoDB database (a free MongoDB Atlas cluster is fine).

```bash
git clone https://github.com/anchallll02/events-board.git
cd events-board
npm install
cp .env.example .env.local # on Windows: copy .env.example .env.local
```

Open `.env.local` and fill in:

```
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/events-board?retryWrites=true&w=majority"
JWT_SECRET="any-long-random-string"
ADMIN_EMAIL="admin@eventsboard.com"
ADMIN_PASSWORD="Admin@12345"
```

Then load the sample data and start the app:

```bash
npm run seed # adds 15 sample events (11 upcoming and active, 2 inactive, 2 past)
npm run dev # open http://localhost:3000
```

Run `npm run seed` again any time you want fresh dates. It clears and recreates the events.

## Admin login

- URL: `http://localhost:3000/admin/login`
- Email: `admin@eventsboard.com`
- Password: `Admin@12345`

These come from `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env.local`. Change them there if you like.

Normal users can sign up at `/signup`.

## What the app does

- `/` lists upcoming active events, 6 per page, with category, city and text search.
- `/signup`, `/login` for visitors. After signing up you pick favourite categories.
- `/favourites` saves favourite categories. `/feed` shows upcoming events from only those categories.
- `/events/<id>` shows one event. "Remind me" turns on instantly and is rolled back with a message if saving fails. The card designer lets you pick a theme and up to 3 stickers and save the design.
- `/admin` (admin only) lists all events, adds a new event, and switches an event active or inactive.

## API (short list)

| Method | Path | Who | What it does |
|---|---|---|---|
| POST | `/api/auth/signup` | public | create a user account |
| POST | `/api/auth/login` | public | log in, sets the login cookie |
| POST | `/api/auth/logout` | anyone | clear the cookie |
| GET | `/api/auth/me` | anyone | current user or admin |
| POST | `/api/admin/login` | public | admin login |
| GET | `/api/events` | public | upcoming active events, supports `category`, `city`, `q`, `page` |
| GET | `/api/events/cities` | public | list of cities for the filter |
| GET | `/api/events/:id` | public | one event |
| GET, PUT | `/api/events/:id/card` | user | read or save my card design |
| GET, PUT | `/api/favourites` | user | read or save favourite categories |
| GET | `/api/feed` | user | upcoming events from my favourite categories |
| GET | `/api/reminders` | user | ids of events I set a reminder on |
| PUT | `/api/reminders/:eventId` | user | body `{ "remind": true or false }` |
| GET, POST | `/api/admin/events` | admin | list all events, create an event |
| PATCH | `/api/admin/events/:id` | admin | set an event active or inactive |


## Short answers

### 1. Show your database structure. Why did you design it this way?

Four collections in MongoDB:

- **events**: `title`, `category` (Music, Workshop, Food, Sports, Kids), `city`, `startsAt` (Date), `price` (whole rupees, `0` means Free), `description`, `imageUrl`, `isActive`.
- **users**: `email` (unique), `passwordHash`, `favouriteCategories` (array of strings).
- **reminders**: `userId`, `eventId`, with a unique index on the pair.
- **carddesigns**: `userId`, `eventId`, `theme`, `stickers` (array, max 3), with a unique index on the pair.

Why this design:
- **Events are one flat document.** Every page reads an event as a whole, so there is nothing to join.
- **Reminders and card designs are separate collections, not arrays inside the event.** An event can have many users, so an array on the event would grow without limit. Separate rows keep the event small, and one user's change never touches another user's data.
- **The unique index on `userId + eventId`** means the database itself stops duplicates. Pressing "Remind me" twice or saving a design twice cannot create two rows, even if two requests arrive at the same time.
- **Price is stored in whole rupees** (an integer), so there are no decimal rounding problems. `0` is shown as "Free".
- **`startsAt` is a real Date** (stored in UTC, shown in Asia/Kolkata), so it can be compared and sorted correctly.
- **Favourite categories live inside the user** because they are a short list that always belongs to that one user.
- **`isActive` is a flag**, so the admin can hide an event without deleting it.

### 2. How does your filter query work, and what index would you add?

Both the events page and My Feed use one function, `findUpcoming` in `lib/events.js`. It builds this filter:

```js
{
  isActive: true,
  startsAt: { $gte: new Date() },
  category: { $in: categories }, // only if a category is chosen
  city: city, // only if a city is chosen
  $or: [{ title: /text/i }, { description: /text/i }] // only if the user typed a search
}
```

Only active events that have not started yet are returned. The chosen filters combine with AND. It sorts by `startsAt` ascending and uses `skip` and `limit` for pages of 6. My Feed uses the same function and only passes the user's favourite categories.

The index I added (in `models/Event.js`):

```js
{ isActive: 1, category: 1, city: 1, startsAt: 1 }
```

The fields we match exactly (`isActive`, `category`, `city`) come first, and the range and sort field (`startsAt`) comes last. MongoDB can go straight to the matching events already in date order, so it does not scan every event or sort them again. The text search is a case-insensitive regex that runs on the already filtered events. If the data grows a lot, I would add a text index for search.

### 3. How do you store passwords and protect the admin pages and APIs?

- **Passwords:** never stored as plain text. Only a bcrypt hash (`passwordHash`, made with bcryptjs) is saved. At login the typed password is compared with the hash.
- **Login:** after a correct login the server creates a signed JWT (valid 7 days) and stores it in an httpOnly cookie, so JavaScript in the browser cannot read it. The server also accepts `Authorization: Bearer <token>`.
- **Admin:** the admin email and password come from environment variables, not from the database or the code. The admin token carries `role: "admin"`.
- **APIs:** every protected API starts with `requireRole(request, "admin")` or `requireRole(request, "user")`. No login gives 401. The wrong role gives 403. A normal user cannot call an admin API.
- **Admin pages:** `/admin` checks the cookie on the server and redirects to `/admin/login` if the person is not an admin. The real protection is in the APIs, because hiding a page does not stop someone calling the API directly.
- **Secrets:** `.env.local` is not committed to Git. `.env.example` has placeholders only.

## Use of AI

I used Claude (an AI assistant) to help plan the project and to generate much of the code, which I then typed in file by file, ran, and tested. I went through the code to understand how each part works, including the filter query and index, the login and role checks, and the optimistic "Remind me" update. I can explain and change any part of it.
