/* eslint-disable no-catch-shadow */
/* eslint-disable @typescript-eslint/no-shadow */
import type { OpenAI } from 'openai';
import EventEmitter from 'events';
import Daily, {
  DailyCall,
  DailyEvent,
  DailyEventObject,
  DailyEventObjectAppMessage,
  DailyEventObjectAvailableDevicesUpdated,
  DailyEventObjectTrack,
  DailyTrackState,
  MediaDeviceInfo,
} from '@daily-co/react-native-daily-js';

import { Call, CreateAssistantDTO } from './api';
import { apiClient } from './apiClient';

export interface AddMessageMessage {
  type: 'add-message';
  message: OpenAI.ChatCompletionMessageParam;
}

export interface ControlMessages {
  type: 'control';
  control: 'mute-assistant' | 'unmute-assistant';
}

type VapiClientToServerMessage = AddMessageMessage | ControlMessages;

type VapiEventNames = 'call-end' | 'call-start' | 'message' | 'error';

type VapiEventListeners = {
  'call-end': () => void;
  'call-start': () => void;
  playable: (track: DailyTrackState) => void;
  message: (message: any) => void;
  error: (error: any) => void;
};

class VapiEventEmitter extends EventEmitter {
  on<E extends VapiEventNames>(event: E, listener: VapiEventListeners[E]): this {
    super.on(event, listener);
    return this;
  }
  once<E extends VapiEventNames>(event: E, listener: VapiEventListeners[E]): this {
    super.once(event, listener);
    return this;
  }
  emit<E extends VapiEventNames>(event: E, ...args: Parameters<VapiEventListeners[E]>): boolean {
    return super.emit(event, ...args);
  }
  removeListener<E extends VapiEventNames>(event: E, listener: VapiEventListeners[E]): this {
    super.removeListener(event, listener);
    return this;
  }
  removeAllListeners(event?: VapiEventNames): this {
    super.removeAllListeners(event);
    return this;
  }
}

export default class Vapi extends VapiEventEmitter {
  private started: boolean = false;
  private call: DailyCall | null = null;
  private callUrl: string | null = null;
  private speakingTimeout: NodeJS.Timeout | null = null;
  private averageSpeechLevel: number = 0;

  private cameraDevicesOpen: boolean = false;
  private cameraDeviceValue: string | null = null;
  private cameraDeviceItems: any[] = [];
  private audioDevicesOpen: boolean = false;
  private audioDeviceValue: string | null = null;
  private audioDevicesItems: any[] = [];

  constructor(apiToken: string, apiBaseUrl?: string) {
    super();
    apiClient.baseUrl = apiBaseUrl ?? 'https://api.vapi.ai';
    apiClient.setSecurityData(apiToken);
  }

  private async cleanup() {
    this.started = false;
    await this.call?.destroy();
    this.call = null;
    this.emit('call-end');
  }

  private onAppMessage(e?: DailyEventObjectAppMessage) {
    if (!e) {
      return;
    }
    try {
      if (e.data === 'listening') {
        return this.emit('call-start');
      } else {
        try {
          const parsedMessage = JSON.parse(e.data);
          this.emit('message', parsedMessage);
        } catch (parseError) {
          console.log('Error parsing message data: ', parseError);
        }
      }
    } catch (e: any) {
      console.error(e);
    }
  }

  private onJoinedMeeting() {
    this.call?.enumerateDevices().then(({ devices }: any) => {
      console.log('devices', devices);
      this.updateAvailableDevices(devices);
    });
    this.emit('call-start');
  }

  private onTrackStarted(e: DailyEventObjectTrack | undefined) {
    if (
      !e ||
      !e.participant ||
      e.participant?.local ||
      e.track.kind !== 'audio' ||
      e?.participant?.user_name !== 'Vapi Speaker'
    ) {
      console.log('not vapi speaker');
      return;
    }
    console.log('playable');
    this.call?.sendAppMessage('playable');
  }

  private endMeeting() {
    this.emit('call-end');
    this.cleanup();
  }

