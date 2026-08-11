const { db } = require("./src/firebase/firebase");
const { createLogger } = require("./src/utils/logger");

const logger = createLogger("script:fix-shows-data");

const fixShowsData = async () => {
  console.log("Starting fix of show data...");
  
  try {
    const snapshot = await db.collection("shows").get();
    
    if (snapshot.empty) {
      console.log("No shows found.");
      return;
    }

    const batch = db.batch();
    let updateCount = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      const id = doc.id;
      
      // Parse ID "Name - Date"
      const parts = id.split(" - ");
      if (parts.length < 2) {
        console.log(`Skipping malformed ID: ${id}`);
        return;
      }

      const nameFromId = parts[0];
      const dateFromId = parts[1];

      let needsUpdate = false;
      const updateData = {};

      if (!data.KenelClubName) {
        updateData.KenelClubName = nameFromId;
        needsUpdate = true;
      }

      if (!data.ShowDate) {
        updateData.ShowDate = dateFromId;
        needsUpdate = true;
      }

      if (needsUpdate) {
        console.log(`Fixing show: ${id}`);
        batch.set(doc.ref, updateData, { merge: true });
        updateCount++;
      }
    });

    if (updateCount > 0) {
      await batch.commit();
      console.log(`Successfully updated ${updateCount} shows.`);
    } else {
      console.log("All shows are already correct.");
    }

  } catch (error) {
    console.error("Fix failed:", error);
  }
};

fixShowsData();
