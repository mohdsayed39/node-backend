import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};
console.log(generateToken);

const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

export { generateToken, verifyToken, hashPassword, comparePassword };