  private async refreshSelectedDevice() {
    const devicesInUse = await this.call?.getInputDevices();

    console.log('refreshSelectedDevice, devicesInUse', devicesInUse);

    const cameraDevice = devicesInUse?.camera as MediaDeviceInfo;
    if (devicesInUse && cameraDevice?.deviceId) {
      try {
        this.cameraDeviceValue = cameraDevice.deviceId;
        this.call?.setCamera(this.cameraDeviceValue);
      } catch (error) {
        console.error('error setting camera device', error);
      }
    }

    const speakerDevice = devicesInUse?.speaker as MediaDeviceInfo;
    if (devicesInUse && speakerDevice?.deviceId) {
      try {
        this.audioDeviceValue = speakerDevice.deviceId;
        await this.call?.setAudioDevice(this.audioDeviceValue);
      } catch (error) {
        console.error('error setting audio device', error);
      }
    }
  }

  private updateAvailableDevices(devices: MediaDeviceInfo[] | undefined) {
    console.log('updateAvailableDevices', devices);
    const inputDevices = devices
      ?.filter((device) => device.kind === 'videoinput')
      .map((device) => {
        return {
          value: device.deviceId,
          label: device.label,
          originalValue: device,
        };
      });
    this.cameraDeviceItems = inputDevices || [];

    const outputDevices = devices
      ?.filter((device) => device.kind === 'audio')
      .map((device) => {
        return {
          value: device.deviceId,
          label: device.label,
          originalValue: device,
        };
      });
    this.audioDevicesItems = outputDevices || [];
    this.refreshSelectedDevice();
  }

  private initEventListeners() {
    if (!this.call) return;

    this.call.on('available-devices-updated', (e) => {
      this.updateAvailableDevices(e?.availableDevices);
    });
    this.call.on('app-message', (e) => {
      this.onAppMessage(e);
    });
    this.call.on('track-started', (e) => {
      this.onTrackStarted(e);
    });
    this.call.on('participant-left', (e) => {
      this.endMeeting();
    });
    this.call.on('left-meeting', (e) => {
      this.endMeeting();
    });

    const events: DailyEvent[] = ['joined-meeting', 'left-meeting', 'error'];
    const handleNewMeetingState = (_event?: DailyEventObject) => {
      switch (this.call?.meetingState()) {
        case 'joined-meeting':
          return this.onJoinedMeeting();
        case 'left-meeting':
          return this.endMeeting();
        case 'error':
          console.log('ignore error');
          break;
      }
    };
    handleNewMeetingState();
    for (const event of events) {
      this.call.on(event, handleNewMeetingState);
    }
  }

  async start(assistant: CreateAssistantDTO | string): Promise<Call | null> {
    if (this.started) {
      return null;
    }
    this.started = true;

    const webCall = (
      await apiClient.call.callControllerCreateWebCall({
        assistant: typeof assistant === 'string' ? undefined : assistant,
        assistantId: typeof assistant === 'string' ? assistant : undefined,
      })
    ).data;

    // const webCall = await apiClient.call.callControllerCreateWebCall({
    //   assistant: typeof assistant === 'string' ? undefined : assistant,
    //   assistantId: typeof assistant === 'string' ? assistant : undefined,
    // });

    // const roomUrl = webCall.url;
    const roomUrl = webCall.webCallUrl;

    console.log('roomUrl: ', roomUrl);

    if (!roomUrl) {
      throw new Error('webCallUrl is not available');
    }

    try {
      this.call = Daily.createCallObject({
        audioSource: true,
        videoSource: false,
      });
      this.initEventListeners();

      this.call?.join({
        url: roomUrl,
      });

      return null;
    } catch (e) {
      console.error(e);
      this.emit('error', e);
      this.cleanup();
      return null;
    }
  }

  stop(): void {
    this.cleanup();
  }
  send(message: VapiClientToServerMessage): void {
    this.call?.sendAppMessage(JSON.stringify(message));
  }

  setMuted(mute: boolean) {
    try {
      if (!this.call) {
        throw new Error('Call object is not available.');
      }
      this.call.setLocalAudio(!mute);
    } catch (error) {
      throw error;
    }
  }

  isMuted() {
    try {
      if (!this.call) {
        return false;
      }
      return this.call.localAudio() === false;
    } catch (error) {
      throw error;
    }
  }
}
