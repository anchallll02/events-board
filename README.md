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

## What is left / not done

- No automated tests. I tested each page and API by hand.
- Reminders are only saved. No email or notification is actually sent.
- Events use an image URL. There is no image upload.
- The admin can add events and switch them on or off, but cannot edit or delete them.
- Not deployed. It runs locally.

## Short answers

### 1. How is the data structured in the database?

Four collections:

- **events**: `title`, `category` (Music, Workshop, Food, Sports, Kids), `city`, `startsAt` (a Date, stored in UTC and shown in Asia/Kolkata), `price` (whole rupees, `0` means Free), `description`, `imageUrl`, `isActive`.
- **users**: `email` (unique), `passwordHash`, `favouriteCategories` (array of strings).
- **reminders**: `userId`, `eventId`. One row per user and event, enforced by a unique index. Turning a reminder off deletes the row.
- **carddesigns**: `userId`, `eventId`, `theme`, `stickers` (array, at most 3). One design per user per event, enforced by a unique index.

Price is stored as a whole number of rupees so there are no decimal rounding problems. Reminders and card designs are separate collections linked by ids, so an event document stays small.

### 2. What is the filter query and which index supports it?

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

It sorts by `startsAt` ascending and uses `skip` and `limit` (6 per page).

The index in `models/Event.js` is:

```js
{ isActive: 1, category: 1, city: 1, startsAt: 1 }
```

The fields we match exactly (`isActive`, `category`, `city`) come first, and the range and sort field (`startsAt`) comes last. MongoDB can then jump straight to the matching events already in date order, without sorting them again. The text search is a case-insensitive regex on a small result set. A text index could be added later if the data grows a lot.

### 3. How are passwords stored, and how are the admin pages and APIs protected?

- **Passwords:** never stored as plain text. The server stores only a bcrypt hash (`passwordHash`) made with bcryptjs. At login, the typed password is compared with the hash.
- **Login:** after a correct login the server creates a signed JWT (valid 7 days) and puts it in an httpOnly cookie, so JavaScript in the browser cannot read it. The server also accepts `Authorization: Bearer <token>`.
- **Admin:** the admin email and password come from environment variables, not the database. The admin token carries `role: "admin"`.
- **Protection:** every protected API starts with `requireRole(request, "admin")` or `requireRole(request, "user")`. No login gives 401. The wrong role gives 403. The `/admin` page also checks the cookie on the server and redirects to `/admin/login`. The real protection is in the API, because hiding a page in the UI does not stop someone calling the API directly.
- **Secrets:** `.env.local` is not committed. `.env.example` has placeholders only.

## Use of AI

I used Claude (an AI assistant) to help plan the project and to generate much of the code, which I then typed in file by file, ran, and tested. I went through the code to understand how each part works, including the filter query and index, the login and role checks, and the optimistic "Remind me" update. I can explain and change any part of it.
