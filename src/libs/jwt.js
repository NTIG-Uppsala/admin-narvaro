import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()


export const isTokenValid = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
            if (err) return reject({ valid: false, error: err })
            else return resolve({ valid: true, data: data })
        })

    })
}

export const generateAccessToken = (dataObject, ttl = undefined) => {
    return jwt.sign(dataObject, process.env.JWT_SECRET, (ttl)? {expiresIn: ttl} : {} )
}

export const generateRefreshToken = () => {

}