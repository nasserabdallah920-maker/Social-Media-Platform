const {createTransport}=require("nodemailer")

const transpoter=createTransport({
    service:"gmail",
    auth:{
        user:process.env.EMAIL_NODEMAILER,
        pass:process.env.PASS_NODEMAILER
    }
})

module.exports={
    transpoter
}