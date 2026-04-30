const User = require("../../models/userModel")

const getAllUsers = async (req, res) => {
    try {
        const { search = "", status = "all", sort = "name", page = 1, limit = 10 } = req.query

        let query = {}

        if (search) {
            query.$or = [
                { Fname: { $regex: search, $options: "i" } },
                { Lname: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ]
        }

        if (status === "active") {
            query.blocked = false
        } else if (status === "blocked") {
            query.blocked = true
        }


        let sortOption = {};
        if (sort === "name") {
            sortOption = { Fname: 1 };
        } else if (sort === "email") {
            sortOption = { email: 1 }
        } else if (sort === "status") {
            sortOption = { blocked: 1 }
        }

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        const skip = (pageNumber - 1) * limitNumber;

        const totalUsers = await User.countDocuments(query);

        const users = await User.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limitNumber)
            .select("-password")
            .lean()

        const formattedUsers = users.map((user) => ({
            id: user._id,
            Fname: user.Fname,
            Lname: user.Lname,
            email: user.email,
            role: user.role,
            blocked: user.blocked
        }))

        res.status(200).json({
            data: formattedUsers,
            pagination: {
                totalUsers,
                currentPage: pageNumber,
                totalPages: Math.ceil(totalUsers / limitNumber),
                limit: limitNumber
            }
        })
    } catch (err) {
        res.status(500).json({ message: "Error fetching users" })
    }
}

const updateUserStatus = async (req, res) => {
    try {
        const {id} = req.params
        const {blocked} = req.body

        const user = await User.findByIdAndUpdate(
            id,
            {blocked},
            { new: true }
        ).select("-password")

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        res.status(200).json({
            message: "User status updated",
            user
        });

    } catch (err) {
        res.status(500).json({ message: "Error updating user" })
    }
}

module.exports = {
    getAllUsers,
    updateUserStatus
}