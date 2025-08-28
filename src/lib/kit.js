/**
 * Kit (formerly ConvertKit) API helper for email subscriptions
 */

/**
 * Subscribe a user to a Kit form with custom fields
 * @param {Object} params - Subscription parameters
 * @param {string} params.email - User's email address
 * @param {string} params.songSlug - Slug of the current song
 * @param {string} params.songTitle - Title of the current song  
 * @param {string} params.songFormat - Requested download format (mp3/wav)
 * @returns {Promise<{ok: boolean, error?: string}>} Subscription result
 */
export async function subscribeToForm({ email, songSlug, songTitle, songFormat }) {
  const apiKey = process.env.REACT_APP_KIT_PUBLIC_API_KEY;
  const formId = process.env.REACT_APP_KIT_FORM_ID;

  if (!apiKey || !formId) {
    return { 
      ok: false, 
      error: 'Kit API configuration missing. Please check your environment variables.' 
    };
  }

  try {
    const res = await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        email,
        fields: { 
          song_slug: songSlug, 
          song_title: songTitle, 
          song_format: songFormat 
        }
      })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { 
        ok: false, 
        error: data.message || `Request failed (${res.status})` 
      };
    }

    return { ok: true };
  } catch (e) {
    return { 
      ok: false, 
      error: e.message || 'Network error' 
    };
  }
}