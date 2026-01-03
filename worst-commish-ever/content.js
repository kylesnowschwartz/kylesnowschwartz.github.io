/**
 * Site Content - Edit this file to change text throughout the site
 * This is essentially a basic CMS for static content
 */

const CONTENT = {
  // === SITE METADATA ===
  site: {
    title: "WORST COMMISH EVER - Fantasy Football League Est. 2000",
    logoTitle: "WORST COMMISH EVER",
    tagline: '"Where Championships Are Made and Friendships Go to Die"',
    established: "Est. 2000 - Celebrating 25 Years of Questionable Decisions",
    visitorPrefix: "You are visitor #"
  },

  // === NAVIGATION ===
  nav: [
    { href: "#dream-teams", label: "Dream Teams" },
    { href: "#championship", label: "Championship Baseball" },
    { href: "#wall-of-shame", label: "Wall of Shame" },
    { href: "#history", label: "League History" },
    { href: "#rules", label: "League Rules" }
  ],

  // === MARQUEE ===
  marquee: "WELCOME TO THE WORST COMMISH EVER FANTASY FOOTBALL LEAGUE! 25 YEARS OF GLORY, HEARTBREAK, AND ABSOLUTELY TERRIBLE TRADES!",

  // === SECTIONS ===
  sections: {
    dreamTeams: {
      title: "DREAM TEAMS",
      subtitle: "The brave warriors who battle each Sunday"
    },

    championship: {
      title: "CHAMPIONSHIP BASEBALL",
      subtitle: "The Hall of Champions - Legends of the League",
      tableHeaders: ["Year", "Champion", "Team Name", "Record", ""]
    },

    wallOfShame: {
      title: "WALL OF SHAME",
      subtitle: "Where legends go to be forgotten (but we remember everything)"
    },

    history: {
      title: "LEAGUE HISTORY",
      subtitle: "25 Years of Fantasy Football Excellence (and Chaos)",
      timeline: [
        {
          year: "2000",
          event: "The league is founded by a group of friends who had no idea what they were getting into. First commissioner elected (or volunteered, nobody remembers)."
        },
        {
          year: "2005",
          event: "League survives its first major controversy. Details redacted to protect the guilty."
        },
        {
          year: "2010",
          event: 'The "Worst Commish Ever" name is officially adopted after a particularly controversial ruling.',
          milestone: true
        },
        {
          year: "2015",
          event: "League goes online. No more spreadsheets and phone calls. Arguments now happen in group chats instead."
        },
        {
          year: "2020",
          event: "20 years! The pandemic couldn't stop us. Virtual draft party happens via Zoom.",
          milestone: true
        },
        {
          year: "2025",
          event: "A quarter century of friendship, rivalry, and terrible fantasy advice.",
          milestone: true,
          rainbow: true,
          prefix: "25 YEARS!"
        }
      ],
      underConstruction: "League historians are compiling more stories..."
    },

    rules: {
      title: "LEAGUE RULES",
      subtitle: "The Sacred Laws of the League",
      rules: [
        {
          title: "Pay Your Dues",
          description: "League fees must be paid before the draft. No pay, no play. The commissioner will hunt you down."
        },
        {
          title: "Set Your Lineup",
          description: "There is no excuse for an empty roster spot. If you can't be bothered, you will be publicly shamed."
        },
        {
          title: "No Collusion",
          description: "Trades must be fair. If two teams are caught conspiring, both will face consequences determined by league vote."
        },
        {
          title: "Trade Deadline",
          description: "All trades must be completed by Week 10. No exceptions, no matter how much you beg."
        },
        {
          title: "Respect the Commish",
          description: "Even when they're the worst. Especially when they're the worst."
        },
        {
          title: "Trash Talk Encouraged",
          description: "Keep it fun, keep it creative, keep it in the group chat. What happens in the league stays in the league."
        }
      ],
      underConstruction: "Full rulebook being digitized from ancient scrolls..."
    }
  },

  // === FOOTER ===
  footer: {
    badges: [
      "Best viewed in Netscape Navigator 4.0",
      "800x600 resolution",
      "Made with Notepad"
    ],
    copyright: "2000-2025 WORST COMMISH EVER Fantasy Football League",
    copyrightNote: "All rights reserved. No fantasy points were harmed in the making of this website.",
    contactEmail: "commissioner@example.com",
    contactText: "Contact the Commissioner (if you dare)"
  }
};
