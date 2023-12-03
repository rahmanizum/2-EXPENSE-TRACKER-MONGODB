const User = require('../models/users');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const Sib = require('sib-api-v3-sdk');
const client = Sib.ApiClient.instance;
client.authentications['api-key'].apiKey = process.env.SIB_API_KEY;
const tranEmailApi = new Sib.TransactionalEmailsApi(); 
exports.requestresetpassword = async (request, response, next) => {
    try {
        const { email } = request.body;
        const user = await User.fetchByEmail(email)
        if (user) {
            const sender = {
                email: 'ramanizum@gmail.com',
                name: 'From Mufil Rahman Pvt.Ltd'
            }
            const receivers = [
                {
                    email: email
                }
            ]
            const newUUID = uuidv4();
            await User.createForgotPassword(user._id, {
                forgotId: newUUID,
                isActive: true,
                createdAt: new Date()
            });
            const mailresponse = await tranEmailApi.sendTransacEmail({
                sender,
                to: receivers,
                subject: "Reset Your password",
                htmlContent: `
              <!DOCTYPE html>
                <html>
                <head>
                    <title>Password Reset</title>
                </head>
                <body>
                    <h1>Reset Your Password</h1>
                    <p>Click the button below to reset your password:</p>
                    <button><a href="${process.env.WEBSITE}/password/reset/{{params.role}}">Reset Password</a></button>
                </body>
                </html>`, params: {
                    role: newUUID
                }
            })
            response.status(200).json({ message: 'Password reset email sent' });
        } else {
            response.status(404).json({ message: 'User not found' });
        }


    } catch (error) {
        console.log(error);
        response.status(500).json({ message: 'Interenal Server Error' });
    }
}

exports.resetpasswordform = async (request, response, next) => {
    try {
        const { forgotId } = request.params;
        const  user = await User.fetchByForgotId(forgotId);
        const { forgotPassword } = user;
        if (forgotPassword.isActive) {
            forgotPassword.isActive = false;
            await User.updateForgotPassword(user._id,forgotPassword)
            response.sendFile('resetpassword.html', { root: 'views' })
        } else {
            return response.status(401).json({ message: "Link has been expired" })
        }

    } catch (error) {

    }
}

exports.resetpassword = async (request, response, next) => {
    try {
        const { resetid, newpassword } = request.body;
        const  user  = await User.fetchByForgotId(resetid);
        const { forgotPassword } = user;
        const currentTime = new Date();
        const createdAtTime = new Date(forgotPassword.createdAt);
        const timeDifference = currentTime - createdAtTime;
        const timeLimit = 5 * 60 * 1000; 
        if(timeDifference <= timeLimit){
            const hashedPassword = await bcrypt.hash(newpassword, 10);
            await User.updatePassword(user._id,hashedPassword)
            response.status(200).json({ message: "Password reset successful." });
        }else{
            response.status(403).json({ message: "Link has expired"});
        }
    } catch (error) {
        console.error("Error resetting password:", error);
        response.status(500).json({ message: "Internal server error" });
    }
};

