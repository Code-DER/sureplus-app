export function formatExpiration(dateStr: string | null): string {
  if (!dateStr) return 'No expiry date'
  const exp = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'Expired'
  if (diffDays === 0) return 'Expires today'
  if (diffDays === 1) return 'Expires tomorrow'
  if (diffDays <= 7) return `Expires in ${diffDays} days`
  return exp.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })
}
