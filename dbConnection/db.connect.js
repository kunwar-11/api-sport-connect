const mongoose = require('mongoose')
const initializeConncetion = async () => {
    try {
        await mongoose.connect(process.env.URI , {
            useUnifiedTopology : true,
            useNewUrlParser : true
        })
        console.log('successfully conncected')
    } catch (error) {
        console.log('connection failed' , error)
    }
}

module.exports = {initializeConncetion}