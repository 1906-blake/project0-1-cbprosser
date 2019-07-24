import express from 'express';
import bodyParser from 'body-parser';
import { usersRouter } from './routers/users.router';
import { reimbursementsRouter } from './routers/reimbursements.router';
import { sessionMiddleware } from './middleware/session.middleware';
import { authRouter } from './routers/auth.router';

// specify the port will run on
const port = 8012;
const app = express();

/**
 * Logging middleware
 * This callback will be invoked anytime a request is made
 * regardless of url or http method
 */
app.use((req, res, next) => {
    console.log(`request made with url: ${req.url} and method ${req.method}`);
    next();
});

/**
 * Bodyparser to convert html request body to JSON for usage
 * in the routers.
 */
app.use(bodyParser.json());

/**
 * Allows for CORS (Cross Origin Resource Sharing)
 * on the server
 */
app.use((req, resp, next) => {
    console.log(req.get('host'));
    resp.header('Access-Control-Allow-Origin', `${req.headers.origin}`);
    resp.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    resp.header('Access-Control-Allow-Credentials', 'true');
    resp.header('Access-Control-Allow-Methods', 'POST, GET, DELETE, PUT, PATCH');
    next();
  });

/**
 * Session Control middleware
 */
app.use(sessionMiddleware);

/**
 * Router Registry
 */
app.use(authRouter);
app.use('/users', usersRouter);
app.use('/reimbursements', reimbursementsRouter);

/**
 * Logging confirmation that server is running.
 */
app.listen(port, () => {
    console.log('app started on port: ' + port);
});