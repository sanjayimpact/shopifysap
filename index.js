// server/index.js (ES6 version)

import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import path from 'path'
import authRoute from './src/Routes/auth.js';
import { connect } from './src/db/db.config.js';
import createSession from './config/sap.js';
import shopify  from './config/shopify.js';
import { create } from 'domain';
import ejs from 'ejs'
import { webhookRouter } from './src/Routes/webhook.routes.js';


const app = express();
const port = process.env.PORT || 3000;
app.use(express.raw({ type: 'application/json' }));

app.use('/shopify',webhookRouter)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files

app.set('view engine', 'ejs');

// Set views directory


// Mount your auth routes
app.use('/api', authRoute);


app.use(express.static(path.join(process.cwd(), './build')));
app.get('/',(req,res)=>{
  res.render("index")

})
app.get('/home',(req,res)=>{
  res.render("home")
})
// Handle all routes by serving the React app index.html



app.listen(port, err => {
  createSession();
  if (err) {
    process.exit(1);
  }
  console.log(`listening on port ${port}`);
});
