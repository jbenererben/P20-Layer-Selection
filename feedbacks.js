export function getFeedbacks(self) {
  return {
    pvwLayerCountEquals: {
      type: 'boolean',
      name: 'PVW layer count equals',
      description: 'True when PVW layer count == value',
      options: [{ type: 'number', id: 'count', label: 'Count', default: 1, min: 0, max: 20 }],
      callback: (feedback) => {
        const cnt = self.getPVWLayers().length
        return cnt === Number(feedback.options.count)
      },
    },
  }
}
