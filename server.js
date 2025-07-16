require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const connectDB = require('./config.js')
connectDB();

const Contact = require('./models/Contact')

const app = express();
app.use(cors())
app.use(bodyParser.json())

app.post('/identify', async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
      return res.status(400).json({ error: 'Either email or phone number must be provided' });
    }

    const matchingContacts = await Contact.find({
      $or: [{ email: email }, { phoneNumber: phoneNumber }],
      deletedAt: null
    }).sort({ createdAt: 1 });

    if (matchingContacts.length === 0) {
      const newContact = new Contact({
        email,
        phoneNumber,
        linkPrecedence: 'primary'
      });
      await newContact.save();

      return res.status(200).json({
        contact: {
          primaryContactId: newContact._id,
          emails: [newContact.email].filter(e => e),
          phoneNumbers: [newContact.phoneNumber].filter(p => p),
          secondaryContactIds: []
        }
      });
    }

    let primaryContact = matchingContacts.find(c => c.linkPrecedence === 'primary');
    if (!primaryContact) {
      primaryContact = matchingContacts[0];
    }

    const otherPrimaries = matchingContacts.filter(
      c => c.linkPrecedence === 'primary' && !c._id.equals(primaryContact._id)
    );

    if (otherPrimaries.length > 0) {
      for (const primary of otherPrimaries) {
        primary.linkPrecedence = 'secondary';
        primary.linkedId = primaryContact._id;
        primary.updatedAt = new Date();
        await primary.save();
      }
    }

    const hasnewInfo =
      (email && !matchingContacts.some(c => c.email === email)) ||
      (phoneNumber && !matchingContacts.some(c => c.phoneNumber === phoneNumber));

    if (hasnewInfo) {
      const newSecondary = new Contact({
        email,
        phoneNumber,
        linkedId: primaryContact._id,
        linkPrecedence: 'secondary'
      });
      await newSecondary.save();
      matchingContacts.push(newSecondary);
    }

    const secondaryContacts = await Contact.find({
      linkedId: primaryContact._id,
      deletedAt: null
    });

    const allContacts = [primaryContact, ...secondaryContacts];
    const uniqueEmails = [...new Set(allContacts.map(c => c.email).filter(e => e))];
    const uniquePhones = [...new Set(allContacts.map(c => c.phoneNumber).filter(p => p))];
    const secondaryIds = secondaryContacts.map(c => c._id);

    res.status(200).json({
      contact: {
        primaryContact: primaryContact._id,
        emails: uniqueEmails,
        phoneNumbers: uniquePhones,
        secondaryContactIds: secondaryIds
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = app;

if (require.main === module) {
  const port = 5000;
  app.listen(port, () => {
    console.log(`Live at ${port}`);
  });
}