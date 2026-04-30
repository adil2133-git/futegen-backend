const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser");
const {client} = require("./config/redis")

const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes")
const wishlistRoutes = require("./routes/wishlistRoutes")
const orderRoutes = require("./routes/orderRoutes")
const paymentRoutes = require("./routes/paymentRoutes")
const contactRoutes = require("./routes/contactRoutes")

const adminProductRoutes = require("./routes/Admin/adminProductRoutes")
const adminUserRoutes = require("./routes/Admin/adminUserRoutes")
const adminOrderRoutes = require("./routes/Admin/adminOrderRoutes")
const adminDashboardRoutes = require("./routes/Admin/adminDashboardRoutes")

const app = express();


app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())

app.get("/redis-test", async (req, res) => {
    try{
        await client.set("check", "working");
        const data = await client.get("check");

        res.json({data})
    }catch(err){
        res.status(500).json({error: err.message})
    }
})

app.use("/api/users", userRoutes)
app.use("/api/products", productRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/wishlist", wishlistRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/payment", paymentRoutes)
app.use("/api/contact", contactRoutes)


app.use("/api/admin/product", adminProductRoutes)
app.use("/api/admin/user", adminUserRoutes)
app.use("/api/admin/order", adminOrderRoutes)
app.use("/api/admin/dashboard", adminDashboardRoutes)


module.exports = app