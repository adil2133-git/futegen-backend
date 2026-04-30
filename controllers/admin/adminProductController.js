const productModel = require("../../models/productModel")
const cloudinary = require("../../config/cloudinary")

const getAllProducts = async (req, res) => {
    try {
        const {search, category, sortBy, page = 1, limit = 10} = req.query

        let filter = {}

        if(search && search.trim() !== ""){
            filter.name = { $regex: search, $options: "i"}
        }

        if(category && category !== "all"){
            filter.category = category
        }

        let sortOption = {}

        if(sortBy === "name"){
            sortOption.name = 1
        }else if(sortBy === "price"){
            sortOption.price = 1
        }else if(sortBy === "category"){
            sortOption.category = 1
        }else{
            sortOption.createdAt = -1
        }

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        const skip = (pageNumber - 1) * limitNumber;

        const totalProducts = await productModel.countDocuments(filter);

        const products = await productModel
            .find(filter)
            .sort(sortOption)
            .skip(skip)
            .limit(limitNumber)
            .lean()

        const formattedProducts = products.map(product => ({
            id: product._id.toString(),
            name: product.name,
            price: product.price,
            category: product.category,
            image: product.image,
            stock: product.stock,
            isActive: product.isActive
        }))

        res.status(200).json({ 
            Product: formattedProducts,
            pagination: {
                totalProducts,
                currentPage: pageNumber,
                totalPages: Math.ceil(totalProducts / limitNumber),
                limit: limitNumber
            }
        })
    } catch (err) {
        res.status(500).json({ message: "Error fetching products" })
    }
}

const addProduct = async (req, res) => {
    try {

        const { name, price, category, stock } = req.body

        if(!name || !price || !category){
            return res.status(400).json({ message: "All fields required"})
        }

        if (!req.file) {
            return res.status(400).json({ message: "Image required" })
        }

        const newProudct = await productModel.create({
            name,
            price,
            category,
            stock,
            image: req.file.path,
            public_id: req.file.filename
        })

        res.status(201).json(newProudct)
    } catch (err) {
        res.status(500).json({ message: "Error adding product", error: err.message })
    }
}

const updateProduct = async (req, res) => {
    try {
        const id = req.params.id
        const { name, price, category, stock } = req.body

        const product = await productModel.findById(id)

        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        const updatedData = {
            name,
            price,
            category,
            stock
        }



        if (req.file) {

            if (product.public_id) {
                await cloudinary.uploader.destroy(product.public_id)
            }

            updatedData.image = req.file.path
            updatedData.public_id = req.file.filename
        }

        const updatedProduct = await productModel.findByIdAndUpdate(
            id,
            updatedData,
            { new: true }
        )

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" })
        }

        res.status(200).json(updatedProduct)
    } catch (err) {
        res.status(500).json({ message: "Error updating product" })
    }
}

const toggleProudctStatus = async (req, res) => {
    try {
        const id = req.params.id

        const product = await productModel.findById(id)

        if (!product) {
            return res.status(404).json({ message: "Prouduct not found" })
        }

        product.isActive = !product.isActive
        await product.save()

        res.status(200).json({
            message: `Product ${product.isActive ? "activated" : "deactivated"}`,
            product: {
                id: product._id.toString(),
                name: product.name,
                isActive: product.isActive
            }
        })
    } catch (err) {
        res.status(500).json({
            message: "Error updating product status",
            error: err.message
        })
    }
}

const deleteProduct = async (req, res) => {
    try {
        const id = req.params.id
        const product = await productModel.findByIdAndDelete(id)

        if (!product) {
            return res.status(200).json({ message: "Product not found" })
        }

        if(product.public_id){
            await cloudinary.uploader.destroy(product.public_id)
        }


        res.status(200).json({ message: "Product deleted successfully" })
    } catch (err) {
        res.status(500).json({ message: "Error deleting product" })
    }
}

module.exports = {
    addProduct,
    getAllProducts,
    updateProduct,
    deleteProduct,
    toggleProudctStatus
}