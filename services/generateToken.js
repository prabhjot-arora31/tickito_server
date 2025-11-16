import jwt from "jsonwebtoken";
const generateToken = (data) => {
  console.log("data is:", data);
  const token = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "1h" });
  return token;
};
export default generateToken;
