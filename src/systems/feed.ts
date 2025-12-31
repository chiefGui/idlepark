import type { FeedEntry, FeedEventType, GameState } from '../engine/game-types'
import { GameTypes } from '../engine/game-types'
import { Building } from './building'
import { Perk } from './perk'
import { Milestone } from './milestone'

// Handle generation components
const HANDLE_PREFIXES = [
  'thrill', 'park', 'coaster', 'ride', 'fun', 'joy', 'happy', 'dizzy',
  'spinning', 'loop', 'drop', 'screaming', 'cotton', 'candy', 'popcorn',
  'carousel', 'ferris', 'bumper', 'adventure', 'magic', 'wonder', 'dream',
  'sunny', 'summer', 'wild', 'crazy', 'epic', 'mega', 'super', 'ultra',
  'chill', 'zen', 'golden', 'lucky', 'tiny', 'big', 'lil', 'cool',
  'retro', 'neon', 'cosmic', 'stellar', 'lunar', 'solar', 'pixel',
]

const HANDLE_SUFFIXES = [
  'fan', 'lover', 'seeker', 'chaser', 'hunter', 'rider', 'goer', 'junkie',
  'addict', 'enthusiast', 'queen', 'king', 'master', 'guru', 'ninja',
  'pro', 'star', 'life', 'vibes', 'mode', 'wave', 'zone', 'squad',
  'crew', 'gang', 'club', 'nation', 'world', 'universe', 'realm',
  'dreams', 'tales', 'stories', 'adventures', 'journeys', 'moments',
]

const HANDLE_NAMES = [
  'alex', 'sam', 'jordan', 'taylor', 'casey', 'morgan', 'riley', 'quinn',
  'avery', 'skyler', 'jamie', 'drew', 'blake', 'charlie', 'dakota', 'emery',
  'frankie', 'harper', 'indie', 'jessie', 'kai', 'london', 'mason', 'nova',
  'oliver', 'parker', 'reese', 'sage', 'toby', 'venus', 'winter', 'zoe',
  'max', 'luna', 'milo', 'coco', 'felix', 'ivy', 'leo', 'ruby', 'oscar', 'lily',
  'aria', 'finn', 'miles', 'iris', 'theo', 'willow', 'jack', 'emma', 'noah', 'ava',
  'liam', 'mia', 'ellie', 'ben', 'sophie', 'marcus', 'nina', 'caleb', 'maya', 'ethan',
]

