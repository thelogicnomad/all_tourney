import mongoose from 'mongoose';

const OrganizerSchema = new mongoose.Schema({
    fullName:{
        type:String,
        required:true,
    },
    organizationName:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        },
    password:{
        type:String,
        required:true,
    },
    phone:{
        type:String,
        required:true,
    },
    tournament:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'tournament',
    }],
    events:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'event',
    }],
    isAccountVerified:{
        type:Boolean,
        default:false,
    },
    verifyOtp:{
        type:String,
        default:"",
    },
    verifyOtpExpiredAt:{
        type:Number,
        default:0,
    },
    memberAccess:[ 
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'organizer', 
        }
    ],
    isVerifiedByAdmin:{
        type:Boolean,
        default:false,
    },
    participantsIndividual: [
      { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'teamIndividual'
     }
    ],
    participantsGroup: [
      { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'teamGroup'
      }
    ],
})
        
const Organizer = mongoose.model('organizer',OrganizerSchema);

export default Organizer;