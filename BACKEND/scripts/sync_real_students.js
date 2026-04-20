async function invokeSync() {
    console.log("🚀 Starting local database synchronization...");

    try {
        const response = await fetch("http://localhost:3000/admin/sync-database", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();

        if (response.ok) {
            console.log("✅ Sync Complete:");
            console.log(data.message);
        } else {
            console.error("❌ Sync Failed:");
            console.error(data.message);
        }
    } catch (error) {
        console.error("❌ Request Failed. Is the backend server running?", error.message);
    }
}

invokeSync();
