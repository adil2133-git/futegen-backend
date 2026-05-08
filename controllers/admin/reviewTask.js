const express = require("express")
const productModel = require("../../models/productModel")
const orderModel = require("../../models/orderModel")
const userModel = require("../../models/userModel")

const router = express.Router()

router.get("/review", async (req, res) => {
    try{
        const products = await productModel.find()

        if(!products){
            return res.status(404).json("Proudcts not found")
        }

        const totalProducts = products.length

        
        const {category} = req.query
        const filter = {}

        if(category){
            filter.category = category
        }
        const productByCategory = await productModel.find(filter)

        const categoryLength = productByCategory.length

        
        const delivered = await orderModel.find({status : "delivered"})

        const totalRevenue = delivered.reduce((sum, order) => {
            return sum + (order.totalAmount)
        }, 0)


        const activeUser = await userModel.find({ blocked: false})
        const inactiveUser = await userModel.find({ blocked: true})

        const activeUsers = activeUser.length
        const inactiveUsers = inactiveUser.length



        res.status(200).json({message: "Tasks", totalProducts, totalRevenue, activeUsers, inactiveUsers, categoryLength, productByCategory })
    }catch(err){
        res.status(500).json({message: "Error in Tasks", Error: err.message})
    }
})

module.exports = router