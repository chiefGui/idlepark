import { motion } from 'framer-motion'
import { useDrawer } from './drawer'
import { MilestonesContent } from '../milestones/milestones-content'
import { PerksContent } from '../perks/perks-content'
import { AnalyticsContent } from '../analytics/analytics-content'

export function DrawerContent() {
  const { activeTab } = useDrawer()

  return (
    <motion.div
      key={activeTab}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex-1 overflow-auto p-4"
    >
      {activeTab === 'milestones' && <MilestonesContent />}
      {activeTab === 'perks' && <PerksContent />}
      {activeTab === 'analytics' && <AnalyticsContent />}
    </motion.div>
  )
}
