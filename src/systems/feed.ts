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
]

const HANDLE_SUFFIXES = [
  'fan', 'lover', 'seeker', 'chaser', 'hunter', 'rider', 'goer', 'junkie',
  'addict', 'enthusiast', 'queen', 'king', 'master', 'guru', 'ninja',
  'pro', 'star', 'life', 'vibes', 'mode', 'wave', 'zone', 'squad',
]

const HANDLE_NAMES = [
  'alex', 'sam', 'jordan', 'taylor', 'casey', 'morgan', 'riley', 'quinn',
  'avery', 'skyler', 'jamie', 'drew', 'blake', 'charlie', 'dakota', 'emery',
  'frankie', 'harper', 'indie', 'jessie', 'kai', 'london', 'mason', 'nova',
  'oliver', 'parker', 'reese', 'sage', 'toby', 'venus', 'winter', 'zoe',
  'max', 'luna', 'milo', 'coco', 'felix', 'ivy', 'leo', 'ruby', 'oscar', 'lily',
]

// Message templates by event type
const MESSAGES: Record<FeedEventType, string[]> = {
  building_built: [
    "OMG they just built a {building}!! This park keeps getting better",
    "NEW {building} ALERT!! Who's coming with me??",
    "Finally a {building}! Been waiting for this moment my whole life tbh",
    "The {building} looks INCREDIBLE. This park management team gets it",
    "Just saw them finishing the {building}. Tomorrow's gonna be lit",
    "A {building}?? Take my money already",
    "They really said 'you want a {building}? Here's a {building}' I'm crying",
    "The way I sprinted when I saw the {building} being built... embarrassing but worth it",
    "New {building} just dropped and I am READY",
    "This park adding a {building}??? We're so blessed",
  ],
  building_demolished: [
    "Wait they demolished the {building}?? I have trust issues now",
    "RIP {building}... you will be missed",
    "Nooo not the {building}! That was my favorite",
    "They really said goodbye to the {building} huh. End of an era",
    "The {building} is gone... I'm not okay",
    "Moment of silence for the {building} please",
    "First they build it, then they take it away. My {building}...",
    "Cannot believe they got rid of the {building}. Questioning everything rn",
  ],
  milestone_achieved: [
    "This park just hit {milestone}!! We're witnessing history",
    "HUGE news: {milestone}! So proud of this place",
    "{milestone}?? This park is on another level",
    "Did y'all see? {milestone}! I knew this park was special",
    "We made it to {milestone}!! Party at the carousel",
    "{milestone} achieved. We're not worthy",
    "Living through {milestone} at my favorite park. What a time to be alive",
  ],
  perk_purchased: [
    "They got the {perk} upgrade! Things are about to get interesting",
    "Management really said 'let's get {perk}' - love to see it",
    "New upgrade unlocked: {perk}. This park keeps evolving",
    "Heard they invested in {perk}. Smart move honestly",
    "The {perk} perk is gonna change everything here",
  ],
  guest_threshold: [
    "There's like {count} of us here now?? This place is poppin",
    "{count} guests in the park! We're basically a city at this point",
    "Just counted... {count} people! This park is THE place to be",
    "Wow {count} guests! Remember when this place was empty? Growth",
    "The vibes when there's {count} of us here... immaculate",
  ],
  guest_departed: [
    "Just saw {count} people leave looking unhappy... yikes",
    "Not gonna lie, {count} guests just bounced. Something's off",
    "Oof {count} people left today. Hope they come back",
    "{count} guests said goodbye. The vibes might need work",
    "Watched {count} frustrated visitors leave. We can do better",
    "Some ({count}) of us couldn't take it anymore. Peace out I guess",
    "{count} people gave up and left. This is a wake up call fr",
    "The exit line had {count} unhappy faces. That's rough",
  ],
  satisfaction_high: [
    "10/10 no notes. This park is PERFECTION",
    "I have never been happier. This place just hits different",
    "Everything here is amazing?? How is that even possible",
    "The satisfaction I feel rn... unmatched. This park gets me",
    "Crying happy tears. This is the best day ever",
    "If happiness was a place it would be right here",
    "I'm so satisfied I might just live here forever",
    "This park really said 'your happiness is our priority' and meant it",
  ],
  satisfaction_low: [
    "Okay so... this place has seen better days",
    "Not loving the vibes here lately ngl",
    "What's going on with this park? Feeling a bit meh",
    "The experience today was... not great. Hope they fix things",
    "I wanna love this place but it's making it hard rn",
    "Came here for fun but the vibes are off today",
    "Something needs to change around here tbh",
    "Miss when this park was actually good. What happened?",
  ],
  price_complaint: [
    "${price} for a ticket?? In this economy??",
    "These ticket prices are getting out of hand fr",
    "Love the park but ${price} is a lot... just saying",
    "My wallet is crying at these ticket prices",
    "Had to take out a loan just to get in here lol (not really but almost)",
    "The price went up AGAIN?? ${price}?? Make it make sense",
    "Can't afford to bring the whole family at ${price} per person smh",
  ],
  price_praise: [
    "Only ${price} for all this?? STEAL",
    "The value here is insane. ${price} for unlimited fun?? Yes please",
    "They could charge way more tbh. ${price} is a bargain",
    "${price} is so reasonable! This park respects our wallets",
    "Best ${price} I ever spent. No regrets",
    "At ${price} you literally cannot complain. What a deal",
  ],
  financial_success: [
    "This park is THRIVING. Love to see a success story",
    "Business must be booming here. Good for them honestly",
    "The way this park turned things around... inspiring",
    "From struggling to successful. What a glow up for this park",
    "They really built something special here. That's that entrepreneurial spirit",
  ],
  financial_warning: [
    "Heard this park is struggling... hope they pull through",
    "Might wanna visit soon while it's still here... just saying",
    "The park's looking a little rough. Sending good vibes",
    "Really hope management figures things out. I love this place",
    "Not me worrying about my favorite park's finances at 2am",
  ],
  ambient: [
    "Just vibing at the park. Life is good",
    "Cotton candy in hand, worries left at the gate",
    "This place makes me feel like a kid again",
    "Posted up at the {random_spot}. Living my best life",
    "The way the sun hits this park in the afternoon... magical",
    "Brought my bestie here and they're obsessed now. You're welcome",
    "Day 47 of saying I'll take a break from this park. Day 47 of lying",
    "If you need me I'll be here. Forever probably",
    "There's no bad day that this park can't fix",
    "Just overheard a kid say this is the best day ever. Same kid, same",
    "The smell of funnel cakes and happiness. That's the vibe",
    "Spinning on the carousel contemplating life. As one does",
    "This park is my therapy honestly",
    "Made 3 new friends in the food line. Community",
    "Every time I leave I'm already planning my next visit",
    "The way I ran here after work... don't judge me",
    "Currently hiding from my responsibilities at the park. Very effective",
    "POV: you found the happiest place on earth",
    "My screen time for this park's app is embarrassing but I'm not changing",
    "Hot take: this park > literally everywhere else",
  ],
}

