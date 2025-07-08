import JWT from 'jsonwebtoken';

import 'dotenv/config';

// Token for Player/User

const setUserTokenAndCookie = async (user,res)=>{
    const payLoad = {
        userId:user._id,
    }

    const token = JWT.sign(payLoad,process.env.JWT_Secret_Key,{expiresIn:'7d'});

    res.cookie('JWT_User',token,{
        httpOnly:true,
        secure:process.env.NODE_ENV !== 'development',
        sameSite:process.env.NODE_ENV !== 'development' ? 'none' : 'strict',
        maxAge:7 * 24 * 60 * 60 * 1000, 
    })

}



const userAuthMiddleware = async (req,res,next)=>{
    try{

        const token = req.cookies.JWT_User;

        if(!token){
            return res.json({success:false,message:`Your Session Has Been Expired, Please Try Login Again`});
        }
        
        const user = JWT.verify(token,process.env.JWT_Secret_Key);
        // console.log(user);
        /**
         * {
            userId: '6818d1631ba2d662e0c19406',
            iat: 1746466226,
            exp: 1747071026
           }
         */
        if(user.userId){
            req.user = user.userId;
        }else{
            return res.json({success:false,message:`User is Not Authorized Login Again Please`});
        }
        
        next();
        
    }catch(error){
        return res.json({success:false,message:`Error In User Authentication Middleware ${error}`});
    }

}



// Tokens For Admin




const generateTokenForAdmin = async (res)=>{
    const payLoad = {
        mail:process.env.ADMIN_EMAIL,
    }

    const token = JWT.sign(payLoad,process.env.JWT_Secret_Key,{expiresIn:'1d'});

    res.cookie('JWT_Admin',token,{
        httpOnly:true,
        secure:process.env.NODE_ENV !== 'development',
        sameSite:process.env.NODE_ENV !== 'development' ? 'none' : 'strict',
        maxAge:1 * 24 * 60 * 60 * 1000, 
    });

}


const adminAuthMiddleware = async (req,res,next)=>{
    try{

        const token = req.cookies.JWT_Admin;

        if(!token){
            return res.json({success:false,message:`Admin Session Has Been Expired, Please Try Login Again`});
        }
        
        const admin = JWT.verify(token,process.env.JWT_Secret_Key);
        
        if(admin.mail){
            req.adminMail = admin.mail;
        }else{
            return res.json({success:false,message:`Admin is Not Authorized Login Again Please`});
        }
        
        next();
        
    }catch(error){
        return res.json({success:false,message:`Error In Admin Authentication Middleware ${error}`});
    }
}





// Token For Organizer



const setOrganizerTokenAndCookies = async (organizer,res)=>{
    const payLoad = {
        organizerId:organizer._id,
    }

    const token = JWT.sign(payLoad,process.env.JWT_Secret_Key,{expiresIn:'1d'});

    res.cookie('JWT_Organizer',token,{
        httpOnly:true,
        secure:process.env.NODE_ENV !== 'development',
        sameSite:process.env.NODE_ENV !== 'development' ? 'none' : 'strict',
        maxAge: 1 * 24 * 60 * 60 * 1000, 
    });

}


const organizerAuthMidlleware = async (req,res,next)=>{
    try{

        const token = req.cookies.JWT_Organizer;

        if(!token){
            return res.json({success:false,message:`Organizer Session Has Been Expired, Please Try Login Again`});
        }
        
        const organizer = JWT.verify(token,process.env.JWT_Secret_Key);
        
        if(organizer.organizerId){
            req.organizer = organizer.organizerId;
        }else{
            return res.json({success:false,message:`Organizer is Not Authorized Login Again Please`});
        }
        
        next();
        
    }catch(error){
        return res.json({success:false,message:`Error In Organizer Authentication Middleware ${error}`});
    }
}




export { setUserTokenAndCookie, userAuthMiddleware, generateTokenForAdmin, adminAuthMiddleware, setOrganizerTokenAndCookies, organizerAuthMidlleware };