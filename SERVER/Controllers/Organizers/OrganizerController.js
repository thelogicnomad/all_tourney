import bcrypt from 'bcryptjs';
import cloudinary from '../../Config/cloudinary.js';
import validator from 'validator';


import Organizer from '../../Models/Organizer/OrganizerModel.js';
import Tournament from '../../Models/Organizer/Tournament.js';
import Events from '../../Models/Organizer/Event.js';
import PlayerModel from '../../Models/Player/PlayerModel.js';
// import Team from '../../Models/Organizer/Teams.js';

import TeamIndividual from '../../Models/Organizer/TeamIndividual.js';
import TeamGroup from '../../Models/Organizer/TeamGroup.js';



import { setOrganizerTokenAndCookies } from '../../Middlewares/jwtAuth.js';
import generateSecureOTP from '../../Config/getOTP.js';

import transporter from '../../Config/nodemailer.js';


const signUp = async (req,res)=>{
    try{

        const { fullName, email, password, organizationName, phone } = req.body;

        if(!fullName || !email || !password || !organizationName || !phone){
            return res.json({success:false,message:`All Fields Are Mandatory`});
        }


        if(!validator.isEmail(email)){
            return res.json({success:false,message:`Please Provide The Proper Mail`});
        }

        if(password.length<8){
            return res.json({success:false,message:`Password Must be minimum of length 8`});
        }


        const organizerExists = await Organizer.findOne({email});

        if(organizerExists && organizerExists.isAccountVerified){
            return res.json({success:false,message:`Organizer With Provided Mail Already Exists`});
        }

        const saltRound = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password,saltRound);



        // setUserTokenAndCookie(newUser,res);

        // console.log("New User Created SUccessfully",newUser);


        const {OTP,hashedOTP,expiredAt} = await generateSecureOTP();

        let newUser = "";
        let updatedUser = "";

        if(!organizerExists){

            newUser = await Organizer.create({
                fullName,
                email,
                organizationName,
                phone,
                password:hashedPassword,
                verifyOtp:hashedOTP, 
                verifyOtpExpiredAt: expiredAt
            })
            
        }else{
            updatedUser = await Organizer.findOneAndUpdate({email},
                {
                    $set:{
                        fullName,
                        email,
                        organizationName,phone,
                        password:hashedPassword,
                        verifyOtp:hashedOTP, 
                        verifyOtpExpiredAt: expiredAt
                    }
                }
            )
        }



        try{
           

            const mailOption = {
                from:`Tourney 24 <${process.env.SENDER_EMAIL_SMT}>`,
                to:email,
                subject:`Welcom To Tourney 24`,
                html: `
                  <h1> Hello ${fullName}</h1>
                  <h2>We Heartly Welcome You as Organizer in Tourney 24 </h2>
                  <p>Enter the OTP  <b> ${OTP} </b> To Create Account With The Provided email: <strong>${email}</strong></p>
                  <p>Enjoy your experience 💖</p>
                  
                `,
            }

            

            const info = await transporter.sendMail(mailOption);
            console.log(`Mail Has been Sent With The message id :- ${info}, ${info.messageId}`); 

        }catch(error){
            console.log(`Error while Generating the mail ${error}, ${error.message}`);
            return res.json({success:false,message:"Error In Sending OTP to Organizer's Email"});
        }



        res.json({success:true,message:`OTP Has Been Sent SuccessFully`});


    }catch(error){
        console.log(`Error In Signup End-Point of (Organizer) ${error}`);
        res.json({success:false,message:`Error In Signup End Point ${error}`});
    }
}




const verifyEmailWithOTP = async (req,res)=>{
    try{

        const { OTP, organizerMail } = req.body;

        console.log(req.body);

        if(!OTP){
            return res.json({sucess:false,message:"Enter the OTP"});
        }

        const organizer = await Organizer.findOne({email:organizerMail});
        console.log(organizer);
        if(!organizer){
            return res.json({success:false,message:"Email Not Found"});
        }

        console.log(organizer);
        
        if(organizer.verifyOtp==""){
            return res.json({success:false,message:`OTP Is Not Found`})
        }

        const isOTPVerified = await bcrypt.compare(String(OTP),organizer.verifyOtp);

        if(organizer.verifyOtp=='' || !isOTPVerified){
            return res.json({success:false,message:`Invalid OTP`});
        }

        if(organizer.verifyOtpExpiredAt < Date.now()){
            return res.json({success:false,message:`OTP Has Been Expired`});
        }

        const newOrganizer = await Organizer.findOneAndUpdate(
            {email:organizerMail},
            {
                $set:{
                    isAccountVerified:true,
                    verifyOtp:"",
                    verifyOtpExpiredAt:0,
                }
            },
            {new:true}
        ) 

        setOrganizerTokenAndCookies(newOrganizer,res);

        return res.json({success:true,message:`Account Has Been Created And Verified Succcessfully, Start Creating the Tournaments`});


    }catch(error){
       console.log(`Error in the verify OTP (BackEnd) ${error}`);
        return res.json({success:false,message:`Error in the verify OTP (BackEnd) ${error}`});
    }
}




