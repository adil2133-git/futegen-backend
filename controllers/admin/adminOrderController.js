const orderModel = require("../../models/orderModel")

const getAllOrders = async (req, res) => {
    try{
        const {
            search = "",
            status = "all",
            sort = "newest",
            startDate,
            endDate,
            page = 1,
            limit = 10
        } = req.query

        let query = {}

        if(search) {
            query.$or = [
                {orderNumber: { $regex: search, $options: "i"}},
                {"shippingAddress.email": {$regex: search, $options: "i"}},
                {"shippingAddress.Fname": {$regex: search, $options: "i"} },
                {"shippingAddress.Lname": {$regex: search, $options: "i"} },
            ]
        }

        if(status !== "all"){
            query.status = status
        }

        if(startDate || endDate){
            query.createdAt = {}

            if(startDate){
                query.createdAt.$gte = new Date(startDate)
            }

            
            if(endDate){
                query.createdAt.$lte = new Date(endDate)
            }
        }

        let sortOption = {createdAt: -1}

        if(sort === "oldest") sortOption = {createdAt: 1}
        if(sort === "totalHigh") sortOption = {totalAmount: -1}
        if(sort === "totalLow") sortOption = {totalAmount: 1}

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit)

        const skip = (pageNumber - 1) * limitNumber;

        const totalOrders = await orderModel.countDocuments(query)

        const orders = await orderModel
            .find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limitNumber)
            .lean()

            const formattedOrders = orders.map(order => ({
                id: order._id,
                orderNumber: order.orderNumber,
                customerName: `${order.shippingAddress?.Fname || ""} ${order.shippingAddress?.Lname || ""}`,
                customerEmail: order.shippingAddress?.email || "",
                shippingAddress: order.shippingAddress,
                items: order.items || [],
                total: `₹ ${order.totalAmount}`,
                status: order.status,
                paymentMethod: order.paymentMethod,
                createdAt: order.createdAt
            }));

            res.status(200).json({
                data: formattedOrders,
                pagination: {
                    totalOrders,
                    currentPage: pageNumber,
                    totalPages: Math.ceil(totalOrders / limitNumber),
                    limit: limitNumber
                }
            })
    }catch(err){
        res.status(500).json({
            message: "Error fetching orders",
            error: err.message
        })
    }
}


const updateOrderStatus = async (req, res) => {
    try{
        const {status} = req.body

        const order = await orderModel.findById(req.params.id)

        if(!order){
            return res.status(404).json({
                message: "Order not found"
            });
        }

        order.status = status

        await order.save();

        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            data: order
        })
    }catch(err){
        res.status(500).json({
            message: "Error updating order",
            error: err.message
        });
    }
}

module.exports = {
    getAllOrders,
    updateOrderStatus
}