# TBR List Application

A full stack Next.js application. The application allows user to create mulitple TBR lists by searching the Google Books API. User must be authenticated. 

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features
- User authentication
- Protected dashboard routes
- Create and manage reading lists
- Search and filter reading lists
- Server and Client components using the App Router 
- API routes for user and list data


## Tech Stack 
- Next.js 
- Typescript
- Bootstrap
- Cookie based authentication
- Jest

## Getting Started

1. Install dependencies

npm install

2. Create .env file 

MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_token
NEXT_PUBLIC_BASE_URL=http://localhost:3000
GOOGLE_BOOKS_API_KEY=your_google_books_api_key

3. First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Other server commands

```bash
npm run build  # build for production server
npm run start # start production server
npm test # to run test suite
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
