import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;
// console.log("token",token);
        if (!token) {
            return res.status(401).json({
                message: 'User not authenticated',
                success: false,
            });
        }

        // Verify the token
        const decode = await jwt.verify(token, process.env.SECRET_KEY);

        // If token is valid, attach user ID to the request object
        req.id = decode.userId;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            // Handle token expiration
            return res.status(401).json({
                message: 'Token has expired. Please log in again.',
                success: false,
            });
        } else if (error.name === "JsonWebTokenError") {
            // Handle invalid token
            return res.status(401).json({
                message: 'Invalid token. Please log in again.',
                success: false,
            });
        }

        // Handle other errors
        console.error(error);
        return res.status(500).json({
            message: 'An error occurred during authentication',
            success: false,
        });
    }
};

export default isAuthenticated;
