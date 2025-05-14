const nodemailer = require('nodemailer');


const sendNotificationMsg = async (to, postId) => {
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
            subject: 'New Post Created',
            html: `<p>A new post has been created on our site Blog Nest.</p>
            <p>Click <a href="http://localhost:5173/posts/${postId}">here</a> to view the post.</p>`
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

module.exports = sendNotificationMsg