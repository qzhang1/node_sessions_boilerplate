### Backlog:

- [x] respond to SIGTERM for graceful shutdown
- [x] env configurable request payload limits
- [x] env configurable feature flag (metrics (prometheus))
- [ ] typescript migration
- [x] add logging (added http request logs)
- [x] add metrics through prometheus and setup grafana dashboard
- [x] setup init.db on docker-compose up to initialize tables
- [ ] benchmark tests
- [ ] unit tests (jest+supertest)
- [ ] add app to dockerfile
- [ ] setup rate limiter on login (failed attempts) and ip-based throttling on other routes
- [ ] add caching to services that use datastore backings (redis so far)

### Setup:

1. set up the session cache, postgres datastore, and adminer by running `docker-compose up`
2. start the app locally by running `npm start` from terminal
   - you can administrate the postgres datastore using adminer (**use postgres docker-compose service name as host**)
