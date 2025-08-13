import { InstanceBase, InstanceStatus, Regex } from '@companion-module/base'
import { getActions } from './actions.js'
import { getFeedbacks } from './feedbacks.js'
import { getVariables } from './variables.js'

export class P20PVWInstance extends InstanceBase {
  constructor(internal) {
    super(internal)

    this.CONFIG_DEFAULTS = {
      host: '127.0.0.1',
      port: 0, // Adım 2'de belirlenecek (HTTP/WS/TCP)
      pollInterval: 500,
    }

    this.state = {
      connected: false,
      selectedScreenId: null,
      screens: [],
      inputs: [],
      pvwLayersByScreen: new Map(), // screenId -> [{ id, name, index }]
    }

    this._poll = undefined
  }

  async init(config) {
    this.config = { ...this.CONFIG_DEFAULTS, ...config }
    this.updateStatus(InstanceStatus.Connecting, 'Connecting…')

    try {
      await this.connectToP20()
      await this.fullRefresh()
      this.startPolling()
      this.updateStatus(InstanceStatus.Ok)
    } catch (e) {
      this.log('error', `Init error: ${e?.message || e}`)
      this.updateStatus(InstanceStatus.ConnectionFailure, e?.message || 'Connection failed')
    }

    this.setActionDefinitions(getActions(this))
    this.setFeedbackDefinitions(getFeedbacks(this))
    this.setVariableDefinitions(getVariables(this))
    this.updateDynamicStuff()
  }

  async destroy() {
    this.stopPolling()
    await this.disconnectFromP20()
  }

  getConfigFields() {
    return [
      { type: 'static-text', id: 'info', label: 'Info', value: 'Pixelhue P20 — PVW aware layer control' },
      { type: 'textinput', id: 'host', label: 'Host / IP', width: 6, default: this.CONFIG_DEFAULTS.host, regex: Regex.IP },
      { type: 'number', id: 'port', label: 'Port', width: 3, default: this.CONFIG_DEFAULTS.port, min: 0, max: 65535 },
      { type: 'number', id: 'pollInterval', label: 'Poll interval (ms)', width: 3, default: this.CONFIG_DEFAULTS.pollInterval, min: 100, max: 5000 },
    ]
  }

  async configUpdated(config) {
    this.config = { ...this.config, ...config }
    this.stopPolling()
    await this.disconnectFromP20()
    try {
      await this.connectToP20()
      await this.fullRefresh()
      this.startPolling()
      this.updateStatus(InstanceStatus.Ok)
    } catch (e) {
      this.updateStatus(InstanceStatus.ConnectionFailure, e?.message || 'Connection failed')
    }
  }

  // ------- Connection placeholders (Adım 2'de doldurulacak) -------
  async connectToP20() {
    this.state.connected = true
  }
  async disconnectFromP20() {
    this.state.connected = false
  }

  startPolling() {
    this.stopPolling()
    if (this.config.pollInterval > 0) {
      this._poll = setInterval(() => this.refreshPVWState().catch(() => {}), this.config.pollInterval)
    }
  }
  stopPolling() {
    if (this._poll) clearInterval(this._poll)
    this._poll = undefined
  }

  // ---------------------- Data refresh ----------------------
  async fullRefresh() {
    await this.refreshScreens()
    await this.refreshInputs()
    if (!this.state.selectedScreenId && this.state.screens[0]) {
      this.state.selectedScreenId = this.state.screens[0].id
    }
    await this.refreshPVWState()
    this.updateDynamicStuff()
  }

  async refreshScreens() {
    // TODO: Gerçek API (Adım 2)
    this.state.screens = [{ id: 'screen-1', name: 'Screen 1' }]
  }

  async refreshInputs() {
    // TODO: Gerçek API (Adım 2)
    this.state.inputs = [
      { id: 'in-1', name: 'Input 1 (HDMI 2.0)' },
      { id: 'in-2', name: 'Input 2 (HDMI 2.0)' },
      { id: 'in-3', name: 'Input 3 (HDMI 2.0)' },
    ]
  }

  async refreshPVWState() {
    if (!this.state.selectedScreenId) return
    // TODO: Gerçek API (Adım 2)
    this.state.pvwLayersByScreen.set(this.state.selectedScreenId, [
      { id: 'L1-guid', name: 'Layer 1', index: 1 },
      { id: 'L2-guid', name: 'Layer 2', index: 2 },
    ])
    this.updateDynamicStuff()
  }

  updateDynamicStuff() {
    const screen = this.getSelectedScreen()
    const pvwLayers = this.getPVWLayers()
    this.setVariableValues({
      selected_screen: screen?.name || '—',
      pvw_layers_count: pvwLayers.length,
    })
    this.checkFeedbacks()
  }

  // ---------------------- Helpers ----------------------
  getSelectedScreen() {
    return this.state.screens.find((s) => s.id === this.state.selectedScreenId)
  }
  getScreens() {
    return this.state.screens
  }
  getInputs() {
    return this.state.inputs
  }
  getPVWLayers() {
    return this.state.pvwLayersByScreen.get(this.state.selectedScreenId) || []
  }

  async selectScreen(screenId) {
    this.state.selectedScreenId = screenId
    await this.refreshPVWState()
    this.updateDynamicStuff()
  }

  async routeInputToPVWLayer(layerId, inputId) {
    // TODO: Gerçek komut (Adım 2)
    this.log('info', `Route INPUT ${inputId} → PVW ${layerId} (screen=${this.state.selectedScreenId})`)
    await this.refreshPVWState()
  }
}

export default P20PVWInstance
