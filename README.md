# NowGG Proxy Launcher

A high-performance web proxy launcher specifically optimized for `nowgg.fun`, utilizing Scramjet, Bare-Mux, and Epoxy Transport.

## Build and Development Commands

This project uses a custom Express server to handle Next.js rendering, Bare protocol, and Wisp protocol.

### Production Build
To create an optimized production build:
```bash
npm run build
```
*Runs `next build` to compile the frontend and prepare server-side components.*

### Development Mode
To start the application in development mode:
```bash
npm run dev
```
*Uses `tsx` to run `server.ts` for real-time development.*

### Production Start
To run the built application in production:
```bash
npm run start
```
*Sets `NODE_ENV=production` and starts the custom server.*

### Code Quality
- **Linting:** `npm run lint` (checks for code style and potential errors).
- **Cleanup:** `npm run clean` (clears the Next.js cache).

## Architecture
- **Server:** Express + Wisp + Bare Server
- **Frontend:** Next.js 15+ (App Router)
- **Proxy Engine:** Scramjet
- **Transport:** Epoxy (Wisp-based)
- **Styling:** Tailwind CSS
