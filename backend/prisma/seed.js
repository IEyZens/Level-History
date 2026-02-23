import bcrypt from "bcryptjs";
import prisma from "../src/lib/prisma.js";

async function main() {
  console.log("Cleaning up database...");

  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.event.deleteMany();
  await prisma.personality.deleteMany();
  await prisma.refreshToken.deleteMany();
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
          "The creator of Mario, Zelda, and Donkey Kong. Miyamoto redefined interactive entertainment by designing games around player emotion and intuitive mechanics. His philosophy of surprise and delight continues to influence game design worldwide.",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/6/69/Shigeru_Miyamoto_2019_Oct.jpg",
        category: "VISIONARY",
        twitter: "https://twitter.com/nintendo",
        linkedin: null,
        website: null,
      },
      {
        name: "Ken Kutaragi",
        role: "Father of the PlayStation",
        biography:
          "Visionary engineer who pushed Sony to enter the video game market with 3D technology. Kutaragi developed the PlayStation from a failed Nintendo partnership into one of the best-selling consoles in history, transforming Sony into a gaming giant.",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Ken_Kutaragi_at_the_Game_Developers_Conference_2005_-_2.jpg/800px-Ken_Kutaragi_at_the_Game_Developers_Conference_2005_-_2.jpg",
        category: "BUILDER",
        twitter: null,
        linkedin: "https://www.linkedin.com/in/ken-kutaragi",
        website: null,
      },
      {
        name: "Hiroshi Yamauchi",
        role: "President of Nintendo (1949-2002)",
        biography:
          "He transformed a small playing card company into a global video game giant. Under his leadership, Nintendo released the NES, Game Boy, SNES, and N64, cementing its place as one of the most influential companies in entertainment history.",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Hiroshi_Yamauchi_1955.jpg/640px-Hiroshi_Yamauchi_1955.jpg",
        category: "EXECUTIVE",
        twitter: null,
        linkedin: null,
        website: null,
      },
    ],
  });

  console.log("Creating Events...");

  const eventPong = await prisma.event.create({
    data: {
      title: "Pong — The First Commercial Arcade Game",
      description:
        "Atari releases Pong, the first commercially successful arcade video game. Its simple tennis simulation captivates the public and marks the true beginning of the video game industry as a commercial force.",
      date: new Date("1972-11-29"),
      category: "GAME_RELEASE",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Pong.png/240px-Pong.png",
      authorId: admin.id,
    },
  });

  const eventAtari = await prisma.event.create({
    data: {
      title: "Launch of the Atari 2600",
      description:
        "Atari releases the 2600, the first widely successful home console using interchangeable cartridges. It brings arcade experiences into living rooms and defines the home gaming market for years to come.",
      date: new Date("1977-09-11"),
      category: "CONSOLE_RELEASE",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Atari-2600-Wood-4Sw-Set.jpg/800px-Atari-2600-Wood-4Sw-Set.jpg",
      authorId: admin.id,
    },
  });

  const eventMario = await prisma.event.create({
    data: {
      title: "Release of Super Mario Bros.",
      description:
        "Nintendo releases Super Mario Bros. for the Famicom and NES. The game saves the industry from the 1983 crash, popularizes side-scrolling platformers, and establishes Mario as the most recognizable character in gaming history.",
      date: new Date("1985-09-13"),
      category: "GAME_RELEASE",
      image:
        "https://upload.wikimedia.org/wikipedia/en/0/03/Super_Mario_Bros._box.png",
      authorId: admin.id,
    },
  });

  const eventGameBoy = await prisma.event.create({
    data: {
      title: "Nintendo Game Boy Launch",
      description:
        "Nintendo launches the Game Boy, a handheld console that dominates portable gaming for over a decade. Bundled with Tetris, it sells over 118 million units worldwide and defines what handheld gaming means.",
      date: new Date("1989-04-21"),
      category: "CONSOLE_RELEASE",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Game-Boy-FL.jpg/220px-Game-Boy-FL.jpg",
      authorId: admin.id,
    },
  });

  const eventPS1 = await prisma.event.create({
    data: {
      title: "Launch of the PlayStation",
      description:
        "Sony revolutionizes the market with CD-ROMs and consumer 3D graphics. The PlayStation becomes a cultural phenomenon, attracting older audiences and third-party developers, and permanently reshaping the competitive landscape of the industry.",
      date: new Date("1994-12-03"),
      category: "CONSOLE_RELEASE",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/PlayStation-Composite-1.jpg/800px-PlayStation-Composite-1.jpg",
      authorId: admin.id,
    },
  });

  const eventPokemon = await prisma.event.create({
    data: {
      title: "Pokémon Red & Blue Released",
      description:
        "Nintendo and Game Freak release Pokémon Red and Blue in North America, igniting a global cultural phenomenon. The franchise goes on to become the highest-grossing media franchise of all time, spanning games, anime, cards and merchandise.",
      date: new Date("1998-09-28"),
      category: "GAME_RELEASE",
      image:
        "https://upload.wikimedia.org/wikipedia/en/a/af/Pokemon_Red_EN_boxart.jpg",
      authorId: admin.id,
    },
  });

  const eventXbox = await prisma.event.create({
    data: {
      title: "Microsoft Enters the Console Market with Xbox",
      description:
        "Microsoft launches the original Xbox, introducing a built-in hard drive, broadband internet support, and Xbox Live online gaming. It marks the beginning of a new competitive era and establishes Microsoft as a major player in the console wars.",
      date: new Date("2001-11-15"),
      category: "CONSOLE_RELEASE",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Xbox-console.jpg/800px-Xbox-console.jpg",
      authorId: admin.id,
    },
  });

  const eventWii = await prisma.event.create({
    data: {
      title: "Nintendo Wii — Motion Controls Change Everything",
      description:
        "Nintendo launches the Wii with its revolutionary motion-sensing controllers. The console attracts entirely new demographics — families, seniors, and casual players — and becomes one of Nintendo's best-selling systems of all time.",
      date: new Date("2006-11-19"),
      category: "CONSOLE_RELEASE",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Wii-console.jpg/800px-Wii-console.jpg",
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

  await prisma.comment.create({
    data: {
      content:
        "Pong seems so simple today but it was absolutely mind-blowing at the time.",
      authorId: user.id,
      eventId: eventPong.id,
    },
  });

  await prisma.comment.create({
    data: {
      content:
        "The PlayStation changed everything. CD-ROMs opened up storytelling in ways cartridges never could.",
      authorId: user.id,
      eventId: eventPS1.id,
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
      userId: user.id,
      eventId: eventMario.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: admin.id,
      eventId: eventWii.id,
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
