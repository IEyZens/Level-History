import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient({
  log: ["info"],
});

async function main() {
  console.log("Start seeding...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@levelhistory.com" },
    update: {},
    create: {
      username: "admin",
      email: "admin@levelhistory.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log(`Admin created: ${admin.username}`);

  const eventsData = [
    {
      title: "Pong Released",
      description:
        "One of the earliest arcade video games and the first commercially successful video game.",
      date: new Date("1972-11-29"),
      authorId: admin.id,
    },
    {
      title: "NES Released in Japan",
      description:
        "Nintendo releases the Family Computer (Famicom) in Japan, revitalizing the video game industry.",
      date: new Date("1983-07-15"),
      authorId: admin.id,
    },
    {
      title: "Super Mario 64",
      description:
        "Nintendo releases Super Mario 64, revolutionizing 3D platforming design.",
      date: new Date("1996-06-23"),
      authorId: admin.id,
    },
    {
      title: "The Legend of Zelda: Ocarina of Time",
      description:
        "Widely considered one of the greatest video games of all time, introducing the Z-targeting system.",
      date: new Date("1998-11-21"),
      authorId: admin.id,
    },
  ];

  for (const event of eventsData) {
    const createdEvent = await prisma.event.create({
      data: event,
    });
    console.log(`Event created: ${createdEvent.title}`);
  }

  console.log("Seeding finished");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