// Message templates by event type - diverse tones and personalities
const MESSAGES: Record<FeedEventType, string[]> = {
  building_built: [
    // Excited
    "OMG they just built a {building}!! This park keeps getting better 🎉",
    "NEW {building} ALERT!! Who's coming with me??",
    "A {building}?? SHUT UP. This is the best day",
    "THE {building} IS HERE THE {building} IS HERE",
    "I literally cannot contain my excitement rn. A {building}!!!",
    // Chill
    "Oh nice, they added a {building}. Solid move",
    "New {building}. Cool cool cool",
    "Just noticed the {building}. Not bad, not bad at all",
    "They got a {building} now. Respect",
    // Appreciative
    "Finally a {building}! Been waiting for this moment my whole life tbh",
    "The {building} looks INCREDIBLE. This park management team gets it",
    "Props to whoever decided to build the {building}. Hero",
    "The {building} was exactly what this place needed. Well played",
    // Influencer style
    "POV: You walk in and see the new {building} 😍",
    "Not me running to the {building} in my going out fit",
    "The {building}?? It's giving everything it needs to give",
    "Okay but the {building} aesthetic is IMMACULATE",
    // Parent
    "Kids are gonna lose their minds when they see the {building}",
    "Finally something for the whole family. The {building} looks perfect",
    "Brought the kids to see the new {building}. Worth every tantrum in the car",
    // First timer
    "First time here and they have a {building}?? I'm never leaving",
    "Wait this park has a {building}?? What else am I missing",
    // Veteran
    "Been coming here for years. The {building} is a game changer",
    "Remember when this park didn't have a {building}? Look at us now",
    // Skeptic turned believer
    "I was skeptical but the {building} actually slaps",
    "Didn't think we needed a {building} but I was wrong. So wrong",
  ],
  building_demolished: [
    // Dramatic
    "Wait they demolished the {building}?? I have trust issues now",
    "THE {building} IS GONE. I need a moment",
    "Nooo not the {building}! That was my SPOT",
    "They really said goodbye to the {building} huh. End of an era 😭",
    "I'm not crying about the {building}. YOU'RE crying",
    // Nostalgic
    "RIP {building}... you will be missed 🕊️",
    "Pour one out for the {building}. So many memories",
    "The {building} where I had my first date here... gone forever",
    "Used to spend hours at the {building}. Feeling some type of way rn",
    // Confused
    "Did... did they just remove the {building}? Why tho",
    "Someone explain to me why the {building} had to go",
    "The {building} is gone and nobody told me?? RUDE",
    // Accepting
    "Okay so the {building} is gone. Change is hard but we move",
    "Sad about the {building} but curious what's next",
    "Missing the {building} but trusting the process I guess",
    // Upset
    "Moment of silence for the {building} please 🙏",
    "Cannot believe they got rid of the {building}. Questioning everything",
    "The {building} deserved better than this",
    "First they build it, then they take it away. My {building}...",
  ],
  milestone_achieved: [
    // Celebratory
    "This park just hit {milestone}!! We're witnessing history 🏆",
    "HUGE news: {milestone}! So proud of this place",
    "{milestone}!! Pop the champagne!!",
    "WE DID IT. {milestone}. I'm emotional",
    "Literally screaming rn. {milestone}!!!",
    // Proud
    "Did y'all see? {milestone}! I knew this park was special",
    "{milestone} achieved and I was HERE for it",
    "Been here since day one. {milestone} hits different",
    // Casual
    "Oh snap, {milestone}. Nice one",
    "{milestone}. Cool milestone honestly",
    "Just saw they hit {milestone}. Solid progress",
    // Inspirational
    "From nothing to {milestone}. If that's not inspiring idk what is",
    "{milestone}. Proof that dreams come true",
    "Everyone doubted this park. Now look: {milestone}",
    // Community
    "We made it to {milestone}!! Party at the carousel 🎠",
    "{milestone} is a WIN for all of us",
    "Shoutout to everyone who helped reach {milestone}",
  ],
  perk_purchased: [
    // Excited
    "They got the {perk} upgrade! Things are about to get WILD",
    "YOOO {perk}?? They're not playing around",
    "{perk} just dropped. This park doesn't miss",
    // Analytical
    "Smart investment with {perk}. This will pay off",
    "The {perk} upgrade makes so much sense strategically",
    "Interesting choice going with {perk}. Let's see how it plays out",
    // Casual
    "Management really said 'let's get {perk}' - love to see it",
    "New upgrade unlocked: {perk}. Evolution in real time",
    "Heard they invested in {perk}. Solid move honestly",
    // Hopeful
    "The {perk} perk is gonna change everything here",
    "Can't wait to see what {perk} does for this place",
    "{perk} is exactly what we needed. Watch this space",
  ],
  guest_threshold: [
    // Amazed
    "There's like {count} of us here now?? This place is POPPIN 🔥",
    "{count} guests!! We're basically a city at this point",
    "Just counted... {count} people! Insane growth",
    "From empty park to {count} guests. What a journey",
    // Community vibes
    "The vibes when there's {count} of us here... immaculate",
    "{count} people all having the time of their lives. Beautiful",
    "We really out here. {count} strong 💪",
    // Observational
    "Wow {count} guests! Remember when this place was empty?",
    "{count} visitors and counting. The word is spreading",
    "This park went from zero to {count} real quick",
    // Funny
    "{count} of us crammed in here and loving every second",
    "Told my friend this park was underrated. Now {count} people know",
    "Me and my {count} closest friends hanging at the park",
  ],
  guest_departed: [
    // Concerned
    "Just saw {count} people leave looking unhappy... yikes 😬",
    "Not gonna lie, {count} guests just bounced. Something's off",
    "Oof {count} people left today. Hope they come back",
    "{count} guests said goodbye. The vibes might need work",
    // Observational
    "Watched {count} frustrated visitors leave. We can do better",
    "The exit line had {count} unhappy faces. That's rough",
    "{count} people gave up and left. Wake up call maybe?",
    // Sympathetic
    "Feel bad for the {count} who left. It's not always perfect here",
    "{count} people couldn't take it anymore. I get it honestly",
    "Some days are rough. {count} found that out today",
    // Concerned local
    "As a regular, seeing {count} leave hurts. Fix it pls",
    "{count} people won't be back. That's a problem",
    // Hopeful
    "{count} left but maybe they'll give it another chance?",
    "Bye to {count} visitors. Hope tomorrow's better for everyone",
  ],
  satisfaction_high: [
    // Pure joy
    "10/10 no notes. This park is PERFECTION ✨",
    "I have never been happier. This place just hits different",
    "Everything here is amazing?? How is that even possible",
    "Crying happy tears. This is the best day ever 😭💕",
    "If happiness was a place it would be right here",
    // Detailed appreciation
    "The rides? Perfect. The food? Perfect. The vibes? PERFECT",
    "Clean park, friendly staff, amazing attractions. Chef's kiss",
    "Every single thing about this place is exactly right",
    // Emotional
    "I'm so satisfied I might just live here forever",
    "This park really said 'your happiness is our priority' and MEANT it",
    "My heart is so full rn you don't even understand",
    "Never felt this content anywhere. What is this magic",
    // Recommending
    "If you're not here rn what are you even doing with your life",
    "Told everyone I know about this place. You're welcome",
    "5 stars. Would give 10 if I could. COME HERE",
    // Surprised
    "Came with low expectations. Leaving with my faith in humanity restored",
    "Didn't know a park could make me this happy. Wild",
    "Okay I was wrong to doubt this place. It's incredible",
  ],
  satisfaction_low: [
    // Disappointed
    "Okay so... this place has seen better days 😕",
    "Not loving the vibes here lately ngl",
    "What's going on with this park? Feeling a bit meh",
    "The experience today was... not great. Hope they fix things",
    // Frustrated
    "I wanna love this place but it's making it hard rn",
    "Came here for fun but the vibes are off today",
    "Something needs to change around here tbh",
    "Miss when this park was actually good. What happened?",
    // Specific complaints
    "The lines are too long. The food is whatever. Struggling here",
    "It's too crowded and not enough to do. Fix the balance pls",
    "Feels like they stopped trying. Where's the magic?",
    // Constructive
    "Love this park but it needs some TLC right now",
    "Not my best visit but hoping they turn it around",
    "A few tweaks and this could be great again. Just saying",
    // Sad
    "Used to tell everyone to come here. Not sure anymore",
    "My favorite park falling off hurts different",
    "Really wanted today to be better than this 😔",
  ],
  price_complaint: [
    // Shocked
    "${price} for a ticket?? In this economy?? 💸",
    "EXCUSE ME ${price}??? For WHAT",
    "The price went up to ${price}?? Make it make sense",
    "Just paid ${price} and I'm still in shock",
    // Frustrated
    "These ticket prices are getting out of hand fr",
    "Love the park but ${price} is a lot... just saying",
    "My wallet is crying at these ticket prices 😭",
    "${price} per person is highway robbery honestly",
    // Sarcastic
    "Sure let me just casually drop ${price} for some rides",
    "Only ${price}! *laughs in broke*",
    "Ah yes ${price}, totally reasonable, definitely not pain",
    // Family perspective
    "Can't afford to bring the whole family at ${price} per person smh",
    "${price} times 4 kids... math isn't mathing for my bank account",
    "Family of 5 at ${price} each. I'll just watch from outside thanks",
    // Reluctant
    "Paying ${price} but not happy about it",
    "${price} and the food is extra?? Pain",
  ],
  price_praise: [
    // Amazed
    "Only ${price} for all this?? STEAL 🙌",
    "${price}?? That's literally nothing for this experience",
    "Wait it's only ${price}?? I thought it'd be way more",
    // Appreciative
    "The value here is insane. ${price} for unlimited fun?? Yes please",
    "They could charge way more tbh. ${price} is a bargain",
    "${price} is so reasonable! This park respects our wallets",
    "Best ${price} I ever spent. Zero regrets",
    // Recommending
    "At ${price} you literally cannot complain. What a deal",
    "Tell your friends: ${price} gets you in. That's it. GO",
    "${price} is cheaper than my morning coffee habit. Worth it",
    // Grateful
    "Finally a park that doesn't empty your bank account. ${price}!",
    "Affordable AND fun?? ${price} is a gift",
    "They really said '${price} is enough' and I respect that so much",
  ],
  financial_success: [
    // Proud
    "This park is THRIVING. Love to see a success story 📈",
    "Business must be booming here. Good for them honestly",
    "From struggling to successful. What a glow up for this park",
    // Supportive
    "The way this park turned things around... inspiring",
    "They really built something special here. That's hustle",
    "Everyone who believed in this park from the start: we won",
    // Observational
    "You can tell the park is doing well. Everything just works",
    "Money well spent on improvements. You can see the difference",
    "The growth has been amazing to watch. Keep it up",
    // Happy for them
    "Success couldn't happen to a better park. Deserved",
    "All the hard work is paying off. Beautiful to see",
  ],
  financial_warning: [
    // Worried
    "Heard this park is struggling... hope they pull through 🥺",
    "Might wanna visit soon while it's still here... just saying",
    "The park's looking a little rough. Sending good vibes",
    // Supportive
    "Really hope management figures things out. I love this place",
    "Rough patch but I believe in this park. They'll bounce back",
    "Times are tough everywhere. Rooting for them",
    // Concerned fan
    "Not me worrying about my favorite park's finances at 2am",
    "Please don't close please don't close please don't close",
    "I'll visit extra to help. Whatever it takes",
    // Observational
    "Things seem slow here lately. Hope it picks up",
    "The park needs some love. Come support if you can",
    "Fewer visitors than usual. Kinda sad to see",
  ],
  ambient: [
    // Vibing
    "Just vibing at the park. Life is good ☀️",
    "Cotton candy in hand, worries left at the gate",
    "This place makes me feel like a kid again",
    "The way the sun hits this park in the afternoon... magical",
    "Literally just sitting on a bench and smiling. That's the vibe",
    // Happy observations
    "Just overheard a kid say this is the best day ever. Same kid, same",
    "The smell of funnel cakes and happiness. That's it. That's the tweet",
    "Watching families have fun here never gets old",
    "Everyone's smiling. Everyone. How is that possible",
    "Little moments of joy everywhere you look",
    // Location specific
    "Posted up at the {random_spot}. Living my best life",
    "Found a quiet spot near the {random_spot}. Perfect",
    "The {random_spot} is my new favorite place",
    "If you need me I'll be at the {random_spot}. Indefinitely",
    // Loyal visitor
    "Day 47 of saying I'll take a break from this park. Day 47 of lying",
    "If you need me I'll be here. Forever probably",
    "Every time I leave I'm already planning my next visit",
    "My screen time for this park's app is embarrassing but I'm not changing",
    "Been here 100 times and it never gets old. Ever",
    // Social
    "Brought my bestie here and they're obsessed now. You're welcome",
    "Made 3 new friends in the food line. Community 🤝",
    "Stranger just complimented my park merch. We bonded instantly",
    "The people here are as great as the rides tbh",
    // Philosophical
    "Spinning on the carousel contemplating life. As one does",
    "This park is my therapy honestly",
    "There's no bad day that this park can't fix",
    "If more places were like this, the world would be better",
    // Escape
    "Currently hiding from my responsibilities at the park. Very effective",
    "Real world? Don't know her. I live here now",
    "Work emails can wait. Ferris wheel cannot",
    "Out of office: at the park. Forever",
    // Declarations
    "POV: you found the happiest place on earth",
    "Hot take: this park > literally everywhere else",
    "No thoughts. Just park",
    "Peak existence is being right here right now",
    // Quirky
    "Do I need more park merch? No. Am I buying more? Obviously",
    "Just saw a squirrel steal someone's churro. Nature is healing",
    "The background music here lives rent free in my head",
    "Someone's proposal at the ferris wheel. I'm not crying you're crying",
    // Sensory
    "The sound of happy screams from the coaster. Pure serotonin",
    "That feeling when you first walk through the gates... unmatched",
    "Sunset at the park hits different. Trust me",
    "Cool breeze, warm sun, happy vibes. Perfect day formula",
    // Simple joy
    "Sometimes you just need a good park day",
    "No plans. No agenda. Just park time",
    "This is what weekends are for",
    "Reminder that joy exists and it's at the park",
  ],
}