const login = async (req,res)=>{
    try{

        const { email, password } = req.body;
        
        if(!email || !password) {
            return res.json({success:true,message:`All Mentioned Fields Are Mandatory To Login`});
        }

        const organizer = await Organizer.findOne({email});

        if(!organizer){
            return res.json({success:false,message:`Organizer With the Provided Mail Doesn't Exist `});
        }
        
        if(!organizer.isAccountVerified){
            return res.json({succes:false,message:`Organizer With the Provided Mail Doesn't Exist, Please Sign Up to continue`});
        }

        const isPassWordCorrect = await bcrypt.compare(password,organizer.password); 

        if(!isPassWordCorrect){
            return res.json({success:false,message:`Incorrect PassWord, Please Try Again`});
        }

        setOrganizerTokenAndCookies(organizer,res);

        return res.json({success:true,message:`Organizer Logged In SuccessFully`});


    }catch(error){
        console.log(`Error in Login End Point of Organizer ${error}`);
        res.json({success:false,message:`Error In Login End Point ${error}`});
    }
}




const checkOrganizerAuthorization = async (req,res)=>{

    try{

        return res.json({success:true,message:`Organizer is Authorised`});

    }catch(error){
        console.log(`Error In CHecking Organizer Authorisation End Point ${error}`);
        res.json({success:false,message:`Error In Checking Organizer Authorization Rotue, ${error}`});
    }

}



const getCurrentOrganizer = async (req,res)=>{
    
    try{

        
        const  organizerId  = req.organizer;
        // console.log(userId);
        if(!organizerId){
            return res.json({success:false,message:`Organizer is Not Authorized`});
        }
       
        const organizer = await Organizer.findById(organizerId).select(['-password']);

        if(!organizer){
            return res.json({success:false,message:`Organizer Doesn't Exist `});
        }

        

        return res.json({success:true,message:organizer});

          
    }catch(error){
        console.log(`Error In Getting Organizer Data End Point ${error}`);
        res.json({success:false,message:`Error In Getting Organizer Data End Point, ${error}`});
    }

}




const logOut = async (req,res)=>{
    try{

        res.clearCookie('JWT_Organizer',{
            httpOnly:true,
            secure:process.env.NODE_ENV === 'production',
            sameSite:process.env.NODE_ENV === 'development' ? 'strict' : 'none',
        })

        return res.json({success:true,message:`Organizer Logged Out Success Fully`});

    }catch(error){
        console.log(`Error In LogOut of Organizer End Point ${error}`);
        res.json({success:false,message:`Error In LogOut of Organizer End Point, ${error}`});
    }
}









