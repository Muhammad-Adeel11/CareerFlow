/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const JobApplication = require('../models/JobApplication');
const Interview = require('../models/Interview');

async function seed() {
  await connectDB(process.env.MONGODB_URI);

  await Promise.all([User.deleteMany({}), JobApplication.deleteMany({}), Interview.deleteMany({})]);

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@careerflow.dev',
    password: 'Admin1234',
    role: 'ADMIN',
  });

  const user = await User.create({
    name: 'Jordan Lee',
    email: 'jordan@careerflow.dev',
    password: 'Password1',
    role: 'USER',
  });

  const companies = [
    ['Stripe', 'Frontend Engineer Intern', 'Applied'],
    ['Notion', 'Software Engineer Intern', 'Interview'],
    ['Figma', 'Product Design Intern', 'Offer'],
    ['Airbnb', 'Backend Engineer Intern', 'Rejected'],
    ['Vercel', 'Full Stack Intern', 'Applied'],
  ];

  const apps = await JobApplication.insertMany(
    companies.map(([company, position, status], i) => ({
      userId: user._id,
      company,
      position,
      location: 'Remote',
      jobType: 'Internship',
      status,
      applicationDate: new Date(Date.now() - i * 5 * 24 * 60 * 60 * 1000),
      salary: '$30/hr',
      jobUrl: 'https://example.com/careers',
      description: `${position} role at ${company}.`,
      notes: 'Follow up next week.',
    }))
  );

  await Interview.create({
    applicationId: apps[1]._id,
    userId: user._id,
    interviewDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    interviewType: 'Technical',
    interviewer: 'Alex (Eng Manager)',
    locationOrLink: 'https://meet.google.com/abc-defg-hij',
    status: 'Scheduled',
    notes: 'Focus on React and system design basics.',
  });

  console.log('Seed complete.');
  console.log(`Admin login: ${admin.email} / Admin1234`);
  console.log(`User login:  ${user.email} / Password1`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
