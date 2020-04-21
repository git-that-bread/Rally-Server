
module.exports = {
    mongoURI: `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_URI}`
}