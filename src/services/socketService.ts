import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL);
      console.log('Tactical link connected');
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Tactical link severed');
    }
  }

  joinRide(rideId: string, user: any) {
    if (!this.socket) this.connect();
    this.socket?.emit('join-ride', { rideId, user });
  }

  leaveRide(rideId: string, userId: string) {
    this.socket?.emit('leave-ride', { rideId, userId });
  }

  updateLocation(rideId: string, userId: string, name: string, location: { lat: number, lng: number, speed?: number, heading?: number }) {
    this.socket?.emit('update-location', { rideId, userId, name, location });
  }

  onLocationUpdated(callback: (data: any) => void) {
    this.socket?.on('location-updated', callback);
  }

  onRiderJoined(callback: (data: any) => void) {
    this.socket?.on('rider-joined', callback);
  }

  onRiderLeft(callback: (data: any) => void) {
    this.socket?.on('rider-left', callback);
  }
  
  onNewAlert(callback: (alert: any) => void) {
    this.socket?.on('new-alert', callback);
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
