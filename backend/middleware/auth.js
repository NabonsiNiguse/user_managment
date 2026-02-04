// middleware/auth.js
import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(403).json({ 
                success: false, 
                message: "መግባት አልተፈቀደም! ቲኬት አልተገኘም" 
            });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({ 
                        success: false, 
                        message: "ቲኬትዎ ጊዜው አልፎበታል" 
                    });
                }
                return res.status(401).json({ 
                    success: false, 
                    message: "ልክ ያልሆነ ቲኬት" 
                });
            }
            
            req.user = decoded;
            next();
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "የማረጋገጫ ስህተት"
        });
    }
};

export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: "ማረጋገጫ ያስፈልጋል" 
            });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `የተፈቀደ ለሆኑ ተጠቃሚዎች ብቻ: ${roles.join(', ')}` 
            });
        }
        
        next();
    };
};