/**
 * Google Meet Calendar API Integration
 * Handles Google Calendar API calls and Google Meet link generation
 */

// Google API Configuration
const GOOGLE_API_KEY = 'AIzaSyAinW7lb_M2PFZL1LCVxAtCaJtrPzf6YLo';
const GOOGLE_CLIENT_ID = 'your-client-id'; // You'll need to get this from Google Console
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

export interface GoogleMeetEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  conferenceData?: {
    createRequest: {
      requestId: string;
      conferenceSolutionKey: {
        type: string;
      };
    };
  };
}

export interface MeetingDetails {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendees?: string[];
  timeZone?: string;
}

/**
 * Initialize Google API
 */
export const initializeGoogleAPI = async (): Promise<boolean> => {
  try {
    // Load Google API script if not already loaded
    if (!window.gapi) {
      await loadGoogleAPIScript();
    }

    await new Promise((resolve) => {
      window.gapi.load('client:auth2', resolve);
    });

    await window.gapi.client.init({
      apiKey: GOOGLE_API_KEY,
      clientId: GOOGLE_CLIENT_ID,
      discoveryDocs: [DISCOVERY_DOC],
      scope: SCOPES
    });

    return true;
  } catch (error) {
    console.error('Error initializing Google API:', error);
    return false;
  }
};

/**
 * Load Google API script dynamically
 */
const loadGoogleAPIScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.getElementById('google-api-script')) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-api-script';
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google API script'));
    document.head.appendChild(script);
  });
};

/**
 * Sign in to Google
 */
export const signInToGoogle = async (): Promise<boolean> => {
  try {
    const authInstance = window.gapi.auth2.getAuthInstance();
    if (!authInstance.isSignedIn.get()) {
      await authInstance.signIn();
    }
    return true;
  } catch (error) {
    console.error('Error signing in to Google:', error);
    return false;
  }
};

/**
 * Create a Google Meet meeting
 */
export const createGoogleMeetMeeting = async (meetingDetails: MeetingDetails): Promise<{
  success: boolean;
  meetLink?: string;
  eventId?: string;
  error?: string;
}> => {
  try {
    // Ensure user is signed in
    const isSignedIn = await signInToGoogle();
    if (!isSignedIn) {
      return { success: false, error: 'Failed to sign in to Google' };
    }

    // Generate unique request ID for conference
    const requestId = `meet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create event object
    const event: GoogleMeetEvent = {
      summary: meetingDetails.title,
      description: meetingDetails.description || '',
      start: {
        dateTime: meetingDetails.startTime.toISOString(),
        timeZone: meetingDetails.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: meetingDetails.endTime.toISOString(),
        timeZone: meetingDetails.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      attendees: meetingDetails.attendees?.map(email => ({ email })) || [],
      conferenceData: {
        createRequest: {
          requestId,
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      }
    };

    // Create the event
    const response = await window.gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all'
    });

    const createdEvent = response.result;
    const meetLink = createdEvent.conferenceData?.entryPoints?.find(
      (entry: any) => entry.entryPointType === 'video'
    )?.uri;

    return {
      success: true,
      meetLink,
      eventId: createdEvent.id
    };
  } catch (error) {
    console.error('Error creating Google Meet meeting:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Generate a simple Google Meet link (alternative method)
 * This creates a direct Meet link without calendar integration
 */
export const generateSimpleMeetLink = (): string => {
  const meetingId = Math.random().toString(36).substring(2, 15);
  return `https://meet.google.com/${meetingId}`;
};

/**
 * Create a calendar event with Google Meet link
 */
export const createCalendarEventWithMeet = async (meetingDetails: MeetingDetails): Promise<{
  success: boolean;
  event?: any;
  meetLink?: string;
  error?: string;
}> => {
  try {
    // For demo purposes, we'll create a simple meet link
    // In production, you'd want to use the full Google Calendar API
    const meetLink = generateSimpleMeetLink();
    
    // Create a local event object that can be added to your calendar
    const event = {
      id: `meet-${Date.now()}`,
      title: meetingDetails.title,
      description: `${meetingDetails.description || ''}\n\nJoin Google Meet: ${meetLink}`,
      start: meetingDetails.startTime.toISOString(),
      end: meetingDetails.endTime.toISOString(),
      meetLink,
      type: 'meeting',
      attendees: meetingDetails.attendees || []
    };

    return {
      success: true,
      event,
      meetLink
    };
  } catch (error) {
    console.error('Error creating calendar event with Meet:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Open Google Meet in new tab
 */
export const openGoogleMeet = (meetLink: string): void => {
  window.open(meetLink, '_blank', 'noopener,noreferrer');
};

/**
 * Copy Meet link to clipboard
 */
export const copyMeetLinkToClipboard = async (meetLink: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(meetLink);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

// Type declarations for Google API
declare global {
  interface Window {
    gapi: any;
  }
}