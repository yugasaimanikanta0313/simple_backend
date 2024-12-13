const Customer = require("../models/Customer")
const Admin = require("../models/Admin")
const Manager = require("../models/Manager")
const Event = require("../models/Event")

const multer = require('multer')
const path = require('path')
const fs = require('fs')

const cloudinary = require('../cloudinaryConfig');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'events', // Cloudinary folder name
    resource_type: 'auto',
  },
});
const upload = multer({ storage }).single('file');

const viewcustomers = async (request, response) => 
 {
    try 
    {
      const customers = await Customer.find();
      if(customers.length==0)
      {
        response.send("DATA NOT FOUND");
      }
      else
      {
        response.json(customers);
      }
    } 
    catch (error) 
    {
      response.status(500).send(error.message);
    }
  };


  const deletecustomer = async (request, response) => 
 {
    try 
    {
      const email = request.params.email
      const customer = await Customer.findOne({"email":email})
      if(customer!=null)
      {
        await Customer.deleteOne({"email":email})
        response.send("Deleted Successfully")
      }
      else
      {
        response.send("Email ID Not Found")
      }

    } 
    catch (error) 
    {
      response.status(500).send(error.message);
    }
  };

  const checkadminlogin = async (request, response) => 
  {
     try 
     {
       const input = request.body
       console.log(input)
       const admin = await Admin.findOne(input)
       response.json(admin)
     } 
     catch (error) 
     {
       response.status(500).send(error.message);
     }
   };

   const addmanager = async (request, response) => {
    try 
    {
      const input = request.body;
      const manager = new Manager(input);
      await manager.save();
      response.send('Added Successfully');
    } 
    catch(e) 
    {
      response.status(500).send(e.message);
    }
  };

  const viewmanagers = async (request, response) => 
  {
     try 
     {
       const managers = await Manager.find();
       if(managers.length==0)
       {
         response.send("DATA NOT FOUND");
       }
       else
       {
         response.json(managers);
       }
     } 
     catch (error) 
     {
       response.status(500).send(error.message);
     }
   };

   const deletemanager = async (request, response) => 
 {
    try 
    {
      const uname = request.params.username
      const manager = await Manager.findOne({"username":uname})
      if(manager!=null)
      {
        await Manager.deleteOne({"username":uname})
        response.send("Deleted Successfully")
      }
      else
      {
        response.send("Username Not Found")
      }

    } 
    catch (error) 
    {
      response.status(500).send(error.message);
    }
  };

  // const storage = multer.diskStorage({
  //   destination: function (req, file, cb) {
  //     cb(null, './media/'); // Destination folder
  //   },
  //   filename: function (req, file, cb) {
  //     cb(null, file.originalname); // File naming convention
  //   }
  // });

  // const upload = multer({ storage: storage }).single('file');

  // const createevent = async (req, res) =>
  // {
  //   try 
  //   {
  //     upload(req, res, async function (err) 
  //     {
  //       if (err) 
  //       {
  //         console.error(err);
  //         return res.status(500).send(err.message);
  //       }
        
  //       const { category, title,singer,description, date, location } = req.body;
  //       const fileName = req.file ? req.file.filename: undefined; // Add .mp3 extension
  
  //       if (fileName && req.file.mimetype !== 'audio/mpeg') {
  //         return res.status(400).send('Invalid file type. Please upload an mp3 file.');
  //       }
  
  //       const newEvent = new Event({
  //         category,
  //         title,
  //         singer,
  //         file: fileName // Save only the file name with .mp3 extension
  //       });
  
  //       await newEvent.save();
  //       res.status(200).send('Event Created Successfully');
  //     });
  //   } 
  //   catch (error) 
  //   {
  //     console.error(error);
  //     res.status(500).send(error.message);
  //   }
  // };

  // const eventaudio = async (req, res) => {
  //   const filename = req.params.filename;
  //   const filepath = path.join(__dirname, '../media', filename);
  
  //   fs.readFile(filepath, (err, data) => {
  //     if (err) {
  //       console.error(err);
  //       if (err.code === 'ENOENT') {
  //         return res.status(404).send('Audio file not found');
  //       } else {
  //         return res.status(500).send('Error reading audio file');
  //       }
  //     }
  
  //     const ext = path.extname(filename).toLowerCase();
  //     let contentType = 'audio/mpeg'; // Set content type to audio/mpeg for mp3 files
  
  //     if (ext === '.mp3') {
  //       contentType = 'audio/mpeg';
  //     } else if (ext === '.wav') {
  //       contentType = 'audio/wav';
  //     } else if (ext === '.ogg') {
  //       contentType = 'audio/ogg';
  //     } else if (ext === '.m4a') {
  //       contentType = 'audio/mp4';
  //     } else {
  //       return res.status(400).send('Invalid audio file format');
  //     }
  
  //     res.setHeader('Content-Type', contentType);
  //     res.send(data);
  //   });
  // };

  const createevent = async (req, res) => {
    try {
      upload(req, res, async function (err) {
        if (err) {
          console.error('File upload error:', err);
          return res.status(500).send(err.message);
        }
  
        const { category, title, singer, description, date, location } = req.body;
        const fileUrl = req.file ? req.file.path : undefined;
  
        if (!fileUrl) {
          console.error('File upload failed: No file URL');
          return res.status(400).send('File upload failed');
        }
  
        const newEvent = new Event({
          category,
          title,
          singer,
          description,
          date,
          location,
          file: fileUrl,
        });
  
        await newEvent.save();
        res.status(200).send('Event Created Successfully');
      });
    } catch (error) {
      console.error('Error in createevent:', error);
      res.status(500).send(error.message);
    }
  };
  
  const eventaudio = async (req, res) => {
    try {
      const filename = req.params.filename;
      console.log('Fetching audio file:', filename);
      const event = await Event.findOne({ file: filename });
      
      if (!event) {
        console.error('Event not found for file:', filename);
        return res.status(404).send('Audio file not found');
      }
  
      res.redirect(event.file);
    } catch (error) {
      console.error('Error in eventaudio:', error);
      res.status(500).send(error.message);
    }
  };
  
  

const viewevents = async (req, res) => 
{
  try 
  {
    const events = await Event.find();
    res.status(200).json(events);
  } 
  catch (error) 
  {
    res.status(500).send(error.message);
  }
};
module.exports = {viewcustomers,viewevents,deletecustomer,checkadminlogin,addmanager,viewmanagers,deletemanager,createevent,eventaudio}