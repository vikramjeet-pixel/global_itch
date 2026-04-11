import { doc, setDoc, increment } from 'firebase/firestore';
import { logEvent } from 'firebase/analytics';
import { db, analytics } from './firebase';

export async function logItchInteraction(
  itchId: string, 
  actionType: 'ACCORDION_OPEN' | 'DEEP_DIVE_CLICK'
) {
  if (!itchId) return;

  // 1. Log Analytics Event
  if (analytics) {
    try {
      logEvent(analytics, 'itch_interaction', {
        itch_id: itchId,
        action_type: actionType,
      });
    } catch (err) {
      console.warn("Analytics blocked or unavailable", err);
    }
  }

  // 2. Increment Firestore click_count
  if (db) {
    try {
      const statRef = doc(db, 'itch_stats', itchId);
      // Use setDoc with merge: true so it creates the document if it doesn't exist
      await setDoc(statRef, {
        click_count: increment(1),
        last_action: actionType,
        updated_at: new Date()
      }, { merge: true });
    } catch (error) {
      console.error("Error logging interaction to Firestore:", error);
    }
  }
}
