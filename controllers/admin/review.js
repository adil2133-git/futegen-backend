// fetch the revenu
// the most ordered product
// the most expensive product from each category

const orderModel = require("../../models/orderModel")

const express = require("express")
const productModel = require("../../models/productModel")
const router = express.Router()

router.get("/review", async (req, res) => {
    try{
    // const delivered = await orderModel.find({staus: "delivered"})

    // const totalRevenue = delivered.reduce((sum, order) => {
    //     sum 
    // })

    const revenue = await orderModel.aggregate([
        {
            $match: {status: "delivered"}
        },
        {
            $group:{
                _id:null,
                totalRevenue:{$sum:"$totalAmount"}
            }
        }
    ])


    const finalRevenue = revenue[0].totalRevenue

    const {category} = req.query

    const filter = {}

    if(category){
        filter.category = category
    }

    const expensiveProduct = await productModel.find(filter).sort({price:-1}).limit(1)

    const findmostOrderedProduct = await orderModel.aggregate([
        {
            $unwind: "$items"
        },
        {
            $group:{
                _id: "$items.productId",
                totalOrdered: {$sum: "$items.quantity"},
                productName:{$first:"$items.name"}
            }
        },
        {
            $sort: {totalOrdered: -1}
        },
        {
            $limit: 1
        }
    ])
    
    const mostOrderedProduct = {
        name: findmostOrderedProduct[0].productName,
        totalOrder: findmostOrderedProduct[0].totalOrdered
    }

    res.status(200).json({message: "Task", revenue, mostOrderedProduct})
    }catch(err){
        res.status(500).json({message: "Error in task", Error: err.message})
    }

})

module.exports = router