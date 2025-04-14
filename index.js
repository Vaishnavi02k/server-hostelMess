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
    const { amount, customerEmail } = req.body; // Expecting amount and customerEmail from frontend

    // Create product in Stripe
    const product = await stripe.products.create({
        name: "test bill"
    });

    if (product) {
        // Create price for the product
        const price = await stripe.prices.create({
            product: product.id,
            unit_amount: amount * 100, // amount should be in paise (e.g., ₹100 = 10000 paise)
            currency: 'inr',
        });

        if (price.id) {
            // Create the session for Stripe Checkout
            const session = await stripe.checkout.sessions.create({
                line_items: [
                    {
                        price: price.id,
                        quantity: 1,
                    }
                ],
                mode: 'payment',
                success_url: "http://localhost:3000/success",
                cancel_url: "http://localhost:3000/cancel",
                customer_email: customerEmail || 'vaishnavi02kalhapure@gmail.com'  // Fallback to demo email
            });

            // Send the session URL to the frontend
            res.json({ session });
        } else {
            res.status(500).send("Error creating price.");
        }
    } else {
        res.status(500).send("Error creating product.");
    }
});

// Success and Cancel pages
app.get("/success", (req, res) => {
    res.send("Payment Successful!");
});

app.get("/cancel", (req, res) => {
    res.send("Payment Canceled.");
});

app.listen(port, () => {
    console.log(`Listening on ${port}`);
});
