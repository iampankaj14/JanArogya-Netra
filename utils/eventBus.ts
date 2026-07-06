type EventListener = (data: any) => void;

class EventBus {
  private channel: BroadcastChannel | null = null;
  private listeners: EventListener[] = [];

  constructor(channelName: string) {
    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      this.channel = new BroadcastChannel(channelName);
      this.channel.onmessage = (event) => {
        this.listeners.forEach((listener) => listener(event.data));
      };
    }
  }

  emit(data: any) {
    if (this.channel) {
      this.channel.postMessage(data);
    }
    // Emit locally as well for same-window scenarios
    this.listeners.forEach((listener) => listener(data));
  }

  subscribe(listener: EventListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
}

export const alertEventBus = new EventBus('jan-arogya-alerts');
