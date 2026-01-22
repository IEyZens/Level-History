import bcrypt from "bcryptjs";
import prisma from "../src/lib/prisma.js";

async function main() {
  console.log("Cleaning up database...");

  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.event.deleteMany();
  await prisma.personality.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creating Users...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      username: "AdminUser",
      email: "admin@levelhistory.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  const user = await prisma.user.create({
    data: {
      username: "RetroGamer99",
      email: "gamer@levelhistory.com",
      password: hashedPassword,
      role: "USER",
    },
  });

  console.log("Creating Personalities...");

  await prisma.personality.createMany({
    data: [
      {
        name: "Shigeru Miyamoto",
        role: "Creative Fellow at Nintendo",
        biography:
          "The creator of Mario, Zelda, and Donkey Kong. He defined the grammar of modern video gaming.",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/6/69/Shigeru_Miyamoto_2019_Oct.jpg",
        category: "VISIONARY",
      },
      {
        name: "Ken Kutaragi",
        role: "Father of the PlayStation",
        biography:
          "Visionary engineer who pushed Sony to enter the video game market with 3D technology.",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Ken_Kutaragi_at_the_Game_Developers_Conference_2005_-_2.jpg/800px-Ken_Kutaragi_at_the_Game_Developers_Conference_2005_-_2.jpg",
        category: "BUILDER",
      },
      {
        name: "Hiroshi Yamauchi",
        role: "President of Nintendo (1949-2002)",
        biography:
          "He transformed a small playing card company into a global video game giant.",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Hiroshi_Yamauchi_1955.jpg/640px-Hiroshi_Yamauchi_1955.jpg",
        category: "EXECUTIVE",
      },
    ],
  });

  console.log("Creating Events...");

  const eventMario = await prisma.event.create({
    data: {
      title: "Release of Super Mario Bros.",
      description:
        "The game that saved the industry from the 1983 crash and popularized side-scrolling.",
      date: new Date("1985-09-13"),
      authorId: admin.id,
    },
  });

  const eventPS1 = await prisma.event.create({
    data: {
      title: "Launch of the PlayStation",
      description:
        "Sony revolutionizes the market with CD-ROMs and consumer 3D.",
      date: new Date("1994-12-03"),
      authorId: admin.id,
    },
  });

  console.log("Creating Comments & Likes...");

  const comment1 = await prisma.comment.create({
    data: {
      content: "This is the first game I ever played, a legend!",
      authorId: user.id,
      eventId: eventMario.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: "Thanks for sharing! The level design of 1-1 is a masterpiece.",
      authorId: admin.id,
      eventId: eventMario.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: user.id,
      eventId: eventPS1.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: admin.id,
      commentId: comment1.id,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((error) => {
    console.error("Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
