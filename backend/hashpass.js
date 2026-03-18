import bcryptjs from 'bcryptjs';
const newPassword = await bcryptjs.hash('password123', 10);
console.log(newPassword);