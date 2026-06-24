import crypto from 'crypto';

/**
 * Sends a server-side event to Meta Conversion API
 */
export const sendMetaCapiEvent = async (
  eventName: string,
  eventData: any,
  pixelId: string,
  accessToken: string,
  reqIp?: string,
  userAgent?: string,
  fbp?: string,
  fbc?: string
) => {
  if (!pixelId || !accessToken) return;

  try {
    const url = `https://graph.facebook.com/v19.0/${pixelId}/events`;
    
    // Hash user data fields as required by Meta (SHA256)
    const hashData = (data: string) => {
      if (!data) return undefined;
      return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
    };

    const userData = {
      client_ip_address: reqIp || '0.0.0.0',
      client_user_agent: userAgent || 'Server/1.0',
      ...(eventData.email && { em: [hashData(eventData.email)] }),
      ...(eventData.phone && { ph: [hashData(eventData.phone.replace(/[^0-9]/g, ''))] }),
      ...(fbp && { fbp }),
      ...(fbc && { fbc })
    };

    const customData = {
      value: eventData.value,
      currency: eventData.currency || 'BDT',
      content_ids: eventData.content_ids || [],
      content_type: 'product',
      contents: eventData.contents || []
    };

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_id: eventData.eventId || crypto.randomUUID(), // For deduplication
          user_data: userData,
          custom_data: customData,
        }
      ]
    };

    const response = await fetch(`${url}?access_token=${accessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Meta CAPI Error:', errorText);
    }
  } catch (error) {
    console.error('Failed to send Meta CAPI event:', error);
  }
};
