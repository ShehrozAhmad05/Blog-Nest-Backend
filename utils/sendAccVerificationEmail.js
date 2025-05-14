const nodemailer = require('nodemailer');


const sendAccVerificationEmail = async (to, token) => {
    try {
        // Create a transporter object using SMTP transport
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        })
        //create the message
        const message = {
            to,
            subject: 'Account Verification',
            html: `<p>You are receiving this email because you (or someone else) have
            requested to verify your account.</p>
            <p>Please click on the following link, or paste this into your browser to complete
            the process</p>
            <p>http://localhost:5173/dashboard/account-verification/${token}</p>
            <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`
        }
        //send the email
        const info = await transporter.sendMail(message)
        console.log('Email sent: ' + info.messageId)
        //return the info
        return info
    } catch (error) {
        console.log(error)
        throw new Error('Error sending email')
    }
}

module.exports = sendAccVerificationEmail