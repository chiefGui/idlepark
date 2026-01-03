/**
 * ECS Components
 */

export {
  type BehaviorTag,
  type BehaviorTagMix,
  type MoodTag,
  type MoodTagMix,
  type GuestComponents,
  type TagMeta,
  BEHAVIOR_TAGS,
  BEHAVIOR_TAG_META,
  MOOD_TAGS,
  MOOD_TAG_META,
  createDefaultBehaviorMix,
  createDefaultMoodMix,
} from './guest-tags'

export {
  type BuildingTagAudience,
  calculateBehaviorTagMix,
  calculateMoodTagMix,
  getGuestComponents,
} from './tag-calculator'
