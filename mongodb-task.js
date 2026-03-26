
//--MONGODB TASK--\\


use("zen_class_programme");


// INSERT DOCUMENTS

// --- users ---
db.users.insertMany([
  { name: "Thirupathi", email: "thirupathi@gmail.com", mentor_id: "m001" },
  { name: "Zaid",       email: "zaid@gmail.com",       mentor_id: "m001" },
  { name: "Charlie",    email: "charlie@gmail.com",    mentor_id: "m002" },
  { name: "Diana",      email: "diana@gmail.com",      mentor_id: "m002" }
]);

// --- codekata ---
db.codekata.insertMany([
  { user_id: "Thirupathi", problems_solved: 120 },
  { user_id: "Zaid",       problems_solved: 85  },
  { user_id: "Charlie",    problems_solved: 200 },
  { user_id: "Diana",      problems_solved: 45  }
]);

// --- attendance ---
db.attendance.insertMany([
  { user_name: "Thirupathi", date: new Date("2020-10-16"), present: true  },
  { user_name: "Zaid",       date: new Date("2020-10-16"), present: false },
  { user_name: "Charlie",    date: new Date("2020-10-20"), present: true  },
  { user_name: "Diana",      date: new Date("2020-10-20"), present: false },
  { user_name: "Thirupathi", date: new Date("2020-10-25"), present: false },
  { user_name: "Zaid",       date: new Date("2020-10-25"), present: false }
]);

// --- topics ---
db.topics.insertMany([
  { title: "HTML Basics",       date: new Date("2020-10-05") },
  { title: "CSS Flexbox",       date: new Date("2020-10-12") },
  { title: "JavaScript Basics", date: new Date("2020-10-20") },
  { title: "Node.js Intro",     date: new Date("2020-11-03") }
]);

// --- tasks ---
db.tasks.insertMany([
  { title: "HTML Page Task", date: new Date("2020-10-06"), submitted_by: ["Thirupathi", "Charlie"] },
  { title: "Flexbox Layout", date: new Date("2020-10-14"), submitted_by: ["Thirupathi"] },
  { title: "JS Calculator",  date: new Date("2020-10-22"), submitted_by: ["Charlie"] },
  { title: "Node REST API",  date: new Date("2020-11-10"), submitted_by: ["Thirupathi", "Zaid"] }
]);

// --- company_drives ---
db.company_drives.insertMany([
  { company: "Google",    date: new Date("2020-10-15"), appeared: ["Thirupathi", "Charlie"] },
  { company: "Amazon",    date: new Date("2020-10-20"), appeared: ["Zaid", "Diana"] },
  { company: "Zoho",      date: new Date("2020-10-31"), appeared: ["Thirupathi"] },
  { company: "Microsoft", date: new Date("2020-11-05"), appeared: ["Charlie"] }
]);

// --- mentors ---
db.mentors.insertMany([
  { name: "Thirupathi", mentees: ["s1","s2","s3","s4","s5","s6","s7","s8","s9","s10","s11","s12","s13","s14","s15","s16"] },
  { name: "Zaid",       mentees: ["s1","s2","s3","s4","s5","s6","s7","s8"] }
]);

// =====================================================
// QUERIES
// =====================================================

// Q1: Find all topics and tasks taught in October 2020
db.topics.find({
  date: { $gte: new Date("2020-10-01"), $lt: new Date("2020-11-01") }
}).toArray();

db.tasks.find({
  date: { $gte: new Date("2020-10-01"), $lt: new Date("2020-11-01") }
}).toArray();

// Q2: Find all company drives between 15-Oct-2020 and 31-Oct-2020
db.company_drives.find({
  date: { $gte: new Date("2020-10-15"), $lte: new Date("2020-10-31") }
}).toArray();

// Q3: Find all company drives and students who appeared
db.company_drives.aggregate([
  {
    $project: {
      company: 1,
      date: 1,
      appeared_students: "$appeared"
    }
  }
]).toArray();

// Q4: Find number of problems solved by each user in codekata
db.codekata.find(
  {},
  { user_id: 1, problems_solved: 1 }
).toArray();

// Q5: Find all mentors with mentee count more than 15
db.mentors.aggregate([
  {
    $project: {
      name: 1,
      mentee_count: { $size: "$mentees" }
    }
  },
  {
    $match: { mentee_count: { $gt: 15 } }
  }
]).toArray();

// Q6: Find users absent and task not submitted between 15-Oct-2020 and 31-Oct-2020
db.attendance.aggregate([
  {
    $match: {
      present: false,
      date: { $gte: new Date("2020-10-15"), $lte: new Date("2020-10-31") }
    }
  },
  {
    $lookup: {
      from: "tasks",
      let:  { uname: "$user_name" },
      pipeline: [
        {
          $match: {
            $expr: { $not: { $in: ["$$uname", "$submitted_by"] } },
            date: { $gte: new Date("2020-10-15"), $lte: new Date("2020-10-31") }
          }
        }
      ],
      as: "unsubmitted_tasks"
    }
  },
  { $match: { unsubmitted_tasks: { $ne: [] } } },
  {
    $project: {
      user_name: 1,
      date: 1,
      unsubmitted_tasks: "$unsubmitted_tasks.title"
    }
  }
]).toArray();
