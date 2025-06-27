import io, { Socket } from 'socket.io-client'
import type { EmailData } from './ApiService'

export interface SocketCallbacks {
  onConnect?: () => void
  onDisconnect?: (reason: string) => void
  onConnectError?: (error: any) => void
  onNewEmail?: (emailData: EmailData) => void
}

class SocketService {
  private socket: Socket | null = null
  private callbacks: SocketCallbacks = {}
  private currentEmailAddress: string = ''

  connect(emailAddress: string, callbacks: SocketCallbacks = {}) {
    // Disconnect existing socket if any
    this.disconnect()
    
    this.currentEmailAddress = emailAddress
    this.callbacks = callbacks

    this.socket = io('http://localhost:3000', {
      transports: ['polling', 'websocket'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: true
    })

    this.setupEventListeners()
    this.socket.emit('join', emailAddress)
  }

  private setupEventListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      this.callbacks.onConnect?.()
    })

    this.socket.on('disconnect', (reason: string) => {
      this.callbacks.onDisconnect?.(reason)
    })

    this.socket.on('connect_error', (error: any) => {
      this.callbacks.onConnectError?.(error)
    })

    this.socket.on('new-email', (emailData: EmailData) => {
      this.callbacks.onNewEmail?.(emailData)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.off('new-email')
      this.socket.off('connect')
      this.socket.off('disconnect')
      this.socket.off('connect_error')
      this.socket.disconnect()
      this.socket = null
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }

  getCurrentEmailAddress(): string {
    return this.currentEmailAddress
  }
}

// Export a singleton instance
export const socketService = new SocketService()
export default SocketService 