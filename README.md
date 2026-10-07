# Pokédex

A Pokémon browser built with React 18, TypeScript 5, Vite, and React Router 6.

Pokémon data and images come from [PokeAPI](https://pokeapi.co/).
The interface is in Armenian.

Live site: [Pokédex](https://pokedex-silk-iota.vercel.app)

## Features

- Browse up to 20 Pokémon per page.
- Search by name across the full Pokémon list.
- Filter by Pokémon type and combine filtering with search.
- Open a detail page with an image, types, abilities, height, weight, and base stats.
- Show loading messages, errors with retry buttons, and an empty-results message.
- Responsive layout built with plain CSS.

## Run locally

Developed with Node.js 24.14.1.

From the project folder, install dependencies and start the development server:

```sh
npm ci
npm run dev
```

Open the local URL printed in the terminal.

## Build and preview

```sh
npm run build
npm run preview
```

The build command checks TypeScript and creates the production files in `dist`.
The preview command serves that build locally.

## Implementation decisions

- Use the browser Fetch API without an additional HTTP library.
- Load the full index of Pokémon names and URLs to support global name search.
- Apply the type filter and name search before selecting a page of results.
- Fetch details for the current page with `Promise.all`.
- Use React state for data and filters.
- Use React Router for `/` and `/pokemon/:id`.
- Convert API height and weight values to meters and kilograms.

## Challenges and limitations

Overlapping requests could finish in a different order and display outdated
results. A request counter stored in `useRef` allows only the latest request
to update state. Effect cleanup invalidates earlier work; it does not cancel
network requests.

Search, filters, and pagination reset when returning from the detail page.
Search currently has no debounce.

## Deployment

The host must serve `index.html` for client-side routes such as `/pokemon/25`,
so opening or refreshing a detail URL works.