const createTournament = async (req,res)=>{
    try{
        const organization = req.organizer;

        if(!organization){
            return res.json({success:false,message:"Session Ended Sign In Again Please" });
        }

        const organizer = await Organizer.findById(organization);

        if(!organizer){
            return res.json({success:false,message:"Organizer Not Found"});
        }


        const {tournamentName,tournamentType,sport,description,coverImage,startDate,endDate,location} = req.body;

        if(!tournamentName || !description || !coverImage || !startDate || !endDate || !location || !tournamentType || !sport){
            return res.json({success:false,message:"All Fields are Mandatory"});
        }

        const image = await cloudinary.uploader.upload(coverImage);

         const uploadURL = image.secure_url;


     const defaultSettings = {
      url: null,
      otp: '983620',
      seedingOptionInFixtures: false,
      askEmailFromPlayer: true,
      askMobileFromPlayer: true,
      askAdditionalInfo: true,
      showFixtures: true,
      customFields: [
        {
          fieldName: "Name",
          hintText: "",
          isMandatory: true,
          displayInFixture: false
        },
        {
          fieldName: "Email",
          hintText: "",
          isMandatory: true,
          displayInFixture: false
        },
        {
          fieldName: "Phone",
          hintText: "",
          isMandatory: true,
          displayInFixture: false
        },
        {
          fieldName: "T-Shirt",
          hintText: "T-Shirt Size",
          isMandatory: false,
          displayInFixture: false
        },
        {
          fieldName: "Academy Name",
          hintText: "Enter your Academy Name",
          isMandatory: false,
          displayInFixture: false
        }
      ]
    };

        const tournament = await Tournament.create({
            name:tournamentName,
            type:tournamentType,
            sport,
            description,
            coverImage:uploadURL,
            startDate,
            endDate,
            location,
            organization,
            settings: defaultSettings,
        })

        // console.log(tournament);

         await Organizer.findByIdAndUpdate(organization,
                {
                    $push:{
                        tournament:tournament._id,
                    }
                }
            )


        return res.json({success:true,message:"Tournament Created SuccessFully"});

    }catch(error){
        console.log(`Error In Creating Tournament in Organizer Controller ${error}`);
        return res.json({success:false,message:"Error In Creating Tournament in Organizer Controller"});
    }
}

const getAllTournaments = async (req,res)=>{
    try{
        const organization = req.organizer;

        if(!organization){
            return res.json({success:false,message:"Session Ended Sign In Again Please" });
        }

        const organizer = await Organizer.findById(organization);

        if(!organizer){
            return res.json({success:false,message:"Organizer Not Found"});
        }

        const tournaments = await Tournament.find({organization});

        return res.json({success:true,message:tournaments});

    }catch(error){
        return res.json({success:false,message:"Error In Creating Tournament in Organizer Controller"});
    }
}

const getParticularTournament = async (req,res)=>{
    try{
        const organization = req.organizer;

        if(!organization){
            return res.json({success:false,message:"Session Ended Sign In Again Please" });
        }

        const organizer = await Organizer.findById(organization);

        if(!organizer){
            return res.json({success:false,message:"Organizer Not Found"});
        }

        const { id } = req.params;
        // console.log(id);

        const tournament = await Tournament.findById(id); // Pass the Tournament Id in parameter in Route

        if(!tournament){
            return res.json({success:false,message:"Tournament Not Found"});
        }

        // const tournamentDetails = await Tournament.findById(req.params.tournamentId).populate('events').populate('teams');
        return res.json({success:true,message:tournament});
    }catch(error){
        console.log(`Error In Getting Particular Tournament ${error}`);
        return res.json({success:false,message:"Error In Getting Particular Tournament"});
    }

}


const createNewEvent = async (req,res)=>{
    try{
        const organization = req.organizer;

        if(!organization){
            return res.json({success:false,message:"Session Ended Sign In Again Please" });
        }

        const organizer = await Organizer.findById(organization);

        if(!organizer){
            return res.json({success:false,message:"Organizer Not Found"});
        }

        const { id } = req.params;
        // console.log(id);

        const tournament = await Tournament.findById(id); // Pass the Tournament Id in parameter in Route

        if(!tournament){
            return res.json({success:false,message:"Tournament Not Found"});
        }


        const { allowBooking, eventName, eventType, eventType2, matchType, maxTeams, teamEntryFee } = req.body;

        if( !eventName || !eventType || !matchType || !maxTeams || !teamEntryFee || !eventType2){
            return res.json({success:false,message:"All Fields are mandatory to Fill"})
        }
        
        const newEvent = await Events.create({
            name:eventName,
            tournament:id,
            eventType,
            eventType2,
            matchType,
            maxTeams,
            entryFee:teamEntryFee,
            allowBooking,
            // numberOfParticipants
        })

        tournament.events.push(newEvent._id);
        await tournament.save();

        organizer.events.push(newEvent._id);
        await organizer.save();


        return res.json({success:true,message:'New Event Created SuccessFully'});

    }catch(error){
        console.log(`Error In Creating New Event ${error}`);
        return res.json({success:false,message:"Error In Creating New Event"});
    }
}


