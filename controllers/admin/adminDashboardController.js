const orderModel = require("../../models/orderModel")
const productModel = require("../../models/productModel")
const userModel = require("../../models/userModel")

const getDashboardStats = async (req, res) => {
    try{
        const totalOrders = await orderModel.countDocuments()
        const totalProducts = await productModel.countDocuments()
        const totalUsers = await userModel.countDocuments()

        const deliveredOrders = await orderModel.find({ status : "delivered"})

        const totalRevenue = deliveredOrders.reduce((sum, order) => {
            return sum + (order.totalAmount || 0)
        }, 0)

        const pendingOrders = await orderModel.countDocuments({
            status: { $in : ["pending", "confirmed"]}
        });

        const recentOrdersRaw = await orderModel
            .find()
            .sort({ createdAt: -1})
            .limit(5)
            .lean()

        const recentOrders = recentOrdersRaw.map(order => ({
            id: order._id,
            orderNumber: order.orderNumber,
            customerName: `${order.shippingAddress?.Fname || ""} ${order.shippingAddress?.Lname || ""}`,
            total: `₹ ${order.totalAmount}`,
            status: order.status,
            image: order.items?.[0]?.image || ""
        }))

        res.status(200).json({
            totalOrders,
            totalProducts,
            totalUsers,
            totalRevenue,
            pendingOrders,
            recentOrders
        })

    }catch(err){
        res.status(500).json({
            message: "Error fetching dashboard data",
            error: err.message
        })
    }
}

module.exports = { getDashboardStats}