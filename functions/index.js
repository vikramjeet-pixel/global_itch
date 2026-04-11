const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const { initializeApp } = require("firebase-admin/app");
const { VertexAI } = require("@google-cloud/vertexai");

// Automatically inherits Service Account credentials from Google Cloud
initializeApp();
const db = getFirestore();

const PROJECT_ID = process.env.GCLOUD_PROJECT || "your-firebase-project-id"; 
const LOCATION = "us-central1"; 

// Using a 540 second timeout to ensure massive LLM batch tasks don't crash
exports.vertexItchJudge = onRequest({ timeoutSeconds: 540, memory: "512MiB" }, async (req, res) => {
  try {
    const itchesSnap = await db.collection("itches").get();
    const statsSnap = await db.collection("itch_stats").get();

    // Map stats by ID for O(1) lookup
    const statsMap = {};
    statsSnap.forEach(doc => {
      statsMap[doc.id] = doc.data().click_count || 0;
    });

    const vertex_ai = new VertexAI({ project: PROJECT_ID, location: LOCATION });
    const generativeModel = vertex_ai.preview.getGenerativeModel({
      model: "gemini-1.5-flash-001",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const batch = db.batch();
    
    // BATCH PROMPTING: Send 25 anomalies per prompt sequence
    const chunks = [];
    const chunkSize = 25;
    for (let i = 0; i < itchesSnap.docs.length; i += chunkSize) {
      chunks.push(itchesSnap.docs.slice(i, i + chunkSize));
    }

    let processedCount = 0;

    for (const chunk of chunks) {
      // Structure the input array for Gemini
      const batchPayload = chunk.map(doc => {
        const itch = doc.data();
        return {
          id: doc.id,
          title: itch.title,
          clicks: statsMap[doc.id] || 0
        };
      });

      const prompt = `As a Tier-1 VC Analyst evaluating global market anomalies, critically evaluate this incoming array of ${batchPayload.length} systemic problems.
For EACH item, consider its core premise and its recent spike in user interest (clicks). Given the 2026 economic climate, rate its "Founder Urgency" from 1-100 and provide a powerful 1-sentence VC logic for that specific rating.

Here is the data payload to analyze:
${JSON.stringify(batchPayload, null, 2)}

You MUST strictly output valid JSON as a flat array of objects matching this exact signature schema:
[
  {
    "id": "exact_item_id_from_payload",
    "new_score": 85,
    "verdict": "1-sentence logic explaining why this is a massive scaling opportunity."
  }
]`;
        
      try {
        const vertexReq = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };
        const result = await generativeModel.generateContent(vertexReq);
        let responseText = result.response.candidates[0].content.parts[0].text;
        
        let parsedArray;
        try {
           parsedArray = JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, '').trim());
        } catch(e) {
           console.warn(`[WARN] Failed strictly parsing JSON for batch`);
        }

        // Loop over the LLM output array and stage the DB updates
        if (Array.isArray(parsedArray)) {
          parsedArray.forEach(evalResult => {
            if (evalResult && evalResult.id && typeof evalResult.new_score === 'number' && evalResult.verdict) {
              const docRef = db.collection("itches").doc(evalResult.id);
              batch.update(docRef, {
                itchScore: evalResult.new_score,
                judge_notes: evalResult.verdict,
                vertex_evaluated_at: new Date()
              });
              processedCount++;
            }
          });
        }
      } catch (vertexErr) {
        console.error(`Vertex AI batch computation failed:`, vertexErr.message);
      }
      
      // Cool down rate-limits (Wait 2 seconds before throwing the next 25 batch onto the GPU)
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Execute the final massive block commit (Updates all 350 items natively in a single backend ping)
    await batch.commit();

    res.status(200).send({ 
      success: true, 
      message: `Successfully evaluated and batch-updated ${processedCount} itches utilizing Vertex Batch LLM Architectures.` 
    });
    
  } catch (error) {
    console.error("Critical Runtime Error in vertexItchJudge", error);
    res.status(500).send({ error: error.message });
  }
});
