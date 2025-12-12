// const express = require('express');
// const cors = require('cors');
// const path = require('path');

// const session = require('express-session')

// const cartRouter = require('./cart');
// const orderRouter = require('./order');
// const userRouter = require('./users');
// const mainRouter = require('./main');
// const productRouter = require('./pro');


// const app = express();

// app.use(cors({ origin: "http://localhost:5173",
//   credentials: true
//   })); 

// app.use(session({
//   secret: 'your-secret-key',
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     httpOnly: true,
//     secure: false,
//     sameSite: 'lax',
//     maxAge: 1000 * 60 * 60 * 24,
//     path: '/'
//   }
// }));

// app.use(express.json());
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// // 라우터 연결
// app.use('/cart', cartRouter);
// app.use('/order', orderRouter);
// app.use('/users', userRouter);
// app.use('/main', mainRouter);
// app.use('/pro', productRouter);


// app.get('/', (req, res) => {
//   res.json('서버 응답');
// });

// app.listen(8080, () => {
//     console.log("potato server running on port 8080")
// })


const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');

const cartRouter = require('./cart');
const orderRouter = require('./order');
const userRouter = require('./users');
const mainRouter = require('./main');
const productRouter = require('./pro');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24,
    path: '/'
  }
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 라우터 연결
app.use('/cart', cartRouter);
app.use('/order', orderRouter);
app.use('/users', userRouter);
app.use('/main', mainRouter);
app.use('/pro', productRouter);

app.get('/', (req, res) => {
  res.json({ message: '서버 정상 동작' });
});

app.listen(8080, () => {
  console.log('potato server running on port 8080');
});