const getAllEvents = async (req,res)=>{
     try{
        const organization = req.organizer;

        if(!organization){
            return res.json({success:false,message:"Session Ended Sign In Again Please" });
        }

        const organizer = await Organizer.findById(organization);

        if(!organizer){
            return res.json({success:false,message:"Organizer Not Found"});
        }

        const { TournamentId } = req.params;
        // console.log(id);

        const tournament = await Tournament.findById(TournamentId); // Pass the Tournament Id in parameter in Route

        if(!tournament){
            return res.json({success:false,message:"Tournament Not Found"});
        }

        

        const allEvents = await Events.find({
            tournament:TournamentId
        });



        return res.json({success:true,message:allEvents});

    }catch(error){
        console.log(`Error In Gettinga All Event ${error}`);
        return res.json({success:false,message:"Error In Gettinga All Event"});
    }
}




const createIndividual = async(req,res)=>{
    try{
        const organization = req.organizer;

        if(!organization){
            return res.json({success:false,message:"Session Ended Sign In Again Please" });
        }

        const organizer = await Organizer.findById(organization);

        if(!organizer){
            return res.json({success:false,message:"Organizer Not Found"});
        }

        const { TournamentId, eventId } = req.params;

        if(!TournamentId || !eventId){
            return res.json({success:false,message:`Tournament and Event Id's are mandatory for Creating Players `});
        }

        const tournament = await Tournament.findById(TournamentId);
        const event = await Events.findById(eventId);

        if(!tournament || !event){
            return res.json({success:false,message:`Tournament (Event) Not Found`});
        }

        // console.log(req.body);

        const { name, email, mobile, academyName, feesPaid,  } = req.body;

        if(!name || !email || !mobile || !academyName ){
            return res.json({success:false,message:`All Fields are mandatory to Fill`});
        }

        const check = await PlayerModel.findOne({email});
        if(!check){
            return res.json({success:false,message:`${email} is Not Registered in Tourney24`});
        }

        const newIndividual = await TeamIndividual.create({
            name,
            email,
            mobile,
            academyName,
            feesPaid,
            tournamentId:TournamentId,
            event:event.name,
            eventId,
            player:check._id,
            dateAndTime: new Date().toISOString(),
        })

        tournament.participantsIndividual.push(newIndividual._id);
        await tournament.save();

        organizer.participantsIndividual.push(newIndividual._id);
        await organizer.save();

        event.participantsIndividual.push(newIndividual._id);
        await event.save();

        return res.json({success:true,message:'Individual Team Registered SuccessFully'});

    }catch(error){
        console.log('Error in Creating Indiviudal group ',error);
        return res.json({success:false,message:'Error in Creating Player (Individual)'});
    }
}



const createGroupTeam = async(req,res)=>{
    try{
        const organization = req.organizer;

        if(!organization){
            return res.json({success:false,message:"Session Ended Sign In Again Please" });
        }

        const organizer = await Organizer.findById(organization);

        if(!organizer){
            return res.json({success:false,message:"Organizer Not Found"});
        }

        const { TournamentId, eventId } = req.params;

        if(!TournamentId || !eventId){
            return res.json({success:false,message:`Tournament and Event Id's are mandatory for Creating Players `});
        }

        const tournament = await Tournament.findById(TournamentId);
        const event = await Events.findById(eventId);

        if(!tournament || !event){
            return res.json({success:false,message:`Tournament (Event) Not Found`});
        }

        // console.log(req.body);

        const { teamName, members } = req.body;
        
        if(!teamName || !members){
            return res.json({success:false,message:`All Fields are mandatory`});
        }
        let FinalMembers = [];
        // members.forEach(async (member)=>{
        //     const { name, email, mobile, academyName, feesPaid } = member;
        //     if(!name || !email || !mobile || !academyName){
        //         return res.json({success:false,message:`All Fields are mandatory to Fill`});
        //     }
        //     const check = await PlayerModel.findOne({email});
        //     if(!check){
        //         return res.json({success:false,message:`${email} is Not Registered in Tourney24`});
        //     }
        //     const memberDetails = {
        //         player:check._id,
        //         name,
        //         email,
        //         mobile,
        //         academyName,
        //         feesPaid,
        //     }
        //     FinalMembers.push(memberDetails);
        // })


        for (const member of members) {
            const { name, email, mobile, academyName, feesPaid } = member;

            if (!name || !email || !mobile || !academyName) {
                return res.json({success:false,message:`All Fields are mandatory to Fill`});
            }

            const check = await PlayerModel.findOne({email});
            if (!check) {
                return res.json({success:false,message:`${email} is Not Registered in Tourney24`});
            }

            FinalMembers.push({
                player: check._id,
                name,
                email,
                mobile,
                academyName,
                feesPaid,
            });
        }


        if (FinalMembers.length === 0) {
            return res.json({ success: false, message: "No valid Registered players (In Tourney 24) found in the team" });
        }




        const newTeam = await TeamGroup.create({
            teamName,
            members:FinalMembers,
            entry:'offline',
            event:event.name,
            eventId,
            tournamentId:TournamentId,
            dateAndTime: new Date().toISOString(), 
        })

        tournament.participantsGroup.push(newTeam._id);
        await tournament.save();

        organizer.participantsGroup.push(newTeam._id);
        await organizer.save();

        event.participantsGroup.push(newTeam._id);
        await event.save();


        return res.json({success:true,message:"New Team Created Successfully"});


    }catch(error){
        console.log('Error in Creating group Team ',error);
        return res.json({success:false,message:'Error in Creating Players (Group)'});
    }    
}



