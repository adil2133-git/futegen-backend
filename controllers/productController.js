const productModel = require("../models/productModel")

const getProducts = async (req, res) => {
    const { category, search } = req.query;

    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 8;

    const skip = (page - 1) * limit

    try {
        const filter = {
            isActive: true
        }

        if(search && search.trim() !== ""){
            filter.name = { $regex: search, $options: "i" }
        }

        if (category && category !== "") {
            filter.category = { $regex: `^${category}$`, $options: "i" }
        }

        const total = await productModel.countDocuments(filter)


        const productsData = await productModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .lean()

        const formattedProducts = productsData.map(product => ({
            id: product._id.toString(),
            name: product.name,
            price: product.price,
            category: product.category,
            image: product.image,
            stock: product.stock
        }))

        res
            .status(200)
            .json({
                Product:formattedProducts,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                hasMore: page * limit < total
        });
    } catch (err) {
        res.status(500).json({ message: "Products Fetching Error In Server", Error: err.message })
    }
};



const getSingleProduct = async (req, res) => {
    try{
        const product = await productModel.findById(req.params.id).lean()

        if(!product){
            return res.status(404).json({ message: "Product not found"})
        }

         const formattedProduct = {
            id: product._id,
            name: product.name,
            price: product.price,
            category: product.category,
            image: product.image,
            description: product.description,
            stock: product.stock
        }

        res.status(200).json(formattedProduct)
    }catch(err){
        res.status(500).json({ message: "Error fetching product", error: err.message})
    }
}


module.exports = { getProducts, getSingleProduct}