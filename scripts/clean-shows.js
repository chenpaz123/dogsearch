const { db } = require("./src/firebase/firebase");
const { createLogger } = require("./src/utils/logger");

const logger = createLogger("script:clean-shows");

const cleanShows = async () => {
  console.log("Starting cleanup of corrupted shows...");
  
  try {
    const snapshot = await db.collection("shows").get();
    
    if (snapshot.empty) {
      console.log("No shows found in database.");
      return;
    }

    const batch = db.batch();
    let deleteCount = 0;

    snapshot.forEach((doc) => {
      const id = doc.id;
      const data = doc.data();
      
      // Check for "undefined" in the document ID
      if (id.toLowerCase().includes("undefined")) {
        console.log(`Marking corrupted show for deletion: ${id}`);
        batch.delete(doc.ref);
        deleteCount++;
      } 
      // Check for missing or undefined fields
      else if (!data.KenelClubName || !data.ShowDate || data.KenelClubName === "undefined") {
        console.log(`Marking invalid show for deletion: ${id} (Name: ${data.KenelClubName}, Date: ${data.ShowDate})`);
        batch.delete(doc.ref);
        deleteCount++;
      }
    });

    if (deleteCount > 0) {
      await batch.commit();
      console.log(`Successfully deleted ${deleteCount} corrupted shows.`);
    } else {
      console.log("No corrupted shows found.");
    }

  } catch (error) {
    console.error("Cleanup failed:", error);
  }
};

cleanShows();