// Random spots for ambient messages
const RANDOM_SPOTS = [
  'carousel', 'fountain', 'bench near the entrance', 'ice cream shop',
  'ferris wheel queue', 'garden area', 'info booth', 'food court',
  'shade under the big tree', 'photo spot', 'gift shop', 'picnic area',
]

// Avatar styles from DiceBear
const AVATAR_STYLES = [
  'adventurer',
  'adventurer-neutral',
  'avataaars',
  'avataaars-neutral',
  'big-ears',
  'big-ears-neutral',
  'big-smile',
  'bottts',
  'bottts-neutral',
  'croodles',
  'croodles-neutral',
  'fun-emoji',
  'icons',
  'identicon',
  'lorelei',
  'lorelei-neutral',
  'micah',
  'miniavs',
  'notionists',
  'notionists-neutral',
  'open-peeps',
  'personas',
  'pixel-art',
  'pixel-art-neutral',
  'thumbs',
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
    const style = Math.floor(random() * 4)

    switch (style) {
      case 0: {
        // prefix + name + numbers
        const prefix = pickRandom(HANDLE_PREFIXES, random)
        const name = pickRandom(HANDLE_NAMES, random)
        const num = Math.floor(random() * 9999)
        return `${prefix}${name}${num}`
      }
      case 1: {
        // name + suffix
        const name = pickRandom(HANDLE_NAMES, random)
        const suffix = pickRandom(HANDLE_SUFFIXES, random)
        return `${name}_${suffix}`
      }
      case 2: {
        // prefix + suffix + numbers
        const prefix = pickRandom(HANDLE_PREFIXES, random)
        const suffix = pickRandom(HANDLE_SUFFIXES, random)
        const num = Math.floor(random() * 99)
        return `${prefix}${suffix}${num}`
      }
      default: {
        // name + birth year style
        const name = pickRandom(HANDLE_NAMES, random)
        const year = 1985 + Math.floor(random() * 25)
        return `${name}${year}`
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

    // Replace placeholders
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

    // Replace random spots
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
    // Look up names from IDs
    const buildingName = context?.buildingId
      ? Building.getById(context.buildingId)?.name
      : undefined
    const milestoneName = context?.milestoneId
      ? Milestone.getById(context.milestoneId)?.name
      : undefined
    const perkName = context?.perkId
      ? Perk.getById(context.perkId)?.name
      : undefined

    const handle = this.generateHandle()
    const avatarSeed = `${handle}-${Date.now()}-${Math.random()}`

    return {
      id: `feed-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type,
      handle,
      avatarSeed,
      message: this.generateMessage(type, {
        ...context,
        buildingName,
        milestoneName,
        perkName,
      }),
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
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return String(count)
  }

  // Check if we should generate an ambient tweet (random chance per tick)
  // Very rare - roughly once every few minutes of gameplay
  static shouldGenerateAmbient(guestCount: number): boolean {
    if (guestCount < 10) return false
    // ~0.05% chance per tick, scales slightly with guests
    const chance = Math.min(0.0005, guestCount / 200000)
    return Math.random() < chance
  }

  // Determine satisfaction-based events
  static getSatisfactionEvent(
    currentSatisfaction: number,
    previousSatisfaction: number
  ): FeedEventType | null {
    // Only trigger on significant changes
    if (currentSatisfaction >= 85 && previousSatisfaction < 85) {
      return 'satisfaction_high'
    }
    if (currentSatisfaction <= 40 && previousSatisfaction > 40) {
      return 'satisfaction_low'
    }
    return null
  }

  // Determine price-based events
  static getPriceEvent(ticketPrice: number): FeedEventType | null {
    if (ticketPrice >= 20) {
      // 0.1% chance to complain about high prices
      if (Math.random() < 0.001) return 'price_complaint'
    } else if (ticketPrice <= 8) {
      // 0.1% chance to praise low prices
      if (Math.random() < 0.001) return 'price_praise'
    }
    return null
  }

  // Guest threshold milestones
  static readonly GUEST_THRESHOLDS = [10, 25, 50, 100, 200, 500]

  static checkGuestThreshold(
    currentGuests: number,
    previousGuests: number
  ): number | null {
    for (const threshold of this.GUEST_THRESHOLDS) {
      if (currentGuests >= threshold && previousGuests < threshold) {
        return threshold
      }
    }
    return null
  }
}
