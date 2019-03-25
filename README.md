# Invidiojs

## A basic re-implementation of the Invidious API in node.js

Invidious ([website](https://invidio.us/), [github](https://github.com/omarroth/invidious)) is an
alternative front-end to YouTube written in Crystal that exposes an API usable by other applications
to easily obtain data from YouTube without using the official YouTube APIs.

## Why did I create Invidiojs?

Because I was frustrated at the slow speed, pointless bandwidth consumption and high memory usage of Invidious.

## Why choose Invidiojs?

- Data returned much faster compared to Invidious
- Easier to run, since Crystal can be a pain to use
- No pointless bandwidth consumption
- Lower memory usage

## Why choose Invidious?

- Many more endpoints
- More data returned from each endpoint

# Using the API

## What endpoints are available?

- In api/video.js:
> /api/v1/videos/{id}

- In api/channel.js:
> /api/v1/channels/{id}  
> /api/v1/channels/{id}/videos

## What endpoints are planned?

> /api/v1/search  
> /api/v1/playlists/{id}

# Using the code

## Running your own instance

- Clone the repo
- `npm install`
- Create `db/main.db` according to the schema in `db/main-schema.sql`.
- If you want to use HTTPS, first obtain a Let's Encrypt certificate, then change `hostnames` in `index.js`.
If you don't want to use HTTPS or just want to run the site behind a LAN, you don't have to change the hostname.
- Set the ports to use at the top of `index.js`.

## File organisation

|Directory   |Purpose   |
|------------|----------|
|api         |API modules|
|db          |Database files|
|util        |Server utilities needed in more than one file|

## Editing the code

I use Visual Studio Code to create this, but of course you may use whatever text editor you like.

Be sure to follow these guidelines for writing and formatting your code:

- End lines with semicolons, (optional for multi-line strings and lines that are entirely closing brackets)
- Indent _either_ with 4 spaces, _or_ a tab character
- Indent where it makes sense
- Curly braces go on the same line as the `if` or `function`
- Strings are delimited with double quotes or backticks, not single quotes
- Use `let` or `const` instead of `var` where possible
- If logging strings, use `cf.log` rather than `console.log`

Please try to keep the number of node modules to a minimum. Only install another module if you *really* need to.

## Contributing back

Fork the repo, edit the code, open a pull request.

Consider opening an issue first to see whether what you want to change is actually something that I want to merge in.