const validate = (Schema) => (req, res, next) => {
    try{
    const result = Schema.safeParse(req.body);

    if(!result.success){
        const formattedErrors = result.error.errors.map(err => ({
            field: err.path[0],
            message: err.message
        }))

        return res.status(400).json({
            message: "Validation failed",
            errors: formattedErrors
        })
    }

    req.body = result.data;
    next()
}catch(err){
    return res.status(500).json({
        message: "Validation middleware error",
        error: err.message
    })
}
}

module.exports = validate