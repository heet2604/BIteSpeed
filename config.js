const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI ||  'mongodb://host.docker.internal:27017/bitespeed' , {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("MongoDB Connected");
    } catch (error) {
        console.log("Error occurred", error);
    }
};

module.exports = connectDB