// Random spots for ambient messages
const RANDOM_SPOTS = [
  'carousel', 'fountain', 'bench near the entrance', 'ice cream shop',
  'ferris wheel queue', 'garden area', 'info booth', 'food court',
  'shade under the big tree', 'photo spot', 'gift shop', 'picnic area',
  'cotton candy stand', 'park entrance', 'rest area', 'observation deck',
  'flower garden', 'water fountain', 'souvenir stand', 'snack bar',
]

// Avatar styles from DiceBear
const AVATAR_STYLES = [
  'adventurer', 'adventurer-neutral', 'avataaars', 'avataaars-neutral',
  'big-ears', 'big-ears-neutral', 'big-smile', 'bottts', 'bottts-neutral',
  'croodles', 'croodles-neutral', 'fun-emoji', 'lorelei', 'lorelei-neutral',
  'micah', 'miniavs', 'notionists', 'notionists-neutral', 'open-peeps',
  'personas', 'pixel-art', 'pixel-art-neutral', 'thumbs',
]

function seededRandom(seed: string): () => number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return () => {
    hash = ((hash * 1103515245) + 12345) & 0x7fffffff
    return hash / 0x7fffffff
  }
}

function pickRandom<T>(arr: T[], random: () => number): T {
  return arr[Math.floor(random() * arr.length)]
}

