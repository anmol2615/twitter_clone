'use strict';

var nodemailer = require("nodemailer"),
    CONFIG = require('../Config');


var smtpTransport = nodemailer.createTransport("SMTP", {
    service: "gmail",
    // host : 'RajatGoyal-PC',
    //port: '8000',
    auth: {
        user: "anmol2615@gmail.com",
        pass: "anm#64448H"
    }
});


var anmolemail="anmol2615@gmail.com"
exports.sendLink = function(user,token) {
    var from = " Anmol<"+anmolemail+">";
    var to =  user;
    var mailbody = "<p> hello Thanks for Registering! Please verify your email by clicking on the verification link below.<br/> <a href='http://localhost:"+ CONFIG.SERVERCONFIG.PORT.LIVE+"/"+ CONFIG.USER_DATA.verifyLink +"/"+token+"'>Verification Link</a></p>"
    //console.log(typeof user.findOne({userName: "kuldeep"}));
    mail(from, to , "Account Verification", mailbody);
};


function mail(from, email, subject, mailbody){
    var mailOptions = {
        from: from, // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        //text: result.price, // plaintext body
        html: mailbody  // html body
    };

    smtpTransport.sendMail(mailOptions, function(error, reply) {
        if (error) {
            console.error(error);
        }
        else//console.log('Message sent: ' + reply.response);
        //console.log("success");
        smtpTransport.close(); // shut down the connection pool, no more messages
    });
}