import prisma from "../src/lib/prisma.js";

async function main() {
  console.log("Cleaning up database...");
  await prisma.event.deleteMany({});

  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (!admin) {
    console.error(
      "Error: No admin user found. Please register an admin first.",
    );
    process.exit(1);
  }

  console.log("Seeding events...");
  await prisma.event.createMany({
    data: [
      {
        title: "Fall of the Berlin Wall",
        description: "The symbolic end of the Cold War and the Iron Curtain.",
        date: new Date("1989-11-09"),
        authorId: admin.id,
      },
      {
        title: "Storming of the Bastille",
        description: "A major event of the French Revolution.",
        date: new Date("1789-07-14"),
        authorId: admin.id,
      },
      {
        title: "First Moon Landing",
        description:
          "Neil Armstrong becomes the first human to step on the lunar surface.",
        date: new Date("1969-07-21"),
        authorId: admin.id,
      },
    ],
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