export class Feed {
  static generateHandle(): string {
    const random = Math.random
    const style = Math.floor(random() * 5)

    switch (style) {
      case 0: {
        const prefix = pickRandom(HANDLE_PREFIXES, random)
        const name = pickRandom(HANDLE_NAMES, random)
        const num = Math.floor(random() * 9999)
        return `${prefix}${name}${num}`
      }
      case 1: {
        const name = pickRandom(HANDLE_NAMES, random)
        const suffix = pickRandom(HANDLE_SUFFIXES, random)
        return `${name}_${suffix}`
      }
      case 2: {
        const prefix = pickRandom(HANDLE_PREFIXES, random)
        const suffix = pickRandom(HANDLE_SUFFIXES, random)
        const num = Math.floor(random() * 99)
        return `${prefix}${suffix}${num}`
      }
      case 3: {
        const name = pickRandom(HANDLE_NAMES, random)
        const year = 1990 + Math.floor(random() * 20)
        return `${name}${year}`
      }
      default: {
        const name = pickRandom(HANDLE_NAMES, random)
        const name2 = pickRandom(HANDLE_NAMES, random)
        return `${name}and${name2}`
      }
    }
  }

  static generateAvatarUrl(seed: string): string {
    const random = seededRandom(seed)
    const style = pickRandom(AVATAR_STYLES, random)
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`
  }

  static generateMessage(
    type: FeedEventType,
    context?: {
      buildingId?: string
      buildingName?: string
      milestoneId?: string
      milestoneName?: string
      perkId?: string
      perkName?: string
      guestCount?: number
      ticketPrice?: number
    }
  ): string {
    const templates = MESSAGES[type]
    const template = templates[Math.floor(Math.random() * templates.length)]

    let message = template

    if (context?.buildingName) {
      message = message.replace(/{building}/g, context.buildingName)
    }
    if (context?.milestoneName) {
      message = message.replace(/{milestone}/g, context.milestoneName)
    }
    if (context?.perkName) {
      message = message.replace(/{perk}/g, context.perkName)
    }
    if (context?.guestCount !== undefined) {
      message = message.replace(/{count}/g, String(context.guestCount))
    }
    if (context?.ticketPrice !== undefined) {
      message = message.replace(/{price}/g, String(context.ticketPrice))
    }
    if (message.includes('{random_spot}')) {
      const spot = RANDOM_SPOTS[Math.floor(Math.random() * RANDOM_SPOTS.length)]
      message = message.replace(/{random_spot}/g, spot)
    }

    return message
  }

  static createEntry(
    type: FeedEventType,
    day: number,
    context?: {
      buildingId?: string
      milestoneId?: string
      perkId?: string
      guestCount?: number
      ticketPrice?: number
    }
  ): FeedEntry {
    const buildingName = context?.buildingId ? Building.getById(context.buildingId)?.name : undefined
    const milestoneName = context?.milestoneId ? Milestone.getById(context.milestoneId)?.name : undefined
    const perkName = context?.perkId ? Perk.getById(context.perkId)?.name : undefined

    const handle = this.generateHandle()
    const avatarSeed = `${handle}-${Date.now()}-${Math.random()}`

    return {
      id: `feed-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type,
      handle,
      avatarSeed,
      message: this.generateMessage(type, { ...context, buildingName, milestoneName, perkName }),
      day: Math.floor(day),
      timestamp: Date.now(),
      likes: Math.floor(Math.random() * 500) + 1,
      retweets: Math.floor(Math.random() * 100),
      replies: Math.floor(Math.random() * 10),
    }
  }

  static addEntry(entries: FeedEntry[], entry: FeedEntry): FeedEntry[] {
    const newEntries = [entry, ...entries]
    return newEntries.slice(0, GameTypes.MAX_FEED_ENTRIES)
  }

  static getEntries(state: GameState): FeedEntry[] {
    return state.feedEntries
  }

  static formatTimestamp(entryTimestamp: number): string {
    const now = Date.now()
    const diff = now - entryTimestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (seconds < 60) return 'now'
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    return `${days}d`
  }

  static formatLikes(count: number): string {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
    return String(count)
  }

  static shouldGenerateAmbient(guestCount: number): boolean {
    if (guestCount < 10) return false
    const chance = Math.min(0.0005, guestCount / 200000)
    return Math.random() < chance
  }

  static getSatisfactionEvent(
    currentSatisfaction: number,
    previousSatisfaction: number
  ): FeedEventType | null {
    if (currentSatisfaction >= 85 && previousSatisfaction < 85) return 'satisfaction_high'
    if (currentSatisfaction <= 40 && previousSatisfaction > 40) return 'satisfaction_low'
    return null
  }

  static getPriceEvent(perceivedValue: number): FeedEventType | null {
    // Complaints when overpriced for quality (value < 0.8)
    if (perceivedValue < 0.8 && Math.random() < 0.002) return 'price_complaint'
    // Praise when great value for quality (value > 1.3)
    if (perceivedValue > 1.3 && Math.random() < 0.002) return 'price_praise'
    return null
  }

  static readonly GUEST_THRESHOLDS = [10, 25, 50, 100, 200, 500]

  static checkGuestThreshold(currentGuests: number, previousGuests: number): number | null {
    for (const threshold of this.GUEST_THRESHOLDS) {
      if (currentGuests >= threshold && previousGuests < threshold) return threshold
    }
    return null
  }
}
