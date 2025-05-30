require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const {connectDB} = require('./config.js')
const Contact = require('./models/Contact')

const app = express();

app.use(cors())
app.use(bodyParser.json())

connectDB()

app.post('/identify',async (req,res)=>{
    try{
        const {email,phoneNumber} = req.body;
        //check inputs and reject null entries
        if(!email && !phoneNumber){
            return res.status(400).json({error : 'Either email or phone number must be provided'});
        }

        //search by email or phonenumber , sort them in ascending order
        const matchingContacts = await Contact.find({
            $or : [
                {email : email},
                {phoneNumber : phoneNumber}
            ],  
            deletedAt : null
        }).sort({createdAt : 1})


        //if no matching contacts , create a new user else return the contact info
        if(matchingContacts.length===0){
            const newContact = new Contact({
                email,
                phoneNumber,
                linkPrecedence : 'primary'
            });
            await newContact.save()

            return res.status(200).json({
                contact : {
                    primaryContactId : newContact._id,
                    emails : [newContact.email].filter(e=>e),
                    phoneNumbers : [newContact.phoneNumber].filter(p=>p),
                    secondaryContactIds : []
                }
            })
        }

        //find the primary if not found make the oldest entry -> primary
        let primaryContact = matchingContacts.find(c=>c.linkPrecedence==='primary');
        if(!primaryContact){
            primaryContact = matchingContacts[0]
        }

        const otherPrimaries = matchingContacts.filter(
            c => c.linkPrecedence === 'primary' && !c._id.equals(primaryContact._id)
        );

        //if mulitple entries , make them secondary and link them to primary
        if(otherPrimaries.length > 0){
            for (const primary of otherPrimaries){
                primary.linkPrecedence = 'secondary';
                primary.linkedId = primaryContact._id;
                primary.updatedAt = new Date();
                await primary.save();
            }
        }

        //check if new secondary is needed
        const hasnewInfo = (
            (email && !matchingContacts.some(c => c.email === email)) ||
            (phoneNumber && !matchingContacts.some(c => c.phoneNumber === phoneNumber))
        )

        if(hasnewInfo){
            const newSecondary = new Contact({
                email,
                phoneNumber,
                linkedId : primaryContact._id,
                linkPrecedence : 'secondary'
            });
            await newSecondary.save()
            matchingContacts.push(newSecondary)
        }

        const secondaryContacts = await Contact.find({
            linkedId : primaryContact._id,
            deletedAt:null
        });

        //prepare response
        const allContacts = [primaryContact,...secondaryContacts]
        const uniqueEmails = [...new Set(allContacts.map(c=>c.email).filter(e=>e))];
        const uniquePhones = [...new Set(allContacts.map(c=>c.phoneNumber).filter(p=>p))]
        const secondaryIds = secondaryContacts.map(c=>c._id)

        res.status(200).json({
            contact : {
                primaryContact:primaryContact._id,
                emails : uniqueEmails,
                phoneNumbers : uniquePhones,
                secondaryContactIds: secondaryIds
            }
        });
    }
    catch(err){
        console.error(err)
        res.status(500).json({error:"Server error"})
    }
})

const port = 5000;
app.listen(port,()=>{
    console.log(`Live at ${port}`)
})