### Todos:

- [~] add logging (added http request logs)
- [ ] add metrics through prometheus
- [ ] utilize knexfile for db migrations
- [x] setup init.db on docker-compose up to initialize tables
- [ ] benchmark tests
- [ ] unit tests (jest+supertest)
- [ ] add app to dockerfile
- [ ] setup rate limiter on login (failed attempts) and ip-based throttling on other routes

### Setup:

1. set up the session cache, postgres datastore, and adminer by running `docker-compose up`
2. start the app locally by running `npm start` from terminal
   - you can administrate the postgres datastore using adminer (**use postgres docker-compose service name as host**)