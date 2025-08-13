export function getActions(self) {
  return {
    selectScreen: {
      name: 'Select screen (context)',
      options: [
        {
          type: 'dropdown',
          id: 'screenId',
          label: 'Screen',
          choices: () => self.getScreens().map((s) => ({ id: s.id, label: s.name })),
          default: () => self.getScreens()[0]?.id,
        },
      ],
      callback: async (event) => {
        await self.selectScreen(event.options.screenId)
      },
    },

    routeInputToPVWLayer: {
      name: 'Route INPUT → PVW Layer (selected screen)',
      options: [
        {
          type: 'dropdown',
          id: 'layerId',
          label: 'PVW Layer',
          choices: () => self.getPVWLayers().map((l) => ({ id: l.id, label: l.name })),
        },
        {
          type: 'dropdown',
          id: 'inputId',
          label: 'Input',
          choices: () => self.getInputs().map((i) => ({ id: i.id, label: i.name })),
        },
      ],
      callback: async (event) => {
        const { layerId, inputId } = event.options
        await self.routeInputToPVWLayer(layerId, inputId)
      },
    },

    refreshState: {
      name: 'Force refresh state',
      callback: async () => {
        await self.fullRefresh()
      },
    },
  }
}
