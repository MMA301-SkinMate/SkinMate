# Collection API

The collection feature stores the application product library and supports device push notifications for product-expiry reminders. It currently uses the collection's development user identity until the authentication middleware is wired into these routes.

## Setup

Set `MONGO_URI` in `backend/.env` to an intended MongoDB database. Back up an existing database before testing with it. Start the backend with `npm --prefix backend start`.

## Product fields

`productName` and `productType` are required. Product types are `cleanser`, `toner`, `essences`, `cream`, `oil`, `serum`, `treatment`, `moisturizer`, `sunscreen`, `mask`, `exfoliant`, and `others`. Status is `draft`, `active`, `finished`, or `expired`; new products default to `active` with `remainingPercent` of 100.

Optional fields are `brand`, `size`, `ingredients`, `productIcon`, `productImageUrl`, `openedDate`, `expirationDate`, `paoDays`, `note`, `continueAfterExpiry`, and `routineUsage`. The mobile Add Product screen derives `productIcon` from `productType`; its camera and library actions only capture/select the real product photo. Shelf cards display the type icon, while Product Detail displays `productImageUrl` and falls back to the type icon when no photo exists. Product Detail also links to the shared product form for editing these fields. Expiration can be entered as a specific date or as a number of months after opening; the latter requires `openedDate` and the app calculates `expirationDate`. Set `continueAfterExpiry` to `true` only when a product remains in use after its expiration date.

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/collections` | List products, newest first. |
| POST | `/api/collections` | Create a product. |
| GET | `/api/collections/:id` | Get a product. |
| PATCH | `/api/collections/:id` | Update one or more fields. |
| DELETE | `/api/collections/:id` | Delete a product. |
| POST | `/api/collections/image` | Upload a JPG, PNG, or WebP product photo (maximum 5 MB). |
| POST | `/api/notifications/devices` | Register or re-enable an Expo push token. |
| DELETE | `/api/notifications/devices` | Disable an Expo push token. |

Invalid bodies return `400 VALIDATION_ERROR`; invalid or missing IDs return `404 COLLECTION_NOT_FOUND`.

## Expiry notifications

The backend checks expiry state every minute and sends messages only at **08:00** in `Asia/Ho_Chi_Minh` (override with `NOTIFICATION_TIME_ZONE`). It sends one reminder seven calendar days before `expirationDate`, one on the expiration date, and one weekly reminder every Monday for active products whose `continueAfterExpiry` is `true`. A delivery record guarantees that each product/type/period is sent only once, including when the server restarts.

The mobile app requests notification permission on a physical Android or iOS device, obtains its Expo push token, and registers it at `POST /api/notifications/devices`. Expo Go, a development build, or a release build must include the installed `expo-notifications` package and a configured EAS project for production push delivery.
