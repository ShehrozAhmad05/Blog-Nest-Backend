require('dotenv').config();

const cors = require('cors');
const passport = require('./utils/passport-config');
const express = require('express');
const cron = require('node-cron');
const cookieParser = require('cookie-parser');
const connectDB = require('./utils/connectDB');
const postRouter = require('./router/post/postsRouter');
const usersRouter = require('./router/user/usersRouter');
const categoriesRouter = require('./router/category/categoriesRouter');
const planRouter = require('./router/plan/planRouter');
const stripePaymentRouter = require('./router/stripePayment/stripePaymentRouter');
const calculateEarnings = require('./utils/calculateEarnings');
const earningsRouter = require('./router/earnings/earningsRouter');
const notificationRouter = require('./router/notification/notificationRouter');
const commentRouter = require('./router/comment/commentRouter');

connectDB();

//Cron job to calculate earnings every month
cron.schedule('59 23 * * *', async () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    if (today.getMonth() !== tomorrow.getMonth()) {
        console.log('Running cron job to calculate earnings...');
        calculateEarnings()
    }
}, {
    scheduled: true,
    timezone: "America/New_York"
});

const app = express();

//PORT
const port = 5000;


//Middlewares
app.use(express.json());
const corsOptions = {
    origin: ['http://localhost:5173'],
    credentials: true,
};
app.use(cors(corsOptions));

//Passport middleware
app.use(passport.initialize());
app.use(cookieParser()) //Automatically parse cookies from the request
//Routes handler
app.use("/api/v1/posts", postRouter)
app.use("/api/v1/users", usersRouter)
app.use("/api/v1/categories", categoriesRouter)
app.use("/api/v1/plans", planRouter)
app.use("/api/v1/stripe", stripePaymentRouter)
app.use("/api/v1/earnings", earningsRouter)
app.use("/api/v1/notifications", notificationRouter)
app.use("/api/v1/comments", commentRouter)

//Not Found
app.use((req, res, next) => {
    //const error = new Error(`Not found - ${req.originalUrl}`);
    res.status(404).json({ message: "Route not found on server" });
    //next(error);
});

//Error handling middleware
app.use((err, req, res, next) => {
    const message = err.message
    const stack = err.stack
    res.status(500).json({
        message,
        stack
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}
);