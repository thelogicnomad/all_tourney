import bcrypt from 'bcryptjs';

import validator from 'validator';


import PlayerModel from '../../Models/Player/PlayerModel.js';

import cloudinary from '../../Config/cloudinary.js';


import { setUserTokenAndCookie } from '../../Middlewares/jwtAuth.js';


import generateSecureOTP from '../../Config/getOTP.js';

import transporter from '../../Config/nodemailer.js';


const signUp = async (req,res)=>{
    try{

        const { fullName, email, password, phoneNumber, dateOfBirth, aadhaarCard } = req.body;

        if(!fullName || !email || !password || !phoneNumber || !dateOfBirth || !aadhaarCard){
            return res.json({success:false,message:`All Fields Are Mandatory`});
        }


        if(!validator.isEmail(email)){
            return res.json({success:false,message:`Please Provide The Proper Mail`});
        }

        if(password.length<8){
            return res.json({success:false,message:`Password Must be minimum of length 8`});
        }


        const userExists = await PlayerModel.findOne({email});

        if(userExists && userExists.isAccountVerified){
            return res.json({success:false,message:`User With Provided Mail Already Exists`});
        }

        const saltRound = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password,saltRound);




        const {OTP,hashedOTP,expiredAt} = await generateSecureOTP();

        // console.log(OTP,hashedOTP,expiredAt);


        let newUser = "";
        let updatedUser = "";

         const image = await cloudinary.uploader.upload(aadhaarCard);

         const uploadURL = image.secure_url;


        if(!userExists){

            newUser = await PlayerModel.create({
                fullName,
                email,
                phone:phoneNumber,
                DateOfBirth:dateOfBirth,
                password:hashedPassword,
                aadhaarImage:uploadURL,
                verifyOtp:hashedOTP, 
                verifyOtpExpiredAt: expiredAt
            })
            
        }else{
            updatedUser = await PlayerModel.findOneAndUpdate({email},
                {
                    $set:{
                       fullName,
                       email,
                       phone:phoneNumber,
                       DateOfBirth:dateOfBirth,
                       password:hashedPassword,
                       aadhaarImage:uploadURL,
                       verifyOtp:hashedOTP, 
                       verifyOtpExpiredAt: expiredAt
                    }
                }
            )
        }

        console.log(newUser,updatedUser);

        try{
           

            const mailOption = {
                from:`Tourney 24 <${process.env.SENDER_EMAIL_SMT}>`,
                to:email,
                subject:`Welcom To Tourney 24 Community`,
                html: `
                  <h1> Hello ${fullName}</h1>
                  <h2>We Heartly Welcome You as Player in Tourney 24  </h2>
                  <p>Enter the OTP <h1>  <b> ${OTP} </b> </h1> To Create Account With The Provided email: <strong>${email}</strong></p>
                  <p>Enjoy your experience 💖</p>
                  
                `,
            }

            

            const info = await transporter.sendMail(mailOption);
            // console.log(`Mail Has been Sent With The message id :- ${info}, ${info.messageId}`); 

        }catch(error){
            console.log(`Error while Generating the mail ${error}, ${error.message}`);
            return res.json({success:false,message:"Error In Sending OTP to Player's Email"});
        }



        
        res.json({success:true,message:`OTP Has Been Sent SuccessFully`});


    }catch(error){
        console.log(`Error In Signup End-Point of User (Player) ${error}`);
        res.json({success:false,message:`Error In Signup End Point ${error}`});
    }
}




const verifyEmailWithOTP = async (req,res)=>{
    try{

        const { OTP, playerMail } = req.body;

        console.log(req.body);

        if(!OTP){
            return res.json({sucess:false,message:"Enter the OTP"});
        }

        const player = await PlayerModel.findOne({email:playerMail});
        console.log(player);
        if(!player){
            return res.json({success:false,message:"Email Not Found"});
        }

        console.log(player);
        
        if(player.verifyOtp==""){
            return res.json({success:false,message:`OTP Is Not Found`})
        }

        console.log(OTP,player.verifyOtp);
        console.log(String(OTP));

        const isOTPVerified = await bcrypt.compare(String(OTP),player.verifyOtp);

        if(player.verifyOtp=='' || !isOTPVerified){
            return res.json({success:false,message:`Invalid OTP`});
        }

        if(player.verifyOtpExpiredAt < Date.now()){
            return res.json({success:false,message:`OTP Has Been Expired`});
        }

        const newUser = await PlayerModel.findOneAndUpdate(
            {email:playerMail},
            {
                $set:{
                    isAccountVerified:true,
                    verifyOtp:"",
                    verifyOtpExpiredAt:0,
                }
            },
            {new:true}
        ) 

        setUserTokenAndCookie(newUser,res);

        return res.json({success:true,message:`Account Has Been Created And Verified Succcessfully, Continue Registering for Events`});



    }catch(error){
       console.log(`Error in the verify OTP (BackEnd) ${error}`);
        return res.json({success:false,message:`Error in the verify OTP (BackEnd) ${error}`});
    }
}




const login = async (req,res)=>{
    try{

        const { email, password } = req.body;
        
        if(!email || !password) {
            return res.json({success:true,message:`All Mentioned Fields Are Mandatory To Sign up`});
        }

        const user = await PlayerModel.findOne({email});

        if(!user){
            return res.json({success:false,message:`User With the Provided Mail Doesn't Exist `});
        }
        
        if(!user.isAccountVerified){
            return res.json({succes:false,message:`User With the Provided Mail Doesn't Exist, Please Sign Up to continue`});
        }

        const isPassWordCorrect = await bcrypt.compare(password,user.password); 

        if(!isPassWordCorrect){
            return res.json({success:false,message:`Incorrect PassWord, Please Try Again`});
        }

        setUserTokenAndCookie(user,res);

        return res.json({success:true,message:`Player Logged In SuccessFully`});


    }catch(error){
        console.log(`Error in Login End Point of Player ${error}`);
        res.json({success:false,message:`Error In Login End Point ${error}`});
    }
}




const checkPlayerAuthorization = async (req,res)=>{

    try{

        return res.json({success:true,message:`Player is Authorised`});

    }catch(error){
        console.log(`Error In CHecking Player Authorisation End Point ${error}`);
        res.json({success:false,message:`Error In Checking Player Authorization Rotue, ${error}`});
    }

}



const getCurrentPlayer = async (req,res)=>{
    
    try{

        
        const  playerId  = req.user;
        // console.log(userId);
        if(!playerId){
            return res.json({success:false,message:`Player is Not Authorized`});
        }
       
        const player = await PlayerModel.findById(playerId).select(['-password']);

        if(!player){
            return res.json({success:false,message:`Player Doesn't Exist `});
        }

        

        return res.json({success:true,message:player});

          
    }catch(error){
        console.log(`Error In Getting Player Data End Point ${error}`);
        res.json({success:false,message:`Error In Getting Player Data End Point, ${error}`});
    }

}




const logOut = async (req,res)=>{
    try{

        res.clearCookie('JWT_User',{
            httpOnly:true,
            secure:process.env.NODE_ENV === 'production',
            sameSite:process.env.NODE_ENV === 'development' ? 'strict' : 'none',
        })

        return res.json({success:true,message:`Player Logged Out Success Fully`});

    }catch(error){
        console.log(`Error In LogOut of Player End Point ${error}`);
        res.json({success:false,message:`Error In LogOut of Player End Point, ${error}`});
    }
}












export { signUp,verifyEmailWithOTP,login, checkPlayerAuthorization, getCurrentPlayer, logOut };