const getIndividualTeam = async(req,res)=>{
    try{
        const organization = req.organizer;

        if(!organization){
            return res.json({success:false,message:"Session Ended Sign In Again Please" });
        }

        const organizer = await Organizer.findById(organization);

        if(!organizer){
            return res.json({success:false,message:"Organizer Not Found"});
        }

        const { TournamentId, eventId } = req.params;

        if(!TournamentId || !eventId){
            return res.json({success:false,message:`Tournament and Event Id's are mandatory for Creating Players `});
        }

        const tournament = await Tournament.findById(TournamentId);
        const event = await Events.findById(eventId);

        if(!tournament || !event){
            return res.json({success:false,message:`Tournament (Event) Not Found`});
        }

        const teams = await TeamIndividual.find({
            tournamentId:TournamentId,
            eventId:eventId,
        })


        return res.json({success:true,message:teams});


    }catch(error){
        console.log('Error in Getting Individual Team ',error);
        return res.json({success:false,message:`Error in Getting Individual Team ${error}`});
    }     
}


const getGroupTeam = async (req,res)=>{
        try{
        const organization = req.organizer;

        if(!organization){
            return res.json({success:false,message:"Session Ended Sign In Again Please" });
        }

        const organizer = await Organizer.findById(organization);

        if(!organizer){
            return res.json({success:false,message:"Organizer Not Found"});
        }

        const { TournamentId, eventId } = req.params;

        if(!TournamentId || !eventId){
            return res.json({success:false,message:`Tournament and Event Id's are mandatory for Creating Players `});
        }

        const tournament = await Tournament.findById(TournamentId);
        const event = await Events.findById(eventId);

        if(!tournament || !event){
            return res.json({success:false,message:`Tournament (Event) Not Found`});
        }

        const teams = await TeamGroup.find({
            tournamentId:TournamentId,
            eventId:eventId,
        })


        return res.json({success:true,message:teams});


    }catch(error){
        console.log('Error in Getting Group Team ',error);
        return res.json({success:false,message:`Error in Getting Group Team ${error}`});
    } 
}



const getPaymentDetails = async (req,res)=>{

    try{

        const organization = req.organizer;

        if(!organization){
            return res.json({success:false,message:"Session Ended Sign In Again Please" });
        }

        const organizer = await Organizer.findById(organization);

        if(!organizer){
            return res.json({success:false,message:"Organizer Not Found"});
        }

        const { TournamentId  } = req.params;

        if(!TournamentId ){
            return res.json({success:false,message:`Tournament Id is mandatory for Getting Payment Details `});
        }

        const tournament = await Tournament.findById(TournamentId);

        if(!tournament){
            return res.json({success:false,message:`Tournament Not Found`});
        }

        
        const paymentsIndividual = await TeamIndividual.find({
            tournamentId:TournamentId,
        }).populate('eventId');
        
        const paymentsGroup = await TeamGroup.find({
            tournamentId:TournamentId,
        }).populate('eventId');

        return res.json({success:true,paymentsIndividual, paymentsGroup});


    }catch(error){
        console.log(`Error In Getting Payment Details ${error}`);
        return res.json({success:false,message:`Error In Getting Payment Details ${error}`});
    }

}





export { signUp,verifyEmailWithOTP,login,createTournament,getAllTournaments,getParticularTournament, checkOrganizerAuthorization, getCurrentOrganizer, logOut, createNewEvent, getAllEvents, createIndividual, createGroupTeam, getIndividualTeam, getGroupTeam, getPaymentDetails };