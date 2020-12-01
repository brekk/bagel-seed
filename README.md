# bagel-seed

# Running locally
1. Backend: `node backend.js` - uses `half-baked` (my own library) for serving a static file locally with some simple configuration
2. Frontend: `yarn start` - build on `create-react-app`, needs the backend to be running to work properly.

## Issues developing

- After moving from static data to local GET requests, too much time was spent debugging data not being sent correctly across the wire. Currently there is a hacky repeating `attempt` based approach which should be upgraded.

## Styling

- Uses the BEM methodology (and my library for managing that, `blem`) and I stuck with straight CSS for expedience.
- Currently lacking any decent styling, functionality was prioritized over styling relative to time.

## Tests

- Currently lacking any decent tests, hand-tested functionality was prioritized over automated testing relative to time.
- However, a functional-programming centric delegatee-last style was chosen to make behavior correct while also managing complexity.
- More tests should be written
