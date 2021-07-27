const jwt = require("jsonwebtoken");
    //For making sleek request (Axios Baba!

class Authentication {
    async createJWT(payload) {
        const token = jwt.sign(payload, "secret", {
            algorithm: "HS256",
            expiresIn: "1d",
        });
        return { status: 200, msg: token };
    }

    // This method verify's a token and issues new one should it expire
    async verifyJWT(token) {
        try {
            // Let's verify the toke synchronously
            return jwt.verify(
                token,
                "secret",
                (err, payload) => {
                    if (err) {
                        // Let's check what type of err
                        switch (err.name) {
                            case "TokenExpiredError":
                                return { status: 403, msg: "Token Expired", err };
                            default:
                                return { status: 403, msg: "Verification Error" };
                        }
                    } else {
                        if (payload.username) {
                            return { status: 200, msg: payload };
                        }
                        return { status: 301, msg: "Malformed Payload" };
                    }
                }
            );
        } catch (err) {
            return { status: 403, msg: "Verification Error", err };
        }
    }
}

module.exports = Authentication;
