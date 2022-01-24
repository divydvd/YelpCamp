const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors}= require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, 'Connection Error:'));
db.once("open", () => {
    console.log("Database Connected!");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 15;
        const camp = new Campground({
            author: '61e8496c3c7c2791463ead3e', 
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                  url: 'https://res.cloudinary.com/dvrq4m65o/image/upload/v1642956398/YelpCamp/t2tkmd4j8elrtbyd7stc.jpg',
                  filename: 'YelpCamp/t2tkmd4j8elrtbyd7stc',
                },
                {
                  url: 'https://res.cloudinary.com/dvrq4m65o/image/upload/v1642956398/YelpCamp/rjhuxcbcylbhunb9hxkb.webp',
                  filename: 'YelpCamp/rjhuxcbcylbhunb9hxkb',
                }
            ],
            price,
            description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Error, sit. Quia aliquam voluptatibus voluptatum rerum, tempora minima? Inventore impedit dolorum similique optio distinctio nam, praesentium delectus quisquam fugiat blanditiis nesciunt?'
        });
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});