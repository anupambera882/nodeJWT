module.exports = (req, res, next) => {
    const bearerHeader = req.headers.authorization;
    if (bearerHeader) {
        const bearerHeaders = bearerHeader.split(" ");
        const token = bearerHeaders[1];
        req.token = token;
        next();
    } else {
        return res.send({
            result: 'Token is not valid'
        })
    }
}