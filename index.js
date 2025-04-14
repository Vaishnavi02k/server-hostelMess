var express = require("express");
const app = express();
const port = 3001;
const cors = require('cors');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Middleware to parse JSON
app.use(express.json());  // Make sure to parse incoming JSON requests
app.use(cors());

app.get("/", (req, res) => {
    res.send("Server IIT Goa Hostel Mess!");
});

app.post("/payment", async (req, res) => {
    const { amount, customerEmail, regNo } = req.body;
  
    if (!regNo) {
      return res.status(400).json({ error: "regNo is required" });
    }
  
    try {
      const product = await stripe.products.create({
        name: "Mess Bill",
      });
  
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: amount * 100,
        currency: "inr",
      });
  
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `https://student-mess-portal.vercel.app/${regNo}/success`,
        cancel_url: `https://student-mess-portal.vercel.app/${regNo}/cancel`,
        customer_email: customerEmail,
      });
  
      res.json({ session });
    } catch (error) {
      console.error(error);
      res.status(500).send("Payment session creation failed.");
    }
  });
  

// Success and Cancel pages
app.get("/success", (req, res) => {
    res.send("Payment Successful!");
});

app.get("/cancel", (req, res) => {
    res.send("Payment Canceled.");
});

app.listen(`https://server-hostel-mess.vercel.app/` || port, () => {
    console.log(`Listening on ${port}`);
});
