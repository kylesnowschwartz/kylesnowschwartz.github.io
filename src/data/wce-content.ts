/**
 * Site Content - Edit this file to change text throughout the site
 * This is essentially a basic CMS for static content
 */

// Type definitions
export interface NavItem {
  href: string;
  label: string;
}

export interface TimelineEvent {
  year: string;
  event: string;
  milestone?: boolean;
  rainbow?: boolean;
  prefix?: string;
}

export interface Rule {
  title: string;
  description: string;
}

export const CONTENT = {
  // === SITE METADATA ===
  site: {
    title: "WORST COMMISH EVER - Fantasy Football League Est. 2005",
    logoTitle: "WORST COMMISH EVER",
    tagline: '"Where championships are made and legends never die"',
    established: "Est. 2005 - Celebrating 20 Years of Friendship and Enmity",
    visitorPrefix: "You are visitor #"
  },

  // === NAVIGATION ===
  nav: [
    { href: "#dream-teams", label: "Dream Teams" },
    { href: "#fame-shame", label: "Fame & Shame" },
    { href: "#heroes", label: "Heroes" },
    { href: "#history", label: "League History" },
    { href: "#rules", label: "League Rules" }
  ] as NavItem[],

  // === MARQUEE ===
  marquee: "~~~***  WELCOME TO THE WORST COMMISH EVER FANTASY FOOTBALL LEAGUE!!!  ***~~~ <<<  20 YEARS OF GLORY, HEARTBREAK, AND ABSOLUTELY TERRIBLE TRADES  >>> ~~~***  HEROES GET REMEMBERED BUT LEGENDS NEVER DIE!!!  ***~~~ <<<  YOU'RE KILLIN' ME, SMALLS  >>> ~~~***  SET YOUR LINEUP OR GET PUBLICLY SHAMED!!!  ***~~~",

  // === SECTIONS ===
  sections: {
    dreamTeams: {
      title: "DREAM TEAMS 2025",
      subtitle: "Roll the dice and fire your hand symbols brave warriors"
    },

    fameShame: {
      title: "WALL OF FAME & SHAME",
      subtitle: "Heroes get remembered, but legends never die",
      tableHeaders: ["Year", "Champion", "Last Place"] as const
    },

    heroes: {
      title: "FORMER AND CURRENT HEROES",
      subtitle: "The brave souls who have graced our league"
    },

    history: {
      title: "LEAGUE HISTORY",
      subtitle: "20 Years of Fantasy Football Excellence (and Chaos)",
      timeline: [
        {
          year: "2005",
          event: "The league is founded by a group of ass-pants appreciators who had no idea what they were getting into. First commissioner elected (or volunteered, I don't remember)."
        },
        {
          year: "2010",
          event: 'The "Worst Commish Ever" name is officially adopted to describe what we all knew to be true.',
          milestone: true
        },
        {
          year: "2013",
          event: "League goes Global. Highway to the Timezone Dangerzone"
        },
        {
          year: "2020",
          event: "15 years! The pandemic couldn't stop us. Virtual draft party happens. Gary drinks 3 bourbons before 10pm.",
          milestone: true
        },
        {
          year: "2025",
          event: "Two decades of friendship, rivalry, and practically zero trading.",
          milestone: true,
          rainbow: true,
          prefix: "20 YEARS!"
        }
      ] as TimelineEvent[],
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
      ] as Rule[],
      underConstruction: "Full rulebook being digitized from ancient Hebrew scrolls..."
    }
  },

  // === FOOTER ===
  footer: {
    badges: [
      "Best viewed in Netscape Navigator 4.0",
      "800x600 resolution",
      "Made with Notepad+ and a dream"
    ],
    copyright: "2005-2025 WORST COMMISH EVER Fantasy Football League",
    copyrightNote: "All rights reserved. No fantasy points were harmed in the making of this website.",
    contactEmail: "commissioner@worst-commish-ever.com",
    contactText: "Contact the Commissioner (this doesn't actually do anything)"
  }
} as const;
